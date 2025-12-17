"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EnergyBreakdownProps {
  breakdown: Record<string, number>;
}

export default function EnergyBreakdown({ breakdown }: EnergyBreakdownProps) {
  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Energy Breakdown</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center">
          <dl className="space-y-0">
            {Object.entries(breakdown).map(([category, kwh]) => (
              <div key={category} className="flex justify-between items-center py-3.5 border-b border-gray-100 last:border-0">
                <dt className="text-sm font-medium text-gray-700">{category}</dt>
                <dd className="text-sm font-semibold text-gray-900 tabular-nums">{Math.round(kwh).toLocaleString()} kWh/year</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(breakdown).map(([category, kwh]) => ({
                name: category,
                value: Math.round(kwh),
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                label={{ value: "kWh/year", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#6b7280" } }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} kWh/year`}
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

