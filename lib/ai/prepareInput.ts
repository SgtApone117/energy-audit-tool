import type { FormData, ECMResult } from "../types";
import type { Insight } from "../insights/auditInsights";
import type { AIExecutiveSummaryInput } from "./types";
import { EUI_LOOKUP } from "../data";

/**
 * Prepares input data for AI Executive Summary from existing audit results.
 * This function is read-only and only formats existing data - no calculations.
 */
export function prepareAIInput(
  submittedData: FormData,
  annualEnergyUse: number | null,
  annualEnergyCost: number | null,
  endUseBreakdown: Record<string, number> | null,
  ecmResults: ECMResult[] | null,
  insights: Insight[]
): AIExecutiveSummaryInput | null {
  // Validate required data
  if (
    !submittedData ||
    annualEnergyUse === null ||
    annualEnergyCost === null ||
    !endUseBreakdown ||
    !ecmResults ||
    ecmResults.length === 0
  ) {
    return null;
  }

  const floorArea = parseFloat(submittedData.floorArea);
  if (isNaN(floorArea) || floorArea <= 0) {
    return null;
  }

  // Calculate EUI from existing data (this is just formatting, not a new calculation)
  const eui = annualEnergyUse / floorArea;

  // Calculate end-use percentages from existing breakdown
  const endUsePercentages: Record<string, number> = {};
  for (const [category, kwh] of Object.entries(endUseBreakdown)) {
    endUsePercentages[category] = (kwh / annualEnergyUse) * 100;
  }

  // Aggregate ECM data (read-only aggregation, no new calculations)
  const totalEnergySavings = ecmResults.reduce((sum, ecm) => sum + ecm.energySaved, 0);
  const totalCostSavings = ecmResults.reduce((sum, ecm) => sum + ecm.costSaved, 0);
  const totalImplementationCost = ecmResults.reduce((sum, ecm) => sum + ecm.implementationCost, 0);

  // Calculate average payback (only for valid payback periods)
  const validPaybacks = ecmResults
    .filter((ecm) => ecm.paybackPeriod !== Infinity)
    .map((ecm) => ecm.paybackPeriod);
  const averagePaybackPeriod =
    validPaybacks.length > 0
      ? validPaybacks.reduce((sum, pb) => sum + pb, 0) / validPaybacks.length
      : Infinity;

  // Count priorities
  const priorityCounts = {
    high: ecmResults.filter((ecm) => ecm.priority === "High").length,
    medium: ecmResults.filter((ecm) => ecm.priority === "Medium").length,
    low: ecmResults.filter((ecm) => ecm.priority === "Low").length,
  };

  // Get top 2-3 ECMs (sorted by priority: High > Medium > Low, then by payback)
  const sortedECMs = [...ecmResults].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by payback (shorter is better)
    if (a.paybackPeriod === Infinity) return 1;
    if (b.paybackPeriod === Infinity) return -1;
    return a.paybackPeriod - b.paybackPeriod;
  });

  const topECMs = sortedECMs.slice(0, 3).map((ecm) => ({
    name: ecm.name,
    energySaved: ecm.energySaved,
    costSaved: ecm.costSaved,
    implementationCost: ecm.implementationCost,
    paybackPeriod: ecm.paybackPeriod,
    priority: ecm.priority,
  }));

  return {
    buildingName: submittedData.buildingName || "Building",
    businessType: submittedData.businessType || "Unknown",
    floorArea,
    zipCode: submittedData.zipCode || "Unknown",
    constructionYear: submittedData.constructionYear || "Unknown",
    primaryHeatingFuel: submittedData.primaryHeatingFuel || "Unknown",
    annualEnergyUse,
    annualEnergyCost,
    eui,
    endUseBreakdown,
    endUsePercentages,
    totalECMs: ecmResults.length,
    totalEnergySavings,
    totalCostSavings,
    totalImplementationCost,
    averagePaybackPeriod,
    priorityCounts,
    topECMs,
    insights,
  };
}
