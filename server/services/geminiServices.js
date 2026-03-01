import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateGeminiResponse(prompt) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gemini API failed.");
  }
}