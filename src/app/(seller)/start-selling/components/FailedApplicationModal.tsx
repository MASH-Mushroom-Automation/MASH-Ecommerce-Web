"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { SellerVerificationStatus } from "@/hooks/useSellerApplication";

interface FailedApplicationModalProps {
  onClose: () => void;
  verificationStatus?: SellerVerificationStatus;
  onStartResubmission: () => void;
}

export function FailedApplicationModal({
  onClose,
  verificationStatus,
  onStartResubmission,
}: FailedApplicationModalProps) {
  const adminNotes = verificationStatus?.adminNotes;
  const rejectedAt = verificationStatus?.rejectedAt;
  const businessInfo = verificationStatus?.businessInfo;

  const formattedDate = rejectedAt
    ? new Date(rejectedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <div className="bg-background rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Application Requires Revision
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your seller application needs updates before it can be approved.
          </p>
          {formattedDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Reviewed on {formattedDate}
            </p>
          )}
        </div>

        {/* Admin Notes */}
        {adminNotes && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                  Reason for Rejection
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {adminNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Info */}
        {businessInfo && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-2 text-sm">
              Application Details
            </h3>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Business:</span>{" "}
                {businessInfo.businessName}
              </p>
              <p>
                <span className="font-medium">Type:</span>{" "}
                {businessInfo.businessType}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {businessInfo.city}, {businessInfo.region}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Go Back Home
          </Button>
          <Button
            onClick={onStartResubmission}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resubmit Application
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          Need help? Contact our support team at{" "}
          <a
            href="mailto:support@mashmarket.app"
            className="text-primary hover:underline"
          >
            support@mashmarket.app
          </a>
        </p>
      </div>
    </div>
  );
}
