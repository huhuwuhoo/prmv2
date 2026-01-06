
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTokenIdeas(theme: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 3 creative meme coin ideas based on this theme: ${theme}. 
    Provide a catchy name, a 3-4 letter ticker symbol, and a hilarious 1-sentence description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "symbol", "description"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
