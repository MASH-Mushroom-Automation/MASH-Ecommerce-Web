"use client";

import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
}

const STEP_LABELS = ["Delivery", "Contact", "Payment"];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        {currentStep === 1 && "Delivery Method"}
        {currentStep === 2 && "Contact Information"}
        {currentStep === 3 && "Payment & Review"}
      </h1>
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step}
            </div>
            <span
              className={cn(
                "text-xs sm:text-sm hidden sm:inline",
                currentStep >= step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[step - 1]}
            </span>
            {step < 3 && (
              <div
                className={cn(
                  "w-12 h-1 rounded",
                  currentStep > step ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
