import { z } from "zod";

export const sellerApplicationSchema = z.object({
  // Business Information
  businessName: z
    .string()
    .min(2, "Business name is required")
    .max(24, "Business name must be 24 characters or less"),
  businessType: z.enum(["individual", "company"], {
    message: "Please select a business type",
  }),
  taxId: z
    .string()
    .optional()
    .refine((val) => (val ? /^\d+$/.test(val) : true), {
      message: "Tax ID must contain numbers only",
    }),

  // Contact Details
  fullName: z
    .string()
    .min(2, "Full name is required")
    .max(24, "Full name must be 24 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(09|\+639)\d{9}$/,
      "Please enter a valid Philippine phone number (e.g., 09123456789 or +639123456789)"
    ),
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),

  // Product Information
  mushroomTypes: z
    .array(z.string())
    .min(1, "Select at least one mushroom type"),
  mushroomOther: z.string().optional(),
  productionCapacity: z.string().min(1, "Production capacity is required"),
  certifications: z.string().optional(),

  // Document Uploads
  validIdFile: z
    .instanceof(File, { message: "Valid ID is required" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type
        ),
      "Only JPG, PNG, WebP, or PDF files are allowed"
    ),
  birCertificateFile: z
    .instanceof(File, { message: "BIR Certificate is required" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type
        ),
      "Only JPG, PNG, WebP, or PDF files are allowed"
    ),
  businessCertificateFile: z
    .instanceof(File, { message: "Business Certificate is required" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type
        ),
      "Only JPG, PNG, WebP, or PDF files are allowed"
    ),

  // Terms
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to the terms and conditions"
    ),
});

export type SellerApplicationForm = z.infer<typeof sellerApplicationSchema>;
