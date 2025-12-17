"use client";

import type { FormData, BusinessType, ConstructionYear, PrimaryHeatingFuel } from "@/lib/types";

interface BuildingIntakeFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function BuildingIntakeForm({
  formData,
  onChange,
  onSubmit,
}: BuildingIntakeFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Building Information</h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-2">
            Building Name
          </label>
          <input
            type="text"
            id="buildingName"
            name="buildingName"
            value={formData.buildingName}
            onChange={onChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
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
          </div>

          <div>
            <label htmlFor="floorArea" className="block text-sm font-medium text-gray-700 mb-2">
              Floor Area (square feet)
            </label>
            <input
              type="number"
              id="floorArea"
              name="floorArea"
              value={formData.floorArea}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="constructionYear" className="block text-sm font-medium text-gray-700 mb-2">
              Construction Year
            </label>
            <select
              id="constructionYear"
              name="constructionYear"
              value={formData.constructionYear}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select construction year</option>
              <option value="Before 2000">Before 2000</option>
              <option value="2000–2010">2000–2010</option>
              <option value="After 2010">After 2010</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="primaryHeatingFuel" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Heating Fuel
          </label>
          <select
            id="primaryHeatingFuel"
            name="primaryHeatingFuel"
            value={formData.primaryHeatingFuel}
            onChange={onChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          >
            <option value="">Select heating fuel</option>
            <option value="Electric">Electric</option>
            <option value="Natural Gas">Natural Gas</option>
            <option value="Fuel Oil">Fuel Oil</option>
            <option value="Propane">Propane</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Run Assessment
          </button>
        </div>
      </form>
    </div>
  );
}

