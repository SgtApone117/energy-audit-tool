import type { ECMResult } from "@/lib/types";

interface ECMTableProps {
  results: ECMResult[];
}

export default function ECMTable({ results }: ECMTableProps) {
  return (
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Opportunities</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Measure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Energy Saved (kWh/year)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Annual Cost Savings ($/year)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Estimated Cost ($)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Payback (years)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((ecm, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm text-gray-900">{ecm.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {Math.round(ecm.energySaved).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ${ecm.costSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ${Math.round(ecm.implementationCost).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {ecm.paybackPeriod === Infinity 
                    ? "—" 
                    : ecm.paybackPeriod.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
  );
}

