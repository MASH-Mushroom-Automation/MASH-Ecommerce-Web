"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function ResetSuccessPage() {
  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
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
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#6A994E] rounded-full p-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Reset password successful!
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            You will be automatically redirected to the login page.
          </p>

          {/* Manual Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-block bg-[#1E392A] hover:bg-[#1E392A]/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back to sign in (10s)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
