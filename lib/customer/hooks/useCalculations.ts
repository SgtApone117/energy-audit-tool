'use client';

import { useMemo } from 'react';
import {
  CustomerAssessmentForm,
  CustomerAssessmentResults,
  EnergyScore,
  ConfidenceLevel,
  MonthlyPattern,
  SeasonalAnalysis,
  PeakAnalysis,
  RateAnalysis,
  Anomaly,
  QuickWin,
  ECMRecommendation,
  Insight,
  EndUseBreakdown,
} from '../types';
import { getStateFromZip } from '@/lib/core/data/zipToState';
import { getUtilityRates } from '@/lib/core/data/utilityRates';
import { EUI_BENCHMARK_RANGES, getEUIContextLabel } from '@/lib/core/benchmarks/euiBenchmarks';
import { ENHANCED_ECM_DEFINITIONS, getApplicableECMs } from '@/lib/core/ecm/ecmDefinitions';
import type { BusinessType } from '@/lib/core/types';

interface UseCalculationsReturn {
  results: CustomerAssessmentResults | null;
  isReady: boolean;
}

export function useCalculations(formData: CustomerAssessmentForm | null): UseCalculationsReturn {
  const results = useMemo(() => {
    if (!formData || !formData.businessType || !formData.squareFootage) {
      return null;
    }

    // Get filled bills
    const filledBills = formData.utilityBills.filter(
      (bill) => bill.electricityKwh !== null && bill.electricityCost !== null
    );

    if (filledBills.length < 3) {
      return null;
    }

    // Calculate totals
    const annualElecKwh = filledBills.reduce((sum, bill) => sum + (bill.electricityKwh || 0), 0);
    const annualElecCost = filledBills.reduce((sum, bill) => sum + (bill.electricityCost || 0), 0);
    const annualGasTherms = filledBills.reduce((sum, bill) => sum + (bill.gasUsage || 0), 0);
    const annualGasCost = filledBills.reduce((sum, bill) => sum + (bill.gasCost || 0), 0);

    // Annualize if less than 12 months
    const monthsProvided = filledBills.length;
    const annualizationFactor = 12 / monthsProvided;
    const annualUsage = annualElecKwh * annualizationFactor;
    const annualCost = (annualElecCost + annualGasCost) * annualizationFactor;

    // Calculate EUI
    const sqft = formData.squareFootage || 1;
    const yourEUI = annualUsage / sqft;

    // Get benchmark data
    const businessType = formData.businessType as BusinessType;
    const benchmark = EUI_BENCHMARK_RANGES[businessType] || EUI_BENCHMARK_RANGES['Other'];
    const typicalEUI = (benchmark.min + benchmark.max) / 2;
    const efficientEUI = benchmark.min * 0.8; // Top 25% is roughly 80% of minimum

    // Calculate percentile (simplified)
    let percentile: number;
    if (yourEUI <= efficientEUI) {
      percentile = 90 + (1 - yourEUI / efficientEUI) * 10;
    } else if (yourEUI <= benchmark.min) {
      percentile = 75 + ((benchmark.min - yourEUI) / (benchmark.min - efficientEUI)) * 15;
    } else if (yourEUI <= typicalEUI) {
      percentile = 50 + ((typicalEUI - yourEUI) / (typicalEUI - benchmark.min)) * 25;
    } else if (yourEUI <= benchmark.max) {
      percentile = 25 + ((benchmark.max - yourEUI) / (benchmark.max - typicalEUI)) * 25;
    } else {
      percentile = Math.max(5, 25 - ((yourEUI - benchmark.max) / benchmark.max) * 25);
    }
    percentile = Math.min(99, Math.max(1, Math.round(percentile)));

    // Energy score
    let energyScore: EnergyScore;
    if (percentile >= 75) energyScore = 'A';
    else if (percentile >= 50) energyScore = 'B';
    else if (percentile >= 25) energyScore = 'C';
    else if (percentile >= 10) energyScore = 'D';
    else energyScore = 'F';

    // Confidence level
    const hasEquipmentData = formData.hvacSystems.length > 0 || 
      formData.lightingDetails !== null || 
      formData.refrigerationEquipment !== null;
    
    let confidence: ConfidenceLevel;
    if (monthsProvided >= 12 && hasEquipmentData) {
      confidence = 'high';
    } else if (monthsProvided >= 6 || (monthsProvided >= 3 && hasEquipmentData)) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Cost per square foot
    const costPerSqFt = annualCost / sqft;

    // Monthly patterns
    const monthlyPatterns: MonthlyPattern[] = filledBills.map((bill) => ({
      month: bill.month,
      usage: bill.electricityKwh || 0,
      cost: (bill.electricityCost || 0) + (bill.gasCost || 0),
      rate: bill.electricityKwh ? (bill.electricityCost || 0) / bill.electricityKwh : 0,
    }));

    // Seasonal analysis
    const getSeason = (month: string): 'summer' | 'fall' | 'winter' | 'spring' => {
      const m = parseInt(month.split('-')[1]);
      if (m >= 6 && m <= 8) return 'summer';
      if (m >= 9 && m <= 11) return 'fall';
      if (m >= 12 || m <= 2) return 'winter';
      return 'spring';
    };

    const seasonalData = { 
      summer: { usage: 0, cost: 0, count: 0 },
      fall: { usage: 0, cost: 0, count: 0 },
      winter: { usage: 0, cost: 0, count: 0 },
      spring: { usage: 0, cost: 0, count: 0 },
    };

    filledBills.forEach((bill) => {
      const season = getSeason(bill.month);
      seasonalData[season].usage += bill.electricityKwh || 0;
      seasonalData[season].cost += (bill.electricityCost || 0) + (bill.gasCost || 0);
      seasonalData[season].count += 1;
    });

    const seasonalAnalysis: SeasonalAnalysis = {
      summer: {
        avgUsage: seasonalData.summer.count ? seasonalData.summer.usage / seasonalData.summer.count : 0,
        avgCost: seasonalData.summer.count ? seasonalData.summer.cost / seasonalData.summer.count : 0,
      },
      fall: {
        avgUsage: seasonalData.fall.count ? seasonalData.fall.usage / seasonalData.fall.count : 0,
        avgCost: seasonalData.fall.count ? seasonalData.fall.cost / seasonalData.fall.count : 0,
      },
      winter: {
        avgUsage: seasonalData.winter.count ? seasonalData.winter.usage / seasonalData.winter.count : 0,
        avgCost: seasonalData.winter.count ? seasonalData.winter.cost / seasonalData.winter.count : 0,
      },
      spring: {
        avgUsage: seasonalData.spring.count ? seasonalData.spring.usage / seasonalData.spring.count : 0,
        avgCost: seasonalData.spring.count ? seasonalData.spring.cost / seasonalData.spring.count : 0,
      },
      highestSeason: 'summer',
      lowestSeason: 'spring',
      seasonalVariation: 0,
    };

    // Find highest and lowest seasons
    const seasonAvgs = [
      { season: 'summer', usage: seasonalAnalysis.summer.avgUsage },
      { season: 'fall', usage: seasonalAnalysis.fall.avgUsage },
      { season: 'winter', usage: seasonalAnalysis.winter.avgUsage },
      { season: 'spring', usage: seasonalAnalysis.spring.avgUsage },
    ].filter(s => s.usage > 0);

    if (seasonAvgs.length > 0) {
      seasonAvgs.sort((a, b) => b.usage - a.usage);
      seasonalAnalysis.highestSeason = seasonAvgs[0].season;
      seasonalAnalysis.lowestSeason = seasonAvgs[seasonAvgs.length - 1].season;
      if (seasonAvgs[seasonAvgs.length - 1].usage > 0) {
        seasonalAnalysis.seasonalVariation = 
          ((seasonAvgs[0].usage - seasonAvgs[seasonAvgs.length - 1].usage) / 
           seasonAvgs[seasonAvgs.length - 1].usage) * 100;
      }
    }

    // Peak analysis
    const usages = filledBills.map(b => b.electricityKwh || 0);
    const peakUsage = Math.max(...usages);
    const peakBill = filledBills.find(b => b.electricityKwh === peakUsage);
    const baseload = Math.min(...usages);
    const avgMonthlyUsage = annualElecKwh / monthsProvided;

    const peakAnalysis: PeakAnalysis = {
      peakMonth: peakBill?.month || '',
      peakUsage,
      baseload,
      baseloadPercentage: avgMonthlyUsage ? (baseload / avgMonthlyUsage) * 100 : 0,
      dailyPeak: peakUsage / 30, // Rough estimate
    };

    // Rate analysis
    const stateCode = formData.zipCode ? getStateFromZip(formData.zipCode) : null;
    const stateRates = stateCode ? getUtilityRates(stateCode) : getUtilityRates('US_AVG');
    const rates = filledBills
      .filter(b => b.electricityKwh && b.electricityCost)
      .map(b => (b.electricityCost || 0) / (b.electricityKwh || 1));

    const rateAnalysis: RateAnalysis = {
      averageRate: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : stateRates.electricity,
      highestRate: rates.length ? Math.max(...rates) : stateRates.electricity,
      lowestRate: rates.length ? Math.min(...rates) : stateRates.electricity,
      stateAverageRate: stateRates.electricity,
      vsStateAverage: rates.length 
        ? ((rates.reduce((a, b) => a + b, 0) / rates.length - stateRates.electricity) / stateRates.electricity) * 100
        : 0,
    };

    // Anomaly detection
    const anomalies: Anomaly[] = [];
    if (filledBills.length >= 6) {
      const mean = annualElecKwh / monthsProvided;
      const variance = usages.reduce((sum, u) => sum + Math.pow(u - mean, 2), 0) / usages.length;
      const stdDev = Math.sqrt(variance);

      filledBills.forEach((bill) => {
        const usage = bill.electricityKwh || 0;
        const deviation = Math.abs(usage - mean) / (stdDev || 1);
        if (deviation > 2) {
          anomalies.push({
            month: bill.month,
            usage,
            expected: mean,
            deviation: ((usage - mean) / mean) * 100,
            possibleCauses: usage > mean 
              ? ['Extreme weather', 'New equipment', 'Extended hours', 'Billing error']
              : ['Vacation/closure', 'Mild weather', 'Equipment off', 'Billing error'],
          });
        }
      });
    }

    // End use breakdown (estimated if no equipment data)
    let endUseBreakdown: EndUseBreakdown | null = null;
    if (hasEquipmentData) {
      // Use equipment data for more accurate breakdown
      let hvacPct = 0.40;
      let lightingPct = 0.15;
      let refrigerationPct = 0.10;
      let cookingPct = 0.05;
      let plugLoadsPct = 0.25;
      let otherPct = 0.05;

      // Adjust based on business type
      if (businessType === 'Restaurant / Food Service') {
        hvacPct = 0.25;
        cookingPct = 0.25;
        refrigerationPct = 0.20;
      } else if (businessType === 'Grocery / Food Market') {
        hvacPct = 0.20;
        refrigerationPct = 0.45;
      } else if (businessType === 'Office') {
        hvacPct = 0.40;
        plugLoadsPct = 0.30;
      }

      endUseBreakdown = {
        hvac: annualUsage * hvacPct,
        lighting: annualUsage * lightingPct,
        refrigeration: annualUsage * refrigerationPct,
        cooking: annualUsage * cookingPct,
        plugLoads: annualUsage * plugLoadsPct,
        other: annualUsage * otherPct,
      };
    }

    // Quick wins
    const quickWins: QuickWin[] = [
      {
        id: 'thermostat',
        action: 'Adjust thermostat by 2°F',
        description: 'Set cooling 2°F higher and heating 2°F lower during occupied hours',
        estimatedSavings: annualCost * 0.03,
        difficulty: 'Easy',
      },
      {
        id: 'lights-off',
        action: 'Turn off lights when not in use',
        description: 'Ensure all lights are turned off in unoccupied areas',
        estimatedSavings: annualCost * 0.02,
        difficulty: 'Easy',
      },
      {
        id: 'equipment-off',
        action: 'Power down equipment at night',
        description: 'Turn off computers, monitors, and non-essential equipment after hours',
        estimatedSavings: annualCost * 0.02,
        difficulty: 'Easy',
      },
      {
        id: 'hvac-filters',
        action: 'Replace HVAC filters',
        description: 'Dirty filters make HVAC systems work harder. Replace monthly or quarterly.',
        estimatedSavings: annualCost * 0.02,
        difficulty: 'Easy',
      },
      {
        id: 'seal-leaks',
        action: 'Seal obvious air leaks',
        description: 'Check for drafts around windows and doors. Use weatherstripping.',
        estimatedSavings: annualCost * 0.01,
        difficulty: 'Medium',
      },
      {
        id: 'coils-clean',
        action: 'Clean refrigerator coils',
        description: 'Dusty coils reduce efficiency. Clean every 3-6 months.',
        estimatedSavings: annualCost * 0.01,
        difficulty: 'Easy',
      },
    ];

    // ECM recommendations
    const applicableECMs = getApplicableECMs(businessType);
    const MAX_PAYBACK_YEARS = 25; // Cap payback at 25 years
    const MIN_ANNUAL_SAVINGS = 50; // Minimum $50/year to show an ECM
    
    const allECMRecommendations: ECMRecommendation[] = applicableECMs.map((ecm) => {
      const categorySavings: Record<string, number> = {
        'Lighting': annualCost * 0.15,
        'HVAC': annualCost * 0.40,
        'Plug Loads': annualCost * 0.15,
        'Refrigeration': annualCost * 0.15,
        'Building Envelope': annualCost * 0.10,
        'Process': annualCost * 0.05,
      };

      const baseSavings = categorySavings[ecm.endUseCategory] || annualCost * 0.10;
      const costLow = sqft * ecm.costPerSqFt.low;
      const costTypical = sqft * ecm.costPerSqFt.typical;
      const costHigh = sqft * ecm.costPerSqFt.high;

      const savingsLow = baseSavings * ecm.savingsPercentage.low;
      const savingsTypical = baseSavings * ecm.savingsPercentage.typical;
      const savingsHigh = baseSavings * ecm.savingsPercentage.high;

      // Calculate payback and cap at reasonable maximum
      let paybackBest = savingsHigh > 0 ? costLow / savingsHigh : MAX_PAYBACK_YEARS;
      let paybackWorst = savingsLow > 0 ? costHigh / savingsLow : MAX_PAYBACK_YEARS;
      
      // Cap payback values at maximum
      paybackBest = Math.min(paybackBest, MAX_PAYBACK_YEARS);
      paybackWorst = Math.min(paybackWorst, MAX_PAYBACK_YEARS);

      let priority: 'high' | 'medium' | 'low';
      const avgPayback = (paybackBest + paybackWorst) / 2;
      if (avgPayback < 3) priority = 'high';
      else if (avgPayback <= 7) priority = 'medium';
      else priority = 'low';

      return {
        id: ecm.id,
        title: ecm.name,
        description: ecm.description,
        priority,
        explanation: `This measure targets ${ecm.endUseCategory.toLowerCase()} energy use, which is a significant portion of your energy costs.`,
        savingsRange: { low: savingsLow, typical: savingsTypical, high: savingsHigh },
        costRange: { low: costLow, typical: costTypical, high: costHigh },
        paybackRange: { best: paybackBest, worst: paybackWorst },
        tenYearReturn: (savingsTypical * 10) - costTypical,
        additionalBenefits: ecm.interactiveEffects.length > 0 
          ? [ecm.interactiveEffects[0].description || 'Additional indirect savings']
          : [],
        calculationBasis: [
          `Based on ${ecm.endUseCategory} portion of your energy use`,
          `Industry-typical savings of ${(ecm.savingsPercentage.typical * 100).toFixed(0)}%`,
          `Implementation cost of $${ecm.costPerSqFt.typical.toFixed(2)}/sqft`,
        ],
      };
    });

    // Filter out ECMs with unrealistic economics (very low savings or very long payback)
    const ecmRecommendations = allECMRecommendations
      .filter(ecm => 
        ecm.savingsRange.typical >= MIN_ANNUAL_SAVINGS && 
        ecm.paybackRange.best < MAX_PAYBACK_YEARS
      )
      .slice(0, 8);

    // Sort by priority and payback
    ecmRecommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.paybackRange.best - b.paybackRange.best;
    });

    // Insights
    const insights: Insight[] = [];

    if (seasonalAnalysis.seasonalVariation > 50) {
      if (seasonalAnalysis.highestSeason === 'summer') {
        insights.push({
          id: 'cooling-focused',
          type: 'cooling-focused',
          message: `Your summer energy use is ${seasonalAnalysis.seasonalVariation.toFixed(0)}% higher than your lowest season.`,
          recommendation: 'Focus on cooling efficiency improvements like smart thermostats and shade/solar control.',
          severity: 'opportunity',
        });
      } else if (seasonalAnalysis.highestSeason === 'winter') {
        insights.push({
          id: 'heating-focused',
          type: 'heating-focused',
          message: `Your winter energy use is ${seasonalAnalysis.seasonalVariation.toFixed(0)}% higher than your lowest season.`,
          recommendation: 'Focus on heating efficiency and building envelope improvements.',
          severity: 'opportunity',
        });
      }
    }

    if (peakAnalysis.baseloadPercentage > 60) {
      insights.push({
        id: 'baseload-high',
        type: 'baseload-high',
        message: `Your baseload represents ${peakAnalysis.baseloadPercentage.toFixed(0)}% of average consumption.`,
        recommendation: 'High baseload suggests significant always-on equipment. Consider plug load management.',
        severity: 'warning',
      });
    }

    if (rateAnalysis.vsStateAverage > 15) {
      insights.push({
        id: 'rate-high',
        type: 'rate-high',
        message: `You're paying ${rateAnalysis.vsStateAverage.toFixed(0)}% more than the state average rate.`,
        recommendation: 'Consider shopping for a better rate or reviewing your utility tariff structure.',
        severity: 'warning',
      });
    }

    if (percentile < 25) {
      insights.push({
        id: 'above-average',
        type: 'equipment-old',
        message: `Your energy use is higher than ${100 - percentile}% of similar businesses.`,
        recommendation: 'There may be significant savings opportunities through efficiency upgrades.',
        severity: 'opportunity',
      });
    }

    return {
      annualCost,
      annualUsage,
      costPerSqFt,
      energyScore,
      confidence,
      yourEUI,
      typicalEUI,
      efficientEUI,
      percentile,
      endUseBreakdown,
      hasEquipmentData,
      monthlyPatterns,
      seasonalAnalysis,
      peakAnalysis,
      rateAnalysis,
      anomalies,
      quickWins,
      ecmRecommendations,
      insights,
    };
  }, [formData]);

  return {
    results,
    isReady: results !== null,
  };
}
