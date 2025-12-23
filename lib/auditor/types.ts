/**
 * Auditor Types - On-site Energy Audit Data Structures
 * Enhanced for Eversource Inspection Requirements
 */

// ============================================
// INSPECTION TYPES
// ============================================

export type InspectionType = 'pre' | 'post';

export const INSPECTION_TYPES: { id: InspectionType; label: string; description: string }[] = [
  { id: 'pre', label: 'Pre-Installation Inspection', description: 'Document existing conditions before upgrades' },
  { id: 'post', label: 'Post-Installation Inspection', description: 'Verify installed equipment matches proposal' },
];

// ============================================
// PHOTO CATEGORIES
// ============================================

export type PhotoCategory =
  | 'hvac'
  | 'lighting'
  | 'building-envelope'
  | 'refrigeration'
  | 'electrical'
  | 'water-heating'
  | 'kitchen-process'
  | 'general';

export const PHOTO_CATEGORIES: { id: PhotoCategory; label: string; description: string }[] = [
  { id: 'hvac', label: 'HVAC', description: 'Rooftop units, thermostats, ductwork, filters' },
  { id: 'lighting', label: 'Lighting', description: 'Fixtures, controls, ballasts, exterior' },
  { id: 'building-envelope', label: 'Building Envelope', description: 'Windows, doors, insulation, roof' },
  { id: 'refrigeration', label: 'Refrigeration', description: 'Walk-ins, display cases, ice machines' },
  { id: 'electrical', label: 'Electrical', description: 'Panels, meters, motors' },
  { id: 'water-heating', label: 'Water Heating', description: 'Water heaters, pipes' },
  { id: 'kitchen-process', label: 'Kitchen/Process', description: 'Cooking equipment, exhaust hoods' },
  { id: 'general', label: 'General', description: 'Nameplates, signage, issues found' },
];

// ============================================
// LIGHTING FIXTURE TYPES & WATTAGE DATABASE
// ============================================

export type LampType = 
  | 'T12' | 'T8' | 'T5' | 'T5HO'
  | 'CFL' | 'CFL-Pin'
  | 'Incandescent' | 'Halogen'
  | 'LED-Tube' | 'LED-Fixture' | 'LED-Retrofit'
  | 'HID-MH' | 'HID-HPS' | 'HID-MV'
  | 'Other';

export type BallastType = 'Magnetic' | 'Electronic' | 'None' | 'LED-Driver' | 'Unknown';

export interface FixtureSpec {
  lampType: LampType;
  lampsPerFixture: number;
  ballastType: BallastType;
  lampLength?: '2ft' | '4ft' | '8ft';
  wattsPerLamp: number;
  ballastFactor: number; // Typically 0.78-1.18
  totalFixtureWatts: number; // Calculated: lampsPerFixture * wattsPerLamp * ballastFactor
}

// Standard fixture wattage database (Eversource/utility reference values)
export const FIXTURE_WATTAGE_DATABASE: Record<string, { wattsPerLamp: number; ballastFactor: number; description: string }> = {
  // T12 Fluorescent (being phased out)
  'T12-4ft-40W-Magnetic': { wattsPerLamp: 40, ballastFactor: 1.1, description: '4ft T12 40W with Magnetic Ballast' },
  'T12-4ft-34W-Magnetic': { wattsPerLamp: 34, ballastFactor: 1.1, description: '4ft T12 34W with Magnetic Ballast' },
  'T12-8ft-75W-Magnetic': { wattsPerLamp: 75, ballastFactor: 1.1, description: '8ft T12 75W with Magnetic Ballast' },
  
  // T8 Fluorescent (common existing)
  'T8-4ft-32W-Electronic': { wattsPerLamp: 32, ballastFactor: 0.88, description: '4ft T8 32W with Electronic Ballast' },
  'T8-4ft-28W-Electronic': { wattsPerLamp: 28, ballastFactor: 0.88, description: '4ft T8 28W (Reduced Wattage) Electronic' },
  'T8-4ft-25W-Electronic': { wattsPerLamp: 25, ballastFactor: 0.88, description: '4ft T8 25W (Low Wattage) Electronic' },
  'T8-2ft-17W-Electronic': { wattsPerLamp: 17, ballastFactor: 0.88, description: '2ft T8 17W with Electronic Ballast' },
  
  // T5 & T5HO Fluorescent
  'T5-4ft-28W-Electronic': { wattsPerLamp: 28, ballastFactor: 1.0, description: '4ft T5 28W with Electronic Ballast' },
  'T5HO-4ft-54W-Electronic': { wattsPerLamp: 54, ballastFactor: 1.0, description: '4ft T5HO 54W with Electronic Ballast' },
  
  // LED Replacements
  'LED-Tube-4ft-15W': { wattsPerLamp: 15, ballastFactor: 1.0, description: '4ft LED Tube 15W (Type A/B)' },
  'LED-Tube-4ft-18W': { wattsPerLamp: 18, ballastFactor: 1.0, description: '4ft LED Tube 18W (Type A/B)' },
  'LED-Tube-4ft-12W': { wattsPerLamp: 12, ballastFactor: 1.0, description: '4ft LED Tube 12W (High Efficiency)' },
  'LED-Fixture-2x4-30W': { wattsPerLamp: 30, ballastFactor: 1.0, description: '2x4 LED Troffer 30W' },
  'LED-Fixture-2x4-40W': { wattsPerLamp: 40, ballastFactor: 1.0, description: '2x4 LED Troffer 40W' },
  'LED-Fixture-2x4-50W': { wattsPerLamp: 50, ballastFactor: 1.0, description: '2x4 LED Troffer 50W' },
  'LED-Fixture-2x2-25W': { wattsPerLamp: 25, ballastFactor: 1.0, description: '2x2 LED Troffer 25W' },
  'LED-Fixture-2x2-32W': { wattsPerLamp: 32, ballastFactor: 1.0, description: '2x2 LED Troffer 32W' },
  
  // HID (High Intensity Discharge)
  'HID-MH-175W': { wattsPerLamp: 175, ballastFactor: 1.15, description: 'Metal Halide 175W' },
  'HID-MH-250W': { wattsPerLamp: 250, ballastFactor: 1.15, description: 'Metal Halide 250W' },
  'HID-MH-400W': { wattsPerLamp: 400, ballastFactor: 1.15, description: 'Metal Halide 400W' },
  'HID-MH-1000W': { wattsPerLamp: 1000, ballastFactor: 1.15, description: 'Metal Halide 1000W' },
  'HID-HPS-150W': { wattsPerLamp: 150, ballastFactor: 1.1, description: 'High Pressure Sodium 150W' },
  'HID-HPS-250W': { wattsPerLamp: 250, ballastFactor: 1.1, description: 'High Pressure Sodium 250W' },
  'HID-HPS-400W': { wattsPerLamp: 400, ballastFactor: 1.1, description: 'High Pressure Sodium 400W' },
  
  // Incandescent & Halogen
  'Incandescent-60W': { wattsPerLamp: 60, ballastFactor: 1.0, description: 'Incandescent 60W' },
  'Incandescent-75W': { wattsPerLamp: 75, ballastFactor: 1.0, description: 'Incandescent 75W' },
  'Incandescent-100W': { wattsPerLamp: 100, ballastFactor: 1.0, description: 'Incandescent 100W' },
  'Halogen-50W': { wattsPerLamp: 50, ballastFactor: 1.0, description: 'Halogen 50W' },
  'Halogen-75W': { wattsPerLamp: 75, ballastFactor: 1.0, description: 'Halogen 75W' },
  
  // CFL
  'CFL-13W': { wattsPerLamp: 13, ballastFactor: 1.0, description: 'CFL 13W (60W equivalent)' },
  'CFL-23W': { wattsPerLamp: 23, ballastFactor: 1.0, description: 'CFL 23W (100W equivalent)' },
  'CFL-26W-Pin': { wattsPerLamp: 26, ballastFactor: 1.0, description: 'CFL 26W Pin Base' },
  'CFL-32W-Pin': { wattsPerLamp: 32, ballastFactor: 1.0, description: 'CFL 32W Pin Base' },
};

// Common fixture configurations with pre-calculated wattages
export const COMMON_FIXTURE_CONFIGS: { id: string; label: string; lampsPerFixture: number; fixtureType: string; totalWatts: number }[] = [
  // T8 4-lamp configurations (most common existing)
  { id: 't8-4lamp-4ft', label: '4-Lamp T8 4ft Troffer (112W)', lampsPerFixture: 4, fixtureType: 'T8-4ft-32W-Electronic', totalWatts: 112 },
  { id: 't8-3lamp-4ft', label: '3-Lamp T8 4ft Troffer (84W)', lampsPerFixture: 3, fixtureType: 'T8-4ft-32W-Electronic', totalWatts: 84 },
  { id: 't8-2lamp-4ft', label: '2-Lamp T8 4ft Troffer (56W)', lampsPerFixture: 2, fixtureType: 'T8-4ft-32W-Electronic', totalWatts: 56 },
  
  // T12 (older, being replaced)
  { id: 't12-4lamp-4ft', label: '4-Lamp T12 4ft (176W)', lampsPerFixture: 4, fixtureType: 'T12-4ft-40W-Magnetic', totalWatts: 176 },
  { id: 't12-2lamp-4ft', label: '2-Lamp T12 4ft (88W)', lampsPerFixture: 2, fixtureType: 'T12-4ft-40W-Magnetic', totalWatts: 88 },
  
  // LED Replacements
  { id: 'led-2x4-troffer', label: 'LED 2x4 Troffer (40W)', lampsPerFixture: 1, fixtureType: 'LED-Fixture-2x4-40W', totalWatts: 40 },
  { id: 'led-2x4-troffer-50w', label: 'LED 2x4 Troffer (50W)', lampsPerFixture: 1, fixtureType: 'LED-Fixture-2x4-50W', totalWatts: 50 },
  { id: 'led-2x2-troffer', label: 'LED 2x2 Troffer (32W)', lampsPerFixture: 1, fixtureType: 'LED-Fixture-2x2-32W', totalWatts: 32 },
  { id: 'led-4lamp-tube', label: '4-Lamp LED Tube Retrofit (60W)', lampsPerFixture: 4, fixtureType: 'LED-Tube-4ft-15W', totalWatts: 60 },
  
  // HID
  { id: 'hid-mh-400', label: 'Metal Halide 400W', lampsPerFixture: 1, fixtureType: 'HID-MH-400W', totalWatts: 460 },
  { id: 'hid-hps-250', label: 'High Pressure Sodium 250W', lampsPerFixture: 1, fixtureType: 'HID-HPS-250W', totalWatts: 275 },
];

// Photo with metadata
export interface AuditPhoto {
  id: string;
  dataUrl: string; // Base64 encoded image
  fileName: string;
  category: PhotoCategory;
  label: string;
  notes: string;
  room?: string;
  timestamp: string;
  size: number; // bytes
}

// Room/Zone for organizing data
export interface AuditRoom {
  id: string;
  name: string;
  type: 'office' | 'retail' | 'storage' | 'kitchen' | 'restroom' | 'mechanical' | 'exterior' | 'other';
  squareFootage?: number;
  notes?: string;
}

// HVAC Unit (simplified for on-site)
export interface AuditHVACUnit {
  id: string;
  roomId?: string;
  systemType: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  capacity?: number;
  capacityUnit: 'tons' | 'BTU/hr' | 'kW';
  age?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  fuelType: 'Electric' | 'Natural Gas' | 'Fuel Oil' | 'Propane';
  hasSmartThermostat: boolean;
  efficiencyRating?: string;
  notes?: string;
  photoIds: string[];
}

// Enhanced Lighting Zone for Eversource Inspections
export interface AuditLightingZone {
  id: string;
  roomId?: string;
  zoneName: string;
  location?: string; // Specific location description
  
  // Fixture Details (Eversource requirement)
  fixtureType: string; // Reference to COMMON_FIXTURE_CONFIGS or custom
  fixtureCount: number;
  lampsPerFixture: number;
  lampType: LampType;
  lampLength?: '2ft' | '4ft' | '8ft';
  ballastType: BallastType;
  
  // Wattage (per Eversource calculation method)
  wattsPerLamp: number;
  ballastFactor: number;
  wattsPerFixture: number; // Calculated: lampsPerFixture * wattsPerLamp * ballastFactor
  totalConnectedWatts: number; // Calculated: fixtureCount * wattsPerFixture
  
  // Lamps Out - Critical Eversource requirement!
  lampsOutCount: number; // Number of individual lamps not working
  fixturesWithLampsOut: number; // Number of fixtures affected
  adjustedWatts?: number; // Total watts adjusted for lamps out
  
  // Controls
  controlType: 'Manual' | 'Occupancy' | 'Daylight' | 'Timer' | 'BMS' | 'Dimmer' | 'None';
  hoursPerDay?: number;
  daysPerWeek?: number;
  
  // For Post-Installation Inspection
  isDLCListed?: boolean;
  dlcProductId?: string;
  dlcManufacturer?: string;
  dlcModelNumber?: string;
  
  // Verification status
  verified: boolean;
  verificationNotes?: string;
  
  notes?: string;
  photoIds: string[];
}

// Contractor Submittal - for comparison during inspection
export interface ContractorSubmittal {
  id: string;
  submittedAt: string;
  contractorName: string;
  projectName?: string;
  
  // Proposed lighting changes
  lightingItems: ContractorLightingItem[];
  
  // Other equipment
  hvacItems: ContractorEquipmentItem[];
  otherItems: ContractorEquipmentItem[];
  
  // Calculated totals from submittal
  existingTotalWatts: number;
  proposedTotalWatts: number;
  estimatedSavingsWatts: number;
  estimatedSavingsKwhYear: number;
  proposedIncentive: number;
  
  // Document reference
  documentUrl?: string;
  notes?: string;
}

export interface ContractorLightingItem {
  id: string;
  location: string;
  
  // Existing condition
  existingFixtureType: string;
  existingFixtureCount: number;
  existingLampsPerFixture: number;
  existingWattsPerFixture: number;
  existingTotalWatts: number;
  
  // Proposed replacement
  proposedFixtureType: string;
  proposedFixtureCount: number;
  proposedWattsPerFixture: number;
  proposedTotalWatts: number;
  proposedDLCProductId?: string;
  
  // Calculated savings
  wattsSaved: number;
}

export interface ContractorEquipmentItem {
  id: string;
  category: 'hvac' | 'refrigeration' | 'motors' | 'other';
  location: string;
  existingDescription: string;
  existingQuantity: number;
  existingWatts?: number;
  proposedDescription: string;
  proposedQuantity: number;
  proposedWatts?: number;
}

// Discrepancy tracking for inspection
export type DiscrepancyType = 
  | 'count-mismatch' 
  | 'spec-mismatch' 
  | 'model-mismatch' 
  | 'missing-equipment'
  | 'extra-equipment'
  | 'condition-issue'
  | 'lamps-out'
  | 'not-dlc-listed'
  | 'other';

export interface InspectionDiscrepancy {
  id: string;
  category: PhotoCategory;
  type: DiscrepancyType;
  location: string;
  
  // What was expected (from submittal)
  expectedValue: string;
  expectedCount?: number;
  
  // What was found (during inspection)
  actualValue: string;
  actualCount?: number;
  
  // Impact
  impactDescription: string;
  requiresRecalculation: boolean;
  estimatedSavingsImpact?: number; // + or - kWh/year
  estimatedIncentiveImpact?: number; // + or - dollars
  
  // Resolution
  status: 'open' | 'resolved' | 'adjusted';
  resolution?: string;
  
  photoIds: string[];
  createdAt: string;
}

// Major Equipment
export interface AuditEquipment {
  id: string;
  roomId?: string;
  equipmentType: string;
  description: string;
  manufacturer?: string;
  modelNumber?: string;
  quantity: number;
  powerRating?: number;
  age?: number;
  hoursPerDay?: number;
  notes?: string;
  photoIds: string[];
}

// Building Envelope Observation
export interface AuditEnvelopeItem {
  id: string;
  type: 'window' | 'door' | 'wall' | 'roof' | 'insulation' | 'other';
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  issue?: string;
  recommendation?: string;
  notes?: string;
  photoIds: string[];
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  category: PhotoCategory;
  question: string;
  answer: 'yes' | 'no' | 'na' | null;
  notes?: string;
}

// Finding/Issue discovered during audit
export type FindingPriority = 'high' | 'medium' | 'low';
export type FindingCategory = PhotoCategory | 'safety' | 'maintenance' | 'operational';

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  category: FindingCategory;
  priority: FindingPriority;
  location?: string;
  photoIds: string[];
  recommendation?: string;
  estimatedSavings?: number; // $/year
  estimatedCost?: number; // implementation cost
  createdAt: string;
}

// ECM Recommendation generated from findings
export interface AuditECM {
  id: string;
  title: string;
  description: string;
  category: PhotoCategory;
  priority: FindingPriority;
  annualSavingsLow: number;
  annualSavingsHigh: number;
  implementationCostLow: number;
  implementationCostHigh: number;
  paybackYears: number;
  source: 'auto' | 'manual'; // auto-generated or manually added
  relatedFindingIds: string[];
  relatedEquipmentIds: string[];
}

// Utility Bill Entry
export interface AuditUtilityBill {
  month: string;
  year: number;
  electricityKwh?: number;
  electricityCost?: number;
  gasTherm?: number;
  gasCost?: number;
}

// Building Information
export interface AuditBuildingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  businessType: string;
  squareFootage: number;
  yearBuilt?: string;
  floors?: number;
  occupants?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Operating Schedule
export interface AuditOperatingSchedule {
  openTime: string;
  closeTime: string;
  daysOpen: string[];
  holidaysPerYear?: number;
  specialHours?: string;
}

// Complete Audit State
export interface AuditData {
  id: string;
  name: string; // User-friendly audit name
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  
  // Inspection Type (Eversource requirement)
  inspectionType: InspectionType;
  
  // Building info
  buildingInfo: AuditBuildingInfo;
  
  // Photos
  photos: AuditPhoto[];
  
  // Rooms/Zones
  rooms: AuditRoom[];
  
  // Equipment inventory
  hvacUnits: AuditHVACUnit[];
  lightingZones: AuditLightingZone[];
  equipment: AuditEquipment[];
  envelopeItems: AuditEnvelopeItem[];
  
  // Schedule and utilities
  operatingSchedule: AuditOperatingSchedule;
  utilityBills: AuditUtilityBill[];
  
  // Checklist
  checklist: ChecklistItem[];
  
  // Findings/Issues
  findings: AuditFinding[];
  
  // ECM Recommendations
  ecmRecommendations: AuditECM[];
  
  // Contractor Submittal (for comparison)
  contractorSubmittal?: ContractorSubmittal;
  
  // Inspection Discrepancies
  discrepancies: InspectionDiscrepancy[];
  
  // Notes
  generalNotes: string;
  auditorName?: string;
  inspectorName?: string;
  inspectionDate?: string;
}

// Factory function to create empty audit
export function createEmptyAudit(name?: string, inspectionType: InspectionType = 'pre'): AuditData {
  const now = new Date();
  const typeLabel = inspectionType === 'pre' ? 'Pre-Installation' : 'Post-Installation';
  const defaultName = name || `${typeLabel} Inspection ${now.toLocaleDateString()}`;
  return {
    id: generateId(),
    name: defaultName,
    status: 'draft',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    inspectionType,
    buildingInfo: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      businessType: '',
      squareFootage: 0,
    },
    photos: [],
    rooms: [],
    hvacUnits: [],
    lightingZones: [],
    equipment: [],
    envelopeItems: [],
    operatingSchedule: {
      openTime: '08:00',
      closeTime: '18:00',
      daysOpen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    utilityBills: [],
    checklist: [],
    findings: [],
    ecmRecommendations: [],
    discrepancies: [],
    generalNotes: '',
    inspectionDate: now.toISOString().split('T')[0],
  };
}

// Helper to create empty lighting zone with Eversource-compliant defaults
export function createEmptyLightingZone(): AuditLightingZone {
  return {
    id: generateId(),
    zoneName: '',
    fixtureType: '',
    fixtureCount: 0,
    lampsPerFixture: 4,
    lampType: 'T8',
    ballastType: 'Electronic',
    wattsPerLamp: 32,
    ballastFactor: 0.88,
    wattsPerFixture: 112, // 4 lamps × 32W × 0.88
    totalConnectedWatts: 0,
    lampsOutCount: 0,
    fixturesWithLampsOut: 0,
    controlType: 'Manual',
    verified: false,
    photoIds: [],
  };
}

// Calculate fixture wattage based on specs
export function calculateFixtureWatts(
  lampsPerFixture: number,
  wattsPerLamp: number,
  ballastFactor: number
): number {
  return Math.round(lampsPerFixture * wattsPerLamp * ballastFactor);
}

// Calculate total connected load with lamps-out adjustment
export function calculateTotalConnectedWatts(
  fixtureCount: number,
  wattsPerFixture: number,
  lampsOutCount: number = 0,
  wattsPerLamp: number = 0
): { totalWatts: number; adjustedWatts: number } {
  const totalWatts = fixtureCount * wattsPerFixture;
  const lampsOutWatts = lampsOutCount * wattsPerLamp;
  const adjustedWatts = totalWatts - lampsOutWatts;
  return { totalWatts, adjustedWatts };
}

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
