import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, SearchLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function scanForDeals(query: string, location: SearchLocation = 'DK'): Promise<SearchResult> {
  const model = "gemini-3-flash-preview";
  
  const locationContext = {
    'DK': 'Focus ONLY on Danish retailers (e.g., Proshop, Elgiganten, Komplett.dk, Power.dk) and prices in DKK.',
    'Nordics': 'Focus on retailers in Denmark, Sweden, Norway, and Finland (e.g., Komplett, NetOnNet, Gigantti). Use local currencies.',
    'EU': 'Focus on retailers within the European Union (e.g., Amazon.de, Mindfactory, ComputerUniverse). Prices in EUR or local EU currencies.',
    'Global': 'Search globally across all major international retailers (e.g., Amazon.com, Newegg, B&H).'
  }[location] || 'Focus on Danish retailers.';

  const prompt = `You are a professional price comparison expert and web scanner. 
  Find the best current deals for: "${query}".
  
  LOCATION CONTEXT: ${locationContext}
  
  CRITICAL INSTRUCTIONS:
  1. DIRECT PRODUCT LINKS: The 'url' MUST lead directly to the specific product page where the item can be purchased. DO NOT link to search results pages, category pages, or generic homepages.
  2. PRICE ACCURACY: The 'price' MUST be the exact price currently shown on the linked product page. Verify the price carefully.
  3. SPECIFICITY: If the query specifies a model number (e.g., ST8000DM004), ensure the results match that EXACT model.
  4. AVAILABILITY: Only include items that are currently in stock or available for order.
  
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
