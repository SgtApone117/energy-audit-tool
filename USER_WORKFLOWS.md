# User Workflows - Customer & Auditor

This document outlines the complete workflows for both Customer and Auditor users in the Energy Audit Tool.

---

## CUSTOMER WORKFLOW (Self-Service Assessment)

### Overview
The Customer Workflow is a self-service, anonymous, and free energy assessment tool designed for business owners. It allows users to complete an energy audit in ~10 minutes without any account creation.

### Access Points
- **Landing Page**: `https://domain.com/` (Home)
- **Customer Assessment**: `/assessment`
- **Results Dashboard**: `/assessment/results`

### Workflow Steps

#### **Step 1: Landing Page & Role Selection**
**File**: `app/page.tsx`

User arrives at homepage and sees two role options:
1. **Business Owner** (Customer View) - Self-Assessment Tool
2. **Energy Auditor** (Auditor View) - On-Site Inspection Tool

**Customer selects**: "Start Assessment" → Routes to `/assessment`

Features displayed:
- ✓ Compare to similar businesses
- ✓ Identify quick wins & savings
- ✓ Get actionable recommendations
- ✓ No account required
- ✓ Free assessment
- ✓ Instant results

---

#### **Step 2: Assessment Form - Multi-Step Wizard**
**Files**: 
- `app/(customer)/assessment/page.tsx`
- `components/customer/assessment/AssessmentForm.tsx`

**Component**: `<AssessmentForm />`

**Features**:
- Progress indicator showing current step (1-4)
- Session persistence (auto-save to localStorage every 500ms)
- Resume prompt if returning user
- Back/Continue/Skip buttons
- Validation for each step before proceeding

**4-Step Assessment Process**:

##### **Step 1: Business Basics**
**Component**: `<BusinessBasics />`

Required inputs:
- Building name (text)
- Business type (dropdown: 9 types)
- Floor area (numeric, sq ft)
- ZIP code (for climate & utility rates)
- Construction year (dropdown: 3 buckets)
- Primary heating fuel (dropdown: 4 options)
- Secondary fuel (optional)

Calculations triggered:
- EUI lookup by business type
- Climate zone determination from ZIP
- Electricity rate lookup by state
- Construction year adjustment factor
- Base annual energy estimation

Data stored in session & component state

---

##### **Step 2: Utility Bills (Optional)**
**Component**: `<UtilityBills />`

Two input methods:
1. **CSV Upload**: Upload utility bill CSV file
2. **Manual Entry**: Enter monthly data in table

Monthly fields (all 12 months):
- Electricity usage (kWh)
- Electricity cost ($)
- Gas usage (therms)
- Gas cost ($)

Calculations triggered:
- Total annual electricity & gas
- Actual EUI calculation
- Variance vs estimated (if both provided)
- Combined EUI (electricity + gas-equivalent)

**Validation**:
- Only positive numbers allowed
- At least one value per month
- Consistency checks

---

##### **Step 3: Equipment Inventory (Optional)**
**Component**: `<EquipmentInventory />`

Sub-sections:
1. **HVAC Equipment**
   - System type, manufacturer, model
   - Capacity (tons/BTU/kW)
   - Age, condition rating
   - Efficiency rating (SEER/EER/AFUE/etc)
   - Fuel type, smart thermostat presence

2. **Lighting Details**
   - Fixture type (LED, T8, T12, etc)
   - Fixture count, lamps per fixture
   - Ballast type, total watts per fixture
   - Control type (manual, occupancy, etc)
   - Operating hours (daily, weekly)

3. **Refrigeration Equipment**
   - Equipment type (walk-in, display case, etc)
   - Capacity, age, condition
   - Rated watts, operating hours

4. **Cooking Equipment**
   - Equipment type
   - Wattage, operating hours

5. **Other Major Equipment**
   - Custom equipment tracking
   - Wattage, operating hours

Calculations triggered:
- HVAC annual consumption (capacity × efficiency × age × condition × EFLH)
- Lighting annual consumption (watts × hours/year × control adjustment)
- Major equipment consumption (rated watts × load factor × hours)
- Equipment-based energy breakdown (replaces percentage estimates)

**Completion Tracking**: Progress indicator shows % complete

---

##### **Step 4: Review & Submit**
**Component**: `<ReviewStep />`

Display summary:
- ✓ Building info overview
- ✓ Utility data status (provided/not provided)
- ✓ Equipment data status (provided/not provided)
- ✓ Data completeness percentage

Options:
- **Edit**: Return to previous steps
- **Submit**: Proceed to results

On submit:
- Form validation (business name, type, floor area, ZIP required)
- All calculations performed
- Results page loaded

---

#### **Step 3: Results Dashboard**
**File**: `app/(customer)/assessment/results/page.tsx`

**Main Components**:

##### **Energy Profile Card**
Displays:
- Annual energy cost ($)
- Annual energy usage (kWh)
- Energy Use Intensity (EUI)
- Energy score (numeric)
- Percentile ranking vs similar businesses

##### **Benchmark Comparison**
Shows:
- User's EUI vs typical EUI for business type
- User's EUI vs efficient EUI
- Visual comparison chart
- Performance label (Excellent/Average/Poor)

##### **Energy Breakdown**
Two sections:
1. **Pie Chart**: % breakdown by end-use category
2. **Data Source Badges**:
   - "From Equipment" (if equipment data provided)
   - "Estimated" (if using percentage defaults)

Categories displayed:
- Lighting (kWh & %)
- HVAC (kWh & %)
- Plug Loads (kWh & %)
- Refrigeration/Process (if applicable)

##### **Savings Opportunities (ECMs)**
**Component**: `<EnhancedECMTable />`

Table showing all applicable ECMs:
| Measure | Energy Saved | Annual Savings | Implementation Cost | Payback | Priority |
|---------|--------------|-----------------|-------------------|---------|----------|
| LED Lighting | Low-High range | $500-$800 | $3,000-$5,000 | 4-8 yrs | Medium |
| HVAC Optimization | Low-High range | $200-$400 | $1,000-$2,000 | 3-5 yrs | Medium |
| etc. | | | | | |

Features:
- ✓ Confidence ranges for each metric
- ✓ Rebate estimates (state-based)
- ✓ Net cost after rebates
- ✓ Color-coded priority
- ✓ Interactive effects shown
- ✓ Expandable details per measure

##### **Total Savings Summary**
**Component**: `<TotalSavingsSummaryCard />`

Aggregated metrics:
- Total Annual Energy Savings (kWh): Low-High range
- Total Annual Cost Savings ($): Low-High range
- Total Implementation Cost ($): Low-High range
- Blended Payback Period (years)

#### **AI Executive Summary (Optional)**
**Component**: `<AIExecutiveSummary />`

Auto-generated narrative including:
- Overview of findings
- Energy performance snapshot
- Key findings
- Recommended focus areas
- Top opportunities explanation
- Business impact summary
- Next steps (actionable items)

Generated using OpenAI API with provided audit data.

#### **Key Insights Section**
**Component**: `<KeyInsightsSection />`

Automatically surfaced insights:
- Largest energy driver: "HVAC uses 40% (8,000 kWh/year)"
- Best opportunity: "LED Lighting upgrade - 2.5 year payback"
- Total potential savings: "$5,000/year, 25% reduction"
- Performance note: "Your building is in 65th percentile"

---

#### **Step 4: PDF Export & Sharing**
**Files**: `lib/pdfExport.ts`, `components/customer/results/export/`

**PDF Report includes**:
1. Cover page with building info
2. Energy baseline & cost summary
3. End-use breakdown with chart
4. Benchmark comparison
5. Savings opportunities table
6. Total savings summary
7. Implementation cost analysis
8. Methodology & assumptions
9. Contact info & disclaimers

**Export/Share Options**:
- Download PDF report
- Share via link (if enabled)
- Print optimized view
- Copy to clipboard

---

### Data Persistence in Customer Workflow

**Session Storage** (localStorage):
- Form data saved every 500ms (debounced)
- Assessment step position saved
- Utility bill entries saved
- Equipment inventory saved

**Benefits**:
- ✓ Resume capability if page closed
- ✓ No data loss during session
- ✓ Auto-recovery of assessment
- ✓ Browser cache only (no server required)

**Clear Session**:
- User can start fresh
- All local data cleared
- Form reset to empty state

---

### Business Logic Flow in Customer Assessment

```
User Input (Step 1-4)
         ↓
Session Persistence (localStorage)
         ↓
Validation Check
         ↓
Trigger Calculations:
  - EUI Lookup
  - Climate Adjustment
  - Construction Year Adjustment
  - Utility Rate Lookup
  - End-use Breakdown
  - Equipment-based Breakdown (if provided)
  - ECM Calculations
  - Interactive Effects
         ↓
Generate Results:
  - Energy Score
  - Benchmark Percentile
  - Key Insights
  - AI Summary (optional)
         ↓
Display Dashboard:
  - Cards & Metrics
  - Charts
  - ECM Table
  - PDF Export
```

---

---

## AUDITOR WORKFLOW (On-Site Inspection)

### Overview
The Auditor Workflow is a comprehensive on-site inspection tool for energy auditors. It supports both pre-installation and post-installation inspections with detailed equipment tracking, photo documentation, and automated ECM generation.

### Access Points
- **Auditor Dashboard**: `/auditor`
- **Audit Workspace**: `/auditor/[auditId]`

### Workflow Steps

#### **Step 1: Auditor Dashboard**
**File**: `app/(auditor)/auditor/page.tsx`

**Dashboard Features**:

##### **Header Section**
- Title: "Audit Workspace"
- Quick stats: Total audits, Pre/Post inspections
- Import/Export audit data buttons

##### **Create New Audit Modal**
Opens when "New Audit" button clicked

Inputs:
- Audit name (optional, auto-generated if empty)
- Inspection type dropdown:
  - "Pre-Installation Inspection" → document existing
  - "Post-Installation Inspection" → verify installed equipment

Action: Creates new audit in local storage, routes to workspace

##### **Audit List Table**
Shows all existing audits:

| Audit Name | Type | Last Modified | Status | Actions |
|-----------|------|----------------|--------|---------|
| Site A LED Retrofit | Pre | 2 days ago | 60% | Open, Duplicate, Delete |
| Site A Follow-up | Post | Today | 95% | Open, Delete |

**Actions available**:
- **Open**: Route to audit workspace
- **Duplicate**: Clone entire audit
- **Create Post from Pre**: Auto-generate post-installation version (copies building info)
- **Export**: Download audit as JSON
- **Delete**: Remove audit with confirmation

---

#### **Step 2: Audit Workspace**
**File**: `app/(auditor)/auditor/[auditId]/page.tsx`
**Component**: `<AuditWorkspace />`

The main workspace is a tabbed interface with 8 sections:

##### **Tab 1: Building Info**
**Component**: `<BuildingInfoForm />`

Building Details:
- Building name
- Address & location
- Square footage
- Construction year
- Building type (office, retail, restaurant, etc)
- Primary heating fuel
- Number of floors
- Year built/renovated

Inspector Details:
- Inspector name
- Company name
- Inspection date
- Weather conditions (for HVAC notes)

Project Info:
- Project name
- Contractor info (if known)
- Audit purpose (custom notes)

Status: Completion indicator

---

##### **Tab 2: Photos**
**Component**: `<PhotoDocumentation />`

**Photo Management**:

Upload Interface:
- Camera input or file upload
- Real-time preview
- Base64 encoding for storage

Photo Metadata:
- Auto-assigned photo ID
- Category selection (8 categories):
  - HVAC (rooftop units, thermostats, ductwork)
  - Lighting (fixtures, ballasts, controls)
  - Building Envelope (windows, doors, insulation)
  - Refrigeration (walk-ins, display cases)
  - Electrical (panels, meters, motors)
  - Water Heating (heaters, pipes)
  - Kitchen/Process (cooking, exhaust)
  - General (nameplates, issues)
- Label/description (user-entered)
- Room location (optional)
- Notes field
- Timestamp (automatic)
- File size tracking

Photo Gallery:
- Thumbnail grid view
- Filter by category
- Delete individual photos
- Bulk operations

Data Stored:
- dataUrl (Base64 image)
- Filename
- Category
- Metadata
- Timestamp

---

##### **Tab 3: Lighting Inspection**
**Component**: `<LightingInspectionForm />`

**Purpose**: Detailed lighting fixture tracking (Eversource-compliant)

**Zone Management**:

Create Lighting Zone:
- Zone name (e.g., "Main Office", "Warehouse")
- Location description

Fixture Details:
- Fixture type (dropdown: LED, T8, T12, T5, HID, etc.)
- Fixture count (numeric)
- Lamps per fixture
- Lamp type & length (2ft, 4ft, 8ft)
- Ballast type (Magnetic, Electronic, None, LED-Driver)
- Wattage per lamp (standard reference, editable)
- Ballast factor (standard reference, editable)
- **Total watts per fixture** (calculated: lamps × watts × ballast factor)

**Critical Eversource Fields**:
- Lamps out count (# of non-working individual lamps)
- Fixtures with lamps out (count of affected fixtures)
- Adjusted watts (calculated with lamps out adjustment)

Control & Operation:
- Control type (Manual Switch, Occupancy, Daylight, Timer, BMS, Dimmer, None)
- Hours per day (numeric)
- Days per week (numeric)
- Is exterior? (checkbox)

**Post-Installation Verification** (if post-inspection):
- DLC Listed? (checkbox)
- DLC Product ID (text)
- DLC Manufacturer (text)
- DLC Model Number (text)
- Verified checkbox

Notes & Photos:
- Notes field
- Related photo IDs

**Calculations Performed**:
```
Total Connected Watts = Fixture Count × Watts per Fixture

If lamps out reported:
Adjusted Watts = Total Connected Watts - (Lamps Out × Watts per Lamp)

Annual Lighting Energy = (Adjusted Watts ÷ 1000) × Hours per Year × Control Factor
Hours per Year = Hours per Day × Days per Week × 52 weeks

Control Factor:
- Manual: 1.0
- Occupancy: 0.7
- Daylight: 0.75
- Timer: 0.85
- Dimmer: 0.8
```

Zone Summary:
- List all zones
- Total fixtures & watts
- Total annual kWh
- Edit/delete individual zones

**Fixture Database Integration**:
- 100+ standard fixture configurations
- Pre-calculated wattages
- Searchable by type, wattage, ballast
- Custom fixture entry option

---

##### **Tab 4: Equipment Inventory**
**Component**: `<EquipmentInventoryForm />`

**Sub-sections**:

##### **4A: HVAC Units**

For each unit:
- System type (Packaged Rooftop, Split, Chiller, Boiler, Heat Pump, Window AC, PTAC, VRF, Furnace)
- Manufacturer & model number
- Serial number (optional)
- Capacity & unit (tons, BTU/hr, kW)
- Age (years)
- Condition (Excellent, Good, Fair, Poor)
- Efficiency rating (numeric + unit: SEER, EER, AFUE, COP, HSPF)
- Fuel type (Electric, Natural Gas, Fuel Oil, Propane)
- Smart thermostat present? (checkbox)
- Last service date (optional)
- Notes
- Related photo IDs

**Calculations**:
- Efficiency factor (benchmark ÷ actual rating)
- Age degradation factor (2% loss/year after 10 years)
- Condition multiplier (0.95-1.25 range)
- Annual energy consumption (capacity × EFLH × factors)

##### **4B: Lighting Equipment**

Summary from Lighting Inspection tab:
- Total fixtures tracked
- Total connected watts
- Total annual kWh
- Control factor summary

##### **4C: Major Equipment**

For each equipment item:
- Equipment type (Walk-in Cooler, Display Case, Compressor, Pump, Motor, etc.)
- Manufacturer & model
- Capacity (horsepower, tons, or custom unit)
- Age (years)
- Condition (Excellent, Good, Fair, Poor)
- Rated watts (numeric)
- Hours per day
- Days per week
- VFD present? (checkbox)
- Notes
- Related photo IDs

**Calculations**:
- Load factor (by equipment type: 0.4-0.85)
- Annual consumption (watts × load factor × hours/year × age × condition)

---

##### **Tab 5: Contractor Submittal**
**Component**: `<ContractorSubmittal />`

**Purpose**: Compare contractor's proposal against on-site findings

Project Info:
- Contractor name (text)
- Company name (text)
- Project name (text)
- Submission date

Proposed Lighting Items:
- Existing fixture type (from inspection)
- Proposed fixture type (from contractor proposal)
- Fixture count
- Existing total watts
- Proposed total watts
- Estimated savings (watts)

Proposed HVAC Items:
- System type
- Efficiency comparison
- Expected savings %

Other Equipment:
- Custom equipment items
- Cost estimates
- Savings projections

Calculated Totals:
- Existing total watts
- Proposed total watts
- **Estimated savings (watts)**: Existing - Proposed
- **Estimated annual savings (kWh)**: savings × hours/year
- **Proposed incentive ($)**: Estimated from state utility programs

Comparison View:
- Side-by-side visual
- Savings potential highlighted
- Rebate eligibility notes

---

##### **Tab 6: Utility Bills**
**Component**: `<UtilityBillForm />`

Monthly Data Entry (all 12 months):
- Month name (pre-filled)
- Electricity usage (kWh)
- Electricity cost ($)
- Gas usage (therms)
- Gas cost ($)

Calculated Metrics:
- Total annual electricity (kWh)
- Total annual electricity cost ($)
- Total annual gas (therms)
- Total annual gas cost ($)
- Actual EUI (electricity ÷ floor area)
- Combined EUI (electricity + gas-equivalent)

Analysis:
- Compare to building baseline estimate
- Identify high-use months
- Seasonal patterns

---

##### **Tab 7: Findings Logger**
**Component**: `<FindingsLogger />`

**Purpose**: Document audit findings & deficiencies

Add Finding:
- Category selection (Building Envelope, HVAC, Lighting, Refrigeration, Equipment, Electrical, General)
- Priority (High, Medium, Low)
- Title (short description)
- Detailed finding description
- Location in building
- Photo references (link to uploaded photos)
- Recommended action
- Related equipment IDs (link to equipment inventory)

Finding Display:
- List of all findings
- Color-coded by priority
- Expandable details
- Edit/delete options
- Completion checkbox

Finding-to-ECM Linking:
- Auto-suggest ECMs based on finding category
- Manual linking available
- Cross-reference in report

---

##### **Tab 8: Report**
**Component**: `<AuditReportPrint />`

**Report Contents**:

1. **Cover Page**
   - Building name & address
   - Audit type (Pre/Post)
   - Inspection date
   - Inspector name & company

2. **Building Summary**
   - Building type, square footage, year built
   - HVAC systems (count & types)
   - Lighting systems (total watts, types)
   - Equipment inventory summary

3. **Inspection Findings**
   - All findings organized by category
   - Priority-based highlighting
   - Severity assessment

4. **Lighting Audit Details**
   - All lighting zones with specifications
   - Current vs proposed fixtures
   - Savings calculations
   - DLC compliance notes

5. **Equipment Assessment**
   - HVAC units with efficiency ratings
   - Condition assessments
   - Age & maintenance notes
   - Major equipment specifications

6. **Contractor Comparison** (if submittal provided)
   - Existing vs proposed specs
   - Savings analysis
   - Cost-benefit analysis
   - Rebate estimates

7. **Recommendations**
   - Auto-generated ECMs
   - Priority ranking
   - Estimated savings & costs
   - Implementation complexity

8. **Financial Summary**
   - Total estimated savings
   - Total investment required
   - Blended payback period
   - Rebate availability

**Export/Print Options**:
- Download as PDF
- Print to paper
- Email-ready format

---

#### **Step 3: Data Management**

**Auto-Save**:
- All audit data saved to browser localStorage
- Synced on any change (real-time)
- Persistent across sessions
- No server dependency

**Audit Operations**:

**Duplicate Audit**:
- Creates complete copy with new ID
- Useful for similar buildings
- Preserves all data
- Creates timestamp-based name

**Create Post from Pre**:
- Copies building info from pre-inspection
- Clears inspection-specific data (photos, findings)
- Sets type to "Post-Installation"
- Allows new inspection data entry

**Export Audit**:
- Downloads complete audit as JSON file
- Includes all tabs data
- Portable between devices/browsers
- Email-shareable

**Import Audit**:
- Upload previously exported JSON
- Restores all audit data
- Merges or replaces depending on user choice

**Delete Audit**:
- Removes from localStorage
- Confirmation required
- Irreversible action

---

### Automated ECM Generation

**Trigger**: When report tab is viewed or ECM recommendations requested

**Templates Applied**:

**HVAC ECMs**:
- Replace aging units (>15 years): 15-35% savings
- Service poor condition units: 5-15% savings  
- Install smart thermostat: 8-15% savings

**Lighting ECMs**:
- LED retrofit: 40-65% savings
- Add occupancy sensors: 20-30% savings
- Remove magnetic ballasts: 10-15% savings
- Exterior lighting optimization: 30-50% savings

**Refrigeration ECMs** (if applicable):
- High-efficiency case replacement: 30-50% savings
- Condenser fan VFD: 15-30% savings
- Door gasket replacement: 5-10% savings

**Calculation for each ECM**:
```
Savings Ranges (Low, Typical, High):
- Based on equipment findings
- Adjusted for condition & age
- State-specific rebate estimates

Implementation Cost:
- Equipment cost: from templates
- Labor cost: based on complexity
- Regional adjustments

Payback Period:
- Net cost ÷ annual savings
- Ranges for best/worst cases

Priority Assignment:
- High: < 2 year payback
- Medium: 2-4 year payback
- Low: > 4 year payback
```

---

### Business Logic Flow in Auditor Workflow

```
User Creates Audit
         ↓
Select Inspection Type (Pre/Post)
         ↓
Enter Building Info (Tab 1)
         ↓
Document Photos (Tab 2)
         ├→ Upload/categorize
         └→ Attach to equipment
         ↓
Inspect & Log Systems:
  ├→ Lighting Zones (Tab 3)
  │   └→ Calculate fixture wattages
  │
  ├→ Equipment Inventory (Tab 4)
  │   └→ Track HVAC, refrigeration, major equipment
  │
  ├→ Contractor Submittal (Tab 5)
  │   └→ Compare to proposed upgrades
  │
  ├→ Utility Bills (Tab 6)
  │   └→ Historical usage data
  │
  └→ Findings Logger (Tab 7)
      └→ Document deficiencies
         ↓
Auto-Generate Recommendations (Report Tab 8)
         ├→ Apply ECM templates
         ├→ Calculate savings ranges
         └→ Estimate costs & payback
         ↓
Generate Report
         ├→ Building summary
         ├→ Inspection findings
         ├→ Equipment specs
         ├→ Recommendations
         ├→ Financial analysis
         └→ Export/Print options
         ↓
Export/Share Audit
         ├→ PDF report download
         ├→ JSON audit export
         └→ Email/share with stakeholders
```

---

## Key Differences: Customer vs Auditor

| Feature | Customer | Auditor |
|---------|----------|---------|
| **Access** | Self-service, no login | Dashboard-based |
| **Duration** | 10-15 minutes | 1-4 hours on-site |
| **Data Entry** | Business basics, optional utility/equipment | Detailed equipment tracking |
| **Photos** | None captured | 8+ photos per system |
| **Scope** | Building-level aggregate | System-level detail |
| **Results** | ECM recommendations, insights | Detailed inspection report |
| **Calculation** | EUI-based estimates | Equipment-based specifics |
| **Audit Count** | Single assessment | Multiple audits tracked |
| **Export** | PDF report | PDF report + JSON audit |
| **AI Feature** | Executive summary generated | Manual finding documentation |
| **Equipment Tracking** | Optional input | Comprehensive inventory |

---

## Data Storage Architecture

### Customer Workflow
```
Browser localStorage
└── assessment_session
    ├── formData
    │   ├── businessInfo
    │   ├── utilityBills (optional)
    │   └── equipmentInventory (optional)
    ├── currentStep
    └── lastSaved (timestamp)
```

### Auditor Workflow
```
Browser localStorage
└── audits
    ├── audit_1 (Pre-installation)
    │   ├── id
    │   ├── name
    │   ├── type
    │   ├── buildingInfo
    │   ├── photos[]
    │   ├── lightingZones[]
    │   ├── hvacUnits[]
    │   ├── majorEquipment[]
    │   ├── contractorSubmittal
    │   ├── utilityBills
    │   ├── findings[]
    │   ├── ecmRecommendations[]
    │   ├── createdAt
    │   └── updatedAt
    │
    └── audit_2 (Post-installation)
        └── [same structure]
```

---

## Error Handling & Validation

### Customer Workflow
- Required field validation before step progression
- Data type checking (numeric fields)
- Range validation (positive numbers only)
- ZIP code format validation
- Graceful handling of missing optional data

### Auditor Workflow
- Auto-save with conflict resolution
- Photo size validation (compression if needed)
- Equipment capacity unit conversion validation
- Efficiency rating range validation by type
- Cross-referencing validation (photos linked to equipment)

---

## Mobile Responsiveness

### Customer Workflow
- Fully responsive design
- Mobile-optimized form inputs
- Touch-friendly buttons
- Readable charts on small screens
- Portrait/landscape mode support

### Auditor Workflow
- Responsive dashboard
- Mobile form entry (though desktop recommended for productivity)
- Photo upload optimized for mobile camera
- Tabbed interface adapts to screen size
- Printable report formatting

---

## Accessibility Features

Both workflows include:
- ARIA labels and semantic HTML
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly tooltips
- Disabled state indicators
- Form field associations

---

## Next Steps in Development

1. **Customer**: Integration with Google/utility provider APIs for auto-populated bills
2. **Auditor**: Cloud storage sync for audit backups
3. **Both**: Role-based API authentication when multi-user support added
4. **Both**: Real-time collaboration features for team audits
5. **Customer**: Scenario builder for comparing upgrade options
