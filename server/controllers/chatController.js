import Chat from "../models/Chat.js";
import { mmToMeter } from "../services/unitConverter.js";
import { getMaterialProperties } from "../services/materialEngine.js";
import { forgingSimulation } from "../services/forgingEngine.js";
import { costEstimation } from "../services/costEngine.js";
import { safetyCheck } from "../services/safetyEngine.js";
import { compareMaterials } from "../services/optimizationEngine.js";
import { generateAIResponse, handlePureChat } from "../services/aiService.js";
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

// ── Helper: extract values from image via AI ──────────────────────────
async function extractImageValues(image, operationType, subOperation) {
  if (!image) return {};
  try {
    const imageMessages = [
      {
        role: "system",
        content: `You are an expert mechanical engineering drawing reader. Extract ONLY numerical values visible in the image. 
Return a strict JSON object with any of these keys (only include keys whose values are clearly visible):
- diameter (mm)
- length (mm)
- workpieceDiameter (mm)
- drillDiameter (mm)
- holeDepth (mm)
- cuttingSpeed (m/min)
- feed (mm/rev)
- drillFeed (mm/rev)
- depthOfCut (mm)
- temperature (°C)
- threadPitch (mm)
- taperAngle (degrees)
- passCount (integer)
Return ONLY the JSON object, no explanation, no markdown, no code fences.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract numerical machining parameters from this ${operationType} - ${subOperation} engineering drawing/image. Return only a JSON object.`,
          },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ];
    const rawJson = await generateAIResponse(imageMessages);
    // Strip any markdown fences if model adds them
    const cleaned = rawJson.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(cleaned);
    // Only keep numeric values
    const numericOnly = {};
    for (const [k, v] of Object.entries(extracted)) {
      const num = parseFloat(v);
      if (!isNaN(num)) numericOnly[k] = num;
    }
    return numericOnly;
  } catch (err) {
    console.warn("Image value extraction failed:", err.message);
    return {};
  }
}

export const handleChat = async (req, res) => {
  try {
    const {
      sessionId,
      operationType,
      subOperation,
      userPrompt,
      inputs: rawInputs,
      image,
    } = req.body;

    // ── 0️⃣ Require at minimum an operation type and a prompt ──
    if (!operationType || !subOperation) {
      return res.status(400).json({
        message: "Please select an operation and sub-operation first.",
      });
    }
    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    // ── 1️⃣ Extract values from image (LOW priority) ──
    let imageExtractedValues = {};
    if (image) {
      imageExtractedValues = await extractImageValues(
        image,
        operationType,
        subOperation,
      );
      console.log("Image extracted values:", imageExtractedValues);
    }

    // ── 2️⃣ Merge inputs: user inputs take PRIORITY over image values ──
    // User-provided inputs override image extracted values for same key
    const inputs = { ...imageExtractedValues, ...(rawInputs || {}) };

    // ── 3️⃣ Determine if we have enough data for simulation ──
    const hasSimulationData = (() => {
      if (operationType === "Forging") {
        return inputs.diameter && inputs.length && inputs.material;
      } else if (operationType === "Lathe") {
        if (subOperation === "Drilling") {
          return (
            inputs.material &&
            (inputs.drillDiameter || inputs.cuttingSpeed || inputs.holeDepth)
          );
        }
        return (
          inputs.material && (inputs.cuttingSpeed || inputs.workpieceDiameter)
        );
      }
      return false;
    })();

    // ── 4️⃣ If insufficient data, use pure AI chat ──
    if (!hasSimulationData) {
      const aiReply = await handlePureChat({
        sessionId,
        userPrompt: userPrompt.trim(),
        operationType,
        subOperation,
        imageContext: image
          ? {
              hasImage: true,
              extractedValues: imageExtractedValues,
              image,
            }
          : null,
      });

      await Chat.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: "user", content: userPrompt },
              { role: "assistant", content: aiReply },
            ],
          },
          operationType,
          subOperation,
        },
        { new: true, upsert: true },
      );

      return res.json({
        status: "chat_only",
        operationType,
        subOperation,
        aiExplanation: aiReply,
        selectedMaterialAnalysis: null,
        selectedMaterialData: null,
        bestFitMaterial: null,
        machineRecommendation: null,
        materialComparison: [],
      });
    }

    // ── 5️⃣ Fetch Material Properties ──
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

    // ── 6️⃣ Run Simulation ──
    let simulation = {};
    if (operationType === "Forging") {
      const diameter_m = mmToMeter(inputs.diameter);
      const length_m = mmToMeter(inputs.length);
      simulation = forgingSimulation({ diameter_m, length_m, materialProps });
    } else if (operationType === "Lathe") {
      simulation = latheSimulation({
        cuttingSpeed: inputs.cuttingSpeed || 25,
        feed: inputs.feed || inputs.threadPitch || 0.2,
        depthOfCut: inputs.depthOfCut || 1,
        materialProps,
        workpieceDiameter: inputs.workpieceDiameter || 50,
        length: inputs.length || 100,
        passCount: inputs.passCount || 1,
        taperAngle: inputs.taperAngle || 0,
        threadPitch: inputs.threadPitch || 1,
        subOperation,
        // Drilling-specific
        drillDiameter: inputs.drillDiameter || 10,
        holeDepth: inputs.holeDepth || 30,
        drillFeed: inputs.drillFeed || inputs.feed || 0.2,
      });
    }

    // ── 7️⃣ Cost Calculation ──
    const weight = simulation.weight || 0;
    const cost = costEstimation({
      weight,
      materialCostPerKg: materialProps.costPerKg,
      operationType,
      time:
        simulation.machiningTime ||
        simulation.drillingTime ||
        simulation.forgingCycleTime ||
        0,
    });

    // ── 8️⃣ Safety Check ──
    const safetyWarnings = safetyCheck({
      force: simulation.force || simulation.cuttingForce,
      temperature: inputs.temperature || 25,
      material: materialProps,
    });
    warnings.push(...safetyWarnings);

    // ── 9️⃣ Machine Intelligence ──
    const machineData = machineRecommendation(
      simulation.force || simulation.cuttingForce,
    );

    // ── 🔟 Material Comparison ──
    let comparisons = [];
    if (operationType === "Forging") {
      comparisons = await compareMaterials({
        diameter_m: mmToMeter(inputs.diameter),
        length_m: mmToMeter(inputs.length),
        temperature: inputs.temperature || 25,
        selectedMaterial: inputs.material,
      });
    }

    // ── 1️⃣1️⃣ AI Explanation (with image context) ──
    const bestFitMaterial = comparisons.length > 0 ? comparisons[0] : null;
    const isAlreadyBestFit =
      bestFitMaterial && bestFitMaterial.material === inputs.material;

    // Build AI system message
    const imageNotes =
      Object.keys(imageExtractedValues).length > 0
        ? `\nImage Analysis: I extracted these values from the uploaded image (low priority): ${JSON.stringify(imageExtractedValues)}. The user's manual inputs took precedence where both existed.`
        : "";

    const drillingExtras =
      subOperation === "Drilling"
        ? `\nDrilling Details:\n- Drill Diameter: ${inputs.drillDiameter || 10} mm\n- Hole Depth: ${inputs.holeDepth || 30} mm\n- Feed Rate: ${simulation.feedRate?.toFixed(2) || "—"} mm/min\n- Torque: ${simulation.torque?.toFixed(4) || "—"} Nm\n- Thrust Force: ${simulation.thrustForce?.toFixed(2) || "—"} N\n- Drilling Time: ${simulation.drillingTime?.toFixed(3) || "—"} min\n- MRR: ${simulation.mrr?.toFixed(2) || "—"} mm³/min`
        : `\nFeed Rate: ${simulation.feedRate?.toFixed(2) || "—"} mm/min`;

    const aiMessages = [
      {
        role: "system",
        content:
          "You are Mechanical GPT, a friendly industrial mechanical expert. Explain technical results in a conversational yet professional manner. Talk directly to the user about what is shown in the result panel. Highlight calculated time, costs, RPM, feed rate, and safety. Be encouraging and insightful. Keep responses to 4-6 clear sentences.",
      },
      {
        role: "user",
        content: `
Operation: ${operationType} — ${subOperation}
Selected Material: ${inputs.material}

User Question: ${userPrompt}

Numerical Results:
${JSON.stringify(simulation, null, 2)}${drillingExtras}

Cost Analysis:
${JSON.stringify(cost, null, 2)}

Material Comparison:
${JSON.stringify(comparisons, null, 2)}

Best Fit Material: ${bestFitMaterial ? bestFitMaterial.material : "N/A"}
${isAlreadyBestFit ? "Note: The user has already chosen the best-fit material — acknowledge this positively." : bestFitMaterial ? `Note: The best-fit material is ${bestFitMaterial.material}, not the user's choice of ${inputs.material}. Mention this recommendation diplomatically.` : ""}

Safety Warnings:
${warnings.length > 0 ? warnings.join(", ") : "None"}
${imageNotes}

Instructions:
1. Greet and briefly summarize the operation.
2. Highlight RPM, feed rate, and machining/drilling/forging time.
3. Interpret costs and safety conversationally.
4. Comment on the material choice and best-fit recommendation if applicable.
5. For drilling: explain torque, thrust force and their implications.
6. Suggest a best course of action.
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
            text: "This is the mechanical drawing/image the user uploaded. Acknowledge what you can see and confirm which values were extracted from it.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      });
    }

    const aiExplanation = await generateAIResponse(aiMessages);

    // ── Save Chat History ──
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

    // ── Response ──
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
      imageExtractedValues,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      message: "Server error during calculation or AI generation.",
      details: error.message,
    });
  }
};
