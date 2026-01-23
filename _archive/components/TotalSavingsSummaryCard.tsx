import type { ECMResult } from "@/lib/types";
import { ECMCalculationSummary, formatPaybackRange } from "@/lib/ecm";
import { InfoTooltip } from "./ui/Tooltip";

interface TotalSavingsSummaryCardProps {
  ecmResults?: ECMResult[] | null;
  enhancedEcmResults?: ECMCalculationSummary | null;
}

/**
 * Displays a high-level financial snapshot of aggregated ECM savings.
 * Uses enhanced data with confidence ranges when available.
 */
export default function TotalSavingsSummaryCard({
  ecmResults,
  enhancedEcmResults,
}: TotalSavingsSummaryCardProps) {
  // Use enhanced data if available
  if (enhancedEcmResults && enhancedEcmResults.ecms.length > 0) {
    return <EnhancedSummaryCard summary={enhancedEcmResults} />;
  }

  // Fall back to legacy data
  if (!ecmResults || ecmResults.length === 0) {
    return null;
  }

  // Aggregate existing ECM values (read-only aggregation, no new calculations)
  const totalEnergySavings = ecmResults.reduce((sum, ecm) => sum + ecm.energySaved, 0);
  const totalCostSavings = ecmResults.reduce((sum, ecm) => sum + ecm.costSaved, 0);
  const totalImplementationCost = ecmResults.reduce((sum, ecm) => sum + ecm.implementationCost, 0);

  // Calculate blended payback: total cost / total savings (simple aggregation)
  const blendedPaybackPeriod =
    totalCostSavings > 0 ? totalImplementationCost / totalCostSavings : Infinity;

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        Total Savings Summary
        <InfoTooltip 
          content="Combined totals if all recommended Energy Conservation Measures (ECMs) are implemented. Note: Savings may not be fully additive due to interactive effects between measures."
          position="right"
        />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Total Annual Energy Savings
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(totalEnergySavings).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">kWh/year</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Total Annual Cost Savings
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalCostSavings.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-sm text-gray-600 mt-2">/year</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Estimated Implementation Cost
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(totalImplementationCost).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">one-time</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Estimated Simple Payback
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {blendedPaybackPeriod === Infinity
              ? "—"
              : blendedPaybackPeriod.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-2">years</div>
        </div>
      </div>
    </div>
  );
}

function EnhancedSummaryCard({ summary }: { summary: ECMCalculationSummary }) {
  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatRange = (range: { low: number; typical: number; high: number }) => {
    return `${formatCurrency(range.low)} – ${formatCurrency(range.high)}`;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        Total Savings Summary
        <InfoTooltip 
          content="Combined totals if all recommended ECMs are implemented. Ranges show typical variation based on equipment costs, installation complexity, and building conditions. Net cost includes estimated utility rebates."
          position="right"
        />
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Energy Savings */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Annual Energy Savings
          </div>
          <div className="text-xl font-bold text-gray-900">
            {Math.round(summary.totalEnergySavings.typical).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">kWh/year</div>
          <div className="text-xs text-gray-500 mt-2">
            Range: {Math.round(summary.totalEnergySavings.low).toLocaleString()} – {Math.round(summary.totalEnergySavings.high).toLocaleString()}
          </div>
        </div>

        {/* Cost Savings */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Annual Cost Savings
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(summary.totalCostSavings.typical)}
          </div>
          <div className="text-sm text-gray-600">/year</div>
          <div className="text-xs text-gray-500 mt-2">
            Range: {formatRange(summary.totalCostSavings)}
          </div>
        </div>

        {/* Implementation Cost */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Implementation Cost
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(summary.totalImplementationCost.typical)}
          </div>
          <div className="text-sm text-gray-600">one-time</div>
          <div className="text-xs text-gray-500 mt-2">
            Range: {formatRange(summary.totalImplementationCost)}
          </div>
        </div>

        {/* Rebates & Net Cost */}
        <div className="bg-white p-5 rounded-lg border border-purple-200 bg-purple-50/50">
          <div className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2 flex items-center">
            Rebates & Net Cost
            <InfoTooltip content="Estimated utility rebates based on typical programs. Net cost = Implementation minus rebates." />
          </div>
          <div className="text-xl font-bold text-purple-700">
            -{formatCurrency(summary.totalRebates)}
          </div>
          <div className="text-sm text-gray-600">est. rebates</div>
          <div className="text-xs text-purple-700 mt-2 font-medium">
            Net: {formatCurrency(summary.totalNetCost.typical)}
          </div>
        </div>

        {/* Payback */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Simple Payback
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatPaybackRange(summary.blendedPayback)}
          </div>
          <div className="text-sm text-gray-600">after rebates</div>
          {summary.interactiveEffectsApplied && summary.interactiveSavingsBonus > 0 && (
            <div className="text-xs text-emerald-600 mt-2">
              +{formatCurrency(summary.interactiveSavingsBonus)} bonus
            </div>
          )}
        </div>
      </div>

      {/* Interactive Effects Note */}
      {summary.interactiveEffectsApplied && summary.interactiveSavingsBonus > 0 && (
        <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-800">
            <strong>Interactive Effects Bonus:</strong> +{formatCurrency(summary.interactiveSavingsBonus)}/yr additional savings from measures that reduce loads in other categories (e.g., LED upgrades reduce cooling needs).
          </p>
        </div>
      )}
    </div>
  );
}
