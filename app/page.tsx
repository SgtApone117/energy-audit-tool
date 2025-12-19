"use client";

import { useState } from "react";
import type { FormData } from "@/lib/types";
import { UtilityBillData, createEmptyUtilityData } from "@/lib/utility/types";
import { OperatingScheduleData, createEmptyScheduleData } from "@/lib/schedule/types";
import { EquipmentInventory, createEmptyEquipmentInventory } from "@/lib/equipment/types";
import {
  calculateAnnualEnergyUse,
  calculateAnnualEnergyCost,
  calculateEndUseBreakdown,
  calculateECMs,
} from "@/lib/calculations";
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
  });

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
  const [ecmResults, setEcmResults] = useState<ReturnType<typeof calculateECMs>>(null);

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

    // Calculate energy use - use actual data if available, otherwise use EUI estimate
    let energyUse: number | null;
    if (utilityData.hasActualData && utilityData.totalElectricityKwh > 0) {
      // Use actual utility data
      energyUse = utilityData.totalElectricityKwh;
    } else {
      // Use EUI-based estimate
      energyUse = calculateAnnualEnergyUse(formData.businessType, formData.floorArea);
    }
    setAnnualEnergyUse(energyUse);

    // Calculate energy cost - use actual data if available
    let energyCost: number | null;
    if (utilityData.hasActualData && utilityData.totalElectricityCost > 0) {
      energyCost = utilityData.totalElectricityCost;
    } else {
      energyCost = energyUse !== null ? calculateAnnualEnergyCost(energyUse) : null;
    }
    setAnnualEnergyCost(energyCost);

    // Calculate end-use breakdown
    const breakdown = calculateEndUseBreakdown(formData.businessType, energyUse);
    setEndUseBreakdown(breakdown);

    // Calculate ECMs
    const ecms = calculateECMs(breakdown, formData.floorArea);
    setEcmResults(ecms);
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
          ecmResults={ecmResults}
          utilityData={submittedUtilityData}
          scheduleData={submittedScheduleData}
          equipmentData={submittedEquipmentData}
        />
      )}
    </div>
  );
}
