# Energy Audit Tool

AI-assisted energy audit web application built with Next.js.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

# Energy Audit Platform – Feature Roadmap

## Phase 0 – Core Energy Audit (MVP / Completed)

### Building Intake
- Building name
- Business type (Office, Restaurant, Retail, etc.)
- Floor area (sq ft)
- ZIP code / location
- Construction year bucket
- Primary heating fuel

### Baseline Energy Estimation
- Industry-standard EUI-based annual energy estimation
- Business-type specific assumptions
- Transparent, deterministic calculations

### Annual Energy Cost Estimation
- Conversion from kWh to annual cost
- Configurable electricity rate assumptions
- Clear display of assumptions

### End-Use Energy Breakdown
- Lighting
- HVAC
- Plug loads
- Refrigeration / process loads (where applicable)
- Percentage-based allocation by business type

### Visualization
- Bar chart of energy use by end-use
- Numeric values displayed alongside charts
- Professional, readable presentation

### Energy Conservation Measures (ECMs)
- LED lighting upgrades
- HVAC optimization
- Weatherization
- Plug load reduction

Each ECM includes:
- Estimated annual energy savings (kWh)
- Estimated annual cost savings ($)
- Estimated implementation cost
- Simple payback period (years)
- Priority ranking (High / Medium / Low)

### Audit Results Page
- Structured, report-style layout
- Clear section hierarchy
- Single scrollable audit view

### PDF Export (Client Deliverable)
- Client-ready energy audit report
- Includes:
  - Building summary
  - Energy baseline and cost
  - End-use breakdown and chart
  - Savings opportunities table
- Downloadable PDF
- Clean, readable formatting

---

## Phase 1 – Intelligent Audit (AI-Assisted Enhancements)

### AI Executive Summary
- Auto-generated professional narrative summarizing:
  - Energy baseline
  - Key energy drivers
  - Top savings opportunities
  - Payback highlights
- Read-only, non-invasive AI feature

### Key Insights & Highlights
- Automatically surfaced insights such as:
  - Largest energy drivers
  - Highest priority ECM
  - Total potential annual savings

### Enhanced PDF Reporting
- AI-generated executive summary included in PDF
- Timestamp and report metadata
- Tool branding

### Assumptions Transparency Panel
- Display of:
  - EUI sources
  - Savings assumptions
  - Cost assumptions
- Improves trust and audit defensibility

---

## Phase 2 – Scenario Exploration & Decision Support

### Actual Usage Comparison
- Upload or enter 12 months of energy usage
- Monthly usage chart:
  - Actual vs modeled baseline
- Highlight variance without recalibration

### Scenario Versioning
- Immutable baseline audit
- Create multiple scenarios (A / B / C)
- Reset to baseline at any time

### Scenario Simulation (Core)
- Toggle ECMs on/off
- Dynamic recalculation of:
  - Total energy savings
  - Total cost savings
  - Implementation cost
  - Simple payback
- Results clearly labeled as indicative

### Before / After Comparison
- Side-by-side comparison:
  - Baseline vs selected scenario
- Visual and numeric deltas

### AI Scenario Interpretation
- Explain:
  - Why savings and payback change
  - Trade-offs between measures
  - Short-term vs long-term impacts
- Interpretation only (no optimization or recommendations)

---

## Phase 3 – Advanced Platform & Enterprise Features

### Utility Bill Upload & OCR
- Upload utility bill PDFs
- Automatic extraction of:
  - kWh
  - demand
  - cost data
- Replace estimated baseline with actual usage

### Incentive & Rebate Matching
- Match ECMs to:
  - State programs
  - Utility incentives
- Net cost estimation after incentives

### Multi-Building / Portfolio View
- Compare multiple buildings
- Benchmark performance
- Aggregate savings potential

### Emissions & Sustainability Metrics
- CO₂ reduction estimates
- ESG and sustainability reporting support

### User Accounts & Roles
- Auditor
- Client
- Admin
- Role-based access control

### Contractor & Implementation Workflow
- Share audit with contractors
- Track implementation status
- Post-implementation savings validation
