/**
 * Centralized tooltip content for all forms across the application.
 * Organized by view (Customer/Auditor) and section.
 */

export const TOOLTIP_CONTENT = {
  // ===========================================
  // CUSTOMER VIEW
  // ===========================================

  businessBasics: {
    businessName: "Your company or building name as it appears on utility bills",
    businessType: "Select the category that best describes your primary business activity. This helps us compare you to similar businesses.",
    squareFootage: "Total conditioned floor area in square feet. Check your lease or property records. This is used to calculate your Energy Use Intensity (EUI).",
    yearBuilt: "Approximate year the building was constructed. Older buildings may have different efficiency characteristics.",
    zipCode: "Used to determine your climate zone, local utility rates, and available utility providers. We currently support CT, MA, and NH.",
    numberOfFloors: "Total floors including basement if it is conditioned (heated/cooled)",
    numberOfEmployees: "Average number of people in the building during business hours. Higher occupancy affects HVAC and plug load estimates.",
    address: "Street address for the building. Used for location identification.",
    state: "State is auto-detected from your ZIP code. We currently serve Connecticut, Massachusetts, and New Hampshire.",
    electricProvider: "Your electric utility company. This determines the tariff rates used in cost calculations.",
    gasProvider: "Your natural gas utility company. This determines the gas rates used in cost calculations.",
  },

  utilityBills: {
    monthYear: "The billing period for this utility statement. Enter data for as many months as you have available.",
    electricityKwh: "Total kilowatt-hours (kWh) from your electric bill. Find this in the 'Usage' or 'Consumption' section.",
    electricityCost: "Total amount paid for electricity including all fees, taxes, and charges. This is your total bill amount.",
    naturalGasTherms: "Total therms from your gas bill. 1 therm = 100,000 BTU = 29.3 kWh. Find this in the 'Usage' section.",
    gasCost: "Total amount paid for natural gas including all fees, taxes, and charges.",
    csvUpload: "Upload utility bills exported from your utility provider portal. Accepted formats: CSV files with columns for date, usage, and cost.",
  },

  equipment: {
    hvac: {
      systemType: "Main heating/cooling equipment type (e.g., rooftop unit, split system, heat pump)",
      fuelType: "Primary energy source for this HVAC system (Electric, Natural Gas, Fuel Oil, or Propane)",
      age: "Approximate age in years. Check nameplate for manufacture date. Equipment over 15 years old is often less efficient.",
      tonnage: "Cooling capacity in tons. 1 ton = 12,000 BTU/hr. Check the equipment nameplate.",
      hasSmartThermostat: "Programmable or WiFi-connected thermostat that can optimize heating/cooling schedules",
      condition: "Visual assessment of equipment condition. Poor condition may indicate efficiency losses.",
      efficiencyRating: "SEER (cooling) or AFUE (heating) rating if known. Higher numbers mean better efficiency.",
      quantity: "Number of identical units of this type",
    },
    lighting: {
      primaryFixtureType: "Most common type of lighting fixture in your space (e.g., recessed troffer, pendant, track)",
      totalFixtures: "Approximate count of all light fixtures in your facility",
      bulbType: "Type of lamps installed: LED (most efficient), Fluorescent (T8/T5/T12), Incandescent (least efficient)",
      hoursPerDay: "Average hours lights are on per day during typical business operations",
      controls: "Lighting control systems: None, Timers, Occupancy Sensors, or Daylight Sensors",
    },
    refrigeration: {
      walkInCoolers: "Number of walk-in refrigerated units operating above 32°F (coolers, not freezers)",
      walkInFreezers: "Number of walk-in frozen storage units operating below 32°F",
      displayCases: "Refrigerated display cases for products, including open and closed types",
      reachInUnits: "Standard commercial refrigerators and freezers (non-walk-in)",
      iceMachines: "Commercial ice making machines",
    },
    cooking: {
      cookingEquipment: "Types of commercial cooking equipment in use (ovens, fryers, ranges, grills)",
      quantity: "Number of each equipment type",
      fuelType: "Power source: Electric or gas powered",
    },
  },

  operatingSchedule: {
    openTime: "Typical time business operations begin each day",
    closeTime: "Typical time business operations end each day",
    daysOpen: "Days per week the facility is occupied and operating",
    holidays: "Approximate number of closed holidays per year when building is unoccupied",
    is24x7: "Check if your facility operates continuously, 24 hours a day, 7 days a week",
    occupancyLevel: "How full is your space during peak hours? Light (25%), Moderate (50%), Heavy (75%), Very Heavy (90%+)",
  },

  // ===========================================
  // AUDITOR VIEW
  // ===========================================

  auditor: {
    building: {
      name: "A descriptive name for this building that will appear on reports",
      businessType: "Primary use of the building - affects EUI benchmarks and recommendations",
      squareFootage: "Total conditioned floor area in square feet. Verify from floor plans or lease documents.",
      yearBuilt: "Construction year range - affects baseline assumptions for equipment and envelope",
      floors: "Total number of floors including conditioned basement",
      occupants: "Typical number of people in the building during business hours",
      address: "Street address of the building being audited",
      city: "City where the building is located",
      zipCode: "ZIP code - used for climate zone and utility rate lookup",
      contactName: "On-site contact person for inspection coordination",
      contactPhone: "Phone number for scheduling and follow-up questions",
      contactEmail: "Email address for sending reports and documentation",
      electricProvider: "Electric utility company serving this building",
      gasProvider: "Natural gas utility company serving this building",
    },

    photos: {
      category: "Equipment type this photo documents (lighting, HVAC, refrigeration, nameplate, etc.)",
      label: "Brief description of what the photo shows (e.g., 'Main office T8 fixtures', 'RTU-1 nameplate')",
      notes: "Additional observations about what the photo shows or any issues identified",
      roomLocation: "Where in the building this photo was taken (room name or area)",
    },

    lighting: {
      zoneName: "Location description for this lighting zone (e.g., 'Main Office', 'Warehouse Bay 1')",
      locationDetails: "Specific area within the zone (e.g., '2nd Floor East Wing')",
      fixtureCount: "Total number of fixtures in this zone. Count carefully - this affects baseline calculations!",
      lampsPerFixture: "Number of lamps/tubes in each fixture. Typically 2-4 for troffers.",
      lampType: "T12 (older, 1.5\" diameter), T8 (common, 1\" diameter), T5, or LED. Check lamp markings.",
      lampLength: "Lamp length: 2ft, 4ft, or 8ft. Measure if unsure.",
      ballastType: "Electronic (newer, lighter) or Magnetic (older, heavier, may hum). May need to open fixture to check.",
      wattsPerLamp: "Wattage of individual lamp. Check lamp markings (e.g., 32W for standard 4ft T8).",
      ballastFactor: "Multiplier for ballast efficiency. Electronic: typically 0.88. Magnetic: typically 0.95. Range: 0.78-1.18.",
      lampsOut: "CRITICAL: Number of individual lamps NOT working. This affects baseline load calculation for incentive programs.",
      fixturesWithLampsOut: "Number of fixtures that have any lamps out. May differ from total lamps out count.",
      controlType: "How lights are controlled: Manual switch, Occupancy sensor, Daylight sensor, Timer, or BMS",
      hoursPerDay: "Average hours lights are on per day during typical operations",
      daysPerWeek: "Days per week this zone is lit",
      verified: "Check when you have visually confirmed all specifications are accurate",
      dlcListed: "For LED fixtures: Confirm product is on DesignLights Consortium (DLC) Qualified Products List",
      dlcProductId: "DLC QPL product ID from manufacturer documentation or DLC website",
      dlcManufacturer: "LED fixture manufacturer name as listed on DLC",
      dlcModelNumber: "Exact model number from installed fixture, matching DLC listing",
    },

    hvac: {
      systemType: "Equipment type: RTU (Rooftop Unit), Split System, Heat Pump, PTAC, VRF, etc.",
      capacity: "Cooling/heating capacity from nameplate. Record the value and select correct units.",
      capacityUnit: "Units for capacity: Tons (1 ton = 12,000 BTU/hr), BTU/hr, or kW",
      age: "Years since manufacture. Check nameplate date code or serial number.",
      condition: "Visual assessment: Excellent (like new), Good (minor wear), Fair (significant wear), Poor (needs repair)",
      manufacturer: "Equipment brand name (e.g., Carrier, Trane, Lennox)",
      modelNumber: "Full model number from nameplate - used for efficiency lookup",
      serialNumber: "Serial number from nameplate - used for age verification and warranty status",
      fuelType: "Energy source: Electric, Natural Gas, Fuel Oil, or Propane",
      hasSmartThermostat: "Is there a WiFi or programmable thermostat connected to this unit?",
      efficiencyRating: "SEER (cooling), EER, or AFUE (heating) rating from nameplate if visible",
      notes: "Observations about condition, issues, maintenance needs, or recommendations",
    },

    equipment: {
      equipmentType: "Category of equipment: refrigeration, motor, pump, kitchen equipment, etc.",
      description: "Specific description of this equipment (e.g., 'Walk-in cooler in back kitchen')",
      quantity: "Number of identical units",
      powerRating: "Electrical demand in kW. Check nameplate or calculate from amps × volts.",
      manufacturer: "Equipment brand name",
      modelNumber: "Model number from nameplate",
      age: "Estimated age of equipment in years",
      hoursPerDay: "Typical operating hours per day (24 for continuous operation like refrigeration)",
    },

    contractorSubmittal: {
      contractorName: "Company name that submitted the project for incentives",
      projectName: "Description of the retrofit project as submitted",
      proposedIncentive: "Dollar amount of incentive requested by contractor",
      existingFixtureType: "What contractor claims is currently installed (verify against your inspection)",
      existingCount: "Contractor's count of existing fixtures (compare to your count)",
      existingWattsPerFixture: "Contractor's stated wattage per existing fixture",
      proposedFixtureType: "LED fixture type being installed per submittal",
      proposedCount: "Number of new fixtures to be installed per submittal",
      proposedWattsPerFixture: "Wattage of new LED fixtures per submittal",
      dlcProductId: "DLC listing ID for proposed LED product",
    },

    utilities: {
      month: "Billing month for this utility data",
      year: "Billing year for this utility data",
      electricKwh: "Total electricity consumption in kWh from utility bill",
      electricCost: "Total electricity cost including delivery and supply charges",
      gasTherms: "Natural gas consumption in therms from utility bill",
      gasCost: "Total natural gas cost including all charges",
    },

    findings: {
      title: "Brief descriptive title for this finding (e.g., 'Inefficient lighting in warehouse')",
      description: "Detailed explanation of what was observed during inspection",
      category: "Type of equipment or system affected (HVAC, Lighting, Envelope, etc.)",
      priority: "High = immediate action needed, Medium = plan soon, Low = address when convenient",
      location: "Where in the building this issue was found",
      recommendation: "Suggested action to address this finding",
      estimatedSavings: "Annual cost savings estimate if this issue is addressed ($/year)",
      estimatedCost: "Implementation cost estimate for the recommended action ($)",
      linkedPhotos: "Photos that document this finding for the report",
    },

    report: {
      generalNotes: "Overall observations and summary notes to include in the final report",
      auditorName: "Name of the person conducting the audit (appears on report)",
      inspectionDate: "Date the on-site inspection was performed",
      inspectorName: "Name of the inspector (for utility inspections)",
    },
  },
};
