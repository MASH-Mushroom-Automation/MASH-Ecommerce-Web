"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatbotMetrics from "@/components/admin/ChatbotMetrics";
import { TimeRange, DashboardMetrics, TopQuery, TopProduct, FunnelStep, QueryPattern } from "@/types/analytics";
import { exportToCSV } from "@/lib/analytics/chatbot-dashboard";
import { 
  createRealTimeMonitor, 
  RefreshInterval, 
  formatTimeAgo, 
  getIntervalName,
  Alert as MonitorAlert
} from "@/lib/analytics/real-time-monitoring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Download, 
  RefreshCw, 
  Play, 
  Pause, 
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * AI Chatbot Analytics Dashboard Page
 * 
 * Admin dashboard for monitoring chatbot performance, analyzing user queries,
 * tracking conversions, and exporting analytics data.
 * 
 * Features:
 * - Time range filtering (today, week, month, year, custom dates)
 * - Real-time metrics display with auto-refresh (30s, 1min, 5min intervals)
 * - Data export (CSV for queries, products, patterns)
 * - Manual refresh functionality
 * - Conversion funnel visualization
 * - Query pattern analysis
 * - Alert notifications for monitoring issues
 * 
 * Route: /seller/analytics/chatbot
 * Access: Seller dashboard (protected route via src/proxy.ts)
 */
export default function ChatbotAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real-time monitoring state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(60000); // Default: 1 minute
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const monitorRef = useRef<ReturnType<typeof createRealTimeMonitor> | null>(null);
  
  // Data state for export functionality
  const [currentData, setCurrentData] = useState<{
    metrics: DashboardMetrics;
    topQueries: TopQuery[];
    topProducts: TopProduct[];
    funnel: FunnelStep[];
    patterns: QueryPattern[];
  } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setLastRefreshed(new Date());
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Analytics data refreshed");
    }, 1000);
  };

  const handleDataLoad = (data: {
    metrics: DashboardMetrics;
    topQueries: TopQuery[];
    topProducts: TopProduct[];
    funnel: FunnelStep[];
    patterns: QueryPattern[];
  }) => {
    setCurrentData(data);
    setLastRefreshed(new Date());
  };
  
  // Real-time monitoring functions
  const toggleAutoRefresh = () => {
    if (!monitorRef.current) return;
    
    if (autoRefreshEnabled) {
      monitorRef.current.stop();
      setAutoRefreshEnabled(false);
      toast.info("Auto-refresh paused");
    } else {
      monitorRef.current.start();
      setAutoRefreshEnabled(true);
      toast.success(`Auto-refresh enabled (${getIntervalName(refreshInterval)})`);
    }
  };
  
  const handleIntervalChange = (newInterval: RefreshInterval) => {
    setRefreshInterval(newInterval);
    if (monitorRef.current) {
      monitorRef.current.setInterval(newInterval);
      if (autoRefreshEnabled) {
        toast.success(`Refresh interval changed to ${getIntervalName(newInterval)}`);
      }
    }
  };
  
  const handleManualRefresh = async () => {
    if (monitorRef.current) {
      await monitorRef.current.refreshNow();
    } else {
      handleRefresh();
    }
  };
  
  const dismissAlert = (alertId: string) => {
    if (monitorRef.current) {
      monitorRef.current.dismissAlert(alertId);
    }
  };
  
  // Initialize real-time monitoring
  useEffect(() => {
    const monitor = createRealTimeMonitor(
      async () => {
        // Trigger data refresh
        handleRefresh();
      },
      (error) => {
        console.error("[Monitor] Error:", error);
        toast.error(`Monitoring error: ${error.message}`);
      },
      refreshInterval
    );
    
    monitorRef.current = monitor;
    
    // Subscribe to alerts
    const unsubscribe = monitor.onAlertsChange((newAlerts) => {
      setAlerts(newAlerts);
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      monitor.destroy();
    };
  }, []);
  
  // Update current time every second for "time ago" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleExportQueries = () => {
    if (!currentData?.topQueries || currentData.topQueries.length === 0) {
      toast.error("No query data to export");
      return;
    }

    try {
      exportToCSV(
        currentData.topQueries,
        "chatbot-top-queries",
        ["Query", "Count", "Avg Results", "Click-Through Rate", "Conversions"]
      );
      toast.success("Query data exported successfully");
    } catch (error) {
      console.error("[Export] Failed to export queries:", error);
      toast.error("Failed to export query data");
    }
  };

  const handleExportProducts = () => {
    if (!currentData?.topProducts || currentData.topProducts.length === 0) {
      toast.error("No product data to export");
      return;
    }

    try {
      exportToCSV(
        currentData.topProducts,
        "chatbot-top-products",
        ["Product Name", "Impressions", "Clicks", "CTR", "Conversions", "Conversion Rate"]
      );
      toast.success("Product data exported successfully");
    } catch (error) {
      console.error("[Export] Failed to export products:", error);
      toast.error("Failed to export product data");
    }
  };

  const handleExportPatterns = () => {
    if (!currentData?.patterns || currentData.patterns.length === 0) {
      toast.error("No pattern data to export");
      return;
    }

    try {
      const patternsForExport = currentData.patterns.map((p) => ({
        pattern: p.pattern,
        count: p.count,
        averageResults: p.averageResults,
        successRate: `${(p.successRate * 100).toFixed(1)}%`,
        examples: p.examples.join("; "),
      }));

      exportToCSV(
        patternsForExport,
        "chatbot-query-patterns",
        ["Pattern", "Query Count", "Avg Results", "Success Rate", "Example Queries"]
      );
      toast.success("Pattern data exported successfully");
    } catch (error) {
      console.error("[Export] Failed to export patterns:", error);
      toast.error("Failed to export pattern data");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI chatbot performance and user engagement metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select time range and export options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* Time Range Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select
                value={timeRange}
                onValueChange={(value) => {
                  setTimeRange(value as TimeRange);
                  if (value !== "custom") {
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {timeRange === "custom" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Export Buttons */}
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportQueries}
                disabled={!currentData?.topQueries || currentData.topQueries.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Queries
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProducts}
                disabled={!currentData?.topProducts || currentData.topProducts.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Products
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPatterns}
                disabled={!currentData?.patterns || currentData.patterns.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Patterns
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Monitoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time Monitoring</CardTitle>
              <CardDescription>
                Auto-refresh analytics data at configurable intervals
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastRefreshed && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last updated {formatTimeAgo(lastRefreshed)}</span>
                </div>
              )}
              <Badge variant={autoRefreshEnabled ? "default" : "secondary"}>
                {autoRefreshEnabled ? "Active" : "Paused"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Refresh Interval Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Refresh Interval</label>
              <Select
                value={String(refreshInterval)}
                onValueChange={(value) => handleIntervalChange(Number(value) as RefreshInterval)}
                disabled={autoRefreshEnabled}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                variant={autoRefreshEnabled ? "destructive" : "default"}
                size="sm"
                onClick={toggleAutoRefresh}
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Auto-Refresh
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Auto-Refresh
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === "error" ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {alert.title}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Metrics Display */}
      <ChatbotMetrics
        key={refreshKey}
        timeRange={timeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onDataLoad={handleDataLoad}
      />
    </div>
  );
}
