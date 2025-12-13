/**
 * Local Storage Helper for Seller Registration Form
 * 
 * Provides utilities for persisting and retrieving form state
 * across steps and browser sessions
 */

import { SellerRegistrationFormData } from "@/lib/validations/seller-registration";

const STORAGE_KEY = "mash_seller_registration_draft";
const STORAGE_TIMESTAMP_KEY = "mash_seller_registration_timestamp";
const STORAGE_EXPIRY_DAYS = 7; // Form data expires after 7 days

/**
 * Save form data to localStorage
 */
export const saveFormData = (data: Partial<SellerRegistrationFormData>): void => {
  try {
    const existingData = getFormData();
    const mergedData = { ...existingData, ...data };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    console.error("Failed to save form data to localStorage:", error);
  }
};

/**
 * Retrieve form data from localStorage
 */
export const getFormData = (): Partial<SellerRegistrationFormData> | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    // Check if data has expired
    if (timestamp) {
      const savedDate = new Date(timestamp);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - STORAGE_EXPIRY_DAYS);
      
      if (savedDate < expiryDate) {
        clearFormData();
        return null;
      }
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to retrieve form data from localStorage:", error);
    return null;
  }
};

/**
 * Clear form data from localStorage
 */
export const clearFormData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Failed to clear form data from localStorage:", error);
  }
};

/**
 * Check if there's saved form data
 */
export const hasSavedFormData = (): boolean => {
  try {
    const data = getFormData();
    return data !== null && Object.keys(data).length > 0;
  } catch {
    return false;
  }
};

/**
 * Get the timestamp when form data was last saved
 */
export const getLastSavedTimestamp = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
};

/**
 * Save current step progress
 */
export const saveCurrentStep = (step: number): void => {
  try {
    localStorage.setItem("mash_seller_registration_step", step.toString());
  } catch (error) {
    console.error("Failed to save current step:", error);
  }
};

/**
 * Get saved step progress
 */
export const getCurrentStep = (): number => {
  try {
    const step = localStorage.getItem("mash_seller_registration_step");
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * Clear step progress
 */
export const clearCurrentStep = (): void => {
  try {
    localStorage.removeItem("mash_seller_registration_step");
  } catch (error) {
    console.error("Failed to clear current step:", error);
  }
};
