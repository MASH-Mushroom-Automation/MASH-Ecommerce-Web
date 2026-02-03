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
  Star,
  Shield,
  MessageCircle,
} from "lucide-react";
import { useSanityGrower } from "@/hooks/useSanityGrowers";
import { CalendlyEmbed } from "@/components/appointments";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    meetingType: "online" | "in-person" | "phone";
    description?: string;
    isDefault?: boolean;
  }>;
  appointmentNotes?: string;
}

// Meeting type configuration
const MEETING_TYPE_CONFIG = {
  online: {
    icon: Video,
    label: "Online Meeting",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  "in-person": {
    icon: MapPin,
    label: "Store Visit",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/50",
  },
  phone: {
    icon: Phone,
    label: "Phone Call",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
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
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {appointment.name}
            </h3>
            {appointment.isDefault && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {appointment.duration} minutes
            </span>
            <span>•</span>
            <span>{config.label}</span>
          </div>
          {appointment.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {appointment.description}
            </p>
          )}
        </div>
        {isSelected && (
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
        )}
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
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const appointmentTypes = calendlyData.appointmentTypes || [];
  const currentEventSlug = selectedType || calendlyData.calendlyDefaultEvent || "30min";
  const selectedAppointment = appointmentTypes.find(t => t.eventSlug === currentEventSlug);

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
            {appointmentTypes.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Select Appointment Type
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointmentTypes.map((apt, index) => (
                    <AppointmentTypeCard
                      key={`${apt.eventSlug}-${index}`}
                      appointment={apt}
                      isSelected={selectedType === apt.eventSlug}
                      onSelect={() => setSelectedType(apt.eventSlug)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

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
            <Card>
              <CardHeader className="pb-4">
                <h2 className="font-semibold text-lg text-foreground">
                  What to Expect
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    { text: "Select a convenient time from the calendar", icon: Calendar },
                    { text: "Receive instant confirmation via email", icon: Mail },
                    { text: "Google Calendar invite with meeting link", icon: Video },
                    { text: "Easy rescheduling if plans change", icon: Clock },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Selected Meeting Type Info */}
                {selectedAppointment && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedAppointment.duration} minutes</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Grower Contact Info */}
            <Card>
              <CardHeader className="pb-4">
                <h2 className="font-semibold text-lg text-foreground">
                  Contact Information
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
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
                {grower.contactPhone && (
                  <a 
                    href={`tel:${grower.contactPhone}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{grower.contactPhone}</span>
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
                
                {grower.isVerified && (
                  <div className="pt-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <Shield className="w-3 h-3" />
                      Verified Seller
                    </Badge>
                  </div>
                )}

                {grower.rating && grower.rating > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{grower.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">rating</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-muted/50">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Need Help?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Have questions before booking? Reach out directly.
                </p>
                <div className="flex gap-2">
                  {grower.contactEmail && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={`mailto:${grower.contactEmail}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  {grower.contactPhone && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={`tel:${grower.contactPhone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Cal.com Embed */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Select a Date & Time
                    </h2>
                    {selectedAppointment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAppointment.name} • {selectedAppointment.duration} minutes
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={`https://cal.com/${calendlyData.calendlyUsername}/${currentEventSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Cal.com
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CalendlyEmbed
                  username={calendlyData.calendlyUsername}
                  eventSlug={currentEventSlug}
                  height="700px"
                  theme={calendlyData.calcomTheme || "auto"}
                />
              </CardContent>
            </Card>

            {/* Powered by Cal.com */}
            <div className="text-center mt-4">
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
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
