# Energy Audit Tool — Calculations Reference

This document summarizes all formulas, metrics, and numeric outputs computed across the codebase. Each item lists purpose, formula, units, inputs/outputs, and source references.

## Baseline & EUI

- **Base EUI:** `EUI_LOOKUP[businessType]` (kWh/ft²·yr). Used as baseline Energy Use Intensity.
  - Source: [lib/data.ts](lib/data.ts)
- **Construction Year Adjustment:** `CONSTRUCTION_YEAR_ADJUSTMENTS[constructionYear]` multiplier.
  - Values: Before 2000 → 1.15; 2000–2010 → 1.00; After 2010 → 0.90.
  - Source: [lib/calculations.ts](lib/calculations.ts#L10)
- **Climate Adjustment:** `getClimateAdjustment(stateCode)` multiplier based on climate zone.
  - Zones multipliers: Hot 1.15, Warm 1.05, Mixed 1.00, Cool 1.10, Cold 1.20.
  - Source: [lib/data/climateZones.ts](lib/data/climateZones.ts#L90)
- **Adjusted EUI:** `adjustedEUI = baseEUI * constructionAdjustment * climateAdjustment` (kWh/ft²·yr).
  - Source: [lib/calculations.ts](lib/calculations.ts#L83)
- **Annual Energy Use (Adjusted):** `annualEnergyUse = adjustedEUI * floorArea` (kWh/yr).
  - Source: [lib/calculations.ts](lib/calculations.ts#L86)
- **Annual Energy Use (Simple):** `annualEnergyUse = EUI_LOOKUP[businessType] * floorArea` when no adjustments.
  - Source: [lib/calculations.ts](lib/calculations.ts#L119)

## Utility Analysis

- **Totals From Monthly Bills:**
  - `totalElectricityKwh = Σ month.electricityKwh`
  - `totalElectricityCost = Σ month.electricityCost`
  - `totalGasUsage = Σ month.gasUsage` (therms)
  - `totalGasCost = Σ month.gasCost`
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L13)
- **Therm → kWh Conversion:** `gasKwh = therms * THERM_TO_KWH` where `THERM_TO_KWH = 29.3`.
  - Source: [lib/utility/types.ts](lib/utility/types.ts#L51)
- **Actual EUI (Electric-only):** `electricEUI = totalElectricityKwh / floorArea` (kWh/ft²·yr).
- **Combined EUI (Elec + Gas):** `combinedEUI = (totalElectricityKwh + totalGasUsage*29.3) / floorArea`.
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L38)
- **Actual vs Estimated Comparison:**
  - `varianceKwh = actualKwh - estimatedKwh`
  - `variancePercent = (varianceKwh / estimatedKwh) * 100`
  - `actualEUI = actualKwh / floorArea`; `estimatedEUI = estimatedKwh / floorArea`
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L57)
- **Average Rates From Bills:**
  - Electricity: `avgRate = totalCost / totalKwh` (default 0.14 if `totalKwh<=0`).
  - Gas: `avgRate = totalCost / totalTherms` (default 1.2 if `totalTherms<=0`).
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L165), [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L176)
- **Annualize Partial Data:** `annualized = (totalValue / monthsEntered) * 12` if months < 12.
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L187)
- **Seasonal Patterns (Electricity):** `summerAvg`, `winterAvg`, `shoulderAvg`, `peakMonth`, `peakUsage` via monthly grouping/avg.
  - Source: [lib/utility/utilityAnalysis.ts](lib/utility/utilityAnalysis.ts#L199)

## Utility Rates & Costs

- **Default Electricity Rate:** `DEFAULT_ELECTRICITY_RATE = 0.15` ($/kWh).
  - Source: [lib/data.ts](lib/data.ts#L17)
- **State Utility Rates:** `STATE_UTILITY_RATES[state]` → `{ electricity $/kWh, gas $/therm }` and helpers.
  - Source: [lib/data/utilityRates.ts](lib/data/utilityRates.ts)
- **Effective Electricity Rate:** `getEffectiveElectricityRate(stateCode)` picks state or default.
  - Source: [lib/calculations.ts](lib/calculations.ts#L155)
- **Annual Energy Cost:** `annualEnergyCost = annualEnergyUse * rate` ($/yr).
  - Source: [lib/calculations.ts](lib/calculations.ts#L137)

## Operating Schedule

- **Daily Hours:** `hours = endHour - startHour` with 24/7 and invalid checks.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L14)
- **Weekly Hours:** `hoursPerWeek = Σ dailyHours[Mon..Sun]`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L24)
- **Days Per Week:** `daysPerWeek = count(open days)`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L33)
- **Annual Operating Hours:** `annualOperatingHours = hoursPerWeek*52 - (hoursPerWeek/7)*holidays`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L40)
- **Schedule Metrics:** returns `hoursPerWeek`, `daysPerWeek`, `annualOperatingHours`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L52)
- **Schedule Adjustment Factor:** `adj = baseLoad(0.3) + operatingLoad(0.7)*hoursRatio`; `hoursRatio = actual/standard`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L70)
- **Seasonal HVAC Adjustment:** weighted average of `hvacIntensityMultiplier` by season weights (Summer 3, Winter 3, Spring/Fall 6).
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L110)
- **Occupancy-Adjusted Energy:** `adjusted = baseEnergyKwh * [0.4 + 0.6*averageOccupancyRate]`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L131)
- **Breakdown Adjusted For Schedule:**
  - HVAC: `value * scheduleFactor * hvacFactor`
  - Lighting: `value * scheduleFactor`
  - Refrigeration: unchanged (24/7)
  - Other (plug loads/process): `value * averageOccupancyRate`
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L164)

## Equipment-Based Energy

- **HVAC Energy (Annual kWh):**
  - Capacity to kW: tons→`*3.517`; BTU/hr→`/3412`; kW→as-is.
  - Efficiency factor: `benchmark.average / unit.efficiencyRating` (higher is better).
  - Age factor: `1 + max(0, age-10)*0.02`.
  - Condition factor: Excellent 0.95, Good 1.0, Fair 1.1, Poor 1.25.
  - EFLH: Cooling 1000 h/yr; Heating 800 h/yr (electric heating only).
  - Cooling: `capacityKw * 1000 * efficiencyFactor * ageFactor * conditionFactor`
  - Heating: `capacityKw*0.8 * 800 * ageFactor * conditionFactor` if electric.
  - Total annual kWh: rounded sum.
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L14)
- **Lighting Energy (Annual kWh):**
  - `totalKw = (fixtureCount*wattsPerFixture*lampsPerFixture)/1000`
  - `hoursPerYear = hoursPerDay * daysPerWeek * 52`
  - Control factors: Manual 1.0, Occupancy 0.7, Daylight 0.75, Timer 0.85, Dimmer 0.8, Smart 0.65, None 1.1.
  - `annualKwh = totalKw * hoursPerYear * controlFactor` (rounded).
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L84)
- **Major Equipment Energy (Annual kWh):**
  - `hoursPerYear = hoursPerDay * daysPerWeek * 52`
  - `vfdFactor = hasVFD ? 0.75 : 1.0`
  - Condition factor: Excellent 0.95, Good 1.0, Fair 1.1, Poor 1.25.
  - Load factors by type (examples): Walk-in Cooler 0.6, Freezer 0.65, Display Case 0.7–0.75, Ice Machine 0.5, Motor 0.65, Pump 0.55, Data Center 0.85.
  - `annualKwh = powerRating * quantity * hoursPerYear * loadFactor * vfdFactor * conditionFactor` (rounded).
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L113)
- **Equipment Totals:**
  - `totalHVACCapacity` (tons) via unit conversion.
  - `totalLightingWattage = Σ (fixtureCount * wattsPerFixture * lampsPerFixture)`.
  - `totalMajorEquipmentLoad = Σ (powerRating * quantity)`.
  - `estimatedAnnualHVACKwh`, `estimatedAnnualLightingKwh`, `estimatedAnnualEquipmentKwh` via above calculators.
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L164)
- **Equipment vs EUI Estimate:** `variance = equipmentBasedKwh - euiBasedKwh`; `variancePercent = variance / euiBasedKwh * 100`.
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L219)

## End-Use Breakdown

- **Default Breakdown:** `END_USE_BREAKDOWN[businessType]` percentages to categories.
  - Source: [lib/data.ts](lib/data.ts#L20)
- **Computed Breakdown:** `categoryEnergy = annualEnergyUse * percentage` for each category.
  - Source: [lib/calculations.ts](lib/calculations.ts#L161)
- **Enhanced Breakdown (with Equipment):** Uses equipment-derived kWh for categories when present, else defaults.
  - Tracks `sources` and `totalFromEquipment`.
  - Source: [lib/calculations.ts](lib/calculations.ts#L196)

## ECM Calculations (Basic)

- For each ECM in `ECM_DEFINITIONS` affecting `endUseCategory`:
  - `energySaved = categoryEnergy * savingsPercentage`
  - `costSaved = energySaved * electricityRate`
  - `implementationCost = floorArea * costPerSqFt`
  - `paybackPeriod = implementationCost / costSaved` (Infinity if `costSaved<=0`).
  - Priority: High (<2 yr), Medium (≤4 yr), Low (>4 yr).
  - Source: [lib/calculations.ts](lib/calculations.ts#L270)

## ECM Calculations (Enhanced)

- **Savings Ranges:** `energySaved.{low,typical,high} = categoryEnergy * savings%`.
- **Cost Savings Ranges:** multiply savings by `electricityRate`.
- **Implementation Cost Ranges:** `floorArea * costPerSqFt.{low,typical,high}`.
- **Rebate Estimate:** either per sq ft (`floorArea * amount`) or percentage (`typicalCost * amount`).
- **Net Cost Ranges:** `implementationCost - estimatedRebate` (floored at 0).
- **Payback Ranges:** `netCost.{•} / costSaved.{•}` with best/worst alignment.
- **Interactive Effects:** apply `effectMultiplier` across categories; adds `interactiveSavingsBonus` to cost savings.
- **Totals:** ranges for energy, cost savings, implementation cost, net cost; blended payback computed from totals.
  - Source: [lib/ecm/ecmCalculations.ts](lib/ecm/ecmCalculations.ts#L111)

## Report Aggregates

- **EUI:** `eui = annualEnergyUse / floorArea` (if both > 0).
- **Total Energy Savings:** `Σ ecm.energySaved`.
- **Total Cost Savings:** `Σ ecm.costSaved`.
- **Total Implementation Cost:** `Σ ecm.implementationCost`.
- **Blended Payback:** `totalImplementationCost / totalCostSavings` (Infinity if zero).
  - Source: [lib/reportGenerator.ts](lib/reportGenerator.ts#L48)

## Insights (Derived Display Metrics)

- **Largest End-Use:** category with max `endUseBreakdown[category]`.
- **Highest Priority ECM:** shortest `paybackPeriod` among ECMs.
- **Total Potential Annual Savings:** `Σ ecm.costSaved` and percent of `annualEnergyCost`.
- **Largest Single Energy Savings ECM:** max `ecm.energySaved`.
  - Source: [lib/insights/auditInsights.ts](lib/insights/auditInsights.ts#L18)

## Constants & Conversions

- **Therm to kWh:** `29.3`.
  - Source: [lib/utility/types.ts](lib/utility/types.ts#L52)
- **Electricity Rate (Default):** `$0.15` per kWh.
  - Source: [lib/data.ts](lib/data.ts#L17)
- **Climate Zone Multipliers:** Hot `1.15`, Warm `1.05`, Mixed `1.00`, Cool `1.10`, Cold `1.20`.
  - Source: [lib/data/climateZones.ts](lib/data/climateZones.ts#L27)
- **Schedule Factors:** Base load `0.3`, Operating load `0.7`.
  - Source: [lib/schedule/scheduleCalculations.ts](lib/schedule/scheduleCalculations.ts#L70)
- **EFLH Defaults:** Cooling `1000` h/yr, Heating `800` h/yr.
  - Source: [lib/equipment/equipmentCalculations.ts](lib/equipment/equipmentCalculations.ts#L65)

---

If you want, I can add any missing units/assumptions inline next to each formula or generate a printable PDF from this.
