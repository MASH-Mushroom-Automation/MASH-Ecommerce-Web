"use client";

/**
 * SecurityEventsList Component
 *
 * Displays a user's recent security events (last 10) in their profile.
 * Fetches events from the Firestore security_events collection.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSecurityEvents } from "@/lib/firebase/security-events";
import type { SecurityEvent } from "@/lib/firebase/security-events";
import { Shield, ShieldAlert, ShieldCheck, Phone, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Event display config
// ============================================================================

const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PHONE_VERIFIED: { label: "Phone Verified", icon: Phone, color: "text-green-600" },
  PHONE_CHANGED: { label: "Phone Changed", icon: Phone, color: "text-blue-600" },
  "2FA_ENABLED": { label: "2FA Enabled", icon: ShieldCheck, color: "text-green-600" },
  "2FA_DISABLED": { label: "2FA Disabled", icon: ShieldAlert, color: "text-amber-600" },
  "2FA_LOGIN_SUCCESS": { label: "2FA Login", icon: ShieldCheck, color: "text-green-600" },
  "2FA_LOGIN_FAILED": { label: "2FA Login Failed", icon: ShieldAlert, color: "text-red-600" },
  ACCOUNT_RECOVERY_INITIATED: { label: "Recovery Started", icon: Key, color: "text-amber-600" },
  ACCOUNT_RECOVERY_COMPLETED: { label: "Recovery Complete", icon: Key, color: "text-green-600" },
  BACKUP_CODES_GENERATED: { label: "Backup Codes Generated", icon: Key, color: "text-blue-600" },
  OTP_SENT: { label: "OTP Sent", icon: Shield, color: "text-blue-600" },
  OTP_VERIFIED: { label: "OTP Verified", icon: ShieldCheck, color: "text-green-600" },
  OTP_FAILED: { label: "OTP Failed", icon: ShieldAlert, color: "text-red-600" },
  SUSPICIOUS_ACTIVITY: { label: "Suspicious Activity", icon: ShieldAlert, color: "text-red-600" },
};

const DEFAULT_CONFIG = { label: "Security Event", icon: Shield, color: "text-muted-foreground" };

// ============================================================================
// Component
// ============================================================================

interface SecurityEventsListProps {
  maxEvents?: number;
  className?: string;
}

export default function SecurityEventsList({
  maxEvents = 10,
  className,
}: SecurityEventsListProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getSecurityEvents(user.id, maxEvents);
      setEvents(data);
    } catch (err) {
      console.error("[SecurityEventsList] Failed to fetch events:", err);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [user?.id, maxEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const formatDate = (date: Date | { toDate?: () => Date }) => {
    const d = typeof (date as { toDate?: () => Date }).toDate === "function"
      ? (date as { toDate: () => Date }).toDate()
      : date as Date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  if (!user?.id) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Recent Security Activity
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchEvents}
          disabled={isLoading}
          className="text-xs"
        >
          <RefreshCw className={cn("w-3 h-3 mr-1", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {isLoading && !hasLoaded && (
        <div className="text-sm text-muted-foreground text-center py-4">
          Loading security events...
        </div>
      )}

      {hasLoaded && events.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
          No security events recorded yet.
        </div>
      )}

      {events.length > 0 && (
        <div className="divide-y divide-border rounded-lg border">
          {events.map((event) => {
            const config = EVENT_CONFIG[event.eventType] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 text-sm"
              >
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {config.label}
                    </span>
                    {!event.success && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        Failed
                      </span>
                    )}
                  </div>
                  {event.phoneNumber && (
                    <p className="text-xs text-muted-foreground truncate">
                      {event.phoneNumber}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(event.createdAt)}
                </time>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
