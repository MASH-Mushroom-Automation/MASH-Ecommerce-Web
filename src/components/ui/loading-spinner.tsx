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
        "animate-spin rounded-full border-2 border-gray-300 border-t-[#1E392A]",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-200 rounded", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-3 flex-grow">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      
      {/* Price and button skeleton */}
      <div className="p-3 pt-0 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2 flex-1">
            <LoadingSkeleton className="h-5 w-20" />
            <LoadingSkeleton className="h-3 w-16" />
          </div>
          <LoadingSkeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
