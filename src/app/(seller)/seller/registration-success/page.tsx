/**
 * Registration Success Page
 * 
 * Confirmation page after successful seller registration
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, Mail, FileText } from "lucide-react";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="pt-12 pb-8 px-6 sm:px-12">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">
              Application Submitted!
            </h1>

            {/* Message */}
            <p className="text-center text-muted-foreground mb-8">
              Thank you for your interest in becoming a MASH seller. We&apos;ve
              received your application and will review it carefully.
            </p>

            {/* Next Steps */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-foreground mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                What happens next?
              </h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    1
                  </span>
                  <span>
                    Our team will review your application within 2-3 business days
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    2
                  </span>
                  <span>
                    We&apos;ll verify your business information and documents
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    3
                  </span>
                  <span>
                    You&apos;ll receive an email with the status of your application
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    4
                  </span>
                  <span>
                    Once approved, you can start listing your products immediately
                  </span>
                </li>
              </ol>
            </div>

            {/* Email Notice */}
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Check your email
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  We&apos;ve sent a confirmation email with your application details.
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/profile">View My Profile</Link>
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Have questions?{" "}
              <a
                href="/support"
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
