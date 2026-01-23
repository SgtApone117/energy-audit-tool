"use client";

import { useRef, useState } from "react";
import type { FormData, ECMResult } from "@/lib/types";
import { UtilityBillData } from "@/lib/utility/types";
import { OperatingScheduleData } from "@/lib/schedule/types";
import { EquipmentInventory } from "@/lib/equipment/types";
import { generatePDF } from "@/lib/pdfExport";
import { generateAuditInsights } from "@/lib/insights/auditInsights";
import { prepareAIInput } from "@/lib/ai/prepareInput";
import type { AIExecutiveSummaryOutput } from "@/lib/ai/types";
import { getReportContent } from "@/lib/reportGenerator";
import { calculateAnnualEnergyUseWithAdjustments, EnergyCalculationResult, EnhancedBreakdownResult } from "@/lib/calculations";
import { ECMCalculationSummary } from "@/lib/ecm";
import { compareActualToEstimated } from "@/lib/utility/utilityAnalysis";
import { getStateName } from "@/lib/data/zipToState";
import { getScheduleSummary } from "@/lib/schedule/scheduleCalculations";
import { getEquipmentSummary, getEquipmentECMRecommendations } from "@/lib/equipment/equipmentCalculations";
import BuildingSummary from "./BuildingSummary";
import EnergyBaseline from "./EnergyBaseline";
import EnergyBreakdown from "./EnergyBreakdown";
import ECMTable from "./ECMTable";
import KeyInsightsSection from "./KeyInsightsSection";
import AIExecutiveSummarySection from "./AIExecutiveSummarySection";
import TotalSavingsSummaryCard from "./TotalSavingsSummaryCard";
import EUIBenchmarkContext from "./EUIBenchmarkContext";
import AssumptionsPanel from "./AssumptionsPanel";
import ActualVsEstimatedComparison from "./ActualVsEstimatedComparison";
import EnhancedECMTable from "./EnhancedECMTable";
import { InfoTooltip } from "./ui/Tooltip";

interface AuditResultsProps {
  submittedData: FormData;
  annualEnergyUse: number | null;
  annualEnergyCost: number | null;
  endUseBreakdown: Record<string, number> | null;
  enhancedBreakdown?: EnhancedBreakdownResult | null;
  ecmResults: ECMResult[] | null;
  enhancedEcmResults?: ECMCalculationSummary | null;
  utilityData?: UtilityBillData | null;
  scheduleData?: OperatingScheduleData | null;
  equipmentData?: EquipmentInventory | null;
  calculationResult?: EnergyCalculationResult | null;
}

export default function AuditResults({
  submittedData,
  annualEnergyUse,
  annualEnergyCost,
  endUseBreakdown,
  enhancedBreakdown,
  ecmResults,
  enhancedEcmResults,
  utilityData,
  scheduleData,
  equipmentData,
  calculationResult,
}: AuditResultsProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [aiSummary, setAiSummary] = useState<AIExecutiveSummaryOutput | null>(null);

  // Generate insights from existing audit data (read-only, no new calculations)
  const insights = generateAuditInsights({
    annualEnergyUse,
    annualEnergyCost,
    endUseBreakdown,
    ecmResults,
  });

  // Prepare AI input data (read-only formatting, no calculations)
  const aiInput = prepareAIInput(
    submittedData,
    annualEnergyUse,
    annualEnergyCost,
    endUseBreakdown,
    ecmResults,
    insights
  );

  // Calculate actual vs estimated comparison if utility data exists
  const utilityComparison = utilityData?.hasActualData
    ? (() => {
        const calcResult = calculateAnnualEnergyUseWithAdjustments(
          submittedData.businessType,
          submittedData.floorArea,
          {
            constructionYear: submittedData.constructionYear,
            zipCode: submittedData.zipCode,
          }
        );
        if (!calcResult) return null;
        const actualKwh = utilityData.totalElectricityKwh;
        const floorArea = parseFloat(submittedData.floorArea) || 0;
        return compareActualToEstimated(actualKwh, calcResult.annualEnergyUse, floorArea);
      })()
    : null;

  // Get equipment-specific ECM recommendations
  const equipmentECMs = equipmentData?.hasEquipmentData
    ? getEquipmentECMRecommendations(equipmentData)
    : [];

  // Handler for generating AI executive summary
  const handleGenerateAISummary = async (): Promise<AIExecutiveSummaryOutput> => {
    if (!aiInput) {
      throw new Error("Insufficient audit data to generate summary");
    }

    const response = await fetch("/api/executive-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiInput),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to generate executive summary");
    }

    const data = await response.json();
    setAiSummary(data.summary); // Store for PDF generation
    return data.summary;
  };

  const handleDownloadPDF = async () => {
    try {
      // Wait a bit to ensure all content (especially charts) is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Prepare report data using centralized generator
      const reportData = getReportContent(
        submittedData,
        annualEnergyUse,
        annualEnergyCost,
        endUseBreakdown,
        ecmResults,
        insights,
        aiSummary
      );

      // Generate PDF using native text rendering
      await generatePDF(reportData);
    } catch (error) {
      alert(`PDF Generation Error:\n${error instanceof Error ? error.message : String(error)}`);
      console.error("Full PDF Error:", error);
    }
  };

  return (
    <div className="mt-12">
      <div className="border-t-2 border-gray-300 pt-10 mb-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            Audit Results
            <InfoTooltip 
              content="This section presents your building's energy assessment including baseline consumption, end-use breakdown, and recommended Energy Conservation Measures (ECMs) with estimated savings and payback periods."
              position="right"
            />
          </h2>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>
        </div>

        <div ref={pdfRef} className="space-y-10">
          {aiInput && (
            <div className="pdf-section">
              <AIExecutiveSummarySection onGenerate={handleGenerateAISummary} />
            </div>
          )}

          {insights.length > 0 && (
            <div className="pdf-section">
              <KeyInsightsSection insights={insights} />
            </div>
          )}

          {(ecmResults && ecmResults.length > 0) || (enhancedEcmResults && enhancedEcmResults.ecms.length > 0) ? (
            <div className="pdf-section">
              <TotalSavingsSummaryCard 
                ecmResults={ecmResults} 
                enhancedEcmResults={enhancedEcmResults}
              />
            </div>
          ) : null}

          {/* Phase A: Actual vs Estimated Comparison */}
          {utilityComparison && (
            <div className="pdf-section">
              <ActualVsEstimatedComparison comparison={utilityComparison} />
            </div>
          )}

          {annualEnergyUse !== null &&
            submittedData.floorArea &&
            parseFloat(submittedData.floorArea) > 0 &&
            submittedData.businessType && (
              <div className="pdf-section">
                <EUIBenchmarkContext
                  annualEnergyUse={annualEnergyUse}
                  floorArea={parseFloat(submittedData.floorArea)}
                  businessType={submittedData.businessType}
                />
              </div>
            )}

          <div className="pdf-section">
            <BuildingSummary data={submittedData} />
          </div>

          {/* Calculation Adjustments Display */}
          {calculationResult && (calculationResult.constructionAdjustment !== 1.0 || calculationResult.climateAdjustment !== 1.0) && (
            <div className="pdf-section">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Base EUI</div>
                    <div className="text-xl font-bold text-gray-900">
                      {calculationResult.baseEUI.toFixed(1)} <span className="text-sm font-normal">kWh/sf/yr</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Adjusted EUI</div>
                    <div className="text-xl font-bold text-blue-900">
                      {calculationResult.adjustedEUI.toFixed(1)} <span className="text-sm font-normal">kWh/sf/yr</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 mb-1">Electricity Rate</div>
                    <div className="text-xl font-bold text-green-900">
                      ${calculationResult.utilityRates.electricity.toFixed(3)} <span className="text-sm font-normal">/kWh</span>
                    </div>
                    {calculationResult.stateCode && (
                      <div className="text-xs text-green-700 mt-1">
                        {getStateName(calculationResult.stateCode)} average
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {calculationResult.constructionAdjustment !== 1.0 && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calculationResult.constructionAdjustment > 1 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Building Age: {calculationResult.constructionAdjustment > 1 ? '+' : ''}
                      {Math.round((calculationResult.constructionAdjustment - 1) * 100)}%
                    </span>
                  )}
                  {calculationResult.climateZone && calculationResult.climateAdjustment !== 1.0 && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calculationResult.climateAdjustment > 1 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {calculationResult.climateZone.zone} Climate: +{Math.round((calculationResult.climateAdjustment - 1) * 100)}%
                    </span>
                  )}
                </div>
                {calculationResult.climateZone && (
                  <p className="text-sm text-gray-500 mt-3">
                    {calculationResult.climateZone.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Phase B: Operating Schedule Summary */}
          {scheduleData?.hasScheduleData && (
            <div className="pdf-section">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Schedule</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {scheduleData.hoursPerWeek}
                    </div>
                    <div className="text-xs text-gray-600">Hours/Week</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {scheduleData.daysPerWeek}
                    </div>
                    <div className="text-xs text-gray-600">Days/Week</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {scheduleData.annualOperatingHours.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Annual Hours</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(scheduleData.averageOccupancyRate * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Avg Occupancy</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {getScheduleSummary(scheduleData)}
                </p>
              </div>
            </div>
          )}

          {/* Phase C: Equipment Summary */}
          {equipmentData?.hasEquipmentData && (
            <div className="pdf-section">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Inventory Summary</h3>
                <p className="text-sm text-gray-600 mb-4">{getEquipmentSummary(equipmentData)}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {equipmentData.totalHVACCapacity > 0 && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">
                        {equipmentData.totalHVACCapacity}
                      </div>
                      <div className="text-xs text-blue-700">HVAC Capacity (tons)</div>
                    </div>
                  )}
                  {equipmentData.totalLightingWattage > 0 && (
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-900">
                        {(equipmentData.totalLightingWattage / 1000).toFixed(1)}
                      </div>
                      <div className="text-xs text-yellow-700">Lighting Load (kW)</div>
                    </div>
                  )}
                  {equipmentData.totalMajorEquipmentLoad > 0 && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">
                        {equipmentData.totalMajorEquipmentLoad.toFixed(1)}
                      </div>
                      <div className="text-xs text-purple-700">Equipment Load (kW)</div>
                    </div>
                  )}
                </div>

                {/* Equipment-specific ECM recommendations */}
                {equipmentECMs.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Equipment-Specific Recommendations
                    </h4>
                    <div className="space-y-2">
                      {equipmentECMs.slice(0, 5).map((ecm, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                ecm.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : ecm.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {ecm.priority}
                            </span>
                            <span className="text-sm text-gray-700">{ecm.recommendation}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ~{Math.round(ecm.estimatedSavings * 100)}% savings
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {annualEnergyUse !== null && (
            <div className="pdf-section">
              <EnergyBaseline
                annualEnergyUse={annualEnergyUse}
                annualEnergyCost={annualEnergyCost}
              />
            </div>
          )}

          {endUseBreakdown && (
            <div className="pdf-section">
              <EnergyBreakdown 
                breakdown={endUseBreakdown} 
                sources={enhancedBreakdown?.sources}
                hasEquipmentData={enhancedBreakdown?.hasEquipmentData}
              />
            </div>
          )}

          {/* Enhanced ECM Table with confidence ranges */}
          {enhancedEcmResults && enhancedEcmResults.ecms.length > 0 && (
            <div className="pdf-section">
              <EnhancedECMTable ecmSummary={enhancedEcmResults} />
            </div>
          )}

          {/* Legacy ECM Table (fallback if enhanced not available) */}
          {!enhancedEcmResults && ecmResults && ecmResults.length > 0 && (
            <div className="pdf-section">
              <ECMTable results={ecmResults} />
            </div>
          )}

          <div className="pdf-section">
            <AssumptionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
