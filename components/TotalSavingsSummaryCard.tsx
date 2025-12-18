import type { ECMResult } from "@/lib/types";

interface TotalSavingsSummaryCardProps {
  ecmResults: ECMResult[];
}

/**
 * Displays a high-level financial snapshot of aggregated ECM savings.
 * This component is read-only and uses existing ECM aggregate values only.
 */
export default function TotalSavingsSummaryCard({
  ecmResults,
}: TotalSavingsSummaryCardProps) {
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Total Savings Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Annual Energy Savings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Total Annual Energy Savings
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(totalEnergySavings).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">kWh/year</div>
        </div>

        {/* Total Annual Cost Savings */}
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

        {/* Total Estimated Implementation Cost */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Estimated Implementation Cost
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(totalImplementationCost).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">one-time</div>
        </div>

        {/* Blended Simple Payback Period */}
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

