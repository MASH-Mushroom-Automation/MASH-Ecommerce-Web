"use client";

import React, { useState } from "react";
import { useRealtimeMode } from "@/contexts/RealtimeModeContext";
import { 
  Radio, 
  RadioOff, 
  RefreshCw, 
  X, 
  ChevronUp, 
  ChevronDown,
  Zap,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoControlPanelProps {
  /** Position of the panel */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Show panel by default */
  defaultOpen?: boolean;
}

/**
 * DemoControlPanel
 * 
 * Floating control panel for demo presentations.
 * Allows toggling real-time mode and shows sync status.
 * 
 * Add this to your layout for demos:
 * 
 * @example
 * // In layout.tsx
 * <DemoControlPanel position="bottom-right" />
 */
export function DemoControlPanel({
  position = "bottom-right",
  defaultOpen = false,
}: DemoControlPanelProps) {
  const {
    isRealtimeEnabled,
    toggleRealtimeMode,
    activeSubscriptions,
    lastSyncTime,
  } = useRealtimeMode();
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-20 right-4",
    "top-left": "top-20 left-4",
  };

  // Format last sync time
  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  if (!isOpen) {
    // Show only the toggle button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 p-3 rounded-full shadow-lg transition-all duration-200",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          positionClasses[position]
        )}
        title="Open Demo Controls"
      >
        <Zap className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-card border border-border rounded-lg shadow-xl transition-all duration-200",
        positionClasses[position],
        isMinimized ? "w-64" : "w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Demo Controls</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted rounded"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Real-time Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Real-time Mode</span>
              <button
                onClick={toggleRealtimeMode}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  isRealtimeEnabled
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {isRealtimeEnabled ? (
                  <>
                    <Radio className="h-4 w-4 animate-pulse" />
                    LIVE
                  </>
                ) : (
                  <>
                    <RadioOff className="h-4 w-4" />
                    OFF
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRealtimeEnabled
                ? "CMS changes appear instantly"
                : "Manual refresh required"}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Subscriptions</span>
              <span className="font-mono">{activeSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Sync
              </span>
              <span className="font-mono text-xs">
                {formatTime(lastSyncTime)}
              </span>
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </button>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            Edit content in{" "}
            <a
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sanity Studio
            </a>
            {" "}to see live updates
          </p>
        </div>
      )}

      {/* Minimized Status */}
      {isMinimized && (
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isRealtimeEnabled ? "LIVE" : "OFF"}
          </span>
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isRealtimeEnabled ? "bg-green-500 animate-pulse" : "bg-muted"
            )}
          />
        </div>
      )}
    </div>
  );
}

export default DemoControlPanel;
