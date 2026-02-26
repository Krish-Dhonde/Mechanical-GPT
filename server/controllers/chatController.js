import Chat from "../models/Chat.js";
import { mmToMeter } from "../services/unitConverter.js";
import { getMaterialProperties } from "../services/materialEngine.js";
import { forgingSimulation } from "../services/forgingEngine.js";
import { costEstimation } from "../services/costEngine.js";
import { safetyCheck } from "../services/safetyEngine.js";
import { compareMaterials } from "../services/optimizationEngine.js";
import {
  generateAIResponse,
  extractParameters,
} from "../services/aiService.js";
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

    // ── 1️⃣ Extract and Merge Inputs ──
    let extracted = {};
    if (image || userPrompt) {
      extracted = await extractParameters(
        image,
        userPrompt,
        operationType,
        subOperation,
      );
      Object.keys(extracted).forEach((k) => {
        // Only apply if user hasn't provided a valid numeric/string equivalent (ignore empty strings)
        if (inputs[k] === undefined || inputs[k] === null || inputs[k] === "") {
          inputs[k] = extracted[k];
        }
      });
    }

    // ── 2️⃣ Check if Simulation is Possible ──
    let canSimulate = false;
    if (operationType === "Forging") {
      if (inputs.diameter && inputs.length && inputs.material) {
        canSimulate = true;
      }
    } else if (operationType === "Lathe") {
      if (subOperation === "Drilling") {
        if (
          inputs.drillDiameter &&
          inputs.holeDepth &&
          inputs.material &&
          (inputs.feed || inputs.cuttingSpeed)
        ) {
          canSimulate = true;
        }
      } else {
        if (
          inputs.cuttingSpeed &&
          inputs.depthOfCut &&
          inputs.material &&
          (subOperation === "Thread Cutting" || inputs.feed)
        ) {
          canSimulate = true;
        }
      }
    }

    let materialProps = null;
    let warnings = [];
    let simulation = {};
    let cost = {};
    let safetyWarnings = [];
    let machineData = null;
    let comparisons = [];
    let bestFitMaterial = null;
    let isAlreadyBestFit = false;

    if (canSimulate) {
      // ── 3️⃣ Fetch Material Properties ──
      materialProps = await getMaterialProperties(
        inputs.material,
        inputs.temperature || 25,
      );

      if (
        operationType === "Forging" &&
        inputs.temperature &&
        (inputs.temperature < materialProps.recommendedForgingTemp.min ||
          inputs.temperature > materialProps.recommendedForgingTemp.max)
      ) {
        warnings.push("Temperature outside recommended forging range.");
      }

      // ── 4️⃣ Run Simulation ──
      if (operationType === "Forging") {
        const diameter_m = mmToMeter(inputs.diameter);
        const length_m = mmToMeter(inputs.length);
        simulation = forgingSimulation({ diameter_m, length_m, materialProps });
      } else if (operationType === "Lathe") {
        simulation = latheSimulation({
          cuttingSpeed: inputs.cuttingSpeed,
          feed: inputs.feed || inputs.threadPitch || 1,
          depthOfCut:
            subOperation === "Drilling"
              ? inputs.drillDiameter / 2
              : inputs.depthOfCut,
          materialProps,
          workpieceDiameter:
            inputs.workpieceDiameter ||
            (subOperation === "Drilling" ? inputs.drillDiameter : 50),
          length:
            subOperation === "Drilling"
              ? inputs.holeDepth
              : inputs.length || 100,
          passCount: inputs.passCount || 1,
          taperAngle: inputs.taperAngle || 0,
          threadPitch: inputs.threadPitch || 1,
          subOperation,
        });
      }

      // ── 5️⃣ Cost Calculation ──
      const weight = simulation.weight || 0;
      cost = costEstimation({
        weight,
        materialCostPerKg: materialProps.costPerKg,
        operationType,
        time: simulation.machiningTime || simulation.forgingCycleTime || 0,
      });

      // ── 6️⃣ Safety Check ──
      safetyWarnings = safetyCheck({
        force: simulation.force || simulation.cuttingForce,
        temperature: inputs.temperature || 25,
        material: materialProps,
      });
      warnings.push(...safetyWarnings);

      // ── 7️⃣ Machine Intelligence ──
      machineData = machineRecommendation(
        simulation.force || simulation.cuttingForce,
      );

      // ── 8️⃣ Material Comparison ──
      if (operationType === "Forging") {
        comparisons = await compareMaterials({
          diameter_m: mmToMeter(inputs.diameter),
          length_m: mmToMeter(inputs.length),
          temperature: inputs.temperature || 25,
          selectedMaterial: inputs.material,
        });
      }

      bestFitMaterial = comparisons.length > 0 ? comparisons[0] : null;
      isAlreadyBestFit =
        bestFitMaterial && bestFitMaterial.material === inputs.material;
    }

    // ── 9️⃣ AI Explanation ──
    const aiMessages = [
      {
        role: "system",
        content:
          "You are Mechanical GPT, a friendly industrial mechanical expert. Explain technical results in a conversational yet professional manner. Be encouraging and insightful. Keep conversational responses to 3-5 sentences.",
      },
      {
        role: "user",
        content: `
Operation: ${operationType} — ${subOperation}
Selected Material: ${inputs.material || "None"}

User prompt: ${userPrompt}

Extracted Data (from User/Image): ${Object.keys(extracted || {}).length > 0 ? JSON.stringify(extracted) : "None"}

${
  canSimulate
    ? `
Simulation was SUCCESSFUL:
Numerical Results: ${JSON.stringify(simulation)}
Cost Analysis: ${JSON.stringify(cost)}
Material Comparison: ${JSON.stringify(comparisons)}
Best Fit Material: ${bestFitMaterial ? bestFitMaterial.material : "N/A"}
Safety Warnings: ${warnings.length > 0 ? warnings.join(", ") : "None"}
`
    : "Simulation was SKIPPED due to missing required numeric inputs."
}

Instructions:
Respond using JSON format with "chatResponse" and "panelInsights". 
- chatResponse: Answer the user's question conversationally. Acknowledge what values were provided or extracted.
- panelInsights: Provide a short technical breakdown highlighting any calculations, safety warnings, and material insights, or explain what inputs are still missing to run the simulation.
`,
      },
    ];

    if (image) {
      aiMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image and note relevant dimensions for context.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      });
    }

    const aiData = await generateAIResponse(aiMessages);
    const chatResponse = aiData.chatResponse || "Analysis complete.";
    const panelInsights = aiData.panelInsights || "";

    // ── 🔟 Save Chat History ──
    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: [
            { role: "user", content: userPrompt },
            { role: "assistant", content: chatResponse },
          ],
        },
        operationType,
        subOperation,
      },
      { new: true, upsert: true },
    );

    // Build clean material data for display
    let selectedMaterialData = null;
    if (materialProps) {
      selectedMaterialData = {
        name: materialProps.name,
        density: materialProps.density,
        yieldStrength: materialProps.yieldStrength,
        ultimateStrength: materialProps.ultimateStrength,
        thermalConductivity: materialProps.thermalConductivity,
        costPerKg: materialProps.costPerKg,
        recommendedForgingTemp: materialProps.recommendedForgingTemp,
        maxSafeTemperature: materialProps.maxSafeTemperature,
      };
    }

    // ── 1️⃣1️⃣ Response ──
    res.json({
      status: "success",
      operationType,
      subOperation,
      inputs, // Include merged inputs so UI can update or show what was used
      selectedMaterialAnalysis: canSimulate
        ? {
            numericalResults: simulation,
            costAnalysis: cost,
            safetyWarnings: warnings,
          }
        : { numericalResults: {}, costAnalysis: {}, safetyWarnings: [] },

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
      aiExplanation: chatResponse, // Legacy mapping for the chat window
      aiInsights: panelInsights, // For the new insights section
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      message: "Server error during calculation or AI generation.",
      details: error.message,
    });
  }
};
