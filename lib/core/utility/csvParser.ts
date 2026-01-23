/**
 * CSV Parser for Utility Bill Data
 * 
 * Supports flexible column names and handles common CSV formats.
 */

import { MonthlyUtilityData, MONTHS } from "./types";

export interface CSVParseResult {
  success: boolean;
  data: MonthlyUtilityData[];
  errors: string[];
  warnings: string[];
}

// Common column name variations
const MONTH_COLUMNS = ["month", "period", "date", "billing period"];
const ELECTRICITY_KWH_COLUMNS = ["electricity", "electricity kwh", "electric kwh", "kwh", "electricity (kwh)", "electric"];
const ELECTRICITY_COST_COLUMNS = ["electricity cost", "electricity cost ($)", "electric cost", "electric cost ($)", "electricity ($)", "electric ($)", "elec cost", "cost"];
const GAS_USAGE_COLUMNS = ["gas", "gas usage", "gas therms", "therms", "gas (therms)", "natural gas"];
const GAS_COST_COLUMNS = ["gas cost", "gas cost ($)", "gas ($)", "natural gas cost", "natural gas cost ($)"];

/**
 * Normalize a column header for matching
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9\s()$]/g, "");
}

/**
 * Find column index by checking against multiple possible names
 * Uses exact match first, then word-based matching for flexibility
 */
function findColumnIndex(headers: string[], possibleNames: string[], excludePatterns?: string[]): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  
  // First try exact matches
  for (const name of possibleNames) {
    const normalizedName = normalizeHeader(name);
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (normalizedHeaders[i] === normalizedName) {
        return i;
      }
    }
  }
  
  // Then try if header starts with or contains the pattern
  for (const name of possibleNames) {
    const normalizedName = normalizeHeader(name);
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const header = normalizedHeaders[i];
      
      // Check if we should exclude this header (e.g., don't match "electricity cost" when looking for "electricity kwh")
      if (excludePatterns) {
        const shouldExclude = excludePatterns.some(pattern => 
          header.includes(normalizeHeader(pattern))
        );
        if (shouldExclude) continue;
      }
      
      // Check if header starts with the pattern or pattern starts with header
      if (header.startsWith(normalizedName) || normalizedName.startsWith(header)) {
        return i;
      }
    }
  }
  
  return -1;
}

/**
 * Parse a month string to match our standard month names
 */
function parseMonth(value: string): string | null {
  const normalized = value.toLowerCase().trim();
  
  // Check for full month names
  for (const month of MONTHS) {
    if (normalized === month.toLowerCase() || normalized.startsWith(month.toLowerCase().substring(0, 3))) {
      return month;
    }
  }
  
  // Check for numeric months (1-12 or 01-12)
  const numMatch = normalized.match(/^(\d{1,2})/);
  if (numMatch) {
    const monthNum = parseInt(numMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return MONTHS[monthNum - 1];
    }
  }
  
  // Check for date formats like "2024-01" or "01/2024"
  const dateMatch = normalized.match(/(\d{1,2})[\/\-](\d{2,4})|(\d{4})[\/\-](\d{1,2})/);
  if (dateMatch) {
    const monthNum = parseInt(dateMatch[1] || dateMatch[4], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return MONTHS[monthNum - 1];
    }
  }
  
  return null;
}

/**
 * Parse a numeric value from CSV, handling currency symbols and commas
 */
function parseNumericValue(value: string): number | null {
  if (!value || value.trim() === "" || value.trim() === "-") {
    return null;
  }
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Parse CSV content into rows
 */
function parseCSVRows(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const rows: string[][] = [];
  
  for (const line of lines) {
    // Simple CSV parsing - handles quoted values
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse CSV content into utility bill data
 */
export function parseUtilityCSV(content: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Initialize empty monthly data
  const data: MonthlyUtilityData[] = MONTHS.map(month => ({
    month,
    electricityKwh: null,
    electricityCost: null,
    gasUsage: null,
    gasCost: null,
  }));
  
  try {
    const rows = parseCSVRows(content);
    
    if (rows.length < 2) {
      errors.push("CSV file must have at least a header row and one data row");
      return { success: false, data, errors, warnings };
    }
    
    const headers = rows[0];
    
    // Find column indices (use exclude patterns to avoid mis-matches)
    const monthCol = findColumnIndex(headers, MONTH_COLUMNS);
    const electricityKwhCol = findColumnIndex(headers, ELECTRICITY_KWH_COLUMNS, ["cost"]);
    const electricityCostCol = findColumnIndex(headers, ELECTRICITY_COST_COLUMNS);
    const gasUsageCol = findColumnIndex(headers, GAS_USAGE_COLUMNS, ["cost"]);
    const gasCostCol = findColumnIndex(headers, GAS_COST_COLUMNS);
    
    if (monthCol === -1) {
      errors.push("Could not find 'Month' column. Please include a column named 'Month' or 'Period'.");
      return { success: false, data, errors, warnings };
    }
    
    if (electricityKwhCol === -1 && gasUsageCol === -1) {
      errors.push("Could not find energy usage columns. Please include 'Electricity (kWh)' or 'Gas (therms)' columns.");
      return { success: false, data, errors, warnings };
    }
    
    // Warn if cost columns weren't found
    if (electricityKwhCol !== -1 && electricityCostCol === -1) {
      warnings.push(`Could not find electricity cost column. Found columns: ${headers.join(", ")}`);
    }
    if (gasUsageCol !== -1 && gasCostCol === -1) {
      warnings.push(`Could not find gas cost column. Found columns: ${headers.join(", ")}`);
    }
    
    // Track which months we've seen
    const monthsSeen = new Set<string>();
    
    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row.every(cell => !cell.trim())) continue;
      
      const monthValue = row[monthCol];
      const month = parseMonth(monthValue);
      
      if (!month) {
        warnings.push(`Row ${i + 1}: Could not parse month "${monthValue}"`);
        continue;
      }
      
      if (monthsSeen.has(month)) {
        warnings.push(`Row ${i + 1}: Duplicate entry for ${month}, using latest value`);
      }
      monthsSeen.add(month);
      
      const monthIndex = MONTHS.indexOf(month as typeof MONTHS[number]);
      
      if (electricityKwhCol !== -1) {
        data[monthIndex].electricityKwh = parseNumericValue(row[electricityKwhCol] || "");
      }
      if (electricityCostCol !== -1) {
        data[monthIndex].electricityCost = parseNumericValue(row[electricityCostCol] || "");
      }
      if (gasUsageCol !== -1) {
        data[monthIndex].gasUsage = parseNumericValue(row[gasUsageCol] || "");
      }
      if (gasCostCol !== -1) {
        data[monthIndex].gasCost = parseNumericValue(row[gasCostCol] || "");
      }
    }
    
    // Check for incomplete data
    if (monthsSeen.size < 12) {
      warnings.push(`Only ${monthsSeen.size} months of data found. Missing months will be empty.`);
    }
    
    return {
      success: true,
      data,
      errors,
      warnings,
    };
    
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false, data, errors, warnings };
  }
}

/**
 * Generate a template CSV string that users can download and fill in
 */
export function generateTemplateCSV(): string {
  const headers = ["Month", "Electricity (kWh)", "Electricity Cost ($)", "Gas (therms)", "Gas Cost ($)"];
  const rows = MONTHS.map(month => [month, "", "", "", ""]);
  
  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

/**
 * Download a string as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
