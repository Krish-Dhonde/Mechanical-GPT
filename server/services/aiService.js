import OpenAI from "openai";

let openai;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Extract mechanical dimension values from an uploaded image using GPT-4o Vision.
 * Returns a flat object like { drillDiameter: 20, cuttingSpeed: 80, feed: 0.2, ... }
 * Only fields that are clearly visible in the image are returned.
 */
export const extractDimensionsFromImage = async (
  imageBase64,
  operationType,
  subOperation,
) => {
  try {
    const client = getOpenAI();
    const prompt = `You are an expert mechanical engineer reading a technical drawing or workpiece photo.
Extract ONLY the numeric machining values that are clearly visible or labeled in this image.
Operation context: ${operationType || "General"} — ${subOperation || "Unknown"}.

Return a JSON object with ONLY these fields if they are clearly visible (omit fields that are not shown):
- material (string, only if labeled)
- workpieceDiameter (number, mm)
- drillDiameter (number, mm)
- holeDepth (number, mm)
- length (number, mm)
- diameter (number, mm)
- cuttingSpeed (number, m/min)
- feed (number, mm/rev)
- depthOfCut (number, mm)
- threadPitch (number, mm)
- taperAngle (number, degrees)
- temperature (number, °C)
- passCount (number)

Respond with ONLY valid JSON, no explanation. Example: {"drillDiameter": 20, "holeDepth": 50}
If no numeric values are clearly visible, respond with: {}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 300, // extraction only needs key-value pairs
    });

    const raw = response.choices[0].message.content.trim();
    // Strip markdown fences if present
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Image dimension extraction error:", err.message || err);
    return {};
  }
};

/**
 * Pure AI chat — answer user questions without running a simulation.
 * Used when no operationType is selected or user asks a general question.
 */
export const generateChatResponse = async (
  userPrompt,
  conversationHistory = [],
) => {
  try {
    const client = getOpenAI();
    const messages = [
      {
        role: "system",
        content:
          "You are Mechanical GPT, a friendly and knowledgeable industrial mechanical engineering expert. " +
          "Answer the user's questions about mechanical engineering, machining, materials, manufacturing, and related topics. " +
          "Be concise yet thorough. Use bullet points or numbered lists where helpful. " +
          "If asked about something completely unrelated to mechanical engineering, politely redirect. " +
          "Format responses in clean markdown.",
      },
      ...conversationHistory.slice(-10), // last 10 messages for context
      { role: "user", content: userPrompt },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Chat response error:", err.message || err);
    return "I'm sorry, I couldn't process your question right now. Please try again.";
  }
};

/**
 * Extract structured data from the AI messages array for fallback generation.
 */
function generateFallbackResponse(messages) {
  try {
    const userMsg = messages.find(
      (m) => m.role === "user" && typeof m.content === "string",
    );
    if (!userMsg) return null;

    const content = userMsg.content;

    const operationMatch = content.match(/Operation:\s*([^\n]+)/);
    const materialMatch = content.match(/Selected Material:\s*([^\n]+)/);
    const operation = operationMatch
      ? operationMatch[1].trim()
      : "the operation";
    const material = materialMatch
      ? materialMatch[1].trim()
      : "the selected material";

    const numResultsMatch = content.match(
      /Numerical Results:\s*\n([\s\S]*?)\n\nCost Analysis:/,
    );
    const costMatch = content.match(
      /Cost Analysis:\s*\n([\s\S]*?)\n\nMaterial Comparison:/,
    );
    const safetyMatch = content.match(
      /Safety Warnings:\s*\n([\s\S]*?)(?:\n\nInstructions:|\s*$)/,
    );

    let numResults = {};
    let cost = {};
    let safetyWarnings = "None";

    try {
      numResults = JSON.parse(numResultsMatch?.[1] || "{}");
    } catch {
      /**/
    }
    try {
      cost = JSON.parse(costMatch?.[1] || "{}");
    } catch {
      /**/
    }
    safetyWarnings = safetyMatch?.[1]?.trim() || "None";

    const parts = [];
    parts.push(
      `I've completed the ${operation} analysis using **${material}** as the workpiece material.`,
    );

    const highlights = [];
    if (numResults.cuttingForce || numResults.force) {
      const f = numResults.cuttingForce || numResults.force;
      highlights.push(
        `a cutting force of **${Math.round(f).toLocaleString()} N**`,
      );
    }
    if (numResults.thrustForce != null) {
      highlights.push(
        `a thrust force of **${Math.round(numResults.thrustForce).toLocaleString()} N**`,
      );
    }
    if (numResults.torque != null) {
      highlights.push(`a torque of **${numResults.torque.toFixed(2)} N·m**`);
    }
    if (numResults.machiningTime != null) {
      highlights.push(
        `a machining time of **${numResults.machiningTime.toFixed(2)} min**`,
      );
    }
    if (numResults.forgingCycleTime != null) {
      highlights.push(
        `a forging cycle time of **${numResults.forgingCycleTime.toFixed(2)} min**`,
      );
    }
    if (numResults.rpm != null) {
      highlights.push(
        `a spindle speed of **${Math.round(numResults.rpm).toLocaleString()} RPM**`,
      );
    }
    if (numResults.feedRate != null) {
      highlights.push(
        `a feed rate of **${Math.round(numResults.feedRate).toLocaleString()} mm/min**`,
      );
    }
    if (numResults.power != null) {
      highlights.push(
        `a required power of **${numResults.power.toFixed(1)} W**`,
      );
    }
    if (numResults.energy != null) {
      highlights.push(
        `energy consumption of **${Math.round(numResults.energy).toLocaleString()} J**`,
      );
    }
    if (highlights.length > 0) {
      parts.push(`The simulation shows ${highlights.join(", ")}.`);
    }

    if (cost.totalCost != null) {
      const totalCost = cost.totalCost.toLocaleString();
      const matCost = cost.materialCost?.toLocaleString() ?? "N/A";
      const macCost = cost.machineCost?.toLocaleString() ?? "N/A";
      parts.push(
        `From a cost perspective, the total estimated cost is **₹${totalCost}** (material: ₹${matCost}, machine time: ₹${macCost}).`,
      );
    }

    if (safetyWarnings !== "None" && safetyWarnings.length > 0) {
      parts.push(
        `⚠️ **Safety Note:** ${safetyWarnings}. Please ensure your setup accounts for these before proceeding.`,
      );
    } else {
      parts.push(
        `All safety checks passed — the process parameters are within acceptable limits for ${material}.`,
      );
    }

    parts.push(
      `Feel free to ask me anything specific about this operation, like optimizing cycle time, reducing costs, or improving surface finish!`,
    );

    return parts.join(" ");
  } catch (err) {
    console.error("Fallback generation error:", err);
    return null;
  }
}

export const generateAIResponse = async (messages) => {
  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 800, // cap to control cost and response time on Render
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error.message || error);

    const fallback = generateFallbackResponse(messages);
    if (fallback) return fallback;

    return "The analysis is complete. Please review the numerical results, cost breakdown, and safety warnings shown in the result panel on the right.";
  }
};
