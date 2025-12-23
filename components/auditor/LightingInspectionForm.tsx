'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, InfoTooltip } from '@/components/ui';
import { TOOLTIP_CONTENT } from '@/lib/core/data/tooltipContent';
import { 
  Lightbulb, 
  Plus, 
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { 
  AuditLightingZone, 
  LampType,
  BallastType,
  COMMON_FIXTURE_CONFIGS,
  FIXTURE_WATTAGE_DATABASE,
  calculateFixtureWatts,
  calculateTotalConnectedWatts,
  createEmptyLightingZone,
} from '@/lib/auditor/types';

interface LightingInspectionFormProps {
  lightingZones: AuditLightingZone[];
  onLightingChange: (zones: AuditLightingZone[]) => void;
  inspectionType: 'pre' | 'post';
}

const LAMP_TYPES: { id: LampType; label: string; category: string }[] = [
  { id: 'T12', label: 'T12 Fluorescent', category: 'Fluorescent' },
  { id: 'T8', label: 'T8 Fluorescent', category: 'Fluorescent' },
  { id: 'T5', label: 'T5 Fluorescent', category: 'Fluorescent' },
  { id: 'T5HO', label: 'T5HO Fluorescent', category: 'Fluorescent' },
  { id: 'CFL', label: 'CFL Screw-in', category: 'CFL' },
  { id: 'CFL-Pin', label: 'CFL Pin Base', category: 'CFL' },
  { id: 'Incandescent', label: 'Incandescent', category: 'Incandescent/Halogen' },
  { id: 'Halogen', label: 'Halogen', category: 'Incandescent/Halogen' },
  { id: 'LED-Tube', label: 'LED Tube (Retrofit)', category: 'LED' },
  { id: 'LED-Fixture', label: 'LED Integrated Fixture', category: 'LED' },
  { id: 'LED-Retrofit', label: 'LED Retrofit Kit', category: 'LED' },
  { id: 'HID-MH', label: 'Metal Halide', category: 'HID' },
  { id: 'HID-HPS', label: 'High Pressure Sodium', category: 'HID' },
  { id: 'HID-MV', label: 'Mercury Vapor', category: 'HID' },
  { id: 'Other', label: 'Other', category: 'Other' },
];

const BALLAST_TYPES: { id: BallastType; label: string }[] = [
  { id: 'Electronic', label: 'Electronic' },
  { id: 'Magnetic', label: 'Magnetic' },
  { id: 'LED-Driver', label: 'LED Driver' },
  { id: 'None', label: 'None (Direct Wire)' },
  { id: 'Unknown', label: 'Unknown' },
];

const CONTROL_TYPES = [
  { id: 'Manual', label: 'Manual Switch' },
  { id: 'Occupancy', label: 'Occupancy Sensor' },
  { id: 'Daylight', label: 'Daylight Sensor' },
  { id: 'Timer', label: 'Timer' },
  { id: 'BMS', label: 'Building Management System' },
  { id: 'Dimmer', label: 'Dimmer' },
  { id: 'None', label: 'Always On' },
];

export function LightingInspectionForm({
  lightingZones,
  onLightingChange,
  inspectionType,
}: LightingInspectionFormProps) {
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Add new zone
  const addLightingZone = useCallback(() => {
    const newZone = createEmptyLightingZone();
    onLightingChange([...lightingZones, newZone]);
    setExpandedZones(prev => new Set([...prev, newZone.id]));
  }, [lightingZones, onLightingChange]);

  // Quick add from common config
  const addFromConfig = useCallback((configId: string) => {
    const config = COMMON_FIXTURE_CONFIGS.find(c => c.id === configId);
    if (!config) return;
    
    const fixtureData = FIXTURE_WATTAGE_DATABASE[config.fixtureType];
    const newZone = createEmptyLightingZone();
    
    // Parse lamp type from fixture type
    let lampType: LampType = 'T8';
    if (config.fixtureType.includes('T12')) lampType = 'T12';
    else if (config.fixtureType.includes('T8')) lampType = 'T8';
    else if (config.fixtureType.includes('T5HO')) lampType = 'T5HO';
    else if (config.fixtureType.includes('T5')) lampType = 'T5';
    else if (config.fixtureType.includes('LED')) lampType = 'LED-Fixture';
    else if (config.fixtureType.includes('HID')) lampType = 'HID-MH';

    let ballastType: BallastType = 'Electronic';
    if (config.fixtureType.includes('Magnetic')) ballastType = 'Magnetic';
    else if (config.fixtureType.includes('LED')) ballastType = 'LED-Driver';

    Object.assign(newZone, {
      fixtureType: config.label,
      lampsPerFixture: config.lampsPerFixture,
      lampType,
      ballastType,
      wattsPerLamp: fixtureData?.wattsPerLamp || 32,
      ballastFactor: fixtureData?.ballastFactor || 1.0,
      wattsPerFixture: config.totalWatts,
    });

    onLightingChange([...lightingZones, newZone]);
    setExpandedZones(prev => new Set([...prev, newZone.id]));
    setShowQuickAdd(false);
  }, [lightingZones, onLightingChange]);

  // Update zone
  const updateZone = useCallback((id: string, updates: Partial<AuditLightingZone>) => {
    onLightingChange(lightingZones.map(zone => {
      if (zone.id !== id) return zone;
      
      const updated = { ...zone, ...updates };
      
      // Recalculate wattages if relevant fields changed
      if ('lampsPerFixture' in updates || 'wattsPerLamp' in updates || 'ballastFactor' in updates) {
        updated.wattsPerFixture = calculateFixtureWatts(
          updated.lampsPerFixture,
          updated.wattsPerLamp,
          updated.ballastFactor
        );
      }
      
      if ('fixtureCount' in updates || 'wattsPerFixture' in updates || 'lampsOutCount' in updates) {
        const { totalWatts, adjustedWatts } = calculateTotalConnectedWatts(
          updated.fixtureCount,
          updated.wattsPerFixture,
          updated.lampsOutCount,
          updated.wattsPerLamp
        );
        updated.totalConnectedWatts = totalWatts;
        updated.adjustedWatts = adjustedWatts;
      }
      
      return updated;
    }));
  }, [lightingZones, onLightingChange]);

  // Remove zone
  const removeZone = useCallback((id: string) => {
    onLightingChange(lightingZones.filter(z => z.id !== id));
    setExpandedZones(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [lightingZones, onLightingChange]);

  // Toggle zone expansion
  const toggleZone = useCallback((id: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    let totalFixtures = 0;
    let totalConnectedWatts = 0;
    let totalAdjustedWatts = 0;
    let totalLampsOut = 0;
    let zonesWithLampsOut = 0;

    lightingZones.forEach(zone => {
      totalFixtures += zone.fixtureCount || 0;
      totalConnectedWatts += zone.totalConnectedWatts || 0;
      totalAdjustedWatts += zone.adjustedWatts || zone.totalConnectedWatts || 0;
      totalLampsOut += zone.lampsOutCount || 0;
      if (zone.lampsOutCount > 0) zonesWithLampsOut++;
    });

    return {
      totalFixtures,
      totalConnectedWatts,
      totalAdjustedWatts,
      totalLampsOut,
      zonesWithLampsOut,
      totalConnectedKw: totalConnectedWatts / 1000,
      adjustedKw: totalAdjustedWatts / 1000,
    };
  }, [lightingZones]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{lightingZones.length}</div>
              <div className="text-xs text-gray-600">Zones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totals.totalFixtures.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Fixtures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totals.totalConnectedWatts.toLocaleString()}W</div>
              <div className="text-xs text-gray-600">Connected Load</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totals.totalConnectedKw.toFixed(1)} kW</div>
              <div className="text-xs text-gray-600">Total kW</div>
            </div>
            <div className="text-center">
              {totals.totalLampsOut > 0 ? (
                <>
                  <div className="text-2xl font-bold text-amber-600">{totals.totalLampsOut}</div>
                  <div className="text-xs text-amber-700 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Lamps Out
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-xs text-green-700">No Lamps Out</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lighting Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Lighting Inventory ({lightingZones.length} zones)
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowQuickAdd(!showQuickAdd)}>
                <Zap className="w-4 h-4 mr-1" />
                Quick Add
              </Button>
              <Button size="sm" onClick={addLightingZone}>
                <Plus className="w-4 h-4 mr-1" />
                Add Zone
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Quick Add Panel */}
          {showQuickAdd && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Common Fixture Configurations</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {COMMON_FIXTURE_CONFIGS.map(config => (
                  <button
                    key={config.id}
                    onClick={() => addFromConfig(config.id)}
                    className="text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">{config.label}</div>
                    <div className="text-xs text-gray-500">{config.totalWatts}W total</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {lightingZones.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No lighting zones documented yet.</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowQuickAdd(true)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Add Common Fixture
                </Button>
                <Button onClick={addLightingZone}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Zone
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {lightingZones.map((zone, index) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  index={index}
                  isExpanded={expandedZones.has(zone.id)}
                  onToggle={() => toggleZone(zone.id)}
                  onUpdate={(updates) => updateZone(zone.id, updates)}
                  onRemove={() => removeZone(zone.id)}
                  inspectionType={inspectionType}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eversource Calculation Reference */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-gray-900 mb-1">Wattage Calculation Method</h4>
              <p className="text-gray-600">
                <strong>Fixture Watts</strong> = Lamps per Fixture × Watts per Lamp × Ballast Factor
              </p>
              <p className="text-gray-600">
                <strong>Total Connected Load</strong> = Fixture Count × Fixture Watts
              </p>
              <p className="text-gray-600">
                <strong>Adjusted Load</strong> = Total Load − (Lamps Out × Watts per Lamp)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual Zone Card Component
interface ZoneCardProps {
  zone: AuditLightingZone;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<AuditLightingZone>) => void;
  onRemove: () => void;
  inspectionType: 'pre' | 'post';
}

function ZoneCard({ zone, index, isExpanded, onToggle, onUpdate, onRemove, inspectionType }: ZoneCardProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${zone.verified ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-white'}`}>
      {/* Header - Always visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-medium text-gray-500">#{index + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {zone.zoneName || 'Unnamed Zone'}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-3">
              <span>{zone.fixtureCount} fixtures</span>
              <span>•</span>
              <span>{zone.lampType} {zone.lampsPerFixture}-lamp</span>
              <span>•</span>
              <span className="font-medium text-blue-600">{zone.totalConnectedWatts?.toLocaleString() || 0}W</span>
              {zone.lampsOutCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {zone.lampsOutCount} lamps out
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {zone.verified && (
            <span className="text-green-600 flex items-center gap-1 text-xs">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Zone Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Zone Name / Location"
              value={zone.zoneName}
              onChange={(e) => onUpdate({ zoneName: e.target.value })}
              placeholder="e.g., Main Office Area, Warehouse Bay 1"
            />
            <Input
              label="Specific Location Details"
              value={zone.location || ''}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="e.g., 2nd Floor East Wing"
            />
          </div>

          {/* Fixture Details */}
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Fixture Specifications
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Fixture Count"
                type="number"
                value={zone.fixtureCount || ''}
                onChange={(e) => onUpdate({ fixtureCount: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
              
              <Input
                label="Lamps per Fixture"
                type="number"
                value={zone.lampsPerFixture || ''}
                onChange={(e) => onUpdate({ lampsPerFixture: parseInt(e.target.value) || 1 })}
                placeholder="4"
              />
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lamp Type</label>
                <select
                  value={zone.lampType}
                  onChange={(e) => onUpdate({ lampType: e.target.value as LampType })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {LAMP_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lamp Length</label>
                <select
                  value={zone.lampLength || '4ft'}
                  onChange={(e) => onUpdate({ lampLength: e.target.value as '2ft' | '4ft' | '8ft' })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="2ft">2 foot</option>
                  <option value="4ft">4 foot</option>
                  <option value="8ft">8 foot</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ballast Type</label>
                <select
                  value={zone.ballastType}
                  onChange={(e) => onUpdate({ ballastType: e.target.value as BallastType })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {BALLAST_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Watts per Lamp"
                type="number"
                value={zone.wattsPerLamp || ''}
                onChange={(e) => onUpdate({ wattsPerLamp: parseFloat(e.target.value) || 0 })}
                placeholder="32"
              />
              
              <Input
                label="Ballast Factor"
                type="number"
                step="0.01"
                value={zone.ballastFactor || ''}
                onChange={(e) => onUpdate({ ballastFactor: parseFloat(e.target.value) || 1.0 })}
                placeholder="0.88"
              />
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Watts/Fixture (Calculated)</label>
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm font-medium text-blue-700">
                  {zone.wattsPerFixture?.toLocaleString() || 0} W
                </div>
              </div>
            </div>
          </div>

          {/* Lamps Out - Critical Eversource Requirement */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-sm font-medium text-amber-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Lamps Out Documentation
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Individual Lamps Out"
                type="number"
                value={zone.lampsOutCount || ''}
                onChange={(e) => onUpdate({ lampsOutCount: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <Input
                label="Fixtures Affected"
                type="number"
                value={zone.fixturesWithLampsOut || ''}
                onChange={(e) => onUpdate({ fixturesWithLampsOut: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Adjusted Connected Load</label>
                <div className={`px-3 py-1.5 rounded text-sm font-medium ${
                  zone.lampsOutCount > 0 
                    ? 'bg-amber-100 border border-amber-300 text-amber-800' 
                    : 'bg-gray-100 border border-gray-200 text-gray-600'
                }`}>
                  {zone.adjustedWatts?.toLocaleString() || zone.totalConnectedWatts?.toLocaleString() || 0} W
                  {zone.lampsOutCount > 0 && (
                    <span className="ml-2 text-xs">
                      (−{((zone.lampsOutCount || 0) * (zone.wattsPerLamp || 0)).toLocaleString()}W for lamps out)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Control Type</label>
              <select
                value={zone.controlType}
                onChange={(e) => onUpdate({ controlType: e.target.value as AuditLightingZone['controlType'] })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CONTROL_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Hours/Day"
              type="number"
              value={zone.hoursPerDay || ''}
              onChange={(e) => onUpdate({ hoursPerDay: parseInt(e.target.value) || undefined })}
              placeholder="10"
            />
            <Input
              label="Days/Week"
              type="number"
              value={zone.daysPerWeek || ''}
              onChange={(e) => onUpdate({ daysPerWeek: parseInt(e.target.value) || undefined })}
              placeholder="5"
            />
          </div>

          {/* DLC Verification (for Post-Installation) */}
          {inspectionType === 'post' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                DLC Product Verification
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zone.isDLCListed || false}
                      onChange={(e) => onUpdate({ isDLCListed: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">DLC Listed</span>
                  </label>
                </div>
                <Input
                  label="DLC Product ID"
                  value={zone.dlcProductId || ''}
                  onChange={(e) => onUpdate({ dlcProductId: e.target.value })}
                  placeholder="DLC Product ID"
                />
                <Input
                  label="Manufacturer"
                  value={zone.dlcManufacturer || ''}
                  onChange={(e) => onUpdate({ dlcManufacturer: e.target.value })}
                  placeholder="e.g., Philips"
                />
                <Input
                  label="Model Number"
                  value={zone.dlcModelNumber || ''}
                  onChange={(e) => onUpdate({ dlcModelNumber: e.target.value })}
                  placeholder="Model #"
                />
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm">
                <span className="text-gray-600">Total Connected Load: </span>
                <span className="font-bold text-blue-700">{zone.totalConnectedWatts?.toLocaleString() || 0} W</span>
                <span className="text-gray-600 ml-2">({((zone.totalConnectedWatts || 0) / 1000).toFixed(2)} kW)</span>
              </div>
              {zone.lampsOutCount > 0 && (
                <div className="text-sm">
                  <span className="text-amber-600">Adjusted for lamps out: </span>
                  <span className="font-bold text-amber-700">{zone.adjustedWatts?.toLocaleString() || 0} W</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Verification */}
          <div className="space-y-3">
            <Input
              label="Notes / Observations"
              value={zone.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Any observations, issues, or notes..."
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zone.verified}
                  onChange={(e) => onUpdate({ verified: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-sm text-gray-700">Mark as Verified</span>
              </label>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove Zone
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
