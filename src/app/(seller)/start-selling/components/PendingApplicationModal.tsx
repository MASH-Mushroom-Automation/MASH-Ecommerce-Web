import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Mail, Building2 } from "lucide-react";
import { SellerVerificationStatus } from "@/hooks/useSellerApplication";

interface PendingApplicationModalProps {
  onClose: () => void;
  verificationStatus?: SellerVerificationStatus;
}

export function PendingApplicationModal({
  onClose,
  verificationStatus,
}: PendingApplicationModalProps) {
  const submittedAt = verificationStatus?.submittedAt;
  const businessInfo = verificationStatus?.businessInfo;
  const progressPercentage = verificationStatus?.progressPercentage;
  const nextSteps = verificationStatus?.nextSteps;
  const estimatedTime =
    verificationStatus?.estimatedCompletionTime || "2-3 business days";

  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <div className="bg-background rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 max-w-md w-full text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Application Under Review
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          You already have a pending seller application.
        </p>
        {formattedDate && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-8">
            Submitted on {formattedDate}
          </p>
        )}

        {/* Progress indicator */}
        {progressPercentage !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Review Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Business Info */}
        {businessInfo && (
          <div className="bg-muted rounded-lg p-4 text-left mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-foreground text-sm">
                Application Details
              </h3>
            </div>
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

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-left">
            <h3 className="font-semibold text-foreground mb-3">
              {nextSteps ? "Next Steps:" : "What's happening now:"}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              {nextSteps && nextSteps.length > 0 ? (
                nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-600 mr-2 flex-shrink-0 font-medium">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Our team is reviewing your submitted documents</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Review typically takes {estimatedTime}</span>
                  </li>
                  <li className="flex items-start">
                    <Mail className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      You&apos;ll receive an email once we&apos;ve made a
                      decision
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left">
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
              <strong>Need help?</strong> If you have any questions about your
              application status, please contact our support team.
            </p>
          </div>
          <Button onClick={onClose} className="w-full h-10 sm:h-12">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
