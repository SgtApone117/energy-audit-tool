/**
 * Input data for AI Executive Summary generation.
 * Adapted for customer assessment results.
 */
export interface AIExecutiveSummaryInput {
  // Building context
  buildingName: string;
  businessType: string;
  floorArea: number; // sq ft
  zipCode: string;
  state: string;

  // Baseline metrics
  annualEnergyUse: number; // kWh/year
  annualEnergyCost: number; // $/year
  eui: number; // kWh/sq ft/year
  energyScore: string; // A-F

  // Benchmark comparison
  percentile: number;
  typicalEUI: number;
  efficientEUI: number;

  // ECM summary
  totalECMs: number;
  totalPotentialSavings: number; // $/year (typical)
  totalImplementationCost: number; // $ (typical)
  averagePaybackPeriod: number; // years
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };

  // Top 3 ECMs
  topECMs: Array<{
    name: string;
    annualSavings: number; // $/year
    implementationCost: number; // $
    paybackYears: number;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Quick wins total
  quickWinsSavings: number;

  // Key insights
  insights: string[];
}

/**
 * Structured output from AI Executive Summary.
 */
export interface AIExecutiveSummaryOutput {
  overview: string;
  energyPerformanceSnapshot: string[];
  keyFindings: string[];
  recommendedFocusAreas: string[];
  topOpportunities: string;
  businessImpactSummary: string;
  nextSteps: string[];
  disclaimer: string;
}
