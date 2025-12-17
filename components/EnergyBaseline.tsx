interface EnergyBaselineProps {
  annualEnergyUse: number;
  annualEnergyCost: number | null;
}

export default function EnergyBaseline({
  annualEnergyUse,
  annualEnergyCost,
}: EnergyBaselineProps) {
  return (
    <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg border border-blue-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Energy Baseline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Estimated Annual Energy Use</div>
          <div className="text-3xl font-bold text-gray-900">
            {annualEnergyUse.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">kWh/year</div>
        </div>
        {annualEnergyCost !== null && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Estimated Annual Energy Cost</div>
            <div className="text-3xl font-bold text-gray-900">
              ${annualEnergyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 mt-1">/year</div>
          </div>
        )}
      </div>
    </div>
  );
}

