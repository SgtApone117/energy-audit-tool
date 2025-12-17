"use client";

import { useState } from "react";
import type { FormData } from "@/lib/types";
import {
  calculateAnnualEnergyUse,
  calculateAnnualEnergyCost,
  calculateEndUseBreakdown,
  calculateECMs,
} from "@/lib/calculations";
import BuildingIntakeForm from "@/components/BuildingIntakeForm";
import AuditResults from "@/components/AuditResults";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    buildingName: "",
    businessType: "",
    floorArea: "",
    zipCode: "",
    constructionYear: "",
    primaryHeatingFuel: "",
  });

  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedData({ ...formData });
    const energyUse = calculateAnnualEnergyUse(
      formData.businessType,
      formData.floorArea
    );
    setAnnualEnergyUse(energyUse);
    const energyCost = calculateAnnualEnergyCost(energyUse);
    setAnnualEnergyCost(energyCost);
    const breakdown = calculateEndUseBreakdown(formData.businessType, energyUse);
    setEndUseBreakdown(breakdown);
    const ecms = calculateECMs(breakdown, formData.floorArea);
    setEcmResults(ecms);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Energy Audit – Baseline Assessment</h1>
      <p className="text-gray-700 mb-8">
        This tool estimates building energy usage to help you understand your energy consumption patterns and identify potential areas for improvement.
      </p>

      <BuildingIntakeForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {submittedData && (
        <AuditResults
          submittedData={submittedData}
          annualEnergyUse={annualEnergyUse}
          annualEnergyCost={annualEnergyCost}
          endUseBreakdown={endUseBreakdown}
          ecmResults={ecmResults}
        />
      )}
    </div>
  );
}
