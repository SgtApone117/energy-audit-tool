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
    <div className="space-y-8">
      <div className="border-t-2 border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Audit Results</h2>

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
    </div>
  );
}

