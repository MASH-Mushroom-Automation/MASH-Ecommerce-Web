"use client";

/**
 * Lalamove Quote Component
 *
 * Displays real-time delivery quote from Lalamove API.
 * Shows price, distance, and estimated delivery time.
 */

import { useState, useEffect, useCallback } from "react";
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

// MASH pickup location (Caloocan City)
export const MASH_PICKUP_LOCATION = {
  lat: 14.7566,
  lng: 121.0447,
  address: "266 Quirino Highway, Brgy 176-D, Bagong Silang, Caloocan City",
  name: "MASH Mushroom Farm",
  phone: "+639171234567", // Update with actual phone
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

  const fetchQuote = useCallback(async () => {
    // Validate coordinates
    if (
      !deliveryAddress.lat ||
      !deliveryAddress.lng ||
      !pickupAddress.lat ||
      !pickupAddress.lng
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lalamove/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "MOTORCYCLE", // Best for small mushroom deliveries
          language: "en_PH",
          stops: [
            {
              coordinates: {
                lat: pickupAddress.lat.toString(),
                lng: pickupAddress.lng.toString(),
              },
              address: pickupAddress.address,
            },
            {
              coordinates: {
                lat: deliveryAddress.lat.toString(),
                lng: deliveryAddress.lng.toString(),
              },
              address: deliveryAddress.address,
            },
          ],
          item: {
            weight: "LESS_THAN_3_KG",
            categories: ["FOOD_DELIVERY"],
            handlingInstructions: ["KEEP_UPRIGHT"],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const quoteData: LalamoveQuoteResult = {
          quotationId: data.data.quotationId,
          price: parseFloat(data.data.priceBreakdown?.total || "0"),
          distance: `${data.data.distance?.value || "?"} ${data.data.distance?.unit || "km"}`,
          estimatedTime: "30-45 mins", // Lalamove doesn't provide ETA in quote
          expiresAt: data.data.expiresAt,
        };

        setQuote(quoteData);
        onQuoteReceived(quoteData);
      } else {
        const errorMessage = data.message || data.error || "Failed to get delivery quote";
        setError(errorMessage);
        onQuoteReceived(null);
      }
    } catch (err) {
      console.error("Lalamove quote error:", err);
      setError("Unable to get delivery quote. Please try again.");
      onQuoteReceived(null);
    } finally {
      setLoading(false);
    }
  }, [pickupAddress, deliveryAddress, onQuoteReceived]);

  // Fetch quote when addresses change
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

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
    name: "MASH Main Hub - Caloocan City",
    address: "266 Quirino Highway, Brgy 176-D, Bagong Silang, Caloocan City",
  },
  {
    id: "bgc",
    name: "MASH BGC Pickup Point",
    address: "5th Avenue, Bonifacio Global City, Taguig City",
  },
];
