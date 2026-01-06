
import { GoogleGenAI } from "@google/genai";
import { TokenMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTokenMetadata = async (token: TokenMetadata) => {
  const prompt = `Analyze this blockchain token and provide a creative summary in Chinese:
  Name: ${token.name}
  Description: ${token.description}
  Owner: ${token.owner}
  Attributes: ${JSON.stringify(token.attributes)}
  
  Explain what this token might represent in the ecosystem.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};

export const askAboutProject = async (query: string, context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context: You are an expert on the Base Sepolia testnet. 
    A user is viewing tokens from Project ID: db2fa52a63be115cb4a12cb5cbfeac86 at address 0x80a4A65e0cd7ddcD9E6ad257F0bF7D7CcE66881e.
    Current data context: ${context}
    
    User Query: ${query}
    
    Provide a helpful, technical, yet accessible answer in Chinese.`,
  });

  return response.text;
};
