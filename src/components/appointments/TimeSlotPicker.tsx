'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AvailabilitySlot } from '@/types/appointments';

interface TimeSlotPickerProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.available_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const availableDates = Object.keys(slotsByDate).map((date) => parseISO(date));

  const slotsForSelectedDate = selectedDate
    ? slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium mb-2">Select Date:</p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return !slotsByDate[dateStr] || slotsByDate[dateStr].length === 0;
          }}
          className="rounded-md border"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Available Times:</p>
        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">Select a date to see available times</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {slotsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available for this date</p>
              ) : (
                slotsForSelectedDate.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className={cn('w-full justify-start', !slot.is_available && 'opacity-50')}
                    onClick={() => onSelectSlot(slot)}
                    disabled={!slot.is_available}
                  >
                    {slot.start_time} - {slot.end_time}
                    {!slot.is_available && ' (Booked)'}
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
