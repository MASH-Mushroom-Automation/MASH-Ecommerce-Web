"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function WelcomePage() {
  const handleStart = () => {
    window.location.href = "/onboarding/interests";
  };

  const handleSkip = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8">
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
        <div className="bg-white rounded-lg shadow-md p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#6A994E] rounded-full p-4">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Welcome to MASH, Jose Marie Chan!
          </h2>
          <p className="text-center text-gray-600 text-base mb-8">
            Let&apos;s take a moment to personalize your experience. It&apos;ll{" "}
            <br />
            only take a minute!
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-[#6A994E]"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>

          {/* Buttons */}
          <div className="space-y-4 max-w-sm mx-auto">
            <Button
              onClick={handleStart}
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white py-6 rounded-lg font-semibold"
            >
              Let&apos;s Go!
            </Button>

            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full py-6 border-[#6A994E] text-[#6A994E] hover:bg-[#6A994E]/10"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
