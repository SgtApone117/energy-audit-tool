'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, Button, Input, Alert, FileUpload } from '@/components/ui';
import { 
  Plus, 
  Trash2,
  Zap,
  Flame,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { AuditUtilityBill, generateId } from '@/lib/auditor/types';
import { parseAuditorUtilityBillCSV, generateAuditorCSVTemplate } from '@/lib/auditor/csv/billParser';

interface UtilityBillFormProps {
  bills: AuditUtilityBill[];
  squareFootage: number;
  onBillsChange: (bills: AuditUtilityBill[]) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

type InputMode = 'manual' | 'csv';

interface CSVUploadResult {
  success: boolean;
  billsCount: number;
  errors: string[];
  warnings: string[];
}

export function UtilityBillForm({ bills, squareFootage, onBillsChange }: UtilityBillFormProps) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR - 1);
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [csvResult, setCsvResult] = useState<CSVUploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get bill for a specific month/year
  const getBill = useCallback((month: string, year: number) => {
    return bills.find(b => b.month === month && b.year === year);
  }, [bills]);

  // Update or create bill
  const updateBill = useCallback((month: string, year: number, field: keyof AuditUtilityBill, value: number | undefined) => {
    const existingIndex = bills.findIndex(b => b.month === month && b.year === year);
    
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...bills];
      updated[existingIndex] = { ...updated[existingIndex], [field]: value };
      onBillsChange(updated);
    } else {
      // Create new
      const newBill: AuditUtilityBill = {
        month,
        year,
        [field]: value,
      };
      onBillsChange([...bills, newBill]);
    }
  }, [bills, onBillsChange]);

  // Calculate totals and metrics
  const stats = useMemo(() => {
    const yearBills = bills.filter(b => b.year === selectedYear);
    
    const totalElecKwh = yearBills.reduce((sum, b) => sum + (b.electricityKwh || 0), 0);
    const totalElecCost = yearBills.reduce((sum, b) => sum + (b.electricityCost || 0), 0);
    const totalGasTherm = yearBills.reduce((sum, b) => sum + (b.gasTherm || 0), 0);
    const totalGasCost = yearBills.reduce((sum, b) => sum + (b.gasCost || 0), 0);
    
    const totalCost = totalElecCost + totalGasCost;
    const monthsWithData = yearBills.filter(b => 
      b.electricityKwh || b.electricityCost || b.gasTherm || b.gasCost
    ).length;

    // Calculate EUI (kBTU/sqft/year)
    // Electricity: 1 kWh = 3.412 kBTU
    // Natural Gas: 1 therm = 100 kBTU
    const elecKBTU = totalElecKwh * 3.412;
    const gasKBTU = totalGasTherm * 100;
    const totalKBTU = elecKBTU + gasKBTU;
    const eui = squareFootage > 0 ? totalKBTU / squareFootage : 0;

    // Average rate
    const avgElecRate = totalElecKwh > 0 ? totalElecCost / totalElecKwh : 0;
    const avgGasRate = totalGasTherm > 0 ? totalGasCost / totalGasTherm : 0;

    return {
      totalElecKwh,
      totalElecCost,
      totalGasTherm,
      totalGasCost,
      totalCost,
      monthsWithData,
      eui,
      avgElecRate,
      avgGasRate,
    };
  }, [bills, selectedYear, squareFootage]);

  // Prefill with 12 months
  const handlePrefillYear = () => {
    const existingMonths = bills.filter(b => b.year === selectedYear).map(b => b.month);
    const newBills = MONTHS
      .filter(month => !existingMonths.includes(month))
      .map(month => ({
        month,
        year: selectedYear,
      }));
    onBillsChange([...bills, ...newBills]);
  };

  // Clear year data
  const handleClearYear = () => {
    onBillsChange(bills.filter(b => b.year !== selectedYear));
  };

  // Handle CSV file selection
  const handleCSVUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setCsvResult(null);

    try {
      const text = await file.text();
      const result = parseAuditorUtilityBillCSV(text);

      if (result.success) {
        // Merge with existing bills (replace duplicates)
        const existingBills = bills.filter(existing => 
          !result.bills.some(newBill => 
            newBill.month === existing.month && newBill.year === existing.year
          )
        );
        onBillsChange([...existingBills, ...result.bills]);

        // Set the year filter to show the imported data
        if (result.bills.length > 0) {
          const firstYear = result.bills[0].year;
          if (YEARS.includes(firstYear)) {
            setSelectedYear(firstYear);
          }
        }
      }

      setCsvResult({
        success: result.success,
        billsCount: result.bills.length,
        errors: result.errors,
        warnings: result.warnings,
      });
    } catch (error) {
      setCsvResult({
        success: false,
        billsCount: 0,
        errors: ['Failed to read CSV file. Please check the file format.'],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  }, [bills, onBillsChange]);

  // Download template
  const handleDownloadTemplate = () => {
    const template = generateAuditorCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utility_bills_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCSVUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Utility Bills</h2>
          <p className="text-sm text-gray-600">
            Enter monthly electricity and gas usage data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Input Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setInputMode('manual')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setInputMode('csv')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-1" />
              CSV Upload
            </button>
          </div>
        </div>
      </div>

      {/* CSV Upload Mode */}
      {inputMode === 'csv' && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload Utility Bill CSV</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a CSV file with your monthly utility data
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Select CSV File'}
                </label>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Expected columns:</strong></p>
                <p>month, year, electricity_kwh, electricity_cost, gas_therms, gas_cost</p>
                <p className="italic">Or use a date column (e.g., 2024-01, January 2024)</p>
              </div>
            </div>

            {/* CSV Result */}
            {csvResult && (
              <div className="mt-6">
                {csvResult.success ? (
                  <Alert variant="success">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                      <div>
                        <div className="font-medium">Successfully imported {csvResult.billsCount} months of data</div>
                        {csvResult.warnings.length > 0 && (
                          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                            {csvResult.warnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="error">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <div className="font-medium">Failed to import CSV</div>
                        <ul className="mt-2 text-sm list-disc list-inside">
                          {csvResult.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Alert>
                )}
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => setCsvResult(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Year Selector and Actions (for manual mode or always visible) */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {YEARS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {inputMode === 'manual' && (
          <Button variant="outline" onClick={handlePrefillYear}>
            <Calendar className="w-4 h-4 mr-2" />
            Prefill Months
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {stats.monthsWithData > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Electricity</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalElecKwh.toLocaleString()} kWh
              </p>
              <p className="text-sm text-gray-500">
                ${stats.totalElecCost.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Natural Gas</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalGasTherm.toLocaleString()} therms
              </p>
              <p className="text-sm text-gray-500">
                ${stats.totalGasCost.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm">Total Cost</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                ${stats.totalCost.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {stats.monthsWithData} months data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm">EUI</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stats.eui.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">
                kBTU/sqft/year
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Entry Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Month</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700" colSpan={2}>
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Electricity
                    </div>
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-700" colSpan={2}>
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Natural Gas
                    </div>
                  </th>
                </tr>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500"></th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">kWh</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Cost ($)</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Therms</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Cost ($)</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((month, idx) => {
                  const bill = getBill(month, selectedYear);
                  const hasData = bill?.electricityKwh || bill?.electricityCost || bill?.gasTherm || bill?.gasCost;
                  return (
                    <tr 
                      key={month} 
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${hasData ? 'ring-1 ring-inset ring-blue-100' : ''}`}
                    >
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {month}
                        {hasData && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" title="Has data"></span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={bill?.electricityKwh ?? ''}
                          onChange={(e) => updateBill(month, selectedYear, 'electricityKwh', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="0"
                          className="text-center text-sm h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={bill?.electricityCost ?? ''}
                          onChange={(e) => updateBill(month, selectedYear, 'electricityCost', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="0"
                          className="text-center text-sm h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={bill?.gasTherm ?? ''}
                          onChange={(e) => updateBill(month, selectedYear, 'gasTherm', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="0"
                          className="text-center text-sm h-8"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={bill?.gasCost ?? ''}
                          onChange={(e) => updateBill(month, selectedYear, 'gasCost', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="0"
                          className="text-center text-sm h-8"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {stats.totalElecKwh.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    ${stats.totalElecCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {stats.totalGasTherm.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    ${stats.totalGasCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rate Analysis */}
      {stats.monthsWithData > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Rate Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Avg. Electricity Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${stats.avgElecRate.toFixed(3)}/kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Gas Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${stats.avgGasRate.toFixed(2)}/therm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClearYear} className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear {selectedYear} Data
        </Button>
      </div>
    </div>
  );
}
