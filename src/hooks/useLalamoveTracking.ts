"use client";

import { useState, useEffect } from "react";
import {
  FirestoreOrder,
  FirebaseOrdersService,
} from "@/lib/firebase/orders";

/**
 * Lalamove tracking data extracted from FirestoreOrder
 */
export type LalamoveTrackingData = NonNullable<FirestoreOrder["lalamoveTracking"]>;

export interface UseLalamoveTrackingReturn {
  tracking: LalamoveTrackingData | null;
  order: FirestoreOrder | null;
  loading: boolean;
  error: string | null;
}

/**
 * Real-time Firestore subscription hook for Lalamove delivery tracking.
 * Uses onSnapshot via FirebaseOrdersService.subscribeToOrder() —
 * updates arrive within ~1s of a Firestore write (no polling).
 *
 * @param orderId - The Firebase order document ID to subscribe to
 * @returns Live tracking state, full order, loading, and error
 */
export function useLalamoveTracking(
  orderId: string | undefined | null
): UseLalamoveTrackingReturn {
  const [tracking, setTracking] = useState<LalamoveTrackingData | null>(null);
  const [order, setOrder] = useState<FirestoreOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(!!orderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setTracking(null);
      setOrder(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseOrdersService.subscribeToOrder(
      orderId,
      (orderData: FirestoreOrder | null) => {
        setOrder(orderData);
        setTracking(orderData?.lalamoveTracking ?? null);
        setLoading(false);
      },
      (err: Error) => {
        console.error("[useLalamoveTracking] Firestore error:", err);
        setError(err.message || "Failed to subscribe to order tracking");
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  return { tracking, order, loading, error };
}
