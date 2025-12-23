/**
 * Auto ECM Recommendation Generator
 * Generates energy conservation measure recommendations based on audit findings and equipment
 */

import { 
  AuditData, 
  AuditECM, 
  AuditFinding, 
  AuditHVACUnit, 
  AuditLightingZone,
  AuditEquipment,
  FindingPriority,
  PhotoCategory,
  generateId 
} from './types';

interface ECMTemplate {
  id: string;
  title: string;
  description: string;
  category: PhotoCategory;
  trigger: (audit: AuditData) => boolean;
  calculate: (audit: AuditData) => {
    savingsLow: number;
    savingsHigh: number;
    costLow: number;
    costHigh: number;
    priority: FindingPriority;
  };
  getRelatedEquipment: (audit: AuditData) => string[];
}

// ECM Templates based on common audit findings
const ECM_TEMPLATES: ECMTemplate[] = [
  // HVAC ECMs
  {
    id: 'hvac-old-unit-replacement',
    title: 'Replace Aging HVAC Equipment',
    description: 'HVAC units over 15 years old are significantly less efficient than modern equipment. Replacing with high-efficiency units can reduce HVAC energy use by 20-40%.',
    category: 'hvac',
    trigger: (audit) => audit.hvacUnits.some(u => (u.age || 0) >= 15),
    calculate: (audit) => {
      const oldUnits = audit.hvacUnits.filter(u => (u.age || 0) >= 15);
      const totalCapacity = oldUnits.reduce((sum, u) => sum + (u.capacity || 5), 0);
      const costPerTon = 3500; // Rough estimate
      const annualHVACCost = estimateAnnualHVACCost(audit);
      return {
        savingsLow: annualHVACCost * 0.15,
        savingsHigh: annualHVACCost * 0.35,
        costLow: totalCapacity * costPerTon * 0.8,
        costHigh: totalCapacity * costPerTon * 1.2,
        priority: oldUnits.some(u => (u.age || 0) >= 20) ? 'high' : 'medium',
      };
    },
    getRelatedEquipment: (audit) => audit.hvacUnits.filter(u => (u.age || 0) >= 15).map(u => u.id),
  },
  {
    id: 'hvac-poor-condition',
    title: 'Service/Repair HVAC Units in Poor Condition',
    description: 'HVAC units in poor condition operate inefficiently and may fail unexpectedly. Professional service can restore efficiency and prevent costly breakdowns.',
    category: 'hvac',
    trigger: (audit) => audit.hvacUnits.some(u => u.condition === 'poor'),
    calculate: (audit) => {
      const poorUnits = audit.hvacUnits.filter(u => u.condition === 'poor');
      const annualHVACCost = estimateAnnualHVACCost(audit);
      return {
        savingsLow: annualHVACCost * 0.05 * poorUnits.length,
        savingsHigh: annualHVACCost * 0.15 * poorUnits.length,
        costLow: 200 * poorUnits.length,
        costHigh: 800 * poorUnits.length,
        priority: 'high',
      };
    },
    getRelatedEquipment: (audit) => audit.hvacUnits.filter(u => u.condition === 'poor').map(u => u.id),
  },
  {
    id: 'smart-thermostat',
    title: 'Install Smart/Programmable Thermostats',
    description: 'Smart thermostats can reduce heating and cooling costs by 10-15% through optimized scheduling and setback temperatures.',
    category: 'hvac',
    trigger: (audit) => audit.hvacUnits.length > 0 && !audit.hvacUnits.every(u => u.hasSmartThermostat),
    calculate: (audit) => {
      const unitsWithoutSmart = audit.hvacUnits.filter(u => !u.hasSmartThermostat);
      const annualHVACCost = estimateAnnualHVACCost(audit);
      return {
        savingsLow: annualHVACCost * 0.08,
        savingsHigh: annualHVACCost * 0.15,
        costLow: 150 * unitsWithoutSmart.length,
        costHigh: 350 * unitsWithoutSmart.length,
        priority: 'medium',
      };
    },
    getRelatedEquipment: (audit) => audit.hvacUnits.filter(u => !u.hasSmartThermostat).map(u => u.id),
  },

  // Lighting ECMs
  {
    id: 'led-retrofit',
    title: 'LED Lighting Retrofit',
    description: 'Replace fluorescent, incandescent, or HID lighting with LED. LEDs use 50-75% less energy and last 3-5x longer.',
    category: 'lighting',
    trigger: (audit) => audit.lightingZones.some(z => 
      z.fixtureType.toLowerCase().includes('fluorescent') ||
      z.fixtureType.toLowerCase().includes('incandescent') ||
      z.fixtureType.toLowerCase().includes('hid') ||
      z.fixtureType.toLowerCase().includes('t8') ||
      z.fixtureType.toLowerCase().includes('t12')
    ),
    calculate: (audit) => {
      const nonLEDZones = audit.lightingZones.filter(z => 
        !z.fixtureType.toLowerCase().includes('led')
      );
      const totalFixtures = nonLEDZones.reduce((sum, z) => sum + z.fixtureCount, 0);
      const totalWatts = nonLEDZones.reduce((sum, z) => sum + (z.fixtureCount * (z.wattsPerFixture || 40)), 0);
      const avgHours = 10; // hours per day
      const annualKwh = (totalWatts * avgHours * 260) / 1000; // 260 working days
      const savingsPercent = 0.5; // 50% reduction with LED
      const rate = 0.12; // $/kWh
      
      return {
        savingsLow: annualKwh * savingsPercent * rate * 0.8,
        savingsHigh: annualKwh * savingsPercent * rate * 1.2,
        costLow: totalFixtures * 30,
        costHigh: totalFixtures * 80,
        priority: totalFixtures > 20 ? 'high' : 'medium',
      };
    },
    getRelatedEquipment: (audit) => audit.lightingZones.filter(z => 
      !z.fixtureType.toLowerCase().includes('led')
    ).map(z => z.id),
  },
  {
    id: 'occupancy-sensors',
    title: 'Install Occupancy Sensors',
    description: 'Occupancy sensors automatically turn off lights in unoccupied spaces. Typical savings of 15-30% on lighting energy.',
    category: 'lighting',
    trigger: (audit) => audit.lightingZones.some(z => 
      z.controlType.toLowerCase() === 'switch' ||
      z.controlType.toLowerCase() === 'manual'
    ),
    calculate: (audit) => {
      const manualZones = audit.lightingZones.filter(z => 
        z.controlType.toLowerCase() === 'switch' ||
        z.controlType.toLowerCase() === 'manual'
      );
      const totalFixtures = manualZones.reduce((sum, z) => sum + z.fixtureCount, 0);
      const totalWatts = manualZones.reduce((sum, z) => sum + (z.fixtureCount * (z.wattsPerFixture || 40)), 0);
      const avgHours = 10;
      const annualKwh = (totalWatts * avgHours * 260) / 1000;
      const savingsPercent = 0.2;
      const rate = 0.12;
      
      return {
        savingsLow: annualKwh * savingsPercent * rate * 0.7,
        savingsHigh: annualKwh * savingsPercent * rate * 1.3,
        costLow: manualZones.length * 50,
        costHigh: manualZones.length * 150,
        priority: 'medium',
      };
    },
    getRelatedEquipment: (audit) => audit.lightingZones.filter(z => 
      z.controlType.toLowerCase() === 'switch' ||
      z.controlType.toLowerCase() === 'manual'
    ).map(z => z.id),
  },

  // Refrigeration ECMs
  {
    id: 'refrigeration-maintenance',
    title: 'Refrigeration System Maintenance',
    description: 'Regular maintenance including coil cleaning, gasket inspection, and refrigerant charge check can improve efficiency by 10-20%.',
    category: 'refrigeration',
    trigger: (audit) => audit.equipment.some(e => 
      e.equipmentType.toLowerCase().includes('refrig') ||
      e.equipmentType.toLowerCase().includes('cooler') ||
      e.equipmentType.toLowerCase().includes('freezer')
    ),
    calculate: (audit) => {
      const refrigEquip = audit.equipment.filter(e => 
        e.equipmentType.toLowerCase().includes('refrig') ||
        e.equipmentType.toLowerCase().includes('cooler') ||
        e.equipmentType.toLowerCase().includes('freezer')
      );
      const count = refrigEquip.reduce((sum, e) => sum + e.quantity, 0);
      
      return {
        savingsLow: count * 100,
        savingsHigh: count * 300,
        costLow: count * 75,
        costHigh: count * 200,
        priority: 'low',
      };
    },
    getRelatedEquipment: (audit) => audit.equipment.filter(e => 
      e.equipmentType.toLowerCase().includes('refrig') ||
      e.equipmentType.toLowerCase().includes('cooler') ||
      e.equipmentType.toLowerCase().includes('freezer')
    ).map(e => e.id),
  },
];

// Helper to estimate annual HVAC cost based on building size and type
function estimateAnnualHVACCost(audit: AuditData): number {
  const sqft = audit.buildingInfo.squareFootage || 5000;
  // Rough estimate: HVAC is about 40% of energy, at ~$1.50/sqft total energy cost
  return sqft * 1.5 * 0.4;
}

// Generate ECM recommendations from audit data
export function generateECMRecommendations(audit: AuditData): AuditECM[] {
  const ecms: AuditECM[] = [];

  // Run each template
  for (const template of ECM_TEMPLATES) {
    if (template.trigger(audit)) {
      const calc = template.calculate(audit);
      
      // Only include if meaningful savings
      if (calc.savingsHigh >= 50) {
        const avgSavings = (calc.savingsLow + calc.savingsHigh) / 2;
        const avgCost = (calc.costLow + calc.costHigh) / 2;
        const payback = avgCost > 0 && avgSavings > 0 ? avgCost / avgSavings : 99;

        ecms.push({
          id: generateId(),
          title: template.title,
          description: template.description,
          category: template.category,
          priority: calc.priority,
          annualSavingsLow: Math.round(calc.savingsLow),
          annualSavingsHigh: Math.round(calc.savingsHigh),
          implementationCostLow: Math.round(calc.costLow),
          implementationCostHigh: Math.round(calc.costHigh),
          paybackYears: Math.min(payback, 25),
          source: 'auto',
          relatedFindingIds: [],
          relatedEquipmentIds: template.getRelatedEquipment(audit),
        });
      }
    }
  }

  // Also convert findings with savings estimates to ECMs
  for (const finding of (audit.findings || [])) {
    if (finding.estimatedSavings && finding.estimatedSavings >= 50) {
      ecms.push({
        id: generateId(),
        title: finding.title,
        description: finding.description || finding.recommendation || '',
        category: finding.category as PhotoCategory,
        priority: finding.priority,
        annualSavingsLow: finding.estimatedSavings * 0.7,
        annualSavingsHigh: finding.estimatedSavings * 1.3,
        implementationCostLow: (finding.estimatedCost || 0) * 0.8,
        implementationCostHigh: (finding.estimatedCost || 0) * 1.2,
        paybackYears: finding.estimatedCost && finding.estimatedSavings 
          ? Math.min(finding.estimatedCost / finding.estimatedSavings, 25)
          : 0,
        source: 'manual',
        relatedFindingIds: [finding.id],
        relatedEquipmentIds: [],
      });
    }
  }

  // Sort by priority and payback
  ecms.sort((a, b) => {
    const priorityOrder: Record<FindingPriority, number> = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.paybackYears - b.paybackYears;
  });

  return ecms;
}

// Calculate total potential savings
export function calculateTotalSavings(ecms: AuditECM[]): {
  totalSavingsLow: number;
  totalSavingsHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  avgPayback: number;
} {
  const totalSavingsLow = ecms.reduce((sum, e) => sum + e.annualSavingsLow, 0);
  const totalSavingsHigh = ecms.reduce((sum, e) => sum + e.annualSavingsHigh, 0);
  const totalCostLow = ecms.reduce((sum, e) => sum + e.implementationCostLow, 0);
  const totalCostHigh = ecms.reduce((sum, e) => sum + e.implementationCostHigh, 0);
  
  const avgSavings = (totalSavingsLow + totalSavingsHigh) / 2;
  const avgCost = (totalCostLow + totalCostHigh) / 2;
  const avgPayback = avgSavings > 0 ? avgCost / avgSavings : 0;

  return {
    totalSavingsLow,
    totalSavingsHigh,
    totalCostLow,
    totalCostHigh,
    avgPayback,
  };
}
