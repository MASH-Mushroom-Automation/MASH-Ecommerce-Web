/**
 * BatchStockUpdate Component
 * UI for batch stock updates via CSV upload
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, X, Check, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  parseStockAdjustmentCSV, 
  generateTemplateCSV, 
  generateErrorReportCSV,
  type CSVParseResult,
  type ParsedCSVRow 
} from '@/lib/csv/stock-adjustment-parser';

/**
 * Import state enum
 */
type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'complete' | 'error';

/**
 * API response type
 */
interface BatchImportResponse {
  success: boolean;
  message: string;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    mode: string;
  };
  results: {
    successes: Array<{
      sku: string;
      productId: string;
      previousStock: number;
      newStock: number;
    }>;
    failures: Array<{
      sku: string;
      error: string;
    }>;
  };
}

/**
 * Props
 */
interface BatchStockUpdateProps {
  onImportComplete?: (results: BatchImportResponse) => void;
  className?: string;
}

/**
 * BatchStockUpdate Component
 */
export function BatchStockUpdate({ onImportComplete, className }: BatchStockUpdateProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importResult, setImportResult] = useState<BatchImportResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [atomicMode, setAtomicMode] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Download template CSV
   */
  const handleDownloadTemplate = useCallback(() => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'stock-adjustment-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded');
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setState('parsing');
    setProgress(10);

    try {
      const content = await file.text();
      setProgress(50);
      
      const result = parseStockAdjustmentCSV(content);
      setProgress(100);
      setParseResult(result);
      
      if (result.success || result.validRows > 0) {
        setState('preview');
      } else {
        setState('error');
        toast.error('No valid rows found in CSV');
      }
    } catch (error) {
      setState('error');
      toast.error(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  }, []);

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Start import
   */
  const handleImport = useCallback(async () => {
    if (!parseResult || parseResult.validRows === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setState('importing');
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      const validRows = parseResult.rows.filter(r => r.valid && r.data);
      const adjustments = validRows.map(r => ({
        sku: r.data!.sku,
        adjustmentType: r.data!.adjustmentType,
        quantityChange: r.data!.quantityChange,
        reason: r.data!.reason,
        notes: r.data!.notes,
      }));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/seller/stock/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustments,
          mode: atomicMode ? 'atomic' : 'partial',
        }),
        signal: abortControllerRef.current.signal,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data: BatchImportResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      setImportResult(data);
      setState('complete');
      toast.success(data.message);
      onImportComplete?.(data);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Import cancelled');
        setState('preview');
      } else {
        setState('error');
        toast.error(error instanceof Error ? error.message : 'Import failed');
      }
    }
  }, [parseResult, atomicMode, onImportComplete]);

  /**
   * Cancel import
   */
  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState('idle');
    setParseResult(null);
    setImportResult(null);
    setProgress(0);
  }, []);

  /**
   * Download error report
   */
  const handleDownloadErrorReport = useCallback(() => {
    if (!parseResult) return;
    
    const csv = generateErrorReportCSV(parseResult.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'import-errors.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Error report downloaded');
  }, [parseResult]);

  /**
   * Toggle row expansion
   */
  const toggleRowExpand = useCallback((rowNumber: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  }, []);

  /**
   * Reset to initial state
   */
  const handleReset = useCallback(() => {
    setState('idle');
    setParseResult(null);
    setImportResult(null);
    setProgress(0);
    setExpandedRows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Stock Update
        </CardTitle>
        <CardDescription>
          Import stock adjustments from CSV file (max 500 rows)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Idle state - File upload area */}
        {state === 'idle' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop CSV file here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Parsing state */}
        {state === 'parsing' && (
          <div className="space-y-4 text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Parsing CSV file...</p>
            <Progress value={progress} className="w-64 mx-auto" />
          </div>
        )}

        {/* Preview state */}
        {state === 'preview' && parseResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{parseResult.totalRows}</p>
                  <p className="text-xs text-muted-foreground">Total Rows</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{parseResult.validRows}</p>
                  <p className="text-xs text-muted-foreground">Valid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{parseResult.invalidRows}</p>
                  <p className="text-xs text-muted-foreground">Invalid</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="atomic-mode" className="text-sm">
                  Atomic Mode
                </Label>
                <Switch
                  id="atomic-mode"
                  checked={atomicMode}
                  onCheckedChange={setAtomicMode}
                />
              </div>
            </div>

            {/* Warnings */}
            {parseResult.invalidRows > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  {parseResult.invalidRows} rows have errors and will be skipped.
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 p-0 h-auto"
                    onClick={handleDownloadErrorReport}
                  >
                    Download error report
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview table */}
            <ScrollArea className="h-64 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseResult.rows.slice(0, 50).map((row) => (
                    <React.Fragment key={row.rowNumber}>
                      <TableRow
                        className={cn(
                          'cursor-pointer',
                          !row.valid && 'bg-red-50 dark:bg-red-950/20'
                        )}
                        onClick={() => !row.valid && toggleRowExpand(row.rowNumber)}
                      >
                        <TableCell className="font-mono text-sm">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell>
                          {!row.valid && (
                            expandedRows.has(row.rowNumber) 
                              ? <ChevronUp className="h-4 w-4" />
                              : <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{row.raw.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.raw.type}</Badge>
                        </TableCell>
                        <TableCell>{row.raw.quantity}</TableCell>
                        <TableCell className="truncate max-w-32">{row.raw.reason}</TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge variant="default" className="bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                      {!row.valid && expandedRows.has(row.rowNumber) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-red-50 dark:bg-red-950/20">
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {row.errors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {parseResult.totalRows > 50 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 50 rows of {parseResult.totalRows}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={parseResult.validRows === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {parseResult.validRows} Rows
              </Button>
            </div>
          </div>
        )}

        {/* Importing state */}
        {state === 'importing' && (
          <div className="space-y-4 text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Importing stock adjustments...</p>
            <Progress value={progress} className="w-64 mx-auto" />
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel Import
            </Button>
          </div>
        )}

        {/* Complete state */}
        {state === 'complete' && importResult && (
          <div className="space-y-4">
            <Alert variant={importResult.success ? 'default' : 'destructive'}>
              {importResult.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {importResult.success ? 'Import Complete' : 'Import Completed with Errors'}
              </AlertTitle>
              <AlertDescription>
                {importResult.message}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 bg-muted/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{importResult.summary.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {importResult.summary.succeeded}
                </p>
                <p className="text-xs text-muted-foreground">Succeeded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {importResult.summary.failed}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>

            {importResult.results.failures.length > 0 && (
              <ScrollArea className="h-32 border rounded-lg p-4">
                <p className="font-medium mb-2">Failed Rows:</p>
                <ul className="text-sm space-y-1">
                  {importResult.results.failures.map((f, i) => (
                    <li key={i} className="text-red-600">
                      <span className="font-mono">{f.sku}</span>: {f.error}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}

            <Button onClick={handleReset} className="w-full">
              Import Another File
            </Button>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="space-y-4 text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
            <p className="text-red-600">Failed to process CSV file</p>
            {parseResult?.errors.map((error, i) => (
              <p key={i} className="text-sm text-muted-foreground">{error}</p>
            ))}
            <Button onClick={handleReset}>Try Again</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BatchStockUpdate;
