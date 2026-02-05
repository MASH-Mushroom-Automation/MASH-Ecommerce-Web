/**
 * StockHistoryLog Component
 * Audit trail display for stock adjustments
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Package,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  ArrowRightLeft,
  Edit,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { useStockHistory, useRecentAdjustments } from '@/hooks/useStockManagement';
import { exportStockHistoryToCSV, downloadCSV } from '@/lib/sanity/stock-history-service';
import type { StockAdjustmentType } from '@/types/stock-management';
import { toast } from 'sonner';

/**
 * Adjustment type config
 */
const ADJUSTMENT_TYPE_CONFIG: Record<StockAdjustmentType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  received: {
    label: 'Received',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  sold: {
    label: 'Sold',
    icon: TrendingDown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  damaged: {
    label: 'Damaged',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  transferred: {
    label: 'Transferred',
    icon: ArrowRightLeft,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  adjustment: {
    label: 'Adjustment',
    icon: Edit,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
};

/**
 * Date range presets
 */
const DATE_PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Last 90 Days', value: '90days' },
  { label: 'Custom', value: 'custom' },
];

/**
 * Props
 */
interface StockHistoryLogProps {
  productId?: string;
  showProductColumn?: boolean;
  className?: string;
  pageSize?: number;
}

/**
 * StockHistoryLog Component
 */
export function StockHistoryLog({
  productId,
  showProductColumn = false,
  className,
  pageSize = 20
}: StockHistoryLogProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<StockAdjustmentType | 'all'>('all');
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use appropriate hook based on whether we have a productId
  // useStockHistory for single product, useRecentAdjustments for all products
  const productHistoryQuery = useStockHistory({
    productId: productId || '',
    page,
    pageSize,
    enabled: !!productId
  });

  const allHistoryQuery = useRecentAdjustments({
    limit: pageSize * page,
    enabled: !productId
  });

  // Merge results based on which query is active
  const historyData = productId
    ? (productHistoryQuery as any).data
    : {
      items: allHistoryQuery.adjustments,
      total: allHistoryQuery.adjustments.length,
      hasMore: false,
      page,
      pageSize
    };

  const isLoading = productId ? productHistoryQuery.isLoading : allHistoryQuery.isLoading;
  const error = productId ? productHistoryQuery.error : allHistoryQuery.error;
  const isFetching = productId ? productHistoryQuery.isFetching : allHistoryQuery.isFetching;

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return { from: new Date(now.setHours(0, 0, 0, 0)), to: new Date() };
      case '7days':
        return { from: subDays(now, 7), to: new Date() };
      case '30days':
        return { from: subDays(now, 30), to: new Date() };
      case '90days':
        return { from: subDays(now, 90), to: new Date() };
      case 'custom':
        return { from: dateFrom, to: dateTo };
      default:
        return { from: undefined, to: undefined };
    }
  }, [datePreset, dateFrom, dateTo]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!historyData?.items) return [];

    let filtered = [...historyData.items];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.adjustmentType === typeFilter);
    }

    // Date filter
    if (dateRange.from) {
      filtered = filtered.filter(item =>
        isAfter(parseISO(item.adjustmentDate), dateRange.from!)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(item =>
        isBefore(parseISO(item.adjustmentDate), dateRange.to!)
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.reason.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.adjustedBy?.name?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'date') {
        return multiplier * (new Date(a.adjustmentDate).getTime() - new Date(b.adjustmentDate).getTime());
      }
      return multiplier * (a.quantityChange - b.quantityChange);
    });

    return filtered;
  }, [historyData, typeFilter, dateRange, searchQuery, sortField, sortOrder]);

  // Toggle row expansion
  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    if (!filteredData.length) {
      toast.error('No data to export');
      return;
    }

    const csv = exportStockHistoryToCSV(filteredData);
    const filename = productId
      ? `stock-history-${productId}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      : `stock-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;

    downloadCSV(csv, filename);
    toast.success('History exported successfully');
  }, [filteredData, productId]);

  // Toggle sort
  const toggleSort = useCallback((field: 'date' | 'quantity') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  // Render type icon
  const TypeIcon = ({ type }: { type: StockAdjustmentType }) => {
    const config = ADJUSTMENT_TYPE_CONFIG[type];
    const Icon = config.icon;
    return (
      <div className={cn('p-1.5 rounded-full', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
    );
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p className="text-red-600">Failed to load stock history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock History
          </CardTitle>

          <Button variant="outline" size="sm" onClick={handleExport} disabled={!filteredData.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reason, notes, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as StockAdjustmentType | 'all')}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ADJUSTMENT_TYPE_CONFIG).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date filter */}
          <Select value={datePreset} onValueChange={setDatePreset}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom date pickers */}
          {datePreset === 'custom' && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                  />
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No stock adjustments found</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96 w-full">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead
                        className="cursor-pointer min-w-[100px]"
                        onClick={() => toggleSort('date')}
                      >
                        <span className="flex items-center gap-1">
                          Date
                          {sortField === 'date' && (
                            sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                          )}
                        </span>
                      </TableHead>
                      <TableHead className="min-w-[100px]">Type</TableHead>
                      {showProductColumn && <TableHead className="min-w-[120px]">Product</TableHead>}
                      <TableHead
                        className="cursor-pointer text-right min-w-[80px]"
                        onClick={() => toggleSort('quantity')}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Qty
                          {sortField === 'quantity' && (
                            sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                          )}
                        </span>
                      </TableHead>
                      <TableHead className="text-right min-w-[100px]">Stock</TableHead>
                      <TableHead className="min-w-[120px]">Reason</TableHead>
                      <TableHead className="min-w-[100px]">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <React.Fragment key={item._id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRow(item._id)}
                        >
                          <TableCell>
                            {expandedRows.has(item._id)
                              ? <ChevronUp className="h-4 w-4" />
                              : <ChevronDown className="h-4 w-4" />
                            }
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {format(parseISO(item.adjustmentDate), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <TypeIcon type={item.adjustmentType} />
                          </TableCell>
                          {showProductColumn && (
                            <TableCell className="font-medium">
                              {(item as { product?: { name?: string } }).product?.name || 'Unknown'}
                            </TableCell>
                          )}
                          <TableCell className={cn(
                            'text-right font-mono font-medium',
                            item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.previousStock} → {item.newStock}
                          </TableCell>
                          <TableCell className="max-w-32 truncate text-sm">
                            {item.reason}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm truncate max-w-24">
                            {item.adjustedBy?.name || item.adjustedBy?.email || 'System'}
                          </TableCell>
                        </TableRow>

                        {/* Expanded details */}
                        {expandedRows.has(item._id) && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={showProductColumn ? 8 : 7} className="py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-muted-foreground">Reason Code</p>
                                  <p>{item.reason}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Date & Time</p>
                                  <p>{format(parseISO(item.adjustmentDate), 'PPpp')}</p>
                                </div>
                                {item.notes && (
                                  <div className="col-span-2">
                                    <p className="font-medium text-muted-foreground">Notes</p>
                                    <p className="whitespace-pre-wrap">{item.notes}</p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>

            {/* Pagination */}
            {historyData && historyData.hasMore && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {page} · {filteredData.length} of {historyData.total} items
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!historyData.hasMore}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                    {isFetching && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StockHistoryLog;
