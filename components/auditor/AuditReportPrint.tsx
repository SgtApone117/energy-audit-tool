'use client';

import { useMemo } from 'react';
import { 
  AuditData, 
  PHOTO_CATEGORIES,
  AuditECM 
} from '@/lib/auditor/types';
import { generateECMRecommendations, calculateTotalSavings } from '@/lib/auditor/ecmGenerator';

interface AuditReportPrintProps {
  audit: AuditData;
}

export function AuditReportPrint({ audit }: AuditReportPrintProps) {
  // Generate ECMs
  const ecms = useMemo(() => generateECMRecommendations(audit), [audit]);
  const ecmTotals = useMemo(() => calculateTotalSavings(ecms), [ecms]);

  // Calculate utility stats
  const utilityStats = useMemo(() => {
    const bills = audit.utilityBills || [];
    const totalElecKwh = bills.reduce((sum, b) => sum + (b.electricityKwh || 0), 0);
    const totalElecCost = bills.reduce((sum, b) => sum + (b.electricityCost || 0), 0);
    const totalGasTherm = bills.reduce((sum, b) => sum + (b.gasTherm || 0), 0);
    const totalGasCost = bills.reduce((sum, b) => sum + (b.gasCost || 0), 0);
    const totalCost = totalElecCost + totalGasCost;
    
    const elecKBTU = totalElecKwh * 3.412;
    const gasKBTU = totalGasTherm * 100;
    const totalKBTU = elecKBTU + gasKBTU;
    const sqft = audit.buildingInfo.squareFootage || 1;
    const eui = totalKBTU / sqft;

    return { totalElecKwh, totalElecCost, totalGasTherm, totalGasCost, totalCost, eui };
  }, [audit.utilityBills, audit.buildingInfo.squareFootage]);

  // Finding stats
  const findingStats = useMemo(() => {
    const findings = audit.findings || [];
    return {
      high: findings.filter(f => f.priority === 'high').length,
      medium: findings.filter(f => f.priority === 'medium').length,
      low: findings.filter(f => f.priority === 'low').length,
      total: findings.length,
    };
  }, [audit.findings]);

  // Lighting inventory stats (Eversource format)
  const lightingStats = useMemo(() => {
    const zones = audit.lightingZones || [];
    let totalFixtures = 0;
    let totalLamps = 0;
    let totalConnectedWatts = 0;
    let totalAdjustedWatts = 0;
    let totalLampsOut = 0;
    let verifiedZones = 0;

    zones.forEach(zone => {
      totalFixtures += zone.fixtureCount || 0;
      totalLamps += (zone.fixtureCount || 0) * (zone.lampsPerFixture || 1);
      totalConnectedWatts += zone.totalConnectedWatts || 0;
      totalAdjustedWatts += zone.adjustedWatts || zone.totalConnectedWatts || 0;
      totalLampsOut += zone.lampsOutCount || 0;
      if (zone.verified) verifiedZones++;
    });

    return {
      zones: zones.length,
      totalFixtures,
      totalLamps,
      totalConnectedWatts,
      totalAdjustedWatts,
      totalConnectedKw: totalConnectedWatts / 1000,
      adjustedKw: totalAdjustedWatts / 1000,
      totalLampsOut,
      verifiedZones,
      isFullyVerified: verifiedZones === zones.length && zones.length > 0,
    };
  }, [audit.lightingZones]);

  // Discrepancy stats
  const discrepancyStats = useMemo(() => {
    const discrepancies = audit.discrepancies || [];
    return {
      total: discrepancies.length,
      open: discrepancies.filter(d => d.status === 'open').length,
      resolved: discrepancies.filter(d => d.status === 'resolved').length,
    };
  }, [audit.discrepancies]);

  // Photos by category
  const photosByCategory = useMemo(() => {
    const grouped: Record<string, typeof audit.photos> = {};
    for (const photo of audit.photos) {
      if (!grouped[photo.category]) {
        grouped[photo.category] = [];
      }
      grouped[photo.category].push(photo);
    }
    return grouped;
  }, [audit.photos]);

  return (
    <div className="print-report bg-white text-black p-8 max-w-[8.5in] mx-auto">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-report { padding: 0; max-width: 100%; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Cover Page */}
      <div className="text-center mb-12 avoid-break">
        <div className="border-b-4 border-blue-600 pb-8 mb-8">
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
            audit.inspectionType === 'post'
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {audit.inspectionType === 'post' ? 'Post-Installation Inspection' : 'Pre-Installation Inspection'}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Energy Inspection Report</h1>
          <p className="text-xl text-gray-600">{audit.name}</p>
        </div>
        
        <div className="text-left max-w-md mx-auto space-y-2">
          <p><strong>Building:</strong> {audit.buildingInfo.name || audit.name}</p>
          <p>
            <strong>Address:</strong>{' '}
            {[
              audit.buildingInfo.address,
              audit.buildingInfo.city,
              audit.buildingInfo.state,
              audit.buildingInfo.zipCode
            ].filter(Boolean).join(', ')}
          </p>
          <p><strong>Business Type:</strong> {audit.buildingInfo.businessType}</p>
          <p><strong>Square Footage:</strong> {audit.buildingInfo.squareFootage?.toLocaleString()} sqft</p>
          <p><strong>Inspection Date:</strong> {audit.inspectionDate || new Date(audit.createdAt).toLocaleDateString()}</p>
          {audit.inspectorName && <p><strong>Inspector:</strong> {audit.inspectorName}</p>}
          {audit.auditorName && <p><strong>Auditor:</strong> {audit.auditorName}</p>}
        </div>

        {/* Contractor Submittal Reference */}
        {audit.contractorSubmittal && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Contractor Submittal Reference</h3>
            <p className="text-sm"><strong>Contractor:</strong> {audit.contractorSubmittal.contractorName}</p>
            {audit.contractorSubmittal.projectName && (
              <p className="text-sm"><strong>Project:</strong> {audit.contractorSubmittal.projectName}</p>
            )}
            <p className="text-sm"><strong>Submitted:</strong> {new Date(audit.contractorSubmittal.submittedAt).toLocaleDateString()}</p>
            <p className="text-sm">
              <strong>Proposed Savings:</strong> {audit.contractorSubmittal.estimatedSavingsKwhYear.toLocaleString()} kWh/year
            </p>
            <p className="text-sm">
              <strong>Proposed Incentive:</strong> ${audit.contractorSubmittal.proposedIncentive.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <section className="mb-8 avoid-break">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
          Executive Summary
        </h2>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold">{audit.buildingInfo.squareFootage?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Square Feet</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold">
              {utilityStats.eui > 0 ? utilityStats.eui.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-gray-600">EUI (kBTU/sqft)</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded">
            <div className="text-2xl font-bold text-green-700">
              ${Math.round((ecmTotals.totalSavingsLow + ecmTotals.totalSavingsHigh) / 2).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Est. Annual Savings</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold">{findingStats.total}</div>
            <div className="text-sm text-gray-600">Findings</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Key Findings</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {findingStats.high > 0 && (
              <li className="text-red-700">{findingStats.high} high-priority issue(s) requiring immediate attention</li>
            )}
            {findingStats.medium > 0 && (
              <li className="text-yellow-700">{findingStats.medium} medium-priority improvement(s) recommended</li>
            )}
            {findingStats.low > 0 && (
              <li className="text-blue-700">{findingStats.low} low-priority enhancement(s) identified</li>
            )}
            {ecms.length > 0 && (
              <li>{ecms.length} energy conservation measure(s) identified with avg. payback of {ecmTotals.avgPayback.toFixed(1)} years</li>
            )}
          </ul>
        </div>
      </section>

      {/* Energy Usage */}
      {utilityStats.totalCost > 0 && (
        <section className="mb-8 avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Energy Usage Summary
          </h2>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Fuel Type</th>
                <th className="text-right p-2">Annual Usage</th>
                <th className="text-right p-2">Annual Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Electricity</td>
                <td className="text-right p-2">{utilityStats.totalElecKwh.toLocaleString()} kWh</td>
                <td className="text-right p-2">${utilityStats.totalElecCost.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Natural Gas</td>
                <td className="text-right p-2">{utilityStats.totalGasTherm.toLocaleString()} therms</td>
                <td className="text-right p-2">${utilityStats.totalGasCost.toLocaleString()}</td>
              </tr>
              <tr className="font-bold bg-gray-50">
                <td className="p-2">Total</td>
                <td className="text-right p-2">—</td>
                <td className="text-right p-2">${utilityStats.totalCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Equipment Inventory */}
      {(audit.hvacUnits.length > 0 || audit.lightingZones.length > 0) && (
        <section className="mb-8 page-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Equipment Inventory
          </h2>
          
          {audit.hvacUnits.length > 0 && (
            <div className="mb-6 avoid-break">
              <h3 className="font-semibold text-lg mb-2">HVAC Systems ({audit.hvacUnits.length})</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Capacity</th>
                    <th className="text-left p-2">Age</th>
                    <th className="text-left p-2">Condition</th>
                    <th className="text-left p-2">Fuel</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.hvacUnits.map((unit, idx) => (
                    <tr key={unit.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="p-2">{unit.systemType}</td>
                      <td className="p-2">{unit.capacity} {unit.capacityUnit}</td>
                      <td className="p-2">{unit.age ? `${unit.age} yrs` : '—'}</td>
                      <td className="p-2 capitalize">{unit.condition}</td>
                      <td className="p-2">{unit.fuelType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {audit.lightingZones.length > 0 && (
            <div className="avoid-break">
              <h3 className="font-semibold text-lg mb-2">Lighting Inventory ({audit.lightingZones.length} zones)</h3>
              
              {/* Lighting Summary Box */}
              <div className="grid grid-cols-5 gap-2 mb-4 text-center text-sm">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-bold">{lightingStats.totalFixtures.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total Fixtures</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-bold">{lightingStats.totalLamps.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total Lamps</div>
                </div>
                <div className="p-2 bg-blue-100 rounded">
                  <div className="font-bold">{lightingStats.totalConnectedWatts.toLocaleString()}W</div>
                  <div className="text-xs text-gray-600">Connected Load</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-bold">{lightingStats.totalConnectedKw.toFixed(1)} kW</div>
                  <div className="text-xs text-gray-600">Total kW</div>
                </div>
                <div className={`p-2 rounded ${lightingStats.totalLampsOut > 0 ? 'bg-amber-100' : 'bg-green-50'}`}>
                  <div className="font-bold">{lightingStats.totalLampsOut}</div>
                  <div className="text-xs text-gray-600">Lamps Out</div>
                </div>
              </div>

              {/* Detailed Table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Zone/Location</th>
                    <th className="text-left p-2">Lamp Type</th>
                    <th className="text-right p-2">Fixtures</th>
                    <th className="text-right p-2">Lamps/Fix</th>
                    <th className="text-right p-2">W/Fix</th>
                    <th className="text-right p-2">Total W</th>
                    <th className="text-right p-2">Lamps Out</th>
                    <th className="text-center p-2">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.lightingZones.map((zone, idx) => (
                    <tr key={zone.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="p-2">{zone.zoneName || zone.location || '—'}</td>
                      <td className="p-2">{zone.lampType} {zone.lampLength || ''}</td>
                      <td className="text-right p-2">{zone.fixtureCount}</td>
                      <td className="text-right p-2">{zone.lampsPerFixture}</td>
                      <td className="text-right p-2">{zone.wattsPerFixture}</td>
                      <td className="text-right p-2 font-medium">{(zone.totalConnectedWatts || 0).toLocaleString()}</td>
                      <td className={`text-right p-2 ${zone.lampsOutCount > 0 ? 'text-amber-600 font-medium' : ''}`}>
                        {zone.lampsOutCount || 0}
                      </td>
                      <td className="text-center p-2">{zone.verified ? 'Yes' : '—'}</td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-200 font-bold">
                    <td className="p-2">TOTALS</td>
                    <td className="p-2"></td>
                    <td className="text-right p-2">{lightingStats.totalFixtures.toLocaleString()}</td>
                    <td className="text-right p-2"></td>
                    <td className="text-right p-2"></td>
                    <td className="text-right p-2">{lightingStats.totalConnectedWatts.toLocaleString()}</td>
                    <td className={`text-right p-2 ${lightingStats.totalLampsOut > 0 ? 'text-amber-600' : ''}`}>
                      {lightingStats.totalLampsOut}
                    </td>
                    <td className="text-center p-2">{lightingStats.verifiedZones}/{lightingStats.zones}</td>
                  </tr>
                </tbody>
              </table>

              {/* Lamps Out Note */}
              {lightingStats.totalLampsOut > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                  <strong>Note:</strong> {lightingStats.totalLampsOut} lamp(s) were found to be non-functional. 
                  Adjusted connected load: <strong>{lightingStats.adjustedKw.toFixed(2)} kW</strong> 
                  (reduction of {((lightingStats.totalConnectedKw - lightingStats.adjustedKw) * 1000).toFixed(0)}W)
                </div>
              )}

              {/* Verification Status */}
              <div className={`mt-3 p-3 rounded text-sm ${
                lightingStats.isFullyVerified
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <strong>Verification Status:</strong>{' '}
                {lightingStats.isFullyVerified
                  ? `All ${lightingStats.zones} zones verified`
                  : `${lightingStats.verifiedZones} of ${lightingStats.zones} zones verified`
                }
              </div>
            </div>
          )}
        </section>
      )}

      {/* Inspection Discrepancies */}
      {(audit.discrepancies?.length || 0) > 0 && (
        <section className="mb-8 avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Inspection Discrepancies
          </h2>
          
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
            <strong>{discrepancyStats.total}</strong> discrepanc{discrepancyStats.total === 1 ? 'y' : 'ies'} identified 
            ({discrepancyStats.open} open, {discrepancyStats.resolved} resolved)
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Expected</th>
                <th className="text-left p-2">Found</th>
                <th className="text-left p-2">Impact</th>
                <th className="text-center p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(audit.discrepancies || []).map((d, idx) => (
                <tr key={d.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="p-2 capitalize">{d.type.replace(/-/g, ' ')}</td>
                  <td className="p-2">{d.location}</td>
                  <td className="p-2">{d.expectedValue}</td>
                  <td className="p-2">{d.actualValue}</td>
                  <td className="p-2 text-xs">{d.impactDescription}</td>
                  <td className={`p-2 text-center capitalize ${
                    d.status === 'open' ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Findings */}
      {(audit.findings?.length || 0) > 0 && (
        <section className="mb-8 page-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Findings & Observations
          </h2>
          
          <div className="space-y-4">
            {(audit.findings || [])
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.priority] - order[b.priority];
              })
              .map((finding, idx) => (
                <div 
                  key={finding.id} 
                  className={`p-4 border-l-4 avoid-break ${
                    finding.priority === 'high' ? 'border-red-500 bg-red-50' :
                    finding.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs font-bold uppercase ${
                        finding.priority === 'high' ? 'text-red-600' :
                        finding.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {finding.priority} priority
                      </span>
                      <h3 className="font-semibold">{finding.title}</h3>
                    </div>
                    {finding.estimatedSavings && (
                      <div className="text-right text-sm">
                        <div className="text-green-700 font-semibold">
                          ${finding.estimatedSavings.toLocaleString()}/yr savings
                        </div>
                        {finding.estimatedCost && (
                          <div className="text-gray-600">
                            ${finding.estimatedCost.toLocaleString()} cost
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {finding.description && (
                    <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                  )}
                  {finding.recommendation && (
                    <p className="text-sm">
                      <strong>Recommendation:</strong> {finding.recommendation}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ECM Recommendations */}
      {ecms.length > 0 && (
        <section className="mb-8 page-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Energy Conservation Measures
          </h2>
          
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Measure</th>
                <th className="text-left p-2">Priority</th>
                <th className="text-right p-2">Annual Savings</th>
                <th className="text-right p-2">Cost</th>
                <th className="text-right p-2">Payback</th>
              </tr>
            </thead>
            <tbody>
              {ecms.map((ecm, idx) => (
                <tr key={ecm.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="p-2">
                    <div className="font-medium">{ecm.title}</div>
                    <div className="text-xs text-gray-500">{ecm.category}</div>
                  </td>
                  <td className="p-2 capitalize">{ecm.priority}</td>
                  <td className="text-right p-2 text-green-700">
                    ${Math.round((ecm.annualSavingsLow + ecm.annualSavingsHigh) / 2).toLocaleString()}
                  </td>
                  <td className="text-right p-2">
                    ${Math.round((ecm.implementationCostLow + ecm.implementationCostHigh) / 2).toLocaleString()}
                  </td>
                  <td className="text-right p-2">{ecm.paybackYears.toFixed(1)} yrs</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-green-100">
                <td className="p-2" colSpan={2}>Total</td>
                <td className="text-right p-2 text-green-700">
                  ${Math.round((ecmTotals.totalSavingsLow + ecmTotals.totalSavingsHigh) / 2).toLocaleString()}/yr
                </td>
                <td className="text-right p-2">
                  ${Math.round((ecmTotals.totalCostLow + ecmTotals.totalCostHigh) / 2).toLocaleString()}
                </td>
                <td className="text-right p-2">{ecmTotals.avgPayback.toFixed(1)} yrs</td>
              </tr>
            </tfoot>
          </table>
        </section>
      )}

      {/* Photo Documentation */}
      {audit.photos.length > 0 && (
        <section className="mb-8 page-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Photo Documentation ({audit.photos.length} photos)
          </h2>
          
          {Object.entries(photosByCategory).map(([category, photos]) => {
            const catInfo = PHOTO_CATEGORIES.find(c => c.id === category);
            return (
              <div key={category} className="mb-6 avoid-break">
                <h3 className="font-semibold text-lg mb-2">
                  {catInfo?.label || category} ({photos.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 8).map(photo => (
                    <div key={photo.id} className="border rounded overflow-hidden">
                      <img 
                        src={photo.dataUrl} 
                        alt={photo.label || photo.fileName}
                        className="w-full h-24 object-cover"
                      />
                      {photo.label && (
                        <div className="p-1 text-xs text-center bg-gray-100 truncate">
                          {photo.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {photos.length > 8 && (
                  <p className="text-sm text-gray-500 mt-1">
                    +{photos.length - 8} more photos
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Notes */}
      {audit.generalNotes && (
        <section className="mb-8 avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Additional Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm">{audit.generalNotes}</p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
        <p>
          Report generated on {new Date().toLocaleDateString()} 
          {audit.auditorName && ` by ${audit.auditorName}`}
        </p>
        <p className="mt-1">Energy Audit Tool</p>
      </footer>
    </div>
  );
}
