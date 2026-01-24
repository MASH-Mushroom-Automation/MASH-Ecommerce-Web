/**
 * Date Range Selector Component
 * Preset buttons (7d, 30d, 90d) and custom date picker
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange, DateRangePreset } from "@/types/analytics";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export function DateRangeSelector({
  dateRange,
  onPresetChange,
  onCustomRangeChange,
  className,
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30d");
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: dateRange.startDate,
    to: dateRange.endDate,
  });

  const handlePresetClick = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    onPresetChange(preset);
  };

  const handleCustomRangeSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) return;
    
    setCustomRange(range);
    
    if (range.from && range.to) {
      setSelectedPreset("custom");
      onCustomRangeChange(range.from, range.to);
    }
  };

  const presets: { label: string; value: DateRangePreset; }[] = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
  ];

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className="min-w-[100px]"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={selectedPreset === "custom" ? "default" : "outline"}
            size="sm"
            className={cn(
              "min-w-[240px] justify-start text-left font-normal",
              !customRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {customRange.from && customRange.to ? (
              <>
                {format(customRange.from, "MMM dd, yyyy")} -{" "}
                {format(customRange.to, "MMM dd, yyyy")}
              </>
            ) : (
              <span>Pick a custom range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{
              from: customRange.from,
              to: customRange.to,
            }}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={2}
            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
