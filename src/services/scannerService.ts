import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function scanForDeals(query: string): Promise<SearchResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are a professional price comparison expert and web scanner. 
  Find the best current deals for: "${query}".
  
  Search for real-time prices from reputable retailers. 
  Focus on finding the lowest prices, current discounts, and availability.
  
  Return the results in a structured JSON format with:
  1. An array of 'deals' each containing: title, price (with currency), store name, url, description (short), and rating (if available).
  2. A 'summary' of the findings (e.g., "The cheapest option is X at store Y").
  
  Be precise and only include actual deals found.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  price: { type: Type.STRING },
                  store: { type: Type.STRING },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING },
                  rating: { type: Type.STRING },
                },
                required: ["title", "price", "store", "url"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["deals", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })) || [];

    return {
      deals: result.deals.map((d: any, i: number) => ({ ...d, id: `deal-${i}` })),
      summary: result.summary,
      sources: sources
    };
  } catch (error) {
    console.error("Error scanning for deals:", error);
    throw error;
  }
}
