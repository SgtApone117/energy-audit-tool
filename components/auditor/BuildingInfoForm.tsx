'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { Building2, MapPin, Users } from 'lucide-react';
import { AuditBuildingInfo } from '@/lib/auditor/types';
import { getStateFromZip, getStateName } from '@/lib/core/data/zipToState';

interface BuildingInfoFormProps {
  buildingInfo: AuditBuildingInfo;
  onChange: (info: AuditBuildingInfo) => void;
}

const BUSINESS_TYPES = [
  'Office',
  'Retail',
  'Restaurant / Food Service',
  'Grocery / Food Market',
  'Warehouse / Inventory',
  'K–12 School',
  'Lodging / Hospitality',
  'Industrial Manufacturing',
  'Healthcare',
  'Other',
];

const YEAR_BUILT_OPTIONS = [
  'Before 1970',
  '1970-1979',
  '1980-1989',
  '1990-1999',
  '2000-2009',
  '2010-2019',
  '2020 or newer',
];

export function BuildingInfoForm({ buildingInfo, onChange }: BuildingInfoFormProps) {
  const updateField = <K extends keyof AuditBuildingInfo>(
    field: K,
    value: AuditBuildingInfo[K]
  ) => {
    onChange({ ...buildingInfo, [field]: value });
  };

  // Auto-detect state from ZIP code
  useEffect(() => {
    if (buildingInfo.zipCode && buildingInfo.zipCode.length >= 3) {
      const stateCode = getStateFromZip(buildingInfo.zipCode);
      if (stateCode && stateCode !== buildingInfo.state) {
        updateField('state', stateCode);
      }
    }
  }, [buildingInfo.zipCode]);

  return (
    <div className="space-y-6">
      {/* Building Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            Building Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Building Name *"
              value={buildingInfo.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Main Office Building"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type *
              </label>
              <select
                value={buildingInfo.businessType}
                onChange={(e) => updateField('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Square Footage *"
              type="number"
              value={buildingInfo.squareFootage || ''}
              onChange={(e) => updateField('squareFootage', parseInt(e.target.value) || 0)}
              placeholder="e.g., 10000"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <select
                value={buildingInfo.yearBuilt || ''}
                onChange={(e) => updateField('yearBuilt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {YEAR_BUILT_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <Input
              label="Number of Floors"
              type="number"
              value={buildingInfo.floors || ''}
              onChange={(e) => updateField('floors', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 2"
            />
          </div>

          <Input
            label="Typical Occupancy"
            type="number"
            value={buildingInfo.occupants || ''}
            onChange={(e) => updateField('occupants', parseInt(e.target.value) || undefined)}
            placeholder="Number of people typically in building"
          />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-green-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Street Address *"
            value={buildingInfo.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="123 Main Street"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                label="City *"
                value={buildingInfo.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <Input
              label="State"
              value={buildingInfo.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="CA"
              maxLength={2}
            />
            <Input
              label="ZIP Code *"
              value={buildingInfo.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              placeholder="12345"
              maxLength={5}
            />
          </div>

          {buildingInfo.state && (
            <p className="text-sm text-gray-500">
              State detected: {getStateName(buildingInfo.state) || buildingInfo.state}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-purple-600" />
            Site Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact Name"
              value={buildingInfo.contactName || ''}
              onChange={(e) => updateField('contactName', e.target.value)}
              placeholder="John Smith"
            />
            <Input
              label="Phone"
              type="tel"
              value={buildingInfo.contactPhone || ''}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="(555) 123-4567"
            />
            <Input
              label="Email"
              type="email"
              value={buildingInfo.contactEmail || ''}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
