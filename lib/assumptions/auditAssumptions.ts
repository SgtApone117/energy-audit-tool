import { DEFAULT_ELECTRICITY_RATE } from "../data";

/**
 * Assumption content definitions for the Assumptions & Methodology panel.
 * All values are read-only and reflect Phase 0 configuration exactly.
 */

export interface AssumptionCategory {
  title: string;
  items: string[];
}

/**
 * Generates assumption categories based on Phase 0 configuration.
 * This function is read-only and only formats existing values.
 */
export function getAuditAssumptions(electricityRate: number = DEFAULT_ELECTRICITY_RATE): AssumptionCategory[] {
  return [
    {
      title: "Energy Modeling Assumptions",
      items: [
        "Energy use is estimated using industry-standard Energy Use Intensity (EUI) benchmarks by building type.",
        "Building size and type are the primary normalization factors for energy estimation.",
        "EUI is adjusted based on building age: +15% for pre-2000 construction, baseline for 2000-2010, -10% for post-2010 (reflecting improved building codes and equipment efficiency).",
        "EUI is further adjusted based on climate zone derived from ZIP code: +15-20% for extreme climates (hot/cold), +5-10% for moderate climates.",
        "Results represent typical operating conditions and may not reflect actual utility bills.",
        "EUI values are derived from industry-standard reference data for similar building types.",
      ],
    },
    {
      title: "Utility Rate Assumptions",
      items: [
        `Electricity rate used: $${electricityRate.toFixed(2)} per kWh.`,
        "Electricity rates are determined by state based on ZIP code input, using EIA state average data.",
        "If no ZIP code is provided, the US national average rate is used as fallback.",
        "Rates are assumed constant for modeling purposes and do not account for time-of-use pricing, demand charges, or rate escalation.",
        "Actual utility rates may vary by utility provider, rate schedule, and season.",
      ],
    },
    {
      title: "Savings Estimation Assumptions",
      items: [
        "Energy Conservation Measure (ECM) savings are estimated using standard engineering assumptions and typical performance factors.",
        "Savings percentages are based on industry-standard estimates for each measure type.",
        "Savings are indicative and may vary based on actual usage patterns, installation quality, and operational practices.",
        "Interactive effects between multiple measures are not modeled; savings are calculated independently for each measure.",
      ],
    },
    {
      title: "Cost & Payback Assumptions",
      items: [
        "Implementation costs are estimated using average cost-per-square-foot assumptions for each measure type.",
        "Payback periods are calculated using simple payback methodology (implementation cost ÷ annual cost savings).",
        "Financing costs, incentives, rebates, and tax implications are not included in the analysis.",
        "Energy cost escalation and inflation are not factored into payback calculations.",
        "Priority rankings are based solely on payback period thresholds (High: <2 years, Medium: 2-4 years, Low: >4 years).",
      ],
    },
    {
      title: "General Limitations",
      items: [
        "These results are modeled estimates and are not a substitute for on-site engineering analysis or actual utility bill data.",
        "Actual energy performance may differ based on building operations, maintenance practices, occupancy patterns, and local climate conditions.",
        "Further validation through on-site assessment, utility bill analysis, and professional engineering review is recommended prior to implementation.",
        "The analysis does not account for building-specific factors such as equipment age, condition, or unique operational requirements.",
      ],
    },
  ];
}

