/**
 * New England Utility Providers and Tariff Rates
 * 
 * States covered: Connecticut (CT), Massachusetts (MA), New Hampshire (NH)
 * 
 * Sources:
 * - Eversource: https://www.eversource.com/
 * - National Grid: https://www.nationalgridus.com/
 * - United Illuminating: https://www.uinet.com/
 * - Liberty Utilities: https://new-hampshire.libertyutilities.com/
 * - Unitil: https://unitil.com/
 * 
 * Rates are approximate commercial rates as of 2024 and should be used
 * for estimation purposes only. Actual rates vary by rate class, usage tier,
 * and time of use.
 */

// New England states we support
export const NEW_ENGLAND_STATES = ['CT', 'MA', 'NH'] as const;
export type NewEnglandState = typeof NEW_ENGLAND_STATES[number];

export interface UtilityProvider {
  id: string;
  name: string;
  shortName: string;
  states: NewEnglandState[];
  type: 'electric' | 'gas' | 'both';
  website?: string;
}

export interface UtilityRate {
  providerId: string;
  state: NewEnglandState;
  type: 'electric' | 'gas';
  rateClass: 'commercial' | 'residential';
  rate: number; // $/kWh for electric, $/therm for gas
  deliveryCharge?: number; // Additional delivery charge
  supplyCharge?: number; // Supply charge (may vary with supplier choice)
  effectiveDate: string; // When this rate was effective
  notes?: string;
}

// Electric Utility Providers
export const ELECTRIC_PROVIDERS: UtilityProvider[] = [
  {
    id: 'eversource-ct',
    name: 'Eversource Energy (Connecticut)',
    shortName: 'Eversource',
    states: ['CT'],
    type: 'electric',
    website: 'https://www.eversource.com/',
  },
  {
    id: 'eversource-ma',
    name: 'Eversource Energy (Massachusetts)',
    shortName: 'Eversource',
    states: ['MA'],
    type: 'electric',
    website: 'https://www.eversource.com/',
  },
  {
    id: 'eversource-nh',
    name: 'Eversource Energy (New Hampshire)',
    shortName: 'Eversource',
    states: ['NH'],
    type: 'electric',
    website: 'https://www.eversource.com/',
  },
  {
    id: 'united-illuminating',
    name: 'United Illuminating Company',
    shortName: 'UI',
    states: ['CT'],
    type: 'electric',
    website: 'https://www.uinet.com/',
  },
  {
    id: 'national-grid-ma',
    name: 'National Grid (Massachusetts)',
    shortName: 'National Grid',
    states: ['MA'],
    type: 'electric',
    website: 'https://www.nationalgridus.com/',
  },
  {
    id: 'liberty-nh',
    name: 'Liberty Utilities (New Hampshire)',
    shortName: 'Liberty',
    states: ['NH'],
    type: 'electric',
    website: 'https://new-hampshire.libertyutilities.com/',
  },
  {
    id: 'unitil-nh',
    name: 'Unitil (New Hampshire)',
    shortName: 'Unitil',
    states: ['NH'],
    type: 'electric',
    website: 'https://unitil.com/',
  },
  {
    id: 'unitil-ma',
    name: 'Unitil (Massachusetts)',
    shortName: 'Unitil',
    states: ['MA'],
    type: 'electric',
    website: 'https://unitil.com/',
  },
];

// Gas Utility Providers
export const GAS_PROVIDERS: UtilityProvider[] = [
  {
    id: 'eversource-gas-ct',
    name: 'Eversource Energy Gas (Connecticut)',
    shortName: 'Eversource Gas',
    states: ['CT'],
    type: 'gas',
    website: 'https://www.eversource.com/',
  },
  {
    id: 'eversource-gas-ma',
    name: 'Eversource Energy Gas (Massachusetts)',
    shortName: 'Eversource Gas',
    states: ['MA'],
    type: 'gas',
    website: 'https://www.eversource.com/',
  },
  {
    id: 'southern-ct-gas',
    name: 'Southern Connecticut Gas',
    shortName: 'SCG',
    states: ['CT'],
    type: 'gas',
    website: 'https://www.soconngas.com/',
  },
  {
    id: 'ct-natural-gas',
    name: 'Connecticut Natural Gas',
    shortName: 'CNG',
    states: ['CT'],
    type: 'gas',
    website: 'https://www.cngcorp.com/',
  },
  {
    id: 'national-grid-gas-ma',
    name: 'National Grid Gas (Massachusetts)',
    shortName: 'National Grid Gas',
    states: ['MA'],
    type: 'gas',
    website: 'https://www.nationalgridus.com/',
  },
  {
    id: 'liberty-gas-nh',
    name: 'Liberty Utilities Gas (New Hampshire)',
    shortName: 'Liberty Gas',
    states: ['NH'],
    type: 'gas',
    website: 'https://new-hampshire.libertyutilities.com/',
  },
  {
    id: 'unitil-gas-nh',
    name: 'Unitil Gas (New Hampshire)',
    shortName: 'Unitil Gas',
    states: ['NH'],
    type: 'gas',
    website: 'https://unitil.com/',
  },
  {
    id: 'unitil-gas-ma',
    name: 'Unitil Gas (Massachusetts)',
    shortName: 'Unitil Gas',
    states: ['MA'],
    type: 'gas',
    website: 'https://unitil.com/',
  },
  {
    id: 'berkshire-gas',
    name: 'Berkshire Gas Company',
    shortName: 'Berkshire Gas',
    states: ['MA'],
    type: 'gas',
    website: 'https://www.berkshiregas.com/',
  },
];

// Tariff Rates by Provider (Commercial rates, 2024 estimates)
export const UTILITY_RATES: UtilityRate[] = [
  // Connecticut Electric
  {
    providerId: 'eversource-ct',
    state: 'CT',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2650,
    deliveryCharge: 0.1250,
    supplyCharge: 0.1400,
    effectiveDate: '2024-01-01',
    notes: 'Rate 30 - Small Commercial',
  },
  {
    providerId: 'united-illuminating',
    state: 'CT',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2580,
    deliveryCharge: 0.1180,
    supplyCharge: 0.1400,
    effectiveDate: '2024-01-01',
    notes: 'Rate GST - General Service',
  },

  // Massachusetts Electric
  {
    providerId: 'eversource-ma',
    state: 'MA',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2850,
    deliveryCharge: 0.1350,
    supplyCharge: 0.1500,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-1 - General Service',
  },
  {
    providerId: 'national-grid-ma',
    state: 'MA',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2780,
    deliveryCharge: 0.1280,
    supplyCharge: 0.1500,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-1 - Small General Service',
  },
  {
    providerId: 'unitil-ma',
    state: 'MA',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2720,
    deliveryCharge: 0.1220,
    supplyCharge: 0.1500,
    effectiveDate: '2024-01-01',
    notes: 'Rate G - General Service',
  },

  // New Hampshire Electric
  {
    providerId: 'eversource-nh',
    state: 'NH',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2450,
    deliveryCharge: 0.1050,
    supplyCharge: 0.1400,
    effectiveDate: '2024-01-01',
    notes: 'Rate G - General Service',
  },
  {
    providerId: 'liberty-nh',
    state: 'NH',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2380,
    deliveryCharge: 0.0980,
    supplyCharge: 0.1400,
    effectiveDate: '2024-01-01',
    notes: 'Rate G - General Service',
  },
  {
    providerId: 'unitil-nh',
    state: 'NH',
    type: 'electric',
    rateClass: 'commercial',
    rate: 0.2420,
    deliveryCharge: 0.1020,
    supplyCharge: 0.1400,
    effectiveDate: '2024-01-01',
    notes: 'Rate G - General Service',
  },

  // Connecticut Gas
  {
    providerId: 'eversource-gas-ct',
    state: 'CT',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.65,
    effectiveDate: '2024-01-01',
    notes: 'Rate 30 - Small Commercial Heating',
  },
  {
    providerId: 'southern-ct-gas',
    state: 'CT',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.58,
    effectiveDate: '2024-01-01',
    notes: 'Rate 30 - Commercial',
  },
  {
    providerId: 'ct-natural-gas',
    state: 'CT',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.62,
    effectiveDate: '2024-01-01',
    notes: 'Rate 4 - Commercial',
  },

  // Massachusetts Gas
  {
    providerId: 'eversource-gas-ma',
    state: 'MA',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.60,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-41 - Commercial Heating',
  },
  {
    providerId: 'national-grid-gas-ma',
    state: 'MA',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.55,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-3 - Commercial',
  },
  {
    providerId: 'unitil-gas-ma',
    state: 'MA',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.52,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-40 - Commercial',
  },
  {
    providerId: 'berkshire-gas',
    state: 'MA',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.48,
    effectiveDate: '2024-01-01',
    notes: 'Rate C - Commercial',
  },

  // New Hampshire Gas
  {
    providerId: 'liberty-gas-nh',
    state: 'NH',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.50,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-2 - Commercial',
  },
  {
    providerId: 'unitil-gas-nh',
    state: 'NH',
    type: 'gas',
    rateClass: 'commercial',
    rate: 1.48,
    effectiveDate: '2024-01-01',
    notes: 'Rate G-40 - Commercial',
  },
];

// Helper functions

/**
 * Get electric providers for a specific state
 */
export function getElectricProvidersByState(state: NewEnglandState): UtilityProvider[] {
  return ELECTRIC_PROVIDERS.filter(p => p.states.includes(state));
}

/**
 * Get gas providers for a specific state
 */
export function getGasProvidersByState(state: NewEnglandState): UtilityProvider[] {
  return GAS_PROVIDERS.filter(p => p.states.includes(state));
}

/**
 * Get all providers (electric and gas) for a specific state
 */
export function getProvidersByState(state: NewEnglandState): {
  electric: UtilityProvider[];
  gas: UtilityProvider[];
} {
  return {
    electric: getElectricProvidersByState(state),
    gas: getGasProvidersByState(state),
  };
}

/**
 * Get rate for a specific provider
 */
export function getProviderRate(providerId: string): UtilityRate | undefined {
  return UTILITY_RATES.find(r => r.providerId === providerId && r.rateClass === 'commercial');
}

/**
 * Get provider by ID
 */
export function getProviderById(providerId: string): UtilityProvider | undefined {
  return [...ELECTRIC_PROVIDERS, ...GAS_PROVIDERS].find(p => p.id === providerId);
}

/**
 * Get electricity rate for a provider ($/kWh)
 */
export function getElectricityRateByProvider(providerId: string): number {
  const rate = UTILITY_RATES.find(
    r => r.providerId === providerId && r.type === 'electric' && r.rateClass === 'commercial'
  );
  return rate?.rate ?? 0.25; // Default fallback
}

/**
 * Get gas rate for a provider ($/therm)
 */
export function getGasRateByProvider(providerId: string): number {
  const rate = UTILITY_RATES.find(
    r => r.providerId === providerId && r.type === 'gas' && r.rateClass === 'commercial'
  );
  return rate?.rate ?? 1.50; // Default fallback
}

/**
 * Check if a state is in New England (supported)
 */
export function isNewEnglandState(state: string): state is NewEnglandState {
  return NEW_ENGLAND_STATES.includes(state as NewEnglandState);
}

/**
 * Get state display info
 */
export const STATE_INFO: Record<NewEnglandState, { name: string; abbreviation: string }> = {
  CT: { name: 'Connecticut', abbreviation: 'CT' },
  MA: { name: 'Massachusetts', abbreviation: 'MA' },
  NH: { name: 'New Hampshire', abbreviation: 'NH' },
};

/**
 * Format rate info for display in reports
 */
export function formatRateInfo(providerId: string): {
  providerName: string;
  rate: number;
  rateFormatted: string;
  rateNotes: string;
  type: 'electric' | 'gas';
} | null {
  const provider = getProviderById(providerId);
  const rateInfo = getProviderRate(providerId);
  
  if (!provider || !rateInfo) return null;
  
  return {
    providerName: provider.name,
    rate: rateInfo.rate,
    rateFormatted: rateInfo.type === 'electric' 
      ? `$${rateInfo.rate.toFixed(4)}/kWh` 
      : `$${rateInfo.rate.toFixed(2)}/therm`,
    rateNotes: rateInfo.notes || '',
    type: rateInfo.type,
  };
}
