"use client";

import { useState, useRef } from "react";
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
import {
  parseUtilityCSV,
  generateTemplateCSV,
  downloadCSV,
  CSVParseResult,
} from "@/lib/utility/csvParser";
import { InfoTooltip } from "./ui/Tooltip";

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
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvWarnings, setCsvWarnings] = useState<string[]>([]);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setCsvErrors([]);
    setCsvWarnings([]);
    setCsvSuccess(false);
  };

  const handleDownloadTemplate = () => {
    const template = generateTemplateCSV();
    downloadCSV(template, "utility_bill_template.csv");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvErrors([]);
    setCsvWarnings([]);
    setCsvSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result: CSVParseResult = parseUtilityCSV(content);

      if (result.errors.length > 0) {
        setCsvErrors(result.errors);
        return;
      }

      setCsvWarnings(result.warnings);
      setCsvSuccess(true);

      // Check if any gas data was imported
      const hasGasData = result.data.some(
        (m) => (m.gasUsage !== null && m.gasUsage > 0) || (m.gasCost !== null && m.gasCost > 0)
      );
      if (hasGasData) {
        setShowGas(true);
      }

      // Calculate totals from imported data
      const totals = calculateUtilityTotals(result.data);
      const euiValues = calculateActualEUI(
        totals.totalElectricityKwh,
        totals.totalGasUsage,
        floorArea
      );

      const hasAnyData = result.data.some(
        (m) =>
          (m.electricityKwh !== null && m.electricityKwh > 0) ||
          (m.gasUsage !== null && m.gasUsage > 0)
      );

      onChange({
        ...utilityData,
        hasActualData: hasAnyData,
        monthlyData: result.data,
        totalElectricityKwh: totals.totalElectricityKwh,
        totalElectricityCost: totals.totalElectricityCost,
        totalGasUsage: totals.totalGasUsage,
        totalGasCost: totals.totalGasCost,
        actualEUI: euiValues.electricEUI,
        combinedEUI: euiValues.combinedEUI,
      });
    };

    reader.onerror = () => {
      setCsvErrors(["Failed to read the file. Please try again."]);
    };

    reader.readAsText(file);

    // Reset the input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validation = validateUtilityData(utilityData);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            Utility Bill Data
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
            <InfoTooltip 
              content="Enter your actual utility bills to compare real energy usage against the EUI-based estimate. This helps identify if your building is using more or less energy than typical buildings of your type."
              position="right"
            />
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
          {/* CSV Upload Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Import from CSV</h4>
                <p className="text-sm text-gray-600">
                  Upload a CSV file with your utility bill data, or enter manually below.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template
                  </span>
                </button>
                <label className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload CSV
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* CSV Feedback Messages */}
            {csvSuccess && csvWarnings.length === 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CSV imported successfully!
                </p>
              </div>
            )}

            {csvWarnings.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-1">CSV imported with warnings:</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {csvWarnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {csvErrors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">CSV import failed:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {csvErrors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                  <span className="text-blue-700">Total kWh:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {utilityData.totalElectricityKwh.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Floor Area:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {floorArea > 0 ? `${floorArea.toLocaleString()} sq ft` : <span className="text-amber-600">Not entered</span>}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Actual EUI:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {floorArea > 0 && utilityData.actualEUI 
                      ? `${utilityData.actualEUI.toFixed(1)} kWh/sq ft` 
                      : <span className="text-gray-500">—</span>}
                  </span>
                </div>
                {showGas && utilityData.combinedEUI && floorArea > 0 && (
                  <div>
                    <span className="text-blue-700">Combined EUI:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {utilityData.combinedEUI.toFixed(1)} kWh-eq/sq ft
                    </span>
                  </div>
                )}
              </div>
              
              {/* Floor area warning */}
              {floorArea <= 0 && (
                <p className="mt-3 text-sm text-amber-700 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Enter the Floor Area in the Building Information section above to calculate Actual EUI.
                </p>
              )}

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
