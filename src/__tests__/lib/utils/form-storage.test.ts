/**
 * Unit Tests: Form Storage Utilities
 * 
 * Tests for localStorage persistence helpers
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  saveFormData,
  getFormData,
  clearFormData,
  hasSavedFormData,
  saveCurrentStep,
  getCurrentStep,
  clearCurrentStep,
} from "@/lib/utils/form-storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Form Storage Utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("saveFormData and getFormData", () => {
    it("should save and retrieve form data", () => {
      const formData = {
        businessName: "Test Business",
        email: "test@example.com",
      };

      saveFormData(formData);
      const retrieved = getFormData();

      expect(retrieved).toEqual(formData);
    });

    it("should merge new data with existing data", () => {
      const initialData = {
        businessName: "Test Business",
      };

      const additionalData = {
        email: "test@example.com",
      };

      saveFormData(initialData);
      saveFormData(additionalData);

      const retrieved = getFormData();

      expect(retrieved).toEqual({
        businessName: "Test Business",
        email: "test@example.com",
      });
    });

    it("should return null if no data is saved", () => {
      const retrieved = getFormData();
      expect(retrieved).toBeNull();
    });
  });

  describe("clearFormData", () => {
    it("should clear saved form data", () => {
      const formData = {
        businessName: "Test Business",
      };

      saveFormData(formData);
      expect(getFormData()).toEqual(formData);

      clearFormData();
      expect(getFormData()).toBeNull();
    });
  });

  describe("hasSavedFormData", () => {
    it("should return true when data exists", () => {
      saveFormData({ businessName: "Test" });
      expect(hasSavedFormData()).toBe(true);
    });

    it("should return false when no data exists", () => {
      expect(hasSavedFormData()).toBe(false);
    });
  });

  describe("saveCurrentStep and getCurrentStep", () => {
    it("should save and retrieve current step", () => {
      saveCurrentStep(2);
      expect(getCurrentStep()).toBe(2);
    });

    it("should return 0 if no step is saved", () => {
      expect(getCurrentStep()).toBe(0);
    });
  });

  describe("clearCurrentStep", () => {
    it("should clear saved step", () => {
      saveCurrentStep(3);
      expect(getCurrentStep()).toBe(3);

      clearCurrentStep();
      expect(getCurrentStep()).toBe(0);
    });
  });
});
