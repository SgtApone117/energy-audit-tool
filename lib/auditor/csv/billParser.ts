import { AuditUtilityBill } from '../types';

interface ParseResult {
  success: boolean;
  bills: AuditUtilityBill[];
  errors: string[];
  warnings: string[];
}

// Expected column names (case-insensitive, flexible matching)
const MONTH_COLUMNS = ['month', 'billing_month', 'bill_month'];
const YEAR_COLUMNS = ['year', 'billing_year', 'bill_year'];
const DATE_COLUMNS = ['date', 'billing_period', 'period', 'bill_date'];
const ELECTRICITY_KWH_COLUMNS = ['kwh', 'electricity_kwh', 'electric_kwh', 'usage_kwh', 'electricity_usage'];
const ELECTRICITY_COST_COLUMNS = ['electricity_cost', 'electric_cost', 'electricity_$', 'electric_$', 'electricity_amount', 'elec_cost'];
const GAS_USAGE_COLUMNS = ['therms', 'gas_therms', 'gas_usage', 'natural_gas', 'gas'];
const GAS_COST_COLUMNS = ['gas_cost', 'gas_$', 'gas_amount'];

const MONTH_NAMES: Record<string, string> = {
  january: 'January', jan: 'January', '01': 'January', '1': 'January',
  february: 'February', feb: 'February', '02': 'February', '2': 'February',
  march: 'March', mar: 'March', '03': 'March', '3': 'March',
  april: 'April', apr: 'April', '04': 'April', '4': 'April',
  may: 'May', '05': 'May', '5': 'May',
  june: 'June', jun: 'June', '06': 'June', '6': 'June',
  july: 'July', jul: 'July', '07': 'July', '7': 'July',
  august: 'August', aug: 'August', '08': 'August', '8': 'August',
  september: 'September', sep: 'September', sept: 'September', '09': 'September', '9': 'September',
  october: 'October', oct: 'October', '10': 'October',
  november: 'November', nov: 'November', '11': 'November',
  december: 'December', dec: 'December', '12': 'December',
};

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

function findColumn(headers: string[], possibleNames: string[]): string | null {
  const normalizedHeaders = headers.map(normalizeColumnName);
  const normalizedPossible = possibleNames.map(normalizeColumnName);

  for (const possible of normalizedPossible) {
    const index = normalizedHeaders.findIndex((h) => h.includes(possible) || possible.includes(h));
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
}

function parseMonthName(value: string): string | null {
  const normalized = value.toLowerCase().trim();
  return MONTH_NAMES[normalized] || null;
}

function parseMonthFromDate(value: string): { month: string; year: number } | null {
  // Try various date formats
  const datePatterns = [
    // YYYY-MM or YYYY-MM-DD
    /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/,
    // MM/YYYY or MM/DD/YYYY
    /^(\d{1,2})\/(?:\d{1,2}\/)?(\d{4})$/,
    // Month YYYY (e.g., "January 2024")
    /^([a-zA-Z]+)\s+(\d{4})$/,
    // YYYY/MM or YYYY/MM/DD
    /^(\d{4})\/(\d{1,2})(?:\/\d{1,2})?$/,
    // MM-YYYY or MM-DD-YYYY
    /^(\d{1,2})-(?:\d{1,2}-)?(\d{4})$/,
  ];

  const trimmed = value.trim();

  // YYYY-MM or YYYY-MM-DD
  let match = trimmed.match(datePatterns[0]);
  if (match) {
    const monthName = MONTH_NAMES[match[2]];
    if (monthName) {
      return { month: monthName, year: parseInt(match[1]) };
    }
  }

  // MM/YYYY or MM/DD/YYYY
  match = trimmed.match(datePatterns[1]);
  if (match) {
    const monthName = MONTH_NAMES[match[1]];
    if (monthName) {
      return { month: monthName, year: parseInt(match[2]) };
    }
  }

  // Month YYYY
  match = trimmed.match(datePatterns[2]);
  if (match) {
    const monthName = MONTH_NAMES[match[1].toLowerCase()];
    if (monthName) {
      return { month: monthName, year: parseInt(match[2]) };
    }
  }

  // YYYY/MM or YYYY/MM/DD
  match = trimmed.match(datePatterns[3]);
  if (match) {
    const monthName = MONTH_NAMES[match[2]];
    if (monthName) {
      return { month: monthName, year: parseInt(match[1]) };
    }
  }

  // MM-YYYY or MM-DD-YYYY
  match = trimmed.match(datePatterns[4]);
  if (match) {
    const monthName = MONTH_NAMES[match[1]];
    if (monthName) {
      return { month: monthName, year: parseInt(match[2]) };
    }
  }

  return null;
}

function parseNumber(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;

  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '').trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function parseYear(value: string): number | null {
  const cleaned = value.trim();
  const num = parseInt(cleaned);
  if (isNaN(num) || num < 2000 || num > 2100) return null;
  return num;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseAuditorUtilityBillCSV(csvContent: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bills: AuditUtilityBill[] = [];

  // Split into lines and filter empty
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return {
      success: false,
      bills: [],
      errors: ['CSV file must have at least a header row and one data row'],
      warnings: [],
    };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Find columns
  const monthCol = findColumn(headers, MONTH_COLUMNS);
  const yearCol = findColumn(headers, YEAR_COLUMNS);
  const dateCol = findColumn(headers, DATE_COLUMNS);
  const kwhCol = findColumn(headers, ELECTRICITY_KWH_COLUMNS);
  const elecCostCol = findColumn(headers, ELECTRICITY_COST_COLUMNS);
  const gasUsageCol = findColumn(headers, GAS_USAGE_COLUMNS);
  const gasCostCol = findColumn(headers, GAS_COST_COLUMNS);

  // Need either (month + year) OR a date column
  const hasMonthYear = monthCol && yearCol;
  const hasDate = dateCol;

  if (!hasMonthYear && !hasDate) {
    errors.push('Could not find month/year columns. Expected either: (month + year) columns OR a date column (e.g., date, billing_period)');
  }

  if (!kwhCol && !gasUsageCol) {
    errors.push('Could not find any usage columns. Expected: electricity_kwh or gas_therms');
  }

  if (errors.length > 0) {
    return { success: false, bills: [], errors, warnings };
  }

  // Get column indices
  const monthIdx = monthCol ? headers.indexOf(monthCol) : -1;
  const yearIdx = yearCol ? headers.indexOf(yearCol) : -1;
  const dateIdx = dateCol ? headers.indexOf(dateCol) : -1;
  const kwhIdx = kwhCol ? headers.indexOf(kwhCol) : -1;
  const elecCostIdx = elecCostCol ? headers.indexOf(elecCostCol) : -1;
  const gasUsageIdx = gasUsageCol ? headers.indexOf(gasUsageCol) : -1;
  const gasCostIdx = gasCostCol ? headers.indexOf(gasCostCol) : -1;

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.every(v => !v.trim())) {
      // Skip empty rows
      continue;
    }

    let month: string | null = null;
    let year: number | null = null;

    // Try to get month and year
    if (hasMonthYear && monthIdx >= 0 && yearIdx >= 0) {
      month = parseMonthName(values[monthIdx] || '');
      year = parseYear(values[yearIdx] || '');
    } else if (hasDate && dateIdx >= 0) {
      const parsed = parseMonthFromDate(values[dateIdx] || '');
      if (parsed) {
        month = parsed.month;
        year = parsed.year;
      }
    }

    if (!month || !year) {
      warnings.push(`Row ${i + 1}: Could not parse month/year`);
      continue;
    }

    const bill: AuditUtilityBill = {
      month,
      year,
      electricityKwh: kwhIdx >= 0 ? parseNumber(values[kwhIdx]) : undefined,
      electricityCost: elecCostIdx >= 0 ? parseNumber(values[elecCostIdx]) : undefined,
      gasTherm: gasUsageIdx >= 0 ? parseNumber(values[gasUsageIdx]) : undefined,
      gasCost: gasCostIdx >= 0 ? parseNumber(values[gasCostIdx]) : undefined,
    };

    // Only add if there's some data
    if (bill.electricityKwh !== undefined || bill.electricityCost !== undefined || 
        bill.gasTherm !== undefined || bill.gasCost !== undefined) {
      bills.push(bill);
    } else {
      warnings.push(`Row ${i + 1}: No usage data found, skipping`);
    }
  }

  // Remove duplicates (keep last occurrence)
  const uniqueBills: AuditUtilityBill[] = [];
  const seen = new Set<string>();
  for (let i = bills.length - 1; i >= 0; i--) {
    const key = `${bills[i].month}-${bills[i].year}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBills.unshift(bills[i]);
    }
  }

  if (bills.length > uniqueBills.length) {
    warnings.push(`${bills.length - uniqueBills.length} duplicate entries removed (kept most recent)`);
  }

  return {
    success: uniqueBills.length > 0,
    bills: uniqueBills,
    errors,
    warnings,
  };
}

// Generate sample CSV template
export function generateAuditorCSVTemplate(): string {
  const headers = ['month', 'year', 'electricity_kwh', 'electricity_cost', 'gas_therms', 'gas_cost'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear() - 1;
  const rows: string[] = [headers.join(',')];

  for (const month of MONTHS) {
    rows.push(`${month},${currentYear},,,,`);
  }

  return rows.join('\n');
}
