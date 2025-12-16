/**
 * Verification Pending Page
 * 
 * Shows after seller submits verification documents
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Mail, Home } from "lucide-react";

export default function VerificationPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 px-6 sm:px-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative bg-green-100 rounded-full p-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold mb-4">
            Documents Submitted Successfully!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for submitting your verification documents.
          </p>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Review Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your documents within 2-3 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Notification</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email once your account is verified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">What's Next?</span>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Our verification team will review your documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>We may contact you if additional information is needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Once approved, you can start listing and selling products</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/seller/dashboard")}
              className="sm:w-auto"
            >
              View Dashboard
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>

          {/* Support */}
          <p className="text-sm text-muted-foreground mt-8">
            Have questions?{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
