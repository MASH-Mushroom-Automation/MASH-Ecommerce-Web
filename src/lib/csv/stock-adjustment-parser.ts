/**
 * CSV Stock Adjustment Parser
 * Parses and validates CSV files for batch stock updates
 */

import { z } from 'zod';
import type { StockAdjustmentType, StockAdjustmentRequest } from '@/types/stock-management';

/**
 * CSV Row interface
 */
export interface CSVRow {
  sku: string;
  quantity: string | number;
  type: string;
  reason: string;
  notes?: string;
}

/**
 * Parsed CSV row with validation result
 */
export interface ParsedCSVRow {
  rowNumber: number;
  raw: CSVRow;
  valid: boolean;
  errors: string[];
  data?: Omit<StockAdjustmentRequest, 'productId'> & { sku: string };
}

/**
 * Parse result containing all rows and summary
 */
export interface CSVParseResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ParsedCSVRow[];
  errors: string[];
}

/**
 * Valid adjustment types
 */
const VALID_ADJUSTMENT_TYPES: StockAdjustmentType[] = [
  'received',
  'sold',
  'returned',
  'damaged',
  'transferred',
  'adjustment',
];

/**
 * CSV row validation schema
 */
const csvRowSchema = z.object({
  sku: z.string().min(1, 'SKU is required').trim(),
  quantity: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number().int(),
  ]).pipe(z.number().int('Quantity must be an integer')),
  type: z.string()
    .trim()
    .toLowerCase()
    .refine(
      (val): val is StockAdjustmentType => VALID_ADJUSTMENT_TYPES.includes(val as StockAdjustmentType),
      { message: `Type must be one of: ${VALID_ADJUSTMENT_TYPES.join(', ')}` }
    ),
  reason: z.string().min(1, 'Reason is required').trim(),
  notes: z.string().optional().transform(val => val?.trim() || undefined),
});

/**
 * Parse CSV content string into rows
 */
export function parseCSVContent(content: string): CSVRow[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());

  // Validate required headers
  const requiredHeaders = ['sku', 'quantity', 'type', 'reason'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      continue; // Skip malformed rows, will be reported as validation errors
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    rows.push({
      sku: row.sku || '',
      quantity: row.quantity || '',
      type: row.type || '',
      reason: row.reason || '',
      notes: row.notes,
    });
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
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

/**
 * Validate and parse CSV rows
 */
export function validateCSVRows(rows: CSVRow[]): ParsedCSVRow[] {
  return rows.map((row, index) => {
    const parseResult = csvRowSchema.safeParse(row);

    if (parseResult.success) {
      const data = parseResult.data;
      return {
        rowNumber: index + 2, // +2 for 1-based index and header row
        raw: row,
        valid: true,
        errors: [],
        data: {
          sku: data.sku,
          adjustmentType: data.type,
          quantityChange: data.quantity,
          reason: data.reason,
          notes: data.notes,
        },
      };
    }

    return {
      rowNumber: index + 2,
      raw: row,
      valid: false,
      errors: parseResult.error.errors.map(e => e.message),
    };
  });
}

/**
 * Main parse function - parses CSV content and validates all rows
 */
export function parseStockAdjustmentCSV(content: string): CSVParseResult {
  const errors: string[] = [];
  let rows: ParsedCSVRow[] = [];

  try {
    const csvRows = parseCSVContent(content);
    
    if (csvRows.length === 0) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        errors: ['No data rows found in CSV'],
      };
    }

    if (csvRows.length > 500) {
      return {
        success: false,
        totalRows: csvRows.length,
        validRows: 0,
        invalidRows: csvRows.length,
        rows: [],
        errors: ['Maximum 500 rows allowed per batch'],
      };
    }

    rows = validateCSVRows(csvRows);
  } catch (error) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      rows: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse CSV'],
    };
  }

  const validRows = rows.filter(r => r.valid);
  const invalidRows = rows.filter(r => !r.valid);

  return {
    success: invalidRows.length === 0 && validRows.length > 0,
    totalRows: rows.length,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
    rows,
    errors,
  };
}

/**
 * Generate a template CSV content
 */
export function generateTemplateCSV(): string {
  const header = 'SKU,Quantity,Type,Reason,Notes';
  const examples = [
    'MUSH-001,10,received,PURCHASE_ORDER,New shipment arrived',
    'MUSH-002,-5,sold,CUSTOMER_ORDER,Order #12345',
    'MUSH-003,-2,damaged,SPOILED,Found during inventory check',
    'MUSH-004,15,adjustment,COUNT_DISCREPANCY,Physical count correction',
  ];

  return [header, ...examples].join('\n');
}

/**
 * Convert parse results to CSV for error reporting
 */
export function generateErrorReportCSV(results: ParsedCSVRow[]): string {
  const invalidRows = results.filter(r => !r.valid);
  
  if (invalidRows.length === 0) {
    return 'Row,SKU,Quantity,Type,Reason,Errors\nNo errors found';
  }

  const header = 'Row,SKU,Quantity,Type,Reason,Errors';
  const rows = invalidRows.map(row => 
    [
      row.rowNumber,
      row.raw.sku,
      row.raw.quantity,
      row.raw.type,
      row.raw.reason,
      `"${row.errors.join('; ')}"`,
    ].join(',')
  );

  return [header, ...rows].join('\n');
}
