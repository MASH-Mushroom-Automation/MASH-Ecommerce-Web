import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  onClose: () => void;
}

export function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <div className="bg-background rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 max-w-md w-full text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Application Submitted!
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          Thank you for applying to become a seller on MASH Market. We'll review
          your application within 2-3 business days.
        </p>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-left">
            <h3 className="font-semibold text-foreground mb-2">Next Steps:</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 flex-shrink-0">1.</span>
                We'll verify your business information
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 flex-shrink-0">2.</span>
                You'll receive an email confirmation
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 flex-shrink-0">3.</span>
                Once approved, you can start listing products
              </li>
            </ul>
          </div>
          <Button
            onClick={onClose}
            className="w-full h-10 sm:h-12"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
