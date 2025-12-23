'use client';

import { Input, Select, InfoTooltip } from '@/components/ui';
import { Building2 } from 'lucide-react';
import { CustomerAssessmentForm } from '@/lib/customer/types';
import { getStateFromZip, getStateName } from '@/lib/core/data/zipToState';
import { useEffect } from 'react';

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
      }
    }
  }, [formData.zipCode, formData.state, onUpdate]);

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
        />

        <Select
          label="Business Type"
          placeholder="Select your business type"
          options={BUSINESS_TYPES}
          value={formData.businessType}
          onChange={(e) => onUpdate('businessType', e.target.value)}
          error={errors.businessType}
          required
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
            />
          </div>
          <div className="flex-1">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                value={formData.state ? getStateName(formData.state) : 'Auto-detected from ZIP'}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Automatically detected from ZIP code</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1">
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
              />
            </div>
            <div className="mt-6">
              <InfoTooltip content="Enter the total heated/cooled square footage of your business space. This helps us calculate your energy use intensity (EUI) for benchmarking." />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Total heated/cooled floor area in square feet
          </p>
        </div>
      </div>

      {/* Why we need this section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Why do we need this information?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Business type helps us compare you to similar businesses</li>
          <li>Location determines your climate zone and local utility rates</li>
          <li>Square footage is used to calculate your energy use intensity (EUI)</li>
        </ul>
      </div>
    </div>
  );
}
