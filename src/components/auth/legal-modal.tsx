"use client";

/**
 * Legal Modal Component - Terms & Privacy Policy Display
 *
 * Displays Terms of Service and Privacy Policy in a modal format
 * to prevent navigation away from signup page (preserves form state).
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield } from "lucide-react";
import { TermsContent, PrivacyContent } from "@/components/legal/legal-content";

interface LegalModalProps {
  type: "terms" | "privacy";
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export function LegalModal({
  type,
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false,
}: LegalModalProps) {
  const isTerms = type === "terms";

  const handleAccept = () => {
    onAccept?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden [&>button]:top-3 [&>button]:right-3">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {isTerms ? (
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            ) : (
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl">
                {isTerms ? "Terms of Service" : "Privacy Policy"}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Last Updated: January 2025
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
          {isTerms ? (
            <TermsContent variant="compact" showContactCard={false} />
          ) : (
            <PrivacyContent variant="compact" showContactCard={false} />
          )}
        </div>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 flex-shrink-0">
          {showAcceptButton ? (
            <div className="flex gap-2 sm:gap-3 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1 h-10 sm:h-11 text-sm">
                Cancel
              </Button>
              <Button onClick={handleAccept} className="flex-1 h-10 sm:h-11 text-sm">
                I Accept
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full h-10 sm:h-11 text-sm">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
