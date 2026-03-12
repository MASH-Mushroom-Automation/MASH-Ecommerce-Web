"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface DeliveryEstimate {
  quotationId: string;
  price: string;
  currency: string;
  distance?: { value: string; unit: string };
  expiresAt?: string;
}

interface UseDeliveryEstimateParams {
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  vehicleType?: string;
}

interface UseDeliveryEstimateReturn {
  estimate: DeliveryEstimate | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeliveryEstimate({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  vehicleType = "MOTORCYCLE",
}: UseDeliveryEstimateParams): UseDeliveryEstimateReturn {
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEstimate = useCallback(async () => {
    if (
      pickupLat == null ||
      pickupLng == null ||
      dropoffLat == null ||
      dropoffLng == null
    ) {
      setEstimate(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lalamove/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          serviceType: vehicleType,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || `Quotation failed (${response.status})`
        );
      }

      const result = await response.json();

      if (!controller.signal.aborted) {
        setEstimate({
          quotationId: result.data.quotationId,
          price: result.data.price,
          currency: result.data.currency,
          distance: result.data.distance,
          expiresAt: result.data.expiresAt,
        });
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to get estimate");
        setEstimate(null);
        setLoading(false);
      }
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchEstimate();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchEstimate]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  return { estimate, loading, error, refetch };
}
