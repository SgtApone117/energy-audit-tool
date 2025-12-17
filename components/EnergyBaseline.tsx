interface EnergyBaselineProps {
  annualEnergyUse: number;
  annualEnergyCost: number | null;
}

export default function EnergyBaseline({
  annualEnergyUse,
  annualEnergyCost,
}: EnergyBaselineProps) {
  return (
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Baseline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Estimated Annual Energy Use</div>
          <div className="text-2xl font-semibold text-gray-900">
            {annualEnergyUse.toLocaleString()} kWh/year
          </div>
        </div>
        {annualEnergyCost !== null && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Estimated Annual Energy Cost</div>
            <div className="text-2xl font-semibold text-gray-900">
              ${annualEnergyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

