# Customer View Implementation Plan

## Overview

This document outlines the implementation plan for the Customer View of the Energy Audit Tool. The Customer View is a self-service, anonymous, free tool that helps small/medium business owners understand their energy usage, benchmark against peers, and identify cost-saving opportunities.

---

## Key Principles

| Principle | Description |
|-----------|-------------|
| **Anonymous** | No account creation, no authentication required |
| **Client-side only** | All calculations run in the browser |
| **Progressive disclosure** | Start simple, add complexity optionally |
| **Mobile-first** | Responsive design for all devices |
| **Transparent** | Show methodology and assumptions |
| **Honest** | Use ranges, confidence indicators, disclaimers |

---

## Architecture Overview

### Folder Structure

```
app/
├── page.tsx                           # Landing page
├── layout.tsx                         # Root layout (header/footer)
├── globals.css                        # Global styles
├── (customer)/                        # Customer route group
│   ├── layout.tsx                     # Customer-specific layout
│   └── assessment/
│       ├── page.tsx                   # Multi-step assessment form
│       ├── layout.tsx                 # Assessment layout
│       └── results/
│           └── page.tsx               # Results dashboard
└── api/                               # API routes (if needed)

components/
├── landing/                           # Landing page components
│   ├── Hero.tsx                       # Hero section with CTA
│   ├── ValuePropositions.tsx          # Benefits cards
│   ├── TrustIndicators.tsx            # Anonymous, free, instant
│   ├── HowItWorks.tsx                 # Step-by-step preview
│   ├── SamplePreview.tsx              # Sample report preview
│   └── FAQ.tsx                        # Frequently asked questions
│
├── customer/                          # Customer-specific components
│   ├── assessment/
│   │   ├── AssessmentForm.tsx         # Main form orchestrator
│   │   ├── steps/
│   │   │   ├── BusinessBasics.tsx     # Step 1: Business info
│   │   │   ├── UtilityBills.tsx       # Step 2: Bills input
│   │   │   ├── EquipmentInventory.tsx # Step 3: Equipment (optional)
│   │   │   └── ReviewStep.tsx         # Step 4: Review before results
│   │   ├── utility-input/
│   │   │   ├── CSVUpload.tsx          # CSV file upload handler
│   │   │   ├── ManualEntry.tsx        # Manual bill entry table
│   │   │   └── BillPreview.tsx        # Preview uploaded/entered data
│   │   ├── equipment/
│   │   │   ├── HVACSection.tsx        # HVAC equipment inputs
│   │   │   ├── LightingSection.tsx    # Lighting details
│   │   │   ├── RefrigerationSection.tsx # Refrigeration equipment
│   │   │   ├── CookingSection.tsx     # Cooking equipment
│   │   │   └── OtherEquipment.tsx     # Other equipment
│   │   ├── FormProgress.tsx           # Progress indicator
│   │   └── FormNavigation.tsx         # Back/Continue/Skip buttons
│   │
│   ├── results/
│   │   ├── ResultsDashboard.tsx       # Main results orchestrator
│   │   ├── sections/
│   │   │   ├── EnergyProfile.tsx      # Score, cost, usage summary
│   │   │   ├── BenchmarkComparison.tsx # vs similar businesses
│   │   │   ├── UsagePatterns.tsx      # Charts and analysis
│   │   │   ├── EnergyBreakdown.tsx    # Pie chart breakdown
│   │   │   ├── QuickWins.tsx          # No-cost immediate actions
│   │   │   ├── SavingsOpportunities.tsx # ECM recommendations
│   │   │   ├── ActionPlanBuilder.tsx  # Interactive plan builder
│   │   │   └── EducationalContent.tsx # Expandable learning sections
│   │   ├── analysis/
│   │   │   ├── MonthlyCostBreakdown.tsx
│   │   │   ├── SeasonalPatterns.tsx
│   │   │   ├── PeakUsageAnalysis.tsx
│   │   │   ├── RateAnalysis.tsx
│   │   │   └── AnomalyDetection.tsx
│   │   └── export/
│   │       ├── PDFGenerator.tsx       # PDF report generation
│   │       ├── ShareOptions.tsx       # Share link, clipboard
│   │       └── PrintView.tsx          # Print-optimized view
│   │
│   └── shared/
│       ├── ConfidenceIndicator.tsx    # Data confidence display
│       ├── InsightCard.tsx            # Insight/recommendation card
│       ├── DataSourceBadge.tsx        # Shows data basis
│       └── DisclaimerNote.tsx         # Methodology disclaimers
│
├── charts/                            # Reusable chart components
│   ├── MonthlyUsageChart.tsx          # Line chart for usage
│   ├── BenchmarkBarChart.tsx          # Horizontal comparison bar
│   ├── EnergyBreakdownPie.tsx         # Pie chart for breakdown
│   ├── SeasonalPatternsChart.tsx      # Grouped bar by season
│   └── SavingsComparisonChart.tsx     # ECM savings comparison
│
├── ui/                                # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── RadioGroup.tsx
│   ├── Tooltip.tsx
│   ├── ProgressBar.tsx
│   ├── Accordion.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Skeleton.tsx                   # Loading skeleton
│   └── FileUpload.tsx                 # Drag-drop file upload
│
└── shared/                            # Shared across all views
    ├── Header.tsx
    ├── Footer.tsx
    └── Logo.tsx

lib/
├── core/                              # Existing calculation logic (keep as-is)
│   ├── calculations.ts
│   ├── data.ts
│   ├── types.ts
│   └── data/
│       ├── climateZones.ts
│       ├── utilityRates.ts
│       └── zipToState.ts
│
├── customer/                          # Customer-specific logic
│   ├── types.ts                       # Customer assessment types
│   ├── hooks/
│   │   ├── useAssessmentForm.ts       # Form state management
│   │   ├── useSessionPersistence.ts   # LocalStorage auto-save
│   │   ├── useCalculations.ts         # Calculation orchestration
│   │   └── useInsights.ts             # Insight generation
│   ├── insights/
│   │   ├── generateInsights.ts        # Auto-generated insights
│   │   ├── quickWins.ts               # No-cost action suggestions
│   │   ├── anomalyDetection.ts        # Unusual pattern detection
│   │   └── benchmarkAnalysis.ts       # Peer comparison logic
│   ├── csv/
│   │   └── billParser.ts              # CSV bill parsing
│   └── validation/
│       └── formValidation.ts          # Form validation rules
│
├── utility/                           # Existing utility analysis
├── equipment/                         # Existing equipment calculations
├── ecm/                               # Existing ECM calculations
├── schedule/                          # Existing schedule calculations
└── pdf/                               # PDF generation
    └── customerReport.ts              # Customer-specific PDF template

hooks/                                 # Global hooks
├── useMediaQuery.ts                   # Responsive breakpoints
├── useLocalStorage.ts                 # LocalStorage wrapper
└── useDebounce.ts                     # Debounce utility

_archive/                              # Archived auditor components
└── (original components moved here)
```

### Data Flow

```
User Input → Form State → Validation → LocalStorage (auto-save)
                                            ↓
                                      Calculations
                                            ↓
                                    Results Dashboard
                                            ↓
                                   PDF Export / Share
```

---

## Phase 1: Setup & Architecture

### Objective
Prepare the codebase for the new Customer View by organizing files, archiving unused components, and setting up the new folder structure.

### Tasks

#### 1.1 Archive Existing Components
- Move current auditor-focused components to `_archive/` folder
- Preserve all existing calculation libraries in `lib/core/`
- Keep existing types that will be reused

#### 1.2 Create Folder Structure
- Create all new folders as outlined in Architecture section
- Set up route groups for customer view `(customer)/`

#### 1.3 Set Up Base UI Components
- Create essential UI components (Button, Card, Input, Select, etc.)
- Establish consistent styling patterns with Tailwind
- Set up Lucide React icons

#### 1.4 Configure Session Persistence
- Set up localStorage hook for auto-saving form progress
- Configure 24-hour expiry for saved sessions
- Add "Resume where you left off" functionality

#### 1.5 Update Root Layout
- Modify layout.tsx for customer-friendly header
- Update branding and navigation
- Ensure mobile-responsive header/footer

### Deliverables
- Clean folder structure with archived components
- Base UI component library
- Session persistence utilities
- Updated root layout

---

## Phase 2: Landing Page

### Objective
Create an engaging landing page that converts visitors into assessment users.

### Tasks

#### 2.1 Hero Section
- Compelling headline: "Discover Your Business Energy Savings"
- Subheadline explaining the value proposition
- Primary CTA button: "Start Free Assessment"
- Hero image or illustration (energy/business themed)

#### 2.2 Value Propositions Section
- Three cards highlighting key benefits:
  - "Compare to Similar Businesses" - See how you stack up
  - "Identify Quick Wins" - Find no-cost savings today
  - "Get Actionable Recommendations" - Prioritized improvements

#### 2.3 Trust Indicators
- Badge-style indicators:
  - "100% Anonymous" - No account required
  - "Completely Free" - No hidden costs
  - "Instant Results" - Get insights in minutes
  - "10-Minute Assessment" - Quick and easy

#### 2.4 How It Works Section
- Step-by-step visual guide:
  - Step 1: Enter your business details
  - Step 2: Add your utility bills
  - Step 3: Get your personalized report

#### 2.5 Sample Report Preview
- Screenshot or interactive preview of results dashboard
- Key metrics highlighted (savings potential, energy score)
- "See what you'll get" teaser

#### 2.6 FAQ Section
- Expandable accordion with common questions:
  - "How accurate are the estimates?"
  - "What data do I need?"
  - "Is my information secure?"
  - "How long does it take?"
  - "Do I need to create an account?"

#### 2.7 Footer CTA
- Secondary CTA at bottom
- "Ready to find your savings? Start now"

### Deliverables
- Complete landing page with all sections
- Responsive design (mobile, tablet, desktop)
- Smooth scroll navigation
- CTA buttons linking to assessment

---

## Phase 3: Multi-Step Assessment Form

### Objective
Create an intuitive, progressive form that collects business and energy data with minimal friction.

### Form Flow

```
Step 1: Business Basics
        ↓
Step 2: Utility Bills (CSV or Manual)
        ↓
Step 3: Equipment Details (Optional)
        ↓
Step 4: Review Your Information
        ↓
    → Results Dashboard
```

### Tasks

#### 3.1 Form Orchestrator
- Multi-step form container with state management
- Progress indicator showing current step
- Auto-save to localStorage every 30 seconds
- "Resume previous session" prompt on return

#### 3.2 Step 1: Business Basics
**Required Fields:**
- Business Name (text input)
- Business Type (dropdown from EUI_LOOKUP keys)
- Address (text input with state auto-detection)
- ZIP Code (5-digit validation)
- Square Footage (numeric, greater than 0)

**Features:**
- Inline validation with helpful error messages
- Tooltips explaining why each field is needed
- "Continue" button (validates before proceeding)

#### 3.3 Step 2: Utility Bills
**Input Modes (tabs):**
1. **CSV Upload**
   - Drag-and-drop file upload zone
   - Accept .csv files
   - Parse and preview uploaded data
   - Map columns to expected fields
   - Show validation errors if format incorrect

2. **Manual Entry**
   - Table with 12 rows (one per month)
   - Columns: Month, Electricity (kWh), Electricity Cost ($), Gas (therms), Gas Cost ($)
   - Auto-calculate totals at bottom
   - "Add row" for additional months if needed

**Requirements:**
- Minimum 3 months required, 12 months recommended
- Progress indicator: "X/12 months entered"
- Utility provider dropdown (optional, for rate context)
- "Continue" or "Skip to Equipment" buttons

#### 3.4 Step 3: Equipment Inventory (Optional)
**Collapsible Sections:**

**HVAC Section:**
- System type (dropdown: Central AC, Heat Pump, Rooftop Unit, Split System, etc.)
- Number of units
- Age range (0-5, 6-10, 11-15, 16-20, 20+ years)
- Tonnage/capacity (optional)
- Efficiency rating (optional with help tooltip)
- Condition (Excellent, Good, Fair, Poor)
- Thermostat type (Manual, Programmable, Smart)

**Lighting Section:**
- Total fixture count
- Primary bulb type (LED, Fluorescent, Incandescent, Mixed)
- Average hours per day
- Lighting controls (None, Timers, Occupancy Sensors, Daylight Sensors)

**Refrigeration Section (checkboxes with details):**
- Walk-in cooler (size, age, condition if checked)
- Walk-in freezer (size, age, condition if checked)
- Reach-in units (quantity)
- Display cases (quantity, type)
- Ice machines (quantity)

**Cooking Equipment Section (checkboxes):**
- Commercial ovens (quantity)
- Ranges/cooktops (quantity)
- Fryers (quantity)
- Grills (quantity)
- Dishwashers (quantity)

**Other Equipment Section:**
- Compressors/motors (quantity, HP rating)
- Computers/servers (quantity)
- Custom "other" equipment (description, estimated kW)

**Operating Schedule:**
- Weekly schedule builder (Mon-Sun with hours)
- "Open 24/7" checkbox
- Typical occupancy level (dropdown)
- Holiday closures per year (number)

**Features:**
- Each section collapsible/expandable
- "Why we need this" tooltips
- Completion percentage indicator
- "Skip to Review" button always visible

#### 3.5 Step 4: Review Your Information
**Summary Display:**
- Business information summary card
- Utility data summary (total kWh, total cost, months provided)
- Equipment summary (what was provided, what was skipped)
- Data confidence indicator preview

**Actions:**
- "Edit" links for each section
- "Generate My Report" primary CTA
- Note about calculation methodology

### Deliverables
- Complete multi-step form with all steps
- CSV parsing and validation
- Form validation with helpful errors
- Session persistence (auto-save)
- Progress indicators
- Mobile-responsive form inputs

---

## Phase 4: Results Dashboard

### Objective
Present comprehensive, actionable results in a clear, professional format.

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: Business Name + Download/Share buttons         │
├─────────────────────────────────────────────────────────┤
│  Energy Profile Summary (large cards with key metrics)  │
├─────────────────────────────────────────────────────────┤
│  Benchmark Comparison (horizontal bar chart)            │
├─────────────────────────────────────────────────────────┤
│  Usage Patterns (tabs: Monthly, Seasonal, Peak, Rate)   │
├─────────────────────────────────────────────────────────┤
│  Energy Breakdown (pie chart - if equipment data)       │
├─────────────────────────────────────────────────────────┤
│  Quick Wins (no-cost actions list)                      │
├─────────────────────────────────────────────────────────┤
│  Savings Opportunities (ECM cards with details)         │
├─────────────────────────────────────────────────────────┤
│  Action Plan Builder (interactive checklist)            │
├─────────────────────────────────────────────────────────┤
│  Educational Content (expandable accordion)             │
├─────────────────────────────────────────────────────────┤
│  Footer: Disclaimer + Next Steps                        │
└─────────────────────────────────────────────────────────┘
```

### Tasks

#### 4.1 Results Header
- Business name prominently displayed
- Download PDF button
- Share options dropdown (Copy link, Print)
- "Start New Assessment" link
- Confidence indicator badge

#### 4.2 Energy Profile Summary
**Large metric cards:**
- Annual Energy Cost (most prominent)
- Annual Usage (kWh)
- Cost per Square Foot
- Energy Score (A-F letter grade with color)

**Supporting info:**
- Confidence indicator (1-5 dots with explanation)
- Data basis note ("Based on X months of bills + equipment data")

#### 4.3 Benchmark Comparison
**Visualization:**
- Horizontal bar chart showing:
  - Your EUI vs Typical for business type vs Top 25% efficient
- Percentage difference callouts
- Cost comparison (what you pay vs what efficient buildings pay)

**Details:**
- Percentile ranking ("You're in the Xth percentile")
- Expandable "How we calculated this" section

#### 4.4 Usage Patterns Analysis
**Tabbed interface:**

**Tab 1: Monthly Trends**
- Line chart of monthly kWh over time
- Highlight peak and lowest months
- Year-over-year comparison (if 12+ months)

**Tab 2: Seasonal Patterns**
- Grouped bar chart by season
- Summer/Fall/Winter/Spring averages
- Seasonal insights (e.g., "Summer usage 40% higher")

**Tab 3: Peak Usage Analysis**
- Peak month identification
- Baseload calculation
- Baseload percentage indicator
- Daily peak estimates

**Tab 4: Rate Analysis**
- Average rate you're paying
- Comparison to state average
- Rate trend over time
- Recommendations if overpaying

**Tab 5: Anomalies**
- Flag unusual months (>2 standard deviations)
- Possible causes for anomalies
- Investigation recommendations

#### 4.5 Energy Breakdown
**If equipment data provided:**
- Pie chart showing energy by category (HVAC, Lighting, Refrigeration, etc.)
- Table with kWh and percentage for each category
- Data source badges (equipment-based vs estimated)

**If no equipment data:**
- Message: "Add equipment details for personalized breakdown"
- Show generic industry percentages for business type
- CTA: "Add Equipment Details" button (returns to form)

#### 4.6 Quick Wins Section
**No-cost immediate actions:**
- List of 5-8 actions that cost nothing to implement
- Estimated savings for each
- Examples:
  - "Adjust thermostat by 2°F during unoccupied hours"
  - "Turn off equipment at end of business day"
  - "Use natural lighting when available"
  - "Clean refrigerator coils"
  - "Seal obvious air leaks"
- Total quick wins savings at bottom

#### 4.7 Savings Opportunities (ECMs)
**For each ECM, display:**
- Title and description
- Priority badge (High/Medium/Low based on payback)
- Why this saves money (plain language explanation)
- Savings range (low/typical/high)
- Implementation cost range
- Payback period range
- 10-year return on investment
- Additional benefits (comfort, maintenance, etc.)

**Expandable details:**
- Calculation methodology
- Before/after comparison
- Installation considerations
- Maintenance requirements
- Expected lifespan

**ECM Categories:**
1. Programmable/Smart Thermostats
2. LED Lighting Upgrades
3. Refrigeration Efficiency (night covers, strip curtains)
4. HVAC Maintenance Plans
5. Weatherization (sealing, insulation)
6. Water Heater Controls
7. Occupancy Sensors
8. VFDs on Motors
9. Equipment Upgrades (for old equipment)
10. Demand Control Ventilation

**Summary:**
- Total potential savings (sum of all ECMs)
- Total implementation cost
- Average payback period

#### 4.8 Action Plan Builder
**Interactive checklist:**
- Checkbox for each ECM
- Real-time calculation updates as items selected:
  - Total savings (low-high range)
  - Total cost (low-high range)
  - Blended payback period
  - 5-year and 10-year returns

**Actions:**
- "Download My Action Plan" button (PDF with selected items)
- "Select All High Priority" quick action
- Clear selections button

#### 4.9 Educational Content
**Expandable accordion sections:**
- "How We Calculate These Estimates"
- "Why Ranges, Not Exact Numbers?"
- "Understanding Payback Period"
- "Energy Efficiency Glossary"
- "Financing Your Improvements"
- "Finding Qualified Contractors"
- "Available Rebates and Incentives"
- "Next Steps: Implementation Guide"
- "Limitations of This Assessment"

#### 4.10 Footer Section
- Disclaimer about estimate accuracy
- Recommendation to consult professionals
- Link to start new assessment
- Feedback invitation

### Deliverables
- Complete results dashboard with all sections
- All charts and visualizations
- Interactive action plan builder
- Educational content
- Responsive design for all screen sizes

---

## Phase 5: Export & Polish

### Objective
Enable users to save and share their results, and ensure professional polish across the application.

### Tasks

#### 5.1 PDF Report Generation
**Report Structure:**
- Cover page with business name and date
- Executive summary (key findings)
- Energy profile details
- Benchmark comparison
- Usage analysis highlights
- Energy breakdown (if available)
- Quick wins list
- Full ECM recommendations
- Selected action plan
- Methodology appendix
- Disclaimer and next steps

**Features:**
- Professional formatting with branding
- Charts converted to images
- Tables with proper formatting
- Page numbers and headers
- Download triggers automatically

#### 5.2 Share Options
**Share link:**
- Encode assessment data in URL hash
- Link expires after 7 days
- "Copy link" button with confirmation

**Other options:**
- Copy summary to clipboard (plain text)
- Print-optimized view (CSS print styles)
- Email option (opens mail client with pre-filled subject)

#### 5.3 Loading States
- Skeleton screens for dashboard sections
- Progressive rendering (show sections as calculated)
- Loading spinner for PDF generation
- Calculation progress indicator

#### 5.4 Mobile Responsiveness
- Responsive breakpoints for all components
- Touch-friendly form inputs (larger tap targets)
- Collapsible sections on mobile
- Swipe navigation between form steps
- Fixed bottom CTA bar on mobile
- Horizontal scroll for tables with indicators

#### 5.5 Accessibility (WCAG AA)
- Keyboard navigation throughout
- ARIA labels on all interactive elements
- Screen reader support for charts (text alternatives)
- Color contrast compliance (4.5:1 minimum)
- Focus indicators visible
- Skip navigation links
- Proper heading hierarchy

#### 5.6 Animations & Micro-interactions
- Page transitions (slide between form steps)
- Chart animations (progressive reveal)
- Number count-up on results load
- Button hover/active states
- Success feedback (checkmarks, color changes)
- Smooth scroll to sections

#### 5.7 Error Handling
- Form validation with clear error messages
- Calculation error fallbacks (use industry averages)
- Network error handling (for any API calls)
- Empty state designs for missing data
- "Something went wrong" recovery screens

#### 5.8 Performance Optimization
- Memoize expensive calculations
- Lazy load non-critical sections
- Optimize chart rendering
- Minimize bundle size
- Image optimization

### Deliverables
- PDF generation with professional formatting
- Share functionality (link, clipboard, print)
- Complete mobile responsiveness
- Accessibility compliance
- Polished animations and interactions
- Error handling and edge cases

---

## User Journey

### Happy Path

1. **Land on homepage** → See value proposition → Click "Start Free Assessment"
2. **Step 1: Business Basics** → Enter business info → Click "Continue"
3. **Step 2: Utility Bills** → Upload CSV or enter manually → Click "Continue"
4. **Step 3: Equipment** → Optionally add equipment details → Click "Skip to Review" or "Continue"
5. **Step 4: Review** → Verify information → Click "Generate My Report"
6. **Results Dashboard** → View energy profile and savings opportunities
7. **Action Plan** → Select ECMs to include → Download PDF
8. **Share** → Copy link or print for reference

### Return User Path

1. **Return to site** → See "Continue where you left off?" prompt
2. **Click "Resume"** → Return to last step with data preserved
3. **Complete assessment** → View results

---

## Data Types Summary

### Customer Assessment Form Data
- Business name, type, address, ZIP, square footage
- Utility bills (12 months: kWh, cost for electricity and gas)
- HVAC systems (type, quantity, age, condition, thermostat)
- Lighting (fixtures, bulb type, hours, controls)
- Refrigeration (walk-ins, reach-ins, display cases, ice machines)
- Cooking equipment (ovens, ranges, fryers, grills, dishwashers)
- Other equipment (motors, computers, custom)
- Operating schedule (weekly hours, 24/7 flag, occupancy, holidays)

### Calculation Results
- Annual energy cost and usage
- EUI (actual and adjusted)
- Energy score (A-F)
- Benchmark comparison data
- Monthly/seasonal patterns
- Baseload and peak analysis
- Rate analysis
- Anomaly flags
- End-use breakdown
- Quick wins with savings
- ECM recommendations with ranges
- Confidence score

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Assessment completion time | 10-15 minutes |
| Mobile usability | Fully functional on all devices |
| Accessibility | WCAG AA compliant |
| Page load time | < 3 seconds |
| PDF generation time | < 5 seconds |
| Calculation accuracy | Within 10% of manual calculation |
| Console errors | Zero |
| Form abandonment | < 30% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Complex forms discourage users | Progressive disclosure, skip options, auto-save |
| Calculations seem inaccurate | Show ranges, confidence indicators, methodology |
| Mobile experience poor | Mobile-first design, thorough testing |
| PDF generation fails | Client-side generation, error recovery |
| Large datasets slow performance | Memoization, lazy loading, pagination |

---

## Notes for Implementation

### What to Keep from Existing Codebase
- All calculation libraries (`lib/calculations.ts`, etc.)
- Data files (EUI lookup, climate zones, utility rates)
- Type definitions that apply to both views
- PDF generation utilities (adapt for customer format)

### What to Archive
- Current `app/page.tsx` (auditor-focused form)
- Existing components in `components/` folder
- Any auditor-specific logic

### What to Create New
- Landing page and all its components
- Multi-step assessment form
- Results dashboard with all sections
- Customer-specific types and hooks
- CSV parsing utilities
- Session persistence logic

---

## Next Steps

After this plan is approved:

1. **Phase 1** - Set up architecture, archive old components
2. **Phase 2** - Build landing page
3. **Phase 3** - Implement assessment form (all steps)
4. **Phase 4** - Build results dashboard
5. **Phase 5** - Add export features and polish

Each phase will be committed and pushed for review before proceeding to the next.
