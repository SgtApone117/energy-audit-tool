import type { BusinessType, ConstructionYear, ECMResult } from "./types";
import { EUI_LOOKUP, DEFAULT_ELECTRICITY_RATE, END_USE_BREAKDOWN, ECM_DEFINITIONS } from "./data";
import { getClimateAdjustment, getClimateZoneInfo, ClimateZoneInfo } from "./data/climateZones";
import { getStateFromZip } from "./data/zipToState";
import { getUtilityRates, UtilityRates } from "./data/utilityRates";

/**
 * Construction year adjustment factors.
 * Older buildings typically have less efficient envelopes and equipment.
 */
export const CONSTRUCTION_YEAR_ADJUSTMENTS: Record<ConstructionYear, number> = {
  "Before 2000": 1.15,  // +15% for older buildings
  "2000–2010": 1.0,     // Baseline
  "After 2010": 0.90,   // -10% for newer, more efficient buildings
};

/**
 * Get the construction year adjustment factor.
 * Returns 1.0 (no adjustment) if construction year is not provided.
 */
export function getConstructionYearAdjustment(constructionYear: ConstructionYear | ""): number {
  if (!constructionYear) {
    return 1.0;
  }
  return CONSTRUCTION_YEAR_ADJUSTMENTS[constructionYear] || 1.0;
}

export interface EnergyCalculationOptions {
  constructionYear?: ConstructionYear | "";
  zipCode?: string;
}

export interface EnergyCalculationResult {
  baseEUI: number;
  adjustedEUI: number;
  annualEnergyUse: number;
  constructionAdjustment: number;
  climateAdjustment: number;
  climateZone: ClimateZoneInfo | null;
  stateCode: string | null;
  utilityRates: UtilityRates;
}

/**
 * Calculate annual energy use with adjustments for construction year and climate zone.
 * 
 * @param businessType - The type of business/building
 * @param floorArea - Floor area in square feet
 * @param options - Optional adjustments (construction year, ZIP code)
 * @returns Detailed calculation result or null if inputs are invalid
 */
export function calculateAnnualEnergyUseWithAdjustments(
  businessType: BusinessType | "",
  floorArea: string,
  options: EnergyCalculationOptions = {}
): EnergyCalculationResult | null {
  if (!businessType || !floorArea) {
    return null;
  }

  const baseEUI = EUI_LOOKUP[businessType];
  if (!baseEUI) {
    return null;
  }

  const area = parseFloat(floorArea);
  if (isNaN(area) || area <= 0) {
    return null;
  }

  // Get construction year adjustment
  const constructionAdjustment = getConstructionYearAdjustment(options.constructionYear || "");

  // Get climate zone and adjustment from ZIP code
  const stateCode = options.zipCode ? getStateFromZip(options.zipCode) : null;
  const climateAdjustment = stateCode ? getClimateAdjustment(stateCode) : 1.0;
  const climateZone = stateCode ? getClimateZoneInfo(stateCode) : null;

  // Get utility rates based on state
  const utilityRates = stateCode ? getUtilityRates(stateCode) : getUtilityRates("US_AVG");

  // Calculate adjusted EUI
  const adjustedEUI = baseEUI * constructionAdjustment * climateAdjustment;

  // Calculate annual energy use
  const annualEnergyUse = adjustedEUI * area;

  return {
    baseEUI,
    adjustedEUI,
    annualEnergyUse,
    constructionAdjustment,
    climateAdjustment,
    climateZone,
    stateCode,
    utilityRates,
  };
}

/**
 * Simple annual energy use calculation (backwards compatible).
 * Uses adjustments if construction year and ZIP are provided.
 */
export function calculateAnnualEnergyUse(
  businessType: BusinessType | "",
  floorArea: string,
  options?: EnergyCalculationOptions
): number | null {
  if (options?.constructionYear || options?.zipCode) {
    const result = calculateAnnualEnergyUseWithAdjustments(businessType, floorArea, options);
    return result?.annualEnergyUse ?? null;
  }

  // Original simple calculation for backwards compatibility
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

/**
 * Calculate annual energy cost.
 * Uses state-based electricity rate if stateCode is provided,
 * otherwise falls back to DEFAULT_ELECTRICITY_RATE.
 */
export function calculateAnnualEnergyCost(
  annualEnergyUse: number | null,
  stateCode?: string | null
): number | null {
  if (annualEnergyUse === null) {
    return null;
  }

  const rate = stateCode 
    ? getUtilityRates(stateCode).electricity 
    : DEFAULT_ELECTRICITY_RATE;

  return annualEnergyUse * rate;
}

/**
 * Get the effective electricity rate being used for calculations.
 */
export function getEffectiveElectricityRate(stateCode?: string | null): number {
  return stateCode 
    ? getUtilityRates(stateCode).electricity 
    : DEFAULT_ELECTRICITY_RATE;
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

/**
 * Enhanced energy breakdown that integrates equipment inventory data.
 * 
 * When equipment data is provided, uses calculated values from actual equipment.
 * Falls back to percentage-based defaults for missing categories.
 */
export interface EnhancedBreakdownResult {
  breakdown: Record<string, number>;
  sources: Record<string, "equipment" | "estimated">;
  totalFromEquipment: number;
  totalEstimated: number;
  hasEquipmentData: boolean;
}

export function calculateEnhancedEndUseBreakdown(
  businessType: BusinessType | "",
  annualEnergyUse: number | null,
  equipmentData?: {
    estimatedAnnualHVACKwh: number;
    estimatedAnnualLightingKwh: number;
    estimatedAnnualEquipmentKwh: number;
    hasEquipmentData: boolean;
  } | null
): EnhancedBreakdownResult | null {
  if (!businessType || annualEnergyUse === null) {
    return null;
  }

  const defaultBreakdown = END_USE_BREAKDOWN[businessType];
  if (!defaultBreakdown) {
    return null;
  }

  const breakdown: Record<string, number> = {};
  const sources: Record<string, "equipment" | "estimated"> = {};
  let totalFromEquipment = 0;

  // Check if we have meaningful equipment data
  const hasEquipment = equipmentData?.hasEquipmentData && (
    equipmentData.estimatedAnnualHVACKwh > 0 ||
    equipmentData.estimatedAnnualLightingKwh > 0 ||
    equipmentData.estimatedAnnualEquipmentKwh > 0
  );

  for (const [category, percentage] of Object.entries(defaultBreakdown)) {
    if (hasEquipment && equipmentData) {
      // Use equipment-calculated values where available
      if (category === "HVAC" && equipmentData.estimatedAnnualHVACKwh > 0) {
        breakdown[category] = equipmentData.estimatedAnnualHVACKwh;
        sources[category] = "equipment";
        totalFromEquipment += equipmentData.estimatedAnnualHVACKwh;
      } else if (category === "Lighting" && equipmentData.estimatedAnnualLightingKwh > 0) {
        breakdown[category] = equipmentData.estimatedAnnualLightingKwh;
        sources[category] = "equipment";
        totalFromEquipment += equipmentData.estimatedAnnualLightingKwh;
      } else if (
        (category === "Plug Loads" || category === "Process" || category === "Refrigeration") &&
        equipmentData.estimatedAnnualEquipmentKwh > 0
      ) {
        // Map "Other Equipment" to relevant categories
        breakdown[category] = equipmentData.estimatedAnnualEquipmentKwh;
        sources[category] = "equipment";
        totalFromEquipment += equipmentData.estimatedAnnualEquipmentKwh;
      } else {
        // Fall back to percentage-based estimate
        breakdown[category] = annualEnergyUse * percentage;
        sources[category] = "estimated";
      }
    } else {
      // No equipment data - use default percentages
      breakdown[category] = annualEnergyUse * percentage;
      sources[category] = "estimated";
    }
  }

  return {
    breakdown,
    sources,
    totalFromEquipment,
    totalEstimated: annualEnergyUse,
    hasEquipmentData: hasEquipment || false,
  };
}

/**
 * Calculate Energy Conservation Measures (ECMs) with their savings and payback.
 * Uses state-based electricity rate if stateCode is provided.
 */
export function calculateECMs(
  endUseBreakdown: Record<string, number> | null,
  floorArea: string,
  stateCode?: string | null
): ECMResult[] | null {
  if (!endUseBreakdown || !floorArea) {
    return null;
  }

  const area = parseFloat(floorArea);
  if (isNaN(area) || area <= 0) {
    return null;
  }

  const electricityRate = getEffectiveElectricityRate(stateCode);
  const results: ECMResult[] = [];

  for (const ecm of ECM_DEFINITIONS) {
    const categoryEnergy = endUseBreakdown[ecm.endUseCategory];
    if (!categoryEnergy || categoryEnergy <= 0) {
      // Skip ECM if the category doesn't exist for this building type
      continue;
    }

    const energySaved = categoryEnergy * ecm.savingsPercentage;
    const costSaved = energySaved * electricityRate;
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

