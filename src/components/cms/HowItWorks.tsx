"use client";

import { Search, ShoppingCart, Truck } from "lucide-react";

const STEPS = [
  {
    Icon: Search,
    title: "Browse Local Growers",
    description: "Explore mushrooms from verified local farms and growers near you.",
  },
  {
    Icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select your favorites, choose quantities, and build your order.",
  },
  {
    Icon: Truck,
    title: "Delivered Fresh",
    description: "Get farm-fresh mushrooms delivered straight to your doorstep.",
  },
] as const;

/**
 * How It Works section for the homepage.
 * 3-step visual guide connecting browse -> cart -> delivery.
 */
export function HowItWorks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-2">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
          Getting fresh mushrooms from local growers is as easy as 1-2-3.
        </p>

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-12">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-border" />

          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center max-w-[220px] z-10"
            >
              {/* Step number + icon */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.Icon className="w-10 h-10 text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-sm">
                  {index + 1}
                </span>
              </div>

              {/* Connecting arrow (mobile) */}
              {index < STEPS.length - 1 && (
                <div className="md:hidden w-0.5 h-6 bg-border my-1" />
              )}

              <h3 className="font-semibold text-foreground text-base mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
