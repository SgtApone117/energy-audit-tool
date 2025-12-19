"use client";

import { useRef, useState } from "react";
import type { FormData, ECMResult } from "@/lib/types";
import { generatePDF } from "@/lib/pdfExport";
import { generateAuditInsights } from "@/lib/insights/auditInsights";
import { prepareAIInput } from "@/lib/ai/prepareInput";
import type { AIExecutiveSummaryOutput } from "@/lib/ai/types";
import { getReportContent } from "@/lib/reportGenerator";
import BuildingSummary from "./BuildingSummary";
import EnergyBaseline from "./EnergyBaseline";
import EnergyBreakdown from "./EnergyBreakdown";
import ECMTable from "./ECMTable";
import KeyInsightsSection from "./KeyInsightsSection";
import AIExecutiveSummarySection from "./AIExecutiveSummarySection";
import TotalSavingsSummaryCard from "./TotalSavingsSummaryCard";
import EUIBenchmarkContext from "./EUIBenchmarkContext";
import AssumptionsPanel from "./AssumptionsPanel";

interface AuditResultsProps {
  submittedData: FormData;
  annualEnergyUse: number | null;
  annualEnergyCost: number | null;
  endUseBreakdown: Record<string, number> | null;
  ecmResults: ECMResult[] | null;
}

export default function AuditResults({
  submittedData,
  annualEnergyUse,
  annualEnergyCost,
  endUseBreakdown,
  ecmResults,
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Results</h2>
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

          {ecmResults && ecmResults.length > 0 && (
            <div className="pdf-section">
              <TotalSavingsSummaryCard ecmResults={ecmResults} />
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
              <EnergyBreakdown breakdown={endUseBreakdown} />
            </div>
          )}

          {ecmResults && ecmResults.length > 0 && (
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