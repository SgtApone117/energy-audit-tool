import type { BusinessType } from "../types";

/**
 * Static EUI benchmark ranges by building type.
 * These are reference ranges for typical buildings of each type.
 * Values are in kWh per square foot per year.
 * 
 * These ranges are indicative only and do not represent regulatory standards
 * or performance guarantees.
 */
export interface EUIBenchmarkRange {
  min: number;
  max: number;
  label: string; // e.g., "Typical Office Buildings"
}

export const EUI_BENCHMARK_RANGES: Record<BusinessType, EUIBenchmarkRange> = {
  "Office": {
    min: 12,
    max: 18,
    label: "Typical Office Buildings",
  },
  "Retail": {
    min: 14,
    max: 22,
    label: "Typical Retail Buildings",
  },
  "Restaurant / Food Service": {
    min: 32,
    max: 48,
    label: "Typical Restaurant / Food Service Buildings",
  },
  "Grocery / Food Market": {
    min: 42,
    max: 62,
    label: "Typical Grocery / Food Market Buildings",
  },
  "Warehouse / Inventory": {
    min: 6,
    max: 14,
    label: "Typical Warehouse / Inventory Buildings",
  },
  "K–12 School": {
    min: 10,
    max: 18,
    label: "Typical K–12 School Buildings",
  },
  "Lodging / Hospitality": {
    min: 16,
    max: 26,
    label: "Typical Lodging / Hospitality Buildings",
  },
  "Industrial Manufacturing": {
    min: 18,
    max: 32,
    label: "Typical Industrial Manufacturing Buildings",
  },
  "Other": {
    min: 12,
    max: 20,
    label: "Typical Commercial Buildings",
  },
};

/**
 * Determines the contextual performance label based on where the EUI falls
 * relative to the benchmark range.
 * Returns a non-judgmental label for context only.
 */
export function getEUIContextLabel(
  eui: number,
  range: EUIBenchmarkRange
): "Below Typical Range" | "Within Typical Range" | "Above Typical Range" {
  if (eui < range.min) {
    return "Below Typical Range";
  } else if (eui > range.max) {
    return "Above Typical Range";
  } else {
    return "Within Typical Range";
  }
}

