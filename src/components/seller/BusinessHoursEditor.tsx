/**
 * Business Hours Configuration Component
 * Allows sellers to set operating hours for each day of the week
 */

'use client';

import React, { useState } from 'react';
import { Clock, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BusinessHours, DayOfWeek } from '@/lib/types/seller-profile';
import { DAY_LABELS, DayOfWeek as DayEnum } from '@/lib/types/seller-profile';

interface BusinessHoursEditorProps {
  hours: BusinessHours[];
  onChange: (hours: BusinessHours[]) => void;
}

// Generate time options (every 30 minutes)
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const hourStr = hour.toString().padStart(2, '0');
      const minStr = minute.toString().padStart(2, '0');
      options.push(`${hourStr}:${minStr}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export function BusinessHoursEditor({ hours, onChange }: BusinessHoursEditorProps) {
  const [copyFrom, setCopyFrom] = useState<DayOfWeek | ''>('');

  // Update a specific day's hours
  const updateDay = (day: DayOfWeek, updates: Partial<BusinessHours>) => {
    const newHours = hours.map((h) =>
      h.day === day ? { ...h, ...updates } : h
    );
    onChange(newHours);
  };

  // Copy hours from one day to selected day(s)
  const handleCopyHours = (fromDay: DayOfWeek, toDays: DayOfWeek[]) => {
    const sourceDay = hours.find((h) => h.day === fromDay);
    if (!sourceDay) return;

    const newHours = hours.map((h) =>
      toDays.includes(h.day)
        ? {
            ...h,
            isOpen: sourceDay.isOpen,
            openTime: sourceDay.openTime,
            closeTime: sourceDay.closeTime,
            isOvernight: sourceDay.isOvernight,
          }
        : h
    );
    onChange(newHours);
  };

  // Copy to all weekdays
  const copyToWeekdays = (fromDay: DayOfWeek) => {
    handleCopyHours(fromDay, [
      DayEnum.MONDAY,
      DayEnum.TUESDAY,
      DayEnum.WEDNESDAY,
      DayEnum.THURSDAY,
      DayEnum.FRIDAY,
    ]);
  };

  // Copy to all days
  const copyToAllDays = (fromDay: DayOfWeek) => {
    handleCopyHours(fromDay, Object.values(DayEnum));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your operating hours for each day of the week. Customers will see when your store is open.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hours.map((dayHours) => (
          <div
            key={dayHours.day}
            className="flex items-center gap-4 p-4 border border-border rounded-lg"
          >
            {/* Day Name & Open Toggle */}
            <div className="flex items-center gap-3 w-32">
              <Switch
                checked={dayHours.isOpen}
                onCheckedChange={(isOpen) => updateDay(dayHours.day, { isOpen })}
                id={`open-${dayHours.day}`}
              />
              <Label
                htmlFor={`open-${dayHours.day}`}
                className={`font-medium ${!dayHours.isOpen ? 'text-muted-foreground' : ''}`}
              >
                {DAY_LABELS[dayHours.day]}
              </Label>
            </div>

            {/* Time Selection */}
            {dayHours.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Select
                  value={dayHours.openTime}
                  onValueChange={(openTime) => updateDay(dayHours.day, { openTime })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                    {timeOptions.map((time) => (
                      <SelectItem key={`open-${time}`} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-muted-foreground">to</span>

                <Select
                  value={dayHours.closeTime}
                  onValueChange={(closeTime) => {
                    const isOvernight = closeTime <= dayHours.openTime;
                    updateDay(dayHours.day, { closeTime, isOvernight });
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                    {timeOptions.map((time) => (
                      <SelectItem key={`close-${time}`} value={time}>
                        {formatTime(time)}
                        {time <= dayHours.openTime && (
                          <span className="text-xs text-muted-foreground ml-1">(next day)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {dayHours.isOvernight && (
                  <span className="text-xs text-muted-foreground">(overnight)</span>
                )}
              </div>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground">Closed</div>
            )}

            {/* Copy Actions */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToWeekdays(dayHours.day)}
                title="Copy to all weekdays"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToAllDays(dayHours.day)}
                title="Copy to all days"
              >
                <Copy className="h-4 w-4 mr-1" />
                All
              </Button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {hours.map((dayHours) => (
              <div key={`summary-${dayHours.day}`} className="flex justify-between">
                <span>{DAY_LABELS[dayHours.day]}:</span>
                <span className="font-medium">
                  {dayHours.isOpen
                    ? `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}${dayHours.isOvernight ? ' (next day)' : ''}`
                    : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper: Format time from 24h to 12h format
function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr);
  const minute = minuteStr;

  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
}
