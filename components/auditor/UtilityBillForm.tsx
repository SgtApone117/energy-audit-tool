'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { 
  Plus, 
  Trash2,
  Zap,
  Flame,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { AuditUtilityBill, generateId } from '@/lib/auditor/types';

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

export function UtilityBillForm({ bills, squareFootage, onBillsChange }: UtilityBillFormProps) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR - 1);

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
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button variant="outline" onClick={handlePrefillYear}>
            <Calendar className="w-4 h-4 mr-2" />
            Prefill Months
          </Button>
        </div>
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
                  return (
                    <tr key={month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {month}
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
