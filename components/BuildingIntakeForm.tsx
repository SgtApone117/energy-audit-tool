"use client";

import { useState, useMemo } from "react";
import type { FormData, BusinessType, ConstructionYear, PrimaryHeatingFuel } from "@/lib/types";
import { InfoTooltip } from "./ui/Tooltip";
import { getStateFromZip, getStateName } from "@/lib/data/zipToState";
import { getUtilityRates } from "@/lib/data/utilityRates";
import { getClimateZoneInfo } from "@/lib/data/climateZones";

interface BuildingIntakeFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Field descriptions for tooltips
const FIELD_DESCRIPTIONS = {
  buildingName: "A descriptive name for your building (e.g., 'Main Office Building', 'Retail Store #42'). Used for report identification.",
  businessType: "Select the category that best matches your building's primary use. This determines the baseline Energy Use Intensity (EUI) for calculations.",
  floorArea: "Total conditioned floor area in square feet. Include all heated/cooled spaces. This is the base for all energy calculations.",
  zipCode: "5-digit ZIP code used to determine your state's average utility rates and climate zone adjustments.",
  constructionYear: "Approximate age of the building. Older buildings typically have less efficient envelopes and equipment, affecting energy estimates.",
  primaryHeatingFuel: "The main fuel source used for space heating and cooling (HVAC system).",
  secondaryFuel: "Optional secondary fuel used for water heating, cooking, or other purposes.",
};

// Validation helper
function validateForm(formData: FormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!formData.businessType) {
    errors.businessType = "Please select a business type";
  }
  
  if (!formData.floorArea || parseFloat(formData.floorArea) <= 0) {
    errors.floorArea = "Please enter a valid floor area";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default function BuildingIntakeForm({
  formData,
  onChange,
  onSubmit,
}: BuildingIntakeFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  
  const validation = validateForm(formData);
  
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);
    
    if (validation.isValid) {
      onSubmit(e);
    }
  };
  
  const getFieldError = (fieldName: string): string | null => {
    if ((touched[fieldName] || showErrors) && validation.errors[fieldName]) {
      return validation.errors[fieldName];
    }
    return null;
  };
  
  const inputBaseClass = "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";
  const inputErrorClass = "border-red-300 bg-red-50";
  const inputNormalClass = "border-gray-300";

  // Compute location info from ZIP code
  const locationInfo = useMemo(() => {
    if (!formData.zipCode || formData.zipCode.length < 3) {
      return null;
    }
    
    const stateCode = getStateFromZip(formData.zipCode);
    if (!stateCode) {
      return null;
    }
    
    const stateName = getStateName(stateCode);
    const rates = getUtilityRates(stateCode);
    const climate = getClimateZoneInfo(stateCode);
    
    return {
      stateCode,
      stateName,
      electricityRate: rates.electricity,
      gasRate: rates.gas,
      climateZone: climate.zone,
      climateDescription: climate.description,
      climateAdjustment: climate.adjustment,
    };
  }, [formData.zipCode]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Building Information</h2>
        <span className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Building Name */}
        <div>
          <label htmlFor="buildingName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Building Name
            <InfoTooltip content={FIELD_DESCRIPTIONS.buildingName} />
          </label>
          <input
            type="text"
            id="buildingName"
            name="buildingName"
            value={formData.buildingName}
            onChange={onChange}
            placeholder="e.g., Main Office Building"
            className={`${inputBaseClass} ${inputNormalClass}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Business Type - REQUIRED */}
          <div>
            <label htmlFor="businessType" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Business Type <span className="text-red-500 ml-1">*</span>
              <InfoTooltip content={FIELD_DESCRIPTIONS.businessType} />
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={onChange}
              onBlur={() => handleBlur("businessType")}
              className={`${inputBaseClass} ${getFieldError("businessType") ? inputErrorClass : inputNormalClass}`}
            >
              <option value="">Select business type</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
              <option value="Restaurant / Food Service">Restaurant / Food Service</option>
              <option value="Grocery / Food Market">Grocery / Food Market</option>
              <option value="Warehouse / Inventory">Warehouse / Inventory</option>
              <option value="K–12 School">K–12 School</option>
              <option value="Lodging / Hospitality">Lodging / Hospitality</option>
              <option value="Industrial Manufacturing">Industrial Manufacturing</option>
              <option value="Other">Other</option>
            </select>
            {getFieldError("businessType") && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {getFieldError("businessType")}
              </p>
            )}
          </div>

          {/* Floor Area - REQUIRED */}
          <div>
            <label htmlFor="floorArea" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Floor Area (sq ft) <span className="text-red-500 ml-1">*</span>
              <InfoTooltip content={FIELD_DESCRIPTIONS.floorArea} />
            </label>
            <input
              type="number"
              id="floorArea"
              name="floorArea"
              value={formData.floorArea}
              onChange={onChange}
              onBlur={() => handleBlur("floorArea")}
              placeholder="e.g., 10000"
              min="1"
              className={`${inputBaseClass} ${getFieldError("floorArea") ? inputErrorClass : inputNormalClass}`}
            />
            {getFieldError("floorArea") && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {getFieldError("floorArea")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ZIP Code */}
          <div>
            <label htmlFor="zipCode" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              ZIP Code
              <InfoTooltip content={FIELD_DESCRIPTIONS.zipCode} />
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={onChange}
              placeholder="e.g., 90210"
              maxLength={5}
              className={`${inputBaseClass} ${inputNormalClass}`}
            />
            {!locationInfo && (
              <p className="mt-1 text-xs text-gray-500">Used for state utility rates & climate zone</p>
            )}
          </div>

          {/* Construction Year */}
          <div>
            <label htmlFor="constructionYear" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Construction Year
              <InfoTooltip content={FIELD_DESCRIPTIONS.constructionYear} />
            </label>
            <select
              id="constructionYear"
              name="constructionYear"
              value={formData.constructionYear}
              onChange={onChange}
              className={`${inputBaseClass} ${inputNormalClass}`}
            >
              <option value="">Select construction year</option>
              <option value="Before 2000">Before 2000</option>
              <option value="2000–2010">2000–2010</option>
              <option value="After 2010">After 2010</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Affects energy efficiency estimates</p>
          </div>
        </div>

        {/* Location Info Display */}
        {locationInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-gray-900">
                {locationInfo.stateName} ({locationInfo.stateCode})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Electricity Rate */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500 uppercase">Electricity Rate</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${locationInfo.electricityRate.toFixed(3)}<span className="text-sm font-normal text-gray-500">/kWh</span>
                </div>
              </div>
              
              {/* Gas Rate */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500 uppercase">Gas Rate</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${locationInfo.gasRate.toFixed(2)}<span className="text-sm font-normal text-gray-500">/therm</span>
                </div>
              </div>
              
              {/* Climate Zone */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.5 16.5a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm4 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm4 8a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500 uppercase">Climate Zone</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {locationInfo.climateZone}
                  {locationInfo.climateAdjustment !== 1.0 && (
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      locationInfo.climateAdjustment > 1 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {locationInfo.climateAdjustment > 1 ? '+' : ''}{Math.round((locationInfo.climateAdjustment - 1) * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{locationInfo.climateDescription}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Primary Heating Fuel */}
          <div>
            <label htmlFor="primaryHeatingFuel" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Primary Heating Fuel
              <InfoTooltip content={FIELD_DESCRIPTIONS.primaryHeatingFuel} />
            </label>
            <select
              id="primaryHeatingFuel"
              name="primaryHeatingFuel"
              value={formData.primaryHeatingFuel}
              onChange={onChange}
              className={`${inputBaseClass} ${inputNormalClass}`}
            >
              <option value="">Select heating fuel</option>
              <option value="Electric">Electric</option>
              <option value="Natural Gas">Natural Gas</option>
              <option value="Fuel Oil">Fuel Oil</option>
              <option value="Propane">Propane</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Main source for heating/cooling</p>
          </div>

          {/* Secondary Fuel */}
          <div>
            <label htmlFor="secondaryFuel" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Secondary Fuel
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
              <InfoTooltip content={FIELD_DESCRIPTIONS.secondaryFuel} />
            </label>
            <select
              id="secondaryFuel"
              name="secondaryFuel"
              value={formData.secondaryFuel}
              onChange={onChange}
              className={`${inputBaseClass} ${inputNormalClass}`}
            >
              <option value="None">None</option>
              <option value="Electric">Electric</option>
              <option value="Natural Gas">Natural Gas</option>
              <option value="Fuel Oil">Fuel Oil</option>
              <option value="Propane">Propane</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Water heating, cooking, etc.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={!validation.isValid}
            className={`px-8 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-sm ${
              validation.isValid
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Run Assessment
          </button>
          {!validation.isValid && showErrors && (
            <p className="text-sm text-red-600">
              Please fill in all required fields to run the assessment.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
