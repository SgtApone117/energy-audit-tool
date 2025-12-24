'use client';

import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, InfoTooltip, Alert } from '@/components/ui';
import { Building2, MapPin, Users, Zap, Flame, AlertTriangle } from 'lucide-react';
import { AuditBuildingInfo } from '@/lib/auditor/types';
import { getStateFromZip } from '@/lib/core/data/zipToState';
import { TOOLTIP_CONTENT } from '@/lib/core/data/tooltipContent';
import {
  isNewEnglandState,
  getElectricProvidersByState,
  getGasProvidersByState,
  STATE_INFO,
  NewEnglandState,
} from '@/lib/core/data/utilityProviders';

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

  // Clear provider selections when state changes
  useEffect(() => {
    if (buildingInfo.state) {
      const isValid = isNewEnglandState(buildingInfo.state);
      if (!isValid) {
        // Clear providers if state is not New England
        if (buildingInfo.electricityProviderId || buildingInfo.gasProviderId) {
          onChange({
            ...buildingInfo,
            electricityProviderId: '',
            gasProviderId: '',
          });
        }
      }
    }
  }, [buildingInfo.state]);

  // Check if state is in New England
  const isValidState = useMemo(() => {
    return buildingInfo.state ? isNewEnglandState(buildingInfo.state) : true;
  }, [buildingInfo.state]);

  // Get providers for the current state
  const electricProviders = useMemo(() => {
    if (!buildingInfo.state || !isNewEnglandState(buildingInfo.state)) return [];
    return getElectricProvidersByState(buildingInfo.state as NewEnglandState);
  }, [buildingInfo.state]);

  const gasProviders = useMemo(() => {
    if (!buildingInfo.state || !isNewEnglandState(buildingInfo.state)) return [];
    return getGasProvidersByState(buildingInfo.state as NewEnglandState);
  }, [buildingInfo.state]);

  // Get state display name
  const stateName = useMemo(() => {
    if (!buildingInfo.state) return '';
    if (isNewEnglandState(buildingInfo.state)) {
      return STATE_INFO[buildingInfo.state as NewEnglandState].name;
    }
    return buildingInfo.state;
  }, [buildingInfo.state]);

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
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.name} />}
            />
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                Business Type *
                <InfoTooltip content={TOOLTIP_CONTENT.auditor.building.businessType} />
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
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.squareFootage} />}
            />
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                Year Built
                <InfoTooltip content={TOOLTIP_CONTENT.auditor.building.yearBuilt} />
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
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.floors} />}
            />
          </div>

          <Input
            label="Typical Occupancy"
            type="number"
            value={buildingInfo.occupants || ''}
            onChange={(e) => updateField('occupants', parseInt(e.target.value) || undefined)}
            placeholder="Number of people typically in building"
            tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.occupants} />}
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
            tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.address} />}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                label="City *"
                value={buildingInfo.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
                tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.city} />}
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={buildingInfo.state}
                onChange={(e) => updateField('state', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="CT"
                maxLength={2}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  buildingInfo.state && !isValidState
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
            </div>
            <Input
              label="ZIP Code *"
              value={buildingInfo.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="12345"
              maxLength={5}
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.zipCode} />}
            />
          </div>

          {buildingInfo.state && (
            <p className="text-sm text-gray-500">
              State detected: {stateName || buildingInfo.state}
            </p>
          )}

          {/* Warning for non-New England states */}
          {buildingInfo.state && !isValidState && (
            <Alert variant="warning">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Service Area Limitation</div>
                  <p className="text-sm mt-1">
                    We currently only support audits in New England (CT, MA, NH).
                    Utility provider selection will not be available for other states.
                  </p>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Utility Providers */}
      {isValidState && buildingInfo.state && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Utility Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Select the utility providers for accurate tariff rate calculations in the report.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Electric Provider */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Electricity Provider
                  <InfoTooltip content={TOOLTIP_CONTENT.auditor.building.electricProvider} />
                </label>
                <select
                  value={buildingInfo.electricityProviderId || ''}
                  onChange={(e) => updateField('electricityProviderId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <InfoTooltip content={TOOLTIP_CONTENT.auditor.building.gasProvider} />
                </label>
                <select
                  value={buildingInfo.gasProviderId || ''}
                  onChange={(e) => updateField('gasProviderId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </CardContent>
        </Card>
      )}

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
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.contactName} />}
            />
            <Input
              label="Phone"
              type="tel"
              value={buildingInfo.contactPhone || ''}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="(555) 123-4567"
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.contactPhone} />}
            />
            <Input
              label="Email"
              type="email"
              value={buildingInfo.contactEmail || ''}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="email@example.com"
              tooltip={<InfoTooltip content={TOOLTIP_CONTENT.auditor.building.contactEmail} />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
