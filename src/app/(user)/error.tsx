"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("User error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground mb-6">
          We encountered an error. Please try again.
        </p>
        <Button
          onClick={reset}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
