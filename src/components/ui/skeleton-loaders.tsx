import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-background rounded-lg overflow-hidden border border-border shadow-sm flex flex-col h-full">
      {/* Image skeleton */}
      <div className="aspect-square bg-muted animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-3 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Price and button skeleton */}
      <div className="p-3 pt-0 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function GrowerCardSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-[380px] overflow-hidden rounded-lg border border-border bg-background">
      {/* Banner skeleton */}
      <Skeleton className="h-32 w-full rounded-none" />
      
      {/* Content */}
      <div className="p-6 text-center flex flex-col flex-grow">
        {/* Logo skeleton */}
        <div className="flex justify-center -mt-10 mb-4">
          <Skeleton className="rounded-full h-20 w-20" />
        </div>
        
        {/* Text skeletons */}
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto mb-3" />
        <Skeleton className="h-4 w-48 mx-auto" />
        
        {/* Action links skeleton */}
        <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-border">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GrowerListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GrowerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-muted">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-3xl px-4">
          {/* Title skeleton */}
          <Skeleton className="h-12 sm:h-16 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-12 sm:h-16 w-3/4 mx-auto" />
          
          {/* Subtitle skeleton */}
          <Skeleton className="h-6 w-full max-w-xl mx-auto mt-6" />
          
          {/* Button skeleton */}
          <Skeleton className="h-12 w-48 mx-auto mt-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
