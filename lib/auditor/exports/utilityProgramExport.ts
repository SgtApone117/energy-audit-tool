import { AuditData, AuditUtilityBill } from '../types';

type UtilityProgramFormat = 'eversource' | 'national-grid';

const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

function escapeCsvValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function sortBills(bills: AuditUtilityBill[]): AuditUtilityBill[] {
  return [...bills].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (MONTH_ORDER[a.month] || 0) - (MONTH_ORDER[b.month] || 0);
  });
}

function buildRowsForBills(
  audit: AuditData,
  format: UtilityProgramFormat
): { headers: string[]; rows: (string | number | undefined)[][] } {
  const siteName = audit.buildingInfo.name || audit.name || 'Site';
  const address = audit.buildingInfo.address || '';
  const city = audit.buildingInfo.city || '';
  const state = audit.buildingInfo.state || '';
  const zip = audit.buildingInfo.zipCode || '';
  const workflow = audit.workflowType || 'inspection';
  const inspectionType = audit.inspectionType || 'pre';

  if (format === 'eversource') {
    const headers = [
      'Account Name',
      'Site Name',
      'Address',
      'City',
      'State',
      'Zip',
      'Billing Month',
      'Billing Year',
      'Electricity kWh',
      'Electricity Cost',
      'Gas Therms',
      'Gas Cost',
      'Workflow Type',
      'Inspection Type',
    ];
    const rows = sortBills(audit.utilityBills).map((bill) => ([
      audit.buildingInfo.contactName || siteName,
      siteName,
      address,
      city,
      state,
      zip,
      bill.month,
      bill.year,
      bill.electricityKwh,
      bill.electricityCost,
      bill.gasTherm,
      bill.gasCost,
      workflow,
      inspectionType,
    ]));
    return { headers, rows };
  }

  const headers = [
    'Customer Name',
    'Service Address',
    'Service City',
    'Service State',
    'Service Zip',
    'Month',
    'Year',
    'Electric Usage (kWh)',
    'Electric Cost ($)',
    'Gas Usage (Therms)',
    'Gas Cost ($)',
    'Workflow Type',
    'Inspection Type',
  ];
  const rows = sortBills(audit.utilityBills).map((bill) => ([
    audit.buildingInfo.contactName || siteName,
    address,
    city,
    state,
    zip,
    bill.month,
    bill.year,
    bill.electricityKwh,
    bill.electricityCost,
    bill.gasTherm,
    bill.gasCost,
    workflow,
    inspectionType,
  ]));
  return { headers, rows };
}

export function generateUtilityProgramExport(
  audit: AuditData,
  format: UtilityProgramFormat
): string {
  const { headers, rows } = buildRowsForBills(audit, format);
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(',')),
  ];

  return lines.join('\n');
}
