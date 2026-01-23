/**
 * Climate zone definitions and adjustments for EUI calculations.
 * 
 * Based on ASHRAE Climate Zones (simplified to 5 zones):
 * - Hot: Zones 1-2 (FL, HI, TX coast, AZ desert)
 * - Warm: Zone 3 (CA coast, GA, NC, SC)
 * - Mixed: Zone 4 (Mid-Atlantic, TN, OK)
 * - Cool: Zone 5 (Northern states, CO, UT)
 * - Cold: Zones 6-7 (MN, WI, MT, AK, New England mountains)
 * 
 * Climate significantly affects HVAC loads - hot and cold climates
 * require more heating/cooling energy than moderate climates.
 */

export type ClimateZone = "Hot" | "Warm" | "Mixed" | "Cool" | "Cold";

export interface ClimateZoneInfo {
  zone: ClimateZone;
  adjustment: number; // Multiplier for EUI (1.0 = no adjustment)
  description: string;
}

/**
 * Climate zone adjustments for energy calculations.
 * Mixed climate (Zone 4) is the baseline (1.0 adjustment).
 */
export const CLIMATE_ZONE_ADJUSTMENTS: Record<ClimateZone, ClimateZoneInfo> = {
  "Hot": {
    zone: "Hot",
    adjustment: 1.15, // +15% for high cooling loads
    description: "High cooling demand",
  },
  "Warm": {
    zone: "Warm",
    adjustment: 1.05, // +5% slightly above average
    description: "Moderate cooling demand",
  },
  "Mixed": {
    zone: "Mixed",
    adjustment: 1.0, // Baseline
    description: "Balanced heating and cooling",
  },
  "Cool": {
    zone: "Cool",
    adjustment: 1.10, // +10% for heating
    description: "Moderate heating demand",
  },
  "Cold": {
    zone: "Cold",
    adjustment: 1.20, // +20% for high heating loads
    description: "High heating demand",
  },
};

/**
 * State to climate zone mapping.
 * Some states span multiple zones; we use the predominant zone.
 */
export const STATE_CLIMATE_ZONES: Record<string, ClimateZone> = {
  // Hot Climate States
  "FL": "Hot",
  "HI": "Hot",
  "PR": "Hot",
  
  // Warm Climate States
  "TX": "Warm",
  "LA": "Warm",
  "MS": "Warm",
  "AL": "Warm",
  "GA": "Warm",
  "SC": "Warm",
  "AZ": "Hot",
  "NV": "Warm",
  "NM": "Warm",
  
  // Mixed Climate States
  "NC": "Mixed",
  "TN": "Mixed",
  "AR": "Mixed",
  "OK": "Mixed",
  "KS": "Mixed",
  "MO": "Mixed",
  "KY": "Mixed",
  "VA": "Mixed",
  "WV": "Mixed",
  "MD": "Mixed",
  "DE": "Mixed",
  "DC": "Mixed",
  "NJ": "Mixed",
  "CA": "Warm", // Predominantly warm, coastal influence
  
  // Cool Climate States
  "CO": "Cool",
  "UT": "Cool",
  "ID": "Cool",
  "OR": "Cool",
  "WA": "Cool",
  "NE": "Cool",
  "IA": "Cool",
  "IL": "Cool",
  "IN": "Cool",
  "OH": "Cool",
  "PA": "Cool",
  "NY": "Cool",
  "CT": "Cool",
  "RI": "Cool",
  "MA": "Cool",
  
  // Cold Climate States
  "MT": "Cold",
  "WY": "Cold",
  "ND": "Cold",
  "SD": "Cold",
  "MN": "Cold",
  "WI": "Cold",
  "MI": "Cold",
  "VT": "Cold",
  "NH": "Cold",
  "ME": "Cold",
  "AK": "Cold",
};

/**
 * Get climate zone for a state.
 * Returns "Mixed" as default if state not found.
 */
export function getClimateZone(stateCode: string): ClimateZone {
  const upperState = stateCode.toUpperCase();
  return STATE_CLIMATE_ZONES[upperState] || "Mixed";
}

/**
 * Get climate adjustment factor for a state.
 * Returns the multiplier to apply to EUI calculations.
 */
export function getClimateAdjustment(stateCode: string): number {
  const zone = getClimateZone(stateCode);
  return CLIMATE_ZONE_ADJUSTMENTS[zone].adjustment;
}

/**
 * Get full climate zone info for a state.
 */
export function getClimateZoneInfo(stateCode: string): ClimateZoneInfo {
  const zone = getClimateZone(stateCode);
  return CLIMATE_ZONE_ADJUSTMENTS[zone];
}
