import { GoogleGenAI, Type } from "@google/genai";

export const analyzeImage = async (base64Image: string) => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Remove data URL prefix if present for the API call 
  // (Note: some SDK versions handle data URLs, but often raw base64 is safer or specific inlineData format)
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
  const mimeTypeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image for SEO purposes. Provide an SEO-friendly alt text, a short description (max 2 sentences), and 5-7 relevant comma-separated tags.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            altText: { type: Type.STRING, description: "SEO optimized alt text for the image" },
            description: { type: Type.STRING, description: "A concise description of the image content" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Relevant keywords and tags" 
            },
          },
          required: ["altText", "description", "tags"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};