// Phase C: Equipment-Based Energy Calculations

import {
  EquipmentInventory,
  HVACUnit,
  LightingZone,
  MajorEquipment,
  HVAC_EFFICIENCY_BENCHMARKS,
} from "./types";

/**
 * Estimate annual HVAC energy consumption
 */
export function calculateHVACEnergy(hvacUnits: HVACUnit[]): number {
  let totalKwh = 0;

  hvacUnits.forEach((unit) => {
    // Convert capacity to kW
    let capacityKw: number;
    switch (unit.capacityUnit) {
      case "tons":
        capacityKw = unit.capacity * 3.517; // 1 ton = 3.517 kW
        break;
      case "BTU/hr":
        capacityKw = unit.capacity / 3412; // BTU/hr to kW
        break;
      case "kW":
        capacityKw = unit.capacity;
        break;
      default:
        capacityKw = unit.capacity * 3.517;
    }

    // Get efficiency factor (lower is worse)
    let efficiencyFactor = 1.0;
    if (unit.efficiencyRating) {
      const benchmark = HVAC_EFFICIENCY_BENCHMARKS[unit.systemType];
      if (benchmark && benchmark.average > 0) {
        if (unit.efficiencyUnit === "AFUE" || unit.efficiencyUnit === "COP") {
          // Higher is better
          efficiencyFactor = benchmark.average / unit.efficiencyRating;
        } else {
          // SEER, EER, HSPF - higher is better
          efficiencyFactor = benchmark.average / unit.efficiencyRating;
        }
      }
    }

    // Age degradation factor (equipment loses ~2% efficiency per year after 10 years)
    const ageFactor = unit.age > 10 ? 1 + (unit.age - 10) * 0.02 : 1.0;

    // Condition factor
    const conditionFactors: Record<string, number> = {
      Excellent: 0.95,
      Good: 1.0,
      Fair: 1.1,
      Poor: 1.25,
    };
    const conditionFactor = conditionFactors[unit.condition] || 1.0;

    // Equivalent full load hours (EFLH) - varies by climate, using moderate estimate
    const eflhCooling = 1000; // hours/year
    const eflhHeating = 800; // hours/year

    // Calculate annual consumption
    const coolingKwh = capacityKw * eflhCooling * efficiencyFactor * ageFactor * conditionFactor;

    // For heating, only add if it's electric
    let heatingKwh = 0;
    if (unit.fuelType === "Electric") {
      const heatingCapacityKw = capacityKw * 0.8; // Rough estimate
      heatingKwh = heatingCapacityKw * eflhHeating * ageFactor * conditionFactor;
    }

    totalKwh += coolingKwh + heatingKwh;
  });

  return Math.round(totalKwh);
}

/**
 * Calculate annual lighting energy consumption
 */
export function calculateLightingEnergy(lightingZones: LightingZone[]): number {
  let totalKwh = 0;

  lightingZones.forEach((zone) => {
    const totalWatts = zone.fixtureCount * zone.wattsPerFixture * zone.lampsPerFixture;
    const totalKw = totalWatts / 1000;
    const hoursPerYear = zone.hoursPerDay * zone.daysPerWeek * 52;

    // Control type adjustment
    const controlFactors: Record<string, number> = {
      "Manual Switch": 1.0,
      "Occupancy Sensor": 0.7,
      "Daylight Sensor": 0.75,
      "Timer": 0.85,
      "Dimmer": 0.8,
      "Smart Control": 0.65,
      "None": 1.1,
    };
    const controlFactor = controlFactors[zone.controlType] || 1.0;

    totalKwh += totalKw * hoursPerYear * controlFactor;
  });

  return Math.round(totalKwh);
}

/**
 * Calculate annual major equipment energy consumption
 */
export function calculateMajorEquipmentEnergy(equipment: MajorEquipment[]): number {
  let totalKwh = 0;

  equipment.forEach((eq) => {
    const hoursPerYear = eq.hoursPerDay * eq.daysPerWeek * 52;

    // VFD savings factor
    const vfdFactor = eq.hasVFD ? 0.75 : 1.0;

    // Condition factor
    const conditionFactors: Record<string, number> = {
      Excellent: 0.95,
      Good: 1.0,
      Fair: 1.1,
      Poor: 1.25,
    };
    const conditionFactor = conditionFactors[eq.condition] || 1.0;

    // Load factor (equipment rarely runs at 100% rated load)
    const loadFactors: Record<string, number> = {
      "Walk-in Cooler": 0.6,
      "Walk-in Freezer": 0.65,
      "Display Case (Refrigerated)": 0.7,
      "Display Case (Frozen)": 0.75,
      "Ice Machine": 0.5,
      "Commercial Refrigerator": 0.5,
      "Commercial Freezer": 0.55,
      "Air Compressor": 0.6,
      "Electric Motor": 0.65,
      "Pump": 0.55,
      "Conveyor": 0.4,
      "Industrial Oven": 0.5,
      "Commercial Kitchen Equipment": 0.4,
      "Data Center / Server Room": 0.85,
      "Electric Vehicle Charger": 0.3,
      "Other": 0.5,
    };
    const loadFactor = loadFactors[eq.equipmentType] || 0.5;

    const annualKwh =
      eq.powerRating * eq.quantity * hoursPerYear * loadFactor * vfdFactor * conditionFactor;

    totalKwh += annualKwh;
  });

  return Math.round(totalKwh);
}

/**
 * Calculate total equipment inventory metrics
 */
export function calculateEquipmentTotals(inventory: EquipmentInventory): {
  totalHVACCapacity: number;
  totalLightingWattage: number;
  totalMajorEquipmentLoad: number;
  estimatedAnnualHVACKwh: number;
  estimatedAnnualLightingKwh: number;
  estimatedAnnualEquipmentKwh: number;
} {
  // Total HVAC capacity in tons
  const totalHVACCapacity = inventory.hvacUnits.reduce((total, unit) => {
    let tons: number;
    switch (unit.capacityUnit) {
      case "tons":
        tons = unit.capacity;
        break;
      case "BTU/hr":
        tons = unit.capacity / 12000;
        break;
      case "kW":
        tons = unit.capacity / 3.517;
        break;
      default:
        tons = unit.capacity;
    }
    return total + tons;
  }, 0);

  // Total lighting wattage
  const totalLightingWattage = inventory.lightingZones.reduce((total, zone) => {
    return total + zone.fixtureCount * zone.wattsPerFixture * zone.lampsPerFixture;
  }, 0);

  // Total major equipment load
  const totalMajorEquipmentLoad = inventory.majorEquipment.reduce((total, eq) => {
    return total + eq.powerRating * eq.quantity;
  }, 0);

  // Estimated annual consumption
  const estimatedAnnualHVACKwh = calculateHVACEnergy(inventory.hvacUnits);
  const estimatedAnnualLightingKwh = calculateLightingEnergy(inventory.lightingZones);
  const estimatedAnnualEquipmentKwh = calculateMajorEquipmentEnergy(inventory.majorEquipment);

  return {
    totalHVACCapacity: Math.round(totalHVACCapacity * 10) / 10,
    totalLightingWattage,
    totalMajorEquipmentLoad: Math.round(totalMajorEquipmentLoad * 10) / 10,
    estimatedAnnualHVACKwh,
    estimatedAnnualLightingKwh,
    estimatedAnnualEquipmentKwh,
  };
}

/**
 * Compare equipment-based estimate to EUI-based estimate
 */
export function compareEquipmentToEUIEstimate(
  equipmentBasedKwh: number,
  euiBasedKwh: number
): {
  variance: number;
  variancePercent: number;
  recommendation: string;
} {
  const variance = equipmentBasedKwh - euiBasedKwh;
  const variancePercent = euiBasedKwh > 0 ? (variance / euiBasedKwh) * 100 : 0;

  let recommendation: string;
  if (Math.abs(variancePercent) <= 15) {
    recommendation =
      "Equipment-based estimate aligns well with the EUI benchmark. The baseline estimate appears reasonable.";
  } else if (variancePercent > 15) {
    recommendation =
      "Equipment-based estimate is higher than the EUI benchmark. This could indicate: older/less efficient equipment, longer operating hours, or additional equipment not typical for this building type.";
  } else {
    recommendation =
      "Equipment-based estimate is lower than the EUI benchmark. This could indicate: newer/efficient equipment, shorter operating hours, or incomplete equipment inventory.";
  }

  return {
    variance,
    variancePercent,
    recommendation,
  };
}

/**
 * Get equipment-specific ECM recommendations
 */
export function getEquipmentECMRecommendations(inventory: EquipmentInventory): {
  category: string;
  recommendation: string;
  estimatedSavings: number;
  priority: "High" | "Medium" | "Low";
}[] {
  const recommendations: {
    category: string;
    recommendation: string;
    estimatedSavings: number;
    priority: "High" | "Medium" | "Low";
  }[] = [];

  // HVAC Recommendations
  inventory.hvacUnits.forEach((unit) => {
    if (unit.age > 15) {
      recommendations.push({
        category: "HVAC",
        recommendation: `Replace aging ${unit.systemType} (${unit.age} years old) with high-efficiency unit`,
        estimatedSavings: 0.25, // 25% of unit's consumption
        priority: "High",
      });
    }
    if (unit.condition === "Poor") {
      recommendations.push({
        category: "HVAC",
        recommendation: `Service or replace ${unit.systemType} in poor condition`,
        estimatedSavings: 0.15,
        priority: "High",
      });
    }
    if (!unit.hasSmartThermostat) {
      recommendations.push({
        category: "HVAC",
        recommendation: `Install smart thermostat for ${unit.systemType}`,
        estimatedSavings: 0.1,
        priority: "Medium",
      });
    }
  });

  // Lighting Recommendations
  inventory.lightingZones.forEach((zone) => {
    if (
      zone.fixtureType === "Fluorescent T12" ||
      zone.fixtureType === "Incandescent" ||
      zone.fixtureType === "Halogen"
    ) {
      recommendations.push({
        category: "Lighting",
        recommendation: `Upgrade ${zone.zoneName} from ${zone.fixtureType} to LED`,
        estimatedSavings: 0.5,
        priority: "High",
      });
    }
    if (zone.controlType === "Manual Switch" || zone.controlType === "None") {
      recommendations.push({
        category: "Lighting",
        recommendation: `Add occupancy sensors to ${zone.zoneName}`,
        estimatedSavings: 0.3,
        priority: "Medium",
      });
    }
  });

  // Equipment Recommendations
  inventory.majorEquipment.forEach((eq) => {
    if (
      (eq.equipmentType === "Air Compressor" ||
        eq.equipmentType === "Electric Motor" ||
        eq.equipmentType === "Pump") &&
      !eq.hasVFD
    ) {
      recommendations.push({
        category: "Equipment",
        recommendation: `Install VFD on ${eq.description || eq.equipmentType}`,
        estimatedSavings: 0.25,
        priority: "Medium",
      });
    }
    if (eq.condition === "Poor" && eq.powerRating > 5) {
      recommendations.push({
        category: "Equipment",
        recommendation: `Replace ${eq.description || eq.equipmentType} in poor condition`,
        estimatedSavings: 0.2,
        priority: "High",
      });
    }
  });

  return recommendations;
}

/**
 * Get equipment inventory summary
 */
export function getEquipmentSummary(inventory: EquipmentInventory): string {
  const hvacCount = inventory.hvacUnits.length;
  const lightingZoneCount = inventory.lightingZones.length;
  const equipmentCount = inventory.majorEquipment.length;

  const parts: string[] = [];

  if (hvacCount > 0) {
    const avgAge = Math.round(
      inventory.hvacUnits.reduce((sum, u) => sum + u.age, 0) / hvacCount
    );
    parts.push(`${hvacCount} HVAC unit(s) (avg. ${avgAge} years old)`);
  }

  if (lightingZoneCount > 0) {
    const totalFixtures = inventory.lightingZones.reduce(
      (sum, z) => sum + z.fixtureCount,
      0
    );
    parts.push(`${totalFixtures} lighting fixtures across ${lightingZoneCount} zone(s)`);
  }

  if (equipmentCount > 0) {
    parts.push(`${equipmentCount} major equipment item(s)`);
  }

  return parts.length > 0 ? parts.join(", ") : "No equipment inventory entered";
}
