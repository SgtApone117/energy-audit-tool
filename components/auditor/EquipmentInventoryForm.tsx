'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Input, InfoTooltip } from '@/components/ui';
import { 
  Fan, 
  Thermometer, 
  Plus, 
  Trash2
} from 'lucide-react';
import { 
  AuditHVACUnit, 
  AuditEquipment,
  generateId,
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
            <Button size="sm" onClick={addHVAC}>
              <Plus className="w-4 h-4 mr-1" />
              Add Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hvacUnits.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No HVAC units added yet. Click Add Unit to start.
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
