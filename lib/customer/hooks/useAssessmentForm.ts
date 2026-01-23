'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  CustomerAssessmentForm,
  AssessmentStep,
  UtilityBill,
  HVACSystem,
  LightingDetails,
  RefrigerationEquipment,
  CookingEquipment,
  OtherEquipment,
  OperatingSchedule,
  createEmptyAssessmentForm,
  createEmptyHVACSystem,
} from '../types';

interface FormValidation {
  step1: { isValid: boolean; errors: Record<string, string> };
  step2: { isValid: boolean; errors: Record<string, string> };
  step3: { isValid: boolean }; // Always valid (optional)
}

interface UseAssessmentFormReturn {
  formData: CustomerAssessmentForm;
  currentStep: AssessmentStep;
  validation: FormValidation;

  // Navigation
  goToStep: (step: AssessmentStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;

  // Step 1: Business Basics
  updateBusinessBasics: (field: keyof CustomerAssessmentForm, value: string | number | null) => void;
  validateStep1: () => boolean;

  // Step 2: Utility Bills
  updateUtilityBill: (index: number, field: keyof UtilityBill, value: number | null) => void;
  setUtilityBills: (bills: UtilityBill[]) => void;
  getFilledBillsCount: () => number;
  validateStep2: () => boolean;

  // Step 3: Equipment
  addHVACSystem: () => void;
  updateHVACSystem: (id: string, updates: Partial<HVACSystem>) => void;
  removeHVACSystem: (id: string) => void;
  updateLighting: (details: LightingDetails | null) => void;
  updateRefrigeration: (equipment: RefrigerationEquipment | null) => void;
  updateCooking: (equipment: CookingEquipment | null) => void;
  addOtherEquipment: (equipment: OtherEquipment) => void;
  removeOtherEquipment: (id: string) => void;
  updateOperatingSchedule: (schedule: OperatingSchedule | null) => void;

  // Equipment completion percentage
  getEquipmentCompletion: () => number;

  // Reset
  resetForm: () => void;
  setFormData: (data: CustomerAssessmentForm) => void;
}

export function useAssessmentForm(
  initialData?: CustomerAssessmentForm
): UseAssessmentFormReturn {
  const [formData, setFormData] = useState<CustomerAssessmentForm>(
    initialData || createEmptyAssessmentForm()
  );
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);

  // Validation
  const validation = useMemo((): FormValidation => {
    const step1Errors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      step1Errors.businessName = 'Business name is required';
    }
    if (!formData.businessType) {
      step1Errors.businessType = 'Business type is required';
    }
    if (!formData.address.trim()) {
      step1Errors.address = 'Address is required';
    }
    if (!formData.zipCode.trim()) {
      step1Errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      step1Errors.zipCode = 'ZIP code must be 5 digits';
    }
    if (!formData.squareFootage || formData.squareFootage <= 0) {
      step1Errors.squareFootage = 'Square footage must be greater than 0';
    }

    const step2Errors: Record<string, string> = {};
    const filledBills = formData.utilityBills.filter(
      (bill) => bill.electricityKwh !== null && bill.electricityCost !== null
    );
    if (filledBills.length < 3) {
      step2Errors.utilityBills = 'At least 3 months of utility data is required';
    }

    return {
      step1: {
        isValid: Object.keys(step1Errors).length === 0,
        errors: step1Errors,
      },
      step2: {
        isValid: Object.keys(step2Errors).length === 0,
        errors: step2Errors,
      },
      step3: { isValid: true }, // Optional step
    };
  }, [formData]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return validation.step1.isValid;
      case 2:
        return validation.step2.isValid;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, validation]);

  // Navigation
  const goToStep = useCallback((step: AssessmentStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as AssessmentStep);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as AssessmentStep);
    }
  }, [currentStep]);

  // Step 1: Business Basics
  const updateBusinessBasics = useCallback(
    (field: keyof CustomerAssessmentForm, value: string | number | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const validateStep1 = useCallback(() => {
    return validation.step1.isValid;
  }, [validation.step1.isValid]);

  // Step 2: Utility Bills
  const updateUtilityBill = useCallback(
    (index: number, field: keyof UtilityBill, value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        utilityBills: prev.utilityBills.map((bill, i) =>
          i === index ? { ...bill, [field]: value } : bill
        ),
      }));
    },
    []
  );

  const setUtilityBills = useCallback((bills: UtilityBill[]) => {
    setFormData((prev) => ({
      ...prev,
      utilityBills: bills,
    }));
  }, []);

  const getFilledBillsCount = useCallback(() => {
    return formData.utilityBills.filter(
      (bill) => bill.electricityKwh !== null && bill.electricityCost !== null
    ).length;
  }, [formData.utilityBills]);

  const validateStep2 = useCallback(() => {
    return validation.step2.isValid;
  }, [validation.step2.isValid]);

  // Step 3: Equipment
  const addHVACSystem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      hvacSystems: [...prev.hvacSystems, createEmptyHVACSystem()],
    }));
  }, []);

  const updateHVACSystem = useCallback((id: string, updates: Partial<HVACSystem>) => {
    setFormData((prev) => ({
      ...prev,
      hvacSystems: prev.hvacSystems.map((system) =>
        system.id === id ? { ...system, ...updates } : system
      ),
    }));
  }, []);

  const removeHVACSystem = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      hvacSystems: prev.hvacSystems.filter((system) => system.id !== id),
    }));
  }, []);

  const updateLighting = useCallback((details: LightingDetails | null) => {
    setFormData((prev) => ({
      ...prev,
      lightingDetails: details,
    }));
  }, []);

  const updateRefrigeration = useCallback((equipment: RefrigerationEquipment | null) => {
    setFormData((prev) => ({
      ...prev,
      refrigerationEquipment: equipment,
    }));
  }, []);

  const updateCooking = useCallback((equipment: CookingEquipment | null) => {
    setFormData((prev) => ({
      ...prev,
      cookingEquipment: equipment,
    }));
  }, []);

  const addOtherEquipment = useCallback((equipment: OtherEquipment) => {
    setFormData((prev) => ({
      ...prev,
      otherEquipment: [...prev.otherEquipment, equipment],
    }));
  }, []);

  const removeOtherEquipment = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      otherEquipment: prev.otherEquipment.filter((eq) => eq.id !== id),
    }));
  }, []);

  const updateOperatingSchedule = useCallback((schedule: OperatingSchedule | null) => {
    setFormData((prev) => ({
      ...prev,
      operatingSchedule: schedule,
    }));
  }, []);

  const getEquipmentCompletion = useCallback(() => {
    let filled = 0;
    let total = 5; // 5 possible sections

    // HVAC: check if any systems added
    if (formData.hvacSystems.length > 0) filled++;
    
    // Lighting: check if meaningful data entered (at least fixture count or hours)
    if (formData.lightingDetails && 
        (formData.lightingDetails.totalFixtures !== null || 
         formData.lightingDetails.hoursPerDay !== null)) {
      filled++;
    }
    
    // Refrigeration: check if any equipment indicated
    if (formData.refrigerationEquipment && 
        (formData.refrigerationEquipment.hasWalkInCooler || 
         formData.refrigerationEquipment.hasWalkInFreezer ||
         formData.refrigerationEquipment.reachInUnits > 0 ||
         formData.refrigerationEquipment.displayCases > 0 ||
         formData.refrigerationEquipment.iceMachines > 0)) {
      filled++;
    }
    
    // Cooking: check if any equipment count > 0
    if (formData.cookingEquipment && 
        (formData.cookingEquipment.ovens > 0 ||
         formData.cookingEquipment.ranges > 0 ||
         formData.cookingEquipment.fryers > 0 ||
         formData.cookingEquipment.grills > 0 ||
         formData.cookingEquipment.dishwashers > 0)) {
      filled++;
    }
    
    // Schedule: always counts if set (has default values)
    if (formData.operatingSchedule) filled++;

    return Math.round((filled / total) * 100);
  }, [formData]);

  // Reset
  const resetForm = useCallback(() => {
    setFormData(createEmptyAssessmentForm());
    setCurrentStep(1);
  }, []);

  return {
    formData,
    currentStep,
    validation,
    goToStep,
    nextStep,
    previousStep,
    canProceed,
    updateBusinessBasics,
    validateStep1,
    updateUtilityBill,
    setUtilityBills,
    getFilledBillsCount,
    validateStep2,
    addHVACSystem,
    updateHVACSystem,
    removeHVACSystem,
    updateLighting,
    updateRefrigeration,
    updateCooking,
    addOtherEquipment,
    removeOtherEquipment,
    updateOperatingSchedule,
    getEquipmentCompletion,
    resetForm,
    setFormData,
  };
}
