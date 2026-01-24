/**
 * Export Button Component
 * CSV export functionality for analytics data
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";
import { useAnalyticsExport } from "@/hooks/useAnalytics";
import { toast } from "sonner";

interface ExportButtonProps {
  data: AnalyticsData | null;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({ data, disabled, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportToCSV } = useAnalyticsExport();

  const handleExport = async (format: "csv") => {
    if (!data) {
      toast.error("No data available to export");
      return;
    }

    setIsExporting(true);
    
    try {
      if (format === "csv") {
        const success = exportToCSV(data);
        if (success) {
          toast.success("Analytics data exported as CSV", {
            description: "Your download should start automatically",
          });
        } else {
          toast.error("Failed to export data");
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || !data}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        {/* Future: Add PDF export */}
        {/* <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
