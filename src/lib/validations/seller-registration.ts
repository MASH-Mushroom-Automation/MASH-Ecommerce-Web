/**
 * Seller Registration Validation Schemas
 * 
 * Multi-step form validation for seller registration flow
 * Using Zod for type-safe validation
 */

import { z } from "zod";

// Step 1: Business Information Schema
export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-&.,']+$/,
      "Business name can only contain letters, numbers, spaces, and common punctuation"
    ),
  
  businessDescription: z
    .string()
    .min(20, "Please provide a description of at least 20 characters")
    .max(500, "Description must be less than 500 characters"),
  
  businessCategory: z
    .string()
    .min(1, "Please select a business category"),
  
  businessType: z.enum(["individual", "sole_proprietor", "partnership", "corporation"]),
  
  establishedYear: z
    .string()
    .regex(/^\d{4}$/, "Please enter a valid year")
    .refine(
      (year) => {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        return yearNum >= 1900 && yearNum <= currentYear;
      },
      "Please enter a valid year between 1900 and current year"
    )
    .optional()
    .or(z.literal("")),
});

// Step 2: Contact Information Schema
export const contactInfoSchema = z.object({
  contactPersonName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase(),
  
  phoneNumber: z
    .string()
    .regex(
      /^(\+63|0)?9\d{9}$/,
      "Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)"
    )
    .transform((val) => {
      // Normalize to +639XXXXXXXXX format
      if (val.startsWith("0")) {
        return `+63${val.slice(1)}`;
      }
      if (!val.startsWith("+")) {
        return `+63${val}`;
      }
      return val;
    }),
  
  alternativePhone: z
    .string()
    .regex(
      /^(\+63|0)?9\d{9}$/,
      "Please enter a valid Philippine mobile number"
    )
    .transform((val) => {
      if (val.startsWith("0")) {
        return `+63${val.slice(1)}`;
      }
      if (!val.startsWith("+")) {
        return `+63${val}`;
      }
      return val;
    })
    .optional()
    .or(z.literal("")),
  
  businessAddress: z.object({
    street: z.string().min(5, "Street address is required"),
    barangay: z.string().min(2, "Barangay is required"),
    city: z.string().min(2, "City is required"),
    province: z.string().min(2, "Province is required"),
    region: z.string().min(1, "Please select a region"),
    postalCode: z.string().regex(/^\d{4}$/, "Postal code must be 4 digits").optional().or(z.literal("")),
  }),
});

// Step 3: Tax & Legal Information Schema
export const taxLegalInfoSchema = z.object({
  taxIdNumber: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{3}-\d{3}$/, "TIN must be in format XXX-XXX-XXX-XXX")
    .optional()
    .or(z.literal("")),
  
  dtiRegistrationNumber: z
    .string()
    .min(5, "DTI registration number is required for sole proprietors")
    .optional()
    .or(z.literal("")),
  
  secRegistrationNumber: z
    .string()
    .min(5, "SEC registration number is required for corporations")
    .optional()
    .or(z.literal("")),
  
  businessPermitNumber: z
    .string()
    .min(5, "Business permit number is required")
    .optional()
    .or(z.literal("")),
  
  bankAccountName: z
    .string()
    .min(2, "Account name is required for payouts")
    .optional()
    .or(z.literal("")),
  
  bankName: z
    .string()
    .min(2, "Bank name is required")
    .optional()
    .or(z.literal("")),
  
  bankAccountNumber: z
    .string()
    .regex(/^\d{10,16}$/, "Please enter a valid bank account number")
    .optional()
    .or(z.literal("")),
});

// Step 4: Terms & Conditions Schema
export const termsConditionsSchema = z.object({
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the Terms of Service",
    }),
  
  agreeToSellerPolicy: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the Seller Policy",
    }),
  
  agreeToPrivacyPolicy: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the Privacy Policy",
    }),
  
  acknowledgeDataAccuracy: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must acknowledge that all information provided is accurate",
    }),
});

// Combined Schema for Full Form
export const sellerRegistrationSchema = z.object({
  ...businessInfoSchema.shape,
  ...contactInfoSchema.shape,
  ...taxLegalInfoSchema.shape,
  ...termsConditionsSchema.shape,
});

// Type Inference
export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type TaxLegalInfoFormData = z.infer<typeof taxLegalInfoSchema>;
export type TermsConditionsFormData = z.infer<typeof termsConditionsSchema>;
export type SellerRegistrationFormData = z.infer<typeof sellerRegistrationSchema>;

// Business Categories
export const BUSINESS_CATEGORIES = [
  { value: "fresh_produce", label: "Fresh Produce & Vegetables" },
  { value: "mushroom_cultivation", label: "Mushroom Cultivation" },
  { value: "organic_farming", label: "Organic Farming" },
  { value: "hydroponics", label: "Hydroponics & Aquaponics" },
  { value: "dried_goods", label: "Dried Goods & Preserved Foods" },
  { value: "herbs_spices", label: "Herbs & Spices" },
  { value: "fermented_foods", label: "Fermented Foods" },
  { value: "farm_equipment", label: "Farm Equipment & Supplies" },
  { value: "seeds_seedlings", label: "Seeds & Seedlings" },
  { value: "other", label: "Other" },
] as const;

// Philippine Regions
export const PHILIPPINE_REGIONS = [
  { value: "ncr", label: "National Capital Region (NCR)" },
  { value: "car", label: "Cordillera Administrative Region (CAR)" },
  { value: "region_1", label: "Region I - Ilocos Region" },
  { value: "region_2", label: "Region II - Cagayan Valley" },
  { value: "region_3", label: "Region III - Central Luzon" },
  { value: "region_4a", label: "Region IV-A - CALABARZON" },
  { value: "region_4b", label: "Region IV-B - MIMAROPA" },
  { value: "region_5", label: "Region V - Bicol Region" },
  { value: "region_6", label: "Region VI - Western Visayas" },
  { value: "region_7", label: "Region VII - Central Visayas" },
  { value: "region_8", label: "Region VIII - Eastern Visayas" },
  { value: "region_9", label: "Region IX - Zamboanga Peninsula" },
  { value: "region_10", label: "Region X - Northern Mindanao" },
  { value: "region_11", label: "Region XI - Davao Region" },
  { value: "region_12", label: "Region XII - SOCCSKSARGEN" },
  { value: "region_13", label: "Region XIII - Caraga" },
  { value: "barmm", label: "BARMM - Bangsamoro Autonomous Region" },
] as const;
