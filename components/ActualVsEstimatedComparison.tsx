"use client";

import { UtilityComparison } from "@/lib/utility/types";

interface ActualVsEstimatedComparisonProps {
  comparison: UtilityComparison;
}

export default function ActualVsEstimatedComparison({
  comparison,
}: ActualVsEstimatedComparisonProps) {
  const {
    estimatedAnnualKwh,
    actualAnnualKwh,
    varianceKwh,
    variancePercent,
    estimatedEUI,
    actualEUI,
    assessmentNote,
  } = comparison;

  const isHigher = variancePercent > 0;
  const isSignificant = Math.abs(variancePercent) > 10;

  const getVarianceColor = () => {
    if (Math.abs(variancePercent) <= 10) return "text-green-600 bg-green-50";
    if (variancePercent > 0) return "text-amber-600 bg-amber-50";
    return "text-blue-600 bg-blue-50";
  };

  const getVarianceBadgeColor = () => {
    if (Math.abs(variancePercent) <= 10) return "bg-green-100 text-green-800";
    if (variancePercent > 0) return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Actual vs. Estimated Energy Use
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVarianceBadgeColor()}`}>
          {variancePercent > 0 ? "+" : ""}
          {variancePercent.toFixed(1)}% variance
        </span>
      </div>

      {/* Comparison bars */}
      <div className="space-y-4 mb-6">
        {/* Estimated */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Benchmark Estimate</span>
            <span className="font-medium text-gray-900">
              {estimatedAnnualKwh.toLocaleString()} kWh/year
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full"
              style={{
                width: `${Math.min(100, (estimatedAnnualKwh / Math.max(estimatedAnnualKwh, actualAnnualKwh)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            EUI: {estimatedEUI.toFixed(1)} kWh/sq ft/year
          </div>
        </div>

        {/* Actual */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Actual Usage</span>
            <span className="font-medium text-gray-900">
              {actualAnnualKwh.toLocaleString()} kWh/year
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isHigher ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(100, (actualAnnualKwh / Math.max(estimatedAnnualKwh, actualAnnualKwh)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            EUI: {actualEUI.toFixed(1)} kWh/sq ft/year
          </div>
        </div>
      </div>

      {/* Variance details */}
      <div className={`rounded-lg p-4 ${getVarianceColor()}`}>
        <div className="flex items-start gap-3">
          {isSignificant ? (
            isHigher ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )
          ) : (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <div>
            <p className="text-sm font-medium">
              {isHigher
                ? `Actual usage is ${Math.abs(varianceKwh).toLocaleString()} kWh higher than estimated`
                : varianceKwh < 0
                ? `Actual usage is ${Math.abs(varianceKwh).toLocaleString()} kWh lower than estimated`
                : "Actual usage matches the estimate"}
            </p>
            <p className="text-sm mt-1 opacity-90">{assessmentNote}</p>
          </div>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {estimatedEUI.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Benchmark EUI</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {actualEUI.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Actual EUI</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${isHigher ? "text-amber-600" : "text-blue-600"}`}>
            {variancePercent > 0 ? "+" : ""}
            {variancePercent.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Variance</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${isHigher ? "text-amber-600" : "text-blue-600"}`}>
            {varianceKwh > 0 ? "+" : ""}
            {(varianceKwh / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-gray-600">kWh Difference</div>
        </div>
      </div>

      {/* Recommendations based on variance */}
      {isSignificant && isHigher && (
        <div className="mt-4 p-4 border border-amber-200 rounded-lg bg-amber-50">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Recommended Actions
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Review equipment inventory for inefficient or aging systems</li>
            <li>• Check for operational issues (HVAC running 24/7, lights left on)</li>
            <li>• Consider an on-site walkthrough to identify hidden loads</li>
            <li>• Verify building occupancy and operating hours</li>
          </ul>
        </div>
      )}
    </div>
  );
}
