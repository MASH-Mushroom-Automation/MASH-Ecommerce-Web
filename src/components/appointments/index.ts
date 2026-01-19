/**
 * Appointments Components
 * 
 * Components for Calendly integration allowing buyers to book
 * appointments with growers/sellers.
 * 
 * Live Example: https://calendly.com/mash-mushroom-automation/30min
 * 
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md
 */

export { CalendlyEmbed } from "./CalendlyEmbed";
export { CalendlyButton, AppointmentTypeCard } from "./CalendlyButton";

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
  appointmentTypes?: AppointmentType[];
  appointmentNotes?: string;
}
