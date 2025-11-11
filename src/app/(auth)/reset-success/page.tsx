"use client";

import React, { useEffect } from "react";
import Link from "next/link";
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
    <>
      {/* Card */}
      <div className="bg-card rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-4">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Reset password successful!
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            You will be automatically redirected to the login page.
          </p>

          {/* Manual Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back to sign in (10s)
            </Link>
          </div>
        </div>
    </>
  );
}
