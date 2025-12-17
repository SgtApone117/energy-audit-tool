import type { ECMResult } from "@/lib/types";

interface ECMTableProps {
  results: ECMResult[];
}

export default function ECMTable({ results }: ECMTableProps) {
  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Savings Opportunities</h3>
      <div className="overflow-x-auto -mx-8">
        <div className="inline-block min-w-full align-middle px-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Measure
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Energy Saved<br />(kWh/year)
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Annual Cost Savings<br />($/year)
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estimated Cost<br />($)
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payback<br />(years)
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Priority
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

