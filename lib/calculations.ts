import type { BusinessType, ECMResult } from "./types";
import { EUI_LOOKUP, DEFAULT_ELECTRICITY_RATE, END_USE_BREAKDOWN, ECM_DEFINITIONS } from "./data";

export function calculateAnnualEnergyUse(
  businessType: BusinessType | "",
  floorArea: string
): number | null {
  if (!businessType || !floorArea) {
    return null;
  }

  const eui = EUI_LOOKUP[businessType];
  if (!eui) {
    return null;
  }

  const area = parseFloat(floorArea);
  if (isNaN(area) || area <= 0) {
    return null;
  }

  return eui * area;
}

export function calculateAnnualEnergyCost(annualEnergyUse: number | null): number | null {
  if (annualEnergyUse === null) {
    return null;
  }

  return annualEnergyUse * DEFAULT_ELECTRICITY_RATE;
}

export function calculateEndUseBreakdown(
  businessType: BusinessType | "",
  annualEnergyUse: number | null
): Record<string, number> | null {
  if (!businessType || annualEnergyUse === null) {
    return null;
  }

  const breakdown = END_USE_BREAKDOWN[businessType];
  if (!breakdown) {
    return null;
  }

  const result: Record<string, number> = {};
  for (const [category, percentage] of Object.entries(breakdown)) {
    result[category] = annualEnergyUse * percentage;
  }

  return result;
}

export function calculateECMs(
  endUseBreakdown: Record<string, number> | null,
  floorArea: string
): ECMResult[] | null {
  if (!endUseBreakdown || !floorArea) {
    return null;
  }

  const area = parseFloat(floorArea);
  if (isNaN(area) || area <= 0) {
    return null;
  }

  const results: ECMResult[] = [];

  for (const ecm of ECM_DEFINITIONS) {
    const categoryEnergy = endUseBreakdown[ecm.endUseCategory];
    if (!categoryEnergy || categoryEnergy <= 0) {
      // Skip ECM if the category doesn't exist for this building type
      continue;
    }

    const energySaved = categoryEnergy * ecm.savingsPercentage;
    const costSaved = energySaved * DEFAULT_ELECTRICITY_RATE;
    const implementationCost = area * ecm.costPerSqFt;
    const paybackPeriod = costSaved > 0 ? implementationCost / costSaved : Infinity;
    
    let priority: "High" | "Medium" | "Low";
    if (paybackPeriod < 2) {
      priority = "High";
    } else if (paybackPeriod <= 4) {
      priority = "Medium";
    } else {
      priority = "Low";
    }

    results.push({
      name: ecm.name,
      energySaved,
      costSaved,
      implementationCost,
      paybackPeriod,
      priority,
    });
  }

  return results.length > 0 ? results : null;
}

