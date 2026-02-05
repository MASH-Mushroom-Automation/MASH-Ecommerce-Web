/**
 * Appointments Components
 * 
 * Components for Cal.com integration allowing buyers to book
 * appointments with growers/sellers.
 * 
 * Cal.com Profile: https://cal.com/mash-mushroom
 * 
 * @see .github/COMPREHENSIVE_TESTING_AND_SECURITY_PLAN.md
 */

export { CalendlyEmbed, CalComEmbed } from "./CalendlyEmbed";
export { CalendlyButton, CalComButton, AppointmentTypeCard } from "./CalendlyButton";

// Re-export Cal.com config types and utilities
export type { CalComTheme, CalComEventType } from "@/lib/calcom";
export {
  CALCOM_USERNAME,
  CALCOM_EVENT_TYPES,
  CALCOM_DEFAULT_EVENT_SLUG,
  getEventTypeBySlug,
  getDefaultEventType,
  formatDuration,
} from "@/lib/calcom";

// Types
export interface AppointmentType {
  name: string;
  eventSlug: string;
  duration: number;
  meetingType: "online" | "in-person" | "phone";
  description?: string;
  isDefault?: boolean;
}

export interface GrowerCalendlyData {
  calendlyEnabled: boolean;
  calendlyUsername?: string;
  calendlyDefaultEvent?: string;
  calcomTheme?: "light" | "dark" | "auto";
  appointmentTypes?: AppointmentType[];
  appointmentNotes?: string;
  calcomButtonText?: string;
}
