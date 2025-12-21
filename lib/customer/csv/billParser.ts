import { UtilityBill } from '../types';

interface ParseResult {
  success: boolean;
  bills: UtilityBill[];
  errors: string[];
  warnings: string[];
}

interface CSVRow {
  [key: string]: string;
}

// Expected column names (case-insensitive, flexible matching)
const MONTH_COLUMNS = ['month', 'date', 'billing_period', 'period', 'bill_date'];
const ELECTRICITY_KWH_COLUMNS = ['kwh', 'electricity_kwh', 'electric_kwh', 'usage_kwh', 'electricity_usage'];
const ELECTRICITY_COST_COLUMNS = ['electricity_cost', 'electric_cost', 'electricity_$', 'electric_$', 'electricity_amount', 'cost'];
const GAS_USAGE_COLUMNS = ['therms', 'gas_therms', 'gas_usage', 'natural_gas'];
const GAS_COST_COLUMNS = ['gas_cost', 'gas_$', 'gas_amount'];

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

function parseMonth(value: string): string | null {
  // Try various date formats
  const datePatterns = [
    // YYYY-MM
    /^(\d{4})-(\d{1,2})$/,
    // MM/YYYY
    /^(\d{1,2})\/(\d{4})$/,
    // Month YYYY (e.g., "January 2024")
    /^([a-zA-Z]+)\s+(\d{4})$/,
    // YYYY/MM
    /^(\d{4})\/(\d{1,2})$/,
    // MM-YYYY
    /^(\d{1,2})-(\d{4})$/,
  ];

  const monthNames: Record<string, string> = {
    january: '01', jan: '01',
    february: '02', feb: '02',
    march: '03', mar: '03',
    april: '04', apr: '04',
    may: '05',
    june: '06', jun: '06',
    july: '07', jul: '07',
    august: '08', aug: '08',
    september: '09', sep: '09', sept: '09',
    october: '10', oct: '10',
    november: '11', nov: '11',
    december: '12', dec: '12',
  };

  const trimmed = value.trim();

  // YYYY-MM
  let match = trimmed.match(datePatterns[0]);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}`;
  }

  // MM/YYYY
  match = trimmed.match(datePatterns[1]);
  if (match) {
    return `${match[2]}-${match[1].padStart(2, '0')}`;
  }

  // Month YYYY
  match = trimmed.match(datePatterns[2]);
  if (match) {
    const monthNum = monthNames[match[1].toLowerCase()];
    if (monthNum) {
      return `${match[2]}-${monthNum}`;
    }
  }

  // YYYY/MM
  match = trimmed.match(datePatterns[3]);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}`;
  }

  // MM-YYYY
  match = trimmed.match(datePatterns[4]);
  if (match) {
    return `${match[2]}-${match[1].padStart(2, '0')}`;
  }

  return null;
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;

  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '').trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
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

export function parseUtilityBillCSV(csvContent: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bills: UtilityBill[] = [];

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
  const kwhCol = findColumn(headers, ELECTRICITY_KWH_COLUMNS);
  const elecCostCol = findColumn(headers, ELECTRICITY_COST_COLUMNS);
  const gasUsageCol = findColumn(headers, GAS_USAGE_COLUMNS);
  const gasCostCol = findColumn(headers, GAS_COST_COLUMNS);

  if (!monthCol) {
    errors.push('Could not find a month/date column. Expected columns like: month, date, billing_period');
  }
  if (!kwhCol) {
    errors.push('Could not find an electricity usage (kWh) column. Expected columns like: kwh, electricity_kwh');
  }

  if (errors.length > 0) {
    return { success: false, bills: [], errors, warnings };
  }

  // Get column indices
  const monthIdx = headers.indexOf(monthCol!);
  const kwhIdx = headers.indexOf(kwhCol!);
  const elecCostIdx = elecCostCol ? headers.indexOf(elecCostCol) : -1;
  const gasUsageIdx = gasUsageCol ? headers.indexOf(gasUsageCol) : -1;
  const gasCostIdx = gasCostCol ? headers.indexOf(gasCostCol) : -1;

  if (!elecCostCol) {
    warnings.push('No electricity cost column found. Costs will need to be entered manually.');
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length < headers.length) {
      warnings.push(`Row ${i + 1} has fewer columns than expected, skipping`);
      continue;
    }

    const month = parseMonth(values[monthIdx]);
    if (!month) {
      warnings.push(`Row ${i + 1}: Could not parse month "${values[monthIdx]}"`);
      continue;
    }

    const electricityKwh = parseNumber(values[kwhIdx]);
    if (electricityKwh === null) {
      warnings.push(`Row ${i + 1}: Could not parse electricity kWh "${values[kwhIdx]}"`);
    }

    const bill: UtilityBill = {
      month,
      electricityKwh,
      electricityCost: elecCostIdx >= 0 ? parseNumber(values[elecCostIdx]) : null,
      gasUsage: gasUsageIdx >= 0 ? parseNumber(values[gasUsageIdx]) : null,
      gasCost: gasCostIdx >= 0 ? parseNumber(values[gasCostIdx]) : null,
    };

    bills.push(bill);
  }

  // Sort bills by month
  bills.sort((a, b) => a.month.localeCompare(b.month));

  return {
    success: bills.length > 0,
    bills,
    errors,
    warnings,
  };
}

// Generate sample CSV template
export function generateCSVTemplate(): string {
  const headers = ['month', 'electricity_kwh', 'electricity_cost', 'gas_therms', 'gas_cost'];
  const now = new Date();
  const rows: string[] = [headers.join(',')];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    rows.push(`${month},,,, `);
  }

  return rows.join('\n');
}
