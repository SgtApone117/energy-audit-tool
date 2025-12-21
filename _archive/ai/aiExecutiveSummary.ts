import type { AIExecutiveSummaryInput, AIExecutiveSummaryOutput } from "./types";

/**
 * Builds a strict, conservative prompt for OpenAI to generate an executive summary.
 * The prompt enforces read-only usage of provided data and prohibits calculations.
 */
export function buildExecutiveSummaryPrompt(input: AIExecutiveSummaryInput): string {
  const {
    buildingName,
    businessType,
    floorArea,
    zipCode,
    constructionYear,
    primaryHeatingFuel,
    annualEnergyUse,
    annualEnergyCost,
    eui,
    endUseBreakdown,
    endUsePercentages,
    totalECMs,
    totalEnergySavings,
    totalCostSavings,
    totalImplementationCost,
    averagePaybackPeriod,
    priorityCounts,
    topECMs,
    insights,
  } = input;

  // Format end-use breakdown
  const endUseText = Object.entries(endUsePercentages)
    .map(([category, percentage]) => `- ${category}: ${percentage.toFixed(1)}%`)
    .join("\n");

  // Format top ECMs
  const topECMsText = topECMs
    .map(
      (ecm) =>
        `- ${ecm.name}: $${ecm.costSaved.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}/year savings, ${ecm.paybackPeriod === Infinity ? "N/A" : ecm.paybackPeriod.toFixed(1)} year payback, ${ecm.priority} priority`
    )
    .join("\n");

  // Format insights
  const insightsText = insights.map((insight) => `- ${insight.text.replace(/\*\*/g, "")}`).join("\n");

  return `You are a professional energy consultant writing an executive summary for a client's energy audit report. Your task is to create a structured, conservative, and professional narrative summary based EXCLUSIVELY on the provided data.

CRITICAL RULES:
1. Use ONLY the data provided below. Do NOT calculate, estimate, or assume any values not explicitly given.
2. Use conservative, professional language. Avoid guarantees or promises.
3. Use terms like "estimated," "indicative," "represents an opportunity," "based on modeled analysis."
4. NEVER use: "guaranteed," "you should," "AI predicts," "immediate savings," "this will reduce."
5. Output MUST be valid JSON matching the exact structure specified below.
6. Each section must be professional, neutral, and consulting-style.
7. Do NOT restate exact numeric values that are already visible elsewhere in the report.
8. Focus on patterns, concentration, relative importance, and trade-offs rather than listing figures.
9. Assume the reader can see detailed tables and Key Insights below this summary.
10. If a sentence would simply repeat a numeric value or fact already shown in the Key Insights section, replace it with an interpretive statement explaining why that value matters.

PROVIDED DATA:

Building Information:
- Name: ${buildingName || "Not specified"}
- Type: ${businessType}
- Floor Area: ${floorArea.toLocaleString()} sq ft
- Location: ZIP ${zipCode}
- Construction Year: ${constructionYear}
- Primary Heating Fuel: ${primaryHeatingFuel}

Baseline Energy Metrics:
- Estimated Annual Energy Use: ${annualEnergyUse.toLocaleString()} kWh/year
- Estimated Annual Energy Cost: $${annualEnergyCost.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}/year
- Energy Use Intensity (EUI): ${eui.toFixed(1)} kWh/sq ft/year

End-Use Energy Breakdown:
${endUseText}

ECM Summary:
- Total Number of Measures: ${totalECMs}
- Total Estimated Annual Energy Savings: ${totalEnergySavings.toLocaleString()} kWh/year
- Total Estimated Annual Cost Savings: $${totalCostSavings.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}/year
- Total Estimated Implementation Cost: $${totalImplementationCost.toLocaleString()}
- Average Payback Period: ${averagePaybackPeriod === Infinity ? "N/A" : averagePaybackPeriod.toFixed(1)} years
- Priority Distribution: High: ${priorityCounts.high}, Medium: ${priorityCounts.medium}, Low: ${priorityCounts.low}

Top Energy Conservation Measures:
${topECMsText}

Key Insights:
${insightsText}

REQUIRED OUTPUT STRUCTURE (return as valid JSON only):
{
  "overview": "3-4 sentences summarizing the audit scope and key findings. Use conservative language.",
  "energyPerformanceSnapshot": [
    "Interpretive statement about how energy use is distributed across major systems",
    "Interpretive statement about the scale of energy costs relative to building operations",
    "Interpretive statement about which end-uses represent the greatest leverage for improvement"
  ],
  "keyFindings": [
    "High-level theme derived from multiple provided insights, focusing on what matters most rather than restating individual facts"
  ],
  "recommendedFocusAreas": [
    "Focus area 1 derived from ECM priorities and end-use concentration",
    "Focus area 2 derived from ECM priorities and end-use concentration",
    "Focus area 3 (if applicable)"
  ],
  "topEnergyConservationMeasures": "Narrative paragraph explaining how the top measures differ in terms of payback speed versus long-term impact, without listing all numeric values.",
  "businessImpactSummary": "High-level paragraph framing the total savings opportunity and overall payback. Use terms like 'estimated' and 'indicative'.",
  "disclaimer": "Statement clarifying that results are modeled estimates based on industry-standard assumptions and should be validated through on-site assessment."
}

Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Validates and parses the AI response into the structured output format.
 */
export function parseAIResponse(response: string): AIExecutiveSummaryOutput {
  try {
    // Remove any markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(cleaned) as AIExecutiveSummaryOutput;

    // Validate structure
    if (
      !parsed.overview ||
      !Array.isArray(parsed.energyPerformanceSnapshot) ||
      !Array.isArray(parsed.keyFindings) ||
      !Array.isArray(parsed.recommendedFocusAreas) ||
      !parsed.topEnergyConservationMeasures ||
      !parsed.businessImpactSummary ||
      !parsed.disclaimer
    ) {
      throw new Error("Invalid response structure");
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
