'use client';

import { useState } from 'react';
import { Input, Select, Button, Accordion, AccordionItem } from '@/components/ui';
import { Settings, Plus, Trash2, Thermometer, Lightbulb, Snowflake, Flame, Clock } from 'lucide-react';
import {
  CustomerAssessmentForm,
  HVACSystem,
  LightingDetails,
  RefrigerationEquipment,
  CookingEquipment,
  OperatingSchedule,
  HVACSystemType,
  AgeRange,
  EquipmentCondition,
  ThermostatType,
  BulbType,
  LightingControlType,
  OccupancyLevel,
  createEmptyHVACSystem,
  createEmptyLightingDetails,
  createEmptyRefrigerationEquipment,
  createEmptyCookingEquipment,
  createEmptyOperatingSchedule,
} from '@/lib/customer/types';

interface EquipmentInventoryProps {
  formData: CustomerAssessmentForm;
  onAddHVAC: () => void;
  onUpdateHVAC: (id: string, updates: Partial<HVACSystem>) => void;
  onRemoveHVAC: (id: string) => void;
  onUpdateLighting: (details: LightingDetails | null) => void;
  onUpdateRefrigeration: (equipment: RefrigerationEquipment | null) => void;
  onUpdateCooking: (equipment: CookingEquipment | null) => void;
  onUpdateSchedule: (schedule: OperatingSchedule | null) => void;
  completionPercentage: number;
}

const HVAC_TYPES: { value: HVACSystemType; label: string }[] = [
  { value: 'Central AC', label: 'Central Air Conditioning' },
  { value: 'Heat Pump', label: 'Heat Pump' },
  { value: 'Rooftop Unit', label: 'Rooftop Unit (RTU)' },
  { value: 'Split System', label: 'Split System' },
  { value: 'Window Unit', label: 'Window Unit' },
  { value: 'PTAC', label: 'PTAC' },
  { value: 'Furnace', label: 'Furnace' },
  { value: 'Boiler', label: 'Boiler' },
  { value: 'Other', label: 'Other' },
];

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '0-5', label: '0-5 years (newer)' },
  { value: '6-10', label: '6-10 years' },
  { value: '11-15', label: '11-15 years' },
  { value: '16-20', label: '16-20 years' },
  { value: '20+', label: '20+ years (older)' },
];

const CONDITIONS: { value: EquipmentCondition; label: string }[] = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

const THERMOSTAT_TYPES: { value: ThermostatType; label: string }[] = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Programmable', label: 'Programmable' },
  { value: 'Smart', label: 'Smart (Wi-Fi connected)' },
];

const BULB_TYPES: { value: BulbType; label: string }[] = [
  { value: 'LED', label: 'LED' },
  { value: 'Fluorescent', label: 'Fluorescent/CFL' },
  { value: 'Incandescent', label: 'Incandescent/Halogen' },
  { value: 'Mixed', label: 'Mixed types' },
];

const LIGHTING_CONTROLS: { value: LightingControlType; label: string }[] = [
  { value: 'None', label: 'None / Manual only' },
  { value: 'Timers', label: 'Timers' },
  { value: 'Occupancy Sensors', label: 'Occupancy Sensors' },
  { value: 'Daylight Sensors', label: 'Daylight Sensors' },
];

const OCCUPANCY_LEVELS: { value: OccupancyLevel; label: string }[] = [
  { value: 'Light', label: 'Light (few people/activity)' },
  { value: 'Moderate', label: 'Moderate (typical office)' },
  { value: 'Heavy', label: 'Heavy (retail, restaurant)' },
  { value: 'Very Heavy', label: 'Very Heavy (busy restaurant, gym)' },
];

export function EquipmentInventory({
  formData,
  onAddHVAC,
  onUpdateHVAC,
  onRemoveHVAC,
  onUpdateLighting,
  onUpdateRefrigeration,
  onUpdateCooking,
  onUpdateSchedule,
  completionPercentage,
}: EquipmentInventoryProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Helper functions to check if section has meaningful data
  const hasLightingData = () => {
    return formData.lightingDetails && 
      (formData.lightingDetails.totalFixtures !== null || 
       formData.lightingDetails.hoursPerDay !== null);
  };

  const hasRefrigerationData = () => {
    return formData.refrigerationEquipment && 
      (formData.refrigerationEquipment.hasWalkInCooler || 
       formData.refrigerationEquipment.hasWalkInFreezer ||
       formData.refrigerationEquipment.reachInUnits > 0 ||
       formData.refrigerationEquipment.displayCases > 0 ||
       formData.refrigerationEquipment.iceMachines > 0);
  };

  const hasCookingData = () => {
    return formData.cookingEquipment && 
      (formData.cookingEquipment.ovens > 0 ||
       formData.cookingEquipment.ranges > 0 ||
       formData.cookingEquipment.fryers > 0 ||
       formData.cookingEquipment.grills > 0 ||
       formData.cookingEquipment.dishwashers > 0);
  };

  // Initialize sections if not already set
  const initializeLighting = () => {
    if (!formData.lightingDetails) {
      onUpdateLighting(createEmptyLightingDetails());
    }
  };

  const initializeRefrigeration = () => {
    if (!formData.refrigerationEquipment) {
      onUpdateRefrigeration(createEmptyRefrigerationEquipment());
    }
  };

  const initializeCooking = () => {
    if (!formData.cookingEquipment) {
      onUpdateCooking(createEmptyCookingEquipment());
    }
  };

  const initializeSchedule = () => {
    if (!formData.operatingSchedule) {
      onUpdateSchedule(createEmptyOperatingSchedule());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Equipment Details</h2>
          <p className="text-sm text-gray-500">Optional but helps provide better recommendations</p>
        </div>
      </div>

      {/* Completion indicator */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Equipment details: {completionPercentage}% complete
            </span>
            <span className="text-xs text-gray-500">
              {completionPercentage === 0 ? 'Optional - skip if you prefer' : 'Great! More data = better insights'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* HVAC Section */}
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          onClick={() => toggleSection('hvac')}
        >
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-red-500" />
            <span className="font-medium">HVAC Systems</span>
            {formData.hvacSystems.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {formData.hvacSystems.length} system{formData.hvacSystems.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-gray-400">{expandedSections.includes('hvac') ? '−' : '+'}</span>
        </button>
        {expandedSections.includes('hvac') && (
          <div className="p-4 border-t space-y-4">
            {formData.hvacSystems.map((system, index) => (
              <div key={system.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">System {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveHVAC(system.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="System Type"
                    options={HVAC_TYPES}
                    value={system.systemType}
                    onChange={(e) => onUpdateHVAC(system.id, { systemType: e.target.value as HVACSystemType })}
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    value={system.quantity}
                    onChange={(e) => onUpdateHVAC(system.id, { quantity: parseInt(e.target.value) || 1 })}
                  />
                  <Select
                    label="Age"
                    options={AGE_RANGES}
                    value={system.ageRange}
                    onChange={(e) => onUpdateHVAC(system.id, { ageRange: e.target.value as AgeRange })}
                  />
                  <Select
                    label="Condition"
                    options={CONDITIONS}
                    value={system.condition}
                    onChange={(e) => onUpdateHVAC(system.id, { condition: e.target.value as EquipmentCondition })}
                  />
                  <Select
                    label="Thermostat Type"
                    options={THERMOSTAT_TYPES}
                    value={system.thermostatType}
                    onChange={(e) => onUpdateHVAC(system.id, { thermostatType: e.target.value as ThermostatType })}
                  />
                  <Input
                    label="Tonnage (optional)"
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g., 3.5"
                    value={system.tonnage ?? ''}
                    onChange={(e) => onUpdateHVAC(system.id, { tonnage: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={onAddHVAC}>
              <Plus className="w-4 h-4 mr-2" />
              Add HVAC System
            </Button>
          </div>
        )}
      </div>

      {/* Lighting Section */}
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          onClick={() => {
            toggleSection('lighting');
            initializeLighting();
          }}
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Lighting</span>
            {hasLightingData() && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
          <span className="text-gray-400">{expandedSections.includes('lighting') ? '−' : '+'}</span>
        </button>
        {expandedSections.includes('lighting') && formData.lightingDetails && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Light Fixtures"
                type="number"
                min={0}
                placeholder="e.g., 50"
                value={formData.lightingDetails.totalFixtures ?? ''}
                onChange={(e) =>
                  onUpdateLighting({
                    ...formData.lightingDetails!,
                    totalFixtures: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
              <Select
                label="Primary Bulb Type"
                options={BULB_TYPES}
                value={formData.lightingDetails.primaryBulbType}
                onChange={(e) =>
                  onUpdateLighting({
                    ...formData.lightingDetails!,
                    primaryBulbType: e.target.value as BulbType,
                  })
                }
              />
              <Input
                label="Avg Hours/Day On"
                type="number"
                min={0}
                max={24}
                placeholder="e.g., 10"
                value={formData.lightingDetails.hoursPerDay ?? ''}
                onChange={(e) =>
                  onUpdateLighting({
                    ...formData.lightingDetails!,
                    hoursPerDay: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
              <Select
                label="Lighting Controls"
                options={LIGHTING_CONTROLS}
                value={formData.lightingDetails.lightingControls}
                onChange={(e) =>
                  onUpdateLighting({
                    ...formData.lightingDetails!,
                    lightingControls: e.target.value as LightingControlType,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Refrigeration Section */}
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          onClick={() => {
            toggleSection('refrigeration');
            initializeRefrigeration();
          }}
        >
          <div className="flex items-center gap-3">
            <Snowflake className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Refrigeration</span>
            {hasRefrigerationData() && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
          <span className="text-gray-400">{expandedSections.includes('refrigeration') ? '−' : '+'}</span>
        </button>
        {expandedSections.includes('refrigeration') && formData.refrigerationEquipment && (
          <div className="p-4 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.refrigerationEquipment.hasWalkInCooler}
                    onChange={(e) =>
                      onUpdateRefrigeration({
                        ...formData.refrigerationEquipment!,
                        hasWalkInCooler: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Walk-in Cooler</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.refrigerationEquipment.hasWalkInFreezer}
                    onChange={(e) =>
                      onUpdateRefrigeration({
                        ...formData.refrigerationEquipment!,
                        hasWalkInFreezer: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Walk-in Freezer</span>
                </label>
              </div>
              <Input
                label="Reach-in Refrigerators"
                type="number"
                min={0}
                value={formData.refrigerationEquipment.reachInUnits}
                onChange={(e) =>
                  onUpdateRefrigeration({
                    ...formData.refrigerationEquipment!,
                    reachInUnits: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Display Cases"
                type="number"
                min={0}
                value={formData.refrigerationEquipment.displayCases}
                onChange={(e) =>
                  onUpdateRefrigeration({
                    ...formData.refrigerationEquipment!,
                    displayCases: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Ice Machines"
                type="number"
                min={0}
                value={formData.refrigerationEquipment.iceMachines}
                onChange={(e) =>
                  onUpdateRefrigeration({
                    ...formData.refrigerationEquipment!,
                    iceMachines: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Cooking Section */}
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          onClick={() => {
            toggleSection('cooking');
            initializeCooking();
          }}
        >
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-medium">Cooking Equipment</span>
            {hasCookingData() && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
          <span className="text-gray-400">{expandedSections.includes('cooking') ? '−' : '+'}</span>
        </button>
        {expandedSections.includes('cooking') && formData.cookingEquipment && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Ovens"
                type="number"
                min={0}
                value={formData.cookingEquipment.ovens}
                onChange={(e) =>
                  onUpdateCooking({
                    ...formData.cookingEquipment!,
                    ovens: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Ranges/Cooktops"
                type="number"
                min={0}
                value={formData.cookingEquipment.ranges}
                onChange={(e) =>
                  onUpdateCooking({
                    ...formData.cookingEquipment!,
                    ranges: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Fryers"
                type="number"
                min={0}
                value={formData.cookingEquipment.fryers}
                onChange={(e) =>
                  onUpdateCooking({
                    ...formData.cookingEquipment!,
                    fryers: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Grills"
                type="number"
                min={0}
                value={formData.cookingEquipment.grills}
                onChange={(e) =>
                  onUpdateCooking({
                    ...formData.cookingEquipment!,
                    grills: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Dishwashers"
                type="number"
                min={0}
                value={formData.cookingEquipment.dishwashers}
                onChange={(e) =>
                  onUpdateCooking({
                    ...formData.cookingEquipment!,
                    dishwashers: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Operating Schedule Section */}
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          onClick={() => {
            toggleSection('schedule');
            initializeSchedule();
          }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">Operating Schedule</span>
            {formData.operatingSchedule && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
          <span className="text-gray-400">{expandedSections.includes('schedule') ? '−' : '+'}</span>
        </button>
        {expandedSections.includes('schedule') && formData.operatingSchedule && (
          <div className="p-4 border-t space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.operatingSchedule.isOpen24x7}
                onChange={(e) =>
                  onUpdateSchedule({
                    ...formData.operatingSchedule!,
                    isOpen24x7: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Open 24/7</span>
            </label>

            {!formData.operatingSchedule.isOpen24x7 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Weekly schedule:</p>
                <div className="grid grid-cols-1 gap-2">
                  {formData.operatingSchedule.weeklySchedule.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <label className="flex items-center gap-2 w-28">
                        <input
                          type="checkbox"
                          checked={day.isOpen}
                          onChange={(e) => {
                            const newSchedule = [...formData.operatingSchedule!.weeklySchedule];
                            newSchedule[index] = { ...day, isOpen: e.target.checked };
                            onUpdateSchedule({
                              ...formData.operatingSchedule!,
                              weeklySchedule: newSchedule,
                            });
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{day.day.slice(0, 3)}</span>
                      </label>
                      {day.isOpen && (
                        <>
                          <input
                            type="time"
                            value={day.openTime}
                            onChange={(e) => {
                              const newSchedule = [...formData.operatingSchedule!.weeklySchedule];
                              newSchedule[index] = { ...day, openTime: e.target.value };
                              onUpdateSchedule({
                                ...formData.operatingSchedule!,
                                weeklySchedule: newSchedule,
                              });
                            }}
                            className="text-sm px-2 py-1 border rounded"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) => {
                              const newSchedule = [...formData.operatingSchedule!.weeklySchedule];
                              newSchedule[index] = { ...day, closeTime: e.target.value };
                              onUpdateSchedule({
                                ...formData.operatingSchedule!,
                                weeklySchedule: newSchedule,
                              });
                            }}
                            className="text-sm px-2 py-1 border rounded"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Occupancy Level"
                options={OCCUPANCY_LEVELS}
                value={formData.operatingSchedule.occupancyLevel}
                onChange={(e) =>
                  onUpdateSchedule({
                    ...formData.operatingSchedule!,
                    occupancyLevel: e.target.value as OccupancyLevel,
                  })
                }
              />
              <Input
                label="Holiday Closures/Year"
                type="number"
                min={0}
                max={365}
                value={formData.operatingSchedule.holidayClosuresPerYear}
                onChange={(e) =>
                  onUpdateSchedule({
                    ...formData.operatingSchedule!,
                    holidayClosuresPerYear: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
        <h3 className="text-sm font-medium text-purple-900 mb-2">Why add equipment details?</h3>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Get more accurate energy breakdown estimates</li>
          <li>Receive equipment-specific upgrade recommendations</li>
          <li>Identify quick wins based on your actual equipment</li>
        </ul>
        <p className="text-sm text-purple-700 mt-2 italic">
          This step is optional - you can skip to review at any time.
        </p>
      </div>
    </div>
  );
}
