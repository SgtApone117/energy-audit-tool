'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, InfoTooltip } from '@/components/ui';
import { 
  Fan, 
  Thermometer, 
  Plus, 
  Trash2,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AuditHVACUnit, 
  AuditEquipment,
  generateId,
  HVAC_CONFIG_GROUPS,
  HVACConfig,
  createHVACFromConfig,
} from '@/lib/auditor/types';
import { TOOLTIP_CONTENT } from '@/lib/core/data/tooltipContent';

interface EquipmentInventoryFormProps {
  hvacUnits: AuditHVACUnit[];
  equipment: AuditEquipment[];
  onHVACChange: (units: AuditHVACUnit[]) => void;
  onEquipmentChange: (equipment: AuditEquipment[]) => void;
}

const HVAC_TYPES = [
  'Packaged Rooftop Unit',
  'Split System',
  'Heat Pump',
  'Window AC',
  'PTAC',
  'VRF System',
  'Furnace',
  'Boiler',
  'Chiller',
  'Other',
];

const EQUIPMENT_TYPES = [
  'Walk-in Cooler',
  'Walk-in Freezer',
  'Display Case (Refrigerated)',
  'Display Case (Frozen)',
  'Ice Machine',
  'Commercial Refrigerator',
  'Commercial Freezer',
  'Air Compressor',
  'Electric Motor',
  'Pump',
  'Conveyor',
  'Commercial Oven',
  'Commercial Kitchen Equipment',
  'Water Heater',
  'Server/IT Equipment',
  'Other',
];

export function EquipmentInventoryForm({
  hvacUnits,
  equipment,
  onHVACChange,
  onEquipmentChange,
}: EquipmentInventoryFormProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('combined');

  // HVAC handlers
  const addHVAC = () => {
    const newUnit: AuditHVACUnit = {
      id: generateId(),
      systemType: 'Packaged Rooftop Unit',
      capacityUnit: 'tons',
      condition: 'good',
      fuelType: 'Electric',
      hasSmartThermostat: false,
      photoIds: [],
    };
    onHVACChange([...hvacUnits, newUnit]);
  };

  const addHVACFromConfig = (config: HVACConfig) => {
    const baseUnit = createHVACFromConfig(config);
    const newUnit: AuditHVACUnit = {
      id: generateId(),
      ...baseUnit,
    };
    onHVACChange([...hvacUnits, newUnit]);
  };

  const updateHVAC = (id: string, updates: Partial<AuditHVACUnit>) => {
    onHVACChange(hvacUnits.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const removeHVAC = (id: string) => {
    onHVACChange(hvacUnits.filter(u => u.id !== id));
  };

  // Equipment handlers
  const addEquipment = () => {
    const newItem: AuditEquipment = {
      id: generateId(),
      equipmentType: 'Commercial Refrigerator',
      description: '',
      quantity: 1,
      photoIds: [],
    };
    onEquipmentChange([...equipment, newItem]);
  };

  const updateEquipment = (id: string, updates: Partial<AuditEquipment>) => {
    onEquipmentChange(equipment.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeEquipment = (id: string) => {
    onEquipmentChange(equipment.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HVAC Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Fan className="w-5 h-5 text-blue-600" />
              HVAC Systems ({hvacUnits.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowQuickAdd(!showQuickAdd)}
              >
                <Zap className="w-4 h-4 mr-1" />
                Quick Add
                {showQuickAdd ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
              <Button size="sm" onClick={addHVAC}>
                <Plus className="w-4 h-4 mr-1" />
                Add Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Add Panel */}
          {showQuickAdd && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-3">
                Quick Add Common HVAC Equipment
              </h3>
              <p className="text-xs text-blue-700 mb-4">
                Select a common configuration to auto-fill specifications
              </p>
              
              <div className="space-y-3">
                {HVAC_CONFIG_GROUPS.map((group) => (
                  <div key={group.category} className="border border-blue-200 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => setExpandedGroup(expandedGroup === group.category ? null : group.category)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <span>{group.label}</span>
                      <span className="text-xs text-gray-500">
                        {group.configs.length} options
                        {expandedGroup === group.category ? (
                          <ChevronUp className="w-4 h-4 inline ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 inline ml-1" />
                        )}
                      </span>
                    </button>
                    
                    {expandedGroup === group.category && (
                      <div className="px-3 pb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {group.configs.map((config) => (
                          <button
                            key={config.id}
                            onClick={() => {
                              addHVACFromConfig(config);
                              setShowQuickAdd(false);
                            }}
                            className="text-left p-2 text-xs bg-gray-50 hover:bg-blue-100 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="font-medium text-gray-900 truncate">{config.label}</div>
                            <div className="text-gray-500 mt-0.5">
                              {config.fuelType}
                              {config.typicalSEER && ` • SEER ${config.typicalSEER}`}
                              {config.typicalAFUE && ` • ${config.typicalAFUE}% AFUE`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hvacUnits.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No HVAC units added yet. Use Quick Add or click Add Custom to start.
            </p>
          ) : (
            <div className="space-y-4">
              {hvacUnits.map((unit, index) => (
                <div key={unit.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Unit #{index + 1}</span>
                    <button
                      onClick={() => removeHVAC(unit.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">System Type</label>
                      <select
                        value={unit.systemType}
                        onChange={(e) => updateHVAC(unit.id, { systemType: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {HVAC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={unit.capacity || ''}
                          onChange={(e) => updateHVAC(unit.id, { capacity: parseFloat(e.target.value) || undefined })}
                          placeholder="0"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <select
                          value={unit.capacityUnit}
                          onChange={(e) => updateHVAC(unit.id, { capacityUnit: e.target.value as 'tons' | 'BTU/hr' | 'kW' })}
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded"
                        >
                          <option value="tons">tons</option>
                          <option value="BTU/hr">BTU/hr</option>
                          <option value="kW">kW</option>
                        </select>
                      </div>
                    </div>
                    
                    <Input
                      label="Age (years)"
                      type="number"
                      value={unit.age || ''}
                      onChange={(e) => updateHVAC(unit.id, { age: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Condition</label>
                      <select
                        value={unit.condition}
                        onChange={(e) => updateHVAC(unit.id, { condition: e.target.value as AuditHVACUnit['condition'] })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    
                    <Input
                      label="Manufacturer"
                      value={unit.manufacturer || ''}
                      onChange={(e) => updateHVAC(unit.id, { manufacturer: e.target.value })}
                      placeholder="e.g., Carrier"
                    />
                    
                    <Input
                      label="Model Number"
                      value={unit.modelNumber || ''}
                      onChange={(e) => updateHVAC(unit.id, { modelNumber: e.target.value })}
                      placeholder="Model #"
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fuel Type</label>
                      <select
                        value={unit.fuelType}
                        onChange={(e) => updateHVAC(unit.id, { fuelType: e.target.value as AuditHVACUnit['fuelType'] })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Electric">Electric</option>
                        <option value="Natural Gas">Natural Gas</option>
                        <option value="Fuel Oil">Fuel Oil</option>
                        <option value="Propane">Propane</option>
                      </select>
                    </div>
                    
                    <Input
                      label="Efficiency Rating"
                      value={unit.efficiencyRating || ''}
                      onChange={(e) => updateHVAC(unit.id, { efficiencyRating: e.target.value })}
                      placeholder="e.g., SEER 14"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      label="Serial Number"
                      value={unit.serialNumber || ''}
                      onChange={(e) => updateHVAC(unit.id, { serialNumber: e.target.value })}
                      placeholder="Serial #"
                    />
                    
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={unit.hasSmartThermostat}
                          onChange={(e) => updateHVAC(unit.id, { hasSmartThermostat: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Smart Thermostat</span>
                      </label>
                    </div>
                  </div>
                  
                  <Input
                    label="Notes"
                    value={unit.notes || ''}
                    onChange={(e) => updateHVAC(unit.id, { notes: e.target.value })}
                    placeholder="Any observations or issues..."
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* HVAC Summary */}
      {hvacUnits.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">HVAC Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Units:</span>
                <span className="font-semibold text-blue-900 ml-2">{hvacUnits.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Total Cooling:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {hvacUnits.reduce((sum, u) => sum + (u.capacityUnit === 'tons' ? (u.capacity || 0) : 0), 0).toFixed(1)} tons
                </span>
              </div>
              <div>
                <span className="text-blue-700">Electric:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {hvacUnits.filter(u => u.fuelType === 'Electric').length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Gas:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {hvacUnits.filter(u => u.fuelType === 'Natural Gas').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Equipment Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Thermometer className="w-5 h-5 text-purple-600" />
              Other Equipment ({equipment.length})
            </CardTitle>
            <Button size="sm" onClick={addEquipment}>
              <Plus className="w-4 h-4 mr-1" />
              Add Equipment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No other equipment added yet. Add refrigeration, motors, etc.
            </p>
          ) : (
            <div className="space-y-4">
              {equipment.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Item #{index + 1}</span>
                    <button
                      onClick={() => removeEquipment(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Equipment Type</label>
                      <select
                        value={item.equipmentType}
                        onChange={(e) => updateEquipment(item.id, { equipmentType: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateEquipment(item.id, { description: e.target.value })}
                      placeholder="e.g., Walk-in cooler in back"
                    />
                    
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateEquipment(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                    />
                    
                    <Input
                      label="Power Rating (kW)"
                      type="number"
                      value={item.powerRating || ''}
                      onChange={(e) => updateEquipment(item.id, { powerRating: parseFloat(e.target.value) || undefined })}
                      placeholder="0"
                    />
                    
                    <Input
                      label="Manufacturer"
                      value={item.manufacturer || ''}
                      onChange={(e) => updateEquipment(item.id, { manufacturer: e.target.value })}
                      placeholder="Brand"
                    />
                    
                    <Input
                      label="Model Number"
                      value={item.modelNumber || ''}
                      onChange={(e) => updateEquipment(item.id, { modelNumber: e.target.value })}
                      placeholder="Model #"
                    />
                    
                    <Input
                      label="Age (years)"
                      type="number"
                      value={item.age || ''}
                      onChange={(e) => updateEquipment(item.id, { age: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                    />
                    
                    <Input
                      label="Hours/Day"
                      type="number"
                      value={item.hoursPerDay || ''}
                      onChange={(e) => updateEquipment(item.id, { hoursPerDay: parseInt(e.target.value) || undefined })}
                      placeholder="24"
                    />
                  </div>
                  
                  <Input
                    label="Notes"
                    value={item.notes || ''}
                    onChange={(e) => updateEquipment(item.id, { notes: e.target.value })}
                    placeholder="Any observations..."
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
