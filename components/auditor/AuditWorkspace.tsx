'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert, Card, CardContent } from '@/components/ui';
import {
  Building2,
  Camera,
  Settings,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  DollarSign,
  Download,
  Printer,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { AuditData, AuditFinding, PHOTO_CATEGORIES, InspectionDiscrepancy } from '@/lib/auditor/types';
import { generateECMRecommendations, calculateTotalSavings } from '@/lib/auditor/ecmGenerator';
import { BuildingInfoForm } from './BuildingInfoForm';
import { PhotoDocumentation } from './PhotoDocumentation';
import { EquipmentInventoryForm } from './EquipmentInventoryForm';
import { LightingInspectionForm } from './LightingInspectionForm';
import { ContractorSubmittalForm } from './ContractorSubmittal';
import { FindingsLogger } from './FindingsLogger';
import { UtilityBillForm } from './UtilityBillForm';
import { AuditReportPrint } from './AuditReportPrint';

interface AuditWorkspaceProps {
  audit: AuditData;
  onSave: (updates: Partial<AuditData>) => void;
  onReset: () => void;
}

type TabId = 'building' | 'photos' | 'lighting' | 'equipment' | 'submittal' | 'utilities' | 'findings' | 'report';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'building', label: 'Building', icon: Building2 },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'equipment', label: 'HVAC/Other', icon: Settings },
  { id: 'submittal', label: 'Submittal', icon: FileText },
  { id: 'utilities', label: 'Utilities', icon: Zap },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'report', label: 'Report', icon: FileText },
];

const TAB_ORDER: TabId[] = ['building', 'photos', 'lighting', 'equipment', 'submittal', 'utilities', 'findings', 'report'];

const TAB_LABELS: Record<TabId, string> = {
  building: 'Building Info',
  photos: 'Photos',
  lighting: 'Lighting',
  equipment: 'HVAC/Equipment',
  submittal: 'Submittal',
  utilities: 'Utilities',
  findings: 'Findings',
  report: 'Report',
};

export function AuditWorkspace({ audit, onSave, onReset }: AuditWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('building');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Auto-save with debounce
  const handleUpdate = useCallback((updates: Partial<AuditData>) => {
    onSave(updates);
    setLastSaved(new Date());
  }, [onSave]);

  // Tab completion status
  const getTabStatus = (tabId: TabId): 'complete' | 'partial' | 'empty' => {
    switch (tabId) {
      case 'building':
        if (audit.buildingInfo.name && audit.buildingInfo.businessType && audit.buildingInfo.squareFootage > 0) {
          return 'complete';
        }
        if (audit.buildingInfo.name || audit.buildingInfo.address) {
          return 'partial';
        }
        return 'empty';
      case 'photos':
        if (audit.photos.length >= 5) return 'complete';
        if (audit.photos.length > 0) return 'partial';
        return 'empty';
      case 'lighting':
        // Calculate total fixtures documented
        const totalFixtures = audit.lightingZones.reduce((sum, z) => sum + (z.fixtureCount || 0), 0);
        if (audit.lightingZones.length > 0 && totalFixtures > 0) {
          // Check if all zones are verified
          const allVerified = audit.lightingZones.every(z => z.verified);
          if (allVerified) return 'complete';
          return 'partial';
        }
        if (audit.lightingZones.length > 0) return 'partial';
        return 'empty';
      case 'equipment':
        const hasEquipment = audit.hvacUnits.length > 0 || audit.equipment.length > 0;
        if (hasEquipment && audit.hvacUnits.length > 0) {
          return 'complete';
        }
        if (hasEquipment) return 'partial';
        return 'empty';
      case 'submittal':
        if (audit.contractorSubmittal && audit.contractorSubmittal.lightingItems.length > 0) {
          return 'complete';
        }
        if (audit.contractorSubmittal?.contractorName) return 'partial';
        return 'empty';
      case 'utilities':
        if (audit.utilityBills.length >= 12) return 'complete';
        if (audit.utilityBills.length > 0) return 'partial';
        return 'empty';
      case 'findings':
        if ((audit.findings?.length || 0) >= 3) return 'complete';
        if ((audit.findings?.length || 0) > 0) return 'partial';
        return 'empty';
      case 'report':
        const buildingComplete = getTabStatus('building') === 'complete';
        const hasContent = audit.photos.length > 0 || audit.hvacUnits.length > 0;
        if (buildingComplete && hasContent) return 'partial';
        return 'empty';
      default:
        return 'empty';
    }
  };

  // Check if tab can proceed to next (minimum requirements met)
  const canProceedFromTab = (tabId: TabId): { canProceed: boolean; message: string } => {
    switch (tabId) {
      case 'building':
        const hasName = !!audit.buildingInfo.name?.trim();
        const hasType = !!audit.buildingInfo.businessType;
        const hasSqft = audit.buildingInfo.squareFootage > 0;
        if (!hasName || !hasType || !hasSqft) {
          const missing = [];
          if (!hasName) missing.push('building name');
          if (!hasType) missing.push('business type');
          if (!hasSqft) missing.push('square footage');
          return { 
            canProceed: false, 
            message: `Please fill in: ${missing.join(', ')}` 
          };
        }
        return { canProceed: true, message: '' };
      
      case 'photos':
        if (audit.photos.length === 0) {
          return { 
            canProceed: false, 
            message: 'Please add at least 1 photo before continuing' 
          };
        }
        return { canProceed: true, message: '' };
      
      case 'lighting':
        if (audit.lightingZones.length === 0) {
          return { 
            canProceed: false, 
            message: 'Please add at least 1 lighting zone with fixture count' 
          };
        }
        const hasFixtureCount = audit.lightingZones.some(z => z.fixtureCount > 0);
        if (!hasFixtureCount) {
          return {
            canProceed: false,
            message: 'Please enter fixture counts for at least 1 lighting zone'
          };
        }
        return { canProceed: true, message: '' };
      
      case 'equipment':
        // Equipment is optional now that lighting has its own tab
        return { canProceed: true, message: '' };
      
      case 'submittal':
        // Submittal is optional but recommended
        return { canProceed: true, message: '' };
      
      case 'utilities':
        // Utilities are optional
        return { canProceed: true, message: '' };
      
      case 'findings':
        // Findings are optional
        return { canProceed: true, message: '' };
      
      default:
        return { canProceed: true, message: '' };
    }
  };

  // Check if a specific tab is accessible (all previous tabs complete)
  const canAccessTab = (tabId: TabId): boolean => {
    const tabIndex = TAB_ORDER.indexOf(tabId);
    for (let i = 0; i < tabIndex; i++) {
      const prevTab = TAB_ORDER[i];
      // Building is required, others have their own rules
      if (prevTab === 'building' && getTabStatus('building') !== 'complete') {
        return false;
      }
    }
    return true;
  };

  // Mark as in-progress if any data exists
  const updateStatus = () => {
    if (audit.status === 'draft') {
      const hasData =
        audit.buildingInfo.name ||
        audit.photos.length > 0 ||
        audit.hvacUnits.length > 0 ||
        (audit.findings?.length || 0) > 0;
      if (hasData) {
        handleUpdate({ status: 'in-progress' });
      }
    }
  };

  // Handle reset confirmation
  const handleResetConfirm = () => {
    onReset();
    setShowResetConfirm(false);
    setActiveTab('building');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/auditor')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {audit.name || 'Untitled Audit'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {audit.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {audit.status === 'draft' ? 'Draft' : 'In Progress'}
                    </span>
                  )}
                  {lastSaved && (
                    <span className="text-gray-400">
                      • Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowResetConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {audit.status !== 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdate({ status: 'completed' })}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 overflow-x-auto">
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => {
              const status = getTabStatus(tab.id);
              const Icon = tab.icon;
              const isAccessible = canAccessTab(tab.id);
              const currentIndex = TAB_ORDER.indexOf(activeTab);
              const tabIndex = TAB_ORDER.indexOf(tab.id);
              const isPreviousTab = tabIndex < currentIndex;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isAccessible || isPreviousTab) {
                      setActiveTab(tab.id);
                    }
                  }}
                  disabled={!isAccessible && !isPreviousTab}
                  title={!isAccessible && !isPreviousTab ? 'Complete previous sections first' : ''}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : !isAccessible && !isPreviousTab
                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {status === 'complete' && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                  {status === 'partial' && (
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'building' && (
          <>
            <BuildingInfoForm
              buildingInfo={audit.buildingInfo}
              onChange={(buildingInfo) => {
                handleUpdate({ buildingInfo });
                updateStatus();
              }}
            />
            <TabNavigation 
              currentTab="building"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('building').canProceed}
              validationMessage={canProceedFromTab('building').message}
            />
          </>
        )}

        {activeTab === 'photos' && (
          <>
            <PhotoDocumentation
              photos={audit.photos}
              onPhotosChange={(photos) => {
                handleUpdate({ photos });
                updateStatus();
              }}
              rooms={audit.rooms}
              hvacUnits={audit.hvacUnits}
              lightingZones={audit.lightingZones}
              equipment={audit.equipment}
              onLinkPhotoToHVAC={(photoId, hvacId) => {
                const updatedUnits = audit.hvacUnits.map(u => 
                  u.id === hvacId 
                    ? { ...u, photoIds: [...(u.photoIds || []), photoId] }
                    : u
                );
                handleUpdate({ hvacUnits: updatedUnits });
              }}
              onLinkPhotoToLighting={(photoId, lightingId) => {
                const updatedZones = audit.lightingZones.map(z => 
                  z.id === lightingId 
                    ? { ...z, photoIds: [...(z.photoIds || []), photoId] }
                    : z
                );
                handleUpdate({ lightingZones: updatedZones });
              }}
              onLinkPhotoToEquipment={(photoId, equipmentId) => {
                const updatedEquipment = audit.equipment.map(e => 
                  e.id === equipmentId 
                    ? { ...e, photoIds: [...(e.photoIds || []), photoId] }
                    : e
                );
                handleUpdate({ equipment: updatedEquipment });
              }}
            />
            <TabNavigation 
              currentTab="photos"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('photos').canProceed}
              validationMessage={canProceedFromTab('photos').message}
            />
          </>
        )}

        {activeTab === 'lighting' && (
          <>
            <LightingInspectionForm
              lightingZones={audit.lightingZones}
              onLightingChange={(lightingZones) => {
                handleUpdate({ lightingZones });
                updateStatus();
              }}
              inspectionType={audit.inspectionType}
            />
            <TabNavigation 
              currentTab="lighting"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('lighting').canProceed}
              validationMessage={canProceedFromTab('lighting').message}
            />
          </>
        )}

        {activeTab === 'equipment' && (
          <>
            <EquipmentInventoryForm
              hvacUnits={audit.hvacUnits}
              lightingZones={[]} 
              equipment={audit.equipment}
              onHVACChange={(hvacUnits) => {
                handleUpdate({ hvacUnits });
                updateStatus();
              }}
              onLightingChange={() => {}}
              onEquipmentChange={(equipment) => {
                handleUpdate({ equipment });
                updateStatus();
              }}
            />
            <TabNavigation 
              currentTab="equipment"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('equipment').canProceed}
              validationMessage={canProceedFromTab('equipment').message}
            />
          </>
        )}

        {activeTab === 'submittal' && (
          <>
            <ContractorSubmittalForm
              submittal={audit.contractorSubmittal}
              lightingZones={audit.lightingZones}
              onSubmittalChange={(contractorSubmittal) => {
                handleUpdate({ contractorSubmittal });
                updateStatus();
              }}
              onDiscrepanciesFound={(newDiscrepancies) => {
                const existingIds = new Set((audit.discrepancies || []).map(d => d.id));
                const uniqueNew = newDiscrepancies.filter(d => !existingIds.has(d.id));
                if (uniqueNew.length > 0) {
                  handleUpdate({ 
                    discrepancies: [...(audit.discrepancies || []), ...uniqueNew] 
                  });
                }
              }}
              inspectionType={audit.inspectionType}
            />
            <TabNavigation 
              currentTab="submittal"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('submittal').canProceed}
              validationMessage={canProceedFromTab('submittal').message}
            />
          </>
        )}

        {activeTab === 'utilities' && (
          <>
            <UtilityBillForm
              bills={audit.utilityBills}
              squareFootage={audit.buildingInfo.squareFootage || 0}
              onBillsChange={(utilityBills) => {
                handleUpdate({ utilityBills });
                updateStatus();
              }}
            />
            <TabNavigation 
              currentTab="utilities"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('utilities').canProceed}
              validationMessage={canProceedFromTab('utilities').message}
            />
          </>
        )}

        {activeTab === 'findings' && (
          <>
            <FindingsLogger
              findings={audit.findings || []}
              photos={audit.photos}
              onFindingsChange={(findings) => {
                handleUpdate({ findings });
                updateStatus();
              }}
            />
            <TabNavigation 
              currentTab="findings"
              onNavigate={setActiveTab}
              canProceed={canProceedFromTab('findings').canProceed}
              validationMessage={canProceedFromTab('findings').message}
            />
          </>
        )}

        {activeTab === 'report' && (
          <ReportTab
            audit={audit}
            onNotesChange={(generalNotes) => handleUpdate({ generalNotes })}
            onAuditorChange={(auditorName) => handleUpdate({ auditorName })}
          />
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start Over?
                </h3>
                <p className="text-gray-600 mb-4">
                  This will clear all audit data including photos, equipment inventory, lighting zones, and findings. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab Navigation Component
interface TabNavigationProps {
  currentTab: TabId;
  onNavigate: (tab: TabId) => void;
  canProceed: boolean;
  validationMessage: string;
}

function TabNavigation({ 
  currentTab, 
  onNavigate,
  canProceed,
  validationMessage,
}: TabNavigationProps) {
  const currentIndex = TAB_ORDER.indexOf(currentTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      {/* Validation message */}
      {!canProceed && validationMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {validationMessage}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          {prevTab && (
            <Button variant="outline" onClick={() => onNavigate(prevTab)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {TAB_LABELS[prevTab]}
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Step {currentIndex + 1} of {TAB_ORDER.length}
        </div>
        <div>
          {nextTab && (
            <Button 
              onClick={() => onNavigate(nextTab)}
              disabled={!canProceed}
              title={!canProceed ? validationMessage : ''}
            >
              Continue to {TAB_LABELS[nextTab]}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Comprehensive Report Tab Component
interface ReportTabProps {
  audit: AuditData;
  onNotesChange: (notes: string) => void;
  onAuditorChange: (name: string) => void;
}

function ReportTab({ audit, onNotesChange, onAuditorChange }: ReportTabProps) {
  const isReady = 
    audit.buildingInfo.name && 
    audit.buildingInfo.businessType && 
    audit.buildingInfo.squareFootage > 0;

  // Calculate utility stats
  const utilityStats = useMemo(() => {
    const bills = audit.utilityBills || [];
    const totalElecKwh = bills.reduce((sum, b) => sum + (b.electricityKwh || 0), 0);
    const totalElecCost = bills.reduce((sum, b) => sum + (b.electricityCost || 0), 0);
    const totalGasTherm = bills.reduce((sum, b) => sum + (b.gasTherm || 0), 0);
    const totalGasCost = bills.reduce((sum, b) => sum + (b.gasCost || 0), 0);
    const totalCost = totalElecCost + totalGasCost;
    
    // EUI calculation
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
      totalSavings: findings.reduce((sum, f) => sum + (f.estimatedSavings || 0), 0),
      totalCost: findings.reduce((sum, f) => sum + (f.estimatedCost || 0), 0),
    };
  }, [audit.findings]);

  // Auto-generated ECM recommendations
  const ecms = useMemo(() => generateECMRecommendations(audit), [audit]);
  const ecmTotals = useMemo(() => calculateTotalSavings(ecms), [ecms]);

  // State for showing print view
  const [showPrintView, setShowPrintView] = useState(false);

  // Photo counts by category
  const photoCounts = useMemo(() => {
    return audit.photos.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [audit.photos]);

  if (!isReady) {
    return (
      <Alert variant="warning">
        Please complete the Building Information tab before generating a report.
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Energy Audit Report</p>
            <h1 className="text-2xl font-bold mb-2">{audit.name}</h1>
            <p className="text-blue-100">
              {audit.buildingInfo.address && `${audit.buildingInfo.address}, `}
              {audit.buildingInfo.city && `${audit.buildingInfo.city}, `}
              {audit.buildingInfo.state} {audit.buildingInfo.zipCode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Audit Date</p>
            <p className="font-medium">{new Date(audit.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Executive Summary
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">
                {audit.buildingInfo.squareFootage.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Square Feet</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">
                {utilityStats.eui > 0 ? utilityStats.eui.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-gray-600">EUI (kBTU/sqft)</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                ${findingStats.totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Est. Annual Savings</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(audit.findings?.length || 0)}
              </div>
              <div className="text-sm text-gray-600">Findings</div>
            </div>
          </div>

          {/* Findings Priority Breakdown */}
          {(audit.findings?.length || 0) > 0 && (
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">{findingStats.high} High Priority</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">{findingStats.medium} Medium</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{findingStats.low} Low</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Building Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Building Information
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Building Name</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.businessType || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Square Footage</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.squareFootage?.toLocaleString() || '—'} sqft</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year Built</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.yearBuilt || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floors</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.floors || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupants</p>
              <p className="font-medium text-gray-900">{audit.buildingInfo.occupants || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Usage */}
      {utilityStats.totalCost > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Energy Usage Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">Electricity</p>
                <p className="text-xl font-bold text-gray-900">{utilityStats.totalElecKwh.toLocaleString()} kWh</p>
                <p className="text-sm text-gray-600">${utilityStats.totalElecCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">Natural Gas</p>
                <p className="text-xl font-bold text-gray-900">{utilityStats.totalGasTherm.toLocaleString()} therms</p>
                <p className="text-sm text-gray-600">${utilityStats.totalGasCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Total Annual Cost</p>
                <p className="text-xl font-bold text-gray-900">${utilityStats.totalCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Energy Use Intensity</p>
                <p className="text-xl font-bold text-gray-900">{utilityStats.eui.toFixed(1)}</p>
                <p className="text-sm text-gray-600">kBTU/sqft/year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Summary */}
      {(audit.hvacUnits.length > 0 || audit.lightingZones.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Equipment Inventory
            </h2>
            
            {/* HVAC */}
            {audit.hvacUnits.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">HVAC Systems ({audit.hvacUnits.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2">Type</th>
                        <th className="text-left px-3 py-2">Capacity</th>
                        <th className="text-left px-3 py-2">Age</th>
                        <th className="text-left px-3 py-2">Condition</th>
                        <th className="text-left px-3 py-2">Fuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.hvacUnits.map((unit, idx) => (
                        <tr key={unit.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                          <td className="px-3 py-2">{unit.systemType}</td>
                          <td className="px-3 py-2">{unit.capacity} {unit.capacityUnit}</td>
                          <td className="px-3 py-2">{unit.age ? `${unit.age} yrs` : '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              unit.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                              unit.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                              unit.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {unit.condition}
                            </span>
                          </td>
                          <td className="px-3 py-2">{unit.fuelType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lighting */}
            {audit.lightingZones.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Lighting Zones ({audit.lightingZones.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2">Zone</th>
                        <th className="text-left px-3 py-2">Fixture Type</th>
                        <th className="text-left px-3 py-2">Count</th>
                        <th className="text-left px-3 py-2">Watts/Fixture</th>
                        <th className="text-left px-3 py-2">Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.lightingZones.map((zone, idx) => (
                        <tr key={zone.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                          <td className="px-3 py-2">{zone.zoneName}</td>
                          <td className="px-3 py-2">{zone.fixtureType}</td>
                          <td className="px-3 py-2">{zone.fixtureCount}</td>
                          <td className="px-3 py-2">{zone.wattsPerFixture || '—'}</td>
                          <td className="px-3 py-2">{zone.controlType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Findings & Recommendations */}
      {(audit.findings?.length || 0) > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Findings & Recommendations
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
                    className={`p-4 rounded-lg border-l-4 ${
                      finding.priority === 'high' ? 'bg-red-50 border-red-500' :
                      finding.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-medium uppercase ${
                          finding.priority === 'high' ? 'text-red-600' :
                          finding.priority === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {finding.priority} priority
                        </span>
                        <h3 className="font-medium text-gray-900">{finding.title}</h3>
                      </div>
                      {finding.estimatedSavings && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Est. Savings</p>
                          <p className="font-semibold text-green-600">${finding.estimatedSavings.toLocaleString()}/yr</p>
                        </div>
                      )}
                    </div>
                    {finding.description && (
                      <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                    )}
                    {finding.recommendation && (
                      <p className="text-sm text-gray-700">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Total Savings Summary */}
            {findingStats.totalSavings > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Total Estimated Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">${findingStats.totalSavings.toLocaleString()}/year</p>
                  </div>
                  {findingStats.totalCost > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Implementation Cost</p>
                      <p className="text-xl font-semibold text-gray-900">${findingStats.totalCost.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">
                        Payback: {(findingStats.totalCost / findingStats.totalSavings).toFixed(1)} years
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-Generated ECM Recommendations */}
      {ecms.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Energy Conservation Measures ({ecms.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2">Measure</th>
                    <th className="text-left px-3 py-2">Priority</th>
                    <th className="text-right px-3 py-2">Annual Savings</th>
                    <th className="text-right px-3 py-2">Cost</th>
                    <th className="text-right px-3 py-2">Payback</th>
                  </tr>
                </thead>
                <tbody>
                  {ecms.map((ecm, idx) => (
                    <tr key={ecm.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{ecm.title}</div>
                        <div className="text-xs text-gray-500">{ecm.category}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          ecm.priority === 'high' ? 'bg-red-100 text-red-700' :
                          ecm.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ecm.priority}
                        </span>
                      </td>
                      <td className="text-right px-3 py-2 text-green-600 font-medium">
                        ${Math.round((ecm.annualSavingsLow + ecm.annualSavingsHigh) / 2).toLocaleString()}
                      </td>
                      <td className="text-right px-3 py-2">
                        ${Math.round((ecm.implementationCostLow + ecm.implementationCostHigh) / 2).toLocaleString()}
                      </td>
                      <td className="text-right px-3 py-2">{ecm.paybackYears.toFixed(1)} yrs</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-green-100">
                    <td className="px-3 py-2" colSpan={2}>Total Potential</td>
                    <td className="text-right px-3 py-2 text-green-700">
                      ${Math.round((ecmTotals.totalSavingsLow + ecmTotals.totalSavingsHigh) / 2).toLocaleString()}/yr
                    </td>
                    <td className="text-right px-3 py-2">
                      ${Math.round((ecmTotals.totalCostLow + ecmTotals.totalCostHigh) / 2).toLocaleString()}
                    </td>
                    <td className="text-right px-3 py-2">{ecmTotals.avgPayback.toFixed(1)} yrs</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              * ECMs are auto-generated based on equipment age, condition, and type. Actual savings may vary.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Documentation */}
      {audit.photos.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Photo Documentation ({audit.photos.length} photos)
            </h2>
            
            {/* Category summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(photoCounts).map(([category, count]) => {
                const catInfo = PHOTO_CATEGORIES.find(c => c.id === category);
                return (
                  <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {catInfo?.label || category}: {count}
                  </span>
                );
              })}
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {audit.photos.slice(0, 24).map(photo => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={photo.dataUrl} 
                    alt={photo.label || photo.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {audit.photos.length > 24 && (
                <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">+{audit.photos.length - 24}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auditor Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Auditor Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Name</label>
              <input
                type="text"
                value={audit.auditorName || ''}
                onChange={(e) => onAuditorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter auditor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audit Date</label>
              <input
                type="text"
                value={new Date(audit.createdAt).toLocaleDateString()}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Add any general observations, recommendations, or notes about this audit..."
              value={audit.generalNotes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h2>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowPrintView(true)}>
              <Printer className="w-4 h-4 mr-2" />
              Generate Printable Report
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Quick Print
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Click &quot;Generate Printable Report&quot; for a formatted report, then use your browser&apos;s print function (Ctrl+P) to save as PDF.
          </p>
        </CardContent>
      </Card>

      {/* Print View Modal */}
      {showPrintView && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto print:static">
          <div className="no-print sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between">
            <span className="font-medium">Print Preview - Use Ctrl+P or Cmd+P to print/save as PDF</span>
            <Button 
              variant="outline" 
              onClick={() => setShowPrintView(false)}
              className="text-white border-white hover:bg-blue-700"
            >
              Close Preview
            </Button>
          </div>
          <AuditReportPrint audit={audit} />
        </div>
      )}
    </div>
  );
}
