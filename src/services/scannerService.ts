import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { SearchResult, SearchLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function scanForDeals(query: string, location: SearchLocation = 'DK'): Promise<SearchResult> {
  const model = "gemini-3.1-pro-preview";
  
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
  1. NO HALLUCINATED LINKS: You MUST ONLY use URLs that you have actually found and verified via the Google Search tool. NEVER "guess" or "construct" a URL. If you haven't found a working link to the specific product, do not include it.
  2. DIRECT PRODUCT LINKS (DEEP LINKS): The 'url' MUST lead directly to the specific product page where the item can be added to a cart or purchased. 
     - DO NOT link to search results pages (URLs containing '?s=', '/search/', or similar).
     - DO NOT link to category pages or generic homepages.
     - The link must land on a page where the user does NOT have to search again.
  3. SPECIFICATION MATCHING (CRITICAL): Ensure the product on the linked page matches the query EXACTLY. 
     - If the user asks for "8-12TB", a 4TB or 6TB drive is a FAIL. 
     - Check capacity, model numbers, and technical specs on the landing page before including.
  4. PRICE ACCURACY: The 'price' MUST be the exact price currently shown on the linked product page. Verify the price carefully.
  5. AVAILABILITY: Only include items that are currently in stock or available for order.
  6. LINK VALIDITY: Before including a deal, verify that the URL is active and leads directly to the product. Use your search grounding capabilities to confirm the page content.
  7. NO PLACEHOLDERS: NEVER use URLs like "amazon.com/product/123" or "proshop.dk/item/abc". The URL must be the REAL, full URL found in the search results.
  
  Return the results in a structured JSON format with:
  1. An array of 'deals' each containing: title, price (with currency), store name, url, description (short), and rating (if available).
  2. A 'summary' of the findings (e.g., "The cheapest option is X at store Y").
  
  Be precise and only include actual deals found.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
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
                  specs: { type: Type.STRING, description: "Technical specs found on the page (e.g., '12TB, 7200RPM')" },
                },
                required: ["title", "price", "store", "url", "specs"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["deals", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Filter out obvious hallucinated or placeholder URLs
    const validDeals = (result.deals || []).filter((deal: any) => {
      const url = deal.url?.toLowerCase() || "";
      const isPlaceholder = 
        url.includes("example.com") || 
        url.includes("placeholder.com") || 
        url.includes("your-link-here") ||
        url.includes("/product/123") ||
        url.includes("/item/abc") ||
        !url.startsWith("http");
      return !isPlaceholder;
    });

    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })) || [];

    return {
      deals: validDeals.map((d: any, i: number) => ({ ...d, id: `deal-${i}` })),
      summary: result.summary,
      sources: sources
    };
  } catch (error) {
    console.error("Error scanning for deals:", error);
    throw error;
  }
}
