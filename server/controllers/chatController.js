import Chat from "../models/Chat.js";
import { mmToMeter } from "../services/unitConverter.js";
import { getMaterialProperties } from "../services/materialEngine.js";
import { forgingSimulation } from "../services/forgingEngine.js";
import { costEstimation } from "../services/costEngine.js";
import { safetyCheck } from "../services/safetyEngine.js";
import {
  compareMaterials,
  compareMaterialsLathe,
} from "../services/optimizationEngine.js";
import {
  generateAIResponse,
  generateChatResponse,
  extractDimensionsFromImage,
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
      inputs = {},
      image,
    } = req.body;

    // ── 🔀 PURE CHAT MODE ──────────────────────────────────────────────────
    if (!operationType) {
      const existingChat = await Chat.findOne({ sessionId });
      const history = existingChat?.messages || [];

      const aiReply = await generateChatResponse(
        userPrompt || "Hello! How can I help you with mechanical engineering?",
        history,
      );

      await Chat.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: "user", content: userPrompt },
              { role: "assistant", content: aiReply },
            ],
          },
        },
        { new: true, upsert: true },
      );

      return res.json({ status: "chat", aiExplanation: aiReply });
    }

    // ── 1️⃣ IMAGE DIMENSION EXTRACTION ───────────────────────────────────────
    let imageExtractedValues = {};
    if (image) {
      imageExtractedValues = await extractDimensionsFromImage(
        image,
        operationType,
        subOperation,
      );
    }

    // Merge: imageExtracted as base, user inputs override
    const mergedInputs = {
      ...imageExtractedValues,
      ...Object.fromEntries(
        Object.entries(inputs).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      ),
    };

    // ── 2️⃣ FETCH MATERIAL PROPERTIES ───────────────────────────────────────
    const materialName = mergedInputs.material || "Steel";
    const materialProps = await getMaterialProperties(
      materialName,
      mergedInputs.temperature || 25,
    );

    const warnings = [];

    if (
      operationType === "Forging" &&
      mergedInputs.temperature &&
      materialProps.recommendedForgingTemp &&
      (mergedInputs.temperature < materialProps.recommendedForgingTemp.min ||
        mergedInputs.temperature > materialProps.recommendedForgingTemp.max)
    ) {
      warnings.push("Temperature outside recommended forging range.");
    }

    // ── 3️⃣ RUN SIMULATION ──────────────────────────────────────────────────
    let simulation = {};
    if (operationType === "Forging") {
      const diameter_m = mmToMeter(mergedInputs.diameter || 50);
      const length_m = mmToMeter(mergedInputs.length || 100);
      simulation = forgingSimulation({ diameter_m, length_m, materialProps });
    } else if (operationType === "Lathe") {
      simulation = latheSimulation({
        cuttingSpeed: mergedInputs.cuttingSpeed || 80,
        feed: mergedInputs.feed || 0.2,
        depthOfCut: mergedInputs.depthOfCut || 1,
        materialProps,
        workpieceDiameter: mergedInputs.workpieceDiameter || 50,
        length: mergedInputs.length || 100,
        passCount: mergedInputs.passCount || 1,
        taperAngle: mergedInputs.taperAngle || 0,
        threadPitch: mergedInputs.threadPitch || 1,
        drillDiameter: mergedInputs.drillDiameter || 20,
        holeDepth: mergedInputs.holeDepth || mergedInputs.length || 50,
        subOperation,
      });
    }

    // ── 4️⃣ COST CALCULATION ────────────────────────────────────────────────
    const weight = simulation.weight || 0;
    const cost = costEstimation({
      weight,
      materialCostPerKg: materialProps.costPerKg,
      operationType,
      time: simulation.machiningTime || simulation.forgingCycleTime || 0,
    });

    // ── 5️⃣ SAFETY CHECK ────────────────────────────────────────────────────
    const safetyWarnings = safetyCheck({
      force: simulation.force || simulation.cuttingForce,
      temperature: mergedInputs.temperature || 25,
      material: materialProps,
    });
    warnings.push(...safetyWarnings);

    // ── 6️⃣ MACHINE INTELLIGENCE ─────────────────────────────────────────────
    const machineData = machineRecommendation(
      simulation.force || simulation.cuttingForce,
    );

    // ── 7️⃣ MATERIAL COMPARISON (ALL operations) ─────────────────────────────
    let comparisons = [];
    if (operationType === "Forging") {
      comparisons = await compareMaterials({
        diameter_m: mmToMeter(mergedInputs.diameter || 50),
        length_m: mmToMeter(mergedInputs.length || 100),
        temperature: mergedInputs.temperature || 25,
        selectedMaterial: materialName,
      });
    } else if (operationType === "Lathe") {
      comparisons = await compareMaterialsLathe({
        cuttingSpeed: mergedInputs.cuttingSpeed || 80,
        feed: mergedInputs.feed || 0.2,
        depthOfCut: mergedInputs.depthOfCut || 1,
        workpieceDiameter: mergedInputs.workpieceDiameter || 50,
        length: mergedInputs.length || 100,
        passCount: mergedInputs.passCount || 1,
        taperAngle: mergedInputs.taperAngle || 0,
        threadPitch: mergedInputs.threadPitch || 1,
        drillDiameter: mergedInputs.drillDiameter || 20,
        holeDepth: mergedInputs.holeDepth || mergedInputs.length || 50,
        subOperation,
      });
    }

    // ── 8️⃣ AI EXPLANATION ───────────────────────────────────────────────────
    const bestFitMaterial = comparisons.length > 0 ? comparisons[0] : null;
    const isAlreadyBestFit =
      bestFitMaterial && bestFitMaterial.material === materialName;

    const imageNote =
      Object.keys(imageExtractedValues).length > 0
        ? `\nImage Analysis: Detected values from uploaded image — ${JSON.stringify(imageExtractedValues)}. User inputs took priority where both were available.`
        : "";

    const aiMessages = [
      {
        role: "system",
        content:
          "You are Mechanical GPT, a friendly industrial mechanical expert. Explain technical results in a conversational yet professional manner. Talk directly to the user about what is shown in the result panel. Highlight calculated time, costs, safety, RPM, feed rate, and any drilling-specific metrics. Be encouraging and insightful. Keep responses to 4-6 clear sentences. Use markdown formatting with bold for key numbers.",
      },
      {
        role: "user",
        content: `
Operation: ${operationType} — ${subOperation}
Selected Material: ${materialName}
${imageNote}

User Question: ${userPrompt || "Please explain the results."}

Numerical Results:
${JSON.stringify(simulation, null, 2)}

Cost Analysis:
${JSON.stringify(cost, null, 2)}

Material Comparison (top 3):
${JSON.stringify(comparisons.slice(0, 3), null, 2)}

Best Fit Material: ${bestFitMaterial ? bestFitMaterial.material : "N/A"}
${isAlreadyBestFit ? "Note: The user has already chosen the best-fit material — acknowledge this positively." : bestFitMaterial ? `Note: The best-fit material is ${bestFitMaterial.material}, not the user's choice of ${materialName}. Mention this recommendation diplomatically.` : ""}

Safety Warnings:
${warnings.length > 0 ? warnings.join(", ") : "None"}

Instructions:
1. Greet and briefly summarize the operation and key results.
2. Discuss machining/forging time, RPM, feed rate, and any drilling-specific metrics (thrust force, torque) where applicable.
3. Interpret costs and safety conversationally.
4. Comment on the material choice and best-fit recommendation from the comparison table.
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
            text: "This is the mechanical drawing or image the user uploaded. Reference it in your explanation if relevant.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      });
    }

    const aiExplanation = await generateAIResponse(aiMessages);

    // ── 9️⃣ BUILD RESPONSE + SAVE ─────────────────────────────────────────────
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

    const responsePayload = {
      status: "success",
      operationType,
      subOperation,
      imageExtractedValues:
        Object.keys(imageExtractedValues).length > 0
          ? imageExtractedValues
          : null,
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
            machiningTime: bestFitMaterial.machiningTime,
            yieldStrength: bestFitMaterial.yieldStrength,
            isAlreadyChosen: isAlreadyBestFit,
          }
        : null,
      machineRecommendation: machineData,
      materialComparison: comparisons,
      aiExplanation,
    };

    // Persist result so it is restored when the chat is reopened
    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: [
            { role: "user", content: userPrompt || "" },
            { role: "assistant", content: aiExplanation },
          ],
        },
        operationType,
        subOperation,
        lastResult: responsePayload,
      },
      { new: true, upsert: true },
    );

    res.json(responsePayload);
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      message: "Server error during calculation or AI generation.",
      details: error.message,
    });
  }
};
