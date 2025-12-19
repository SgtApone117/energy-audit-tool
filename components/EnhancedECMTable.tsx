"use client";

import { useState } from "react";
import { ECMCalculationSummary, EnhancedECMResult, formatPaybackRange } from "@/lib/ecm";
import { InfoTooltip } from "./ui/Tooltip";

interface EnhancedECMTableProps {
  ecmSummary: ECMCalculationSummary;
}

export default function EnhancedECMTable({ ecmSummary }: EnhancedECMTableProps) {
  const [showAllECMs, setShowAllECMs] = useState(false);
  const [selectedView, setSelectedView] = useState<"summary" | "detailed">("summary");

  const displayedECMs = showAllECMs ? ecmSummary.ecms : ecmSummary.ecms.slice(0, 8);

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatCurrencyRange = (range: { low: number; typical: number; high: number }) => {
    return `${formatCurrency(range.low)} - ${formatCurrency(range.high)}`;
  };

  const formatKwhRange = (range: { low: number; typical: number; high: number }) => {
    const formatKwh = (val: number) => {
      if (val >= 10000) return `${(val / 1000).toFixed(0)}k`;
      return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };
    return `${formatKwh(range.low)} - ${formatKwh(range.high)}`;
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          Savings Opportunities (Enhanced Analysis)
          <InfoTooltip 
            content="Detailed ECM analysis with confidence ranges, utility rebate estimates, and interactive effects between measures. Low-High ranges reflect typical variation in real-world implementations."
            position="right"
          />
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedView("summary")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedView === "summary"
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setSelectedView("detailed")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedView === "detailed"
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-xs font-medium text-green-700 uppercase tracking-wider mb-1">
            Annual Savings
          </div>
          <div className="text-xl font-bold text-green-900">
            {formatCurrencyRange(ecmSummary.totalCostSavings)}
          </div>
          <div className="text-xs text-green-700 mt-1">
            typical: {formatCurrency(ecmSummary.totalCostSavings.typical)}/yr
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">
            Implementation Cost
          </div>
          <div className="text-xl font-bold text-blue-900">
            {formatCurrencyRange(ecmSummary.totalImplementationCost)}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            typical: {formatCurrency(ecmSummary.totalImplementationCost.typical)}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-1 flex items-center">
            Est. Rebates
            <InfoTooltip content="Estimated utility rebates based on typical incentive programs. Actual rebates vary by utility and program availability." />
          </div>
          <div className="text-xl font-bold text-purple-900">
            {formatCurrency(ecmSummary.totalRebates)}
          </div>
          <div className="text-xs text-purple-700 mt-1">
            net cost: {formatCurrency(ecmSummary.totalNetCost.typical)}
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">
            Simple Payback
          </div>
          <div className="text-xl font-bold text-amber-900">
            {formatPaybackRange(ecmSummary.blendedPayback)}
          </div>
          <div className="text-xs text-amber-700 mt-1">
            after rebates
          </div>
        </div>
      </div>

      {/* Interactive Effects Note */}
      {ecmSummary.interactiveEffectsApplied && ecmSummary.interactiveSavingsBonus > 0 && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Interactive Effects: +{formatCurrency(ecmSummary.interactiveSavingsBonus)}/yr bonus savings
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Measures like LED upgrades reduce cooling loads, creating additional savings beyond individual ECM estimates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ECM Table */}
      {selectedView === "summary" ? (
        <div className="overflow-x-auto -mx-8">
          <div className="inline-block min-w-full align-middle px-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Measure
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <span className="flex items-center justify-end gap-1">
                      Annual Savings
                      <InfoTooltip content="Range of expected annual cost savings ($/year)" position="top" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <span className="flex items-center justify-end gap-1">
                      Net Cost
                      <InfoTooltip content="Implementation cost minus estimated rebates" position="top" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payback
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedECMs.map((ecm) => (
                  <ECMRow key={ecm.id} ecm={ecm} view="summary" />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedECMs.map((ecm) => (
            <ECMDetailCard key={ecm.id} ecm={ecm} />
          ))}
        </div>
      )}

      {/* Show More Button */}
      {ecmSummary.ecms.length > 8 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAllECMs(!showAllECMs)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAllECMs
              ? "Show fewer measures"
              : `Show all ${ecmSummary.ecms.length} measures`}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Priority:</strong> High = &lt;2yr payback, Medium = 2-4yr, Low = &gt;4yr.
          Savings ranges reflect typical variation in equipment costs, installation complexity, and building conditions.
          Rebate estimates are indicative—contact your utility for current programs.
        </p>
      </div>
    </div>
  );
}

function ECMRow({ ecm, view }: { ecm: EnhancedECMResult; view: "summary" | "detailed" }) {
  const formatCurrency = (value: number) => {
    if (value >= 10000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{ecm.name}</div>
        {ecm.hasInteractiveEffects && (
          <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
            ✓ Interactive
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {ecm.category}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(ecm.costSaved.typical)}/yr
        </div>
        <div className="text-xs text-gray-500">
          {formatCurrency(ecm.costSaved.low)} - {formatCurrency(ecm.costSaved.high)}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(ecm.netCost.typical)}
        </div>
        {ecm.estimatedRebate > 0 && (
          <div className="text-xs text-purple-600">
            -{formatCurrency(ecm.estimatedRebate)} rebate
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
        {formatPaybackRange(ecm.paybackPeriod)}
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            ecm.priority === "High"
              ? "bg-green-100 text-green-800"
              : ecm.priority === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {ecm.priority}
        </span>
      </td>
    </tr>
  );
}

function ECMDetailCard({ ecm }: { ecm: EnhancedECMResult }) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{ecm.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{ecm.description}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            ecm.priority === "High"
              ? "bg-green-100 text-green-800"
              : ecm.priority === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {ecm.priority}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-xs text-gray-500 uppercase">Energy Saved</div>
          <div className="font-medium text-gray-900">
            {Math.round(ecm.energySaved.typical).toLocaleString()} kWh/yr
          </div>
          <div className="text-xs text-gray-500">
            Range: {Math.round(ecm.energySaved.low).toLocaleString()} - {Math.round(ecm.energySaved.high).toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase">Cost Saved</div>
          <div className="font-medium text-green-700">
            {formatCurrency(ecm.costSaved.typical)}/yr
          </div>
          <div className="text-xs text-gray-500">
            Range: {formatCurrency(ecm.costSaved.low)} - {formatCurrency(ecm.costSaved.high)}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase">Implementation</div>
          <div className="font-medium text-gray-900">
            {formatCurrency(ecm.implementationCost.typical)}
          </div>
          {ecm.estimatedRebate > 0 && (
            <div className="text-xs text-purple-600">
              Rebate: ~{formatCurrency(ecm.estimatedRebate)}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase">Payback</div>
          <div className="font-medium text-gray-900">
            {formatPaybackRange(ecm.paybackPeriod)}
          </div>
          <div className="text-xs text-gray-500">
            Life: {ecm.lifespan} years
          </div>
        </div>
      </div>

      {ecm.hasInteractiveEffects && ecm.interactiveNotes.length > 0 && (
        <div className="mt-3 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
          <strong>Bonus:</strong> {ecm.interactiveNotes.join("; ")}
        </div>
      )}

      {ecm.rebateNotes && (
        <div className="mt-2 text-xs text-gray-500">
          <strong>Rebate info:</strong> {ecm.rebateNotes}
        </div>
      )}
    </div>
  );
}
