"use client";

import React from "react";
import Link from "next/link";
import { Clock, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RequestPendingPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Application Under Review
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Your seller application has been submitted and is currently being
            reviewed by our admin team.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
          <p>
            This process usually takes <strong>1–3 business days</strong>. You
            will be notified once your application has been reviewed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/profile/my-information">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
