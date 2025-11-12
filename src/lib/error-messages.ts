/**
 * Human-friendly error messages for common errors
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  "Failed to fetch": "Unable to connect. Please check your internet connection.",
  "Network request failed":
    "Connection lost. Please try again in a moment.",
  ERR_NETWORK: "No internet connection. Please check your network.",
  "Network error": "Connection problem. Please check your internet.",
  "Connection timeout": "The request took too long. Please try again.",

  // Authentication errors
  "Invalid credentials":
    "Email or password is incorrect. Please double-check and try again.",
  Unauthorized: "Please sign in to continue.",
  "Token expired": "Your session has expired. Please sign in again.",
  "Authentication failed": "Sign in failed. Please try again.",
  "Access denied": "You don't have permission to do this.",
  "Session expired": "Your session has expired. Please sign in again.",

  // Product errors
  "Product not found": "This product is no longer available.",
  "Out of stock": "Sorry, this item is currently out of stock.",
  "Invalid product": "This product doesn't exist or has been removed.",
  "Stock unavailable": "The requested quantity is not available.",

  // Order errors
  "Order not found": "We couldn't find that order.",
  "Order already cancelled": "This order has already been cancelled.",
  "Cannot cancel order": "This order cannot be cancelled at this stage.",
  "Payment failed": "Payment could not be processed. Please try again.",

  // Form validation errors
  "Validation failed": "Please check the form and fix any errors highlighted.",
  "Required field": "This field is required.",
  "Invalid email": "Please enter a valid email address.",
  "Invalid phone": "Please enter a valid Philippine phone number.",
  "Password too short": "Password must be at least 8 characters.",
  "Passwords do not match": "The passwords you entered don't match.",
  "Invalid format": "Please check the format and try again.",

  // Seller errors
  "Seller not found": "This seller is no longer active.",
  "Not a seller": "You need to be a seller to access this.",
  "Application pending":
    "Your seller application is under review. We'll notify you soon!",
  "Application rejected": "Your seller application was not approved.",

  // Cart & Checkout errors
  "Cart is empty": "Your cart is empty. Add some products first!",
  "Invalid quantity": "Please enter a valid quantity.",
  "Minimum order not met": "You haven't met the minimum order amount.",
  "Invalid address": "Please provide a valid delivery address.",

  // Server errors (HTTP status codes)
  "400": "The request couldn't be processed. Please check your input.",
  "401": "Please sign in to continue.",
  "403": "You don't have permission to do this.",
  "404": "We couldn't find what you're looking for.",
  "409": "This action conflicts with existing data. Please refresh and try again.",
  "422": "The data provided couldn't be processed. Please check and try again.",
  "429": "Too many requests. Please slow down and try again in a moment.",
  "500": "Something went wrong on our end. We're working on it!",
  "502": "Server is temporarily unavailable. Please try again shortly.",
  "503": "Service temporarily unavailable. Please try again in a few minutes.",
  "504": "Request timed out. Please try again.",

  // File upload errors
  "File too large": "This file is too large. Maximum size is 5MB.",
  "Invalid file type": "This file type is not supported.",
  "Upload failed": "File upload failed. Please try again.",

  // Generic fallback
  "Unknown error": "Something unexpected happened. Please try again.",
};

/**
 * Converts technical error messages to human-friendly ones
 */
export function humanizeError(error: string | Error | unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    return humanizeError(error.message);
  }

  // Handle string errors
  if (typeof error === "string") {
    // Check for exact match
    if (ERROR_MESSAGES[error]) {
      return ERROR_MESSAGES[error];
    }

    // Check for partial matches (case-insensitive)
    const lowerError = error.toLowerCase();
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (lowerError.includes(key.toLowerCase())) {
        return message;
      }
    }

    // Check for HTTP status codes in message
    const statusMatch = error.match(/\b(4\d{2}|5\d{2})\b/);
    if (statusMatch && ERROR_MESSAGES[statusMatch[0]]) {
      return ERROR_MESSAGES[statusMatch[0]];
    }

    // If it's a user-friendly message already (no technical jargon), return it
    if (!lowerError.includes("error") && !lowerError.includes("exception")) {
      return error;
    }
  }

  // Fallback for unknown errors
  return "Something unexpected happened. Please try again or contact support if the problem persists.";
}

/**
 * Shows a user-friendly error toast
 */
export function showError(error: unknown, customMessage?: string) {
  const message = customMessage || humanizeError(error);
  return message;
}

/**
 * Helper to get specific error messages for forms
 */
export function getFormError(field: string, type: string): string {
  const errorKey = `${type}`;
  return ERROR_MESSAGES[errorKey] || `Invalid ${field}`;
}
