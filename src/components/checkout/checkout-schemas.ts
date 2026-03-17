import { z } from "zod";

export const step1Schema = z.object({
  deliveryMethod: z.enum(["pickup", "lalamove"]),
  pickupLocation: z.string().optional(),
});

export const step2Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+63|0)?[0-9]{10,11}$/,
      "Please enter a valid Philippine phone number (e.g., 09171234567 or +639171234567)"
    )
    .transform((val) => val.replace(/[\s\-()]/g, "")),
});

export const step3Schema = z.object({
  paymentMethod: z.enum(["cod", "gcash", "grab_pay", "card", "paymaya"]),
});

export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
export type Step3FormValues = z.infer<typeof step3Schema>;
