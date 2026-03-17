"use client";

/**
 * Lalamove Quote Component
 *
 * Displays real-time delivery quote from Lalamove API.
 * Shows price, distance, and estimated delivery time.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Truck, Clock, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LalamoveQuoteResult {
  quotationId: string;
  price: number;
  distance: string;
  estimatedTime: string;
  expiresAt?: string;
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

export function LalamoveQuote({
  pickupAddress,
  deliveryAddress,
  onQuoteReceived,
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
      console.log("[LalamoveQuote] Already fetching, skipping...");
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
    const coordsKey = `${pickupAddress.lat},${pickupAddress.lng}|${deliveryAddress.lat},${deliveryAddress.lng}`;
    
    // Skip if we already fetched for these exact coordinates
    if (lastFetchedRef.current === coordsKey) {
      console.log("[LalamoveQuote] Already have quote for these coordinates, skipping...");
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

    console.log("[LalamoveQuote] Fetching quote for:", {
      pickup: `${pickupAddress.lat}, ${pickupAddress.lng}`,
      delivery: `${deliveryAddress.lat}, ${deliveryAddress.lng}`
    });

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
          serviceType: "MOTORCYCLE", // Best for small mushroom deliveries
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
          estimatedTime: "30-45 mins", // Lalamove doesn't provide ETA in quote
          expiresAt: data.data.expiresAt,
        };

        console.log("[LalamoveQuote] Quote received:", quoteData);
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
  }, [pickupAddress.lat, pickupAddress.lng, pickupAddress.address, deliveryAddress.lat, deliveryAddress.lng, deliveryAddress.address, onQuoteReceived]);

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

  return (
    <Card className={cn("p-4 bg-green-50 border-green-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900">
              Lalamove Same-Day Delivery
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
