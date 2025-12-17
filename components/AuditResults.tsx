"use client";

import { useRef } from "react";
import type { FormData, ECMResult } from "@/lib/types";
import { generatePDF } from "@/lib/pdfExport";
import BuildingSummary from "./BuildingSummary";
import EnergyBaseline from "./EnergyBaseline";
import EnergyBreakdown from "./EnergyBreakdown";
import ECMTable from "./ECMTable";

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
        </div>
      </div>
    </div>
  );
}

