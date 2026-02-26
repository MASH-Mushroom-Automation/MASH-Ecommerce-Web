"use client";

import { Search, ShoppingCart, Truck, ArrowRight } from "lucide-react";

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
 * 3-step visual guide: browse -> cart -> delivery.
 */
export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border border-primary/15 rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            Getting fresh mushrooms from local growers is as easy as 1-2-3.
          </p>
          <div className="mt-5 mx-auto w-10 h-0.5 rounded-full bg-primary/30" />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[22%] right-[22%] h-px bg-border" />

          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center z-10"
            >
              <div className="w-full p-6 sm:p-8 rounded-xl bg-background border border-border hover:shadow-md transition-shadow duration-200">
                {/* Step number + icon */}
                <div className="relative mb-5 inline-flex">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted flex items-center justify-center border border-border">
                    <step.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting arrow (mobile) */}
              {index < STEPS.length - 1 && (
                <div className="md:hidden flex flex-col items-center my-3">
                  <div className="w-px h-5 bg-border" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
