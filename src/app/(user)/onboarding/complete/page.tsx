"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OnboardingCompletePage() {
  const handleStartShopping = () => {
    window.location.href = "/shop";
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/Logo  v6 - Market.png"
              alt="MASH Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-background rounded-lg shadow-md p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-accent rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-accent-foreground" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            You&apos;re all set!
          </h2>

          {/* Message */}
          <p className="text-center text-muted-foreground mb-8 leading-relaxed">
            We&apos;ll use this to recommend products and recipes you&apos;ll
            love.
            <br />
            Happy exploring!
          </p>

          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-16 h-2 rounded-full bg-accent"></div>
            <div className="w-16 h-2 rounded-full bg-accent"></div>
          </div>

          {/* Button */}
          <Button
            onClick={handleStartShopping}
            className="w-full py-6 rounded-lg font-semibold text-lg"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
