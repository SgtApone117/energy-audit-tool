'use client';

import { useState } from 'react';
import { FileUpload, Button, Alert, InfoTooltip } from '@/components/ui';
import { Receipt, Upload, Edit3, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { UtilityBill, CustomerAssessmentForm } from '@/lib/customer/types';
import { parseUtilityBillCSV, generateCSVTemplate } from '@/lib/customer/csv/billParser';
import { TOOLTIP_CONTENT } from '@/lib/core/data/tooltipContent';

interface UtilityBillsProps {
  formData: CustomerAssessmentForm;
  errors: Record<string, string>;
  onUpdateBill: (index: number, field: keyof UtilityBill, value: number | null) => void;
  onSetBills: (bills: UtilityBill[]) => void;
  filledBillsCount: number;
}

type InputMode = 'csv' | 'manual';

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function UtilityBills({
  formData,
  errors,
  onUpdateBill,
  onSetBills,
  filledBillsCount,
}: UtilityBillsProps) {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvWarnings, setCsvWarnings] = useState<string[]>([]);
  const [csvSuccess, setCsvSuccess] = useState(false);

  const handleCSVUpload = (file: File) => {
    setCsvErrors([]);
    setCsvWarnings([]);
    setCsvSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseUtilityBillCSV(content);

      if (!result.success) {
        setCsvErrors(result.errors);
        setCsvWarnings(result.warnings);
        return;
      }

      setCsvWarnings(result.warnings);
      setCsvSuccess(true);

      // Merge parsed bills with existing template
      const existingBills = [...formData.utilityBills];
      result.bills.forEach((parsedBill) => {
        const index = existingBills.findIndex((b) => b.month === parsedBill.month);
        if (index !== -1) {
          existingBills[index] = parsedBill;
        } else {
          existingBills.push(parsedBill);
        }
      });

      // Sort by month
      existingBills.sort((a, b) => a.month.localeCompare(b.month));
      onSetBills(existingBills);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utility_bills_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (
    index: number,
    field: keyof UtilityBill,
    value: string
  ) => {
    const numValue = value === '' ? null : parseFloat(value);
    onUpdateBill(index, field, numValue);
  };

  // Calculate totals
  const totals = formData.utilityBills.reduce(
    (acc, bill) => ({
      electricityKwh: acc.electricityKwh + (bill.electricityKwh || 0),
      electricityCost: acc.electricityCost + (bill.electricityCost || 0),
      gasUsage: acc.gasUsage + (bill.gasUsage || 0),
      gasCost: acc.gasCost + (bill.gasCost || 0),
    }),
    { electricityKwh: 0, electricityCost: 0, gasUsage: 0, gasCost: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Receipt className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Utility Bills</h2>
          <p className="text-sm text-gray-500">Enter your monthly electricity and gas usage</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {filledBillsCount}/12 months entered
            </span>
            <span className="text-xs text-gray-500">
              {filledBillsCount >= 12 ? '✓ Complete' : filledBillsCount >= 3 ? 'Minimum met' : 'Need at least 3 months'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                filledBillsCount >= 12
                  ? 'bg-green-500'
                  : filledBillsCount >= 3
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${(filledBillsCount / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errors.utilityBills && (
        <Alert variant="error">{errors.utilityBills}</Alert>
      )}

      {/* Input mode tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            inputMode === 'manual'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setInputMode('manual')}
        >
          <Edit3 className="w-4 h-4 inline-block mr-2" />
          Manual Entry
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            inputMode === 'csv'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setInputMode('csv')}
        >
          <Upload className="w-4 h-4 inline-block mr-2" />
          Upload CSV
        </button>
      </div>

      {inputMode === 'csv' ? (
        <div className="space-y-4">
          <FileUpload
            accept=".csv"
            label="Upload your utility bill CSV"
            hint="We'll automatically parse your monthly usage data"
            onFileSelect={handleCSVUpload}
          />

          {csvErrors.length > 0 && (
            <Alert variant="error">
              <div className="space-y-1">
                {csvErrors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            </Alert>
          )}

          {csvWarnings.length > 0 && (
            <Alert variant="warning">
              <div className="space-y-1">
                {csvWarnings.map((warning, i) => (
                  <p key={i}>{warning}</p>
                ))}
              </div>
            </Alert>
          )}

          {csvSuccess && (
            <Alert variant="success">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                CSV data imported successfully! Review the data below.
              </div>
            </Alert>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600">
              Your CSV should have columns for: month, electricity_kwh, electricity_cost, gas_therms, gas_cost
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Manual entry table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">
                    <div className="flex items-center gap-1">
                      Month
                      <InfoTooltip content={TOOLTIP_CONTENT.utilityBills.monthYear} position="top" />
                    </div>
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                      Electricity (kWh)
                      <InfoTooltip content={TOOLTIP_CONTENT.utilityBills.electricityKwh} position="top" />
                    </div>
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                      Elec. Cost ($)
                      <InfoTooltip content={TOOLTIP_CONTENT.utilityBills.electricityCost} position="top" />
                    </div>
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                      Gas (therms)
                      <InfoTooltip content={TOOLTIP_CONTENT.utilityBills.naturalGasTherms} position="top" />
                    </div>
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                      Gas Cost ($)
                      <InfoTooltip content={TOOLTIP_CONTENT.utilityBills.gasCost} position="top" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.utilityBills.map((bill, index) => (
                  <tr key={bill.month} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-700">
                      {formatMonth(bill.month)}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        className="w-full text-right px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        value={bill.electricityKwh ?? ''}
                        onChange={(e) =>
                          handleInputChange(index, 'electricityKwh', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full text-right px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        value={bill.electricityCost ?? ''}
                        onChange={(e) =>
                          handleInputChange(index, 'electricityCost', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        className="w-full text-right px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        value={bill.gasUsage ?? ''}
                        onChange={(e) =>
                          handleInputChange(index, 'gasUsage', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full text-right px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        value={bill.gasCost ?? ''}
                        onChange={(e) =>
                          handleInputChange(index, 'gasCost', e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr className="font-semibold">
                  <td className="py-2 px-3 text-gray-700">Totals</td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {totals.electricityKwh.toLocaleString()} kWh
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    ${totals.electricityCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {totals.gasUsage.toLocaleString()} therms
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    ${totals.gasCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-sm text-gray-500">
            <AlertCircle className="w-4 h-4 inline-block mr-1" />
            Enter at least 3 months of data. 12 months provides the most accurate analysis.
          </p>
        </div>
      )}

      {/* Why we need this section */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
        <h3 className="text-sm font-medium text-green-900 mb-2">Why do we need utility data?</h3>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Monthly data reveals seasonal patterns in your energy use</li>
          <li>Cost data helps us calculate your effective rates</li>
          <li>More months = more accurate analysis and recommendations</li>
        </ul>
      </div>
    </div>
  );
}
