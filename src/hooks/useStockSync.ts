import { useEffect, useState } from "react";
import { stockSync } from "@/lib/product/stock-sync";

export function useStockSync(productId: string, initial?: number) {
  const [stock, setStock] = useState<number>(() => {
    const cached = stockSync.getLocalStock(productId);
    return cached ?? initial ?? 0;
  });

  useEffect(() => {
    const unsub = stockSync.subscribe((id, s) => {
      if (id === productId) setStock(s);
    });

    // Initialize local cache if not set, or update if we have a fresher initial value
    // (Only if cache is empty, to respect optimistic updates)
    if (initial !== undefined) {
      const cached = stockSync.getLocalStock(productId);
      if (cached === undefined) {
        stockSync.setLocalStock(productId, initial);
      } else if (cached !== initial && initial > 0 && cached === 0) {
        // Hydration fix: if cache is 0 (default) but initial is positive, update it
        // This handles the case where product loads after initial render
        stockSync.setLocalStock(productId, initial);
      }
    }

    return () => unsub();
  }, [productId, initial]);

  return stock;
}

export default useStockSync;