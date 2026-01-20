"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Video, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppointmentType {
  name: string;
  eventSlug: string;
  duration: number;
  meetingType: "online" | "in-person" | "phone";
  description?: string;
  isDefault?: boolean;
}

interface CalendlyButtonProps {
  /** Grower's slug for the booking page URL */
  growerSlug: string;
  /** Grower's display name */
  growerName: string;
  /** Whether appointments are enabled */
  calendlyEnabled?: boolean;
  /** Available appointment types */
  appointmentTypes?: AppointmentType[];
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg";
  /** Additional classes */
  className?: string;
  /** Show full button or compact icon */
  compact?: boolean;
}

/**
 * CalendlyButton - Button to navigate to grower's booking page
 * 
 * Use this on grower profile pages and product pages to allow
 * buyers to book appointments with growers.
 * 
 * @example
 * ```tsx
 * <CalendlyButton 
 *   growerSlug="mushroom-automation"
 *   growerName="MASH Mushroom Automation"
 *   calendlyEnabled={true}
 * />
 * ```
 */
export function CalendlyButton({
  growerSlug,
  growerName,
  calendlyEnabled = false,
  appointmentTypes = [],
  variant = "default",
  size = "default",
  className = "",
  compact = false,
}: CalendlyButtonProps) {
  // Don't render if appointments not enabled
  if (!calendlyEnabled) {
    return null;
  }

  // Get the default or first appointment type
  const defaultAppointment =
    appointmentTypes.find((apt) => apt.isDefault) || appointmentTypes[0];

  const getMeetingIcon = (type?: string) => {
    switch (type) {
      case "online":
        return <Video className="w-4 h-4" />;
      case "in-person":
        return <MapPin className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <Link href={`/grower/${growerSlug}/book`}>
        <Button
          variant={variant}
          size="icon"
          className={cn("rounded-full", className)}
          title={`Book appointment with ${growerName}`}
        >
          <Calendar className="w-4 h-4" />
        </Button>
      </Link>
    );
  }

  return (
    <Link href={`/grower/${growerSlug}/book`}>
      <Button variant={variant} size={size} className={cn("gap-2", className)}>
        {getMeetingIcon(defaultAppointment?.meetingType)}
        <span>Book Appointment</span>
        {defaultAppointment && (
          <span className="text-xs opacity-80">
            ({defaultAppointment.duration} min)
          </span>
        )}
      </Button>
    </Link>
  );
}

/**
 * AppointmentTypeCard - Card for selecting appointment type
 */
interface AppointmentTypeCardProps {
  appointment: AppointmentType;
  isSelected?: boolean;
  onSelect?: (appointment: AppointmentType) => void;
}

export function AppointmentTypeCard({
  appointment,
  isSelected = false,
  onSelect,
}: AppointmentTypeCardProps) {
  const getMeetingIcon = () => {
    switch (appointment.meetingType) {
      case "online":
        return <Video className="w-5 h-5 text-blue-500" />;
      case "in-person":
        return <MapPin className="w-5 h-5 text-green-500" />;
      case "phone":
        return <Phone className="w-5 h-5 text-orange-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMeetingLabel = () => {
    switch (appointment.meetingType) {
      case "online":
        return "Online Meeting";
      case "in-person":
        return "Store Visit";
      case "phone":
        return "Phone Call";
      default:
        return "Appointment";
    }
  };

  return (
    <button
      onClick={() => onSelect?.(appointment)}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all",
        "hover:border-primary hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-muted">{getMeetingIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{appointment.name}</h4>
            {appointment.isDefault && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Recommended
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{appointment.duration} minutes</span>
            <span>•</span>
            <span>{getMeetingLabel()}</span>
          </div>
          {appointment.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {appointment.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default CalendlyButton;
