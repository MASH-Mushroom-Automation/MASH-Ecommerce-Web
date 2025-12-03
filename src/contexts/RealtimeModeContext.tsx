    "use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { subscriptionManager } from "@/lib/sanity/realtime";

interface RealtimeModeContextType {
  /** Whether real-time mode is enabled */
  isRealtimeEnabled: boolean;
  /** Toggle real-time mode on/off */
  toggleRealtimeMode: () => void;
  /** Enable real-time mode */
  enableRealtime: () => void;
  /** Disable real-time mode */
  disableRealtime: () => void;
  /** Number of active subscriptions */
  activeSubscriptions: number;
  /** Last sync time */
  lastSyncTime: Date | null;
  /** Update last sync time */
  updateLastSyncTime: () => void;
}

const RealtimeModeContext = createContext<RealtimeModeContextType | undefined>(undefined);

interface RealtimeModeProviderProps {
  children: React.ReactNode;
  /** Enable real-time mode by default (for demo) */
  defaultEnabled?: boolean;
}

/**
 * RealtimeModeProvider
 * 
 * Provides real-time mode context for the entire app.
 * Enable during demos to show live CMS updates.
 * 
 * @example
 * // In layout.tsx
 * <RealtimeModeProvider defaultEnabled={false}>
 *   {children}
 * </RealtimeModeProvider>
 * 
 * // In a component
 * const { isRealtimeEnabled, toggleRealtimeMode } = useRealtimeMode();
 */
export function RealtimeModeProvider({ 
  children, 
  defaultEnabled = false 
}: RealtimeModeProviderProps) {
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(defaultEnabled);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update subscription count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSubscriptions(subscriptionManager.getActiveCount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup subscriptions when real-time mode is disabled
  useEffect(() => {
    if (!isRealtimeEnabled) {
      subscriptionManager.unsubscribeAll();
      setActiveSubscriptions(0);
    }
  }, [isRealtimeEnabled]);

  const toggleRealtimeMode = useCallback(() => {
    setIsRealtimeEnabled((prev) => {
      const newValue = !prev;
      console.log(`🔄 Real-time mode: ${newValue ? "ENABLED" : "DISABLED"}`);
      return newValue;
    });
  }, []);

  const enableRealtime = useCallback(() => {
    setIsRealtimeEnabled(true);
    console.log("🔄 Real-time mode: ENABLED");
  }, []);

  const disableRealtime = useCallback(() => {
    setIsRealtimeEnabled(false);
    console.log("🔄 Real-time mode: DISABLED");
  }, []);

  const updateLastSyncTime = useCallback(() => {
    setLastSyncTime(new Date());
  }, []);

  return (
    <RealtimeModeContext.Provider
      value={{
        isRealtimeEnabled,
        toggleRealtimeMode,
        enableRealtime,
        disableRealtime,
        activeSubscriptions,
        lastSyncTime,
        updateLastSyncTime,
      }}
    >
      {children}
    </RealtimeModeContext.Provider>
  );
}

/**
 * Hook to access real-time mode context
 */
export function useRealtimeMode(): RealtimeModeContextType {
  const context = useContext(RealtimeModeContext);
  if (context === undefined) {
    // Return default values if used outside provider
    return {
      isRealtimeEnabled: false,
      toggleRealtimeMode: () => {},
      enableRealtime: () => {},
      disableRealtime: () => {},
      activeSubscriptions: 0,
      lastSyncTime: null,
      updateLastSyncTime: () => {},
    };
  }
  return context;
}

export default RealtimeModeProvider;
