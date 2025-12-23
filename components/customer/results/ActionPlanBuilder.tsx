'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { ClipboardList, Download, CheckCircle, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { ECMRecommendation } from '@/lib/customer/types';

interface ActionPlanBuilderProps {
  recommendations: ECMRecommendation[];
  businessName: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ActionPlanBuilder({ recommendations, businessName }: ActionPlanBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    recommendations.filter(r => r.priority === 'high').map(r => r.id)
  );

  const toggleECM = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllHighPriority = () => {
    const highPriorityIds = recommendations.filter(r => r.priority === 'high').map(r => r.id);
    setSelectedIds(highPriorityIds);
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  // Calculate totals for selected items
  const totals = useMemo(() => {
    const selected = recommendations.filter(r => selectedIds.includes(r.id));
    
    const savingsLow = selected.reduce((sum, r) => sum + r.savingsRange.low, 0);
    const savingsHigh = selected.reduce((sum, r) => sum + r.savingsRange.high, 0);
    const savingsTypical = selected.reduce((sum, r) => sum + r.savingsRange.typical, 0);
    
    const costLow = selected.reduce((sum, r) => sum + r.costRange.low, 0);
    const costHigh = selected.reduce((sum, r) => sum + r.costRange.high, 0);
    const costTypical = selected.reduce((sum, r) => sum + r.costRange.typical, 0);
    
    const avgPayback = savingsTypical > 0 ? costTypical / savingsTypical : 0;
    const fiveYearReturn = (savingsTypical * 5) - costTypical;
    const tenYearReturn = (savingsTypical * 10) - costTypical;

    return {
      count: selected.length,
      savingsLow,
      savingsHigh,
      savingsTypical,
      costLow,
      costHigh,
      costTypical,
      avgPayback,
      fiveYearReturn,
      tenYearReturn,
    };
  }, [selectedIds, recommendations]);

  const handleDownloadPlan = () => {
    const selected = recommendations.filter(r => selectedIds.includes(r.id));
    
    let content = `ENERGY EFFICIENCY ACTION PLAN\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Business: ${businessName}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    content += `SUMMARY\n`;
    content += `${'-'.repeat(30)}\n`;
    content += `Selected Measures: ${totals.count}\n`;
    content += `Estimated Annual Savings: ${formatCurrency(totals.savingsLow)} - ${formatCurrency(totals.savingsHigh)}\n`;
    content += `Estimated Implementation Cost: ${formatCurrency(totals.costLow)} - ${formatCurrency(totals.costHigh)}\n`;
    content += `Average Payback Period: ${totals.avgPayback.toFixed(1)} years\n`;
    content += `5-Year Net Savings: ${formatCurrency(totals.fiveYearReturn)}\n`;
    content += `10-Year Net Savings: ${formatCurrency(totals.tenYearReturn)}\n\n`;
    
    content += `SELECTED MEASURES\n`;
    content += `${'-'.repeat(30)}\n\n`;
    
    selected.forEach((rec, index) => {
      content += `${index + 1}. ${rec.title}\n`;
      content += `   Priority: ${rec.priority.toUpperCase()}\n`;
      content += `   Description: ${rec.description}\n`;
      content += `   Annual Savings: ${formatCurrency(rec.savingsRange.typical)} (typical)\n`;
      content += `   Implementation Cost: ${formatCurrency(rec.costRange.typical)} (typical)\n`;
      content += `   Payback: ${rec.paybackRange.best.toFixed(1)}-${rec.paybackRange.worst.toFixed(1)} years\n`;
      if (rec.additionalBenefits.length > 0) {
        content += `   Additional Benefits: ${rec.additionalBenefits.join(', ')}\n`;
      }
      content += `\n`;
    });
    
    content += `\nNOTES\n`;
    content += `${'-'.repeat(30)}\n`;
    content += `- Savings estimates are based on typical values and may vary.\n`;
    content += `- Consult with qualified contractors for accurate quotes.\n`;
    content += `- Check for available utility rebates and incentives.\n`;
    content += `- This assessment is for informational purposes only.\n`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy_action_plan_${businessName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Build Your Action Plan
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAllHighPriority}>
              Select High Priority
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.map((rec) => {
            const isSelected = selectedIds.includes(rec.id);
            return (
              <button
                key={rec.id}
                onClick={() => toggleECM(rec.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {rec.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={rec.priority === 'high' ? 'success' : rec.priority === 'medium' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {rec.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(rec.savingsRange.typical)}/yr
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Totals summary */}
        {totals.count > 0 && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h3 className="font-medium text-indigo-900 mb-4">
              Your Plan: {totals.count} measure{totals.count !== 1 ? 's' : ''} selected
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-1 text-indigo-700 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Annual Savings
                </div>
                <p className="font-bold text-indigo-900 mt-1">
                  {formatCurrency(totals.savingsLow)} - {formatCurrency(totals.savingsHigh)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-indigo-700 text-sm">
                  <DollarSign className="w-4 h-4" />
                  Total Cost
                </div>
                <p className="font-bold text-indigo-900 mt-1">
                  {formatCurrency(totals.costLow)} - {formatCurrency(totals.costHigh)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-indigo-700 text-sm">
                  <Clock className="w-4 h-4" />
                  Avg Payback
                </div>
                <p className="font-bold text-indigo-900 mt-1">
                  {totals.avgPayback.toFixed(1)} years
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-indigo-700 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  10-Year Return
                </div>
                <p className={`font-bold mt-1 ${totals.tenYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.tenYearReturn)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-indigo-200">
              <Button onClick={handleDownloadPlan}>
                <Download className="w-4 h-4 mr-2" />
                Download Action Plan
              </Button>
            </div>
          </div>
        )}

        {totals.count === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Select measures above to build your action plan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
