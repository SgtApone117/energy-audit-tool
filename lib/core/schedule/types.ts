// Phase B: Operating Schedule Types

export interface DailySchedule {
  startHour: number; // 0-23
  endHour: number; // 0-23
  isOpen: boolean;
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

export interface SeasonalVariation {
  season: "Summer" | "Winter" | "Spring/Fall";
  occupancyMultiplier: number; // 0.0 to 1.5
  hvacIntensityMultiplier: number; // 0.5 to 2.0
}

export interface OperatingScheduleData {
  hasScheduleData: boolean;
  weeklySchedule: WeeklySchedule;
  seasonalVariations: SeasonalVariation[];
  // Calculated metrics
  hoursPerWeek: number;
  daysPerWeek: number;
  annualOperatingHours: number;
  averageOccupancyRate: number; // 0.0 to 1.0
}

export type DayOfWeek = keyof WeeklySchedule;

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

// Default schedules by business type
export function getDefaultSchedule(businessType: string): WeeklySchedule {
  const standardWeekday: DailySchedule = { startHour: 8, endHour: 18, isOpen: true };
  const standardWeekend: DailySchedule = { startHour: 0, endHour: 0, isOpen: false };
  const retailWeekend: DailySchedule = { startHour: 10, endHour: 18, isOpen: true };
  const restaurantSchedule: DailySchedule = { startHour: 10, endHour: 22, isOpen: true };
  const grocerySchedule: DailySchedule = { startHour: 7, endHour: 22, isOpen: true };
  const schoolSchedule: DailySchedule = { startHour: 7, endHour: 16, isOpen: true };
  const hotelSchedule: DailySchedule = { startHour: 0, endHour: 24, isOpen: true }; // 24/7

  switch (businessType) {
    case "Office":
      return {
        monday: standardWeekday,
        tuesday: standardWeekday,
        wednesday: standardWeekday,
        thursday: standardWeekday,
        friday: standardWeekday,
        saturday: standardWeekend,
        sunday: standardWeekend,
      };
    case "Retail":
      return {
        monday: { startHour: 10, endHour: 20, isOpen: true },
        tuesday: { startHour: 10, endHour: 20, isOpen: true },
        wednesday: { startHour: 10, endHour: 20, isOpen: true },
        thursday: { startHour: 10, endHour: 20, isOpen: true },
        friday: { startHour: 10, endHour: 21, isOpen: true },
        saturday: retailWeekend,
        sunday: { startHour: 11, endHour: 17, isOpen: true },
      };
    case "Restaurant / Food Service":
      return {
        monday: restaurantSchedule,
        tuesday: restaurantSchedule,
        wednesday: restaurantSchedule,
        thursday: restaurantSchedule,
        friday: { startHour: 10, endHour: 23, isOpen: true },
        saturday: { startHour: 10, endHour: 23, isOpen: true },
        sunday: { startHour: 10, endHour: 21, isOpen: true },
      };
    case "Grocery / Food Market":
      return {
        monday: grocerySchedule,
        tuesday: grocerySchedule,
        wednesday: grocerySchedule,
        thursday: grocerySchedule,
        friday: grocerySchedule,
        saturday: grocerySchedule,
        sunday: { startHour: 8, endHour: 20, isOpen: true },
      };
    case "K–12 School":
      return {
        monday: schoolSchedule,
        tuesday: schoolSchedule,
        wednesday: schoolSchedule,
        thursday: schoolSchedule,
        friday: schoolSchedule,
        saturday: standardWeekend,
        sunday: standardWeekend,
      };
    case "Lodging / Hospitality":
      return {
        monday: hotelSchedule,
        tuesday: hotelSchedule,
        wednesday: hotelSchedule,
        thursday: hotelSchedule,
        friday: hotelSchedule,
        saturday: hotelSchedule,
        sunday: hotelSchedule,
      };
    case "Warehouse / Inventory":
      return {
        monday: { startHour: 6, endHour: 18, isOpen: true },
        tuesday: { startHour: 6, endHour: 18, isOpen: true },
        wednesday: { startHour: 6, endHour: 18, isOpen: true },
        thursday: { startHour: 6, endHour: 18, isOpen: true },
        friday: { startHour: 6, endHour: 18, isOpen: true },
        saturday: { startHour: 6, endHour: 14, isOpen: true },
        sunday: standardWeekend,
      };
    case "Industrial Manufacturing":
      return {
        monday: { startHour: 6, endHour: 22, isOpen: true },
        tuesday: { startHour: 6, endHour: 22, isOpen: true },
        wednesday: { startHour: 6, endHour: 22, isOpen: true },
        thursday: { startHour: 6, endHour: 22, isOpen: true },
        friday: { startHour: 6, endHour: 22, isOpen: true },
        saturday: { startHour: 6, endHour: 14, isOpen: true },
        sunday: standardWeekend,
      };
    default:
      return {
        monday: standardWeekday,
        tuesday: standardWeekday,
        wednesday: standardWeekday,
        thursday: standardWeekday,
        friday: standardWeekday,
        saturday: standardWeekend,
        sunday: standardWeekend,
      };
  }
}

export function createEmptyScheduleData(businessType: string = ""): OperatingScheduleData {
  return {
    hasScheduleData: false,
    weeklySchedule: getDefaultSchedule(businessType),
    seasonalVariations: [
      { season: "Summer", occupancyMultiplier: 1.0, hvacIntensityMultiplier: 1.3 },
      { season: "Winter", occupancyMultiplier: 1.0, hvacIntensityMultiplier: 1.2 },
      { season: "Spring/Fall", occupancyMultiplier: 1.0, hvacIntensityMultiplier: 0.8 },
    ],
    hoursPerWeek: 0,
    daysPerWeek: 0,
    annualOperatingHours: 0,
    averageOccupancyRate: 1.0,
  };
}
