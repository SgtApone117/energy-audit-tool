/**
 * Enhanced ECM (Energy Conservation Measures) Definitions
 * 
 * Includes:
 * - Expanded list of common ECMs
 * - Typical utility rebates
 * - Interactive effects between measures
 * - Confidence ranges for savings estimates
 * - Applicability by building type
 */

import type { BusinessType } from "../types";

export interface EnhancedECMDefinition {
  id: string;
  name: string;
  description: string;
  endUseCategory: "Lighting" | "HVAC" | "Plug Loads" | "Refrigeration" | "Process" | "Building Envelope";
  
  // Savings parameters
  savingsPercentage: {
    low: number;    // Conservative estimate
    typical: number; // Most likely
    high: number;   // Optimistic estimate
  };
  
  // Cost parameters
  costPerSqFt: {
    low: number;
    typical: number;
    high: number;
  };
  
  // Typical utility rebate ($/sqft or $/unit)
  typicalRebate: {
    amount: number;
    unit: "per_sqft" | "per_unit" | "percentage";
    notes: string;
  };
  
  // Interactive effects with other ECMs
  interactiveEffects: {
    affectedCategory?: string;  // Which category is affected
    effectMultiplier?: number;  // How much the effect is (e.g., 0.85 means 15% reduction)
    description?: string;
  }[];
  
  // Which building types this ECM applies to
  applicableBusinessTypes: BusinessType[] | "all";
  
  // Implementation details
  implementationComplexity: "Low" | "Medium" | "High";
  typicalLifespan: number; // years
}

export const ENHANCED_ECM_DEFINITIONS: EnhancedECMDefinition[] = [
  // ============= LIGHTING ECMs =============
  {
    id: "led-upgrade",
    name: "LED Lighting Upgrade",
    description: "Replace existing fluorescent or HID fixtures with LED technology",
    endUseCategory: "Lighting",
    savingsPercentage: { low: 0.30, typical: 0.45, high: 0.60 },
    costPerSqFt: { low: 1.00, typical: 1.50, high: 2.50 },
    typicalRebate: {
      amount: 0.40,
      unit: "per_sqft",
      notes: "Many utilities offer $2-5 per fixture or $0.30-0.50/sqft",
    },
    interactiveEffects: [
      {
        affectedCategory: "HVAC",
        effectMultiplier: 0.92, // Reduces cooling load by ~8%
        description: "LEDs produce less heat, reducing cooling requirements",
      },
    ],
    applicableBusinessTypes: "all",
    implementationComplexity: "Low",
    typicalLifespan: 15,
  },
  {
    id: "occupancy-sensors",
    name: "Occupancy/Vacancy Sensors",
    description: "Install motion sensors to automatically control lighting in intermittently occupied spaces",
    endUseCategory: "Lighting",
    savingsPercentage: { low: 0.15, typical: 0.25, high: 0.35 },
    costPerSqFt: { low: 0.15, typical: 0.25, high: 0.40 },
    typicalRebate: {
      amount: 0.10,
      unit: "per_sqft",
      notes: "Typically $10-25 per sensor rebate",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Office", "K–12 School", "Warehouse / Inventory", "Industrial Manufacturing"],
    implementationComplexity: "Low",
    typicalLifespan: 10,
  },
  {
    id: "daylighting-controls",
    name: "Daylighting Controls",
    description: "Install photocells or dimming systems to reduce artificial lighting when natural light is available",
    endUseCategory: "Lighting",
    savingsPercentage: { low: 0.20, typical: 0.30, high: 0.40 },
    costPerSqFt: { low: 0.30, typical: 0.50, high: 0.80 },
    typicalRebate: {
      amount: 0.15,
      unit: "per_sqft",
      notes: "Often bundled with LED rebates",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Office", "Retail", "K–12 School", "Warehouse / Inventory"],
    implementationComplexity: "Medium",
    typicalLifespan: 12,
  },

  // ============= HVAC ECMs =============
  {
    id: "hvac-tuneup",
    name: "HVAC Optimization & Tune-up",
    description: "Professional maintenance, refrigerant charge verification, coil cleaning, and controls optimization",
    endUseCategory: "HVAC",
    savingsPercentage: { low: 0.08, typical: 0.12, high: 0.18 },
    costPerSqFt: { low: 0.10, typical: 0.20, high: 0.35 },
    typicalRebate: {
      amount: 0.05,
      unit: "per_sqft",
      notes: "Some utilities offer tune-up rebates",
    },
    interactiveEffects: [],
    applicableBusinessTypes: "all",
    implementationComplexity: "Low",
    typicalLifespan: 3,
  },
  {
    id: "smart-thermostat",
    name: "Smart/Programmable Thermostat",
    description: "Install smart thermostats with scheduling, occupancy detection, and remote control",
    endUseCategory: "HVAC",
    savingsPercentage: { low: 0.08, typical: 0.12, high: 0.18 },
    costPerSqFt: { low: 0.05, typical: 0.10, high: 0.20 },
    typicalRebate: {
      amount: 0.03,
      unit: "per_sqft",
      notes: "Typically $50-100 per thermostat",
    },
    interactiveEffects: [],
    applicableBusinessTypes: "all",
    implementationComplexity: "Low",
    typicalLifespan: 8,
  },
  {
    id: "vfd-installation",
    name: "Variable Frequency Drives (VFDs)",
    description: "Install VFDs on fans and pumps to match motor speed to actual load requirements",
    endUseCategory: "HVAC",
    savingsPercentage: { low: 0.15, typical: 0.25, high: 0.35 },
    costPerSqFt: { low: 0.40, typical: 0.75, high: 1.20 },
    typicalRebate: {
      amount: 0.20,
      unit: "per_sqft",
      notes: "Typically $50-100 per HP rebate",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Office", "Retail", "K–12 School", "Lodging / Hospitality", "Industrial Manufacturing"],
    implementationComplexity: "Medium",
    typicalLifespan: 15,
  },
  {
    id: "ems-upgrade",
    name: "Energy Management System (EMS/BAS)",
    description: "Install or upgrade building automation system for centralized HVAC control and optimization",
    endUseCategory: "HVAC",
    savingsPercentage: { low: 0.10, typical: 0.18, high: 0.25 },
    costPerSqFt: { low: 1.50, typical: 2.50, high: 4.00 },
    typicalRebate: {
      amount: 0.50,
      unit: "per_sqft",
      notes: "Major utility programs often incentivize BAS",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Office", "Retail", "K–12 School", "Lodging / Hospitality", "Industrial Manufacturing"],
    implementationComplexity: "High",
    typicalLifespan: 15,
  },
  {
    id: "economizer-repair",
    name: "Economizer Repair/Installation",
    description: "Repair or install air-side economizers to use free cooling when outdoor conditions permit",
    endUseCategory: "HVAC",
    savingsPercentage: { low: 0.05, typical: 0.10, high: 0.15 },
    costPerSqFt: { low: 0.15, typical: 0.30, high: 0.50 },
    typicalRebate: {
      amount: 0.10,
      unit: "per_sqft",
      notes: "Often included in retro-commissioning programs",
    },
    interactiveEffects: [],
    applicableBusinessTypes: "all",
    implementationComplexity: "Medium",
    typicalLifespan: 15,
  },

  // ============= BUILDING ENVELOPE ECMs =============
  {
    id: "weatherization",
    name: "Weatherization & Air Sealing",
    description: "Seal air leaks around windows, doors, and penetrations; add weather stripping",
    endUseCategory: "Building Envelope",
    savingsPercentage: { low: 0.04, typical: 0.08, high: 0.12 },
    costPerSqFt: { low: 0.30, typical: 0.50, high: 0.80 },
    typicalRebate: {
      amount: 0.10,
      unit: "per_sqft",
      notes: "Often part of weatherization assistance programs",
    },
    interactiveEffects: [
      {
        affectedCategory: "HVAC",
        effectMultiplier: 0.94, // Reduces HVAC load by ~6%
        description: "Reduces infiltration losses, lowering heating/cooling demand",
      },
    ],
    applicableBusinessTypes: "all",
    implementationComplexity: "Low",
    typicalLifespan: 20,
  },
  {
    id: "window-film",
    name: "Window Film/Solar Control",
    description: "Apply reflective or low-E window film to reduce solar heat gain",
    endUseCategory: "Building Envelope",
    savingsPercentage: { low: 0.03, typical: 0.06, high: 0.10 },
    costPerSqFt: { low: 0.20, typical: 0.35, high: 0.55 },
    typicalRebate: {
      amount: 0.08,
      unit: "per_sqft",
      notes: "Limited rebates available in some regions",
    },
    interactiveEffects: [
      {
        affectedCategory: "HVAC",
        effectMultiplier: 0.95,
        description: "Reduces cooling load from solar heat gain",
      },
    ],
    applicableBusinessTypes: ["Office", "Retail", "Restaurant / Food Service", "K–12 School"],
    implementationComplexity: "Low",
    typicalLifespan: 15,
  },
  {
    id: "roof-insulation",
    name: "Roof/Ceiling Insulation Upgrade",
    description: "Add or upgrade roof insulation to reduce heat transfer",
    endUseCategory: "Building Envelope",
    savingsPercentage: { low: 0.05, typical: 0.10, high: 0.15 },
    costPerSqFt: { low: 0.80, typical: 1.50, high: 2.50 },
    typicalRebate: {
      amount: 0.25,
      unit: "per_sqft",
      notes: "Available in many utility programs",
    },
    interactiveEffects: [
      {
        affectedCategory: "HVAC",
        effectMultiplier: 0.90,
        description: "Significantly reduces heating and cooling loads",
      },
    ],
    applicableBusinessTypes: "all",
    implementationComplexity: "Medium",
    typicalLifespan: 25,
  },

  // ============= PLUG LOAD ECMs =============
  {
    id: "plug-load-management",
    name: "Plug Load Management",
    description: "Install smart power strips and policies to reduce phantom loads and after-hours equipment use",
    endUseCategory: "Plug Loads",
    savingsPercentage: { low: 0.04, typical: 0.08, high: 0.12 },
    costPerSqFt: { low: 0.05, typical: 0.10, high: 0.18 },
    typicalRebate: {
      amount: 0.03,
      unit: "per_sqft",
      notes: "Smart strip rebates typically $5-15 each",
    },
    interactiveEffects: [
      {
        affectedCategory: "HVAC",
        effectMultiplier: 0.98,
        description: "Less equipment heat reduces cooling slightly",
      },
    ],
    applicableBusinessTypes: ["Office", "K–12 School", "Retail"],
    implementationComplexity: "Low",
    typicalLifespan: 7,
  },
  {
    id: "energy-star-equipment",
    name: "ENERGY STAR Equipment Upgrade",
    description: "Replace old office equipment with ENERGY STAR rated models",
    endUseCategory: "Plug Loads",
    savingsPercentage: { low: 0.10, typical: 0.20, high: 0.30 },
    costPerSqFt: { low: 0.50, typical: 1.00, high: 2.00 },
    typicalRebate: {
      amount: 0.15,
      unit: "per_sqft",
      notes: "Equipment-specific rebates vary widely",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Office", "K–12 School"],
    implementationComplexity: "Low",
    typicalLifespan: 5,
  },

  // ============= REFRIGERATION ECMs =============
  {
    id: "refrigeration-controls",
    name: "Refrigeration Controls & Optimization",
    description: "Add floating head pressure controls, anti-sweat heater controls, and EC motors",
    endUseCategory: "Refrigeration",
    savingsPercentage: { low: 0.10, typical: 0.18, high: 0.25 },
    costPerSqFt: { low: 0.60, typical: 1.00, high: 1.60 },
    typicalRebate: {
      amount: 0.30,
      unit: "per_sqft",
      notes: "Strong utility incentives for grocery/food service",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Restaurant / Food Service", "Grocery / Food Market"],
    implementationComplexity: "Medium",
    typicalLifespan: 12,
  },
  {
    id: "case-lighting",
    name: "Display Case LED Lighting",
    description: "Replace fluorescent case lighting with LEDs in refrigerated display cases",
    endUseCategory: "Refrigeration",
    savingsPercentage: { low: 0.05, typical: 0.08, high: 0.12 },
    costPerSqFt: { low: 0.25, typical: 0.45, high: 0.70 },
    typicalRebate: {
      amount: 0.15,
      unit: "per_sqft",
      notes: "LED rebates apply to case lighting",
    },
    interactiveEffects: [
      {
        affectedCategory: "Refrigeration",
        effectMultiplier: 0.97,
        description: "Less heat from LEDs reduces compressor load",
      },
    ],
    applicableBusinessTypes: ["Grocery / Food Market", "Restaurant / Food Service"],
    implementationComplexity: "Low",
    typicalLifespan: 12,
  },
  {
    id: "night-covers",
    name: "Night Covers for Open Cases",
    description: "Install night covers on open refrigerated cases to reduce energy loss during closed hours",
    endUseCategory: "Refrigeration",
    savingsPercentage: { low: 0.08, typical: 0.15, high: 0.22 },
    costPerSqFt: { low: 0.15, typical: 0.30, high: 0.50 },
    typicalRebate: {
      amount: 0.10,
      unit: "per_sqft",
      notes: "Available in some utility programs",
    },
    interactiveEffects: [],
    applicableBusinessTypes: ["Grocery / Food Market"],
    implementationComplexity: "Low",
    typicalLifespan: 8,
  },
];

/**
 * Get ECMs applicable to a specific business type
 */
export function getApplicableECMs(businessType: BusinessType): EnhancedECMDefinition[] {
  return ENHANCED_ECM_DEFINITIONS.filter(ecm => 
    ecm.applicableBusinessTypes === "all" || 
    ecm.applicableBusinessTypes.includes(businessType)
  );
}

/**
 * Get ECMs for a specific end-use category
 */
export function getECMsByCategory(category: string): EnhancedECMDefinition[] {
  return ENHANCED_ECM_DEFINITIONS.filter(ecm => ecm.endUseCategory === category);
}
