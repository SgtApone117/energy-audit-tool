"use client";

import { useState } from "react";
import type { AIExecutiveSummaryOutput } from "@/lib/ai/types";

interface AIExecutiveSummarySectionProps {
  onGenerate: () => Promise<AIExecutiveSummaryOutput>;
}

export default function AIExecutiveSummarySection({
  onGenerate,
}: AIExecutiveSummarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<AIExecutiveSummaryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setIsExpanded(true);

    try {
      const result = await onGenerate();
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate executive summary");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Executive Summary</h3>
        {!isExpanded && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Executive Summary
              </>
            )}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
              <p className="mt-4 text-sm text-gray-600">Generating professional executive summary...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {summary && !isLoading && (
            <div className="space-y-6 text-gray-700">
              {/* Overview */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Overview</h4>
                <p className="text-sm leading-relaxed">{summary.overview}</p>
              </div>

              {/* Energy Performance Snapshot */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Energy Performance Snapshot
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {summary.energyPerformanceSnapshot.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Key Findings */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Key Findings</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {summary.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Focus Areas */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Recommended Focus Areas
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {summary.recommendedFocusAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>

              {/* Top Energy Conservation Measures */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Top Energy Conservation Measures
                </h4>
                <p className="text-sm leading-relaxed">{summary.topEnergyConservationMeasures}</p>
              </div>

              {/* Business Impact Summary */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Business Impact Summary</h4>
                <p className="text-sm leading-relaxed">{summary.businessImpactSummary}</p>
              </div>

              {/* Disclaimer */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">{summary.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
