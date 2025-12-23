'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditData, createEmptyAudit, InspectionType } from '../types';

const STORAGE_KEY = 'energy-auditor-audits';

interface AuditStorageState {
  audits: AuditData[];
  currentAuditId: string | null;
}

/**
 * Hook for managing audit data in localStorage
 */
export function useAuditStorage() {
  const [state, setState] = useState<AuditStorageState>({
    audits: [],
    currentAuditId: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuditStorageState;
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load audits from storage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save audits to storage:', error);
      }
    }
  }, [state, isLoaded]);

  // Create new audit
  const createAudit = useCallback((name?: string, inspectionType: InspectionType = 'pre'): AuditData => {
    const newAudit = createEmptyAudit(name, inspectionType);
    setState(prev => ({
      audits: [...prev.audits, newAudit],
      currentAuditId: newAudit.id,
    }));
    return newAudit;
  }, []);

  // Get audit by ID
  const getAudit = useCallback((id: string): AuditData | null => {
    return state.audits.find(a => a.id === id) || null;
  }, [state.audits]);

  // Get current audit
  const getCurrentAudit = useCallback((): AuditData | null => {
    if (!state.currentAuditId) return null;
    return getAudit(state.currentAuditId);
  }, [state.currentAuditId, getAudit]);

  // Update audit
  const updateAudit = useCallback((id: string, updates: Partial<AuditData>) => {
    setState(prev => ({
      ...prev,
      audits: prev.audits.map(audit =>
        audit.id === id
          ? { ...audit, ...updates, updatedAt: new Date().toISOString() }
          : audit
      ),
    }));
  }, []);

  // Set current audit ID
  const setCurrentAuditId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentAuditId: id }));
  }, []);

  // Delete audit
  const deleteAudit = useCallback((id: string) => {
    setState(prev => ({
      audits: prev.audits.filter(a => a.id !== id),
      currentAuditId: prev.currentAuditId === id ? null : prev.currentAuditId,
    }));
  }, []);

  // Duplicate audit
  const duplicateAudit = useCallback((id: string): AuditData | null => {
    const original = getAudit(id);
    if (!original) return null;

    const newAudit: AuditData = {
      ...JSON.parse(JSON.stringify(original)),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buildingInfo: {
        ...original.buildingInfo,
        name: `${original.buildingInfo.name} (Copy)`,
      },
    };

    setState(prev => ({
      audits: [...prev.audits, newAudit],
      currentAuditId: newAudit.id,
    }));

    return newAudit;
  }, [getAudit]);

  // Create Post-Installation audit from Pre-Installation audit
  const createPostFromPre = useCallback((id: string): AuditData | null => {
    const original = getAudit(id);
    if (!original) return null;

    // Generate new name
    let newName = original.name;
    if (newName.toLowerCase().includes('pre')) {
      newName = newName.replace(/pre[-\s]?install(ation)?/gi, 'Post-Install');
    } else {
      newName = `${newName} - Post-Install`;
    }

    const newAudit: AuditData = {
      // New identity
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Change to post-installation type
      inspectionType: 'post',
      
      // Keep building info (same building!)
      buildingInfo: JSON.parse(JSON.stringify(original.buildingInfo)),
      
      // Keep contractor submittal (comparing against same proposal)
      contractorSubmittal: original.contractorSubmittal 
        ? JSON.parse(JSON.stringify(original.contractorSubmittal))
        : undefined,
      
      // Keep operating schedule
      operatingSchedule: JSON.parse(JSON.stringify(original.operatingSchedule)),
      
      // Keep rooms (same rooms)
      rooms: JSON.parse(JSON.stringify(original.rooms)),
      
      // Clear inspection data - these will be filled during post inspection
      photos: [],
      hvacUnits: [],
      lightingZones: [],
      equipment: [],
      envelopeItems: [],
      utilityBills: [], // May want to keep this, but typically re-verify
      checklist: [],
      findings: [],
      ecmRecommendations: [],
      discrepancies: [],
      
      // Clear notes
      generalNotes: '',
      auditorName: original.auditorName, // Keep auditor
      inspectorName: original.inspectorName,
      inspectionDate: new Date().toISOString().split('T')[0],
    };

    setState(prev => ({
      audits: [...prev.audits, newAudit],
      currentAuditId: newAudit.id,
    }));

    return newAudit;
  }, [getAudit]);

  // Get all audits sorted by date
  const getAllAudits = useCallback((): AuditData[] => {
    return [...state.audits].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [state.audits]);

  // Export audit as JSON
  const exportAudit = useCallback((id: string): string | null => {
    const audit = getAudit(id);
    if (!audit) return null;
    return JSON.stringify(audit, null, 2);
  }, [getAudit]);

  // Import audit from JSON
  const importAudit = useCallback((jsonString: string): AuditData | null => {
    try {
      const audit = JSON.parse(jsonString) as AuditData;
      // Generate new ID to avoid conflicts
      audit.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      audit.updatedAt = new Date().toISOString();

      setState(prev => ({
        audits: [...prev.audits, audit],
        currentAuditId: audit.id,
      }));

      return audit;
    } catch (error) {
      console.error('Failed to import audit:', error);
      return null;
    }
  }, []);

  // Reset audit to empty state while keeping ID and name
  const resetAudit = useCallback((id: string): boolean => {
    const original = getAudit(id);
    if (!original) return false;

    const emptyAudit = createEmptyAudit(original.name, original.inspectionType);
    const resetAuditData: AuditData = {
      ...emptyAudit,
      id: original.id,
      createdAt: original.createdAt,
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      audits: prev.audits.map(audit =>
        audit.id === id ? resetAuditData : audit
      ),
    }));

    return true;
  }, [getAudit]);

  return {
    isLoaded,
    audits: state.audits,
    currentAuditId: state.currentAuditId,
    createAudit,
    getAudit,
    getCurrentAudit,
    updateAudit,
    setCurrentAuditId,
    deleteAudit,
    duplicateAudit,
    createPostFromPre,
    getAllAudits,
    exportAudit,
    importAudit,
    resetAudit,
  };
}
