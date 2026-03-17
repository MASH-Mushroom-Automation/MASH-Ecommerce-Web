"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Download,
  Check,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBackupCode } from "@/lib/security/backup-codes";

// ============================================================================
// Types
// ============================================================================

export interface BackupCodesDisplayProps {
  /** Array of raw backup codes (will be formatted as XXXX-XXXX) */
  codes: string[];
  /** Callback when the user acknowledges they have saved the codes */
  onDone: () => void;
  /** Whether to show the download button (default: true) */
  showDownload?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build the plain-text content for a downloadable backup codes file.
 */
function buildDownloadContent(formattedCodes: string[]): string {
  const lines = [
    "MASH Market - Two-Factor Authentication Backup Codes",
    "====================================================",
    "",
    "Generated: " + new Date().toISOString(),
    "",
    "Each code can only be used ONCE. Store these somewhere safe.",
    "If you lose these codes and your phone, you may lose access",
    "to your account.",
    "",
    ...formattedCodes.map((code, i) => `  ${String(i + 1).padStart(2, " ")}. ${code}`),
    "",
    "====================================================",
    "Keep this file in a secure location.",
  ];
  return lines.join("\n");
}

// ============================================================================
// Component
// ============================================================================

/**
 * BackupCodesDisplay
 *
 * Renders a grid of formatted backup codes (XXXX-XXXX) with:
 * - Copy all to clipboard
 * - Download as .txt file
 * - Prominent warning that codes are shown only once
 */
export function BackupCodesDisplay({
  codes,
  onDone,
  showDownload = true,
  className,
}: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formattedCodes = codes.map(formatBackupCode);

  // ---------- Copy all codes to clipboard ----------
  const handleCopy = useCallback(async () => {
    try {
      const text = formattedCodes.join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Backup codes copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy codes to clipboard");
    }
  }, [formattedCodes]);

  // ---------- Download codes as text file ----------
  const handleDownload = useCallback(() => {
    try {
      const content = buildDownloadContent(formattedCodes);
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mash-backup-codes.txt";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success("Backup codes downloaded");
    } catch {
      toast.error("Failed to download backup codes");
    }
  }, [formattedCodes]);

  return (
    <Card className={cn("w-full max-w-md", className)} data-testid="backup-codes-display">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Backup Codes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning */}
        <Alert variant="destructive" data-testid="backup-codes-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Save these codes in a safe place. You will not be able to see them
            again. Each code can only be used once.
          </AlertDescription>
        </Alert>

        {/* Codes Grid */}
        <div
          className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm"
          data-testid="backup-codes-grid"
        >
          {formattedCodes.map((code, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded px-2 py-1"
              data-testid={`backup-code-${index}`}
            >
              <span className="text-muted-foreground text-xs">
                {index + 1}.
              </span>
              <span className="select-all">{code}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="copy-codes-btn"
          >
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-green-600" />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy All"}
          </Button>

          {showDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              data-testid="download-codes-btn"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {/* Done Button */}
        <Button
          className="w-full"
          onClick={onDone}
          data-testid="backup-codes-done-btn"
        >
          I have saved my codes
        </Button>
      </CardContent>
    </Card>
  );
}
