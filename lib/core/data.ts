import type { BusinessType, ECMDefinition } from "./types";

// Energy Use Intensity (EUI) lookup table: kWh per square foot per year
export const EUI_LOOKUP: Record<BusinessType, number> = {
  "Office": 14,
  "Retail": 17,
  "Restaurant / Food Service": 38,
  "Grocery / Food Market": 50,
  "Warehouse / Inventory": 9,
  "K–12 School": 13,
  "Lodging / Hospitality": 20,
  "Industrial Manufacturing": 24,
  "Other": 15,
};

// Default electricity rate: $0.15 per kWh
export const DEFAULT_ELECTRICITY_RATE = 0.15;

// End-use breakdown lookup table: percentage of total annual energy use by category
export const END_USE_BREAKDOWN: Record<BusinessType, Record<string, number>> = {
  "Office": {
    "Lighting": 0.35,
    "HVAC": 0.40,
    "Plug Loads": 0.25,
  },
  "Retail": {
    "Lighting": 0.45,
    "HVAC": 0.35,
    "Plug Loads": 0.20,
  },
  "Restaurant / Food Service": {
    "Lighting": 0.25,
    "HVAC": 0.35,
    "Plug Loads": 0.20,
    "Refrigeration": 0.20,
  },
  "Grocery / Food Market": {
    "Lighting": 0.25,
    "HVAC": 0.25,
    "Plug Loads": 0.10,
    "Refrigeration": 0.40,
  },
  "Warehouse / Inventory": {
    "Lighting": 0.55,
    "HVAC": 0.25,
    "Plug Loads": 0.20,
  },
  "K–12 School": {
    "Lighting": 0.30,
    "HVAC": 0.45,
    "Plug Loads": 0.25,
  },
  "Lodging / Hospitality": {
    "Lighting": 0.30,
    "HVAC": 0.45,
    "Plug Loads": 0.25,
  },
  "Industrial Manufacturing": {
    "Lighting": 0.20,
    "HVAC": 0.30,
    "Plug Loads": 0.20,
    "Process": 0.30,
  },
  "Other": {
    "Lighting": 0.33,
    "HVAC": 0.33,
    "Plug Loads": 0.34,
  },
};

// Energy Conservation Measures (ECM) definitions
export const ECM_DEFINITIONS: ECMDefinition[] = [
  {
    name: "LED Lighting Upgrade",
    savingsPercentage: 0.40, // 40% of Lighting energy
    costPerSqFt: 1.50,
    endUseCategory: "Lighting",
  },
  {
    name: "HVAC Optimization (Scheduling + Tune-up)",
    savingsPercentage: 0.12, // 12% of HVAC energy
    costPerSqFt: 0.20,
    endUseCategory: "HVAC",
  },
  {
    name: "Weatherization (Envelope Improvements)",
    savingsPercentage: 0.06, // 6% of HVAC energy
    costPerSqFt: 0.50,
    endUseCategory: "HVAC",
  },
  {
    name: "Plug Load Reduction",
    savingsPercentage: 0.06, // 6% of Plug Loads energy
    costPerSqFt: 0.10,
    endUseCategory: "Plug Loads",
  },
];

