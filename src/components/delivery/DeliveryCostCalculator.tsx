"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Loader2, MapPin, Truck, RefreshCw } from "lucide-react";
import { LALAMOVE_VEHICLES } from "@/lib/lalamove/vehicle-types";

interface QuoteResult {
  quotationId: string;
  total: string;
  currency: string;
  base: string;
  totalExcludePriorityFee: string;
  distance: { value: string; unit: string };
}

interface DeliveryCostCalculatorProps {
  onQuoteReceived?: (quote: QuoteResult) => void;
  defaultPickup?: { lat: string; lng: string; address: string };
  defaultDropoff?: { lat: string; lng: string; address: string };
}

export default function DeliveryCostCalculator({
  onQuoteReceived,
  defaultPickup,
  defaultDropoff,
}: DeliveryCostCalculatorProps) {
  const [pickupAddress, setPickupAddress] = useState(
    defaultPickup?.address || ""
  );
  const [pickupLat, setPickupLat] = useState(defaultPickup?.lat || "14.5547");
  const [pickupLng, setPickupLng] = useState(defaultPickup?.lng || "121.0244");

  const [dropoffAddress, setDropoffAddress] = useState(
    defaultDropoff?.address || ""
  );
  const [dropoffLat, setDropoffLat] = useState(
    defaultDropoff?.lat || "14.5995"
  );
  const [dropoffLng, setDropoffLng] = useState(
    defaultDropoff?.lng || "120.9842"
  );

  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const handleGetQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const serviceType =
        vehicleType === "motorcycle"
          ? "MOTORCYCLE"
          : vehicleType === "sedan"
            ? "CAR"
            : "VAN";

      const response = await fetch("/api/lalamove/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          stops: [
            {
              coordinates: { lat: pickupLat, lng: pickupLng },
              address: pickupAddress || "Pickup Location",
            },
            {
              coordinates: { lat: dropoffLat, lng: dropoffLng },
              address: dropoffAddress || "Delivery Location",
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get delivery quote");
      }

      const result: QuoteResult = {
        quotationId: data.quotationId || data.data?.quotationId || "",
        total: data.priceBreakdown?.total || data.data?.priceBreakdown?.total || "0",
        currency: data.priceBreakdown?.currency || data.data?.priceBreakdown?.currency || "PHP",
        base: data.priceBreakdown?.base || data.data?.priceBreakdown?.base || "0",
        totalExcludePriorityFee:
          data.priceBreakdown?.totalExcludePriorityFee ||
          data.data?.priceBreakdown?.totalExcludePriorityFee ||
          "0",
        distance: data.distance || data.data?.distance || { value: "0", unit: "km" },
      };

      setQuote(result);
      onQuoteReceived?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get quote";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    pickupLat,
    pickupLng,
    pickupAddress,
    dropoffLat,
    dropoffLng,
    dropoffAddress,
    vehicleType,
    onQuoteReceived,
  ]);

  const selectedVehicle = LALAMOVE_VEHICLES.find((v) => v.id === vehicleType);

  return (
    <Card className="border-emerald-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-emerald-600" />
          Delivery Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pickup */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            Pickup Location
          </Label>
          <Input
            placeholder="Pickup address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              value={pickupLat}
              onChange={(e) => setPickupLat(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Longitude"
              value={pickupLng}
              onChange={(e) => setPickupLng(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Dropoff */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="h-3.5 w-3.5 text-red-500" />
            Delivery Location
          </Label>
          <Input
            placeholder="Delivery address"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              value={dropoffLat}
              onChange={(e) => setDropoffLat(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Longitude"
              value={dropoffLng}
              onChange={(e) => setDropoffLng(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
            Vehicle Type
          </Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {LALAMOVE_VEHICLES.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <span className="flex items-center gap-2">
                    <span>{v.image}</span>
                    <span>{v.name}</span>
                    <span className="text-muted-foreground text-xs">
                      (from ₱{v.baseFare})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVehicle && (
            <p className="text-xs text-muted-foreground">
              Up to {selectedVehicle.weightLimit}kg &middot;{" "}
              {selectedVehicle.sizeLimit}
            </p>
          )}
        </div>

        {/* Get Quote Button */}
        <Button
          onClick={handleGetQuote}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Quote...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Get Delivery Quote
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-red-600 hover:text-red-700"
              onClick={handleGetQuote}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Quote Result */}
        {quote && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800">
                Total Delivery Cost
              </span>
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-100 text-emerald-800 text-lg font-bold px-3"
              >
                ₱{parseFloat(quote.total).toFixed(2)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
              <div>
                <span className="text-muted-foreground">Base fare:</span>{" "}
                ₱{parseFloat(quote.base).toFixed(2)}
              </div>
              <div>
                <span className="text-muted-foreground">Distance:</span>{" "}
                {quote.distance.value} {quote.distance.unit}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Quote ID: {quote.quotationId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
