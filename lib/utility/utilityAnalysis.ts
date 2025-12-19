// Phase A: Utility Bill Analysis Functions

import {
  UtilityBillData,
  UtilityComparison,
  MonthlyUtilityData,
  THERM_TO_KWH,
} from "./types";

/**
 * Calculate totals from monthly utility data
 */
export function calculateUtilityTotals(monthlyData: MonthlyUtilityData[]): {
  totalElectricityKwh: number;
  totalElectricityCost: number;
  totalGasUsage: number;
  totalGasCost: number;
} {
  return monthlyData.reduce(
    (acc, month) => ({
      totalElectricityKwh: acc.totalElectricityKwh + (month.electricityKwh || 0),
      totalElectricityCost: acc.totalElectricityCost + (month.electricityCost || 0),
      totalGasUsage: acc.totalGasUsage + (month.gasUsage || 0),
      totalGasCost: acc.totalGasCost + (month.gasCost || 0),
    }),
    {
      totalElectricityKwh: 0,
      totalElectricityCost: 0,
      totalGasUsage: 0,
      totalGasCost: 0,
    }
  );
}

/**
 * Calculate actual EUI from utility data
 */
export function calculateActualEUI(
  totalElectricityKwh: number,
  totalGasUsage: number,
  floorArea: number
): { electricEUI: number; combinedEUI: number } {
  if (floorArea <= 0) {
    return { electricEUI: 0, combinedEUI: 0 };
  }

  const electricEUI = totalElectricityKwh / floorArea;
  const gasKwhEquivalent = totalGasUsage * THERM_TO_KWH;
  const combinedEUI = (totalElectricityKwh + gasKwhEquivalent) / floorArea;

  return { electricEUI, combinedEUI };
}

/**
 * Compare actual utility data to estimated baseline
 */
export function compareActualToEstimated(
  actualKwh: number,
  estimatedKwh: number,
  floorArea: number
): UtilityComparison {
  const varianceKwh = actualKwh - estimatedKwh;
  const variancePercent = estimatedKwh > 0 ? (varianceKwh / estimatedKwh) * 100 : 0;
  const actualEUI = floorArea > 0 ? actualKwh / floorArea : 0;
  const estimatedEUI = floorArea > 0 ? estimatedKwh / floorArea : 0;

  let assessmentNote: string;

  if (variancePercent < -20) {
    assessmentNote =
      "Actual usage is significantly lower than the benchmark estimate. This building appears to be performing better than typical buildings of this type.";
  } else if (variancePercent < -10) {
    assessmentNote =
      "Actual usage is moderately lower than estimated. The building is performing above average for its type.";
  } else if (variancePercent <= 10) {
    assessmentNote =
      "Actual usage is within the expected range of the benchmark estimate. The building is performing as expected for its type.";
  } else if (variancePercent <= 20) {
    assessmentNote =
      "Actual usage is moderately higher than estimated. There may be opportunities for energy efficiency improvements.";
  } else {
    assessmentNote =
      "Actual usage is significantly higher than the benchmark estimate. This suggests substantial opportunities for energy conservation measures.";
  }

  return {
    estimatedAnnualKwh: estimatedKwh,
    actualAnnualKwh: actualKwh,
    varianceKwh,
    variancePercent,
    estimatedEUI,
    actualEUI,
    assessmentNote,
  };
}

/**
 * Validate utility bill data completeness
 */
export function validateUtilityData(data: UtilityBillData): {
  isValid: boolean;
  electricityMonthsEntered: number;
  gasMonthsEntered: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let electricityMonthsEntered = 0;
  let gasMonthsEntered = 0;

  data.monthlyData.forEach((month) => {
    if (month.electricityKwh !== null && month.electricityKwh > 0) {
      electricityMonthsEntered++;
    }
    if (month.gasUsage !== null && month.gasUsage > 0) {
      gasMonthsEntered++;
    }
  });

  if (electricityMonthsEntered < 12 && electricityMonthsEntered > 0) {
    warnings.push(
      `Only ${electricityMonthsEntered} months of electricity data entered. A full 12 months provides the most accurate analysis.`
    );
  }

  if (gasMonthsEntered > 0 && gasMonthsEntered < 12) {
    warnings.push(
      `Only ${gasMonthsEntered} months of gas data entered. A full 12 months provides the most accurate analysis.`
    );
  }

  // Check for unusually high or low values
  const avgElectricity =
    electricityMonthsEntered > 0
      ? data.totalElectricityKwh / electricityMonthsEntered
      : 0;

  data.monthlyData.forEach((month) => {
    if (month.electricityKwh !== null && avgElectricity > 0) {
      if (month.electricityKwh > avgElectricity * 3) {
        warnings.push(
          `${month.month} electricity usage appears unusually high. Please verify.`
        );
      }
      if (month.electricityKwh < avgElectricity * 0.2 && month.electricityKwh > 0) {
        warnings.push(
          `${month.month} electricity usage appears unusually low. Please verify.`
        );
      }
    }
  });

  const isValid = electricityMonthsEntered >= 1;

  return {
    isValid,
    electricityMonthsEntered,
    gasMonthsEntered,
    warnings,
  };
}

/**
 * Calculate average electricity rate from actual bills
 */
export function calculateAverageElectricityRate(
  totalKwh: number,
  totalCost: number
): number {
  if (totalKwh <= 0) return 0.14; // Default rate
  return totalCost / totalKwh;
}

/**
 * Calculate average gas rate from actual bills
 */
export function calculateAverageGasRate(
  totalTherms: number,
  totalCost: number
): number {
  if (totalTherms <= 0) return 1.2; // Default rate per therm
  return totalCost / totalTherms;
}

/**
 * Annualize partial year data
 */
export function annualizePartialData(
  totalValue: number,
  monthsEntered: number
): number {
  if (monthsEntered <= 0) return 0;
  if (monthsEntered >= 12) return totalValue;
  return (totalValue / monthsEntered) * 12;
}

/**
 * Get seasonal analysis from monthly data
 */
export function analyzeSeasonalPatterns(monthlyData: MonthlyUtilityData[]): {
  summerAvg: number;
  winterAvg: number;
  shoulderAvg: number;
  peakMonth: string;
  peakUsage: number;
} {
  const summerMonths = ["June", "July", "August"];
  const winterMonths = ["December", "January", "February"];
  const shoulderMonths = ["March", "April", "May", "September", "October", "November"];

  const getAvg = (months: string[]): number => {
    const values = monthlyData
      .filter((m) => months.includes(m.month) && m.electricityKwh !== null)
      .map((m) => m.electricityKwh as number);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  let peakMonth = "";
  let peakUsage = 0;
  monthlyData.forEach((m) => {
    if (m.electricityKwh !== null && m.electricityKwh > peakUsage) {
      peakUsage = m.electricityKwh;
      peakMonth = m.month;
    }
  });

  return {
    summerAvg: getAvg(summerMonths),
    winterAvg: getAvg(winterMonths),
    shoulderAvg: getAvg(shoulderMonths),
    peakMonth,
    peakUsage,
  };
}
