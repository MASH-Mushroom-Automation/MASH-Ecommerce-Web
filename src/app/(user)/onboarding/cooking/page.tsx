"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function OnboardingCookingPage() {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const cookingStyles = [
    { id: "pasta", label: "Pasta Dishes" },
    { id: "quick", label: "Quick & Easy Meals" },
    { id: "grilling", label: "Grilling & Roasting" },
    { id: "stirfry", label: "Stir-Fries" },
    { id: "adventurous", label: "Adventurous Recipe" },
    { id: "soups", label: "Soups & Stews" },
  ];

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    console.log("Selected cooking preferences:", selectedPreferences);
    window.location.href = "/onboarding/complete";
  };

  const handleBack = () => {
    window.location.href = "/onboarding/interests";
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
              2
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            How do you like to cook?
          </h2>
          <h3 className="text-lg text-center text-foreground mb-1">
            (Select a few)
          </h3>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Help us recommend recipes and products you&apos;ll love!
          </p>

          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-16 h-2 rounded-full bg-accent"></div>
            <div className="w-16 h-2 rounded-full bg-accent"></div>
          </div>

          {/* Cooking Preferences Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {cookingStyles.map((style) => {
              const isSelected = selectedPreferences.includes(style.id);

              return (
                <div
                  key={style.id}
                  onClick={() => togglePreference(style.id)}
                  className={`flex items-center justify-between p-5 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-accent/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <span className="font-medium text-foreground">
                    {style.label}
                  </span>
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
