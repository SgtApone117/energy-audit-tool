'use client';

import { useEffect, useMemo } from 'react';
import { Input, Select, InfoTooltip, Alert } from '@/components/ui';
import { Building2, Zap, Flame, AlertTriangle } from 'lucide-react';
import { CustomerAssessmentForm } from '@/lib/customer/types';
import { getStateFromZip } from '@/lib/core/data/zipToState';
import { TOOLTIP_CONTENT } from '@/lib/core/data/tooltipContent';
import {
  NEW_ENGLAND_STATES,
  isNewEnglandState,
  getElectricProvidersByState,
  getGasProvidersByState,
  STATE_INFO,
  NewEnglandState,
} from '@/lib/core/data/utilityProviders';

const BUSINESS_TYPES = [
  { value: 'Office', label: 'Office' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Restaurant / Food Service', label: 'Restaurant / Food Service' },
  { value: 'Grocery / Food Market', label: 'Grocery / Food Market' },
  { value: 'Warehouse / Inventory', label: 'Warehouse / Inventory' },
  { value: 'K–12 School', label: 'K–12 School' },
  { value: 'Lodging / Hospitality', label: 'Lodging / Hospitality' },
  { value: 'Industrial Manufacturing', label: 'Industrial Manufacturing' },
  { value: 'Other', label: 'Other' },
];

interface BusinessBasicsProps {
  formData: CustomerAssessmentForm;
  errors: Record<string, string>;
  onUpdate: (field: keyof CustomerAssessmentForm, value: string | number | null) => void;
}

export function BusinessBasics({ formData, errors, onUpdate }: BusinessBasicsProps) {
  // Auto-detect state from ZIP code
  useEffect(() => {
    if (formData.zipCode.length === 5) {
      const state = getStateFromZip(formData.zipCode);
      if (state && state !== formData.state) {
        onUpdate('state', state);
        // Clear provider selections when state changes
        onUpdate('electricityProviderId', '');
        onUpdate('gasProviderId', '');
      }
    }
  }, [formData.zipCode, formData.state, onUpdate]);

  // Check if state is in New England
  const isValidState = useMemo(() => {
    return formData.state ? isNewEnglandState(formData.state) : true;
  }, [formData.state]);

  // Get providers for the current state
  const electricProviders = useMemo(() => {
    if (!formData.state || !isNewEnglandState(formData.state)) return [];
    return getElectricProvidersByState(formData.state as NewEnglandState);
  }, [formData.state]);

  const gasProviders = useMemo(() => {
    if (!formData.state || !isNewEnglandState(formData.state)) return [];
    return getGasProvidersByState(formData.state as NewEnglandState);
  }, [formData.state]);

  // Get state display name
  const stateName = useMemo(() => {
    if (!formData.state) return 'Auto-detected from ZIP';
    if (isNewEnglandState(formData.state)) {
      return STATE_INFO[formData.state as NewEnglandState].name;
    }
    return formData.state;
  }, [formData.state]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
          <p className="text-sm text-gray-500">Tell us about your business</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Business Name"
          placeholder="e.g., Main Street Coffee Shop"
          value={formData.businessName}
          onChange={(e) => onUpdate('businessName', e.target.value)}
          error={errors.businessName}
          required
          tooltip={<InfoTooltip content={TOOLTIP_CONTENT.businessBasics.businessName} />}
        />

        <Select
          label="Business Type"
          placeholder="Select your business type"
          options={BUSINESS_TYPES}
          value={formData.businessType}
          onChange={(e) => onUpdate('businessType', e.target.value)}
          error={errors.businessType}
          required
          tooltip={<InfoTooltip content={TOOLTIP_CONTENT.businessBasics.businessType} />}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Address"
              placeholder="123 Main Street, City"
              value={formData.address}
              onChange={(e) => onUpdate('address', e.target.value)}
              error={errors.address}
              required
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.businessBasics.address} />}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-32">
            <Input
              label="ZIP Code"
              placeholder="12345"
              value={formData.zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                onUpdate('zipCode', value);
              }}
              error={errors.zipCode}
              required
              maxLength={5}
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.businessBasics.zipCode} />}
            />
          </div>
          <div className="flex-1">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg text-gray-700 ${
                  !isValidState 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                value={stateName}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                We currently serve CT, MA, and NH
              </p>
            </div>
          </div>
        </div>

        {/* Warning for non-New England states */}
        {formData.state && !isValidState && (
          <Alert variant="warning">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Service Area Limitation</div>
                <p className="text-sm mt-1">
                  We currently only support businesses in New England (Connecticut, Massachusetts, and New Hampshire).
                  Please enter a ZIP code from one of these states.
                </p>
              </div>
            </div>
          </Alert>
        )}

        <Input
          label="Building Square Footage"
          placeholder="e.g., 5000"
          type="number"
          min={1}
          value={formData.squareFootage ?? ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value, 10) : null;
            onUpdate('squareFootage', value);
          }}
          error={errors.squareFootage}
          required
          tooltip={<InfoTooltip content={TOOLTIP_CONTENT.businessBasics.squareFootage} />}
          hint="Total heated/cooled floor area in square feet"
        />
      </div>

      {/* Utility Provider Selection */}
      {isValidState && formData.state && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">Utility Providers</h3>
            <InfoTooltip content="Select your utility providers to get accurate tariff rates for cost calculations." />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select your electricity and gas providers for accurate rate calculations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Electric Provider */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                Electricity Provider
                <InfoTooltip content={TOOLTIP_CONTENT.businessBasics.electricProvider} />
              </label>
              <select
                value={formData.electricityProviderId}
                onChange={(e) => onUpdate('electricityProviderId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select provider...</option>
                {electricProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gas Provider */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                Natural Gas Provider
                <InfoTooltip content={TOOLTIP_CONTENT.businessBasics.gasProvider} />
              </label>
              <select
                value={formData.gasProviderId}
                onChange={(e) => onUpdate('gasProviderId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select provider...</option>
                <option value="none">No natural gas service</option>
                {gasProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Why we need this section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Why do we need this information?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Business type helps us compare you to similar businesses</li>
          <li>Location determines your climate zone and available utility providers</li>
          <li>Square footage is used to calculate your energy use intensity (EUI)</li>
          <li>Utility providers determine the tariff rates for accurate cost calculations</li>
        </ul>
      </div>
    </div>
  );
}
