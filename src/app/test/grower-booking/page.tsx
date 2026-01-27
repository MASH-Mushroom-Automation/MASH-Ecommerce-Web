"use client";

import React from 'react';
import { GrowerCard } from '@/components/product/GrowerCard';
import { CalendlyButton } from '@/components/appointments/CalendlyButton';

export default function TestGrowerBookingPage() {
  const grower = {
    name: 'Mock Grower',
    rating: 4.8,
    location: '123 Mock Lane, Test Town',
    calcomUsername: 'mockgrower',
    defaultEventSlug: '30min',
    contactEmail: 'hello@mockgrower.test',
    image: null,
    calcomButtonText: 'Schedule with Grower',
  } as any;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Test: Grower Booking</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">GrowerCard (product context)</h2>
        <div className="max-w-xl">
          <GrowerCard grower={grower} productName="Test Product" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">CalendlyButton (profile context)</h2>
        <div>
          <CalendlyButton
            growerSlug="mock-grower"
            growerName="Mock Grower"
            calendlyEnabled={true}
            appointmentTypes={[{ name: '30 Min', eventSlug: '30min', duration: 30, meetingType: 'online', isDefault: true }]}
            buttonText="Schedule with Grower"
            size="lg"
          />
        </div>
      </section>
    </div>
  );
}
