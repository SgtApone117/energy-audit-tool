/**
 * ZIP code prefix to state mapping.
 * 
 * This maps the first 3 digits of a ZIP code to its state.
 * ZIP codes are assigned by region, so the first 3 digits
 * reliably identify the state in most cases.
 * 
 * Reference: USPS ZIP Code Prefix Matrix
 */

/**
 * Map of ZIP code prefixes (first 3 digits) to state codes.
 * Organized by ZIP code ranges for each state.
 */
const ZIP_PREFIX_TO_STATE: Record<string, string> = {};

// Helper function to add ranges
function addZipRange(start: number, end: number, state: string) {
  for (let i = start; i <= end; i++) {
    ZIP_PREFIX_TO_STATE[i.toString().padStart(3, "0")] = state;
  }
}

// Initialize ZIP prefix mappings

// Connecticut (060-069)
addZipRange(60, 69, "CT");

// Massachusetts (010-027, 055)
addZipRange(10, 27, "MA");
ZIP_PREFIX_TO_STATE["055"] = "MA";

// Rhode Island (028-029)
addZipRange(28, 29, "RI");

// New Hampshire (030-038)
addZipRange(30, 38, "NH");

// Maine (039-049)
addZipRange(39, 49, "ME");

// Vermont (050-059, excluding 055)
addZipRange(50, 54, "VT");
addZipRange(56, 59, "VT");

// New Jersey (070-089)
addZipRange(70, 89, "NJ");

// New York (100-149, 005-009 for specific areas)
addZipRange(100, 149, "NY");
addZipRange(5, 9, "NY");
ZIP_PREFIX_TO_STATE["063"] = "NY"; // Some NY areas

// Pennsylvania (150-196)
addZipRange(150, 196, "PA");

// Delaware (197-199)
addZipRange(197, 199, "DE");

// District of Columbia (200-205)
addZipRange(200, 205, "DC");

// Virginia (220-246)
addZipRange(220, 246, "VA");

// Maryland (206-219)
addZipRange(206, 219, "MD");

// West Virginia (247-268)
addZipRange(247, 268, "WV");

// North Carolina (270-289)
addZipRange(270, 289, "NC");

// South Carolina (290-299)
addZipRange(290, 299, "SC");

// Georgia (300-319, 398-399)
addZipRange(300, 319, "GA");
addZipRange(398, 399, "GA");

// Florida (320-349)
addZipRange(320, 349, "FL");

// Alabama (350-369)
addZipRange(350, 369, "AL");

// Tennessee (370-385)
addZipRange(370, 385, "TN");

// Mississippi (386-397)
addZipRange(386, 397, "MS");

// Kentucky (400-427)
addZipRange(400, 427, "KY");

// Ohio (430-459)
addZipRange(430, 459, "OH");

// Indiana (460-479)
addZipRange(460, 479, "IN");

// Michigan (480-499)
addZipRange(480, 499, "MI");

// Iowa (500-528)
addZipRange(500, 528, "IA");

// Wisconsin (530-549)
addZipRange(530, 549, "WI");

// Minnesota (550-567)
addZipRange(550, 567, "MN");

// South Dakota (570-577)
addZipRange(570, 577, "SD");

// North Dakota (580-588)
addZipRange(580, 588, "ND");

// Montana (590-599)
addZipRange(590, 599, "MT");

// Illinois (600-629)
addZipRange(600, 629, "IL");

// Missouri (630-658)
addZipRange(630, 658, "MO");

// Kansas (660-679)
addZipRange(660, 679, "KS");

// Nebraska (680-693)
addZipRange(680, 693, "NE");

// Louisiana (700-714)
addZipRange(700, 714, "LA");

// Arkansas (716-729)
addZipRange(716, 729, "AR");

// Oklahoma (730-749)
addZipRange(730, 749, "OK");

// Texas (750-799, 885)
addZipRange(750, 799, "TX");
ZIP_PREFIX_TO_STATE["885"] = "TX";

// Colorado (800-816)
addZipRange(800, 816, "CO");

// Wyoming (820-831)
addZipRange(820, 831, "WY");

// Idaho (832-838)
addZipRange(832, 838, "ID");

// Utah (840-847)
addZipRange(840, 847, "UT");

// Arizona (850-865)
addZipRange(850, 865, "AZ");

// New Mexico (870-884)
addZipRange(870, 884, "NM");

// Nevada (889-898)
addZipRange(889, 898, "NV");

// California (900-961)
addZipRange(900, 961, "CA");

// Hawaii (967-968)
addZipRange(967, 968, "HI");

// Alaska (995-999)
addZipRange(995, 999, "AK");

// Oregon (970-979)
addZipRange(970, 979, "OR");

// Washington (980-994)
addZipRange(980, 994, "WA");

/**
 * Get state code from a ZIP code.
 * Uses the first 3 digits of the ZIP code to determine state.
 * 
 * @param zipCode - Full ZIP code (5 digits) or ZIP prefix (3 digits)
 * @returns State abbreviation (e.g., "CA", "NY") or null if not found
 */
export function getStateFromZip(zipCode: string): string | null {
  // Clean the ZIP code - remove any non-numeric characters
  const cleanZip = zipCode.replace(/\D/g, "");
  
  if (cleanZip.length < 3) {
    return null;
  }
  
  const prefix = cleanZip.substring(0, 3);
  return ZIP_PREFIX_TO_STATE[prefix] || null;
}

/**
 * Validate if a ZIP code appears to be valid.
 * Checks format and if the prefix maps to a known state.
 */
export function isValidZipCode(zipCode: string): boolean {
  const cleanZip = zipCode.replace(/\D/g, "");
  return cleanZip.length === 5 && getStateFromZip(cleanZip) !== null;
}

/**
 * Get full state name from state code.
 */
export const STATE_NAMES: Record<string, string> = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "DC": "District of Columbia",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming",
};

export function getStateName(stateCode: string): string {
  return STATE_NAMES[stateCode.toUpperCase()] || stateCode;
}
