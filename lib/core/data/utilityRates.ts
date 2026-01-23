/**
 * State-based utility rates for electricity and natural gas.
 * 
 * Sources:
 * - Electricity rates: EIA State Electricity Profiles (2023 averages)
 * - Natural gas rates: EIA Natural Gas Monthly (2023 averages)
 * 
 * All rates are residential/commercial averages and should be used
 * for estimation purposes only.
 */

export interface UtilityRates {
  electricity: number; // $/kWh
  gas: number; // $/therm
}

/**
 * Utility rates by state (2-letter abbreviation).
 * Electricity in $/kWh, Natural gas in $/therm.
 */
export const STATE_UTILITY_RATES: Record<string, UtilityRates> = {
  // Northeast
  "CT": { electricity: 0.26, gas: 1.65 },
  "ME": { electricity: 0.22, gas: 1.55 },
  "MA": { electricity: 0.28, gas: 1.60 },
  "NH": { electricity: 0.24, gas: 1.50 },
  "RI": { electricity: 0.27, gas: 1.55 },
  "VT": { electricity: 0.21, gas: 1.45 },
  "NJ": { electricity: 0.18, gas: 1.35 },
  "NY": { electricity: 0.22, gas: 1.40 },
  "PA": { electricity: 0.16, gas: 1.20 },
  
  // Southeast
  "DE": { electricity: 0.14, gas: 1.25 },
  "FL": { electricity: 0.14, gas: 1.80 },
  "GA": { electricity: 0.13, gas: 1.15 },
  "MD": { electricity: 0.15, gas: 1.30 },
  "NC": { electricity: 0.12, gas: 1.10 },
  "SC": { electricity: 0.14, gas: 1.20 },
  "VA": { electricity: 0.13, gas: 1.15 },
  "DC": { electricity: 0.15, gas: 1.35 },
  "WV": { electricity: 0.13, gas: 1.10 },
  
  // South
  "AL": { electricity: 0.14, gas: 1.20 },
  "KY": { electricity: 0.12, gas: 1.00 },
  "MS": { electricity: 0.13, gas: 1.15 },
  "TN": { electricity: 0.12, gas: 1.05 },
  "AR": { electricity: 0.12, gas: 1.00 },
  "LA": { electricity: 0.12, gas: 1.00 },
  "OK": { electricity: 0.12, gas: 0.95 },
  "TX": { electricity: 0.13, gas: 0.90 },
  
  // Midwest
  "IL": { electricity: 0.15, gas: 1.10 },
  "IN": { electricity: 0.14, gas: 1.00 },
  "MI": { electricity: 0.18, gas: 1.15 },
  "OH": { electricity: 0.14, gas: 1.05 },
  "WI": { electricity: 0.16, gas: 1.00 },
  "IA": { electricity: 0.14, gas: 0.95 },
  "KS": { electricity: 0.14, gas: 0.95 },
  "MN": { electricity: 0.15, gas: 0.90 },
  "MO": { electricity: 0.13, gas: 1.00 },
  "NE": { electricity: 0.12, gas: 0.85 },
  "ND": { electricity: 0.12, gas: 0.80 },
  "SD": { electricity: 0.13, gas: 0.85 },
  
  // Mountain West
  "AZ": { electricity: 0.14, gas: 1.25 },
  "CO": { electricity: 0.14, gas: 0.90 },
  "ID": { electricity: 0.11, gas: 1.00 },
  "MT": { electricity: 0.12, gas: 0.85 },
  "NV": { electricity: 0.13, gas: 1.20 },
  "NM": { electricity: 0.14, gas: 0.90 },
  "UT": { electricity: 0.11, gas: 0.95 },
  "WY": { electricity: 0.12, gas: 0.85 },
  
  // Pacific
  "AK": { electricity: 0.24, gas: 1.30 },
  "CA": { electricity: 0.27, gas: 1.50 },
  "HI": { electricity: 0.43, gas: 3.50 },
  "OR": { electricity: 0.12, gas: 1.10 },
  "WA": { electricity: 0.11, gas: 1.05 },
  
  // US Average fallback
  "US_AVG": { electricity: 0.15, gas: 1.10 },
};

/**
 * Get utility rates for a given state.
 * Falls back to US average if state is not found.
 */
export function getUtilityRates(stateCode: string): UtilityRates {
  const upperState = stateCode.toUpperCase();
  return STATE_UTILITY_RATES[upperState] || STATE_UTILITY_RATES["US_AVG"];
}

/**
 * Get the electricity rate for a given state ($/kWh).
 */
export function getElectricityRate(stateCode: string): number {
  return getUtilityRates(stateCode).electricity;
}

/**
 * Get the natural gas rate for a given state ($/therm).
 */
export function getGasRate(stateCode: string): number {
  return getUtilityRates(stateCode).gas;
}
