"use client";

/**
 * Lalamove Quote Component
 *
 * Displays real-time delivery quote from Lalamove API.
 * Shows price, distance, and estimated delivery time.
 * Supports scheduled delivery with date/time picker.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Truck, Clock, MapPin, AlertCircle, RefreshCw, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LALAMOVE_VEHICLES, type VehicleType } from "@/lib/lalamove/vehicle-types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface LalamoveQuoteResult {
  quotationId: string;
  price: number;
  distance: string;
  estimatedTime: string;
  expiresAt?: string;
  scheduleAt?: string;
  vehicleType?: string;
}

interface LalamoveQuoteProps {
  pickupAddress: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryAddress: {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    phone?: string;
  };
  onQuoteReceived: (quote: LalamoveQuoteResult | null) => void;
  serviceType?: string;
  onServiceTypeChange?: (serviceType: string) => void;
  scheduleAt?: string;
  onScheduleChange?: (scheduleAt: string | undefined) => void;
  className?: string;
}

// MASH pickup location (Phone Craft Cellphone Repair - Caloocan City)
// CORRECTED COORDINATES - Metro Manila service area
export const MASH_PICKUP_LOCATION = {
  lat: 14.6549,
  lng: 121.0420,
  address: "Phone Craft Cellphone Repair, Caloocan City, Metro Manila",
  name: "MASH Mushroom Farm (Phone Craft)",
  phone: "+639497536575",
};

/**
 * Format currency to Philippine Peso
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a schedule date for display
 */
function formatScheduleDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get minimum schedule time (1 hour from now)
 */
function getMinScheduleTime(): Date {
  const min = new Date();
  min.setHours(min.getHours() + 1);
  min.setMinutes(0, 0, 0);
  return min;
}

/**
 * Get maximum schedule time (7 days from now)
 */
function getMaxScheduleTime(): Date {
  const max = new Date();
  max.setDate(max.getDate() + 7);
  max.setHours(20, 0, 0, 0);
  return max;
}

/**
 * Format Date to datetime-local input value
 */
function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${mi}`;
}

export function LalamoveQuote({
  pickupAddress,
  deliveryAddress,
  onQuoteReceived,
  serviceType = "MOTORCYCLE",
  onServiceTypeChange,
  scheduleAt,
  onScheduleChange,
  className,
}: LalamoveQuoteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<LalamoveQuoteResult | null>(null);
  
  // Prevent duplicate requests
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track the last fetched coordinates to avoid duplicate requests
  const lastFetchedRef = useRef<string>("");

  const fetchQuote = useCallback(async () => {
    // Prevent duplicate simultaneous requests
    if (isFetchingRef.current) {
      return;
    }

    // Validate delivery address coordinates
    if (!deliveryAddress.lat || !deliveryAddress.lng) {
      setError("Please select your delivery address on the map above by clicking on the map or searching for your location");
      onQuoteReceived(null);
      return;
    }

    // Validate pickup address coordinates
    if (!pickupAddress.lat || !pickupAddress.lng) {
      setError("Pickup location is not configured. Please contact support.");
      onQuoteReceived(null);
      return;
    }

    // Create a unique key for this combination of coordinates
    const coordsKey = `${pickupAddress.lat},${pickupAddress.lng}|${deliveryAddress.lat},${deliveryAddress.lng}|${serviceType}|${scheduleAt || ""}`;
    
    // Skip if we already fetched for these exact coordinates
    if (lastFetchedRef.current === coordsKey) {
      return;
    }

    // Validate coordinates are within valid ranges
    if (
      deliveryAddress.lat < -90 || deliveryAddress.lat > 90 ||
      deliveryAddress.lng < -180 || deliveryAddress.lng > 180
    ) {
      setError("Invalid delivery location coordinates. Please select a valid location on the map.");
      onQuoteReceived(null);
      return;
    }

    // Validate delivery address is not empty
    if (!deliveryAddress.address || deliveryAddress.address.trim() === "") {
      setError("Delivery address is incomplete. Please ensure you've selected a complete address.");
      onQuoteReceived(null);
      return;
    }

    // Mark as fetching and save coordinates
    isFetchingRef.current = true;
    lastFetchedRef.current = coordsKey;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lalamove/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat: pickupAddress.lat,
          pickupLng: pickupAddress.lng,
          pickupAddress: pickupAddress.address,
          dropoffLat: deliveryAddress.lat,
          dropoffLng: deliveryAddress.lng,
          dropoffAddress: deliveryAddress.address,
          serviceType: serviceType.toUpperCase(),
          ...(scheduleAt ? { scheduleAt } : {}),
        }),
      });

      // Handle network errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific HTTP error codes
        if (response.status === 422) {
          // Validation error from Lalamove
          const validationErrors = errorData.errors || [];
          const errorMessages = validationErrors.map((e: { message?: string }) => e.message).filter(Boolean);
          
          if (errorMessages.length > 0) {
            setError(`Invalid request: ${errorMessages.join(", ")}`);
          } else {
            setError("The delivery location or pickup point is invalid. Please select a different address within Metro Manila.");
          }
        } else if (response.status === 400) {
          setError("Invalid delivery request. Please check your delivery address and try again.");
        } else if (response.status === 401 || response.status === 403) {
          setError("Lalamove service authentication failed. Please contact support.");
        } else if (response.status === 404) {
          setError("Delivery service not available. Please try again later.");
        } else if (response.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
          // Reset the last fetched so user can retry
          lastFetchedRef.current = "";
        } else if (response.status >= 500) {
          setError("Lalamove service is temporarily unavailable. Please try again in a few minutes.");
        } else {
          setError(`Unable to get delivery quote (Error ${response.status}). Please try again.`);
        }
        onQuoteReceived(null);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Validate quote data
        if (!data.data.quotationId) {
          setError("Invalid quote received. Please try again.");
          onQuoteReceived(null);
          return;
        }

        const totalPrice = parseFloat(data.data.priceBreakdown?.total || "0");
        
        // Validate price is reasonable
        if (totalPrice <= 0) {
          setError("Unable to calculate delivery fee. Please try a different address.");
          onQuoteReceived(null);
          return;
        }

        if (totalPrice > 1000) {
          setError("Delivery fee seems unusually high. The delivery address may be too far. Please contact support for assistance.");
          onQuoteReceived(null);
          return;
        }

        const quoteData: LalamoveQuoteResult = {
          quotationId: data.data.quotationId,
          price: totalPrice,
          distance: `${data.data.distance?.value || "?"} ${data.data.distance?.unit || "km"}`,
          estimatedTime: scheduleAt ? formatScheduleDate(scheduleAt) : "30-45 mins",
          expiresAt: data.data.expiresAt,
          scheduleAt: scheduleAt || undefined,
          vehicleType: serviceType,
        };

        setQuote(quoteData);
        onQuoteReceived(quoteData);
      } else {
        // Handle API response errors
        const errorMessage = data.message || data.error || "Failed to get delivery quote";
        
        // Provide more specific error messages
        if (errorMessage.toLowerCase().includes("outside service area")) {
          setError("Sorry, we currently only deliver within Metro Manila. Please enter an address in Metro Manila.");
        } else if (errorMessage.toLowerCase().includes("invalid coordinates")) {
          setError("The selected location is invalid. Please choose a different address on the map.");
        } else if (errorMessage.toLowerCase().includes("distance")) {
          setError("The delivery distance is too far. Please select a location within Metro Manila.");
        } else {
          setError(errorMessage);
        }
        onQuoteReceived(null);
      }
    } catch (err) {
      console.error("Lalamove quote error:", err);
      
      // Handle different types of errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Network error. Please check your internet connection and try again.");
      } else if (err instanceof SyntaxError) {
        setError("Invalid response from delivery service. Please try again.");
      } else {
        setError("Unable to get delivery quote. Please try again or contact support if the problem persists.");
      }
      onQuoteReceived(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pickupAddress.lat, pickupAddress.lng, pickupAddress.address, deliveryAddress.lat, deliveryAddress.lng, deliveryAddress.address, serviceType, scheduleAt, onQuoteReceived]);

  // Fetch quote when addresses change with debouncing
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only fetch if we have valid coordinates
    if (deliveryAddress.lat && deliveryAddress.lng && pickupAddress.lat && pickupAddress.lng) {
      // Debounce the API call by 500ms to prevent rapid-fire requests
      debounceTimerRef.current = setTimeout(() => {
        fetchQuote();
      }, 500);
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [deliveryAddress.lat, deliveryAddress.lng, pickupAddress.lat, pickupAddress.lng, fetchQuote]);

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="font-medium">Getting delivery quote...</p>
            <p className="text-sm text-muted-foreground">
              Calculating distance and price
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-4 border-destructive/50 bg-destructive/5", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Delivery quote unavailable</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchQuote}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  // Find the selected vehicle for display
  const selectedVehicle = LALAMOVE_VEHICLES.find(
    (v) => v.id === serviceType.toLowerCase() || v.name.toUpperCase() === serviceType
  ) || LALAMOVE_VEHICLES[0];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Vehicle Type Selector */}
      {onServiceTypeChange && (
        <VehicleTypeSelector
          selectedType={serviceType}
          onSelect={onServiceTypeChange}
        />
      )}

      {/* Schedule Delivery Toggle */}
      {onScheduleChange && (
        <ScheduleDeliverySelector
          scheduleAt={scheduleAt}
          onScheduleChange={onScheduleChange}
        />
      )}

      <Card className="p-4 bg-green-50 border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900">
              {quote.scheduleAt ? "Lalamove Scheduled Delivery" : "Lalamove Same-Day Delivery"}
            </p>
            <div className="flex items-center gap-4 text-sm text-green-700 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {quote.distance}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quote.estimatedTime}
              </span>
            </div>
            {quote.scheduleAt && (
              <div className="flex items-center gap-1 text-sm text-green-700 mt-1">
                <CalendarClock className="h-3 w-3" />
                <span>Scheduled: {formatScheduleDate(quote.scheduleAt)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(quote.price)}
          </p>
          <p className="text-xs text-green-600">Delivery Fee</p>
        </div>
      </div>
      
      {/* Refresh button */}
      <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
        <p className="text-xs text-green-600">
          Quote valid for 5 minutes
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-green-700 hover:text-green-900 hover:bg-green-100"
          onClick={fetchQuote}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    </Card>
    </div>
  );
}

/**
 * Vehicle Type Selector Component
 */
function VehicleTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType: string;
  onSelect: (type: string) => void;
}) {
  // Show only the 3 most relevant vehicle types for mushroom deliveries
  const relevantVehicles = LALAMOVE_VEHICLES.slice(0, 3);

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">Vehicle Type</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {relevantVehicles.map((vehicle) => {
          const isSelected = selectedType.toLowerCase() === vehicle.id;
          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => onSelect(vehicle.id.toUpperCase())}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{vehicle.image}</span>
                <span className="text-sm font-medium text-foreground">{vehicle.name.split(' ').slice(0, 2).join(' ')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Up to {vehicle.weightLimit}kg
              </p>
              <p className="text-xs text-muted-foreground">
                Base fare: ₱{vehicle.baseFare}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Default: Motorcycle (best for orders under 20kg)
      </p>
    </div>
  );
}

/**
 * Schedule Delivery Selector Component
 */
function ScheduleDeliverySelector({
  scheduleAt,
  onScheduleChange,
}: {
  scheduleAt?: string;
  onScheduleChange: (scheduleAt: string | undefined) => void;
}) {
  const isScheduled = !!scheduleAt;
  const [validationError, setValidationError] = useState<string | null>(null);

  const minTime = useMemo(() => getMinScheduleTime(), []);
  const maxTime = useMemo(() => getMaxScheduleTime(), []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Default to minimum schedule time (1 hour from now)
      const defaultTime = getMinScheduleTime();
      onScheduleChange(defaultTime.toISOString());
      setValidationError(null);
    } else {
      onScheduleChange(undefined);
      setValidationError(null);
    }
  };

  const handleDateTimeChange = (value: string) => {
    const selected = new Date(value);
    const now = new Date();
    const minAllowed = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    if (selected < minAllowed) {
      setValidationError("Schedule must be at least 1 hour from now");
      return;
    }

    const maxAllowed = getMaxScheduleTime();
    if (selected > maxAllowed) {
      setValidationError("Schedule cannot be more than 7 days from now");
      return;
    }

    setValidationError(null);
    onScheduleChange(selected.toISOString());
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <Label htmlFor="schedule-toggle" className="text-sm font-medium cursor-pointer">
            Schedule Delivery
          </Label>
        </div>
        <Switch
          id="schedule-toggle"
          checked={isScheduled}
          onCheckedChange={handleToggle}
        />
      </div>

      {isScheduled && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Pick a date and time for your delivery (1 hour to 7 days from now)
          </p>
          <input
            type="datetime-local"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={scheduleAt ? toDatetimeLocalValue(new Date(scheduleAt)) : ""}
            min={toDatetimeLocalValue(minTime)}
            max={toDatetimeLocalValue(maxTime)}
            onChange={(e) => handleDateTimeChange(e.target.value)}
          />
          {validationError && (
            <p className="text-xs text-destructive">{validationError}</p>
          )}
          {scheduleAt && !validationError && (
            <p className="text-xs text-muted-foreground">
              Delivery scheduled for: {formatScheduleDate(scheduleAt)}
            </p>
          )}
        </div>
      )}

      {!isScheduled && (
        <p className="text-xs text-muted-foreground">
          Default: Immediate delivery (driver assigned right away)
        </p>
      )}
    </div>
  );
}

/**
 * Delivery Method Selector Component
 */
export interface DeliveryMethod {
  type: "pickup" | "lalamove";
  pickupLocation?: {
    id: string;
    name: string;
    address: string;
  };
  deliveryAddress?: {
    address: string;
    lat: number;
    lng: number;
    name: string;
    phone: string;
  };
  lalamoveQuote?: LalamoveQuoteResult | null;
  fee: number;
}

// Pickup locations
export const PICKUP_LOCATIONS = [
  {
    id: "main",
    name: "MASH Main Hub - Phone Craft, Caloocan",
    address: "Phone Craft Cellphone Repair, Caloocan City, Metro Manila",
  },
];
