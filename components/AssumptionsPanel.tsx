"use client";

import { useState } from "react";
import { getAuditAssumptions } from "@/lib/assumptions/auditAssumptions";
import { DEFAULT_ELECTRICITY_RATE } from "@/lib/data";

interface AssumptionsPanelProps {
  electricityRate?: number;
  alwaysExpanded?: boolean; // For PDF export - forces content to always be visible
}

/**
 * Displays an expandable panel showing key assumptions and methodology used in the audit.
 * This component is read-only and uses existing Phase 0 assumptions only.
 */
export default function AssumptionsPanel({ 
  electricityRate = DEFAULT_ELECTRICITY_RATE,
  alwaysExpanded = false 
}: AssumptionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowContent = alwaysExpanded || isExpanded;

  const assumptions = getAuditAssumptions(electricityRate);

  return (
    <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg p-2 -m-2"
        aria-expanded={shouldShowContent}
        aria-controls="assumptions-content"
        style={alwaysExpanded ? { cursor: "default" } : undefined}
      >
        <h3 className="text-lg font-semibold text-gray-900">Assumptions & Methodology</h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${shouldShowContent ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {shouldShowContent && (
        <div id="assumptions-content" className="mt-6 space-y-6">
          {assumptions.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h4 className="text-base font-semibold text-gray-900 mb-3">{category.title}</h4>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1.5">•</span>
                    <span className="text-sm text-gray-700 leading-relaxed flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
