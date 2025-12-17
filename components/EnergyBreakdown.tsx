"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EnergyBreakdownProps {
  breakdown: Record<string, number>;
}

export default function EnergyBreakdown({ breakdown }: EnergyBreakdownProps) {
  return (
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Breakdown</h3>
      <dl className="space-y-2 mb-6">
        {Object.entries(breakdown).map(([category, kwh]) => (
          <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-700">{category}:</dt>
            <dd className="text-sm text-gray-900">{kwh.toLocaleString()} kWh/year</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(breakdown).map(([category, kwh]) => ({
              name: category,
              value: Math.round(kwh),
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: "kWh/year", angle: -90, position: "insideLeft" }}
            />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} kWh/year`}
            />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

