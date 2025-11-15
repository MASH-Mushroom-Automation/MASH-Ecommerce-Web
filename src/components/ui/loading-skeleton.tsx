/**
 * Loading Skeleton Components
 * Provides professional loading states for better UX
 * 
 * Usage:
 * - ProfileSkeleton: User profile card loading state
 * - AccountInfoSkeleton: Account information grid loading state
 * - FormSkeleton: Form fields loading state
 * - CardSkeleton: Generic card loading state
 */

import React from "react";

/**
 * Profile Skeleton - User profile card with avatar and details
 * Used in: Account page, Settings page, Dashboard
 */
export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="h-20 w-20 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          {/* Name skeleton */}
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          {/* Email skeleton */}
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          {/* Badges skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Account Info Skeleton - Grid of account information fields
 * Used in: Account page, Settings page
 */
export function AccountInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          {/* Label skeleton */}
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          {/* Value skeleton */}
          <div className="h-5 w-full bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton - Form fields loading state
 * Used in: Profile edit page, Settings forms
 */
export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          {/* Label skeleton */}
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          {/* Input skeleton */}
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
      ))}
      {/* Button skeleton */}
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

/**
 * Card Skeleton - Generic card loading state
 * Used in: Any page with card-based layouts
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-6 shadow">
      <div className="space-y-4">
        {/* Title skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        {/* Content skeletons */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table Skeleton - Table loading state
 * Used in: Seller dashboard, Order history, Product lists
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Table header */}
      <div className="flex gap-4 border-b border-gray-200 pb-3 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 flex-1 bg-gray-200 rounded"></div>
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 flex-1 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Product Card Skeleton - Product card loading state
 * Used in: Shop page, Product grids
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white shadow overflow-hidden">
      {/* Image skeleton */}
      <div className="h-48 w-full bg-gray-200"></div>
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        {/* Price skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        {/* Button skeleton */}
        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * List Skeleton - Generic list loading state
 * Used in: Order lists, Notification lists
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white shadow">
          {/* Icon/Avatar skeleton */}
          <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            {/* Subtitle skeleton */}
            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
          </div>
          {/* Action skeleton */}
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Stats Skeleton - Statistics cards loading state
 * Used in: Seller dashboard, Analytics pages
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
          <div className="space-y-3">
            {/* Label skeleton */}
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            {/* Value skeleton */}
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            {/* Trend skeleton */}
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page Skeleton - Full page loading state
 * Used in: When entire page is loading
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>

        {/* Profile section */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <ProfileSkeleton />
        </div>

        {/* Info section */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <AccountInfoSkeleton />
        </div>
      </div>
    </div>
  );
}
