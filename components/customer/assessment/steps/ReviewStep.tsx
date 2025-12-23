'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { Building2, Receipt, Settings, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { CustomerAssessmentForm } from '@/lib/customer/types';
import { getStateName } from '@/lib/core/data/zipToState';

interface ReviewStepProps {
  formData: CustomerAssessmentForm;
  filledBillsCount: number;
  equipmentCompletion: number;
  onEditStep: (step: 1 | 2 | 3) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function ReviewStep({
  formData,
  filledBillsCount,
  equipmentCompletion,
  onEditStep,
}: ReviewStepProps) {
  // Calculate utility totals
  const totals = formData.utilityBills.reduce(
    (acc, bill) => ({
      electricityKwh: acc.electricityKwh + (bill.electricityKwh || 0),
      electricityCost: acc.electricityCost + (bill.electricityCost || 0),
      gasUsage: acc.gasUsage + (bill.gasUsage || 0),
      gasCost: acc.gasCost + (bill.gasCost || 0),
    }),
    { electricityKwh: 0, electricityCost: 0, gasUsage: 0, gasCost: 0 }
  );

  // Calculate confidence level
  const getConfidence = (): { level: 'low' | 'medium' | 'high'; label: string; description: string } => {
    const hasFullYearData = filledBillsCount >= 12;
    const hasEquipmentData = equipmentCompletion > 0;
    
    if (hasFullYearData && hasEquipmentData) {
      return {
        level: 'high',
        label: 'High Confidence',
        description: 'Full year of utility data + equipment details',
      };
    } else if (filledBillsCount >= 6 || (filledBillsCount >= 3 && hasEquipmentData)) {
      return {
        level: 'medium',
        label: 'Medium Confidence',
        description: `${filledBillsCount} months of data${hasEquipmentData ? ' + some equipment details' : ''}`,
      };
    } else {
      return {
        level: 'low',
        label: 'Lower Confidence',
        description: 'Limited data - estimates will use more assumptions',
      };
    }
  };

  const confidence = getConfidence();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Review Your Information</h2>
          <p className="text-sm text-gray-500">Confirm your details before generating your report</p>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className={`p-4 rounded-lg border ${
        confidence.level === 'high' 
          ? 'bg-green-50 border-green-200' 
          : confidence.level === 'medium'
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  (confidence.level === 'high' && i <= 3) ||
                  (confidence.level === 'medium' && i <= 2) ||
                  (confidence.level === 'low' && i <= 1)
                    ? confidence.level === 'high'
                      ? 'bg-green-500'
                      : confidence.level === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div>
            <p className={`font-medium ${
              confidence.level === 'high' 
                ? 'text-green-900' 
                : confidence.level === 'medium'
                ? 'text-yellow-900'
                : 'text-gray-900'
            }`}>
              {confidence.label}
            </p>
            <p className={`text-sm ${
              confidence.level === 'high' 
                ? 'text-green-700' 
                : confidence.level === 'medium'
                ? 'text-yellow-700'
                : 'text-gray-600'
            }`}>
              {confidence.description}
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-blue-600" />
              Business Information
            </CardTitle>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Business Name</p>
              <p className="font-medium">{formData.businessName}</p>
            </div>
            <div>
              <p className="text-gray-500">Business Type</p>
              <p className="font-medium">{formData.businessType}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">
                {formData.address}, {formData.state ? getStateName(formData.state) : ''} {formData.zipCode}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Square Footage</p>
              <p className="font-medium">{formatNumber(formData.squareFootage || 0)} sq ft</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utility Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="w-5 h-5 text-green-600" />
              Utility Data Summary
            </CardTitle>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={filledBillsCount >= 12 ? 'success' : filledBillsCount >= 3 ? 'warning' : 'error'}>
              {filledBillsCount} of 12 months
            </Badge>
            <span className="text-sm text-gray-500">
              {filledBillsCount >= 12 ? 'Full year' : filledBillsCount >= 3 ? 'Minimum met' : 'More data needed'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Total Electricity</p>
              <p className="font-semibold text-lg">{formatNumber(totals.electricityKwh)} kWh</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Electric Cost</p>
              <p className="font-semibold text-lg">{formatCurrency(totals.electricityCost)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Total Gas</p>
              <p className="font-semibold text-lg">{formatNumber(totals.gasUsage)} therms</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gas Cost</p>
              <p className="font-semibold text-lg">{formatCurrency(totals.gasCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-5 h-5 text-purple-600" />
              Equipment Details
            </CardTitle>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={equipmentCompletion > 0 ? 'success' : 'default'}>
              {equipmentCompletion}% complete
            </Badge>
            <span className="text-sm text-gray-500">
              {equipmentCompletion === 0 ? 'Optional - skipped' : 'Additional data provided'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {formData.hvacSystems.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={formData.hvacSystems.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
                HVAC: {formData.hvacSystems.length} system{formData.hvacSystems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.lightingDetails ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={formData.lightingDetails ? 'text-gray-900' : 'text-gray-400'}>
                Lighting
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.refrigerationEquipment ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={formData.refrigerationEquipment ? 'text-gray-900' : 'text-gray-400'}>
                Refrigeration
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.cookingEquipment ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={formData.cookingEquipment ? 'text-gray-900' : 'text-gray-400'}>
                Cooking
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.operatingSchedule ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={formData.operatingSchedule ? 'text-gray-900' : 'text-gray-400'}>
                Schedule
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology note */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          About Your Report
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Results are estimates based on the data you provided</li>
          <li>Savings ranges account for uncertainty in our calculations</li>
          <li>We use industry benchmarks for your business type and location</li>
          <li>More detailed data leads to more accurate recommendations</li>
        </ul>
      </div>
    </div>
  );
}
