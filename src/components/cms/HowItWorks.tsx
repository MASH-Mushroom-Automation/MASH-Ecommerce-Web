"use client";

import { Search, ShoppingCart, Truck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    Icon: Search,
    title: "Browse Local Growers",
    description: "Explore mushrooms from verified local farms and growers near you.",
    color: "from-primary/20 to-primary/5",
  },
  {
    Icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select your favorites, choose quantities, and build your order.",
    color: "from-primary/15 to-primary/5",
  },
  {
    Icon: Truck,
    title: "Delivered Fresh",
    description: "Get farm-fresh mushrooms delivered straight to your doorstep.",
    color: "from-primary/10 to-primary/5",
  },
] as const;

/**
 * How It Works section for the homepage.
 * 3-step visual guide connecting browse -> cart -> delivery.
 */
export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Badge + Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            Getting fresh mushrooms from local growers is as easy as 1-2-3.
          </p>
          <div className="mt-5 mx-auto w-12 h-1 rounded-full bg-primary/40" />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 rounded-full" />
          </div>

          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center z-10"
            >
              {/* Step Card */}
              <div className={`w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${step.color} border border-primary/10 backdrop-blur-sm`}>
                {/* Step number + icon */}
                <div className="relative mb-6 inline-flex">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-background shadow-lg flex items-center justify-center border border-primary/10">
                    <step.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md ring-2 ring-background">
                    {index + 1}
                  </span>
                </div>

                <h3 className="font-bold text-foreground text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting arrow (mobile) */}
              {index < STEPS.length - 1 && (
                <div className="md:hidden flex flex-col items-center my-4">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-primary/40 to-primary/20" />
                  <ArrowRight className="w-4 h-4 text-primary/40 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
