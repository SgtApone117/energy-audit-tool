'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useLocalStorage, useHasSavedData } from '@/hooks';
import { CustomerAssessmentForm, createEmptyAssessmentForm, AssessmentStep } from '../types';

const STORAGE_KEY = 'energy-audit-assessment';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const EXPIRY_HOURS = 24;

interface SavedSession {
  formData: CustomerAssessmentForm;
  currentStep: AssessmentStep;
  lastSaved: string;
}

interface UseSessionPersistenceReturn {
  formData: CustomerAssessmentForm;
  currentStep: AssessmentStep;
  setFormData: (data: CustomerAssessmentForm) => void;
  setCurrentStep: (step: AssessmentStep) => void;
  updateFormField: <K extends keyof CustomerAssessmentForm>(
    field: K,
    value: CustomerAssessmentForm[K]
  ) => void;
  hasSavedSession: boolean;
  lastSaved: Date | null;
  clearSession: () => void;
  resumeSession: () => void;
  startNewSession: () => void;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
  const hasSavedSession = useHasSavedData(STORAGE_KEY);

  const [session, setSession, clearSession] = useLocalStorage<SavedSession | null>(
    STORAGE_KEY,
    null,
    { expiryHours: EXPIRY_HOURS }
  );

  // Local state for immediate updates
  const formDataRef = useRef<CustomerAssessmentForm>(
    session?.formData || createEmptyAssessmentForm()
  );
  const currentStepRef = useRef<AssessmentStep>(session?.currentStep || 1);

  // Auto-save interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (formDataRef.current.businessName || formDataRef.current.businessType) {
        setSession({
          formData: formDataRef.current,
          currentStep: currentStepRef.current,
          lastSaved: new Date().toISOString(),
        });
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [setSession]);

  const setFormData = useCallback(
    (data: CustomerAssessmentForm) => {
      formDataRef.current = data;
      setSession({
        formData: data,
        currentStep: currentStepRef.current,
        lastSaved: new Date().toISOString(),
      });
    },
    [setSession]
  );

  const setCurrentStep = useCallback(
    (step: AssessmentStep) => {
      currentStepRef.current = step;
      setSession({
        formData: formDataRef.current,
        currentStep: step,
        lastSaved: new Date().toISOString(),
      });
    },
    [setSession]
  );

  const updateFormField = useCallback(
    <K extends keyof CustomerAssessmentForm>(field: K, value: CustomerAssessmentForm[K]) => {
      formDataRef.current = {
        ...formDataRef.current,
        [field]: value,
      };
      // Don't auto-save on every field change, let the interval handle it
    },
    []
  );

  const resumeSession = useCallback(() => {
    if (session) {
      formDataRef.current = session.formData;
      currentStepRef.current = session.currentStep;
    }
  }, [session]);

  const startNewSession = useCallback(() => {
    formDataRef.current = createEmptyAssessmentForm();
    currentStepRef.current = 1;
    clearSession();
  }, [clearSession]);

  return {
    formData: session?.formData || formDataRef.current,
    currentStep: session?.currentStep || currentStepRef.current,
    setFormData,
    setCurrentStep,
    updateFormField,
    hasSavedSession,
    lastSaved: session?.lastSaved ? new Date(session.lastSaved) : null,
    clearSession,
    resumeSession,
    startNewSession,
  };
}
