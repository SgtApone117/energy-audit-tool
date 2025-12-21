import type { ECMResult } from "@/lib/types";
import { InfoTooltip } from "./ui/Tooltip";

interface ECMTableProps {
  results: ECMResult[];
}

export default function ECMTable({ results }: ECMTableProps) {
  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        Savings Opportunities
        <InfoTooltip 
          content="Energy Conservation Measures (ECMs) are recommended upgrades to reduce energy consumption. Each measure shows estimated savings, implementation cost, and simple payback period. Priority is based on payback: High (<2 years), Medium (2-4 years), Low (>4 years)."
          position="right"
        />
      </h3>
      <div className="overflow-x-auto -mx-8">
        <div className="inline-block min-w-full align-middle px-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Measure
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    Energy Saved
                    <InfoTooltip content="Estimated annual energy reduction in kilowatt-hours if this measure is implemented." position="top" />
                  </span>
                  <span className="font-normal">(kWh/year)</span>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    Cost Savings
                    <InfoTooltip content="Annual dollar savings based on energy reduction and your state's electricity rate." position="top" />
                  </span>
                  <span className="font-normal">($/year)</span>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    Est. Cost
                    <InfoTooltip content="Estimated implementation cost based on your building's floor area and typical costs per square foot." position="top" />
                  </span>
                  <span className="font-normal">($)</span>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    Payback
                    <InfoTooltip content="Simple payback period: Implementation Cost ÷ Annual Savings. Shorter payback = better ROI." position="top" />
                  </span>
                  <span className="font-normal">(years)</span>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1">
                    Priority
                    <InfoTooltip content="High: <2 year payback, Medium: 2-4 years, Low: >4 years. Higher priority = faster return on investment." position="top" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((ecm, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ecm.name}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium tabular-nums">
                    {Math.round(ecm.energySaved).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium tabular-nums">
                    ${ecm.costSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium tabular-nums">
                    ${Math.round(ecm.implementationCost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium tabular-nums">
                    {ecm.paybackPeriod === Infinity
                      ? "—"
                      : ecm.paybackPeriod.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

