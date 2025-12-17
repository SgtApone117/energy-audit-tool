"use client";

import type { FormData, ECMResult } from "@/lib/types";
import BuildingSummary from "./BuildingSummary";
import EnergyBaseline from "./EnergyBaseline";
import EnergyBreakdown from "./EnergyBreakdown";
import ECMTable from "./ECMTable";

interface AuditResultsProps {
  submittedData: FormData;
  annualEnergyUse: number | null;
  annualEnergyCost: number | null;
  endUseBreakdown: Record<string, number> | null;
  ecmResults: ECMResult[] | null;
}

export default function AuditResults({
  submittedData,
  annualEnergyUse,
  annualEnergyCost,
  endUseBreakdown,
  ecmResults,
}: AuditResultsProps) {
  return (
    <div className="mt-8 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Audit Results</h2>
      
      <BuildingSummary data={submittedData} />

      {annualEnergyUse !== null && (
        <EnergyBaseline
          annualEnergyUse={annualEnergyUse}
          annualEnergyCost={annualEnergyCost}
        />
      )}

      {endUseBreakdown && (
        <EnergyBreakdown breakdown={endUseBreakdown} />
      )}

      {ecmResults && ecmResults.length > 0 && (
        <ECMTable results={ecmResults} />
      )}
    </div>
  );
}

