import type { ECMResult } from "../types";

export interface Insight {
  text: string;
}

export interface AuditInsightsInput {
  annualEnergyUse: number | null;
  annualEnergyCost: number | null;
  endUseBreakdown: Record<string, number> | null;
  ecmResults: ECMResult[] | null;
}

/**
 * Generates deterministic insights from existing audit results.
 * This is a read-only function that surfaces key findings without introducing new calculations.
 */
export function generateAuditInsights(input: AuditInsightsInput): Insight[] {
  const insights: Insight[] = [];

  const { annualEnergyUse, annualEnergyCost, endUseBreakdown, ecmResults } = input;

  // Insight 1: Largest Energy End-Use
  if (endUseBreakdown && annualEnergyUse !== null && annualEnergyUse > 0) {
    const entries = Object.entries(endUseBreakdown);
    if (entries.length > 0) {
      const largestEndUse = entries.reduce((max, current) =>
        current[1] > max[1] ? current : max
      );
      const percentage = (largestEndUse[1] / annualEnergyUse) * 100;
      insights.push({
        text: `The largest energy-consuming end-use is **${largestEndUse[0]}**, accounting for approximately **${percentage.toFixed(0)}%** of total consumption.`,
      });
    }
  }

  // Insight 2: Highest Priority ECM
  if (ecmResults && ecmResults.length > 0) {
    const highPriorityECMs = ecmResults.filter((ecm) => ecm.priority === "High");
    
    if (highPriorityECMs.length > 0) {
      // If multiple High priority ECMs, select the one with shortest payback
      const highestPriorityECM = highPriorityECMs.reduce((best, current) => {
        if (current.paybackPeriod === Infinity) return best;
        if (best.paybackPeriod === Infinity) return current;
        return current.paybackPeriod < best.paybackPeriod ? current : best;
      });
      
      const paybackText =
        highestPriorityECM.paybackPeriod === Infinity
          ? "—"
          : highestPriorityECM.paybackPeriod.toFixed(1);
      
      insights.push({
        text: `The highest-priority energy conservation measure is **${highestPriorityECM.name}**, with an estimated payback of **${paybackText} years**.`,
      });
    } else {
      // If no High priority ECMs, find the one with shortest payback overall
      const validECMs = ecmResults.filter((ecm) => ecm.paybackPeriod !== Infinity);
      if (validECMs.length > 0) {
        const shortestPaybackECM = validECMs.reduce((best, current) =>
          current.paybackPeriod < best.paybackPeriod ? current : best
        );
        insights.push({
          text: `The highest-priority energy conservation measure is **${shortestPaybackECM.name}**, with an estimated payback of **${shortestPaybackECM.paybackPeriod.toFixed(1)} years**.`,
        });
      }
    }
  }

  // Insight 3: Total Potential Annual Savings
  if (ecmResults && ecmResults.length > 0) {
    const totalCostSavings = ecmResults.reduce(
      (sum, ecm) => sum + ecm.costSaved,
      0
    );
    insights.push({
      text: `If implemented, the identified measures represent an estimated **$${totalCostSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** in annual energy cost savings.`,
    });
  }

  // Insight 4: Savings as Percentage of Annual Cost
  if (ecmResults && ecmResults.length > 0 && annualEnergyCost !== null && annualEnergyCost > 0) {
    const totalCostSavings = ecmResults.reduce(
      (sum, ecm) => sum + ecm.costSaved,
      0
    );
    const savingsPercentage = (totalCostSavings / annualEnergyCost) * 100;
    insights.push({
      text: `This represents approximately **${savingsPercentage.toFixed(1)}%** of the building's estimated annual energy cost.`,
    });
  }

  // Insight 5: Optional - Largest Single Energy Savings ECM
  if (ecmResults && ecmResults.length > 0) {
    const largestEnergySavingsECM = ecmResults.reduce((best, current) =>
      current.energySaved > best.energySaved ? current : best
    );
    
    // Only include if there are multiple ECMs and this provides additional value
    if (ecmResults.length > 1) {
      insights.push({
        text: `The measure with the largest energy impact is **${largestEnergySavingsECM.name}**, which could save approximately **${Math.round(largestEnergySavingsECM.energySaved).toLocaleString()} kWh/year**.`,
      });
    }
  }

  return insights;
}
