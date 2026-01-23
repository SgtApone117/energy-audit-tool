// Phase C: Equipment Inventory Types

// HVAC Equipment
export type HVACSystemType =
  | "Packaged Rooftop Unit"
  | "Split System"
  | "Chiller"
  | "Boiler"
  | "Heat Pump"
  | "Window AC"
  | "PTAC"
  | "VRF System"
  | "Furnace"
  | "Other";

export type HVACCondition = "Excellent" | "Good" | "Fair" | "Poor";

export interface HVACUnit {
  id: string;
  systemType: HVACSystemType;
  manufacturer?: string;
  modelNumber?: string;
  capacity: number; // tons for cooling, BTU/hr for heating
  capacityUnit: "tons" | "BTU/hr" | "kW";
  age: number; // years
  condition: HVACCondition;
  efficiencyRating?: number; // SEER, EER, AFUE, COP depending on type
  efficiencyUnit?: "SEER" | "EER" | "AFUE" | "COP" | "HSPF";
  fuelType: "Electric" | "Natural Gas" | "Fuel Oil" | "Propane";
  hasSmartThermostat: boolean;
  lastServiceDate?: string;
  notes?: string;
}

// Lighting Equipment
export type LightingFixtureType =
  | "LED"
  | "Fluorescent T8"
  | "Fluorescent T12"
  | "Fluorescent T5"
  | "CFL"
  | "Incandescent"
  | "Halogen"
  | "Metal Halide"
  | "High Pressure Sodium"
  | "Other";

export type LightingControlType =
  | "Manual Switch"
  | "Occupancy Sensor"
  | "Daylight Sensor"
  | "Timer"
  | "Dimmer"
  | "Smart Control"
  | "None";

export interface LightingZone {
  id: string;
  zoneName: string; // e.g., "Main Office", "Warehouse", "Parking Lot"
  fixtureType: LightingFixtureType;
  fixtureCount: number;
  wattsPerFixture: number;
  lampsPerFixture: number;
  controlType: LightingControlType;
  hoursPerDay: number;
  daysPerWeek: number;
  isExterior: boolean;
  notes?: string;
}

// Major Equipment (Refrigeration, Motors, etc.)
export type MajorEquipmentType =
  | "Walk-in Cooler"
  | "Walk-in Freezer"
  | "Display Case (Refrigerated)"
  | "Display Case (Frozen)"
  | "Ice Machine"
  | "Commercial Refrigerator"
  | "Commercial Freezer"
  | "Air Compressor"
  | "Electric Motor"
  | "Pump"
  | "Conveyor"
  | "Industrial Oven"
  | "Commercial Kitchen Equipment"
  | "Data Center / Server Room"
  | "Electric Vehicle Charger"
  | "Other";

export interface MajorEquipment {
  id: string;
  equipmentType: MajorEquipmentType;
  description: string;
  quantity: number;
  powerRating: number; // kW
  age: number; // years
  hoursPerDay: number;
  daysPerWeek: number;
  efficiencyRating?: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  hasVFD: boolean; // Variable Frequency Drive
  notes?: string;
}

// Complete Equipment Inventory
export interface EquipmentInventory {
  hasEquipmentData: boolean;
  hvacUnits: HVACUnit[];
  lightingZones: LightingZone[];
  majorEquipment: MajorEquipment[];
  // Calculated summaries
  totalHVACCapacity: number; // tons
  totalLightingWattage: number; // watts
  totalMajorEquipmentLoad: number; // kW
  estimatedAnnualHVACKwh: number;
  estimatedAnnualLightingKwh: number;
  estimatedAnnualEquipmentKwh: number;
}

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptyHVACUnit(): HVACUnit {
  return {
    id: generateId(),
    systemType: "Packaged Rooftop Unit",
    capacity: 0,
    capacityUnit: "tons",
    age: 0,
    condition: "Good",
    fuelType: "Electric",
    hasSmartThermostat: false,
  };
}

export function createEmptyLightingZone(): LightingZone {
  return {
    id: generateId(),
    zoneName: "",
    fixtureType: "LED",
    fixtureCount: 0,
    wattsPerFixture: 0,
    lampsPerFixture: 1,
    controlType: "Manual Switch",
    hoursPerDay: 8,
    daysPerWeek: 5,
    isExterior: false,
  };
}

export function createEmptyMajorEquipment(): MajorEquipment {
  return {
    id: generateId(),
    equipmentType: "Other",
    description: "",
    quantity: 1,
    powerRating: 0,
    age: 0,
    hoursPerDay: 8,
    daysPerWeek: 5,
    condition: "Good",
    hasVFD: false,
  };
}

export function createEmptyEquipmentInventory(): EquipmentInventory {
  return {
    hasEquipmentData: false,
    hvacUnits: [],
    lightingZones: [],
    majorEquipment: [],
    totalHVACCapacity: 0,
    totalLightingWattage: 0,
    totalMajorEquipmentLoad: 0,
    estimatedAnnualHVACKwh: 0,
    estimatedAnnualLightingKwh: 0,
    estimatedAnnualEquipmentKwh: 0,
  };
}

// Typical efficiency values for reference
export const HVAC_EFFICIENCY_BENCHMARKS: Record<HVACSystemType, { poor: number; average: number; good: number; unit: string }> = {
  "Packaged Rooftop Unit": { poor: 10, average: 14, good: 18, unit: "SEER" },
  "Split System": { poor: 10, average: 15, good: 20, unit: "SEER" },
  "Chiller": { poor: 0.8, average: 0.6, good: 0.5, unit: "kW/ton" },
  "Boiler": { poor: 75, average: 85, good: 95, unit: "AFUE" },
  "Heat Pump": { poor: 8, average: 10, good: 12, unit: "HSPF" },
  "Window AC": { poor: 8, average: 10, good: 12, unit: "EER" },
  "PTAC": { poor: 9, average: 11, good: 13, unit: "EER" },
  "VRF System": { poor: 14, average: 18, good: 22, unit: "SEER" },
  "Furnace": { poor: 80, average: 90, good: 96, unit: "AFUE" },
  "Other": { poor: 0, average: 0, good: 0, unit: "" },
};

export const LIGHTING_WATTAGE_TYPICAL: Record<LightingFixtureType, number> = {
  "LED": 15,
  "Fluorescent T8": 32,
  "Fluorescent T12": 40,
  "Fluorescent T5": 28,
  "CFL": 23,
  "Incandescent": 60,
  "Halogen": 50,
  "Metal Halide": 400,
  "High Pressure Sodium": 250,
  "Other": 50,
};
