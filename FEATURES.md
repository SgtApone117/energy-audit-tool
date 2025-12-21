# Energy Audit Tool — Features & Input/Output Reference

Complete guide to all features, inputs, outputs, calculations, and available options.

---

## Table of Contents
1. [Phase 0: Building Information](#phase-0-building-information)
2. [Phase A: Utility Bill Analysis](#phase-a-utility-bill-analysis)
3. [Phase B: Operating Schedule](#phase-b-operating-schedule)
4. [Phase C: Equipment Inventory](#phase-c-equipment-inventory)
5. [Energy Baseline & Comparison](#energy-baseline--comparison)
6. [Energy Conservation Measures (ECMs)](#energy-conservation-measures-ecms)
7. [Report & Insights](#report--insights)
8. [Reference Tables](#reference-tables)

---

## Phase 0: Building Information

### Purpose
Capture basic building characteristics to establish baseline energy use and site-specific utility rates.

### Inputs

| Field | Type | Required | Options/Constraints | Description |
|-------|------|----------|-------------------|-------------|
| **Building Name** | Text | No | Any string | Identifier for the audit (optional) |
| **Business Type** | Select | Yes | See [Business Types](#business-types-options) | Determines EUI baseline, end-use breakdown, schedules |
| **Floor Area** | Number | Yes | > 0 sq ft | Total conditioned floor area (used to scale all energy metrics) |
| **ZIP Code** | Text | No | 5-digit US ZIP | Determines state → climate zone → adjustment factor & utility rates |
| **Construction Year** | Select | No | See [Construction Years](#construction-year-options) | Adjusts EUI for building envelope efficiency |
| **Primary Heating Fuel** | Select | No | See [Fuel Types](#fuel-type-options) | For future emissions & heating cost calculations |
| **Secondary Fuel** | Select | No | See [Fuel Types](#fuel-type-options) + None | For backup heating systems |

### Outputs (Calculated)

| Metric | Formula | Units | Note |
|--------|---------|-------|------|
| **Base EUI** | `EUI_LOOKUP[businessType]` | kWh/ft²/yr | Typical energy use intensity for building type |
| **Construction Adjustment** | `CONSTRUCTION_YEAR_ADJUSTMENTS[year]` | Multiplier | Before 2000 → 1.15; 2000–2010 → 1.00; After 2010 → 0.90 |
| **Climate Adjustment** | `CLIMATE_ZONE_ADJUSTMENTS[state]` | Multiplier | Hot 1.15, Warm 1.05, Mixed 1.00, Cool 1.10, Cold 1.20 |
| **Adjusted EUI** | `baseEUI * construction * climate` | kWh/ft²/yr | Site-specific baseline accounting for age & location |
| **Annual Energy Use** | `adjustedEUI * floorArea` | kWh/yr | Estimated baseline consumption |
| **Utility Rates** | Lookup by state | $/kWh, $/therm | State-average electricity & gas rates |
| **Annual Energy Cost** | `annualEnergyUse * electricityRate` | $ | Estimated annual utility spend |

### Key Options

#### Business Type Options
```
- Office
- Retail
- Restaurant / Food Service
- Grocery / Food Market
- Warehouse / Inventory
- K–12 School
- Lodging / Hospitality
- Industrial Manufacturing
- Other
```

#### Construction Year Options
```
- Before 2000 (1.15x adjustment)
- 2000–2010 (1.00x baseline)
- After 2010 (0.90x more efficient)
```

#### Fuel Type Options
```
- Electric
- Natural Gas
- Fuel Oil
- Propane
- None (for secondary fuel)
```

---

## Phase A: Utility Bill Analysis

### Purpose
Compare actual utility consumption (from bills) against the EUI-based estimate to assess real performance.

### Inputs

#### Monthly Utility Data (12 months)

| Field | Type | Required | Constraints | Unit | Description |
|-------|------|----------|-------------|------|-------------|
| **Electricity (kWh)** | Number | Optional | ≥ 0 | kWh | Monthly electricity consumption |
| **Electricity Cost ($)** | Number | Optional | ≥ 0 | $ | Monthly electricity charges |
| **Gas Usage (therms)** | Number | Optional | ≥ 0 | therms | Monthly natural gas consumption |
| **Gas Cost ($)** | Number | Optional | ≥ 0 | $ | Monthly gas charges |

**Note:** At least one month of electricity data required for validation; full 12 months recommended for accuracy.

### Outputs (Calculated)

| Metric | Formula | Units | Notes |
|--------|---------|-------|-------|
| **Total Electricity (Annual)** | `Σ month.electricityKwh` | kWh | Sum of 12 months |
| **Total Electricity Cost** | `Σ month.electricityCost` | $ | Sum of 12 months |
| **Total Gas Usage** | `Σ month.gasUsage` | therms | Sum of 12 months |
| **Total Gas Cost** | `Σ month.gasCost` | $ | Sum of 12 months |
| **Actual EUI (Electric)** | `totalElectricityKwh / floorArea` | kWh/ft²/yr | Actual electricity-only intensity |
| **Combined EUI** | `(totalElectricity + totalGas*29.3) / floorArea` | kWh-eq/ft²/yr | Converts gas to kWh (1 therm = 29.3 kWh) |
| **Average Elec Rate** | `totalCost / totalKwh` | $/kWh | Derived from actual bills (default 0.14 if zero kWh) |
| **Average Gas Rate** | `totalCost / totalTherms` | $/therm | Derived from actual bills (default 1.20 if zero therms) |

### Variance Analysis

| Metric | Formula | Units | Assessment |
|--------|---------|-------|-----------|
| **Variance (kWh)** | `actualKwh - estimatedKwh` | kWh | Positive = using more than estimate |
| **Variance (%)** | `(varianceKwh / estimatedKwh) * 100` | % | Performance vs baseline |
| **Assessment** | Multi-tiered interpretation | — | >20% over → high savings potential; <-20% under → efficient |

**Assessment Thresholds:**
- **< -20%:** Significantly lower than typical (excellent performance)
- **-20% to -10%:** Moderately lower (above average)
- **-10% to +10%:** Within expected range (as typical)
- **+10% to +20%:** Moderately higher (improvement opportunities)
- **> +20%:** Significantly higher (substantial savings potential)

### Seasonal Analysis

| Metric | Calculation | Purpose |
|--------|-----------|---------|
| **Summer Avg (Jun–Aug)** | `Σ(June+July+Aug) / 3` | Cooling-dominated period |
| **Winter Avg (Dec–Feb)** | `Σ(Dec+Jan+Feb) / 3` | Heating-dominated period |
| **Shoulder Avg (Mar–May, Sep–Nov)** | `Σ seasonal months / 6` | Mild weather period |
| **Peak Month** | `max(month.electricityKwh)` | Highest-use month (guides HVAC focus) |

---

## Phase B: Operating Schedule

### Purpose
Define actual building operating hours and occupancy to adjust baseline energy use for part-time or variable-occupancy facilities.

### Inputs

#### Weekly Schedule

| Field | Type | Options | Default | Description |
|-------|------|---------|---------|-------------|
| **Monday–Sunday (each)** | | | Varies by type | Daily operating schedule |
| —— Open Status | Checkbox | Yes/No | Type-dependent | Is building open that day? |
| —— Start Hour | Select | 0–23 | Type-dependent | Opening hour (24-hr) |
| —— End Hour | Select | 0–23 | Type-dependent | Closing hour (can be 24 for 24/7) |

**Default Schedules by Business Type:**
- **Office:** 8 AM–6 PM Mon–Fri, closed weekends
- **Retail:** 10 AM–8 PM Mon–Thu, 10 AM–9 PM Fri, 10 AM–6 PM Sat, 11 AM–5 PM Sun
- **Restaurant/Food Service:** 10 AM–10 PM most days, later Fri–Sat
- **Grocery/Food Market:** 7 AM–10 PM daily (7 days)
- **Warehouse:** 8 AM–6 PM Mon–Fri, closed weekends
- **K–12 School:** 7 AM–4 PM Mon–Fri, closed weekends
- **Lodging/Hospitality:** 24/7 (0–24 every day)
- **Industrial Manufacturing:** 7 AM–6 PM Mon–Fri, closed weekends

#### Seasonal Variations

| Field | Type | Range | Default | Description |
|-------|------|-------|---------|-------------|
| **Season** | Select | Summer / Winter / Spring/Fall | All three | Time period for adjustment |
| **Occupancy Multiplier** | Number | 0.0–1.5 | 1.0 | Scales plug load energy (0=empty, 1=full, 1.5=overcrowded) |
| **HVAC Intensity Multiplier** | Number | 0.5–2.0 | Season-based | Scales HVAC load (0.5=mild, 2.0=extreme) |

### Outputs (Calculated)

| Metric | Formula | Units | Notes |
|--------|---------|-------|-------|
| **Daily Hours (per day)** | `endHour - startHour` | hours | For each open day; 0 if closed |
| **Weekly Hours** | `Σ dailyHours[Mon..Sun]` | hours/week | Total operating hours per week |
| **Days Per Week** | `count(isOpen=true)` | days | Operating days per 7-day cycle |
| **Annual Operating Hours** | `hoursPerWeek*52 - (hoursPerWeek/7)*holidays` | hours/yr | Accounts for ~10 holidays |
| **Schedule Adjustment Factor** | `0.3 + 0.7*(actualHours/standardHours)` | Multiplier | Compares to business-type standard |
| **Seasonal HVAC Factor** | Weighted avg of multipliers | Multiplier | Affects HVAC-related breakdowns |
| **Occupancy-Adjusted Energy** | `baseEnergy * [0.4 + 0.6*occupancyRate]` | kWh/yr | Scales plug load by occupancy |

### Schedule Impact on End-Use Breakdown

| Category | Adjustment Applied |
|----------|-------------------|
| **HVAC** | `value * scheduleFactor * hvacSeasonalFactor` |
| **Lighting** | `value * scheduleFactor` |
| **Plug Loads** | `value * occupancyRate` |
| **Refrigeration** | `value` (unchanged; runs 24/7) |
| **Process** | `value * occupancyRate` |

---

## Phase C: Equipment Inventory

### Purpose
Itemize specific HVAC, lighting, and major equipment to estimate energy consumption and identify targeted efficiency improvements.

### Inputs

#### HVAC Equipment

| Field | Type | Options | Constraints | Unit | Description |
|-------|------|---------|-------------|------|-------------|
| **System Type** | Select | See [HVAC Types](#hvac-system-types) | Required | — | Equipment category |
| **Manufacturer** | Text | Any | Optional | — | Brand/model tracking |
| **Capacity** | Number | > 0 | Required | tons/BTU/kW | Cooling/heating capacity |
| **Capacity Unit** | Select | tons / BTU/hr / kW | Required | — | Unit for capacity value |
| **Age** | Number | 0–60+ | Required | years | Equipment age (affects efficiency degradation) |
| **Condition** | Select | Excellent / Good / Fair / Poor | Required | — | Maintenance state |
| **Efficiency Rating** | Number | > 0 | Optional | SEER/EER/AFUE/COP | Performance rating |
| **Efficiency Unit** | Select | SEER / EER / AFUE / COP / HSPF | Optional | — | Efficiency metric type |
| **Fuel Type** | Select | Electric / Nat Gas / Fuel Oil / Propane | Required | — | Energy source |
| **Smart Thermostat** | Checkbox | Yes/No | Optional | — | Has programmable/smart control? |

**HVAC System Type Options:**
```
- Packaged Rooftop Unit (common commercial)
- Split System (common residential/light commercial)
- Chiller (large buildings)
- Boiler (heating)
- Heat Pump (heating/cooling, electric)
- Window AC (small supplemental)
- PTAC (packaged terminal, hotel rooms)
- VRF System (high-end variable refrigerant)
- Furnace (heating only, fossil fuel)
- Other
```

#### Lighting Zones

| Field | Type | Options | Constraints | Unit | Description |
|-------|------|---------|-------------|------|-------------|
| **Zone Name** | Text | Any | Optional | — | Area identifier (e.g., "Main Office") |
| **Fixture Type** | Select | See [Lighting Types](#lighting-fixture-types) | Required | — | Bulb/fixture technology |
| **Fixture Count** | Number | ≥ 0 | Required | count | Number of fixtures in zone |
| **Watts Per Fixture** | Number | > 0 | Required | watts | Nameplate wattage per fixture |
| **Lamps Per Fixture** | Number | ≥ 1 | Required | count | Bulbs per fixture (e.g., 4 in T8 pendant) |
| **Control Type** | Select | See [Lighting Controls](#lighting-control-types) | Required | — | Occupancy, daylight, timer, etc. |
| **Hours Per Day** | Number | 0–24 | Required | hours | Daily operating hours |
| **Days Per Week** | Number | 0–7 | Required | days | Weekly operating days |
| **Exterior** | Checkbox | Yes/No | Optional | — | Outdoor (parking, signage)? |

**Lighting Fixture Type Options:**
```
- LED (most efficient)
- Fluorescent T8 (efficient, standard)
- Fluorescent T12 (older, less efficient)
- Fluorescent T5 (high-bay, efficient)
- CFL (compact fluorescent, residential)
- Incandescent (very inefficient)
- Halogen (moderately inefficient)
- Metal Halide (HID, high-bay)
- High Pressure Sodium (HID, parking)
- Other
```

**Lighting Control Type Options:**
```
- Manual Switch (1.0x – baseline)
- Occupancy Sensor (0.7x – 30% savings)
- Daylight Sensor (0.75x – 25% savings)
- Timer (0.85x – 15% savings)
- Dimmer (0.8x – 20% savings)
- Smart Control (0.65x – 35% savings)
- None (1.1x – 10% penalty)
```

#### Major Equipment

| Field | Type | Options | Constraints | Unit | Description |
|-------|------|---------|-------------|------|-------------|
| **Equipment Type** | Select | See [Equipment Types](#major-equipment-types) | Required | — | Equipment category |
| **Description** | Text | Any | Optional | — | Specific model/location notes |
| **Quantity** | Number | ≥ 1 | Required | count | Units in use |
| **Power Rating** | Number | > 0 | Required | kW | Nameplate power draw |
| **Age** | Number | 0–50+ | Optional | years | Equipment age |
| **Hours Per Day** | Number | 0–24 | Required | hours | Daily run time |
| **Days Per Week** | Number | 0–7 | Required | days | Weekly operation days |
| **Condition** | Select | Excellent / Good / Fair / Poor | Required | — | Maintenance state |
| **Has VFD** | Checkbox | Yes/No | Optional | — | Variable Frequency Drive (motor control)? |

**Major Equipment Type Options:**
```
Refrigeration:
- Walk-in Cooler (0.6 load factor)
- Walk-in Freezer (0.65)
- Display Case (Refrigerated) (0.7)
- Display Case (Frozen) (0.75)
- Ice Machine (0.5)
- Commercial Refrigerator (0.5)
- Commercial Freezer (0.55)

Motors & Pumps:
- Air Compressor (0.6)
- Electric Motor (0.65)
- Pump (0.55)
- Conveyor (0.4)

Food Service:
- Industrial Oven (0.5)
- Commercial Kitchen Equipment (0.4)

Other:
- Data Center / Server Room (0.85)
- Electric Vehicle Charger (0.3)
- Other (0.5 default)
```

### Equipment Outputs (Calculated)

#### HVAC Energy Calculation
```
Formula: capacityKw * EFLH * efficiencyFactor * ageFactor * conditionFactor

Where:
- capacityKw = converted from tons/BTU/kW
- EFLH = equivalent full load hours (1000 cooling, 800 heating)
- efficiencyFactor = benchmark / unitRating (normalizes to avg efficiency)
- ageFactor = 1.0 + max(0, age-10)*0.02 (degrades 2%/yr after 10 yrs)
- conditionFactor = Excellent 0.95, Good 1.0, Fair 1.1, Poor 1.25

Result: Annual kWh for cooling + heating (if electric)
```

#### Lighting Energy Calculation
```
Formula: (fixtureCount * wattsPerFixture * lampsPerFixture / 1000) * hoursPerYear * controlFactor

Where:
- totalKw = all fixtures in zone
- hoursPerYear = hoursPerDay * daysPerWeek * 52
- controlFactor = manual 1.0, occupancy 0.7, daylight 0.75, timer 0.85, dimmer 0.8, smart 0.65, none 1.1

Result: Annual kWh for lighting zone
```

#### Major Equipment Energy Calculation
```
Formula: powerRating * quantity * hoursPerYear * loadFactor * vfdFactor * conditionFactor

Where:
- hoursPerYear = hoursPerDay * daysPerWeek * 52
- loadFactor = equipment-type specific (0.3–0.85)
- vfdFactor = 0.75 (with VFD) or 1.0 (without)
- conditionFactor = Excellent 0.95, Good 1.0, Fair 1.1, Poor 1.25

Result: Annual kWh for equipment item
```

#### Equipment Summaries
| Metric | Calculation | Units |
|--------|------------|-------|
| **Total HVAC Capacity** | Sum of all units (converted to tons) | tons |
| **Total Lighting Wattage** | Sum of (count * watts * lamps) | watts |
| **Total Equipment Load** | Sum of (powerRating * quantity) | kW |
| **Est. Annual HVAC** | `calculateHVACEnergy(hvacUnits)` | kWh/yr |
| **Est. Annual Lighting** | `calculateLightingEnergy(lightingZones)` | kWh/yr |
| **Est. Annual Equipment** | `calculateMajorEquipmentEnergy(equipment)` | kWh/yr |

#### Equipment vs EUI Variance
```
variance = equipmentBasedKwh - euiBasedKwh
variancePercent = (variance / euiBasedKwh) * 100

Assessment:
- Within ±15%: Reasonable alignment
- >+15%: Equipment is less efficient than typical (old/poor condition)
- <-15%: Equipment is more efficient than typical (new/well-maintained)
```

---

## Energy Baseline & Comparison

### Overview
Integrates building info, utility data, schedule, and equipment to establish comprehensive baseline and compare actual vs estimated performance.

### Key Calculations

#### End-Use Breakdown (Standard)
```
For each category in END_USE_BREAKDOWN[businessType]:
  categoryEnergy = annualEnergyUse * percentage

Results in: HVAC (%), Lighting (%), Plug Loads (%), Refrigeration (%), etc.
```

#### Enhanced End-Use Breakdown (with Equipment)
```
For each category:
  IF equipment data exists AND has calculated kWh:
    use equipment-derived kWh (HVAC, Lighting, or major equipment)
  ELSE:
    use annualEnergyUse * defaultPercentage
  
Tracks sources ("equipment" vs "estimated") and totals.
```

#### Schedule-Adjusted Breakdown
```
After calculating base breakdown:
  HVAC: value * scheduleFactor * hvacSeasonalFactor
  Lighting: value * scheduleFactor
  Refrigeration: value (unchanged)
  Other: value * occupancyRate
```

---

## Energy Conservation Measures (ECMs)

### Purpose
Identify and quantify potential energy-saving projects with cost, savings, payback, and confidence ranges.

### Basic ECM Features

#### Inputs Required
- Business type (determines applicable ECMs)
- End-use breakdown (determines energy available to save)
- Floor area (scales implementation costs)
- Electricity rate (for cost savings)

#### Basic ECM Output

| Metric | Formula | Units | Note |
|--------|---------|-------|------|
| **Energy Saved** | `categoryEnergy * savingsPercentage` | kWh/yr | Annual usage reduction |
| **Cost Saved** | `energySaved * electricityRate` | $/yr | Annual cost reduction |
| **Implementation Cost** | `floorArea * costPerSqFt` | $ | Total upgrade cost |
| **Payback Period** | `implementationCost / costSaved` | years | Years to break even (Infinity if no savings) |
| **Priority** | High if <2yr, Medium if ≤4yr, Low if >4yr | — | Funding priority ranking |

### Enhanced ECM Features (with Ranges & Rebates)

#### Enhanced Inputs
- Low/typical/high estimates for savings & costs
- Utility rebate programs
- Interactive effects with other ECMs
- Applicability filtering by building type

#### Enhanced ECM Output

| Metric | Type | Range | Example |
|--------|------|-------|---------|
| **Energy Saved** | 3-point estimate | low, typical, high | 5,000–12,000 kWh/yr |
| **Cost Saved** | 3-point estimate | low, typical, high | $600–1,440/yr |
| **Implementation Cost** | 3-point estimate | low, typical, high | $15,000–25,000 |
| **Estimated Rebate** | Fixed | — | $2,500 |
| **Net Cost** | 3-point estimate | low, typical, high | $10,000–20,000 after rebate |
| **Payback Period** | 3-point range | low, typical, high | 7–33 years (or Infinity) |
| **Complexity** | Category | Low / Medium / High | Affects installation timeline |
| **Lifespan** | Years | — | 10–25 years typical |
| **Interactive Effects** | List | — | LED → reduces cooling → HVAC bonus |

### Available ECMs (Examples)

#### Lighting ECMs
1. **LED Upgrade** (30–60% savings, $1.00–2.50/sqft, all building types)
2. **Lighting Controls** (5–30% savings via occupancy/daylight, $0.15–0.50/sqft)
3. **High-Bay Retrofit** (20–40% for warehouses, $0.30–0.80/sqft)
4. **Exterior Lighting** (10–30% for parking/signage, $0.50–1.50/sqft)

#### HVAC ECMs
1. **Equipment Replacement** (15–45% depending on type, $1.00–2.50/sqft)
2. **Smart Thermostat** (8–18% from scheduling, $0.05–0.20/sqft, all types)
3. **Tune-up / Optimization** (8–15% from maintenance, $0.10–0.35/sqft)
4. **Air Sealing & Insulation** (10–25% from envelope, $0.30–0.80/sqft)
5. **Ductless Heat Pump** (Variable, $1.50–4.00/sqft, subset of buildings)

#### Plug Load & Other ECMs
1. **Plug Load Management** (3–10%, $0.20–0.55/sqft)
2. **Appliance Upgrade** (Varies by type, $0.50–2.00/sqft)

#### Refrigeration ECMs (Grocery/Restaurant)
1. **Walk-in Replacement** (20–40%, $2.00–4.00/sqft, specialty)
2. **Condensing Unit Retrofit** (10–20%, $0.80–2.00/sqft)
3. **Night Blinds** (15–30%, $0.40–1.00/sqft)

### Interactive Effects

When multiple ECMs are implemented, some have secondary benefits:

| ECM 1 | Affects | ECM 2 | Multiplier | Benefit |
|-------|---------|-------|-----------|---------|
| LED Upgrade | Cooling Load | HVAC | 0.92 (8% reduction) | Warmer lighting → less AC |
| Building Insulation | HVAC | Variable | 0.85–0.95 | Reduced heating/cooling demand |
| HVAC Replacement | Plug Loads | Minor | 0.98 | Efficient units may reduce waste heat |

**Note:** Interactive savings are calculated and added as `interactiveSavingsBonus` to the typical cost savings.

### ECM Applicability by Building Type

| ECM | Office | Retail | Restaurant | Grocery | Warehouse | School | Hotel | Manuf. |
|-----|--------|--------|-----------|---------|-----------|--------|-------|--------|
| LED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Smart Thermostat | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HVAC Replacement | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Walk-in Cooler | — | — | ✓ | ✓ | — | — | — | — |
| Refrigeration | — | — | ✓ | ✓ | — | — | — | — |
| VFD Motors | — | — | — | — | ✓ | — | — | ✓ |
| Building Envelope | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Plug Load Control | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Report & Insights

### Purpose
Summarize audit findings and generate actionable recommendations.

### Report Contents

#### Executive Summary Metrics

| Metric | Source | Calculation | Units |
|--------|--------|-----------|-------|
| **Building Name & Type** | Input | — | — |
| **Floor Area** | Input | — | sq ft |
| **Location (ZIP)** | Input | — | — |
| **Baseline Annual Energy Use** | Calculation | `adjustedEUI * floorArea` | kWh/yr |
| **Calculated EUI** | Calculation | `annualEnergyUse / floorArea` | kWh/ft²/yr |
| **EUI Benchmark Range** | Lookup | Building-type specific | kWh/ft²/yr |
| **EUI Assessment** | Comparison | Below / Within / Above range | — |
| **Annual Energy Cost** | Calculation | `annualEnergyUse * rate` | $ |
| **Actual vs Estimated** | Comparison (if utility data) | Variance % & interpretation | % |

#### End-Use Breakdown Report

Shows percentage breakdown:
```
Lighting:     35% = X kWh/yr
HVAC:         40% = Y kWh/yr
Plug Loads:   25% = Z kWh/yr
Total:       100% = Total kWh/yr
```

#### Equipment Summary (if provided)
```
HVAC:      Σ tons, Σ kWh/yr, avg age, condition
Lighting:  Σ watts, Σ kWh/yr, control breakdown
Equipment: Σ items, Σ kW load, Σ kWh/yr
```

#### ECM Analysis & Recommendations

**For Each ECM:**
- Name, category, description
- Energy & cost savings (single estimate or ranges)
- Implementation cost & net cost (after rebates)
- Payback period
- Priority & complexity
- Equipment lifespan

**Aggregated Totals:**
- Total energy savings (kWh/yr)
- Total cost savings ($/yr)
- Total implementation cost ($)
- Total rebates ($)
- Blended payback period (years)
- Interactive effects bonus ($ if applicable)

### Automatic Insights Generated

| Insight | Trigger | Content |
|---------|---------|---------|
| **Largest End-Use** | Always | "HVAC is your largest energy consumer at X% (Y kWh/yr). Focus here for biggest impact." |
| **Highest Priority ECM** | If ECMs > 0 | "Smart Thermostat offers the shortest payback at X years and could save $Y/yr." |
| **Total Savings Potential** | If ECMs > 0 | "If all measures implemented, you could save $X/yr (Z% of current cost)." |
| **Largest Single Saving** | If ECMs > 1 | "LED Upgrade has the highest annual cost impact: $X/yr." |
| **Actual vs Estimated** | If utility data | "Your building uses X% [more/less] than typical. This suggests [efficiency/opportunities]." |
| **Schedule Impact** | If schedule data | "Your 50 hours/week schedule reduces energy vs 24/7 equivalent by ~X%." |
| **Equipment Condition** | If equipment data | "Your HVAC units average Y years old; replacement could yield Z% improvement." |

---

## Reference Tables

### Climate Zone Adjustment Multipliers

| Climate Zone | Adjustment | States | Description |
|--------------|-----------|--------|-------------|
| **Hot** | 1.15x | FL, HI, PR, AZ | High cooling demand |
| **Warm** | 1.05x | TX, LA, MS, AL, GA, SC, NV, NM, CA | Moderate cooling |
| **Mixed** | 1.00x | NC, TN, AR, OK, KS, MO, KY, VA, WV, MD, DE, DC, NJ | Balanced heating/cooling |
| **Cool** | 1.10x | CO, UT, ID, OR, WA, NE, IA, IL, IN, OH, PA, NY, CT, RI, MA | Moderate heating |
| **Cold** | 1.20x | MT, WY, ND, SD, MN, WI, MI, VT, NH, ME, AK | High heating demand |

### Construction Year Adjustments

| Period | Multiplier | Rationale |
|--------|-----------|-----------|
| **Before 2000** | 1.15x | Older building codes, less efficient envelope & equipment |
| **2000–2010** | 1.00x | Baseline reference |
| **After 2010** | 0.90x | Modern codes, better insulation & high-efficiency equipment |

### EUI Baseline by Building Type

| Building Type | Baseline EUI | Notes |
|---------------|-------------|-------|
| Office | 14 | Standard office with typical HVAC, lighting, plug loads |
| Retail | 17 | Higher lighting intensity (sales floor) |
| Restaurant / Food Service | 38 | Intense lighting, HVAC, cooking equipment |
| Grocery / Food Market | 50 | Very high due to extensive refrigeration (40% of total) |
| Warehouse / Inventory | 9 | Minimal HVAC, heavy lighting (distribution) |
| K–12 School | 13 | Extended hours in winter; heavy HVAC in summer |
| Lodging / Hospitality | 20 | 24/7 operation, hot water, guest rooms |
| Industrial Manufacturing | 24 | Process equipment varies widely by type |
| Other | 15 | Generic fallback |

### End-Use Breakdown Defaults (%)

| Building Type | Lighting | HVAC | Plug Loads | Refrigeration | Process | Other |
|---------------|----------|------|-----------|----------------|---------|-------|
| **Office** | 35% | 40% | 25% | — | — | — |
| **Retail** | 45% | 35% | 20% | — | — | — |
| **Restaurant** | 25% | 35% | 20% | 20% | — | — |
| **Grocery** | 25% | 25% | 10% | 40% | — | — |
| **Warehouse** | 55% | 25% | 20% | — | — | — |
| **School** | 30% | 45% | 25% | — | — | — |
| **Hotel** | 30% | 45% | 25% | — | — | — |
| **Manufacturing** | 20% | 30% | 20% | — | 30% | — |
| **Other** | 33% | 33% | 34% | — | — | — |

### Standard Operating Hours by Business Type

| Business Type | Hours/Week | Days/Week | Typical Schedule |
|---------------|-----------|-----------|-----------------|
| Office | 50 | 5 | 10 AM–6 PM Mon–Fri |
| Retail | 70 | 7 | 10 AM–8 PM most days |
| Restaurant | 84 | 7 | 10 AM–10 PM (later Fri–Sat) |
| Grocery | 105 | 7 | 7 AM–10 PM daily |
| Warehouse | 60 | 6 | 10 AM–6 PM Mon–Fri |
| School | 45 | 5 | 7 AM–4 PM Mon–Fri |
| Hotel | 168 | 7 | 24/7 operation |
| Manufacturing | 80 | 5 | 7 AM–6 PM Mon–Fri |
| Other | 50 | — | Assumed office-like |

### Condition Factor Multipliers

| Condition | HVAC/Equipment Factor | Meaning |
|-----------|----------------------|---------|
| **Excellent** | 0.95 | Well-maintained, new-like performance |
| **Good** | 1.00 | Normal maintenance, baseline efficiency |
| **Fair** | 1.10 | Deferred maintenance, ~10% efficiency loss |
| **Poor** | 1.25 | Neglected, significant degradation (~25% penalty) |

### Age Degradation (HVAC)

```
After 10 years of age:
  ageFactor = 1.0 + (age - 10) * 0.02

Example:
  15-year-old unit: 1.0 + (15-10)*0.02 = 1.10 (10% efficiency loss)
  20-year-old unit: 1.0 + (20-10)*0.02 = 1.20 (20% efficiency loss)
```

### HVAC Efficiency Benchmarks

| System Type | Benchmark (SEER/AFUE) | Notes |
|-------------|----------------------|-------|
| **Cooling (Split/Rooftop)** | 14 (SEER) | Minimum new code; higher = more efficient |
| **Heating (Electric Heat Pump)** | 8.5 (HSPF) | Moderate climate; cold climates lower |
| **Gas Furnace** | 0.90 (AFUE) | Federal minimum 90%; high-efficiency 95%+ |
| **Boiler** | 0.85 (AFUE) | Typical; condensing boilers 95%+ |

### Lighting Control Savings Factors

| Control Type | Factor | Annual Savings |
|--------------|--------|----------------|
| Manual Switch | 1.00x | Baseline (no reduction) |
| Occupancy Sensor | 0.70x | 30% savings |
| Daylight Sensor | 0.75x | 25% savings |
| Timer | 0.85x | 15% savings |
| Dimmer | 0.80x | 20% savings |
| Smart Control | 0.65x | 35% savings |
| None | 1.10x | 10% penalty (always on) |

### Utility Rates (Sample by State, 2023)

| State | Electricity ($/kWh) | Natural Gas ($/therm) | Notes |
|-------|---------------------|-----------------------|-------|
| **CA** | 0.18 | 1.45 | High-cost West Coast |
| **TX** | 0.11 | 1.10 | Low-cost, competitive |
| **NY** | 0.16 | 1.35 | Northeast, moderate-high |
| **IL** | 0.12 | 1.00 | Midwest, moderate |
| **FL** | 0.12 | — | No natural gas (uses electric) |
| **WA** | 0.11 | 0.95 | Low hydro power |
| **US Average** | 0.14 | 1.20 | Baseline default |

*(Rates are illustrative; actual rates vary by utility and season. The tool uses state-based averages.)*

### Conversion Factors

| Conversion | Factor | Note |
|-----------|--------|------|
| 1 Ton (cooling capacity) | 3.517 kW | 1 ton = 12,000 BTU/hr ≈ 3.517 kW |
| 1 BTU/hr | 0.000293 kW | For heating capacity |
| 1 Therm (natural gas) | 29.3 kWh | Energy equivalence |
| 1 kWh | 3,412 BTU | Energy content |

### ECM Rebate Assumptions

| Rebate Type | Typical Amount | Conditions |
|-------------|----------------|-----------|
| **LED Retrofit** | $0.30–0.50/sqft or $2–5/fixture | Varies by utility & incentive program |
| **HVAC Replace** | 15–30% of cost | Tax credit + utility rebate |
| **Building Envelope** | 10–20% of cost | Insulation, air sealing |
| **Smart Controls** | 20–50% of equipment cost | Often tiered; limited budgets |
| **Refrigeration** | 10–30% of cost | Specialty programs, regional variation |

**Important:** Rebate amounts are estimates. Users should verify with local utilities for current programs.

---

## Summary: Data Flow

```
1. BUILDING INFORMATION (Phase 0)
   ↓
   → Baseline EUI, Adjustments, Utility Rates, Annual Energy Use

2. + UTILITY DATA (Phase A, optional)
   ↓
   → Actual EUI, Rate verification, Variance Analysis

3. + OPERATING SCHEDULE (Phase B, optional)
   ↓
   → Adjusted Annual Energy, Schedule Factors, Occupancy Scaling

4. + EQUIPMENT INVENTORY (Phase C, optional)
   ↓
   → Refined End-Use Breakdown, Equipment-Specific Savings

5. → END-USE BREAKDOWN + ELECTRICITY RATE
   ↓
   → ECM APPLICABILITY & CALCULATIONS

6. → ECM RESULTS + AGGREGATION
   ↓
   → REPORT, INSIGHTS, PAYBACK ANALYSIS
```

---

**Last Updated:** December 21, 2025  
**Version:** 1.0
