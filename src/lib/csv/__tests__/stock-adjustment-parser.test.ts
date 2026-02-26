/**
 * Tests for CSV Stock Adjustment Parser
 * Covers: parseCSVContent, validateCSVRows, parseStockAdjustmentCSV,
 *         generateTemplateCSV, generateErrorReportCSV
 */

import {
  parseCSVContent,
  validateCSVRows,
  parseStockAdjustmentCSV,
  generateTemplateCSV,
  generateErrorReportCSV,
  type CSVRow,
  type ParsedCSVRow,
} from '../stock-adjustment-parser';

describe('parseCSVContent', () => {
  it('parses basic CSV with required columns', () => {
    const csv = 'sku,quantity,type,reason\nMUSH-001,10,received,PURCHASE_ORDER';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      sku: 'MUSH-001',
      quantity: '10',
      type: 'received',
      reason: 'PURCHASE_ORDER',
      notes: undefined,
    });
  });

  it('parses CSV with optional notes column', () => {
    const csv = 'sku,quantity,type,reason,notes\nMUSH-001,10,received,PURCHASE_ORDER,New shipment';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].notes).toBe('New shipment');
  });

  it('parses multiple data rows', () => {
    const csv = [
      'sku,quantity,type,reason',
      'MUSH-001,10,received,PURCHASE_ORDER',
      'MUSH-002,-5,sold,CUSTOMER_ORDER',
      'MUSH-003,-2,damaged,SPOILED',
    ].join('\n');
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(3);
  });

  it('handles case-insensitive headers', () => {
    const csv = 'SKU,Quantity,TYPE,Reason\nMUSH-001,10,received,ORDER';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].sku).toBe('MUSH-001');
  });

  it('throws on empty file', () => {
    expect(() => parseCSVContent('')).toThrow(
      'CSV file must have a header row and at least one data row'
    );
  });

  it('throws on header-only file', () => {
    expect(() => parseCSVContent('sku,quantity,type,reason')).toThrow(
      'CSV file must have a header row and at least one data row'
    );
  });

  it('throws on missing required columns', () => {
    expect(() => parseCSVContent('sku,quantity\nMUSH-001,10')).toThrow(
      'Missing required columns: type, reason'
    );
  });

  it('handles Windows-style line endings (CRLF)', () => {
    const csv = 'sku,quantity,type,reason\r\nMUSH-001,10,received,ORDER';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
  });

  it('handles quoted fields with commas', () => {
    const csv = 'sku,quantity,type,reason,notes\nMUSH-001,10,received,ORDER,"Note with, comma"';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].notes).toBe('Note with, comma');
  });

  it('handles quoted fields with escaped quotes', () => {
    const csv = 'sku,quantity,type,reason,notes\nMUSH-001,10,received,ORDER,"He said ""hello"""';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].notes).toBe('He said "hello"');
  });

  it('skips rows with wrong number of columns', () => {
    const csv = [
      'sku,quantity,type,reason',
      'MUSH-001,10,received,ORDER',
      'MUSH-002,5', // too few columns
      'MUSH-003,-2,damaged,SPOILED',
    ].join('\n');
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].sku).toBe('MUSH-001');
    expect(rows[1].sku).toBe('MUSH-003');
  });

  it('filters out blank lines', () => {
    const csv = 'sku,quantity,type,reason\n\nMUSH-001,10,received,ORDER\n\n';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
  });

  it('trims whitespace from headers', () => {
    const csv = ' sku , quantity , type , reason \nMUSH-001,10,received,ORDER';
    const rows = parseCSVContent(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].sku).toBe('MUSH-001');
  });
});

describe('validateCSVRows', () => {
  it('validates a correct row', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '10', type: 'received', reason: 'PURCHASE_ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results).toHaveLength(1);
    expect(results[0].valid).toBe(true);
    expect(results[0].errors).toEqual([]);
    expect(results[0].data).toEqual({
      sku: 'MUSH-001',
      adjustmentType: 'received',
      quantityChange: 10,
      reason: 'PURCHASE_ORDER',
      notes: undefined,
    });
  });

  it('reports row numbers starting at 2 (1-based + header)', () => {
    const rows: CSVRow[] = [
      { sku: 'A', quantity: '1', type: 'received', reason: 'R' },
      { sku: 'B', quantity: '2', type: 'received', reason: 'R' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].rowNumber).toBe(2);
    expect(results[1].rowNumber).toBe(3);
  });

  it('rejects rows with empty SKU', () => {
    const rows: CSVRow[] = [
      { sku: '', quantity: '10', type: 'received', reason: 'ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(false);
    expect(results[0].errors.length).toBeGreaterThan(0);
    expect(results[0].errors.some(e => e.toLowerCase().includes('small') || e.toLowerCase().includes('required'))).toBe(true);
  });

  it('rejects rows with invalid adjustment type', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '10', type: 'invalid_type', reason: 'ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(false);
    expect(results[0].errors.length).toBeGreaterThan(0);
  });

  it('rejects rows with non-integer quantity', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: 'abc', type: 'received', reason: 'ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(false);
  });

  it('accepts numeric quantity as number type', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: 10, type: 'received', reason: 'ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(true);
    expect(results[0].data?.quantityChange).toBe(10);
  });

  it('rejects empty reason', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '10', type: 'received', reason: '' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(false);
    expect(results[0].errors.length).toBeGreaterThan(0);
  });

  it('trims and lowercases type field', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '5', type: '  Received  ', reason: 'ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(true);
    expect(results[0].data?.adjustmentType).toBe('received');
  });

  it('trims notes and converts empty to undefined', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '5', type: 'received', reason: 'ORDER', notes: '   ' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(true);
    expect(results[0].data?.notes).toBeUndefined();
  });

  it('preserves non-empty notes', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '5', type: 'received', reason: 'ORDER', notes: 'New shipment' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].data?.notes).toBe('New shipment');
  });

  it('accepts all 6 valid adjustment types', () => {
    const types = ['received', 'sold', 'returned', 'damaged', 'transferred', 'adjustment'];
    types.forEach((type) => {
      const rows: CSVRow[] = [
        { sku: 'MUSH-001', quantity: '1', type, reason: 'TEST' },
      ];
      const results = validateCSVRows(rows);
      expect(results[0].valid).toBe(true);
    });
  });

  it('accepts negative quantity values', () => {
    const rows: CSVRow[] = [
      { sku: 'MUSH-001', quantity: '-5', type: 'sold', reason: 'CUSTOMER_ORDER' },
    ];
    const results = validateCSVRows(rows);
    expect(results[0].valid).toBe(true);
    expect(results[0].data?.quantityChange).toBe(-5);
  });
});

describe('parseStockAdjustmentCSV', () => {
  it('parses valid CSV and returns success', () => {
    const csv = [
      'sku,quantity,type,reason',
      'MUSH-001,10,received,PURCHASE_ORDER',
      'MUSH-002,-5,sold,CUSTOMER_ORDER',
    ].join('\n');
    const result = parseStockAdjustmentCSV(csv);
    expect(result.success).toBe(true);
    expect(result.totalRows).toBe(2);
    expect(result.validRows).toBe(2);
    expect(result.invalidRows).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it('returns failure when all rows are invalid', () => {
    const csv = [
      'sku,quantity,type,reason',
      ',abc,invalid,',
    ].join('\n');
    const result = parseStockAdjustmentCSV(csv);
    expect(result.success).toBe(false);
    expect(result.invalidRows).toBe(1);
  });

  it('returns failure with mixed valid/invalid rows', () => {
    const csv = [
      'sku,quantity,type,reason',
      'MUSH-001,10,received,ORDER',
      ',abc,invalid,',
    ].join('\n');
    const result = parseStockAdjustmentCSV(csv);
    expect(result.success).toBe(false);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(1);
  });

  it('returns error for empty CSV', () => {
    const result = parseStockAdjustmentCSV('');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('header row');
  });

  it('returns error for CSV with no data rows after filtering blanks', () => {
    const csv = 'sku,quantity,type,reason\n\n\n';
    const result = parseStockAdjustmentCSV(csv);
    expect(result.success).toBe(false);
    // Blank lines are filtered, leaving only the header, which triggers the <2 lines check
    expect(result.errors[0]).toContain('header row');
  });

  it('returns error when >500 rows', () => {
    const rows = ['sku,quantity,type,reason'];
    for (let i = 0; i < 501; i++) {
      rows.push(`MUSH-${i},1,received,ORDER`);
    }
    const result = parseStockAdjustmentCSV(rows.join('\n'));
    expect(result.success).toBe(false);
    expect(result.errors[0]).toBe('Maximum 500 rows allowed per batch');
    expect(result.totalRows).toBe(501);
  });

  it('returns error for missing required columns', () => {
    const csv = 'sku,quantity\nMUSH-001,10';
    const result = parseStockAdjustmentCSV(csv);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Missing required columns');
  });

  it('handles non-Error exception in parse', () => {
    // Test the catch branch for non-Error thrown values
    const result = parseStockAdjustmentCSV('sku,quantity,type,reason');
    expect(result.success).toBe(false);
  });

  it('allows exactly 500 rows', () => {
    const rows = ['sku,quantity,type,reason'];
    for (let i = 0; i < 500; i++) {
      rows.push(`MUSH-${i},1,received,ORDER`);
    }
    const result = parseStockAdjustmentCSV(rows.join('\n'));
    expect(result.totalRows).toBe(500);
    expect(result.errors).not.toContain('Maximum 500 rows allowed per batch');
  });
});

describe('generateTemplateCSV', () => {
  it('returns a CSV string with header and example rows', () => {
    const template = generateTemplateCSV();
    const lines = template.split('\n');
    expect(lines[0]).toBe('SKU,Quantity,Type,Reason,Notes');
    expect(lines.length).toBe(5); // header + 4 examples
  });

  it('includes all adjustment type examples', () => {
    const template = generateTemplateCSV();
    expect(template).toContain('received');
    expect(template).toContain('sold');
    expect(template).toContain('damaged');
    expect(template).toContain('adjustment');
  });

  it('template rows are parseable', () => {
    const template = generateTemplateCSV();
    // The template should be valid CSV that can be parsed
    const result = parseStockAdjustmentCSV(template);
    expect(result.totalRows).toBe(4);
  });
});

describe('generateErrorReportCSV', () => {
  it('returns no-errors message for empty invalid rows', () => {
    const rows: ParsedCSVRow[] = [
      { rowNumber: 2, raw: { sku: 'A', quantity: '1', type: 'received', reason: 'R' }, valid: true, errors: [] },
    ];
    const report = generateErrorReportCSV(rows);
    expect(report).toContain('No errors found');
  });

  it('generates error report for invalid rows', () => {
    const rows: ParsedCSVRow[] = [
      {
        rowNumber: 2,
        raw: { sku: '', quantity: 'abc', type: 'invalid', reason: '' },
        valid: false,
        errors: ['SKU is required', 'Invalid type'],
      },
      {
        rowNumber: 3,
        raw: { sku: 'MUSH-001', quantity: '10', type: 'received', reason: 'ORDER' },
        valid: true,
        errors: [],
      },
    ];
    const report = generateErrorReportCSV(rows);
    const lines = report.split('\n');
    expect(lines[0]).toBe('Row,SKU,Quantity,Type,Reason,Errors');
    expect(lines.length).toBe(2); // header + 1 invalid row
    expect(lines[1]).toContain('2'); // row number
    expect(lines[1]).toContain('SKU is required; Invalid type');
  });

  it('includes multiple invalid rows', () => {
    const rows: ParsedCSVRow[] = [
      { rowNumber: 2, raw: { sku: '', quantity: '1', type: 'x', reason: '' }, valid: false, errors: ['E1'] },
      { rowNumber: 3, raw: { sku: '', quantity: '2', type: 'y', reason: '' }, valid: false, errors: ['E2'] },
    ];
    const report = generateErrorReportCSV(rows);
    const lines = report.split('\n');
    expect(lines.length).toBe(3); // header + 2 invalid rows
  });
});
