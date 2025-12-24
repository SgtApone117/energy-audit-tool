'use client';

import { Card, CardContent, ScoreBadge, Badge } from '@/components/ui';
import { DollarSign, Zap, Building2, TrendingDown, Flame } from 'lucide-react';
import { EnergyScore, ConfidenceLevel } from '@/lib/customer/types';

interface UtilityProviderInfo {
  electricProvider?: {
    name: string;
    rate: number;
    rateFormatted: string;
  };
  gasProvider?: {
    name: string;
    rate: number;
    rateFormatted: string;
  };
}

interface EnergyProfileProps {
  annualCost: number;
  annualUsage: number;
  costPerSqFt: number;
  energyScore: EnergyScore;
  confidence: ConfidenceLevel;
  monthsOfData: number;
  hasEquipmentData: boolean;
  utilityInfo?: UtilityProviderInfo;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function EnergyProfile({
  annualCost,
  annualUsage,
  costPerSqFt,
  energyScore,
  confidence,
  monthsOfData,
  hasEquipmentData,
  utilityInfo,
}: EnergyProfileProps) {
  const confidenceConfig = {
    high: { dots: 3, label: 'High Confidence', color: 'text-green-600', bg: 'bg-green-100' },
    medium: { dots: 2, label: 'Medium Confidence', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    low: { dots: 1, label: 'Lower Confidence', color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  const conf = confidenceConfig[confidence];

  return (
    <div className="space-y-4">
      {/* Main metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual Cost */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Annual Energy Cost</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(annualCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on {monthsOfData} months of data
            </p>
          </CardContent>
        </Card>

        {/* Annual Usage */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Annual Usage</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {formatNumber(annualUsage)}
                </p>
                <p className="text-sm text-gray-500">kWh</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost per Sq Ft */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost per Sq Ft</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  ${costPerSqFt.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">/sq ft/year</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Score */}
        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Score</p>
                <div className="mt-2">
                  <ScoreBadge score={energyScore} size="lg" />
                </div>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              vs. similar businesses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence indicator */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${conf.bg}`}>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i <= conf.dots ? conf.color.replace('text', 'bg') : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex-1">
          <span className={`text-sm font-medium ${conf.color}`}>{conf.label}</span>
          <span className="text-sm text-gray-600 ml-2">
            Based on {monthsOfData} months of bills{hasEquipmentData ? ' + equipment data' : ''}
          </span>
        </div>
      </div>

      {/* Utility Provider Info */}
      {utilityInfo && (utilityInfo.electricProvider || utilityInfo.gasProvider) && (
        <Card className="bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Utility Rate Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {utilityInfo.electricProvider && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{utilityInfo.electricProvider.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Commercial Rate: <span className="font-medium">{utilityInfo.electricProvider.rateFormatted}</span>
                    </p>
                  </div>
                </div>
              )}
              {utilityInfo.gasProvider && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{utilityInfo.gasProvider.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Commercial Rate: <span className="font-medium">{utilityInfo.gasProvider.rateFormatted}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Rates shown are approximate commercial tariff rates. Actual rates may vary based on rate class and usage tier.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
