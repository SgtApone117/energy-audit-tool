// Customer Assessment Form Types

export interface CustomerAssessmentForm {
  // Step 1: Business Basics
  businessName: string;
  businessType: string;
  address: string;
  state: string;
  zipCode: string;
  squareFootage: number | null;

  // Step 2: Utility Bills
  electricityProviderId: string; // Provider ID from utilityProviders.ts
  gasProviderId: string; // Provider ID from utilityProviders.ts
  utilityBills: UtilityBill[];

  // Step 3: Equipment (Optional)
  hvacSystems: HVACSystem[];
  lightingDetails: LightingDetails | null;
  refrigerationEquipment: RefrigerationEquipment | null;
  cookingEquipment: CookingEquipment | null;
  otherEquipment: OtherEquipment[];
  operatingSchedule: OperatingSchedule | null;
}

export interface UtilityBill {
  month: string; // "YYYY-MM"
  electricityKwh: number | null;
  electricityCost: number | null;
  gasUsage: number | null; // therms
  gasCost: number | null;
}

export interface HVACSystem {
  id: string;
  systemType: HVACSystemType;
  quantity: number;
  ageRange: AgeRange;
  tonnage: number | null;
  efficiencyRating: number | null;
  condition: EquipmentCondition;
  thermostatType: ThermostatType;
}

export type HVACSystemType =
  | 'Central AC'
  | 'Heat Pump'
  | 'Rooftop Unit'
  | 'Split System'
  | 'Window Unit'
  | 'PTAC'
  | 'Furnace'
  | 'Boiler'
  | 'Other';

export type AgeRange = '0-5' | '6-10' | '11-15' | '16-20' | '20+';

export type EquipmentCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type ThermostatType = 'Manual' | 'Programmable' | 'Smart';

export interface LightingDetails {
  totalFixtures: number | null;
  primaryBulbType: BulbType;
  hoursPerDay: number | null;
  lightingControls: LightingControlType;
}

export type BulbType = 'LED' | 'Fluorescent' | 'Incandescent' | 'Mixed';

export type LightingControlType = 'None' | 'Timers' | 'Occupancy Sensors' | 'Daylight Sensors';

export interface RefrigerationEquipment {
  hasWalkInCooler: boolean;
  walkInCoolerDetails: WalkInDetails | null;
  hasWalkInFreezer: boolean;
  walkInFreezerDetails: WalkInDetails | null;
  reachInUnits: number;
  displayCases: number;
  displayCaseType: DisplayCaseType | null;
  iceMachines: number;
}

export interface WalkInDetails {
  size: 'Small' | 'Medium' | 'Large';
  ageRange: AgeRange;
  condition: EquipmentCondition;
}

export type DisplayCaseType = 'Open' | 'Closed' | 'Mixed';

export interface CookingEquipment {
  ovens: number;
  ranges: number;
  fryers: number;
  grills: number;
  dishwashers: number;
}

export interface OtherEquipment {
  id: string;
  type: OtherEquipmentType;
  quantity: number;
  horsePower: number | null;
  estimatedKw: number | null;
  description: string;
}

export type OtherEquipmentType = 'Compressor' | 'Motor' | 'Pump' | 'Computer/Server' | 'Other';

export interface OperatingSchedule {
  isOpen24x7: boolean;
  weeklySchedule: DaySchedule[];
  occupancyLevel: OccupancyLevel;
  holidayClosuresPerYear: number;
}

export interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type OccupancyLevel = 'Light' | 'Moderate' | 'Heavy' | 'Very Heavy';

// Form state and navigation
export type AssessmentStep = 1 | 2 | 3 | 4;

export interface AssessmentFormState {
  currentStep: AssessmentStep;
  formData: CustomerAssessmentForm;
  validation: StepValidation;
  lastSaved: Date | null;
}

export interface StepValidation {
  step1Valid: boolean;
  step2Valid: boolean;
  step3Valid: boolean; // Optional step, always valid if skipped
}

// Calculation Results
export interface CustomerAssessmentResults {
  // Energy Profile
  annualCost: number;
  annualUsage: number;
  costPerSqFt: number;
  energyScore: EnergyScore;
  confidence: ConfidenceLevel;

  // Benchmark
  yourEUI: number;
  typicalEUI: number;
  efficientEUI: number;
  percentile: number;

  // Breakdown
  endUseBreakdown: EndUseBreakdown | null;
  hasEquipmentData: boolean;

  // Patterns
  monthlyPatterns: MonthlyPattern[];
  seasonalAnalysis: SeasonalAnalysis;
  peakAnalysis: PeakAnalysis;
  rateAnalysis: RateAnalysis;
  anomalies: Anomaly[];

  // Recommendations
  quickWins: QuickWin[];
  ecmRecommendations: ECMRecommendation[];

  // Insights
  insights: Insight[];
}

export type EnergyScore = 'A' | 'B' | 'C' | 'D' | 'F';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface EndUseBreakdown {
  hvac: number;
  lighting: number;
  refrigeration: number;
  cooking: number;
  plugLoads: number;
  other: number;
}

export interface MonthlyPattern {
  month: string;
  usage: number;
  cost: number;
  rate: number;
}

export interface SeasonalAnalysis {
  summer: { avgUsage: number; avgCost: number };
  fall: { avgUsage: number; avgCost: number };
  winter: { avgUsage: number; avgCost: number };
  spring: { avgUsage: number; avgCost: number };
  highestSeason: string;
  lowestSeason: string;
  seasonalVariation: number; // percentage
}

export interface PeakAnalysis {
  peakMonth: string;
  peakUsage: number;
  baseload: number;
  baseloadPercentage: number;
  dailyPeak: number;
}

export interface RateAnalysis {
  averageRate: number;
  highestRate: number;
  lowestRate: number;
  stateAverageRate: number;
  vsStateAverage: number; // percentage difference
}

export interface Anomaly {
  month: string;
  usage: number;
  expected: number;
  deviation: number; // percentage
  possibleCauses: string[];
}

export interface QuickWin {
  id: string;
  action: string;
  description: string;
  estimatedSavings: number;
  difficulty: 'Easy' | 'Medium';
}

export interface ECMRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  explanation: string;
  savingsRange: { low: number; typical: number; high: number };
  costRange: { low: number; typical: number; high: number };
  paybackRange: { best: number; worst: number };
  tenYearReturn: number;
  additionalBenefits: string[];
  calculationBasis: string[];
}

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'opportunity';
}

export type InsightType =
  | 'cooling-focused'
  | 'heating-focused'
  | 'baseload-high'
  | 'rate-high'
  | 'equipment-old'
  | 'lighting-inefficient'
  | 'refrigeration-inefficient'
  | 'schedule-opportunity';

// Action Plan
export interface ActionPlan {
  selectedECMs: string[];
  totalSavings: { low: number; high: number };
  totalCost: { low: number; high: number };
  blendedPayback: number;
  fiveYearReturn: number;
  tenYearReturn: number;
}

// Initial/empty state factories
export function createEmptyAssessmentForm(): CustomerAssessmentForm {
  return {
    businessName: '',
    businessType: '',
    address: '',
    state: '',
    zipCode: '',
    squareFootage: null,
    electricityProviderId: '',
    gasProviderId: '',
    utilityBills: createEmptyUtilityBills(),
    hvacSystems: [],
    lightingDetails: null,
    refrigerationEquipment: null,
    cookingEquipment: null,
    otherEquipment: [],
    operatingSchedule: null,
  };
}

export function createEmptyUtilityBills(): UtilityBill[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return months.map((month) => ({
    month,
    electricityKwh: null,
    electricityCost: null,
    gasUsage: null,
    gasCost: null,
  }));
}

export function createEmptyHVACSystem(): HVACSystem {
  return {
    id: crypto.randomUUID(),
    systemType: 'Central AC',
    quantity: 1,
    ageRange: '0-5',
    tonnage: null,
    efficiencyRating: null,
    condition: 'Good',
    thermostatType: 'Programmable',
  };
}

export function createEmptyLightingDetails(): LightingDetails {
  return {
    totalFixtures: null,
    primaryBulbType: 'Mixed',
    hoursPerDay: null,
    lightingControls: 'None',
  };
}

export function createEmptyRefrigerationEquipment(): RefrigerationEquipment {
  return {
    hasWalkInCooler: false,
    walkInCoolerDetails: null,
    hasWalkInFreezer: false,
    walkInFreezerDetails: null,
    reachInUnits: 0,
    displayCases: 0,
    displayCaseType: null,
    iceMachines: 0,
  };
}

export function createEmptyCookingEquipment(): CookingEquipment {
  return {
    ovens: 0,
    ranges: 0,
    fryers: 0,
    grills: 0,
    dishwashers: 0,
  };
}

export function createEmptyOperatingSchedule(): OperatingSchedule {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return {
    isOpen24x7: false,
    weeklySchedule: days.map((day) => ({
      day,
      isOpen: day !== 'Sunday',
      openTime: '09:00',
      closeTime: '17:00',
    })),
    occupancyLevel: 'Moderate',
    holidayClosuresPerYear: 10,
  };
}
