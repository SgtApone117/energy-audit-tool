import type { BusinessType } from "@/lib/types";
import { EUI_BENCHMARK_RANGES, getEUIContextLabel } from "@/lib/benchmarks/euiBenchmarks";
import { InfoTooltip } from "./ui/Tooltip";

interface EUIBenchmarkContextProps {
  annualEnergyUse: number;
  floorArea: number;
  businessType: BusinessType | "";
}

/**
 * Displays EUI benchmarking context to help users understand what the calculated EUI means.
 * This component is read-only and uses existing calculated values only.
 */
export default function EUIBenchmarkContext({
  annualEnergyUse,
  floorArea,
  businessType,
}: EUIBenchmarkContextProps) {
  if (!businessType || floorArea <= 0 || annualEnergyUse <= 0) {
    return null;
  }

  // Calculate EUI from existing values (read-only, using Phase 0 calculation method)
  const eui = annualEnergyUse / floorArea;

  // Get benchmark range for this building type
  const benchmarkRange = EUI_BENCHMARK_RANGES[businessType];
  if (!benchmarkRange) {
    return null;
  }

  // Get contextual label
  const contextLabel = getEUIContextLabel(eui, benchmarkRange);

  // Determine badge color based on context (neutral colors, not judgmental)
  const getBadgeColor = () => {
    switch (contextLabel) {
      case "Below Typical Range":
        return "bg-blue-100 text-blue-800";
      case "Within Typical Range":
        return "bg-green-100 text-green-800";
      case "Above Typical Range":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        Energy Use Intensity (EUI) Context
        <InfoTooltip 
          content="EUI measures energy use per square foot (kWh/sf/year). It allows comparison of your building's efficiency against typical buildings of the same type, regardless of size."
          position="right"
        />
      </h3>
      
      <div className="space-y-6">
        {/* EUI Value and Benchmark Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Calculated EUI
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {eui.toFixed(1)} kWh/sq ft/year
            </div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {benchmarkRange.label}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {benchmarkRange.min}–{benchmarkRange.max} kWh/sq ft/year
            </div>
          </div>
        </div>

        {/* Contextual Label */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Performance Context:</span>
          <span
            className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${getBadgeColor()}`}
          >
            {contextLabel}
          </span>
        </div>

        {/* Explanatory Text */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            EUI provides a normalized view of energy use relative to building size. Typical ranges vary based on building usage patterns, operating hours, and equipment mix. These benchmark ranges are indicative reference values and do not represent regulatory standards or performance guarantees.
          </p>
        </div>
      </div>
    </div>
  );
}

