import { useState, useEffect } from "react";

/**
 * Fetches the backend seller ID (JWT sub) via /api/seller/me.
 * We cannot read the auth-token cookie directly because it is HTTP-only.
 * The API route reads it server-side and returns the sub claim.
 */
export function useSellerId(): string | undefined {
  const [sellerId, setSellerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/seller/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sellerId) {
          setSellerId(data.sellerId);
        }
      })
      .catch((err) => {
        console.error("[useSellerId] Failed to fetch seller ID:", err);
      });
  }, []);

  return sellerId;
}
