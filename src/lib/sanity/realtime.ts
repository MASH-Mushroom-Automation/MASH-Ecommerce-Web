/**
 * Sanity Real-Time Client Configuration
 * 
 * This file provides real-time subscriptions for Sanity CMS content.
 * Optimized to prevent excessive API calls while maintaining real-time updates.
 * 
 * ⚠️ IMPORTANT: Real-time subscriptions bypass CDN and count against API quota.
 * Use sparingly and only for demo/admin purposes.
 * 
 * @see https://www.sanity.io/docs/listening
 */

import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./client";

// Create a separate client for real-time subscriptions
// This client does NOT use CDN to get real-time updates
export const realtimeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // MUST be false for real-time updates
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});

/**
 * Real-time subscription configuration
 */
export interface SubscriptionConfig {
  /** GROQ query to subscribe to */
  query: string;
  /** Query parameters */
  params?: Record<string, unknown>;
  /** Callback when data changes */
  onUpdate: (data: unknown) => void;
  /** Debounce delay in ms (default: 1000ms) */
  debounceMs?: number;
  /** Include result in initial callback */
  includeResult?: boolean;
}

/**
 * Subscription manager to handle multiple subscriptions
 * Prevents duplicate subscriptions and handles cleanup
 */
class SubscriptionManager {
  private subscriptions = new Map<string, { unsubscribe: () => void; refCount: number }>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Subscribe to real-time updates for a GROQ query
   * 
   * @param key - Unique key for this subscription
   * @param config - Subscription configuration
   * @returns Unsubscribe function
   */
  subscribe(key: string, config: SubscriptionConfig): () => void {
    const { query, params = {}, onUpdate, debounceMs = 1000, includeResult = true } = config;

    // If subscription already exists, increment ref count
    const existing = this.subscriptions.get(key);
    if (existing) {
      existing.refCount++;
      console.log(`📡 Reusing subscription: ${key} (refs: ${existing.refCount})`);
      return () => this.unsubscribe(key);
    }

    console.log(`📡 Creating real-time subscription: ${key}`);

    // Create the subscription
    const subscription = realtimeClient.listen(query, params, {
      includeResult,
      includePreviousRevision: false,
      visibility: "query",
    }).subscribe({
      next: (update) => {
        console.log(`📨 Real-time update received for: ${key}`, update.transition);
        
        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Debounce the update callback
        const timer = setTimeout(() => {
          console.log(`🔄 Applying debounced update for: ${key}`);
          if (update.result) {
            onUpdate(update.result);
          }
          this.debounceTimers.delete(key);
        }, debounceMs);

        this.debounceTimers.set(key, timer);
      },
      error: (err) => {
        console.error(`❌ Subscription error for ${key}:`, err);
      },
    });

    // Store the subscription
    this.subscriptions.set(key, {
      unsubscribe: () => subscription.unsubscribe(),
      refCount: 1,
    });

    return () => this.unsubscribe(key);
  }

  /**
   * Unsubscribe from a real-time subscription
   */
  private unsubscribe(key: string): void {
    const sub = this.subscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    console.log(`📡 Unsubscribe request: ${key} (refs: ${sub.refCount})`);

    if (sub.refCount <= 0) {
      // Clear debounce timer
      const timer = this.debounceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(key);
      }

      // Unsubscribe
      sub.unsubscribe();
      this.subscriptions.delete(key);
      console.log(`📡 Subscription closed: ${key}`);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    console.log(`📡 Closing all subscriptions (${this.subscriptions.size})`);
    
    // Clear all debounce timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Unsubscribe from all
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
  }

  /**
   * Get active subscription count
   */
  getActiveCount(): number {
    return this.subscriptions.size;
  }
}

// Singleton instance
export const subscriptionManager = new SubscriptionManager();

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    subscriptionManager.unsubscribeAll();
  });
}
