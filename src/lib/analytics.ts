/**
 * Analytics Utilities
 * Google Analytics 4 integration for tracking user behavior and e-commerce events
 */

import { logger } from "@/lib/logger";

// Check if GA is available and enabled
const isGAEnabled = () => {
  return (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.startsWith("G-")
  );
};

// Type definitions for GA events
interface GAEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
}

interface EcommerceEventParams {
  currency: string;
  value: number;
  items: EcommerceItem[];
  transaction_id?: string;
}

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export const initGA = () => {
  if (!isGAEnabled()) {
    logger.warn("GA not initialized: Missing or invalid measurement ID");
    return;
  }

  try {
    // Dynamic import to avoid SSR issues
    import("react-ga4").then((ReactGA) => {
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (measurementId) {
        ReactGA.default.initialize(measurementId);
      }
    });
  } catch (error) {
    console.error("Failed to initialize GA:", error);
  }
};

/**
 * Log a page view
 * Call this on route changes
 */
export const logPageView = (url: string) => {
  if (!isGAEnabled()) return;

  try {
    import("react-ga4").then((ReactGA) => {
      ReactGA.default.send({ hitType: "pageview", page: url });
    });
  } catch (error) {
    console.error("Failed to log page view:", error);
  }
};

/**
 * Log a generic event
 * Use for non-ecommerce tracking
 */
export const logEvent = (event: GAEvent) => {
  if (!isGAEnabled()) return;

  try {
    import("react-ga4").then((ReactGA) => {
      ReactGA.default.event({
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
      });
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
};

/**
 * Log an e-commerce event
 * Use for product views, add to cart, purchases, etc.
 */
export const logEcommerceEvent = (
  eventName: string,
  params: EcommerceEventParams
) => {
  if (!isGAEnabled()) return;

  try {
    import("react-ga4").then((ReactGA) => {
      ReactGA.default.event(eventName, params);
    });
  } catch (error) {
    console.error("Failed to log ecommerce event:", error);
  }
};

/**
 * Track product view
 * Call when user views a product detail page
 */
export const trackProductView = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  logEcommerceEvent("view_item", {
    currency: "PHP",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
        item_category: product.category,
      },
    ],
  });
};

/**
 * Track add to cart
 * Call when user adds a product to cart
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}) => {
  logEcommerceEvent("add_to_cart", {
    currency: "PHP",
    value: product.price * (product.quantity || 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        item_category: product.category,
      },
    ],
  });
};

/**
 * Track remove from cart
 * Call when user removes a product from cart
 */
export const trackRemoveFromCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}) => {
  logEcommerceEvent("remove_from_cart", {
    currency: "PHP",
    value: product.price * (product.quantity || 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
};

/**
 * Track purchase
 * Call when user completes an order
 */
export const trackPurchase = (order: {
  transactionId: string;
  value: number;
  items: EcommerceItem[];
}) => {
  logEcommerceEvent("purchase", {
    currency: "PHP",
    value: order.value,
    items: order.items,
    transaction_id: order.transactionId,
  });
};

/**
 * Track search
 * Call when user performs a search
 */
export const trackSearch = (searchTerm: string) => {
  logEvent({
    category: "Search",
    action: "search",
    label: searchTerm,
  });
};

/**
 * Track button click
 * Generic button tracking
 */
export const trackButtonClick = (buttonName: string, location: string) => {
  logEvent({
    category: "Button",
    action: "click",
    label: `${buttonName} - ${location}`,
  });
};
