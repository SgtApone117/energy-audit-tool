import { InfoTooltip } from "./ui/Tooltip";

interface EnergyBaselineProps {
  annualEnergyUse: number;
  annualEnergyCost: number | null;
}

export default function EnergyBaseline({
  annualEnergyUse,
  annualEnergyCost,
}: EnergyBaselineProps) {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg border border-blue-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        Energy Baseline
        <InfoTooltip 
          content="Your building's estimated annual energy consumption and cost. This baseline is calculated from EUI benchmarks adjusted for building age, climate zone, and location-specific utility rates."
          position="right"
        />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            Estimated Annual Energy Use
            <InfoTooltip content="Total electricity consumption estimate in kilowatt-hours per year, based on building type and size." />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {annualEnergyUse.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">kWh/year</div>
        </div>
        {annualEnergyCost !== null && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              Estimated Annual Energy Cost
              <InfoTooltip content="Estimated annual electricity cost using state-average utility rates based on your ZIP code." />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${annualEnergyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 mt-2">/year</div>
          </div>
        )}
      </div>
    </div>
  );
}
