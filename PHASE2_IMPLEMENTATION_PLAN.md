# Phase 2 Implementation Plan
## Scenario Exploration & Decision Support

---

## Implementation Order (Recommended)

### **Priority 1: Scenario Versioning & ECM Toggle (Foundation)**
**Why First:** All other Phase 2 features depend on this. It establishes the baseline/scenario separation and enables ECM selection.

### **Priority 2: Scenario Simulation Logic (Core Calculation)**
**Why Second:** Once we can toggle ECMs, we need to recalculate totals dynamically. This is pure logic - no UI changes to existing components.

### **Priority 3: Before/After Comparison UI**
**Why Third:** Visual comparison requires both baseline and scenario data to exist. Builds on Priority 1 & 2.

### **Priority 4: Actual Usage Comparison**
**Why Fourth:** Standalone feature that doesn't affect other Phase 2 features. Can be developed in parallel but prioritized after core scenario features.

### **Priority 5: AI Scenario Interpretation**
**Why Last:** Requires scenarios to exist and be meaningful. Uses existing AI infrastructure from Phase 1.

---

## Feature 1: Scenario Versioning & ECM Toggle

### Objective
Enable users to create scenario variations of the baseline audit by selectively enabling/disabling ECMs, while preserving baseline immutability.

### Design Overview

#### Data Model
```typescript
// New types to add to lib/types.ts
export interface Scenario {
  id: string; // UUID or timestamp-based ID
  name: string; // User-provided name (e.g., "Scenario A", "LED Only")
  enabledECMIds: Set<string>; // IDs of enabled ECMs (based on ECM name as stable ID)
  createdAt: Date;
}

export interface ScenarioState {
  baselineECMs: ECMResult[]; // Immutable baseline (read-only)
  currentScenario: Scenario | null; // Active scenario (null = baseline view)
  scenarios: Scenario[]; // All user-created scenarios
}

// Enhanced ECMResult for UI interaction
export interface InteractiveECMResult extends ECMResult {
  id: string; // Stable identifier (ECM name)
  enabled: boolean; // Whether this ECM is enabled in current scenario
}
```

#### State Management Strategy
- **Baseline remains in `app/page.tsx`** - no changes to existing state
- **New scenario state added separately** - never modifies baseline values
- **Scenario calculations are computed on-demand** - no persistence needed (client-side only for now)

#### Component Architecture

```
AuditResults (existing, unchanged)
  ├── ScenarioControls (NEW) - Scenario management UI
  │   ├── Create Scenario button
  │   ├── Scenario selector dropdown
  │   ├── Reset to Baseline button
  │   └── Scenario name editor
  │
  ├── ECMTable (MODIFIED) - Add toggle checkboxes
  │   ├── Checkbox per row (enabled/disabled state)
  │   ├── Visual indicator for baseline vs scenario
  │   └── Read-only mode when viewing baseline
  │
  └── TotalSavingsSummaryCard (MODIFIED) - Show scenario vs baseline
      ├── Conditional label: "Baseline" or "Scenario: [name]"
      ├── Visual indicator (badge) for scenario view
      └── Values update based on enabled ECMs
```

#### Calculation Logic (Pure Functions)

```typescript
// lib/scenarios/scenarioCalculations.ts (NEW FILE)
/**
 * Calculates scenario totals from enabled ECMs only.
 * This function does NOT modify baseline data - it filters and aggregates.
 */
export function calculateScenarioTotals(
  baselineECMs: ECMResult[],
  enabledECMIds: Set<string>
): {
  totalEnergySavings: number;
  totalCostSavings: number;
  totalImplementationCost: number;
  blendedPaybackPeriod: number;
} {
  const enabledECMs = baselineECMs.filter(ecm => 
    enabledECMIds.has(ecm.name) // Using name as stable ID
  );
  
  // Same aggregation logic as TotalSavingsSummaryCard (reusable)
  const totalEnergySavings = enabledECMs.reduce((sum, ecm) => sum + ecm.energySaved, 0);
  const totalCostSavings = enabledECMs.reduce((sum, ecm) => sum + ecm.costSaved, 0);
  const totalImplementationCost = enabledECMs.reduce((sum, ecm) => sum + ecm.implementationCost, 0);
  const blendedPaybackPeriod = totalCostSavings > 0 
    ? totalImplementationCost / totalCostSavings 
    : Infinity;
  
  return {
    totalEnergySavings,
    totalCostSavings,
    totalImplementationCost,
    blendedPaybackPeriod,
  };
}

/**
 * Creates a new scenario with all ECMs enabled by default.
 */
export function createInitialScenario(name: string, baselineECMs: ECMResult[]): Scenario {
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    enabledECMIds: new Set(baselineECMs.map(ecm => ecm.name)),
    createdAt: new Date(),
  };
}
```

---

## Minimal File Changes for Feature 1

### New Files
1. `lib/types.ts` - **ADD** Scenario types (no modification to existing types)
2. `lib/scenarios/scenarioCalculations.ts` - **NEW** Pure calculation functions
3. `components/ScenarioControls.tsx` - **NEW** Scenario management UI
4. `components/ScenarioECMTable.tsx` - **NEW** ECM table with toggle support (wrapper around existing ECMTable)

### Modified Files
1. `app/page.tsx` - **ADD** scenario state management (no changes to baseline state)
2. `components/AuditResults.tsx` - **ADD** ScenarioControls integration, pass scenario state to child components
3. `components/TotalSavingsSummaryCard.tsx` - **MODIFY** Accept scenario data and show conditional labels

### Unchanged Files (Phase 0 & Phase 1 Protected)
- `lib/calculations.ts` - **NO CHANGES** (baseline calculations remain untouched)
- `lib/data.ts` - **NO CHANGES** (ECM definitions remain untouched)
- `lib/types.ts` - Existing types remain unchanged (only additions)
- `components/ECMTable.tsx` - **NO CHANGES** (create new component instead)
- All other Phase 0/1 components - **NO CHANGES**

---

## Guardrails & Safety Measures

### 1. Baseline Immutability
- **Rule:** Baseline audit data (`annualEnergyUse`, `annualEnergyCost`, `endUseBreakdown`, `ecmResults`) in `app/page.tsx` are **read-only** for scenarios
- **Implementation:** 
  - Create separate state for scenarios (`scenarioState`)
  - Never call `setEcmResults()`, `setAnnualEnergyUse()`, etc. after initial calculation
  - All scenario calculations filter/aggregate baseline data only

### 2. Calculation Integrity
- **Rule:** No new savings formulas. Only recombine existing ECM values.
- **Implementation:**
  - `calculateScenarioTotals()` uses same aggregation logic as `TotalSavingsSummaryCard`
  - No new calculations beyond summing enabled ECMs
  - Individual ECM values (energySaved, costSaved, etc.) come from baseline only

### 3. Visual Indicators
- **Rule:** All scenario outputs must be clearly labeled as indicative/scenario-based
- **Implementation:**
  - Scenario view shows badge: "Scenario: [name]" or "Indicative"
  - Baseline view shows badge: "Baseline" or "Audit Results"
  - Color coding: Baseline = default, Scenario = distinct color (e.g., blue accent)
  - Tooltip/help text: "These values are based on selected measures only"

### 4. Code Organization
- **Rule:** Phase 2 code must be clearly separated and additive
- **Implementation:**
  - New files in `lib/scenarios/` directory
  - New components prefixed or clearly named (e.g., `ScenarioControls.tsx`)
  - Comments mark Phase 2 additions: `// PHASE 2: Scenario feature`
  - No refactoring of Phase 0/1 code

### 5. User Experience Guardrails
- **Rule:** Users must be able to return to baseline at any time
- **Implementation:**
  - "Reset to Baseline" button always visible when in scenario view
  - Baseline view is default after audit submission
  - Scenario creation is explicit (button click, not automatic)

### 6. Data Validation
- **Rule:** Prevent invalid scenario states
- **Implementation:**
  - Scenarios cannot be created without baseline audit
  - Empty scenarios (no ECMs enabled) are allowed but show $0 totals with warning
  - ECM IDs use stable identifiers (ECM name) to prevent mismatches

---

## UI/UX Design for Feature 1

### ScenarioControls Component Layout
```
┌─────────────────────────────────────────────────┐
│ [Baseline] ▼  [Create Scenario]  [Reset]       │
└─────────────────────────────────────────────────┘

When scenario is active:
┌─────────────────────────────────────────────────┐
│ [Scenario: LED Only] ▼  [Create Scenario]  [Reset to Baseline] │
└─────────────────────────────────────────────────┘
```

### ECMTable Enhancement
```
┌─────────────────────────────────────────────────────────────┐
│ Savings Opportunities                    [Baseline View]    │
├──────┬──────────────────────────────────────────────────────┤
│ ☑    │ LED Lighting Upgrade    │ 5,000 kWh │ $750 │ ...    │
│ ☐    │ HVAC Optimization       │ 2,000 kWh │ $300 │ ...    │
│ ☑    │ Weatherization          │ 1,000 kWh │ $500 │ ...    │
└──────┴──────────────────────────────────────────────────────┘
```

**Visual States:**
- Baseline view: Checkboxes disabled (read-only), grayed out
- Scenario view: Checkboxes enabled, user can toggle
- Visual distinction: Scenario table has subtle blue border or background tint

### TotalSavingsSummaryCard Enhancement
```
┌─────────────────────────────────────────────────┐
│ Total Savings Summary          [Scenario View]  │
│ Scenario: LED Only (Indicative)                 │
├─────────────────────────────────────────────────┤
│ Total Annual Energy Savings: 6,000 kWh/year     │
│ Total Annual Cost Savings: $1,050/year          │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests (Future)
- `calculateScenarioTotals()` with various enabled ECM combinations
- Empty scenario handling
- Baseline data immutability verification

### Manual Testing Checklist
1. ✅ Baseline audit displays correctly (no regression)
2. ✅ Create scenario → all ECMs enabled by default
3. ✅ Toggle ECMs → totals update immediately
4. ✅ Reset to baseline → returns to original view
5. ✅ Multiple scenarios can be created
6. ✅ Scenario name persists
7. ✅ Visual indicators clear (baseline vs scenario)
8. ✅ PDF export still works (should export baseline only in Phase 1)

---

## Next Steps After Feature 1

Once Scenario Versioning & ECM Toggle is complete and tested:
1. **Feature 2:** Implement Before/After Comparison UI
2. **Feature 3:** Add Actual Usage Comparison (can be parallel)
3. **Feature 4:** Integrate AI Scenario Interpretation

---

## Questions for Review

1. **Scenario Naming:** Should users name scenarios, or auto-generate (Scenario A, B, C)?
2. **Scenario Persistence:** Keep scenarios in memory only (current plan), or add localStorage for session persistence?
3. **PDF Export:** Should Phase 2 scenarios be included in PDF, or PDF remains baseline-only?
4. **Multiple Scenarios:** Maximum number of scenarios? Or unlimited?

---

**Status:** Ready for review and approval before implementation

