/**
 * Enhanced ECM Calculations
 * 
 * Features:
 * - Multiple ECMs with confidence ranges
 * - Interactive effects between measures
 * - Utility rebate estimates
 * - Net cost after rebates
 */

import type { BusinessType } from "../types";
import { EnhancedECMDefinition, getApplicableECMs } from "./ecmDefinitions";

export interface EnhancedECMResult {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Savings with confidence ranges
  energySaved: {
    low: number;
    typical: number;
    high: number;
  };
  
  costSaved: {
    low: number;
    typical: number;
    high: number;
  };
  
  // Implementation costs
  implementationCost: {
    low: number;
    typical: number;
    high: number;
  };
  
  // Rebates
  estimatedRebate: number;
  rebateNotes: string;
  
  // Net cost after rebate
  netCost: {
    low: number;
    typical: number;
    high: number;
  };
  
  // Payback periods
  paybackPeriod: {
    low: number;    // Best case (high savings, low cost)
    typical: number;
    high: number;   // Worst case (low savings, high cost)
  };
  
  priority: "High" | "Medium" | "Low";
  complexity: "Low" | "Medium" | "High";
  lifespan: number;
  
  // Interactive effects info
  hasInteractiveEffects: boolean;
  interactiveNotes: string[];
}

export interface ECMCalculationSummary {
  ecms: EnhancedECMResult[];
  
  // Totals with ranges
  totalEnergySavings: {
    low: number;
    typical: number;
    high: number;
  };
  
  totalCostSavings: {
    low: number;
    typical: number;
    high: number;
  };
  
  totalImplementationCost: {
    low: number;
    typical: number;
    high: number;
  };
  
  totalRebates: number;
  
  totalNetCost: {
    low: number;
    typical: number;
    high: number;
  };
  
  blendedPayback: {
    low: number;
    typical: number;
    high: number;
  };
  
  // Interactive effects summary
  interactiveEffectsApplied: boolean;
  interactiveSavingsBonus: number;
}

/**
 * Calculate enhanced ECM results with confidence ranges and interactive effects
 */
export function calculateEnhancedECMs(
  businessType: BusinessType | "",
  endUseBreakdown: Record<string, number> | null,
  floorArea: number,
  electricityRate: number
): ECMCalculationSummary | null {
  if (!businessType || !endUseBreakdown || floorArea <= 0) {
    return null;
  }

  const applicableECMs = getApplicableECMs(businessType);
  const results: EnhancedECMResult[] = [];
  
  // Track interactive effects to apply later
  const interactiveMultipliers: Record<string, number> = {};
  const interactiveNotes: string[] = [];

  // First pass: Calculate base ECM savings
  for (const ecm of applicableECMs) {
    // Get category energy - handle Building Envelope specially (applies to HVAC)
    let categoryEnergy = endUseBreakdown[ecm.endUseCategory];
    if (ecm.endUseCategory === "Building Envelope") {
      categoryEnergy = endUseBreakdown["HVAC"] || 0;
    }
    
    if (!categoryEnergy || categoryEnergy <= 0) {
      continue;
    }

    // Calculate savings ranges
    const energySaved = {
      low: categoryEnergy * ecm.savingsPercentage.low,
      typical: categoryEnergy * ecm.savingsPercentage.typical,
      high: categoryEnergy * ecm.savingsPercentage.high,
    };

    const costSaved = {
      low: energySaved.low * electricityRate,
      typical: energySaved.typical * electricityRate,
      high: energySaved.high * electricityRate,
    };

    // Calculate implementation costs
    const implementationCost = {
      low: floorArea * ecm.costPerSqFt.low,
      typical: floorArea * ecm.costPerSqFt.typical,
      high: floorArea * ecm.costPerSqFt.high,
    };

    // Calculate rebates
    let estimatedRebate = 0;
    if (ecm.typicalRebate.unit === "per_sqft") {
      estimatedRebate = floorArea * ecm.typicalRebate.amount;
    } else if (ecm.typicalRebate.unit === "percentage") {
      estimatedRebate = implementationCost.typical * ecm.typicalRebate.amount;
    }

    // Net cost after rebate
    const netCost = {
      low: Math.max(0, implementationCost.low - estimatedRebate),
      typical: Math.max(0, implementationCost.typical - estimatedRebate),
      high: Math.max(0, implementationCost.high - estimatedRebate),
    };

    // Calculate payback periods (using net cost)
    const paybackPeriod = {
      low: costSaved.high > 0 ? netCost.low / costSaved.high : Infinity,    // Best case
      typical: costSaved.typical > 0 ? netCost.typical / costSaved.typical : Infinity,
      high: costSaved.low > 0 ? netCost.high / costSaved.low : Infinity,    // Worst case
    };

    // Determine priority based on typical payback
    let priority: "High" | "Medium" | "Low";
    if (paybackPeriod.typical < 2) {
      priority = "High";
    } else if (paybackPeriod.typical <= 4) {
      priority = "Medium";
    } else {
      priority = "Low";
    }

    // Track interactive effects
    const ecmInteractiveNotes: string[] = [];
    for (const effect of ecm.interactiveEffects) {
      if (effect.affectedCategory && effect.effectMultiplier) {
        // Store the multiplier for later application
        const existingMultiplier = interactiveMultipliers[effect.affectedCategory] || 1;
        interactiveMultipliers[effect.affectedCategory] = existingMultiplier * effect.effectMultiplier;
        
        if (effect.description) {
          ecmInteractiveNotes.push(effect.description);
          interactiveNotes.push(`${ecm.name}: ${effect.description}`);
        }
      }
    }

    results.push({
      id: ecm.id,
      name: ecm.name,
      description: ecm.description,
      category: ecm.endUseCategory,
      energySaved,
      costSaved,
      implementationCost,
      estimatedRebate,
      rebateNotes: ecm.typicalRebate.notes,
      netCost,
      paybackPeriod,
      priority,
      complexity: ecm.implementationComplexity,
      lifespan: ecm.typicalLifespan,
      hasInteractiveEffects: ecm.interactiveEffects.length > 0,
      interactiveNotes: ecmInteractiveNotes,
    });
  }

  // Sort by priority and payback
  results.sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.paybackPeriod.typical - b.paybackPeriod.typical;
  });

  // Calculate interactive savings bonus
  let interactiveSavingsBonus = 0;
  for (const [category, multiplier] of Object.entries(interactiveMultipliers)) {
    const categoryEnergy = endUseBreakdown[category] || 0;
    const reduction = categoryEnergy * (1 - multiplier);
    interactiveSavingsBonus += reduction * electricityRate;
  }

  // Calculate totals
  const totalEnergySavings = {
    low: results.reduce((sum, ecm) => sum + ecm.energySaved.low, 0),
    typical: results.reduce((sum, ecm) => sum + ecm.energySaved.typical, 0),
    high: results.reduce((sum, ecm) => sum + ecm.energySaved.high, 0),
  };

  const totalCostSavings = {
    low: results.reduce((sum, ecm) => sum + ecm.costSaved.low, 0),
    typical: results.reduce((sum, ecm) => sum + ecm.costSaved.typical, 0) + interactiveSavingsBonus,
    high: results.reduce((sum, ecm) => sum + ecm.costSaved.high, 0) + interactiveSavingsBonus,
  };

  const totalImplementationCost = {
    low: results.reduce((sum, ecm) => sum + ecm.implementationCost.low, 0),
    typical: results.reduce((sum, ecm) => sum + ecm.implementationCost.typical, 0),
    high: results.reduce((sum, ecm) => sum + ecm.implementationCost.high, 0),
  };

  const totalRebates = results.reduce((sum, ecm) => sum + ecm.estimatedRebate, 0);

  const totalNetCost = {
    low: results.reduce((sum, ecm) => sum + ecm.netCost.low, 0),
    typical: results.reduce((sum, ecm) => sum + ecm.netCost.typical, 0),
    high: results.reduce((sum, ecm) => sum + ecm.netCost.high, 0),
  };

  const blendedPayback = {
    low: totalCostSavings.high > 0 ? totalNetCost.low / totalCostSavings.high : Infinity,
    typical: totalCostSavings.typical > 0 ? totalNetCost.typical / totalCostSavings.typical : Infinity,
    high: totalCostSavings.low > 0 ? totalNetCost.high / totalCostSavings.low : Infinity,
  };

  return {
    ecms: results,
    totalEnergySavings,
    totalCostSavings,
    totalImplementationCost,
    totalRebates,
    totalNetCost,
    blendedPayback,
    interactiveEffectsApplied: Object.keys(interactiveMultipliers).length > 0,
    interactiveSavingsBonus,
  };
}

/**
 * Format payback period for display
 */
export function formatPaybackRange(payback: { low: number; typical: number; high: number }): string {
  if (payback.typical === Infinity) {
    return "N/A";
  }
  
  const formatYears = (years: number) => {
    if (years === Infinity) return "10+";
    if (years < 1) return `${Math.round(years * 12)} mo`;
    return `${years.toFixed(1)} yr`;
  };
  
  if (Math.abs(payback.high - payback.low) < 0.5) {
    return formatYears(payback.typical);
  }
  
  return `${formatYears(payback.low)} - ${formatYears(payback.high)}`;
}

/**
 * Format savings range for display
 */
export function formatSavingsRange(savings: { low: number; typical: number; high: number }): string {
  const formatValue = (val: number) => {
    if (val >= 10000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };
  
  return `${formatValue(savings.low)} - ${formatValue(savings.high)}`;
}

