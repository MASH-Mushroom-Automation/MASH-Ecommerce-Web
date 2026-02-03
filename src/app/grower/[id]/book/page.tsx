"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  CheckCircle,
  Info,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useSanityGrower } from "@/hooks/useSanityGrowers";
import { CalendlyEmbed } from "@/components/appointments";
import { AppointmentTypeCard } from "@/components/appointments/CalendlyButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanityClient } from "@/lib/sanity/client";
import type { CalComTheme } from "@/lib/calcom";

// Extended grower type with Calendly fields
interface GrowerWithCalendly {
  calendlyEnabled?: boolean;
  calendlyUsername?: string;
  calendlyDefaultEvent?: string;
  calcomTheme?: CalComTheme;
  appointmentTypes?: Array<{
    name: string;
    eventSlug: string;
    duration: number;
    meetingType: "online" | "in-person" | "phone";
    description?: string;
    isDefault?: boolean;
  }>;
  appointmentNotes?: string;
}

/**
 * Grower Booking Page
 * 
 * Dedicated page for booking appointments with a grower using Calendly.
 * Uses Option A: Inline Embed Widget for full calendar experience.
 * 
 * Live Example: https://calendly.com/mash-mushroom-automation/30min
 * 
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md
 */
export default function GrowerBookingPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id;
  const { grower, loading: growerLoading, error: growerError } = useSanityGrower(slug || "");
  
  // Calendly-specific data from Sanity
  const [calendlyData, setCalendlyData] = useState<GrowerWithCalendly | null>(null);
  const [loadingCalendly, setLoadingCalendly] = useState(true);
  
  // Selected appointment type
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch Calendly data separately (includes new fields)
  useEffect(() => {
    async function fetchCalendlyData() {
      if (!slug) return;
      
      try {
        const query = `*[_type == "grower" && slug.current == $slug][0] {
          calendlyEnabled,
          calendlyUsername,
          calendlyDefaultEvent,
          calcomTheme,
          appointmentTypes[] {
            name,
            eventSlug,
            duration,
            meetingType,
            description,
            isDefault
          },
          appointmentNotes
        }`;
        
        const data = await sanityClient.fetch<GrowerWithCalendly>(query, { slug });
        setCalendlyData(data);
        
        // Set default selected type
        if (data?.appointmentTypes?.length) {
          const defaultType = data.appointmentTypes.find(t => t.isDefault) || data.appointmentTypes[0];
          setSelectedType(defaultType.eventSlug);
        } else if (data?.calendlyDefaultEvent) {
          setSelectedType(data.calendlyDefaultEvent);
        }
      } catch (err) {
        console.error("Error fetching Calendly data:", err);
      } finally {
        setLoadingCalendly(false);
      }
    }
    
    fetchCalendlyData();
  }, [slug]);

  const loading = growerLoading || loadingCalendly;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading booking page…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (growerError || !grower) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <Link
              href="/grower"
              className="inline-flex items-center text-sm text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Grower not found
            </h1>
            <p className="text-muted-foreground">
              We couldn&apos;t find the grower you&apos;re looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Appointments not enabled
  if (!calendlyData?.calendlyEnabled || !calendlyData?.calendlyUsername) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href={`/grower/${slug}`}
              className="inline-flex items-center text-sm text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {grower.name}
            </Link>
            
            <div className="bg-card border rounded-lg p-8 mt-6">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Appointments Not Available
              </h1>
              <p className="text-muted-foreground mb-6">
                {grower.name} hasn&apos;t set up appointment booking yet.
                You can contact them directly for inquiries.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {grower.contactEmail && (
                  <a href={`mailto:${grower.contactEmail}`}>
                    <Button variant="outline" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </a>
                )}
                {grower.contactPhone && (
                  <a href={`tel:${grower.contactPhone}`}>
                    <Button variant="outline" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  </a>
                )}
                <Link href={`/grower/${slug}`}>
                  <Button className="gap-2">
                    View Profile
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const appointmentTypes = calendlyData.appointmentTypes || [];
  const currentEventSlug = selectedType || calendlyData.calendlyDefaultEvent || "30min";
  const selectedAppointment = appointmentTypes.find(t => t.eventSlug === currentEventSlug);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
          <Link
            href={`/grower/${slug}`}
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {grower.name}
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
              <Image
                src={grower.image || "/placeholder.png"}
                alt={grower.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Book an Appointment
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                with {grower.name}
              </p>
              {grower.location && (
                <p className="text-white/70 text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {grower.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Appointment Types & Info */}
          <div className="lg:col-span-4">
            {/* Appointment Type Selection */}
            {appointmentTypes.length > 0 && (
              <div className="bg-card border rounded-lg p-5 mb-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Appointment Type
                </h2>
                <div className="space-y-3">
                  {appointmentTypes.map((apt, index) => (
                    <AppointmentTypeCard
                      key={`${apt.eventSlug}-${index}`}
                      appointment={apt}
                      isSelected={selectedType === apt.eventSlug}
                      onSelect={() => setSelectedType(apt.eventSlug)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Appointment Notes */}
            {calendlyData.appointmentNotes && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Before Your Appointment
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {calendlyData.appointmentNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What to Expect */}
            <div className="bg-card border rounded-lg p-5">
              <h2 className="font-semibold text-foreground mb-4">
                What to Expect
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Select a convenient time from the calendar
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Receive instant confirmation via email
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Google Calendar invite with meeting link
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Easy rescheduling if plans change
                  </span>
                </li>
              </ul>

              {/* Selected Meeting Type Info */}
              {selectedAppointment && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedAppointment.meetingType === "online" && (
                      <>
                        <Video className="w-4 h-4 text-blue-500" />
                        <span>Online via Google Meet</span>
                      </>
                    )}
                    {selectedAppointment.meetingType === "in-person" && (
                      <>
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>In-person at {grower.location || "store location"}</span>
                      </>
                    )}
                    {selectedAppointment.meetingType === "phone" && (
                      <>
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span>Phone call</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedAppointment.duration} minutes</span>
                  </div>
                </div>
              )}
            </div>

            {/* Grower Contact Info */}
            <div className="bg-card border rounded-lg p-5 mt-6">
              <h2 className="font-semibold text-foreground mb-4">
                Contact Information
              </h2>
              <div className="space-y-2 text-sm">
                {grower.contactEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${grower.contactEmail}`} className="hover:text-primary">
                      {grower.contactEmail}
                    </a>
                  </div>
                )}
                {grower.contactPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${grower.contactPhone}`} className="hover:text-primary">
                      {grower.contactPhone}
                    </a>
                  </div>
                )}
                {grower.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{grower.location}</span>
                  </div>
                )}
              </div>
              
              {grower.isVerified && (
                <Badge variant="secondary" className="mt-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Seller
                </Badge>
              )}
            </div>
          </div>

          {/* Right Column: Calendly Embed */}
          <div className="lg:col-span-8">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-muted/50">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select a Date & Time
                </h2>
                {selectedAppointment && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAppointment.name} • {selectedAppointment.duration} minutes
                  </p>
                )}
              </div>
              
              <CalendlyEmbed
                username={calendlyData.calendlyUsername}
                eventSlug={currentEventSlug}
                height="700px"
                theme={calendlyData.calcomTheme || "auto"}
              />
            </div>

            {/* Powered by Cal.com */}
            <div className="text-center mt-4">
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                Powered by Cal.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
