/**
 * Payment System Configuration
 *
 * Centralized configuration for the MASH payment system.
 * Validates environment variables on first access and provides
 * feature flags for conditional payment method availability.
 *
 * When PayMongo keys are missing, the system falls back to COD-only mode.
 */

import { type PaymentMethod, PAYMENT_METHODS } from "@/types/payment";

// ---------------------------------------------------------------------------
// Environment Variables
//
// IMPORTANT: NEXT_PUBLIC_* vars MUST be accessed as static string literals
// (e.g. process.env.NEXT_PUBLIC_FOO) so that Next.js / Turbopack can inline
// them at build time for client-side bundles.  A dynamic helper like
// process.env[key] will NOT be replaced and will return undefined in the
// browser, causing PayMongo to appear disabled.
// ---------------------------------------------------------------------------

/** PayMongo secret key (server-only, never expose to client) */
export const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY ?? "";

/**
 * PayMongo public key (safe for client-side usage).
 * Accessed as a static literal so Next.js inlines the value into the
 * client bundle at build / dev-server compile time.
 */
export const PAYMONGO_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY ?? "";

/** PayMongo API base URL */
export const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

/** Application base URL for redirect callbacks */
export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.mashmarket.app";

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

/**
 * Whether PayMongo is fully configured on the server (both keys present).
 * Used by API routes that need the secret key to call PayMongo.
 */
export const PAYMONGO_SERVER_ENABLED: boolean =
  PAYMONGO_SECRET_KEY.length > 0 && PAYMONGO_PUBLIC_KEY.length > 0;

/**
 * Whether PayMongo online payments should be available in the UI.
 *
 * On the client, only NEXT_PUBLIC_* env vars are visible. The secret key
 * (PAYMONGO_SECRET_KEY) is server-only and not bundled into the browser.
 * Therefore this flag checks only the public key so that `"use client"`
 * components like PaymentMethodSelector can correctly show all methods.
 *
 * The server-side API routes that actually call PayMongo still verify the
 * secret key before proceeding (see paymongo.ts `isPayMongoConfigured()`).
 */
export const PAYMONGO_ENABLED: boolean = PAYMONGO_PUBLIC_KEY.length > 0;

/**
 * Returns the list of payment methods available for the current environment.
 *
 * - If PayMongo is enabled: all methods (cod, gcash, grab_pay, card, paymaya)
 * - If PayMongo is NOT enabled: COD only
 */
export function getAvailablePaymentMethods(): PaymentMethod[] {
  if (PAYMONGO_ENABLED) {
    return [...PAYMENT_METHODS];
  }
  return ["cod"];
}

/**
 * Checks whether a specific payment method is available.
 */
export function isPaymentMethodAvailable(method: PaymentMethod): boolean {
  return getAvailablePaymentMethods().includes(method);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface PaymentConfigValidation {
  isValid: boolean;
  paymongoEnabled: boolean;
  warnings: string[];
  availableMethods: PaymentMethod[];
}

/**
 * Validates the payment configuration and returns a diagnostic report.
 * Call this during app startup or in a health-check endpoint.
 *
 * Never throws -- returns structured validation result.
 */
export function validatePaymentConfig(): PaymentConfigValidation {
  const warnings: string[] = [];

  if (!PAYMONGO_SECRET_KEY) {
    warnings.push(
      "PAYMONGO_SECRET_KEY is not set. Online payment methods are disabled."
    );
  }

  if (!PAYMONGO_PUBLIC_KEY) {
    warnings.push(
      "NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is not set. Online payment methods are disabled."
    );
  }

  if (PAYMONGO_SECRET_KEY && !PAYMONGO_PUBLIC_KEY) {
    warnings.push(
      "PAYMONGO_SECRET_KEY is set but NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is missing. Both keys are required for online payments."
    );
  }

  if (!PAYMONGO_SECRET_KEY && PAYMONGO_PUBLIC_KEY) {
    warnings.push(
      "NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is set but PAYMONGO_SECRET_KEY is missing. Both keys are required for online payments."
    );
  }

  const availableMethods = getAvailablePaymentMethods();

  return {
    isValid: true, // Config is always valid (COD fallback guarantees it)
    paymongoEnabled: PAYMONGO_SERVER_ENABLED,
    warnings,
    availableMethods,
  };
}

/**
 * Logs payment configuration warnings to the console.
 * Intended to be called once during application initialization.
 */
export function logPaymentConfigWarnings(): void {
  const config = validatePaymentConfig();

  if (config.warnings.length > 0) {
    console.warn("[Payment Config] Configuration warnings:");
    config.warnings.forEach((w) => console.warn(`  - ${w}`));
    if (config.paymongoEnabled) {
      console.warn(
        `[Payment Config] PayMongo partially configured. Available methods: ${config.availableMethods.join(", ")}`
      );
    } else {
      console.warn(
        `[Payment Config] Falling back to COD-only mode. Available methods: ${config.availableMethods.join(", ")}`
      );
    }
  } else {
    console.log(
      `[Payment Config] PayMongo enabled. Available methods: ${config.availableMethods.join(", ")}`
    );
  }
}

// ---------------------------------------------------------------------------
// Full Config Object
// ---------------------------------------------------------------------------

export interface PaymentConfig {
  paymongo: {
    enabled: boolean;
    apiUrl: string;
    publicKey: string;
    /** Server-only: never include in client bundles */
    secretKey: string;
  };
  app: {
    baseUrl: string;
    successRedirect: (orderId: string) => string;
    failedRedirect: (orderId: string) => string;
  };
  availableMethods: PaymentMethod[];
  currency: string;
  /** Minimum order amount in PHP for online payment */
  minimumAmount: number;
}

/**
 * Returns the full payment configuration object.
 * Use this for centralized access to all payment settings.
 */
export function getPaymentConfig(): PaymentConfig {
  return {
    paymongo: {
      enabled: PAYMONGO_SERVER_ENABLED,
      apiUrl: PAYMONGO_API_URL,
      publicKey: PAYMONGO_PUBLIC_KEY,
      secretKey: PAYMONGO_SECRET_KEY,
    },
    app: {
      baseUrl: APP_BASE_URL,
      successRedirect: (orderId: string) =>
        `${APP_BASE_URL}/checkout/payment-success?orderId=${orderId}`,
      failedRedirect: (orderId: string) =>
        `${APP_BASE_URL}/checkout/payment-failed?orderId=${orderId}`,
    },
    availableMethods: getAvailablePaymentMethods(),
    currency: "PHP",
    minimumAmount: 1, // PayMongo minimum is 100 centavos = 1 PHP
  };
}
