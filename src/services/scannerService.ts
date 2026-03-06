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
  1. SOURCE CONSISTENCY (MANDATORY): For every deal you return, the [Title], [Price], [Store Name], and [URL] MUST all come from the EXACT SAME search result or landing page. 
     - NEVER take a price from one search result and pair it with a URL from another.
     - If Store A has it for 1.900 kr and Store B has it for 2.000 kr, you must create TWO separate deal objects or choose one. DO NOT create a deal with Store B's link and Store A's price.
  2. PRICE ACCURACY (EXTREME PRIORITY): 
     - The 'price' MUST be the exact price currently shown on the linked product page for a PRIVATE CONSUMER.
     - In Denmark/EU, this MUST include VAT (Moms). Do NOT use the "excl. VAT" price.
     - If you see "2.036,00 kr" on the page, the price in your JSON must be "2.036,00 DKK".
     - Double-check the price. If you are unsure or if the price seems to come from a different store, discard the deal.
  3. NO HALLUCINATED LINKS: You MUST ONLY use URLs that you have actually found and verified via the Google Search tool.
  4. DIRECT PRODUCT LINKS: The 'url' MUST lead directly to the specific product page. No search results, no homepages.
  5. SPECIFICATION MATCHING: Ensure the product matches the query EXACTLY (capacity, model, etc.).
  6. NO PLACEHOLDERS: Use only REAL, full URLs found in search results.
  
  Return the results in a structured JSON format with:
  1. An array of 'deals' each containing: title, price (with currency), store name, url, description (short), specs, and a 'verification' string where you confirm "Price [X] found at [URL]".
  2. A 'summary' of the findings.
  
  Be precise. If the price on the page is different from what you first thought, update it to match the page exactly.`;

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
                  verification: { type: Type.STRING, description: "Confirmation of price and URL consistency" },
                },
                required: ["title", "price", "store", "url", "specs", "verification"],
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
