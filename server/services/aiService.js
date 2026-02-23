import OpenAI from "openai";

let openai;

/**
 * Extract structured data from the AI messages array for fallback generation.
 * Looks for the user message that contains the JSON numerical results.
 */
function generateFallbackResponse(messages) {
  try {
    // Find the user content message that has the JSON data
    const userMsg = messages.find(
      (m) => m.role === "user" && typeof m.content === "string",
    );
    if (!userMsg) return null;

    const content = userMsg.content;

    // Extract operation info
    const operationMatch = content.match(/Operation:\s*([^\n]+)/);
    const materialMatch = content.match(/Selected Material:\s*([^\n]+)/);
    const operation = operationMatch
      ? operationMatch[1].trim()
      : "the operation";
    const material = materialMatch
      ? materialMatch[1].trim()
      : "the selected material";

    // Extract numerical results JSON
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

    // Build a contextual response from the actual data
    const parts = [];

    // Greeting and operation summary
    parts.push(
      `I've completed the ${operation} analysis using **${material}** as the workpiece material.`,
    );

    // Numerical highlights
    const highlights = [];
    if (numResults.cuttingForce || numResults.force) {
      const f = numResults.cuttingForce || numResults.force;
      highlights.push(
        `a cutting force of **${Math.round(f).toLocaleString()} N**`,
      );
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

    // Cost breakdown
    if (cost.totalCost != null) {
      const totalCost = cost.totalCost.toLocaleString();
      const matCost = cost.materialCost?.toLocaleString() ?? "N/A";
      const macCost = cost.machineCost?.toLocaleString() ?? "N/A";
      parts.push(
        `From a cost perspective, the total estimated cost is **₹${totalCost}** (material: ₹${matCost}, machine time: ₹${macCost}).`,
      );
    }

    // Safety
    if (safetyWarnings !== "None" && safetyWarnings.length > 0) {
      parts.push(
        `⚠️ **Safety Note:** ${safetyWarnings}. Please ensure your setup accounts for these before proceeding.`,
      );
    } else {
      parts.push(
        `All safety checks passed — the process parameters are within acceptable limits for ${material}.`,
      );
    }

    // Recommendation tail
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
    if (!openai) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error.message || error);

    // Try to build a meaningful contextual response from the data
    const fallback = generateFallbackResponse(messages);
    if (fallback) return fallback;

    // Last resort generic message
    return "The analysis is complete. Please review the numerical results, cost breakdown, and safety warnings shown in the result panel on the right.";
  }
};
