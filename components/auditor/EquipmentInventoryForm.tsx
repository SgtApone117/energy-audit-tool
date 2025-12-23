'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { 
  Fan, 
  Lightbulb, 
  Thermometer, 
  Plus, 
  Trash2
} from 'lucide-react';
import { 
  AuditHVACUnit, 
  AuditLightingZone, 
  AuditEquipment,
  generateId,
  LampType,
  BallastType
} from '@/lib/auditor/types';

interface EquipmentInventoryFormProps {
  hvacUnits: AuditHVACUnit[];
  lightingZones: AuditLightingZone[];
  equipment: AuditEquipment[];
  onHVACChange: (units: AuditHVACUnit[]) => void;
  onLightingChange: (zones: AuditLightingZone[]) => void;
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

const LIGHTING_TYPES = [
  'LED',
  'Fluorescent T8',
  'Fluorescent T12',
  'Fluorescent T5',
  'CFL',
  'Incandescent',
  'Halogen',
  'Metal Halide',
  'High Pressure Sodium',
  'Other',
];

const CONTROL_TYPES = [
  { id: 'Manual', label: 'Manual Switch' },
  { id: 'Occupancy', label: 'Occupancy Sensor' },
  { id: 'Daylight', label: 'Daylight Sensor' },
  { id: 'Timer', label: 'Timer' },
  { id: 'BMS', label: 'Building Management' },
  { id: 'Dimmer', label: 'Dimmer' },
  { id: 'None', label: 'Always On' },
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
  lightingZones,
  equipment,
  onHVACChange,
  onLightingChange,
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

  // Lighting handlers
  const addLighting = () => {
    const newZone: AuditLightingZone = {
      id: generateId(),
      zoneName: '',
      fixtureType: 'LED',
      fixtureCount: 0,
      lampsPerFixture: 1,
      lampType: 'LED-Fixture',
      ballastType: 'LED-Driver',
      wattsPerLamp: 40,
      ballastFactor: 1.0,
      wattsPerFixture: 40,
      totalConnectedWatts: 0,
      lampsOutCount: 0,
      fixturesWithLampsOut: 0,
      controlType: 'Manual',
      verified: false,
      photoIds: [],
    };
    onLightingChange([...lightingZones, newZone]);
  };

  const updateLighting = (id: string, updates: Partial<AuditLightingZone>) => {
    onLightingChange(lightingZones.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const removeLighting = (id: string) => {
    onLightingChange(lightingZones.filter(z => z.id !== id));
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

      {/* Lighting Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Lighting ({lightingZones.length} zones)
            </CardTitle>
            <Button size="sm" onClick={addLighting}>
              <Plus className="w-4 h-4 mr-1" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lightingZones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No lighting zones added yet. Click Add Zone to start.
            </p>
          ) : (
            <div className="space-y-4">
              {lightingZones.map((zone, index) => (
                <div key={zone.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Zone #{index + 1}</span>
                    <button
                      onClick={() => removeLighting(zone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      label="Zone Name"
                      value={zone.zoneName}
                      onChange={(e) => updateLighting(zone.id, { zoneName: e.target.value })}
                      placeholder="e.g., Main Office"
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fixture Type</label>
                      <select
                        value={zone.fixtureType}
                        onChange={(e) => updateLighting(zone.id, { fixtureType: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {LIGHTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <Input
                      label="# Fixtures"
                      type="number"
                      value={zone.fixtureCount || ''}
                      onChange={(e) => updateLighting(zone.id, { fixtureCount: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    
                    <Input
                      label="Watts/Fixture"
                      type="number"
                      value={zone.wattsPerFixture || ''}
                      onChange={(e) => updateLighting(zone.id, { wattsPerFixture: parseInt(e.target.value) || undefined })}
                      placeholder="e.g., 32"
                    />
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Control Type</label>
                      <select
                        value={zone.controlType}
                        onChange={(e) => updateLighting(zone.id, { controlType: e.target.value as AuditLightingZone['controlType'] })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {CONTROL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    
                    <Input
                      label="Hours/Day"
                      type="number"
                      value={zone.hoursPerDay || ''}
                      onChange={(e) => updateLighting(zone.id, { hoursPerDay: parseInt(e.target.value) || undefined })}
                      placeholder="8"
                    />
                  </div>
                  
                  <Input
                    label="Notes"
                    value={zone.notes || ''}
                    onChange={(e) => updateLighting(zone.id, { notes: e.target.value })}
                    placeholder="Any observations..."
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
