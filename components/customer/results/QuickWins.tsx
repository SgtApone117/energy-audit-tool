'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { Zap, CheckCircle, DollarSign } from 'lucide-react';
import { QuickWin } from '@/lib/customer/types';

interface QuickWinsProps {
  quickWins: QuickWin[];
  totalAnnualCost: number;
}

function formatCurrency(value: number): string {
  if (value < 10) {
    return `$${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuickWins({ quickWins, totalAnnualCost }: QuickWinsProps) {
  const totalQuickSavings = quickWins.reduce((sum, qw) => sum + qw.estimatedSavings, 0);
  const savingsPercentage = (totalQuickSavings / totalAnnualCost) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Wins — No-Cost Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-800">Total potential quick wins savings</p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatCurrency(totalQuickSavings)}/year
              </p>
              <p className="text-sm text-yellow-700">
                ~{savingsPercentage.toFixed(0)}% of your annual energy costs
              </p>
            </div>
          </div>
        </div>

        {/* Quick wins list */}
        <div className="space-y-3">
          {quickWins.map((win) => (
            <div
              key={win.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-gray-900">{win.action}</h4>
                  <Badge variant={win.difficulty === 'Easy' ? 'success' : 'warning'} size="sm">
                    {win.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{win.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-green-600">
                  {formatCurrency(win.estimatedSavings)}
                </p>
                <p className="text-xs text-gray-500">/year</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 italic">
          These actions typically cost nothing to implement and can be done immediately.
        </p>
      </CardContent>
    </Card>
  );
}
