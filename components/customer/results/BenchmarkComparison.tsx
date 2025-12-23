'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BenchmarkComparisonProps {
  yourEUI: number;
  typicalEUI: number;
  efficientEUI: number;
  percentile: number;
  businessType: string;
}

export function BenchmarkComparison({
  yourEUI,
  typicalEUI,
  efficientEUI,
  percentile,
  businessType,
}: BenchmarkComparisonProps) {
  // Calculate the max for scaling
  const maxEUI = Math.max(yourEUI, typicalEUI, efficientEUI) * 1.1;

  // Determine status
  const getStatus = () => {
    if (yourEUI <= efficientEUI) {
      return {
        label: 'Excellent',
        description: 'Your energy use is among the most efficient',
        icon: TrendingDown,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    } else if (yourEUI <= typicalEUI) {
      return {
        label: 'Good',
        description: 'Your energy use is better than average',
        icon: Minus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    } else {
      return {
        label: 'Opportunity',
        description: 'There is room for improvement',
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Calculate percentages for the bars
  const yourWidth = (yourEUI / maxEUI) * 100;
  const typicalWidth = (typicalEUI / maxEUI) * 100;
  const efficientWidth = (efficientEUI / maxEUI) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          How You Compare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.bgColor}`}>
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          <div>
            <span className={`font-medium ${status.color}`}>{status.label}</span>
            <span className="text-sm text-gray-600 ml-2">{status.description}</span>
          </div>
        </div>

        {/* Percentile display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Compared to similar {businessType} buildings:</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            You are in the <span className="text-blue-600">{percentile}th</span> percentile
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {percentile >= 50 
              ? `Better than ${percentile}% of similar businesses`
              : `${100 - percentile}% of similar businesses use less energy`
            }
          </p>
        </div>

        {/* Bar chart comparison */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Energy Use Intensity (kWh/sq ft/year)</p>
          
          {/* Your building */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">Your Building</span>
              <span className="text-gray-700">{yourEUI.toFixed(1)} kWh/sqft</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${yourWidth}%` }}
              >
                {yourWidth > 15 && (
                  <span className="text-xs font-medium text-white">{yourEUI.toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Typical building */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Typical {businessType}</span>
              <span className="text-gray-500">{typicalEUI.toFixed(1)} kWh/sqft</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{ width: `${typicalWidth}%` }}
              />
            </div>
          </div>

          {/* Efficient building */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Top 25% Efficient</span>
              <span className="text-gray-500">{efficientEUI.toFixed(1)} kWh/sqft</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${efficientWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Potential savings callout */}
        {yourEUI > efficientEUI && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-green-800">
              <span className="font-medium">Potential savings:</span> If you matched the top 25% efficient buildings, 
              you could reduce your energy use by approximately{' '}
              <span className="font-bold">{Math.round(((yourEUI - efficientEUI) / yourEUI) * 100)}%</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
