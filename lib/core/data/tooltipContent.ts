export const TOOLTIP_CONTENT = {
  businessBasics: {
    businessName: "Your company or building name as it appears on utility bills",
    businessType: "Select the category that best describes your primary business activity",
    squareFootage: "Total conditioned floor area in square feet (check lease or property records)",
    yearBuilt: "Approximate year the building was constructed",
    zipCode: "Used to determine your climate zone and local utility rates",
    numberOfFloors: "Total floors including basement if conditioned",
    numberOfEmployees: "Average number of people in the building during business hours",
  },

  utilityBills: {
    monthYear: "The billing period for this utility statement",
    electricityKwh: "Total kilowatt-hours from your electric bill",
    electricityCost: "Total amount paid for electricity including all fees",
    naturalGasTherms: "Total therms from your gas bill (1 therm = 100,000 BTU)",
    gasCost: "Total amount paid for natural gas including all fees",
    csvUpload: "Upload utility bills exported from your utility provider portal. Accepted formats: CSV files with columns for date, usage, and cost.",
  },

  equipment: {
    hvac: {
      systemType: "Main heating/cooling equipment type (e.g., rooftop unit, split system)",
      fuelType: "Primary energy source for this HVAC system",
      age: "Approximate age - check nameplate for manufacture date",
      tonnage: "Cooling capacity in tons (1 ton = 12,000 BTU/hr)",
      hasSmartThermostat: "Programmable or WiFi-connected thermostat installed",
    },
    lighting: {
      primaryFixtureType: "Most common type of lighting in your space",
      totalFixtures: "Approximate count of all light fixtures",
      bulbType: "Type of lamps installed (LED, fluorescent, incandescent)",
    },
    refrigeration: {
      walkInCoolers: "Number of walk-in refrigerated units (above 32°F)",
      walkInFreezers: "Number of walk-in frozen storage units (below 32°F)",
      displayCases: "Refrigerated display cases for products",
      reachInUnits: "Standard commercial refrigerators and freezers",
    },
    cooking: {
      cookingEquipment: "Types of commercial cooking equipment (ovens, fryers, etc.)",
      quantity: "Number of each equipment type",
      fuelType: "Electric or gas powered",
    },
  },

  operatingSchedule: {
    openTime: "Typical time business operations begin",
    closeTime: "Typical time business operations end",
    daysOpen: "Days per week the facility is occupied/operating",
    holidays: "Approximate number of closed holidays per year",
  },

  auditor: {
    lighting: {
      zoneName: "Location description (e.g., 'Main Office', 'Warehouse Bay 1')",
      fixtureCount: "Total number of fixtures in this zone - count carefully!",
      lampsPerFixture: "Number of lamps/tubes in each fixture (typically 2-4 for troffers)",
      lampType: "T12, T8, T5, LED, etc. - check lamp markings",
      ballastType: "Electronic (newer) or Magnetic (older, heavier) - may need to open fixture",
      wattsPerLamp: "Wattage of individual lamp - check lamp markings (e.g., 32W for standard T8)",
      ballastFactor: "Multiplier for ballast efficiency (0.78-1.18, electronic typically 0.88)",
      lampsOut: "CRITICAL: Number of individual lamps not working - affects baseline calculation",
      dlcListed: "Confirm product is on DesignLights Consortium qualified products list",
      dlcProductId: "DLC QPL product ID from manufacturer documentation",
    },
  },
};
