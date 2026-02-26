import OpenAI from "openai";

let openai;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Extract structured data from the AI messages array for fallback generation.
 * Looks for the user message that contains the JSON numerical results.
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
      /* ignore */
    }
    try {
      cost = JSON.parse(costMatch?.[1] || "{}");
    } catch {
      /* ignore */
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
        `a cutting/thrust force of **${Math.round(f).toLocaleString()} N**`,
      );
    }
    if (numResults.rpm != null) {
      highlights.push(
        `a spindle speed of **${Math.round(numResults.rpm).toLocaleString()} RPM**`,
      );
    }
    if (numResults.feedRate != null) {
      highlights.push(
        `a feed rate of **${numResults.feedRate.toFixed(2)} mm/min**`,
      );
    }
    if (numResults.machiningTime != null) {
      highlights.push(
        `a machining time of **${numResults.machiningTime.toFixed(3)} min**`,
      );
    }
    if (numResults.drillingTime != null) {
      highlights.push(
        `a drilling time of **${numResults.drillingTime.toFixed(3)} min**`,
      );
    }
    if (numResults.torque != null) {
      highlights.push(`a torque of **${numResults.torque.toFixed(4)} Nm**`);
    }
    if (numResults.forgingCycleTime != null) {
      highlights.push(
        `a forging cycle time of **${numResults.forgingCycleTime.toFixed(2)} min**`,
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

/**
 * Main AI response generator for calculation results.
 */
export const generateAIResponse = async (messages) => {
  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error.message || error);
    const fallback = generateFallbackResponse(messages);
    if (fallback) return fallback;
    return "The analysis is complete. Please review the numerical results, cost breakdown, and safety warnings shown in the result panel on the right.";
  }
};

/**
 * Pure conversational AI chat — no calculation data.
 * Used when user sends a message without sufficient input parameters.
 */
export const handlePureChat = async ({
  sessionId,
  userPrompt,
  operationType,
  subOperation,
  imageContext,
}) => {
  try {
    const client = getOpenAI();

    const systemContent = `You are Mechanical GPT, an expert industrial mechanical engineering assistant specializing in ${operationType} operations, specifically ${subOperation}. 

Your role:
- Answer mechanical engineering questions conversationally and accurately.
- If user hasn't provided numerical inputs yet, guide them on what parameters are needed.
- Explain concepts, formulas, and best practices for ${subOperation}.
- If user asks about calculations, explain the formulas and what inputs are needed.
- Stay focused on ${operationType} → ${subOperation} topics.
- Be encouraging and professional. Use clear, technical yet accessible language.
- NEVER hallucinate numerical results — only discuss results if actual calculations were done.`;

    const userContent = [];

    if (imageContext?.hasImage) {
      const extractedStr =
        Object.keys(imageContext.extractedValues || {}).length > 0
          ? `I could extract these values from your image: ${JSON.stringify(imageContext.extractedValues)}. `
          : "I couldn't extract clear numerical values from the image. ";
      userContent.push({
        type: "text",
        text: `${extractedStr}The user's question: ${userPrompt}`,
      });
      userContent.push({
        type: "image_url",
        image_url: { url: imageContext.image },
      });
    } else {
      // Pure text
      return (
        await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        })
      ).choices[0].message.content;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Pure chat AI error:", error.message);
    return `I'm Mechanical GPT, ready to help with your ${operationType} → ${subOperation} questions! Could you tell me more about what you'd like to know? If you'd like a full simulation, please fill in the input parameters above and I'll calculate everything for you.`;
  }
};
