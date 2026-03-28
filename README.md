# PricePulse - AI-Drevet Prissammenligning & Gavefinder

PricePulse er en moderne webapplikation, der bruger avanceret AI (Gemini 3.1 Pro) til at scanne internettet i realtid for de bedste priser og tilbud. Appen er designet til at give præcise, verificerede resultater med fokus på det danske og europæiske marked.

## Hvad kan PricePulse?

Dette projekt er bygget til at løse problemet med forældede priser og upræcise søgeresultater på traditionelle prissammenligningssider. Ved at bruge AI med "Google Search Grounding" kan PricePulse finde de nyeste priser direkte fra butikkernes egne sider.

### Hovedfunktioner:

*   **AI-Drevet Scanning:** Bruger Gemini 3.1 Pro til at analysere søgeresultater og finde direkte links til produkter.
*   **Lokations-specifik Søgning:** Vælg mellem Danmark (DK), Norden, EU eller Globalt for at finde de mest relevante butikker og valutaer.
*   **Gavefinder:** En intelligent AI-assistent, der hjælper dig med at finde den perfekte gave baseret på modtagerens interesser og dit budget.
*   **Sammenligningsværktøj:** Gem både hele søgninger og specifikke produkter for at sammenligne dem senere.
*   **Høj Præcision & Verificering:**
    *   **Inkl. Moms:** Priser for DK og EU vises automatisk inklusiv moms (Moms).
    *   **Verificerede Specifikationer:** AI'en tjekker tekniske detaljer (f.eks. GB/TB på harddiske) for at sikre, at produktet matcher din søgning.
    *   **Kilde-Konsistens:** Sikrer at pris, butik og link altid stammer fra samme kilde for at undgå fejl.
*   **Direkte Links:** Appen prioriterer "dybe links" direkte til produktsiden fremfor søgeresultater eller forsider.

## Teknologier

*   **Frontend:** React med Vite og TypeScript.
*   **Styling:** Tailwind CSS for et moderne og responsivt design.
*   **AI:** Google Gemini API (@google/genai) med Google Search værktøjet.
*   **Ikoner:** Lucide React.
*   **Animationer:** Motion (framer-motion).

## Hvordan virker det?

Når du indtaster en søgning, sender appen en forespørgsel til Gemini AI'en sammen med din valgte lokation. AI'en bruger Google Search til at finde aktuelle sider, udtrækker priser, specifikationer og direkte links, og præsenterer dem i en overskuelig oversigt med badges for verificerede data.
