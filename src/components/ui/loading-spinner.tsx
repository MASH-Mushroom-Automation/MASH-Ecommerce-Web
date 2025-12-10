import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm flex flex-col h-full animate-in fade-in duration-300">
      {/* Image skeleton with badge placeholders */}
      <div className="relative aspect-[4/5] bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        {/* Badge skeleton */}
        <div className="absolute top-2.5 left-2.5">
          <LoadingSkeleton className="h-5 w-16 rounded-md" />
        </div>
        {/* Wishlist button skeleton */}
        <div className="absolute top-2.5 right-2.5">
          <LoadingSkeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 space-y-3 flex-grow">
        {/* Rating skeleton */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
          <LoadingSkeleton className="h-3 w-8 ml-1" />
        </div>
        {/* Title skeleton */}
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      {/* Price and button skeleton */}
      <div className="p-3 sm:p-4 pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1.5">
            <LoadingSkeleton className="h-5 w-20" />
            <LoadingSkeleton className="h-3 w-14" />
          </div>
          <LoadingSkeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button skeleton */}
        <LoadingSkeleton className="h-4 w-32 mb-6" />
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          
          {/* Product details skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <LoadingSkeleton className="h-10 w-3/4" />
              <LoadingSkeleton className="h-5 w-1/4" />
            </div>
            <LoadingSkeleton className="h-9 w-32" />
            <LoadingSkeleton className="h-5 w-40" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-4">
              <LoadingSkeleton className="h-12 flex-1 rounded-lg" />
              <LoadingSkeleton className="h-12 w-12 rounded-lg" />
              <LoadingSkeleton className="h-12 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
