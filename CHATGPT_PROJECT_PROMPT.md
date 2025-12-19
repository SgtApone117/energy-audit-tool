# Energy Audit Tool - Project Overview Prompt for ChatGPT

**Use this prompt to describe your project to ChatGPT or other AI assistants**

---

## Prompt to Share

---

I'm building an **AI-assisted energy audit web application** for commercial buildings. Here's what the platform does:

### **Core Vision**
The platform helps building owners and energy professionals identify energy efficiency opportunities and estimate potential savings. It uses a **progressive audit framework** that starts simple (basic building info) and becomes increasingly accurate as users provide more detailed data about their building's operations and equipment.

### **Architecture: 5 Phases**

#### **Phase 0: Basic Energy Audit (MVP - Complete)**
- **Input:** Building type, floor area, ZIP code, construction year
- **Features:**
  - Energy Use Intensity (EUI) lookup by building type (9 types: Office, Retail, Restaurant, Grocery, Warehouse, School, Lodging, Industrial, Other)
  - Automatic adjustments for:
    - Construction year (+15% for pre-2000, baseline for 2000-2010, -10% for post-2010)
    - Climate zone based on ZIP code (5 zones: hot, warm, mixed, cool, cold)
  - Annual energy estimation in kWh
  - Annual cost estimation using state-based electricity rates
  - End-use breakdown (how much energy goes to Lighting, HVAC, Plug Loads, Refrigeration, etc.)
  - Energy Conservation Measures (ECMs) with:
    - Annual savings estimates in kWh and $
    - Implementation cost per square foot
    - Simple payback period calculation
    - Priority ranking (High/Medium/Low based on payback)
  - 4 basic ECM recommendations: LED Upgrade, HVAC Optimization, Weatherization, Plug Load Reduction

- **Output:** Comprehensive baseline audit report with:
  - Building summary
  - Baseline energy & cost with adjustment details
  - EUI comparison to benchmarks
  - End-use breakdown visualization
  - ECM opportunities table
  - AI-generated executive summary
  - Downloadable PDF report

#### **Phase A: Utility Bill Data Analysis (Complete)**
- **Input:** 12 months of actual utility bills (electricity consumption data)
- **Features:**
  - Comparison of modeled baseline vs. actual utility consumption
  - Variance analysis (dollar amount and percentage difference)
  - Identification of whether building is more or less efficient than predicted
  - Validation of Phase 0 assumptions
  - Monthly pattern analysis
- **Output:** Calibrated baseline with confidence assessment
- **Accuracy Improvement:** Increases confidence from 60% to 75%

#### **Phase B: Operating Schedule Analysis (Complete)**
- **Input:** Detailed operating schedule (operating hours per day/week, seasonal variations, HVAC settings)
- **Features:**
  - Operating hour tracking (e.g., 9-5 Mon-Fri vs. 24/7)
  - Schedule-based energy adjustment calculations
  - Seasonal HVAC multipliers (summer vs. winter)
  - Baseload vs. operating load separation
  - Impact on energy consumption refinement
- **Output:** Schedule-adjusted energy estimate
- **Accuracy Improvement:** Increases confidence from 75% to 85%

#### **Phase C: Equipment Inventory Analysis (Complete)**
- **Input:** Complete building equipment specifications:
  - HVAC systems (type, capacity, age, efficiency rating, condition)
  - Lighting zones (number of fixtures, watts, control type)
  - Major equipment (compressors, motors, refrigeration, etc.)
- **Features:**
  - Equipment-by-equipment energy consumption calculation
  - Age degradation factors (older equipment less efficient)
  - Condition assessment impact (poor maintenance increases energy use)
  - Equipment efficiency ratings integration (EER, SEER, etc.)
  - End-use breakdown validation against Phase 0 percentage estimates
  - Equipment-specific ECM recommendations
  - Comparison of equipment-based calculation vs. baseline model
- **Output:** Equipment-validated energy estimate with equipment condition insights
- **Accuracy Improvement:** Increases confidence from 85% to 95%+

#### **Phase 1: AI-Assisted Enhancements (Complete)**
- **Features:**
  - AI-generated executive summaries explaining findings
  - Key insights highlighting unusual patterns
  - Assumptions transparency panel (what assumptions were made)
  - Enhanced PDF reporting with AI insights
- **Output:** Professional-grade audit report ready for stakeholder presentation

---

### **Current Calculation Methodology**

#### **Energy Estimation Formula:**
```
Base EUI (by building type)
  × Construction year adjustment
  × Climate zone adjustment
  × Floor area
= Annual kWh consumption
```

#### **Cost Calculation:**
```
Annual kWh × State-based electricity rate = Annual energy cost
```

#### **End-Use Breakdown:**
Business-type specific percentages:
- Office: 35% Lighting, 40% HVAC, 25% Plug Loads
- Retail: 45% Lighting, 35% HVAC, 20% Plug Loads
- Restaurant: 25% Lighting, 35% HVAC, 20% Plug Loads, 20% Refrigeration
- (Similar breakdowns for 6 other building types)

#### **ECM Savings Calculation:**
```
Category kWh × ECM savings % = kWh saved per year
kWh saved × Electricity rate = Annual cost savings
Floor area × Cost per sqft = Implementation cost
Implementation cost / Annual savings = Payback period in years
```

---

### **Data Sources Used**

- **EUI Benchmarks:** Industry-standard reference data derived from CBECS (Commercial Buildings Energy Consumption Survey)
- **Utility Rates:** EIA (Energy Information Administration) 2023 state average electricity rates
- **Climate Data:** ZIP code to state mapping, climate zone classification (IECC zones)
- **Construction Year Factors:** Building code efficiency improvements over time
- **ECM Parameters:** Standard engineering assumptions for energy savings percentages and typical implementation costs

---

### **Key Features Summary**

✅ **Multi-phase progressive assessment** - Start simple, add detail for accuracy
✅ **Building-type specific calculations** - Different types (office, retail, industrial, etc.)
✅ **Automatic geographic adjustments** - Climate and utility rates based on ZIP code
✅ **Real data validation** - Phase A compares model to actual utility bills
✅ **Equipment-level detail** - Phase C allows detailed equipment inventory
✅ **Multiple ECM recommendations** - 4 basic ECMs with savings and payback
✅ **Professional reporting** - PDF export with AI-generated insights
✅ **Layered confidence levels** - Each phase increases accuracy and certainty
✅ **Transparent assumptions** - Users can see what assumptions were made
✅ **Interactive interface** - Web-based (Next.js 14 + React 18) built with TypeScript

---

### **Current Limitations (MVP Stage)**

⚠️ **EUI values are fixed** - Not adjusted for sub-building types
⚠️ **Climate zones are simplified** - 5 zones, not precise HDD/CDD calculations
⚠️ **Only 4 basic ECMs** - Professional-grade would include 20+ options
⚠️ **No demand charge modeling** - Only energy charges considered
⚠️ **No weather normalization** - Actual bills not adjusted for warmer/colder years
⚠️ **No interactive ECM effects** - Each measure calculated independently
⚠️ **Fixed cost estimates** - Implementation costs don't vary by building complexity
⚠️ **No financing analysis** - Payback only, not NPV or IRR
⚠️ **No rebate/incentive matching** - Utility and state incentives not included

---

### **Enhancement Roadmap**

The platform is designed as a **living framework** that can be enhanced with domain expertise:

#### **Tier 1: Data & Methodology (Weeks 1-2)**
- Add citations for all data sources
- Include uncertainty ranges on estimates
- Integrate with public datasets (ENERGY STAR, CBECS)

#### **Tier 2: Conditional Logic (Weeks 3-4)**
- Building-specific adjustments (e.g., LED vs. fluorescent lighting)
- Maintenance history impact factors
- Condition-based efficiency degradation

#### **Tier 3: Advanced Analysis (Weeks 5-6)**
- Weather normalization
- HDD/CDD-based climate calculations
- HVAC load modeling (heating vs. cooling)
- Demand charge analysis
- Ventilation requirement modeling (ASHRAE 62.1)

#### **Tier 4: Professional Services (Weeks 7-10)**
- Third-party data integration (Portfolio Manager, CBECS)
- Real-time monitoring data integration
- Financing & incentive matching engine
- Professional liability framework
- Equipment manufacturer database integration

---

### **Use Cases**

1. **Building Owner** - Quick assessment of energy savings opportunity
2. **Energy Auditor** - Baseline model before detailed on-site audit
3. **Facility Manager** - Identify quick wins and prioritize improvements
4. **Property Developer** - Compare energy efficiency across building types
5. **Investor** - Screen buildings for energy efficiency retrofits
6. **Consultant** - Starting point for deeper energy modeling

---

### **Success Criteria**

The platform achieves professional credibility when:
- ✅ Every calculation has cited data source
- ✅ Every estimate includes uncertainty range
- ✅ Phase A actual bills match model predictions (±10%)
- ✅ Phase C equipment validates against baseline (±15%)
- ✅ Energy engineer reviews and approves methodology
- ✅ Real implementation results match predictions (within 10%)

---

### **Technical Stack**

- **Frontend:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Calculation Engine:** Modular TypeScript functions
- **Data:** Client-side calculations, no external API dependencies for MVP
- **Export:** PDF report generation

---

### **Project Status**

**Current:** MVP complete with Phases 0, A, B, C, and Phase 1 AI enhancements
**Next:** Expert partnership for Tier 1-2 enhancements (data & conditional logic)
**Timeline:** Professional-grade by completing all 4 tiers (10 weeks with 1 energy engineer)
**Investment:** $40K-100K for full professional enhancement

---

## How to Use This Prompt

1. **Copy this entire text**
2. **Paste into ChatGPT**
3. **Add your specific question**, for example:
   - "Based on this project description, what improvements should I prioritize first?"
   - "How should I approach finding domain experts to review this platform?"
   - "What regulatory compliance do I need to consider?"
   - "How should I validate my calculations against real buildings?"
   - "What would make this platform enterprise-ready?"

---

