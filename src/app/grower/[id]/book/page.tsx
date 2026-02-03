"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  Info,
  Mail,
  ExternalLink,
  Star,
  Shield,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { useSanityGrower } from "@/hooks/useSanityGrowers";
import { CalendlyEmbed } from "@/components/appointments";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { sanityClient } from "@/lib/sanity/client";
import { cn } from "@/lib/utils";
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
    meetingType: "online" | "in-person" | "email";
    description?: string;
    isDefault?: boolean;
  }>;
  appointmentNotes?: string;
}

// Default appointment types (fallback if not configured in Sanity)
const DEFAULT_APPOINTMENT_TYPES: GrowerWithCalendly["appointmentTypes"] = [
  {
    name: "15 Min Quick Chat",
    eventSlug: "15min",
    duration: 15,
    meetingType: "email",
    description: "Quick questions about products or availability",
    isDefault: false,
  },
  {
    name: "30 Min Meeting",
    eventSlug: "30min",
    duration: 30,
    meetingType: "online",
    description: "Online consultation to discuss mushroom products",
    isDefault: true,
  },
  {
    name: "1 Hour Meeting",
    eventSlug: "1-hour-meeting",
    duration: 60,
    meetingType: "in-person",
    description: "In-person farm tour or detailed consultation",
    isDefault: false,
  },
];

// Meeting type configuration (no phone - only email, online, in-person)
const MEETING_TYPE_CONFIG = {
  online: {
    icon: Video,
    label: "Online Meeting",
    sublabel: "Via Google Meet",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  "in-person": {
    icon: MapPin,
    label: "Farm Visit",
    sublabel: "In-person tour",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    borderColor: "border-green-200 dark:border-green-800",
  },
  email: {
    icon: MessageSquare,
    label: "Quick Chat",
    sublabel: "Brief consultation",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
};

type AppointmentType = NonNullable<GrowerWithCalendly["appointmentTypes"]>[number];

/**
 * AppointmentTypeCard - Selection card for appointment types
 */
function AppointmentTypeCard({
  appointment,
  isSelected,
  onSelect,
}: {
  appointment: AppointmentType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = MEETING_TYPE_CONFIG[appointment.meetingType] || MEETING_TYPE_CONFIG.online;
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border hover:border-primary/50 bg-card"
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          isSelected ? "bg-primary/10" : config.bgColor
        )}>
          <Icon className={cn(
            "w-5 h-5 transition-colors",
            isSelected ? "text-primary" : config.color
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-semibold truncate transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {appointment.name}
            </h3>
            {appointment.isDefault && (
              <Badge 
                variant={isSelected ? "default" : "secondary"} 
                className="shrink-0 text-xs"
              >
                Recommended
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{appointment.duration} min</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{config.sublabel || config.label}</span>
          </div>
          {appointment.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {appointment.description}
            </p>
          )}
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          isSelected 
            ? "border-primary bg-primary" 
            : "border-muted-foreground/30"
        )}>
          {isSelected && (
            <CheckCircle className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </button>
  );
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
  
  // Selected appointment type slug
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Key to force re-render of CalendlyEmbed when appointment type changes
  const [embedKey, setEmbedKey] = useState(0);

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
        
        // Use configured types or fallback to defaults
        const types = data?.appointmentTypes?.length 
          ? data.appointmentTypes 
          : DEFAULT_APPOINTMENT_TYPES;
        
        // Set default selected type
        const defaultType = types.find(t => t.isDefault) || types[0];
        setSelectedType(defaultType?.eventSlug || "30min");
      } catch (err) {
        console.error("Error fetching Calendly data:", err);
      } finally {
        setLoadingCalendly(false);
      }
    }
    
    fetchCalendlyData();
  }, [slug]);

  // Handle appointment type change - force new embed
  const handleSelectType = (eventSlug: string) => {
    if (eventSlug !== selectedType) {
      setSelectedType(eventSlug);
      setEmbedKey(prev => prev + 1); // Force re-render of CalendlyEmbed
    }
  };

  // Get appointment types (from Sanity or defaults)
  const appointmentTypes = useMemo(() => {
    return calendlyData?.appointmentTypes?.length 
      ? calendlyData.appointmentTypes 
      : DEFAULT_APPOINTMENT_TYPES;
  }, [calendlyData?.appointmentTypes]);

  // Get selected appointment details
  const selectedAppointment = useMemo(() => {
    return appointmentTypes?.find(t => t.eventSlug === selectedType);
  }, [appointmentTypes, selectedType]);

  const loading = growerLoading || loadingCalendly;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading booking page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (growerError || !grower) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/grower"
              className="inline-flex items-center text-sm text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
            </Link>
            <Card className="text-center p-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Grower not found
              </h1>
              <p className="text-muted-foreground">
                We couldn&apos;t find the grower you&apos;re looking for.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Appointments not enabled
  if (!calendlyData?.calendlyEnabled || !calendlyData?.calendlyUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href={`/grower/${slug}`}
              className="inline-flex items-center text-sm text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {grower.name}
            </Link>
            
            <Card className="p-8 mt-6">
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
                      Send Email
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
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentEventSlug = selectedType || calendlyData.calendlyDefaultEvent || "30min";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href={`/grower/${slug}`}
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {grower.name}
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0 ring-4 ring-white/30">
              <Image
                src={grower.image || "/placeholder.png"}
                alt={grower.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Book an Appointment
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                with {grower.name}
              </p>
              {grower.location && (
                <p className="text-white/70 text-xs sm:text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {grower.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Appointment Types & Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Appointment Type Selection */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Select Appointment Type
                </h2>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {appointmentTypes?.map((apt, index) => (
                  <AppointmentTypeCard
                    key={`${apt.eventSlug}-${index}`}
                    appointment={apt}
                    isSelected={selectedType === apt.eventSlug}
                    onSelect={() => handleSelectType(apt.eventSlug)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Appointment Notes */}
            {calendlyData.appointmentNotes && (
              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Before Your Appointment
                      </h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        {calendlyData.appointmentNotes.split('\n').filter(Boolean).map((note, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{note.replace(/^[•\-]\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What to Expect */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-base text-foreground">
                  What to Expect
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2.5">
                  {[
                    { text: "Select a convenient time from the calendar", icon: Calendar },
                    { text: "Receive instant confirmation via email", icon: Mail },
                    { text: "Google Calendar invite with meeting link", icon: Video },
                    { text: "Easy rescheduling if plans change", icon: Clock },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/50 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Selected Meeting Type Info */}
                {selectedAppointment && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {(() => {
                          const config = MEETING_TYPE_CONFIG[selectedAppointment.meetingType];
                          const Icon = config?.icon || Video;
                          return (
                            <>
                              <Icon className={cn("w-4 h-4", config?.color || "text-blue-500")} />
                              <span>{config?.label || "Online Meeting"}</span>
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedAppointment.duration} minutes</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info - Email Only (No Phone) */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-base text-foreground">
                  Contact Information
                </h2>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {grower.contactEmail && (
                  <a 
                    href={`mailto:${grower.contactEmail}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate">{grower.contactEmail}</span>
                  </a>
                )}
                {grower.location && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>{grower.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  {grower.isVerified && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Shield className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {grower.rating && grower.rating > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {grower.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Need Help - Email Only */}
            <Card className="bg-muted/50 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Need Help?</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Have questions before booking? Send us an email.
                </p>
                {grower.contactEmail && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={`mailto:${grower.contactEmail}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Cal.com Embed */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {/* Key forces re-render when appointment type changes */}
                <CalendlyEmbed
                  key={`cal-embed-${embedKey}-${currentEventSlug}`}
                  username={calendlyData.calendlyUsername}
                  eventSlug={currentEventSlug}
                  height="650px"
                  theme={calendlyData.calcomTheme || "auto"}
                />
              </CardContent>
            </Card>

            {/* Powered by Cal.com - Subtle footer */}
            <div className="text-center mt-2">
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground inline-flex items-center gap-1 transition-colors"
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
