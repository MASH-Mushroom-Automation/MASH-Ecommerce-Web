"use client";

import React from "react";
import { Loader2, Package, ShoppingCart, User } from "lucide-react";

// Full page loading spinner
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm sm:text-base">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function Spinner({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return (
    <Loader2 
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} 
    />
  );
}

// Product skeleton loader for mobile
export function ProductSkeleton() {
  return (
    <div className="bg-background rounded-lg shadow-sm p-4 animate-pulse">
      <div className="bg-muted rounded-lg h-48 sm:h-56 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Order skeleton loader for mobile
export function OrderSkeleton() {
  return (
    <div className="bg-background rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </div>
        <div className="h-6 bg-muted rounded-full w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="bg-muted rounded w-16 h-16"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-5 bg-muted rounded w-24"></div>
      </div>
    </div>
  );
}

// Inventory skeleton loader
export function InventorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-background rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-4 border-b">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Notification skeleton loader
export function NotificationSkeleton() {
  return (
    <div className="p-4 border-b animate-pulse">
      <div className="flex gap-3">
        <div className="bg-muted rounded-full w-10 h-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
          <div className="h-3 bg-muted rounded w-24 mt-2"></div>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized loading card
export function LoadingCard({ 
  icon: Icon = Package, 
  message = "Loading...",
  description 
}: { 
  icon?: any;
  message?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Icon className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground text-center font-medium">{message}</p>
      {description && (
        <p className="text-muted-foreground text-sm text-center mt-2">{description}</p>
      )}
      <Spinner size="sm" className="mt-4" />
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  icon: Icon = Package,
  title = "No items found",
  description,
  action
}: {
  icon?: any;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// Table skeleton for desktop
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Table Header */}
      <div className="border-b bg-muted px-6 py-3">
        <div className="flex gap-4">
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
        </div>
      </div>
      {/* Table Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b px-6 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile list skeleton
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="bg-background rounded-lg shadow-sm p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="bg-muted rounded w-20 h-20"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-20 mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
