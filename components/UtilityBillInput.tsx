"use client";

import { useState } from "react";
import {
  UtilityBillData,
  MonthlyUtilityData,
  MONTHS,
  createEmptyUtilityData,
} from "@/lib/utility/types";
import {
  calculateUtilityTotals,
  calculateActualEUI,
  validateUtilityData,
} from "@/lib/utility/utilityAnalysis";

interface UtilityBillInputProps {
  utilityData: UtilityBillData;
  onChange: (data: UtilityBillData) => void;
  floorArea: number;
}

export default function UtilityBillInput({
  utilityData,
  onChange,
  floorArea,
}: UtilityBillInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGas, setShowGas] = useState(false);

  const handleMonthlyChange = (
    monthIndex: number,
    field: keyof MonthlyUtilityData,
    value: string
  ) => {
    const numValue = value === "" ? null : parseFloat(value);
    const newMonthlyData = [...utilityData.monthlyData];
    newMonthlyData[monthIndex] = {
      ...newMonthlyData[monthIndex],
      [field]: numValue,
    };

    // Recalculate totals
    const totals = calculateUtilityTotals(newMonthlyData);
    const euiValues = calculateActualEUI(
      totals.totalElectricityKwh,
      totals.totalGasUsage,
      floorArea
    );

    const hasAnyData =
      newMonthlyData.some(
        (m) =>
          (m.electricityKwh !== null && m.electricityKwh > 0) ||
          (m.gasUsage !== null && m.gasUsage > 0)
      );

    onChange({
      ...utilityData,
      hasActualData: hasAnyData,
      monthlyData: newMonthlyData,
      totalElectricityKwh: totals.totalElectricityKwh,
      totalElectricityCost: totals.totalElectricityCost,
      totalGasUsage: totals.totalGasUsage,
      totalGasCost: totals.totalGasCost,
      actualEUI: euiValues.electricEUI,
      combinedEUI: euiValues.combinedEUI,
    });
  };

  const handleClearAll = () => {
    onChange(createEmptyUtilityData());
  };

  const validation = validateUtilityData(utilityData);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Utility Bill Data
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Enter actual utility data for more accurate analysis
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Enter Utility Data
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Toggle for gas data */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGas}
                onChange={(e) => setShowGas(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include natural gas data</span>
            </label>
            {utilityData.hasActualData && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all data
              </button>
            )}
          </div>

          {/* Monthly data table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-700">Month</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700">
                    Electricity (kWh)
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700">
                    Electricity Cost ($)
                  </th>
                  {showGas && (
                    <>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Gas (therms)
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Gas Cost ($)
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((month, index) => (
                  <tr key={month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-700">{month}</td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={utilityData.monthlyData[index].electricityKwh ?? ""}
                        onChange={(e) =>
                          handleMonthlyChange(index, "electricityKwh", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={utilityData.monthlyData[index].electricityCost ?? ""}
                        onChange={(e) =>
                          handleMonthlyChange(index, "electricityCost", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    {showGas && (
                      <>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            value={utilityData.monthlyData[index].gasUsage ?? ""}
                            onChange={(e) =>
                              handleMonthlyChange(index, "gasUsage", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={utilityData.monthlyData[index].gasCost ?? ""}
                            onChange={(e) =>
                              handleMonthlyChange(index, "gasCost", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="py-2 px-2 text-gray-900">Total</td>
                  <td className="py-2 px-2 text-right text-gray-900">
                    {utilityData.totalElectricityKwh.toLocaleString()} kWh
                  </td>
                  <td className="py-2 px-2 text-right text-gray-900">
                    ${utilityData.totalElectricityCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  {showGas && (
                    <>
                      <td className="py-2 px-2 text-right text-gray-900">
                        {utilityData.totalGasUsage.toLocaleString()} therms
                      </td>
                      <td className="py-2 px-2 text-right text-gray-900">
                        ${utilityData.totalGasCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary and validation */}
          {utilityData.hasActualData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Data Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Months entered:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {validation.electricityMonthsEntered}/12
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Actual EUI:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {utilityData.actualEUI?.toFixed(1) ?? "—"} kWh/sq ft
                  </span>
                </div>
                {showGas && utilityData.combinedEUI && (
                  <div>
                    <span className="text-blue-700">Combined EUI:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {utilityData.combinedEUI.toFixed(1)} kWh-eq/sq ft
                    </span>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="mt-3 space-y-1">
                  {validation.warnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {warning}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
