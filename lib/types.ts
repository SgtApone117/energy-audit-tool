export type BusinessType =
  | "Office"
  | "Retail"
  | "Restaurant / Food Service"
  | "Grocery / Food Market"
  | "Warehouse / Inventory"
  | "K–12 School"
  | "Lodging / Hospitality"
  | "Industrial Manufacturing"
  | "Other";

export type ConstructionYear = "Before 2000" | "2000–2010" | "After 2010";

export type PrimaryHeatingFuel = "Electric" | "Natural Gas" | "Fuel Oil" | "Propane";

export interface FormData {
  buildingName: string;
  businessType: BusinessType | "";
  floorArea: string;
  zipCode: string;
  constructionYear: ConstructionYear | "";
  primaryHeatingFuel: PrimaryHeatingFuel | "";
}

export interface ECMDefinition {
  name: string;
  savingsPercentage: number; // Percentage of the relevant end-use category
  costPerSqFt: number;
  endUseCategory: string; // Which end-use category this ECM affects
}

export interface ECMResult {
  name: string;
  energySaved: number; // kWh/year
  costSaved: number; // $/year
  implementationCost: number; // $
  paybackPeriod: number; // years
  priority: "High" | "Medium" | "Low";
}

// Re-export Phase A, B, C types for convenient importing
export * from "./utility/types";
export * from "./schedule/types";
export * from "./equipment/types";

