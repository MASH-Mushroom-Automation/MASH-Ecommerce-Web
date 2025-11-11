"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, ShoppingBag, Sprout } from "lucide-react";

export default function OnboardingInterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    {
      id: "cooking",
      title: "Cooking with Fresh Mushrooms:",
      subtitle: "For home cooks and foodies",
      icon: ChefHat,
    },
    {
      id: "trying",
      title: "Trying Mushroom Products:",
      subtitle: "For users interested in snacks like chicharon",
      icon: ShoppingBag,
    },
    {
      id: "growing",
      title: "Growing My Own Mushrooms:",
      subtitle: "For users interested in snacks like chicharon",
      icon: Sprout,
    },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    console.log("Selected interests:", selectedInterests);
    window.location.href = "/onboarding/cooking";
  };

  const handleBack = () => {
    window.location.href = "/welcome";
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/Logo  v6 - Market.png"
              alt="MASH Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <span className="text-sm text-muted-foreground">Seller Registration</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-lg shadow-md p-12">
          {/* Step Number */}
          <div className="flex justify-center mb-6">
            <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center text-accent-foreground font-bold text-xl">
              1
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            What are you most interested in?
          </h2>
          <h3 className="text-lg text-center text-foreground mb-1">
            (Select all that apply)
          </h3>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Let&apos;s take a moment to be building your experience. It&apos;ll{" "}
            <br />
            only take a minute!
          </p>

          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-16 h-2 rounded-full bg-accent"></div>
            <div className="w-16 h-2 rounded-full bg-muted-foreground/30"></div>
          </div>

          {/* Interest Options */}
          <div className="space-y-4 mb-8">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);

              return (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-accent/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <Icon className="w-6 h-6 text-foreground mr-4" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {interest.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{interest.subtitle}</p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="space-y-4 max-w-sm mx-auto">
            <Button
              onClick={handleNext}
              className="w-full py-6 rounded-lg font-semibold"
            >
              Next
            </Button>

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full py-6 border-accent text-accent hover:bg-accent/10"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
