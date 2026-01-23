// Phase B: Operating Schedule Calculations

import {
  OperatingScheduleData,
  WeeklySchedule,
  DailySchedule,
  DAYS_OF_WEEK,
  DayOfWeek,
} from "./types";

/**
 * Calculate hours for a single day
 */
export function calculateDailyHours(schedule: DailySchedule): number {
  if (!schedule.isOpen) return 0;
  if (schedule.endHour === 24 && schedule.startHour === 0) return 24; // 24-hour operation
  if (schedule.endHour <= schedule.startHour) return 0;
  return schedule.endHour - schedule.startHour;
}

/**
 * Calculate total hours per week from weekly schedule
 */
export function calculateWeeklyHours(weeklySchedule: WeeklySchedule): number {
  return DAYS_OF_WEEK.reduce((total, day) => {
    return total + calculateDailyHours(weeklySchedule[day]);
  }, 0);
}

/**
 * Calculate number of operating days per week
 */
export function calculateDaysPerWeek(weeklySchedule: WeeklySchedule): number {
  return DAYS_OF_WEEK.filter((day) => weeklySchedule[day].isOpen).length;
}

/**
 * Calculate annual operating hours (accounting for holidays)
 */
export function calculateAnnualOperatingHours(
  hoursPerWeek: number,
  holidaysPerYear: number = 10
): number {
  const weeksPerYear = 52;
  const holidayHoursReduction = (hoursPerWeek / 7) * holidaysPerYear;
  return hoursPerWeek * weeksPerYear - holidayHoursReduction;
}

/**
 * Calculate schedule data metrics
 */
export function calculateScheduleMetrics(
  weeklySchedule: WeeklySchedule
): Pick<OperatingScheduleData, "hoursPerWeek" | "daysPerWeek" | "annualOperatingHours"> {
  const hoursPerWeek = calculateWeeklyHours(weeklySchedule);
  const daysPerWeek = calculateDaysPerWeek(weeklySchedule);
  const annualOperatingHours = calculateAnnualOperatingHours(hoursPerWeek);

  return {
    hoursPerWeek,
    daysPerWeek,
    annualOperatingHours,
  };
}

/**
 * Calculate energy adjustment factor based on operating schedule
 * Compares to a "standard" operating schedule for the business type
 */
export function calculateScheduleAdjustmentFactor(
  actualHoursPerWeek: number,
  standardHoursPerWeek: number
): number {
  if (standardHoursPerWeek <= 0) return 1.0;

  // Base load factor (energy used even when closed - HVAC setback, refrigeration, etc.)
  const baseLoadFactor = 0.3;

  // Operating load factor
  const operatingLoadFactor = 0.7;

  const hoursRatio = actualHoursPerWeek / standardHoursPerWeek;

  // Adjustment = base load + (operating load * hours ratio)
  return baseLoadFactor + operatingLoadFactor * hoursRatio;
}

/**
 * Get standard operating hours by business type
 */
export function getStandardHoursPerWeek(businessType: string): number {
  const standardHours: Record<string, number> = {
    "Office": 50, // 10 hrs x 5 days
    "Retail": 70, // 10 hrs x 7 days
    "Restaurant / Food Service": 84, // 12 hrs x 7 days
    "Grocery / Food Market": 105, // 15 hrs x 7 days
    "Warehouse / Inventory": 60, // 10 hrs x 6 days
    "K–12 School": 45, // 9 hrs x 5 days
    "Lodging / Hospitality": 168, // 24/7
    "Industrial Manufacturing": 80, // 16 hrs x 5 days
    "Other": 50,
  };

  return standardHours[businessType] || 50;
}

/**
 * Calculate HVAC adjustment based on seasonal variations
 */
export function calculateSeasonalHVACAdjustment(
  seasonalVariations: OperatingScheduleData["seasonalVariations"]
): number {
  // Weight by approximate season length
  const weights = { "Summer": 3, "Winter": 3, "Spring/Fall": 6 };

  let totalWeight = 0;
  let weightedSum = 0;

  seasonalVariations.forEach((sv) => {
    const weight = weights[sv.season] || 1;
    totalWeight += weight;
    weightedSum += sv.hvacIntensityMultiplier * weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
}

/**
 * Calculate occupancy-adjusted energy use
 */
export function calculateOccupancyAdjustedEnergy(
  baseEnergyKwh: number,
  averageOccupancyRate: number
): number {
  // Minimum load factor even at 0% occupancy (HVAC setback, always-on equipment)
  const minimumLoadFactor = 0.4;

  const adjustedFactor = minimumLoadFactor + (1 - minimumLoadFactor) * averageOccupancyRate;
  return baseEnergyKwh * adjustedFactor;
}

/**
 * Get schedule summary text
 */
export function getScheduleSummary(scheduleData: OperatingScheduleData): string {
  const { hoursPerWeek, daysPerWeek, annualOperatingHours } = scheduleData;

  if (hoursPerWeek >= 168) {
    return "24/7 operation";
  }

  if (daysPerWeek === 7) {
    const avgHoursPerDay = Math.round(hoursPerWeek / 7);
    return `${avgHoursPerDay} hours/day, 7 days/week (~${annualOperatingHours.toLocaleString()} hours/year)`;
  }

  const avgHoursPerDay = daysPerWeek > 0 ? Math.round(hoursPerWeek / daysPerWeek) : 0;
  return `${avgHoursPerDay} hours/day, ${daysPerWeek} days/week (~${annualOperatingHours.toLocaleString()} hours/year)`;
}

/**
 * Calculate end-use breakdown adjustments based on schedule
 */
export function adjustEndUseBreakdownForSchedule(
  baseBreakdown: Record<string, number>,
  scheduleData: OperatingScheduleData,
  businessType: string
): Record<string, number> {
  const standardHours = getStandardHoursPerWeek(businessType);
  const scheduleFactor = calculateScheduleAdjustmentFactor(
    scheduleData.hoursPerWeek,
    standardHours
  );
  const hvacFactor = calculateSeasonalHVACAdjustment(scheduleData.seasonalVariations);

  const adjustedBreakdown: Record<string, number> = {};

  Object.entries(baseBreakdown).forEach(([category, value]) => {
    if (category === "HVAC") {
      adjustedBreakdown[category] = value * scheduleFactor * hvacFactor;
    } else if (category === "Lighting") {
      adjustedBreakdown[category] = value * scheduleFactor;
    } else if (category === "Refrigeration") {
      // Refrigeration runs 24/7 regardless of schedule
      adjustedBreakdown[category] = value;
    } else {
      // Plug loads, process, etc. scale with occupancy
      adjustedBreakdown[category] = value * scheduleData.averageOccupancyRate;
    }
  });

  return adjustedBreakdown;
}
