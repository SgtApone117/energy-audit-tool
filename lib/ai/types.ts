import type { FormData, ECMResult } from "../types";
import type { Insight } from "../insights/auditInsights";

/**
 * Input data for AI Executive Summary generation.
 * All values are read-only and derived from Phase 0 outputs.
 */
export interface AIExecutiveSummaryInput {
  // Building context
  buildingName: string;
  businessType: string;
  floorArea: number; // sq ft
  zipCode: string;
  constructionYear: string;
  primaryHeatingFuel: string;

  // Baseline metrics
  annualEnergyUse: number; // kWh/year
  annualEnergyCost: number; // $/year
  eui: number; // kWh/sq ft/year

  // End-use breakdown
  endUseBreakdown: Record<string, number>; // category -> kWh/year
  endUsePercentages: Record<string, number>; // category -> percentage

  // ECM summary
  totalECMs: number;
  totalEnergySavings: number; // kWh/year
  totalCostSavings: number; // $/year
  totalImplementationCost: number; // $
  averagePaybackPeriod: number; // years
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };

  // Top ECMs (2-3)
  topECMs: Array<{
    name: string;
    energySaved: number; // kWh/year
    costSaved: number; // $/year
    implementationCost: number; // $
    paybackPeriod: number; // years
    priority: "High" | "Medium" | "Low";
  }>;

  // Phase 1.1 insights
  insights: Insight[];
}

/**
 * Structured output from AI Executive Summary.
 * Must match the exact structure required by the prompt.
 */
export interface AIExecutiveSummaryOutput {
  overview: string;
  energyPerformanceSnapshot: string[];
  keyFindings: string[];
  recommendedFocusAreas: string[];
  topEnergyConservationMeasures: string;
  businessImpactSummary: string;
  disclaimer: string;
}
