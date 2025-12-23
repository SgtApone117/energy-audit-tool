'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, PriorityBadge, Accordion, AccordionItem } from '@/components/ui';
import { Lightbulb, ChevronDown, ChevronUp, DollarSign, Clock, TrendingUp, Info } from 'lucide-react';
import { ECMRecommendation } from '@/lib/customer/types';

interface SavingsOpportunitiesProps {
  recommendations: ECMRecommendation[];
  onSelectECM?: (id: string) => void;
  selectedECMs?: string[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRange(low: number, high: number, isCurrency = true): string {
  if (isCurrency) {
    return `${formatCurrency(low)} - ${formatCurrency(high)}`;
  }
  return `${low.toFixed(1)} - ${high.toFixed(1)} years`;
}

export function SavingsOpportunities({
  recommendations,
  onSelectECM,
  selectedECMs = [],
}: SavingsOpportunitiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calculate totals
  const totalSavingsLow = recommendations.reduce((sum, r) => sum + r.savingsRange.low, 0);
  const totalSavingsHigh = recommendations.reduce((sum, r) => sum + r.savingsRange.high, 0);
  const totalCostLow = recommendations.reduce((sum, r) => sum + r.costRange.low, 0);
  const totalCostHigh = recommendations.reduce((sum, r) => sum + r.costRange.high, 0);

  const highPriority = recommendations.filter(r => r.priority === 'high');
  const mediumPriority = recommendations.filter(r => r.priority === 'medium');
  const lowPriority = recommendations.filter(r => r.priority === 'low');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Energy Saving Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-green-800 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Potential Annual Savings</span>
            </div>
            <p className="text-xl font-bold text-green-900">
              {formatRange(totalSavingsLow, totalSavingsHigh)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-800 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Implementation Cost</span>
            </div>
            <p className="text-xl font-bold text-blue-900">
              {formatRange(totalCostLow, totalCostHigh)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 text-purple-800 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Quick Return Measures</span>
            </div>
            <p className="text-xl font-bold text-purple-900">
              {highPriority.length} high priority
            </p>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isExpanded = expandedId === rec.id;
            const isSelected = selectedECMs.includes(rec.id);

            return (
              <div
                key={rec.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                >
                  {onSelectECM && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectECM(rec.id);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{rec.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(rec.savingsRange.typical)}/yr
                    </p>
                    <p className="text-xs text-gray-500">
                      {rec.paybackRange.best.toFixed(1)}-{rec.paybackRange.worst.toFixed(1)} yr payback
                    </p>
                  </div>
                  <button className="p-1 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Savings Range</p>
                        <p className="font-medium text-green-600">
                          {formatRange(rec.savingsRange.low, rec.savingsRange.high)}/yr
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Implementation Cost</p>
                        <p className="font-medium text-gray-900">
                          {formatRange(rec.costRange.low, rec.costRange.high)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payback Period</p>
                        <p className="font-medium text-gray-900">
                          {formatRange(rec.paybackRange.best, rec.paybackRange.worst, false)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">10-Year Return</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(rec.tenYearReturn)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-700">{rec.explanation}</p>
                    </div>

                    {rec.additionalBenefits.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Additional Benefits:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {rec.additionalBenefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex items-start gap-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        Calculation basis: {rec.calculationBasis.join('. ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-500">
          Savings and costs shown as ranges to account for variation in equipment, installation complexity, and local factors.
        </p>
      </CardContent>
    </Card>
  );
}
