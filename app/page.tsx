"use client";

import { useState } from "react";
import type { FormData } from "@/lib/types";
import { UtilityBillData, createEmptyUtilityData } from "@/lib/utility/types";
import { OperatingScheduleData, createEmptyScheduleData } from "@/lib/schedule/types";
import { EquipmentInventory, createEmptyEquipmentInventory } from "@/lib/equipment/types";
import {
  calculateAnnualEnergyUseWithAdjustments,
  calculateAnnualEnergyCost,
  calculateEnhancedEndUseBreakdown,
  calculateECMs,
  EnergyCalculationResult,
  EnhancedBreakdownResult,
  getEffectiveElectricityRate,
} from "@/lib/calculations";
import { getStateFromZip } from "@/lib/data/zipToState";
import { calculateEnhancedECMs, ECMCalculationSummary } from "@/lib/ecm";
import BuildingIntakeForm from "@/components/BuildingIntakeForm";
import UtilityBillInput from "@/components/UtilityBillInput";
import OperatingScheduleInput from "@/components/OperatingScheduleInput";
import EquipmentInventoryComponent from "@/components/EquipmentInventory";
import AuditResults from "@/components/AuditResults";

export default function Home() {
  // Phase 0: Basic building data
  const [formData, setFormData] = useState<FormData>({
    buildingName: "",
    businessType: "",
    floorArea: "",
    zipCode: "",
    constructionYear: "",
    primaryHeatingFuel: "",
    secondaryFuel: "None",
  });

  // Track calculation details for display
  const [calculationResult, setCalculationResult] = useState<EnergyCalculationResult | null>(null);

  // Phase A: Utility bill data
  const [utilityData, setUtilityData] = useState<UtilityBillData>(createEmptyUtilityData());

  // Phase B: Operating schedule data
  const [scheduleData, setScheduleData] = useState<OperatingScheduleData>(
    createEmptyScheduleData()
  );

  // Phase C: Equipment inventory data
  const [equipmentData, setEquipmentData] = useState<EquipmentInventory>(
    createEmptyEquipmentInventory()
  );

  // Results state
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [submittedUtilityData, setSubmittedUtilityData] = useState<UtilityBillData | null>(null);
  const [submittedScheduleData, setSubmittedScheduleData] = useState<OperatingScheduleData | null>(null);
  const [submittedEquipmentData, setSubmittedEquipmentData] = useState<EquipmentInventory | null>(null);
  const [annualEnergyUse, setAnnualEnergyUse] = useState<number | null>(null);
  const [annualEnergyCost, setAnnualEnergyCost] = useState<number | null>(null);
  const [endUseBreakdown, setEndUseBreakdown] = useState<Record<string, number> | null>(null);
  const [enhancedBreakdown, setEnhancedBreakdown] = useState<EnhancedBreakdownResult | null>(null);
  const [ecmResults, setEcmResults] = useState<ReturnType<typeof calculateECMs>>(null);
  const [enhancedEcmResults, setEnhancedEcmResults] = useState<ECMCalculationSummary | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update schedule defaults when business type changes
    if (name === "businessType" && value) {
      setScheduleData(createEmptyScheduleData(value));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Save all submitted data
    setSubmittedData({ ...formData });
    setSubmittedUtilityData({ ...utilityData });
    setSubmittedScheduleData({ ...scheduleData });
    setSubmittedEquipmentData({ ...equipmentData });

    // Get state code from ZIP for utility rates
    const stateCode = formData.zipCode ? getStateFromZip(formData.zipCode) : null;

    // Calculate energy use with adjustments
    let energyUse: number | null;
    let calcResult: EnergyCalculationResult | null = null;

    if (utilityData.hasActualData && utilityData.totalElectricityKwh > 0) {
      // Use actual utility data
      energyUse = utilityData.totalElectricityKwh;
      // Still calculate the result for reference data (rates, climate, etc.)
      calcResult = calculateAnnualEnergyUseWithAdjustments(
        formData.businessType,
        formData.floorArea,
        {
          constructionYear: formData.constructionYear,
          zipCode: formData.zipCode,
        }
      );
    } else {
      // Use EUI-based estimate with adjustments
      calcResult = calculateAnnualEnergyUseWithAdjustments(
        formData.businessType,
        formData.floorArea,
        {
          constructionYear: formData.constructionYear,
          zipCode: formData.zipCode,
        }
      );
      energyUse = calcResult?.annualEnergyUse ?? null;
    }
    
    setCalculationResult(calcResult);
    setAnnualEnergyUse(energyUse);

    // Calculate energy cost - use actual data if available, otherwise use state rates
    let energyCost: number | null;
    if (utilityData.hasActualData && utilityData.totalElectricityCost > 0) {
      energyCost = utilityData.totalElectricityCost;
    } else {
      energyCost = energyUse !== null ? calculateAnnualEnergyCost(energyUse, stateCode) : null;
    }
    setAnnualEnergyCost(energyCost);

    // Calculate enhanced end-use breakdown (integrates equipment data if available)
    const enhanced = calculateEnhancedEndUseBreakdown(
      formData.businessType,
      energyUse,
      equipmentData.hasEquipmentData ? {
        estimatedAnnualHVACKwh: equipmentData.estimatedAnnualHVACKwh,
        estimatedAnnualLightingKwh: equipmentData.estimatedAnnualLightingKwh,
        estimatedAnnualEquipmentKwh: equipmentData.estimatedAnnualEquipmentKwh,
        hasEquipmentData: equipmentData.hasEquipmentData,
      } : null
    );
    setEnhancedBreakdown(enhanced);
    setEndUseBreakdown(enhanced?.breakdown ?? null);

    // Calculate ECMs with state-based electricity rate (legacy)
    const ecms = calculateECMs(enhanced?.breakdown ?? null, formData.floorArea, stateCode);
    setEcmResults(ecms);

    // Calculate enhanced ECMs with confidence ranges and rebates
    const electricityRate = getEffectiveElectricityRate(stateCode);
    const enhancedEcms = calculateEnhancedECMs(
      formData.businessType,
      enhanced?.breakdown ?? null,
      parseFloat(formData.floorArea) || 0,
      electricityRate
    );
    setEnhancedEcmResults(enhancedEcms);
  };

  const floorAreaNumber = parseFloat(formData.floorArea) || 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Energy Audit – Baseline Assessment
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          This tool estimates building energy usage to help you understand your energy
          consumption patterns and identify potential areas for improvement.
        </p>
      </div>

      {/* Main Building Form */}
      <BuildingIntakeForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Phase A: Utility Bill Input */}
      <UtilityBillInput
        utilityData={utilityData}
        onChange={setUtilityData}
        floorArea={floorAreaNumber}
      />

      {/* Phase B: Operating Schedule Input */}
      <OperatingScheduleInput
        scheduleData={scheduleData}
        onChange={setScheduleData}
        businessType={formData.businessType}
      />

      {/* Phase C: Equipment Inventory */}
      <EquipmentInventoryComponent
        equipment={equipmentData}
        onChange={setEquipmentData}
      />

      {/* Results */}
      {submittedData && (
        <AuditResults
          submittedData={submittedData}
          annualEnergyUse={annualEnergyUse}
          annualEnergyCost={annualEnergyCost}
          endUseBreakdown={endUseBreakdown}
          enhancedBreakdown={enhancedBreakdown}
          ecmResults={ecmResults}
          enhancedEcmResults={enhancedEcmResults}
          utilityData={submittedUtilityData}
          scheduleData={submittedScheduleData}
          equipmentData={submittedEquipmentData}
          calculationResult={calculationResult}
        />
      )}
    </div>
  );
}
