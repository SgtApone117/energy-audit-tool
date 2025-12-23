import type { AIExecutiveSummaryInput, AIExecutiveSummaryOutput } from "./types";

/**
 * Builds a prompt for OpenAI to generate a customer-friendly executive summary.
 */
export function buildExecutiveSummaryPrompt(input: AIExecutiveSummaryInput): string {
  const {
    buildingName,
    businessType,
    floorArea,
    zipCode,
    state,
    annualEnergyUse,
    annualEnergyCost,
    eui,
    energyScore,
    percentile,
    typicalEUI,
    efficientEUI,
    totalECMs,
    totalPotentialSavings,
    totalImplementationCost,
    averagePaybackPeriod,
    priorityCounts,
    topECMs,
    quickWinsSavings,
    insights,
  } = input;

  // Format top ECMs
  const topECMsText = topECMs
    .map(
      (ecm) =>
        `- ${ecm.name}: $${ecm.annualSavings.toLocaleString()}/year savings, ${ecm.paybackYears.toFixed(1)} year payback, ${ecm.priority} priority`
    )
    .join("\n");

  // Format insights
  const insightsText = insights.map((insight) => `- ${insight}`).join("\n");

  return `You are a friendly energy consultant helping a small business owner understand their energy assessment results. Write a clear, actionable executive summary based ONLY on the provided data.

WRITING STYLE:
1. Be conversational but professional - like talking to a business owner, not an engineer
2. Use plain language, avoid jargon
3. Focus on practical implications and actionable takeaways
4. Use encouraging, positive framing while being honest about findings
5. Use "you/your" instead of "the building"

DATA PROVIDED:

Business Information:
- Name: ${buildingName || "Your Business"}
- Type: ${businessType}
- Size: ${floorArea.toLocaleString()} sq ft
- Location: ${state} (ZIP ${zipCode})

Energy Performance:
- Annual Energy Cost: $${annualEnergyCost.toLocaleString()}
- Annual Usage: ${annualEnergyUse.toLocaleString()} kWh
- Energy Score: ${energyScore}
- Compared to Similar Businesses: ${percentile}th percentile
- Your EUI: ${eui.toFixed(1)} kWh/sqft vs Typical: ${typicalEUI.toFixed(1)} kWh/sqft

Savings Opportunities:
- Quick Wins (no-cost actions): $${quickWinsSavings.toLocaleString()}/year potential
- Total ECM Recommendations: ${totalECMs}
- High Priority: ${priorityCounts.high}, Medium: ${priorityCounts.medium}, Low: ${priorityCounts.low}
- Total Potential Savings: $${totalPotentialSavings.toLocaleString()}/year
- Total Investment Required: $${totalImplementationCost.toLocaleString()}
- Average Payback: ${averagePaybackPeriod.toFixed(1)} years

Top Opportunities:
${topECMsText}

Key Insights:
${insightsText}

REQUIRED OUTPUT (return ONLY valid JSON):
{
  "overview": "2-3 sentences summarizing the overall findings in a friendly, encouraging tone. Mention the energy score and key opportunity.",
  "energyPerformanceSnapshot": [
    "Statement about how their costs compare to similar businesses",
    "Statement about their biggest energy use pattern or area"
  ],
  "keyFindings": [
    "Most important finding about their energy use",
    "Second key finding (if applicable)"
  ],
  "recommendedFocusAreas": [
    "First priority area with brief explanation",
    "Second priority area with brief explanation"
  ],
  "topOpportunities": "Brief paragraph describing the best 2-3 opportunities and why they make sense for this business. Be specific but concise.",
  "businessImpactSummary": "Paragraph summarizing the total savings potential, investment required, and payback. Frame positively - 'By investing X, you could save Y per year'.",
  "nextSteps": [
    "First recommended action they should take",
    "Second recommended action",
    "Third recommended action"
  ],
  "disclaimer": "Brief note that these are estimates based on typical values and actual results may vary."
}

Return ONLY the JSON object.`;
}

/**
 * Validates and parses the AI response.
 */
export function parseAIResponse(response: string): AIExecutiveSummaryOutput {
  try {
    // Remove any markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(cleaned) as AIExecutiveSummaryOutput;

    // Validate required fields
    if (
      !parsed.overview ||
      !Array.isArray(parsed.energyPerformanceSnapshot) ||
      !Array.isArray(parsed.keyFindings) ||
      !Array.isArray(parsed.recommendedFocusAreas) ||
      !parsed.topOpportunities ||
      !parsed.businessImpactSummary ||
      !Array.isArray(parsed.nextSteps) ||
      !parsed.disclaimer
    ) {
      throw new Error("Invalid response structure");
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Prepares input data from customer assessment results.
 */
export function prepareAISummaryInput(
  formData: {
    businessName: string;
    businessType: string;
    squareFootage: number;
    zipCode: string;
    state: string;
  },
  results: {
    annualCost: number;
    annualUsage: number;
    yourEUI: number;
    typicalEUI: number;
    efficientEUI: number;
    energyScore: string;
    percentile: number;
    quickWins: Array<{ estimatedSavings: number }>;
    ecmRecommendations: Array<{
      title: string;
      priority: 'high' | 'medium' | 'low';
      savingsRange: { typical: number };
      costRange: { typical: number };
      paybackRange: { best: number; worst: number };
    }>;
    insights: Array<{ message: string }>;
  }
): AIExecutiveSummaryInput {
  const quickWinsSavings = results.quickWins.reduce((sum, qw) => sum + qw.estimatedSavings, 0);
  
  const totalPotentialSavings = results.ecmRecommendations.reduce(
    (sum, ecm) => sum + ecm.savingsRange.typical, 0
  );
  
  const totalImplementationCost = results.ecmRecommendations.reduce(
    (sum, ecm) => sum + ecm.costRange.typical, 0
  );
  
  const avgPayback = totalPotentialSavings > 0 
    ? totalImplementationCost / totalPotentialSavings 
    : 0;
  
  const priorityCounts = {
    high: results.ecmRecommendations.filter(e => e.priority === 'high').length,
    medium: results.ecmRecommendations.filter(e => e.priority === 'medium').length,
    low: results.ecmRecommendations.filter(e => e.priority === 'low').length,
  };
  
  const topECMs = results.ecmRecommendations.slice(0, 3).map(ecm => ({
    name: ecm.title,
    annualSavings: ecm.savingsRange.typical,
    implementationCost: ecm.costRange.typical,
    paybackYears: (ecm.paybackRange.best + ecm.paybackRange.worst) / 2,
    priority: ecm.priority,
  }));

  return {
    buildingName: formData.businessName,
    businessType: formData.businessType,
    floorArea: formData.squareFootage,
    zipCode: formData.zipCode,
    state: formData.state,
    annualEnergyUse: results.annualUsage,
    annualEnergyCost: results.annualCost,
    eui: results.yourEUI,
    energyScore: results.energyScore,
    percentile: results.percentile,
    typicalEUI: results.typicalEUI,
    efficientEUI: results.efficientEUI,
    totalECMs: results.ecmRecommendations.length,
    totalPotentialSavings,
    totalImplementationCost,
    averagePaybackPeriod: avgPayback,
    priorityCounts,
    topECMs,
    quickWinsSavings,
    insights: results.insights.map(i => i.message),
  };
}
