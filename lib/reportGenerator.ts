import type { FormData, ECMResult } from "./types";
import type { Insight } from "./insights/auditInsights";
import type { AIExecutiveSummaryOutput } from "./ai/types";
import { getAuditAssumptions } from "./assumptions/auditAssumptions";
import { DEFAULT_ELECTRICITY_RATE } from "./data";
import { EUI_BENCHMARK_RANGES, getEUIContextLabel } from "./benchmarks/euiBenchmarks";

export interface ReportData {
  // Building information
  buildingName: string;
  businessType: string;
  floorArea: number;
  zipCode: string;
  constructionYear: string;
  primaryHeatingFuel: string;

  // Energy metrics
  annualEnergyUse: number;
  annualEnergyCost: number | null;
  eui: number | null;

  // End-use breakdown
  endUseBreakdown: Record<string, number> | null;

  // ECM results
  ecmResults: ECMResult[] | null;

  // Insights
  insights: Insight[];

  // AI Executive Summary (optional)
  aiSummary: AIExecutiveSummaryOutput | null;

  // Assumptions
  assumptions: ReturnType<typeof getAuditAssumptions>;

  // Computed aggregates
  totalEnergySavings: number;
  totalCostSavings: number;
  totalImplementationCost: number;
  blendedPaybackPeriod: number;
}

/**
 * Centralizes all report text content generation.
 * This allows the same text to be used for both React UI and PDF generation.
 */
export function getReportContent(
  submittedData: FormData,
  annualEnergyUse: number | null,
  annualEnergyCost: number | null,
  endUseBreakdown: Record<string, number> | null,
  ecmResults: ECMResult[] | null,
  insights: Insight[],
  aiSummary: AIExecutiveSummaryOutput | null
): ReportData {
  const floorArea = submittedData.floorArea ? parseFloat(submittedData.floorArea) : 0;
  const eui = annualEnergyUse && floorArea > 0 ? annualEnergyUse / floorArea : null;

  // Calculate ECM aggregates
  const totalEnergySavings = ecmResults?.reduce((sum, ecm) => sum + ecm.energySaved, 0) || 0;
  const totalCostSavings = ecmResults?.reduce((sum, ecm) => sum + ecm.costSaved, 0) || 0;
  const totalImplementationCost = ecmResults?.reduce((sum, ecm) => sum + ecm.implementationCost, 0) || 0;
  const blendedPaybackPeriod = totalCostSavings > 0 ? totalImplementationCost / totalCostSavings : Infinity;

  return {
    buildingName: submittedData.buildingName || "Building",
    businessType: submittedData.businessType || "",
    floorArea,
    zipCode: submittedData.zipCode || "",
    constructionYear: submittedData.constructionYear || "",
    primaryHeatingFuel: submittedData.primaryHeatingFuel || "",
    annualEnergyUse: annualEnergyUse || 0,
    annualEnergyCost,
    eui,
    endUseBreakdown,
    ecmResults: ecmResults || [],
    insights,
    aiSummary,
    assumptions: getAuditAssumptions(DEFAULT_ELECTRICITY_RATE),
    // Additional computed values for PDF
    totalEnergySavings,
    totalCostSavings,
    totalImplementationCost,
    blendedPaybackPeriod,
  };
}

