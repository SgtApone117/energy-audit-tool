'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Alert } from '@/components/ui';
import { StepProgress } from '@/components/ui/ProgressBar';
import { ArrowLeft, ArrowRight, SkipForward, FileText, RefreshCw } from 'lucide-react';
import { useAssessmentForm } from '@/lib/customer/hooks/useAssessmentForm';
import { useSessionPersistence } from '@/lib/customer/hooks/useSessionPersistence';
import { BusinessBasics } from './steps/BusinessBasics';
import { UtilityBills } from './steps/UtilityBills';
import { EquipmentInventory } from './steps/EquipmentInventory';
import { ReviewStep } from './steps/ReviewStep';
import { CustomerAssessmentForm, AssessmentStep } from '@/lib/customer/types';

const STEPS = ['Business Info', 'Utility Bills', 'Equipment', 'Review'];

export function AssessmentForm() {
  const router = useRouter();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    formData: savedFormData,
    currentStep: savedStep,
    hasSavedSession,
    lastSaved,
    setFormData: saveToSession,
    setCurrentStep: saveStepToSession,
    clearSession,
  } = useSessionPersistence();

  const {
    formData,
    currentStep,
    validation,
    goToStep,
    nextStep,
    previousStep,
    canProceed,
    updateBusinessBasics,
    updateUtilityBill,
    setUtilityBills,
    getFilledBillsCount,
    addHVACSystem,
    updateHVACSystem,
    removeHVACSystem,
    updateLighting,
    updateRefrigeration,
    updateCooking,
    updateOperatingSchedule,
    getEquipmentCompletion,
    resetForm,
    setFormData,
  } = useAssessmentForm(hasSavedSession ? savedFormData : undefined);

  // Track previous values to detect actual changes
  const prevFormDataRef = useRef<string>('');
  const prevStepRef = useRef<number>(1);

  // Check for saved session on mount only
  useEffect(() => {
    if (!isInitialized && hasSavedSession && savedFormData?.businessName) {
      setShowResumePrompt(true);
    }
    setIsInitialized(true);
  }, []); // Empty dependency - run once on mount

  // Save to session only when form data actually changes (debounced)
  useEffect(() => {
    const currentFormDataStr = JSON.stringify(formData);
    const hasFormChanged = prevFormDataRef.current !== currentFormDataStr;
    const hasStepChanged = prevStepRef.current !== currentStep;
    
    // Only save if something actually changed and we have meaningful data
    if ((hasFormChanged || hasStepChanged) && (formData.businessName || formData.businessType)) {
      const timeoutId = setTimeout(() => {
        saveToSession(formData);
        prevFormDataRef.current = currentFormDataStr;
        prevStepRef.current = currentStep;
      }, 500); // Debounce by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, currentStep]); // Intentionally excluding saveToSession to prevent loops

  const handleResume = () => {
    if (savedFormData) {
      setFormData(savedFormData);
      goToStep(savedStep);
    }
    setShowResumePrompt(false);
  };

  const handleStartFresh = () => {
    clearSession();
    resetForm();
    setShowResumePrompt(false);
  };

  const handleEditStep = useCallback((step: 1 | 2 | 3) => {
    goToStep(step);
  }, [goToStep]);

  const handleNext = () => {
    if (canProceed && currentStep < 4) {
      nextStep();
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousStep();
      window.scrollTo(0, 0);
    }
  };

  const handleSkipEquipment = () => {
    goToStep(4);
    window.scrollTo(0, 0);
  };

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    
    // Store form data in sessionStorage for the results page
    sessionStorage.setItem('assessment-results-data', JSON.stringify(formData));
    
    // Navigate to results
    router.push('/assessment/results');
  };

  // Resume prompt modal
  if (showResumePrompt) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600 mb-4">
              You have a saved assessment from{' '}
              {lastSaved ? new Date(lastSaved).toLocaleDateString() : 'earlier'}.
              Would you like to continue where you left off?
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleStartFresh}>
                Start Fresh
              </Button>
              <Button onClick={handleResume}>
                Resume Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <StepProgress currentStep={currentStep} totalSteps={4} steps={STEPS} />
      </div>

      {/* Form content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <BusinessBasics
              formData={formData}
              errors={validation.step1.errors}
              onUpdate={updateBusinessBasics}
            />
          )}

          {currentStep === 2 && (
            <UtilityBills
              formData={formData}
              errors={validation.step2.errors}
              onUpdateBill={updateUtilityBill}
              onSetBills={setUtilityBills}
              filledBillsCount={getFilledBillsCount()}
            />
          )}

          {currentStep === 3 && (
            <EquipmentInventory
              formData={formData}
              onAddHVAC={addHVACSystem}
              onUpdateHVAC={updateHVACSystem}
              onRemoveHVAC={removeHVACSystem}
              onUpdateLighting={updateLighting}
              onUpdateRefrigeration={updateRefrigeration}
              onUpdateCooking={updateCooking}
              onUpdateSchedule={updateOperatingSchedule}
              completionPercentage={getEquipmentCompletion()}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              formData={formData}
              filledBillsCount={getFilledBillsCount()}
              equipmentCompletion={getEquipmentCompletion()}
              onEditStep={handleEditStep}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Skip button for equipment step */}
          {currentStep === 3 && (
            <Button variant="ghost" onClick={handleSkipEquipment}>
              <SkipForward className="w-4 h-4 mr-2" />
              Skip to Review
            </Button>
          )}

          {/* Continue/Generate Report button */}
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateReport} 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate My Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Validation message */}
      {!canProceed && currentStep < 4 && (
        <div className="mt-4">
          <Alert variant="warning">
            Please complete all required fields to continue.
          </Alert>
        </div>
      )}
    </div>
  );
}
