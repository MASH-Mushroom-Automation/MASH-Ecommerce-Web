"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Seller,
  AppointmentBooking,
  AppointmentResponse,
  SellerMatchRequest,
  TimeSlot,
} from "@/components/appointments/types";

const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  "http://localhost:5678/webhook/mash-appointments";

export function useAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Find matching sellers based on product type, quantity, and location
   * Uses n8n webhook to call Ollama AI for intelligent matching
   */
  const findMatchingSellers = useCallback(
    async (request: SellerMatchRequest): Promise<Seller[]> => {
      setLoading(true);
      setError(null);

      try {
        // Call n8n webhook with action: find_sellers
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "find_sellers",
            productType: request.productType,
            quantity: request.quantity,
            buyerLocation: request.buyerLocation,
            preferredDate: request.preferredDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to find matching sellers");
        }

        const data = await response.json();

        // Expected response: { sellers: Seller[] }
        return data.sellers || [];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to find sellers";
        setError(message);
        console.error("Error finding sellers:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get available time slots for a specific seller
   * Fetches from Firebase availability_slots collection via n8n
   */
  const getAvailableSlots = useCallback(
    async (sellerId: string, numDays = 7): Promise<TimeSlot[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_availability",
            sellerId,
            numDays,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }

        const data = await response.json();
        return data.slots || [];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch availability";
        setError(message);
        console.error("Error fetching availability:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Book an appointment with a seller
   * Calls n8n webhook with set_appointment action
   */
  const bookAppointment = useCallback(
    async (booking: AppointmentBooking): Promise<AppointmentResponse> => {
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to book an appointment",
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "set_appointment",
            ...booking,
            buyerUid: user.uid,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to book appointment");
        }

        const data = await response.json();

        return {
          success: true,
          appointmentId: data.appointmentId,
          message: "Appointment booked successfully!",
          emailSent: data.emailSent,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to book appointment";
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Cancel an appointment
   */
  const cancelAppointment = useCallback(
    async (appointmentId: string): Promise<AppointmentResponse> => {
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to cancel an appointment",
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "cancel_appointment",
            appointmentId,
            buyerUid: user.uid,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to cancel appointment");
        }

        return {
          success: true,
          message: "Appointment cancelled successfully",
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to cancel appointment";
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Get user's appointments
   */
  const getUserAppointments = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_appointments",
          buyerUid: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      return data.appointments || [];
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch appointments";
      setError(message);
      console.error("Error fetching appointments:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    findMatchingSellers,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    getUserAppointments,
  };
}
