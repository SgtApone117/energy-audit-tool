"use client";

import { useRef } from "react";
import type { FormData, ECMResult } from "@/lib/types";
import { generatePDF } from "@/lib/pdfExport";
import { generateAuditInsights } from "@/lib/insights/auditInsights";
import { prepareAIInput } from "@/lib/ai/prepareInput";
import type { AIExecutiveSummaryOutput } from "@/lib/ai/types";
import { getAuditAssumptions } from "@/lib/assumptions/auditAssumptions";
import { DEFAULT_ELECTRICITY_RATE } from "@/lib/data";
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
    return data.summary;
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    // Wait a bit to ensure all content (especially charts) is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create a container for PDF content with title
    const pdfContainer = document.createElement("div");
    pdfContainer.style.backgroundColor = "#ffffff";
    pdfContainer.style.padding = "40px";
    pdfContainer.style.width = "210mm"; // A4 width
    pdfContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";
    pdfContainer.style.color = "#111827";

    // Add title
    const title = document.createElement("h1");
    title.textContent = "Energy Audit Report";
    title.style.fontSize = "28px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "30px";
    title.style.color = "#111827";
    title.style.borderBottom = "2px solid #d1d5db";
    title.style.paddingBottom = "15px";
    pdfContainer.appendChild(title);

    // Clone the content
    const contentClone = pdfRef.current.cloneNode(true) as HTMLElement;

    // Ensure all child elements are visible
    const allElements = contentClone.querySelectorAll("*");
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        // Ensure visibility
        if (htmlEl.style.display === "none") {
          htmlEl.style.display = "";
        }
        if (htmlEl.style.visibility === "hidden") {
          htmlEl.style.visibility = "visible";
        }
      }
    });

    // Expand AssumptionsPanel for PDF
    // First, try to find existing assumptions content and make it visible
    let assumptionsContent = contentClone.querySelector("#assumptions-content") as HTMLElement;
    
    // If assumptions content doesn't exist (panel was collapsed), create it
    if (!assumptionsContent) {
      const assumptionsPanel = contentClone.querySelector('[aria-controls="assumptions-content"]')?.closest('div[class*="bg-gray-50"]') as HTMLElement;
      if (assumptionsPanel) {
        const assumptions = getAuditAssumptions(DEFAULT_ELECTRICITY_RATE);
        
        // Create the assumptions content div
        const contentDiv = document.createElement("div");
        contentDiv.id = "assumptions-content";
        contentDiv.className = "mt-6 space-y-6";
        contentDiv.style.display = "block";
        
        assumptions.forEach((category) => {
          const categoryDiv = document.createElement("div");
          const title = document.createElement("h4");
          title.className = "text-base font-semibold text-gray-900 mb-3";
          title.textContent = category.title;
          categoryDiv.appendChild(title);
          
          const ul = document.createElement("ul");
          ul.className = "space-y-2";
          category.items.forEach((item) => {
            const li = document.createElement("li");
            li.className = "flex items-start";
            const bullet = document.createElement("span");
            bullet.className = "text-gray-400 mr-2 mt-1.5";
            bullet.textContent = "•";
            const text = document.createElement("span");
            text.className = "text-sm text-gray-700 leading-relaxed flex-1";
            text.textContent = item;
            li.appendChild(bullet);
            li.appendChild(text);
            ul.appendChild(li);
          });
          categoryDiv.appendChild(ul);
          contentDiv.appendChild(categoryDiv);
        });
        
        assumptionsPanel.appendChild(contentDiv);
        assumptionsContent = contentDiv;
      }
    } else {
      // Content exists, just make sure it's visible
      assumptionsContent.style.display = "block";
    }
    
    // Update button visual state to show expanded
    const assumptionsButton = contentClone.querySelector('[aria-controls="assumptions-content"]');
    if (assumptionsButton) {
      const buttonEl = assumptionsButton as HTMLElement;
      buttonEl.setAttribute("aria-expanded", "true");
      const svg = buttonEl.querySelector("svg");
      if (svg) {
        svg.style.transform = "rotate(180deg)";
      }
    }

    // Ensure AI Executive Summary content is visible if it exists
    // Look for sections with "Overview" heading which indicates AI summary is generated
    const allH4s = contentClone.querySelectorAll("h4");
    allH4s.forEach((h4) => {
      if (h4.textContent?.trim() === "Overview") {
        // Found AI summary, ensure parent container is visible
        let parent = h4.parentElement;
        while (parent && parent !== contentClone) {
          const parentEl = parent as HTMLElement;
          if (parentEl.style) {
            parentEl.style.display = "block";
          }
          parent = parent.parentElement;
        }
      }
    });

    pdfContainer.appendChild(contentClone);

    // Temporarily add to DOM (off-screen) for rendering
    pdfContainer.style.position = "absolute";
    pdfContainer.style.left = "-9999px";
    pdfContainer.style.top = "0";
    pdfContainer.style.overflow = "visible";
    document.body.appendChild(pdfContainer);

    try {
      await generatePDF(pdfContainer, submittedData.buildingName || "Building");
    } finally {
      document.body.removeChild(pdfContainer);
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
            <AIExecutiveSummarySection onGenerate={handleGenerateAISummary} />
          )}

          {insights.length > 0 && <KeyInsightsSection insights={insights} />}

          {ecmResults && ecmResults.length > 0 && (
            <TotalSavingsSummaryCard ecmResults={ecmResults} />
          )}

          {annualEnergyUse !== null &&
            submittedData.floorArea &&
            parseFloat(submittedData.floorArea) > 0 &&
            submittedData.businessType && (
              <EUIBenchmarkContext
                annualEnergyUse={annualEnergyUse}
                floorArea={parseFloat(submittedData.floorArea)}
                businessType={submittedData.businessType}
              />
            )}

          <BuildingSummary data={submittedData} />

          {annualEnergyUse !== null && (
            <EnergyBaseline
              annualEnergyUse={annualEnergyUse}
              annualEnergyCost={annualEnergyCost}
            />
          )}

          {endUseBreakdown && (
            <EnergyBreakdown breakdown={endUseBreakdown} />
          )}

          {ecmResults && ecmResults.length > 0 && (
            <ECMTable results={ecmResults} />
          )}

          <AssumptionsPanel />
        </div>
      </div>
    </div>
  );
}