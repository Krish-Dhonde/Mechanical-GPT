import Chat from "../models/Chat.js";
import { mmToMeter } from "../services/unitConverter.js";
import { getMaterialProperties } from "../services/materialEngine.js";
import { forgingSimulation } from "../services/forgingEngine.js";
import { costEstimation } from "../services/costEngine.js";
import { safetyCheck } from "../services/safetyEngine.js";
import { compareMaterials } from "../services/optimizationEngine.js";
import { generateAIResponse } from "../services/aiService.js";
import { machineRecommendation } from "../services/machineEngine.js";
import { latheSimulation } from "../services/latheEngine.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find(
      {},
      {
        messages: { $slice: 1 },
        sessionId: 1,
        operationType: 1,
        subOperation: 1,
        updatedAt: 1,
      },
    ).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chats", error: error.message });
  }
};

export const getChatBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chat", error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Chat.findOneAndDelete({ sessionId });
    res.json({ message: "Chat deleted success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting chat", error: error.message });
  }
};

export const handleChat = async (req, res) => {
  try {
    const {
      sessionId,
      operationType,
      subOperation,
      userPrompt,
      inputs,
      image,
    } = req.body;

    // ── 1️⃣ Validate Inputs ──
    if (operationType === "Forging") {
      if (!inputs.diameter || !inputs.length || !inputs.material) {
        return res.status(400).json({
          message:
            "Missing required inputs for Forging: diameter, length, material.",
        });
      }
    } else if (operationType === "Lathe") {
      if (!inputs.cuttingSpeed || !inputs.depthOfCut || !inputs.material) {
        return res.status(400).json({
          message:
            "Missing required inputs for Lathe: cuttingSpeed, depthOfCut, material.",
        });
      }
      // Thread Cutting uses threadPitch as its feed rate
      if (subOperation !== "Thread Cutting" && !inputs.feed) {
        return res.status(400).json({
          message: "Missing feed rate for Lathe operation.",
        });
      }
    } else {
      return res.status(400).json({ message: "Operation type not supported." });
    }

    // ── 2️⃣ Fetch Material Properties ──
    const materialProps = await getMaterialProperties(
      inputs.material,
      inputs.temperature || 25,
    );

    const warnings = [];

    if (
      operationType === "Forging" &&
      inputs.temperature &&
      (inputs.temperature < materialProps.recommendedForgingTemp.min ||
        inputs.temperature > materialProps.recommendedForgingTemp.max)
    ) {
      warnings.push("Temperature outside recommended forging range.");
    }

    // ── 3️⃣ Run Simulation ──
    let simulation = {};
    if (operationType === "Forging") {
      const diameter_m = mmToMeter(inputs.diameter);
      const length_m = mmToMeter(inputs.length);
      simulation = forgingSimulation({ diameter_m, length_m, materialProps });
    } else if (operationType === "Lathe") {
      simulation = latheSimulation({
        cuttingSpeed: inputs.cuttingSpeed,
        feed: inputs.feed || inputs.threadPitch || 1,
        depthOfCut: inputs.depthOfCut,
        materialProps,
        workpieceDiameter: inputs.workpieceDiameter || 50,
        length: inputs.length || 100,
        passCount: inputs.passCount || 1,
        taperAngle: inputs.taperAngle || 0,
        threadPitch: inputs.threadPitch || 1,
        subOperation,
      });
    }

    // ── 4️⃣ Cost Calculation ──
    const weight = simulation.weight || 0;
    const cost = costEstimation({
      weight,
      materialCostPerKg: materialProps.costPerKg,
      operationType,
      time: simulation.machiningTime || simulation.forgingCycleTime || 0,
    });

    // ── 5️⃣ Safety Check ──
    const safetyWarnings = safetyCheck({
      force: simulation.force || simulation.cuttingForce,
      temperature: inputs.temperature || 25,
      material: materialProps,
    });
    warnings.push(...safetyWarnings);

    // ── 6️⃣ Machine Intelligence ──
    const machineData = machineRecommendation(
      simulation.force || simulation.cuttingForce,
    );

    // ── 7️⃣ Material Comparison ──
    let comparisons = [];
    if (operationType === "Forging") {
      comparisons = await compareMaterials({
        diameter_m: mmToMeter(inputs.diameter),
        length_m: mmToMeter(inputs.length),
        temperature: inputs.temperature || 25,
        selectedMaterial: inputs.material,
      });
    }
    // Lathe: no cross-material comparison (machining time is independent of material weight)

    // ── 8️⃣ AI Explanation ──
    const bestFitMaterial = comparisons.length > 0 ? comparisons[0] : null;
    const isAlreadyBestFit =
      bestFitMaterial && bestFitMaterial.material === inputs.material;

    const aiMessages = [
      {
        role: "system",
        content:
          "You are Mechanical GPT, a friendly industrial mechanical expert. Explain technical results in a conversational yet professional manner. Talk directly to the user about what is shown in the result panel. Highlight calculated time, costs, and safety. Be encouraging and insightful. Keep responses to 3-5 clear sentences.",
      },
      {
        role: "user",
        content: `
Operation: ${operationType} — ${subOperation}
Selected Material: ${inputs.material}

User Question: ${userPrompt}

Numerical Results:
${JSON.stringify(simulation, null, 2)}

Cost Analysis:
${JSON.stringify(cost, null, 2)}

Material Comparison:
${JSON.stringify(comparisons, null, 2)}

Best Fit Material: ${bestFitMaterial ? bestFitMaterial.material : "N/A"}
${isAlreadyBestFit ? "Note: The user has already chosen the best-fit material — acknowledge this positively." : bestFitMaterial ? `Note: The best-fit material is ${bestFitMaterial.material}, not the user's choice of ${inputs.material}. Mention this recommendation diplomatically.` : ""}

Safety Warnings:
${warnings.length > 0 ? warnings.join(", ") : "None"}

Instructions:
1. Greet and briefly summarize the operation.
2. Discuss machining/forging time and process impact.
3. Interpret costs and safety conversationally.
4. Comment on the material choice and best-fit recommendation.
5. Suggest a best course of action.
Use first person: "I've calculated...", "You should notice...".
`,
      },
    ];

    if (image) {
      aiMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this mechanical drawing/image and note any relevant dimensions.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      });
    }

    const aiExplanation = await generateAIResponse(aiMessages);

    // ── 9️⃣ Save Chat History ──
    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: [
            { role: "user", content: userPrompt },
            { role: "assistant", content: aiExplanation },
          ],
        },
        operationType,
        subOperation,
      },
      { new: true, upsert: true },
    );

    // Build clean material data for display
    const selectedMaterialData = {
      name: materialProps.name,
      density: materialProps.density,
      yieldStrength: materialProps.yieldStrength,
      ultimateStrength: materialProps.ultimateStrength,
      thermalConductivity: materialProps.thermalConductivity,
      costPerKg: materialProps.costPerKg,
      recommendedForgingTemp: materialProps.recommendedForgingTemp,
      maxSafeTemperature: materialProps.maxSafeTemperature,
    };

    // ── 🔟 Response ──
    res.json({
      status: "success",
      operationType,
      subOperation,

      selectedMaterialAnalysis: {
        numericalResults: simulation,
        costAnalysis: cost,
        safetyWarnings: warnings,
      },

      selectedMaterialData,
      bestFitMaterial: bestFitMaterial
        ? {
            material: bestFitMaterial.material,
            cost: bestFitMaterial.cost,
            force: bestFitMaterial.force,
            yieldStrength: bestFitMaterial.yieldStrength,
            isAlreadyChosen: isAlreadyBestFit,
          }
        : null,

      machineRecommendation: machineData,
      materialComparison: comparisons,
      aiExplanation,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      message: "Server error during calculation or AI generation.",
      details: error.message,
    });
  }
};
