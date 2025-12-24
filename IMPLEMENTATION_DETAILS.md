# Energy Audit Tool - Complete Implementation Details & Features

## Project Overview
This is a Next.js-based AI-assisted energy audit web application designed for small/medium businesses to understand energy usage, benchmark against peers, and identify cost-saving opportunities. It features both customer self-service assessment and auditor on-site inspection tools.

---

## PHASE 0: CORE ENERGY AUDIT (MVP)

### 1. Building Intake Module
**Features Implemented:**
- Building name input
- Business type selection (9 types: Office, Retail, Restaurant/Food Service, Grocery, Warehouse, K-12 School, Lodging/Hospitality, Industrial Manufacturing, Other)
- Floor area input (sq ft)
- ZIP code / location
- Construction year bucket (Before 2000, 2000-2010, After 2010)
- Primary heating fuel (Electric, Natural Gas, Fuel Oil, Propane)
- Secondary fuel support (optional)

### 2. Energy Baseline Calculation
**Calculation Logic:**

**EUI (Energy Use Intensity) Lookup:**
```
Annual Energy (kWh) = EUI × Floor Area (sq ft)

EUI Values by Business Type:
- Office: 14 kWh/sq ft/year
- Retail: 17 kWh/sq ft/year
- Restaurant/Food Service: 38 kWh/sq ft/year
- Grocery/Food Market: 50 kWh/sq ft/year
- Warehouse/Inventory: 9 kWh/sq ft/year
- K-12 School: 13 kWh/sq ft/year
- Lodging/Hospitality: 20 kWh/sq ft/year
- Industrial Manufacturing: 24 kWh/sq ft/year
- Other: 15 kWh/sq ft/year
```

**Construction Year Adjustment:**
```
Adjusted EUI = Base EUI × Construction Year Factor × Climate Adjustment

Construction Year Factors:
- Before 2000: 1.15 (15% higher - less efficient)
- 2000-2010: 1.0 (baseline)
- After 2010: 0.90 (10% lower - more efficient)
```

**Climate Zone Adjustments:**
Based on state location with 5 climate zones:
- **Hot** (FL, HI, AZ): 1.15× adjustment (high cooling loads)
- **Warm** (TX, LA, CA, etc.): 1.05× adjustment
- **Mixed** (NC, TN, Mid-Atlantic): 1.0× adjustment (baseline)
- **Cool** (CO, UT, WA, Northern states): 1.10× adjustment
- **Cold** (MN, WI, MT, AK, New England): 1.20× adjustment (high heating loads)

**Electricity Rate Lookup by State:**
- Over 50 states with 2023 utility averages
- Falls back to US average: $0.15/kWh
- Ranges from $0.11/kWh (WA, UT, ID) to $0.43/kWh (HI)

### 3. End-Use Energy Breakdown
**Calculation:**
```
Energy per Category = Total Annual Energy × Category Percentage

Business Type Allocations:
Office:
  - Lighting: 35%
  - HVAC: 40%
  - Plug Loads: 25%

Retail:
  - Lighting: 45%
  - HVAC: 35%
  - Plug Loads: 20%

Restaurant/Food Service:
  - Lighting: 25%
  - HVAC: 35%
  - Plug Loads: 20%
  - Refrigeration: 20%

Grocery/Food Market:
  - Lighting: 25%
  - HVAC: 25%
  - Plug Loads: 10%
  - Refrigeration: 40%

Warehouse:
  - Lighting: 55%
  - HVAC: 25%
  - Plug Loads: 20%

K-12 School:
  - Lighting: 30%
  - HVAC: 45%
  - Plug Loads: 25%

Lodging/Hospitality:
  - Lighting: 30%
  - HVAC: 45%
  - Plug Loads: 25%

Industrial Manufacturing:
  - Lighting: 20%
  - HVAC: 30%
  - Plug Loads: 20%
  - Process: 30%

Other:
  - Lighting: 33%
  - HVAC: 33%
  - Plug Loads: 34%
```

### 4. Annual Energy Cost Calculation
```
Annual Energy Cost = Annual Energy Use (kWh) × Electricity Rate ($/kWh)

Example: 50,000 kWh/year × $0.15/kWh = $7,500/year
```

### 5. Energy Conservation Measures (ECMs)

**Basic ECM Definitions:**
| ECM | Savings % | Cost/sq ft | Category |
|-----|-----------|-----------|----------|
| LED Lighting Upgrade | 40% of Lighting | $1.50 | Lighting |
| HVAC Optimization | 12% of HVAC | $0.20 | HVAC |
| Weatherization | 6% of HVAC | $0.50 | HVAC |
| Plug Load Reduction | 6% of Plug Loads | $0.10 | Plug Loads |

**ECM Calculation Logic:**
```
Energy Saved (kWh) = Category Energy × Savings Percentage
Cost Saved ($/year) = Energy Saved × Electricity Rate
Implementation Cost ($) = Floor Area × Cost per sq ft
Payback Period (years) = Implementation Cost / Annual Cost Savings

Priority Assignment:
- High: Payback < 2 years
- Medium: Payback 2-4 years
- Low: Payback > 4 years
```

---

## PHASE 1: INTELLIGENT AUDIT (AI-Assisted Enhancements)

### 6. AI Executive Summary
- Auto-generated professional narrative
- Powered by OpenAI API
- Analyzes:
  - Energy baseline vs benchmarks
  - Key energy drivers
  - Top savings opportunities
  - Payback highlights
  - Business impact

**Input to AI:**
- Building info, business type, size, location
- Annual cost, usage, EUI, energy score
- Benchmarking percentiles
- End-use breakdown
- ECM opportunities
- Top recommendations
- Key insights

### 7. Key Insights & Highlights
Automatically generates insights such as:
- Largest energy drivers identification
- Highest priority ECM with payback
- Total annual savings potential
- Performance vs benchmarking

### 8. PDF Export
Generates professional client-ready reports including:
- Building summary
- Energy baseline and annual cost
- End-use breakdown with charts
- Savings opportunities table
- Implementation cost summary
- Payback analysis

---

## PHASE 2: ADVANCED FEATURES (In Development)

### 9. Equipment Inventory System (Phase C)

**HVAC Equipment Tracking:**
```
Properties tracked:
- System type (Packaged Rooftop, Split, Chiller, Boiler, Heat Pump, Window AC, etc.)
- Manufacturer & model
- Capacity (tons, BTU/hr, or kW)
- Age (years)
- Condition (Excellent, Good, Fair, Poor)
- Efficiency rating (SEER, EER, AFUE, COP, HSPF)
- Fuel type (Electric, Natural Gas, Fuel Oil, Propane)
- Smart thermostat presence
- Last service date
```

**HVAC Energy Calculation:**
```
Capacity Conversion:
- Tons to kW: tons × 3.517
- BTU/hr to kW: BTU/hr ÷ 3412

Efficiency Factor: benchmark EER ÷ actual EER
Age Factor: 1.0 + (age - 10) × 0.02 (for units >10 years)

Condition Factors:
- Excellent: 0.95
- Good: 1.0
- Fair: 1.1
- Poor: 1.25

EFLH (Equivalent Full Load Hours):
- Cooling: 1000 hours/year
- Heating: 800 hours/year

Annual Consumption (kWh) = capacity × EFLH × efficiency × age × condition factors
```

**Lighting Equipment Tracking:**
```
Properties:
- Fixture type (LED, T8, T12, T5, CFL, Incandescent, HID, etc.)
- Fixture count
- Lamps per fixture
- Lamp type & length
- Ballast type & factor
- Wattage per lamp
- Total fixture watts
- Control type (Manual, Occupancy, Daylight, Timer, BMS, Dimmer, None)
- Operating hours (daily, weekly)
- Lamps out count (for post-installation verification)
- DLC certification status

Wattage Database:
- T12 4ft 40W Magnetic: 40W lamp × 1.1 ballast = 44W
- T8 4ft 32W Electronic: 32W × 0.88 ballast = 28.16W
- LED Tube 4ft 15W: 15W
- LED Fixture 2x4 40W: 40W
- HID MH 400W: 400W × 1.15 ballast = 460W
(100+ fixture configurations defined)

Annual Lighting Calculation:
Total Watts = fixture count × watts per fixture × lamps per fixture
Annual kWh = (Total Watts ÷ 1000) × hours/year × control factor
Hours/year = hours/day × days/week × 52 weeks

Control Adjustment Factors:
- Manual Switch: 1.0
- Occupancy Sensor: 0.7
- Daylight Sensor: 0.75
- Timer: 0.85
- Dimmer: 0.8
- Smart Control: 0.65
```

**Major Equipment (Refrigeration, Motors, etc.):**
```
Properties:
- Equipment type (Walk-in Cooler/Freezer, Display Case, Ice Machine, Compressor, Motor, etc.)
- Manufacturer & model
- Capacity (horsepower, BTU, tons)
- Age
- Condition
- Rated watts
- Operating hours (daily, weekly)
- VFD presence
- Load factors by equipment type:
  - Walk-in Cooler: 0.6
  - Walk-in Freezer: 0.65
  - Display Case Refrigerated: 0.7
  - Data Center: 0.85
  - Ice Machine: 0.5
  (15+ equipment types defined)

Annual Consumption = rated watts × load factor × hours/year × age factor × condition factor
```

### 10. Operating Schedule Module (Phase B)

**Daily Schedule Tracking:**
- Start hour (0-23)
- End hour (0-23)
- Is open (boolean)

**Weekly Schedule:**
- Individual schedules for each day of the week

**Seasonal Variations:**
- Summer, Winter, Spring/Fall
- Occupancy multipliers (0.0-1.5)
- HVAC intensity multipliers (0.5-2.0)

**Calculation Functions:**
```
Daily Hours = end_hour - start_hour (if open)
Weekly Hours = sum of all daily hours
Days per Week = count of open days
Annual Operating Hours = weekly_hours × 52 - (holiday_hours_reduction)
Holiday reduction = (weekly_hours ÷ 7) × number_of_holidays

Schedule Adjustment Factor = base_load (0.3) + operating_load (0.7) × (actual_hours ÷ standard_hours)

Standard Hours by Business Type:
- Office: 50 hrs/week (10 hrs × 5 days)
- Retail: 70 hrs/week
- Restaurant: 84 hrs/week
- Grocery: 105 hrs/week
- School: 45 hrs/week
- Hotel: 168 hrs/week (24/7)
```

### 11. Utility Bill Data Integration (Phase A)

**Monthly Data Structure:**
- Month name
- Electricity usage (kWh)
- Electricity cost ($)
- Gas usage (therms)
- Gas cost ($)

**Calculated Metrics:**
```
Total Annual Electricity = sum of all monthly values
Total Annual Gas = sum of all monthly therms
Actual EUI = total kWh ÷ floor area

Gas to Electricity Conversion:
1 therm = 29.3 kWh equivalent

Combined EUI = (total kWh + (gas_therms × 29.3)) ÷ floor area
```

**Utility Comparison:**
```
Variance = actual kWh - estimated kWh
Variance % = (variance ÷ estimated) × 100
Assessment notes based on variance
```

### 12. Utility Rates Database
- **50+ states** with 2023 average rates
- Electricity rates ($/kWh) and Natural gas rates ($/therm)
- US average fallback values
- Updated based on EIA (Energy Information Administration) data

---

## AUDITOR ON-SITE INSPECTION SYSTEM

### 13. Inspection Types
- Pre-Installation (document existing conditions)
- Post-Installation (verify equipment matches proposal)

### 14. Photo Documentation
```
Categories:
- HVAC (units, thermostats, ductwork)
- Lighting (fixtures, controls, ballasts)
- Building Envelope (windows, doors, insulation)
- Refrigeration (walk-ins, display cases)
- Electrical (panels, meters, motors)
- Water Heating (heaters, pipes)
- Kitchen/Process (cooking equipment, exhaust)
- General (nameplates, issues)

Metadata per photo:
- ID, Base64 image, filename
- Category, label, notes
- Room, timestamp, size
```

### 15. Lighting Fixture Database (Eversource Compliance)
```
100+ fixture specifications with:
- Lamp types & wattages
- Ballast types & factors
- Pre-calculated total wattages
- Common configurations:
  - T8 4-lamp 4ft troffer: 112W
  - T12 4-lamp 4ft: 176W
  - LED 2x4 troffer: 40W
  - LED 2x2 troffer: 32W
  - HID Metal Halide 400W: 460W (with ballast)

Eversource-Specific Calculations:
- Lamps out count tracking
- DLC (DesignLights Consortium) verification
- Individual lamp verification for post-installation
```

### 16. Contractor Submittal Comparison
```
Tracks:
- Contractor name & project name
- Proposed lighting items with specs
- HVAC & other equipment items
- Calculated totals:
  - Existing total watts
  - Proposed total watts
  - Estimated savings (watts & kWh/year)
  - Proposed incentive
- Document reference
```

### 17. ECM Auto-Generator (Auditor)
```
Template-based system generating recommendations:

HVAC ECMs:
- Replace aging units (>15 years): 15-35% savings
- Service poor condition units: 5-15% savings
- Smart thermostat installation: 8-15% savings

Lighting ECMs:
- LED retrofit: 40-65% savings
- Add occupancy sensors: 20-30% savings
- Remove ballasts: 10-15% savings
- Exterior lighting optimization: 30-50% savings

Refrigeration ECMs:
- High-efficiency case replacement: 30-50% savings
- Condenser fan VFD: 15-30% savings
- Door gasket replacement: 5-10% savings

All with:
- Calculated savings ranges (low/typical/high)
- Cost estimates
- Equipment relationships
- Priority ratings
```

---

## ENHANCED ECM CALCULATIONS (With Confidence Ranges)

### 18. Confidence Ranges for ECMs
```
Each ECM includes:

Savings percentages (low, typical, high):
- Example LED: 35-40-45% of lighting energy

Implementation costs (low, typical, high):
- Accounts for labor, materials, regional variation
- Example: $0.80-$1.50-$2.20 per sq ft

Cost savings ranges:
- Low = energy_saved_low × electricity_rate
- High = energy_saved_high × electricity_rate

Net cost after rebates:
- Typical rebate estimates by state & measure type
- Accounts for utility incentives

Payback ranges:
- Low payback: high savings ÷ low cost (best case)
- High payback: low savings ÷ high cost (worst case)
```

### 19. Interactive Effects Between ECMs
```
Accounts for measure interactions:

LED + Lighting Controls:
- Occupancy sensors more effective with efficient LEDs
- Combined multiplier effect applied

Weatherization + HVAC:
- Building envelope improvements reduce HVAC load
- Reduced HVAC equipment sizing

All ECMs + Operating Schedule:
- Schedule optimization impacts effectiveness
- Seasonal variations considered

Bonus Savings Calculation:
Interactive savings bonus tracked separately
Prevents double-counting while showing synergies
```

### 20. Total ECM Summary
```
Aggregated metrics:

Total Energy Savings (low, typical, high):
- Sum of all individual ECM savings
- With interactive adjustment

Total Cost Savings (low, typical, high):
- Sum of annual savings across measures

Total Implementation Cost (low, typical, high):
- Includes all rebates
- Shows net investment required

Blended Payback Period:
- Total net cost ÷ total annual savings
- Calculated with conservative approach

Statistics:
- High/Medium/Low priority counts
- Measure distribution by category
```

---

## BENCHMARKING & INSIGHTS

### 21. Energy Scoring System
```
Score calculation based on:
- EUI vs typical for business type
- Percentile ranking (1-100)
- Efficiency categories

Typical EUI values (for benchmarking):
- 75th percentile (efficient): ~20% below baseline
- 50th percentile (typical): ~baseline
- 25th percentile (high use): ~40% above baseline

Score output:
- Numeric score
- Performance label
- Percentile ranking
- Comparison narrative
```

### 22. Key Insights Generation
```
Deterministic insights from calculations:

1. Energy driver identification:
   - Highest consuming end-use category
   - % of total energy

2. Best opportunity:
   - Highest priority ECM
   - Payback years
   - Potential annual savings

3. Total savings potential:
   - Annual $ savings
   - Implementation cost
   - Blended payback

4. Benchmarking insights:
   - How building compares
   - Typical business type performance
   - Quick win opportunities

Read-only function (no new calculations introduced)
```

---

## TECHNOLOGY STACK

**Framework & Libraries:**
- Next.js 14.2.5
- React 18.3.1
- TypeScript 5.5.3
- TailwindCSS 3.4.7
- Recharts 2.12.7 (for charts)
- jsPDF 2.5.1 + jspdf-autotable 5.0.2 (PDF export)
- html2canvas 1.4.1 (screenshot for PDF)
- Lucide-react 0.562.0 (icons)

**Architecture:**
- Client-side calculations (all browser-based)
- Fully anonymous (no authentication)
- Progressive disclosure UI
- Mobile-first responsive design
- Accessible component library

---

## SUMMARY

This implementation provides a comprehensive energy audit tool featuring:

✓ **Core MVP**: Building intake, EUI calculations, energy breakdown, ECM recommendations, PDF export
✓ **Phase 1**: AI-powered executive summaries, key insights, benchmarking
✓ **Phase 2**: Equipment tracking (HVAC, lighting, major equipment), operating schedules, utility bill integration
✓ **Advanced**: Confidence ranges, interactive effects, ECM auto-generation
✓ **Auditor Tools**: On-site inspection, lighting database (100+ fixtures), contractor submittal tracking, photo documentation

All calculations are transparent, deterministic, and run entirely client-side with state-based utility rates and climate adjustments.
