'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  Plus,
  Calculator,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { 
  ContractorSubmittal, 
  ContractorLightingItem,
  AuditLightingZone,
  generateId,
  InspectionDiscrepancy,
  DiscrepancyType,
} from '@/lib/auditor/types';

interface ContractorSubmittalFormProps {
  submittal?: ContractorSubmittal;
  lightingZones: AuditLightingZone[];
  onSubmittalChange: (submittal: ContractorSubmittal | undefined) => void;
  onDiscrepanciesFound: (discrepancies: InspectionDiscrepancy[]) => void;
  inspectionType: 'pre' | 'post';
}

export function ContractorSubmittalForm({
  submittal,
  lightingZones,
  onSubmittalChange,
  onDiscrepanciesFound,
  inspectionType,
}: ContractorSubmittalFormProps) {
  const [isEditing, setIsEditing] = useState(!submittal);
  const [showComparison, setShowComparison] = useState(false);

  // Create empty submittal
  const createEmptySubmittal = (): ContractorSubmittal => ({
    id: generateId(),
    submittedAt: new Date().toISOString(),
    contractorName: '',
    lightingItems: [],
    hvacItems: [],
    otherItems: [],
    existingTotalWatts: 0,
    proposedTotalWatts: 0,
    estimatedSavingsWatts: 0,
    estimatedSavingsKwhYear: 0,
    proposedIncentive: 0,
  });

  // Initialize submittal if none exists
  const currentSubmittal = submittal || createEmptySubmittal();

  // Add lighting item to submittal
  const addLightingItem = () => {
    const newItem: ContractorLightingItem = {
      id: generateId(),
      location: '',
      existingFixtureType: '4-Lamp T8 4ft Troffer',
      existingFixtureCount: 0,
      existingLampsPerFixture: 4,
      existingWattsPerFixture: 112,
      existingTotalWatts: 0,
      proposedFixtureType: 'LED 2x4 Troffer',
      proposedFixtureCount: 0,
      proposedWattsPerFixture: 40,
      proposedTotalWatts: 0,
      wattsSaved: 0,
    };
    
    const updated = {
      ...currentSubmittal,
      lightingItems: [...currentSubmittal.lightingItems, newItem],
    };
    recalculateTotals(updated);
  };

  // Update lighting item
  const updateLightingItem = (id: string, updates: Partial<ContractorLightingItem>) => {
    const updated = {
      ...currentSubmittal,
      lightingItems: currentSubmittal.lightingItems.map(item => {
        if (item.id !== id) return item;
        const updatedItem = { ...item, ...updates };
        
        // Recalculate watts
        updatedItem.existingTotalWatts = updatedItem.existingFixtureCount * updatedItem.existingWattsPerFixture;
        updatedItem.proposedTotalWatts = updatedItem.proposedFixtureCount * updatedItem.proposedWattsPerFixture;
        updatedItem.wattsSaved = updatedItem.existingTotalWatts - updatedItem.proposedTotalWatts;
        
        return updatedItem;
      }),
    };
    recalculateTotals(updated);
  };

  // Remove lighting item
  const removeLightingItem = (id: string) => {
    const updated = {
      ...currentSubmittal,
      lightingItems: currentSubmittal.lightingItems.filter(item => item.id !== id),
    };
    recalculateTotals(updated);
  };

  // Recalculate totals
  const recalculateTotals = (sub: ContractorSubmittal) => {
    let existingTotalWatts = 0;
    let proposedTotalWatts = 0;

    sub.lightingItems.forEach(item => {
      existingTotalWatts += item.existingTotalWatts;
      proposedTotalWatts += item.proposedTotalWatts;
    });

    const estimatedSavingsWatts = existingTotalWatts - proposedTotalWatts;
    // Assume 3,000 operating hours/year for estimation
    const estimatedSavingsKwhYear = (estimatedSavingsWatts / 1000) * 3000;

    onSubmittalChange({
      ...sub,
      existingTotalWatts,
      proposedTotalWatts,
      estimatedSavingsWatts,
      estimatedSavingsKwhYear,
    });
  };

  // Update basic info
  const updateBasicInfo = (updates: Partial<ContractorSubmittal>) => {
    onSubmittalChange({ ...currentSubmittal, ...updates });
  };

  // Compare submittal with inspection findings
  const comparison = useMemo(() => {
    if (!submittal || lightingZones.length === 0) return null;

    const discrepancies: InspectionDiscrepancy[] = [];
    let matchedZones = 0;
    let totalInspectedWatts = 0;
    let totalSubmittalWatts = inspectionType === 'pre' 
      ? submittal.existingTotalWatts 
      : submittal.proposedTotalWatts;

    // Calculate total inspected watts
    lightingZones.forEach(zone => {
      totalInspectedWatts += zone.totalConnectedWatts || 0;
    });

    // Check for count and wattage discrepancies
    const totalInspectedFixtures = lightingZones.reduce((sum, z) => sum + z.fixtureCount, 0);
    const totalSubmittalFixtures = submittal.lightingItems.reduce((sum, item) => 
      inspectionType === 'pre' ? sum + item.existingFixtureCount : sum + item.proposedFixtureCount
    , 0);

    if (totalInspectedFixtures !== totalSubmittalFixtures) {
      const diff = totalInspectedFixtures - totalSubmittalFixtures;
      discrepancies.push({
        id: generateId(),
        category: 'lighting',
        type: diff > 0 ? 'extra-equipment' : 'count-mismatch',
        location: 'Overall',
        expectedValue: `${totalSubmittalFixtures} fixtures`,
        expectedCount: totalSubmittalFixtures,
        actualValue: `${totalInspectedFixtures} fixtures`,
        actualCount: totalInspectedFixtures,
        impactDescription: diff > 0 
          ? `Found ${diff} more fixtures than submitted`
          : `Found ${Math.abs(diff)} fewer fixtures than submitted`,
        requiresRecalculation: true,
        estimatedSavingsImpact: Math.round((diff * 72 * 3000) / 1000), // Rough estimate
        status: 'open',
        photoIds: [],
        createdAt: new Date().toISOString(),
      });
    }

    // Check for wattage discrepancy
    const wattsDiff = totalInspectedWatts - totalSubmittalWatts;
    const wattsDiscrepancyPercent = totalSubmittalWatts > 0 
      ? Math.abs(wattsDiff / totalSubmittalWatts * 100) 
      : 0;

    if (wattsDiscrepancyPercent > 5) { // More than 5% difference
      discrepancies.push({
        id: generateId(),
        category: 'lighting',
        type: 'spec-mismatch',
        location: 'Overall',
        expectedValue: `${totalSubmittalWatts.toLocaleString()}W`,
        actualValue: `${totalInspectedWatts.toLocaleString()}W`,
        impactDescription: `Connected load differs by ${wattsDiscrepancyPercent.toFixed(1)}% (${wattsDiff > 0 ? '+' : ''}${wattsDiff.toLocaleString()}W)`,
        requiresRecalculation: true,
        estimatedSavingsImpact: Math.round((wattsDiff * 3000) / 1000),
        status: 'open',
        photoIds: [],
        createdAt: new Date().toISOString(),
      });
    }

    // Check for lamps out
    const totalLampsOut = lightingZones.reduce((sum, z) => sum + (z.lampsOutCount || 0), 0);
    if (totalLampsOut > 0) {
      const avgWattsPerLamp = totalInspectedWatts / lightingZones.reduce((sum, z) => sum + (z.fixtureCount * z.lampsPerFixture), 0) || 32;
      discrepancies.push({
        id: generateId(),
        category: 'lighting',
        type: 'lamps-out',
        location: 'Various',
        expectedValue: 'All lamps functioning',
        actualValue: `${totalLampsOut} lamps out`,
        impactDescription: `${totalLampsOut} individual lamps not working - affects baseline calculation`,
        requiresRecalculation: true,
        estimatedSavingsImpact: -Math.round((totalLampsOut * avgWattsPerLamp * 3000) / 1000),
        status: 'open',
        photoIds: [],
        createdAt: new Date().toISOString(),
      });
    }

    return {
      totalSubmittalFixtures,
      totalInspectedFixtures,
      totalSubmittalWatts,
      totalInspectedWatts,
      discrepancies,
      matchPercentage: Math.max(0, 100 - wattsDiscrepancyPercent),
      hasDiscrepancies: discrepancies.length > 0,
    };
  }, [submittal, lightingZones, inspectionType]);

  // Send discrepancies to parent
  const handleReportDiscrepancies = () => {
    if (comparison?.discrepancies) {
      onDiscrepanciesFound(comparison.discrepancies);
    }
  };

  return (
    <div className="space-y-6">
      {/* Submittal Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              Contractor Submittal
            </CardTitle>
            {submittal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contractor Name"
              value={currentSubmittal.contractorName}
              onChange={(e) => updateBasicInfo({ contractorName: e.target.value })}
              placeholder="e.g., ABC Electric"
            />
            <Input
              label="Project Name"
              value={currentSubmittal.projectName || ''}
              onChange={(e) => updateBasicInfo({ projectName: e.target.value })}
              placeholder="e.g., LED Retrofit Phase 1"
            />
            <Input
              label="Proposed Incentive ($)"
              type="number"
              value={currentSubmittal.proposedIncentive || ''}
              onChange={(e) => updateBasicInfo({ proposedIncentive: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {showComparison && comparison && (
        <Card className={comparison.hasDiscrepancies ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {comparison.hasDiscrepancies ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              Submittal vs. Inspection Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Submittal Fixtures</div>
                <div className="text-2xl font-bold text-gray-900">{comparison.totalSubmittalFixtures}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Inspected Fixtures</div>
                <div className={`text-2xl font-bold ${
                  comparison.totalInspectedFixtures === comparison.totalSubmittalFixtures 
                    ? 'text-green-600' 
                    : 'text-amber-600'
                }`}>
                  {comparison.totalInspectedFixtures}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Submittal Load</div>
                <div className="text-2xl font-bold text-gray-900">{(comparison.totalSubmittalWatts / 1000).toFixed(1)} kW</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Inspected Load</div>
                <div className={`text-2xl font-bold ${
                  Math.abs(comparison.totalInspectedWatts - comparison.totalSubmittalWatts) < comparison.totalSubmittalWatts * 0.05
                    ? 'text-green-600' 
                    : 'text-amber-600'
                }`}>
                  {(comparison.totalInspectedWatts / 1000).toFixed(1)} kW
                </div>
              </div>
            </div>

            {/* Discrepancies List */}
            {comparison.discrepancies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-amber-900">Discrepancies Found ({comparison.discrepancies.length})</h4>
                {comparison.discrepancies.map((d, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{d.impactDescription}</div>
                        <div className="text-sm text-gray-600">
                          Expected: {d.expectedValue} • Found: {d.actualValue}
                        </div>
                        {d.estimatedSavingsImpact && (
                          <div className={`text-sm mt-1 ${d.estimatedSavingsImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Impact: {d.estimatedSavingsImpact > 0 ? '+' : ''}{d.estimatedSavingsImpact.toLocaleString()} kWh/year
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button onClick={handleReportDiscrepancies} className="mt-3">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Add to Findings Report
                </Button>
              </div>
            )}

            {comparison.discrepancies.length === 0 && (
              <div className="p-4 bg-green-100 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-green-900">Inspection matches submittal!</div>
                <div className="text-sm text-green-700">No significant discrepancies found.</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lighting Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lighting Submittal Items</CardTitle>
            <Button size="sm" onClick={addLightingItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentSubmittal.lightingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No lighting items in submittal. Add items to compare with inspection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSubmittal.lightingItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Item #{index + 1}</span>
                    <button
                      onClick={() => removeLightingItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Location"
                      value={item.location}
                      onChange={(e) => updateLightingItem(item.id, { location: e.target.value })}
                      placeholder="e.g., Main Office Area"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Existing Condition */}
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <h5 className="text-sm font-medium text-amber-900 mb-2">Existing</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Fixture Type"
                          value={item.existingFixtureType}
                          onChange={(e) => updateLightingItem(item.id, { existingFixtureType: e.target.value })}
                          placeholder="4-Lamp T8"
                        />
                        <Input
                          label="Count"
                          type="number"
                          value={item.existingFixtureCount || ''}
                          onChange={(e) => updateLightingItem(item.id, { existingFixtureCount: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          label="Lamps/Fixture"
                          type="number"
                          value={item.existingLampsPerFixture || ''}
                          onChange={(e) => updateLightingItem(item.id, { existingLampsPerFixture: parseInt(e.target.value) || 1 })}
                        />
                        <Input
                          label="Watts/Fixture"
                          type="number"
                          value={item.existingWattsPerFixture || ''}
                          onChange={(e) => updateLightingItem(item.id, { existingWattsPerFixture: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="mt-2 text-right text-sm font-medium text-amber-800">
                        Total: {item.existingTotalWatts.toLocaleString()}W
                      </div>
                    </div>
                    
                    {/* Proposed Replacement */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-green-900 mb-2">Proposed</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Fixture Type"
                          value={item.proposedFixtureType}
                          onChange={(e) => updateLightingItem(item.id, { proposedFixtureType: e.target.value })}
                          placeholder="LED 2x4"
                        />
                        <Input
                          label="Count"
                          type="number"
                          value={item.proposedFixtureCount || ''}
                          onChange={(e) => updateLightingItem(item.id, { proposedFixtureCount: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          label="DLC Product ID"
                          value={item.proposedDLCProductId || ''}
                          onChange={(e) => updateLightingItem(item.id, { proposedDLCProductId: e.target.value })}
                          placeholder="Optional"
                        />
                        <Input
                          label="Watts/Fixture"
                          type="number"
                          value={item.proposedWattsPerFixture || ''}
                          onChange={(e) => updateLightingItem(item.id, { proposedWattsPerFixture: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="mt-2 text-right text-sm font-medium text-green-800">
                        Total: {item.proposedTotalWatts.toLocaleString()}W
                      </div>
                    </div>
                  </div>
                  
                  {/* Savings Row */}
                  <div className="mt-3 p-2 bg-blue-50 rounded flex items-center justify-between">
                    <span className="text-sm text-gray-600">Watts Saved:</span>
                    <span className={`font-bold ${item.wattsSaved > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.wattsSaved.toLocaleString()}W
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Summary */}
      {currentSubmittal.lightingItems.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Submittal Summary</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 uppercase">Existing Load</div>
                <div className="text-lg font-bold text-amber-600">{(currentSubmittal.existingTotalWatts / 1000).toFixed(1)} kW</div>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Proposed Load</div>
                <div className="text-lg font-bold text-green-600">{(currentSubmittal.proposedTotalWatts / 1000).toFixed(1)} kW</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Annual Savings</div>
                <div className="text-lg font-bold text-blue-600">{currentSubmittal.estimatedSavingsKwhYear.toLocaleString()} kWh</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Incentive</div>
                <div className="text-lg font-bold text-purple-600">${currentSubmittal.proposedIncentive.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
