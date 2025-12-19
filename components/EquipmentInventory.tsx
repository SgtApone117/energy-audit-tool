"use client";

import { useState } from "react";
import {
  EquipmentInventory as EquipmentInventoryType,
  HVACUnit,
  LightingZone,
  MajorEquipment,
  HVACSystemType,
  HVACCondition,
  LightingFixtureType,
  LightingControlType,
  MajorEquipmentType,
  createEmptyHVACUnit,
  createEmptyLightingZone,
  createEmptyMajorEquipment,
  createEmptyEquipmentInventory,
  LIGHTING_WATTAGE_TYPICAL,
} from "@/lib/equipment/types";
import { calculateEquipmentTotals, getEquipmentSummary } from "@/lib/equipment/equipmentCalculations";

interface EquipmentInventoryProps {
  equipment: EquipmentInventoryType;
  onChange: (data: EquipmentInventoryType) => void;
}

const HVAC_SYSTEM_TYPES: HVACSystemType[] = [
  "Packaged Rooftop Unit",
  "Split System",
  "Heat Pump",
  "Window AC",
  "PTAC",
  "VRF System",
  "Furnace",
  "Boiler",
  "Chiller",
  "Other",
];

const HVAC_CONDITIONS: HVACCondition[] = ["Excellent", "Good", "Fair", "Poor"];

const LIGHTING_FIXTURE_TYPES: LightingFixtureType[] = [
  "LED",
  "Fluorescent T8",
  "Fluorescent T12",
  "Fluorescent T5",
  "CFL",
  "Incandescent",
  "Halogen",
  "Metal Halide",
  "High Pressure Sodium",
  "Other",
];

const LIGHTING_CONTROL_TYPES: LightingControlType[] = [
  "Manual Switch",
  "Occupancy Sensor",
  "Daylight Sensor",
  "Timer",
  "Dimmer",
  "Smart Control",
  "None",
];

const MAJOR_EQUIPMENT_TYPES: MajorEquipmentType[] = [
  "Walk-in Cooler",
  "Walk-in Freezer",
  "Display Case (Refrigerated)",
  "Display Case (Frozen)",
  "Ice Machine",
  "Commercial Refrigerator",
  "Commercial Freezer",
  "Air Compressor",
  "Electric Motor",
  "Pump",
  "Conveyor",
  "Industrial Oven",
  "Commercial Kitchen Equipment",
  "Data Center / Server Room",
  "Electric Vehicle Charger",
  "Other",
];

export default function EquipmentInventory({
  equipment,
  onChange,
}: EquipmentInventoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"hvac" | "lighting" | "equipment">("hvac");

  const updateEquipment = (
    updates: Partial<EquipmentInventoryType>
  ) => {
    const newEquipment = { ...equipment, ...updates, hasEquipmentData: true };
    const totals = calculateEquipmentTotals(newEquipment);
    onChange({ ...newEquipment, ...totals });
  };

  // HVAC handlers
  const addHVACUnit = () => {
    updateEquipment({ hvacUnits: [...equipment.hvacUnits, createEmptyHVACUnit()] });
  };

  const updateHVACUnit = (index: number, updates: Partial<HVACUnit>) => {
    const newUnits = [...equipment.hvacUnits];
    newUnits[index] = { ...newUnits[index], ...updates };
    updateEquipment({ hvacUnits: newUnits });
  };

  const removeHVACUnit = (index: number) => {
    updateEquipment({ hvacUnits: equipment.hvacUnits.filter((_, i) => i !== index) });
  };

  // Lighting handlers
  const addLightingZone = () => {
    updateEquipment({ lightingZones: [...equipment.lightingZones, createEmptyLightingZone()] });
  };

  const updateLightingZone = (index: number, updates: Partial<LightingZone>) => {
    const newZones = [...equipment.lightingZones];
    // Auto-fill wattage when fixture type changes
    if (updates.fixtureType && !newZones[index].wattsPerFixture) {
      updates.wattsPerFixture = LIGHTING_WATTAGE_TYPICAL[updates.fixtureType];
    }
    newZones[index] = { ...newZones[index], ...updates };
    updateEquipment({ lightingZones: newZones });
  };

  const removeLightingZone = (index: number) => {
    updateEquipment({ lightingZones: equipment.lightingZones.filter((_, i) => i !== index) });
  };

  // Major equipment handlers
  const addMajorEquipment = () => {
    updateEquipment({ majorEquipment: [...equipment.majorEquipment, createEmptyMajorEquipment()] });
  };

  const updateMajorEquipmentItem = (index: number, updates: Partial<MajorEquipment>) => {
    const newItems = [...equipment.majorEquipment];
    newItems[index] = { ...newItems[index], ...updates };
    updateEquipment({ majorEquipment: newItems });
  };

  const removeMajorEquipment = (index: number) => {
    updateEquipment({ majorEquipment: equipment.majorEquipment.filter((_, i) => i !== index) });
  };

  const handleClearAll = () => {
    onChange(createEmptyEquipmentInventory());
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tab
        ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Equipment Inventory
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {equipment.hasEquipmentData
              ? getEquipmentSummary(equipment)
              : "Add equipment details for more accurate ECM recommendations"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Add Equipment
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            <button type="button" className={tabClass("hvac")} onClick={() => setActiveTab("hvac")}>
              HVAC ({equipment.hvacUnits.length})
            </button>
            <button type="button" className={tabClass("lighting")} onClick={() => setActiveTab("lighting")}>
              Lighting ({equipment.lightingZones.length})
            </button>
            <button type="button" className={tabClass("equipment")} onClick={() => setActiveTab("equipment")}>
              Other Equipment ({equipment.majorEquipment.length})
            </button>
            {equipment.hasEquipmentData && (
              <button
                type="button"
                onClick={handleClearAll}
                className="ml-auto text-sm text-red-600 hover:text-red-700 px-3"
              >
                Clear all
              </button>
            )}
          </div>

          {/* HVAC Tab */}
          {activeTab === "hvac" && (
            <div className="space-y-4">
              {equipment.hvacUnits.map((unit, index) => (
                <div key={unit.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      HVAC Unit #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHVACUnit(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">System Type</label>
                      <select
                        value={unit.systemType}
                        onChange={(e) =>
                          updateHVACUnit(index, { systemType: e.target.value as HVACSystemType })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {HVAC_SYSTEM_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={unit.capacity || ""}
                          onChange={(e) =>
                            updateHVACUnit(index, { capacity: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                        <select
                          value={unit.capacityUnit}
                          onChange={(e) =>
                            updateHVACUnit(index, { capacityUnit: e.target.value as "tons" | "BTU/hr" | "kW" })
                          }
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="tons">tons</option>
                          <option value="BTU/hr">BTU/hr</option>
                          <option value="kW">kW</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Age (years)</label>
                      <input
                        type="number"
                        min="0"
                        value={unit.age || ""}
                        onChange={(e) =>
                          updateHVACUnit(index, { age: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Condition</label>
                      <select
                        value={unit.condition}
                        onChange={(e) =>
                          updateHVACUnit(index, { condition: e.target.value as HVACCondition })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {HVAC_CONDITIONS.map((cond) => (
                          <option key={cond} value={cond}>{cond}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fuel Type</label>
                      <select
                        value={unit.fuelType}
                        onChange={(e) =>
                          updateHVACUnit(index, { fuelType: e.target.value as HVACUnit["fuelType"] })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Electric">Electric</option>
                        <option value="Natural Gas">Natural Gas</option>
                        <option value="Fuel Oil">Fuel Oil</option>
                        <option value="Propane">Propane</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Efficiency Rating</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={unit.efficiencyRating || ""}
                        onChange={(e) =>
                          updateHVACUnit(index, { efficiencyRating: parseFloat(e.target.value) || undefined })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="SEER/EER"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={unit.hasSmartThermostat}
                          onChange={(e) =>
                            updateHVACUnit(index, { hasSmartThermostat: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Smart Thermostat</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addHVACUnit}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add HVAC Unit
              </button>
            </div>
          )}

          {/* Lighting Tab */}
          {activeTab === "lighting" && (
            <div className="space-y-4">
              {equipment.lightingZones.map((zone, index) => (
                <div key={zone.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Lighting Zone #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLightingZone(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={zone.zoneName}
                        onChange={(e) =>
                          updateLightingZone(index, { zoneName: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Main Office, Warehouse"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fixture Type</label>
                      <select
                        value={zone.fixtureType}
                        onChange={(e) =>
                          updateLightingZone(index, { fixtureType: e.target.value as LightingFixtureType })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {LIGHTING_FIXTURE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Control Type</label>
                      <select
                        value={zone.controlType}
                        onChange={(e) =>
                          updateLightingZone(index, { controlType: e.target.value as LightingControlType })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {LIGHTING_CONTROL_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1"># Fixtures</label>
                      <input
                        type="number"
                        min="0"
                        value={zone.fixtureCount || ""}
                        onChange={(e) =>
                          updateLightingZone(index, { fixtureCount: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Watts/Fixture</label>
                      <input
                        type="number"
                        min="0"
                        value={zone.wattsPerFixture || ""}
                        onChange={(e) =>
                          updateLightingZone(index, { wattsPerFixture: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hours/Day</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={zone.hoursPerDay || ""}
                        onChange={(e) =>
                          updateLightingZone(index, { hoursPerDay: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Days/Week</label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={zone.daysPerWeek || ""}
                        onChange={(e) =>
                          updateLightingZone(index, { daysPerWeek: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addLightingZone}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lighting Zone
              </button>
            </div>
          )}

          {/* Major Equipment Tab */}
          {activeTab === "equipment" && (
            <div className="space-y-4">
              {equipment.majorEquipment.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Equipment #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMajorEquipment(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Equipment Type</label>
                      <select
                        value={item.equipmentType}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { equipmentType: e.target.value as MajorEquipmentType })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {MAJOR_EQUIPMENT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { description: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Walk-in cooler in back room"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { quantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Power Rating (kW)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.powerRating || ""}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { powerRating: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Age (years)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.age || ""}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { age: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hours/Day</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={item.hoursPerDay || ""}
                        onChange={(e) =>
                          updateMajorEquipmentItem(index, { hoursPerDay: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="8"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.hasVFD}
                          onChange={(e) =>
                            updateMajorEquipmentItem(index, { hasVFD: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Has VFD</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMajorEquipment}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            </div>
          )}

          {/* Summary */}
          {equipment.hasEquipmentData && (
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-900 mb-2">Equipment Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {equipment.totalHVACCapacity > 0 && (
                  <div>
                    <span className="text-blue-700">Total HVAC:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {equipment.totalHVACCapacity} tons
                    </span>
                  </div>
                )}
                {equipment.totalLightingWattage > 0 && (
                  <div>
                    <span className="text-blue-700">Total Lighting:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {(equipment.totalLightingWattage / 1000).toFixed(1)} kW
                    </span>
                  </div>
                )}
                {equipment.totalMajorEquipmentLoad > 0 && (
                  <div>
                    <span className="text-blue-700">Other Equipment:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {equipment.totalMajorEquipmentLoad.toFixed(1)} kW
                    </span>
                  </div>
                )}
                {equipment.estimatedAnnualHVACKwh > 0 && (
                  <div>
                    <span className="text-blue-700">Est. HVAC Usage:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {equipment.estimatedAnnualHVACKwh.toLocaleString()} kWh/yr
                    </span>
                  </div>
                )}
                {equipment.estimatedAnnualLightingKwh > 0 && (
                  <div>
                    <span className="text-blue-700">Est. Lighting Usage:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {equipment.estimatedAnnualLightingKwh.toLocaleString()} kWh/yr
                    </span>
                  </div>
                )}
                {equipment.estimatedAnnualEquipmentKwh > 0 && (
                  <div>
                    <span className="text-blue-700">Est. Equipment Usage:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {equipment.estimatedAnnualEquipmentKwh.toLocaleString()} kWh/yr
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
