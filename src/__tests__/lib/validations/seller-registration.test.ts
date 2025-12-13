/**
 * Unit Tests: Seller Registration Validation Schemas
 * 
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  businessInfoSchema,
  contactInfoSchema,
  taxLegalInfoSchema,
  termsConditionsSchema,
} from "@/lib/validations/seller-registration";

describe("Seller Registration Validation Schemas", () => {
  describe("businessInfoSchema", () => {
    it("should validate correct business information", () => {
      const validData = {
        businessName: "Fresh Harvest Farms",
        businessDescription: "We grow fresh organic mushrooms using sustainable farming practices",
        businessCategory: "mushroom_cultivation",
        businessType: "sole_proprietor" as const,
        establishedYear: "2020",
      };

      const result = businessInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject business name that is too short", () => {
      const invalidData = {
        businessName: "A",
        businessDescription: "We grow fresh organic mushrooms",
        businessCategory: "mushroom_cultivation",
        businessType: "individual" as const,
      };

      const result = businessInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid business category", () => {
      const invalidData = {
        businessName: "Fresh Harvest",
        businessDescription: "We grow fresh organic mushrooms",
        businessCategory: "",
        businessType: "individual" as const,
      };

      const result = businessInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description that is too short", () => {
      const invalidData = {
        businessName: "Fresh Harvest",
        businessDescription: "Short desc",
        businessCategory: "mushroom_cultivation",
        businessType: "individual" as const,
      };

      const result = businessInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept optional established year", () => {
      const validData = {
        businessName: "Fresh Harvest Farms",
        businessDescription: "We grow fresh organic mushrooms using sustainable practices",
        businessCategory: "mushroom_cultivation",
        businessType: "individual" as const,
        establishedYear: "",
      };

      const result = businessInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("contactInfoSchema", () => {
    it("should validate correct contact information", () => {
      const validData = {
        contactPersonName: "Juan Dela Cruz",
        email: "juan@example.com",
        phoneNumber: "09123456789",
        alternativePhone: "",
        businessAddress: {
          street: "123 Main Street",
          barangay: "San Jose",
          city: "Quezon City",
          province: "Metro Manila",
          region: "ncr",
          postalCode: "1100",
        },
      };

      const result = contactInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should normalize phone number format", () => {
      const data = {
        contactPersonName: "Juan Dela Cruz",
        email: "juan@example.com",
        phoneNumber: "09123456789",
        alternativePhone: "",
        businessAddress: {
          street: "123 Main Street",
          barangay: "San Jose",
          city: "Quezon City",
          province: "Metro Manila",
          region: "ncr",
          postalCode: "",
        },
      };

      const result = contactInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phoneNumber).toBe("+639123456789");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        contactPersonName: "Juan Dela Cruz",
        email: "invalid-email",
        phoneNumber: "09123456789",
        businessAddress: {
          street: "123 Main Street",
          barangay: "San Jose",
          city: "Quezon City",
          province: "Metro Manila",
          region: "ncr",
        },
      };

      const result = contactInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone number", () => {
      const invalidData = {
        contactPersonName: "Juan Dela Cruz",
        email: "juan@example.com",
        phoneNumber: "1234",
        businessAddress: {
          street: "123 Main Street",
          barangay: "San Jose",
          city: "Quezon City",
          province: "Metro Manila",
          region: "ncr",
        },
      };

      const result = contactInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("taxLegalInfoSchema", () => {
    it("should validate correct tax and legal information", () => {
      const validData = {
        taxIdNumber: "123-456-789-000",
        dtiRegistrationNumber: "DTI12345",
        secRegistrationNumber: "",
        businessPermitNumber: "BP-2024-001",
        bankAccountName: "Fresh Harvest Farms",
        bankName: "BDO",
        bankAccountNumber: "1234567890",
      };

      const result = taxLegalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept all optional fields as empty", () => {
      const validData = {
        taxIdNumber: "",
        dtiRegistrationNumber: "",
        secRegistrationNumber: "",
        businessPermitNumber: "",
        bankAccountName: "",
        bankName: "",
        bankAccountNumber: "",
      };

      const result = taxLegalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid TIN format", () => {
      const invalidData = {
        taxIdNumber: "123456789",
        dtiRegistrationNumber: "",
        secRegistrationNumber: "",
        businessPermitNumber: "",
        bankAccountName: "",
        bankName: "",
        bankAccountNumber: "",
      };

      const result = taxLegalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("termsConditionsSchema", () => {
    it("should validate when all terms are accepted", () => {
      const validData = {
        agreeToTerms: true,
        agreeToSellerPolicy: true,
        agreeToPrivacyPolicy: true,
        acknowledgeDataAccuracy: true,
      };

      const result = termsConditionsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when terms are not accepted", () => {
      const invalidData = {
        agreeToTerms: false,
        agreeToSellerPolicy: true,
        agreeToPrivacyPolicy: true,
        acknowledgeDataAccuracy: true,
      };

      const result = termsConditionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
