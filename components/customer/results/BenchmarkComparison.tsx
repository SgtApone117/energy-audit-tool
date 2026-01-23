'use client';

import { Card, CardContent, CardHeader, CardTitle, Alert } from '@/components/ui';
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle, HelpCircle } from 'lucide-react';

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
  // Calculate the max for scaling (ensure it's at least 1.1x your EUI and typical EUI)
  const maxEUI = Math.max(yourEUI, typicalEUI, efficientEUI) * 1.1;

  // Detect if the EUI seems unrealistically low
  const isUnrealisticallyLow = yourEUI < efficientEUI * 0.3; // Less than 30% of efficient is suspicious
  const isUnrealisticallyHigh = yourEUI > typicalEUI * 3; // More than 3x typical is suspicious

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
  const yourWidth = Math.min((yourEUI / maxEUI) * 100, 100);
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
        {/* Data validation warning */}
        {isUnrealisticallyLow && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            <span className="font-medium">Data Check:</span> Your calculated EUI ({yourEUI.toFixed(1)} kWh/sqft) 
            seems unusually low for a {businessType}. Typical range is {efficientEUI.toFixed(0)}-{(typicalEUI * 1.3).toFixed(0)} kWh/sqft. 
            Please verify your square footage and utility bill entries are accurate.
          </Alert>
        )}

        {isUnrealisticallyHigh && (
          <Alert variant="warning">
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            <span className="font-medium">Data Check:</span> Your calculated EUI ({yourEUI.toFixed(1)} kWh/sqft) 
            is significantly higher than typical for a {businessType}. This may indicate data entry issues 
            or genuinely high energy use requiring attention.
          </Alert>
        )}

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

        {/* Calculation transparency */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            How is this calculated?
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
            <div>
              <p className="font-medium text-gray-700">Your Energy Use Intensity (EUI):</p>
              <p className="text-gray-600">
                <span className="font-mono bg-gray-100 px-1 rounded">
                  {yourEUI.toFixed(2)} kWh/sqft/year
                </span>
                {' = Annual kWh ÷ Square Footage'}
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <p className="font-medium text-gray-700 mb-2">Benchmarks for {businessType}:</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-600">Top 25% Efficient:</td>
                    <td className="py-1 font-mono text-green-700">&lt; {efficientEUI.toFixed(1)} kWh/sqft</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Typical (Average):</td>
                    <td className="py-1 font-mono text-gray-700">{typicalEUI.toFixed(1)} kWh/sqft</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Needs Improvement:</td>
                    <td className="py-1 font-mono text-orange-700">&gt; {(typicalEUI * 1.3).toFixed(1)} kWh/sqft</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="font-medium text-gray-700 mb-2">Score Thresholds:</p>
              <div className="grid grid-cols-5 gap-2 text-xs text-center">
                <div className="bg-green-100 rounded p-2">
                  <div className="font-bold text-green-800">A</div>
                  <div className="text-green-600">75-99%</div>
                </div>
                <div className="bg-blue-100 rounded p-2">
                  <div className="font-bold text-blue-800">B</div>
                  <div className="text-blue-600">50-74%</div>
                </div>
                <div className="bg-yellow-100 rounded p-2">
                  <div className="font-bold text-yellow-800">C</div>
                  <div className="text-yellow-600">25-49%</div>
                </div>
                <div className="bg-orange-100 rounded p-2">
                  <div className="font-bold text-orange-800">D</div>
                  <div className="text-orange-600">10-24%</div>
                </div>
                <div className="bg-red-100 rounded p-2">
                  <div className="font-bold text-red-800">F</div>
                  <div className="text-red-600">&lt;10%</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
              <p>
                <strong>Tip:</strong> If your score seems too good, verify your data. A 10,000 sqft office 
                typically uses 10,000-15,000 kWh/month (120,000-180,000 kWh/year), resulting in 
                an EUI of 12-18 kWh/sqft.
              </p>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}


