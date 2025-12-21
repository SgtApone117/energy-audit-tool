"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { InfoTooltip } from "./ui/Tooltip";

interface EnergyBreakdownProps {
  breakdown: Record<string, number>;
  sources?: Record<string, "equipment" | "estimated">;
  hasEquipmentData?: boolean;
}

export default function EnergyBreakdown({ breakdown, sources, hasEquipmentData }: EnergyBreakdownProps) {
  // Define colors for equipment vs estimated data
  const getBarColor = (category: string) => {
    if (sources && sources[category] === "equipment") {
      return "#059669"; // Green for equipment-calculated
    }
    return "#2563eb"; // Blue for estimated
  };

  const chartData = Object.entries(breakdown).map(([category, kwh]) => ({
    name: category,
    value: Math.round(kwh),
    source: sources?.[category] || "estimated",
  }));

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          Energy Breakdown
          <InfoTooltip 
            content="Distribution of estimated annual energy consumption by end-use category. This breakdown helps identify which systems consume the most energy and where savings opportunities may exist."
            position="right"
          />
        </h3>
        {hasEquipmentData && (
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              From Equipment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              Estimated
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center">
          <dl className="space-y-0">
            {Object.entries(breakdown).map(([category, kwh]) => {
              const source = sources?.[category];
              return (
                <div key={category} className="flex justify-between items-center py-3.5 border-b border-gray-100 last:border-0">
                  <dt className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {category}
                    {source === "equipment" && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                        Equipment
                      </span>
                    )}
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 tabular-nums">
                    {Math.round(kwh).toLocaleString()} kWh/year
                  </dd>
                </div>
              );
            })}
          </dl>
          
          {/* Total row */}
          <div className="flex justify-between items-center py-3.5 mt-2 border-t-2 border-gray-300">
            <dt className="text-sm font-bold text-gray-900">Total</dt>
            <dd className="text-sm font-bold text-gray-900 tabular-nums">
              {Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0)).toLocaleString()} kWh/year
            </dd>
          </div>
        </div>
        
        <div id="energy-breakdown-chart">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 13, fill: "#4b5563" }}
                interval={0}
              />
              <YAxis
                label={{ value: "kWh/year", angle: -90, position: "insideLeft", style: { fontSize: 13, fill: "#4b5563" } }}
                tick={{ fontSize: 13, fill: "#4b5563" }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} kWh/year`, "Energy"]}
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
