// Phase A: Utility Bill Types

export interface MonthlyUtilityData {
  month: string; // e.g., "January", "February"
  electricityKwh: number | null;
  electricityCost: number | null;
  gasUsage: number | null; // therms
  gasCost: number | null;
}

export interface UtilityBillData {
  hasActualData: boolean;
  monthlyData: MonthlyUtilityData[];
  // Calculated totals
  totalElectricityKwh: number;
  totalElectricityCost: number;
  totalGasUsage: number; // therms
  totalGasCost: number;
  // Derived metrics
  actualEUI: number | null; // kWh/sq ft/year (electricity only)
  combinedEUI: number | null; // kWh-equivalent/sq ft/year (electricity + gas)
}

export interface UtilityComparison {
  estimatedAnnualKwh: number;
  actualAnnualKwh: number;
  varianceKwh: number;
  variancePercent: number;
  estimatedEUI: number;
  actualEUI: number;
  assessmentNote: string;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type Month = (typeof MONTHS)[number];

// Gas to electricity conversion: 1 therm = 29.3 kWh
export const THERM_TO_KWH = 29.3;

export function createEmptyUtilityData(): UtilityBillData {
  return {
    hasActualData: false,
    monthlyData: MONTHS.map((month) => ({
      month,
      electricityKwh: null,
      electricityCost: null,
      gasUsage: null,
      gasCost: null,
    })),
    totalElectricityKwh: 0,
    totalElectricityCost: 0,
    totalGasUsage: 0,
    totalGasCost: 0,
    actualEUI: null,
    combinedEUI: null,
  };
}
