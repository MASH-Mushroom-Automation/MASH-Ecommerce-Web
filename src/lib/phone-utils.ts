/**
 * Phone Number Validation Utilities for Philippine Mobile Numbers
 * 
 * Provides functions for formatting, validating, normalizing, and masking
 * Philippine phone numbers with support for multiple input formats.
 * 
 * Supported formats:
 * - E.164: +63XXXXXXXXXX (13 chars)
 * - International: 63XXXXXXXXXX (12 chars)
 * - Local with 0: 09XXXXXXXXX (11 chars)
 * - Local without 0: 9XXXXXXXXX (10 chars)
 * 
 * Valid PH mobile prefixes: 0813-0819, 0905-0906, 0907-0909, 0910-0919,
 * 0920-0929, 0930-0939, 0940-0949, 0950-0959, 0960-0969, 0970-0979,
 * 0980-0989, 0990-0999
 */

/**
 * Valid Philippine mobile number prefixes (without the leading 0)
 */
const VALID_PH_PREFIXES = [
  // Smart Communications prefixes
  '813', '814', '815', '816', '817', '818', '819',
  '905', '906', '907', '908', '909',
  '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
  '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
  '930', '931', '932', '933', '934', '935', '936', '937', '938', '939',
  '940', '941', '942', '943', '944', '945', '946', '947', '948', '949',
  '950', '951', '952', '953', '954', '955', '956', '957', '958', '959',
  // Globe Telecom prefixes
  '960', '961', '962', '963', '964', '965', '966', '967', '968', '969',
  '970', '971', '972', '973', '974', '975', '976', '977', '978', '979',
  // DITO Telecommunity prefixes
  '980', '981', '982', '983', '984', '985', '986', '987', '988', '989',
  '990', '991', '992', '993', '994', '995', '996', '997', '998', '999'
];

/**
 * Normalize phone number by removing all formatting characters
 * (spaces, dashes, parentheses) while preserving digits and the + prefix.
 * 
 * @param input - Phone number string to normalize
 * @returns Normalized phone number with only digits and optional + prefix
 * 
 * @example
 * normalizePhoneNumber('+63 912 345 6789') // '+63912345678'
 * normalizePhoneNumber('(09) 123-45-678') // '09123456789'
 * normalizePhoneNumber('   +63-912-345-6789   ') // '+63912345678'
 */
export function normalizePhoneNumber(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace and remove all non-digit characters except +
  return input.trim().replace(/[^\d+]/g, '');
}

/**
 * Format phone number to E.164 international format: +63XXXXXXXXXX
 * 
 * Accepts multiple input formats and converts them to standardized E.164.
 * Handles gracefully: null, undefined, empty strings, and invalid formats.
 * 
 * @param input - Phone number in any supported format
 * @returns E.164 formatted phone number (+63XXXXXXXXXX) or empty string if invalid
 * 
 * @example
 * formatPhoneNumber('09123456789') // '+639123456789'
 * formatPhoneNumber('9123456789') // '+639123456789'
 * formatPhoneNumber('639123456789') // '+639123456789'
 * formatPhoneNumber('+63 912 345 6789') // '+639123456789'
 * formatPhoneNumber('invalid') // ''
 */
export function formatPhoneNumber(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Normalize first
  const normalized = normalizePhoneNumber(input);
  
  if (!normalized) {
    return '';
  }

  // Handle different input formats
  let digits = normalized;

  // Remove + prefix if present
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // Convert to format: 63XXXXXXXXXX
  if (digits.startsWith('639') && digits.length === 12) {
    // Already in 63XXXXXXXXXX format
    return `+${digits}`;
  } else if (digits.startsWith('09') && digits.length === 11) {
    // Convert 09XXXXXXXXX to 639XXXXXXXXX
    return `+63${digits.substring(1)}`;
  } else if (digits.startsWith('9') && digits.length === 10) {
    // Convert 9XXXXXXXXX to 639XXXXXXXXX
    return `+63${digits}`;
  } else if (digits.startsWith('63') && digits.length === 12) {
    // Add + prefix to 63XXXXXXXXXX
    return `+${digits}`;
  }

  // Invalid format
  return '';
}

/**
 * Validate if phone number is a valid Philippine mobile number.
 * 
 * Checks:
 * 1. Non-empty and valid string
 * 2. Length is between 10-13 characters
 * 3. Starts with valid prefix after normalization
 * 4. All characters after prefix are digits
 * 5. Prefix matches valid PH mobile prefixes
 * 
 * @param phone - Phone number to validate
 * @returns true if valid Philippine mobile number, false otherwise
 * 
 * @example
 * validatePhilippinePhoneNumber('+639123456789') // true
 * validatePhilippinePhoneNumber('09123456789') // true
 * validatePhilippinePhoneNumber('9123456789') // true
 * validatePhilippinePhoneNumber('+639999999999') // true
 * validatePhilippinePhoneNumber('+639000000000') // false (invalid prefix)
 * validatePhilippinePhoneNumber('123') // false (too short)
 */
export function validatePhilippinePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Normalize the phone number
  const normalized = normalizePhoneNumber(phone);

  // Check length (10-13 chars for various formats)
  if (normalized.length < 10 || normalized.length > 13) {
    return false;
  }

  // Format to E.164
  const formatted = formatPhoneNumber(normalized);

  // If formatting failed, number is invalid
  if (!formatted) {
    return false;
  }

  // Extract the mobile prefix (3 digits after country code 63)
  // E.164 format: +63XXXXXXXXXX, so prefix is at positions 3-5
  const prefix = formatted.substring(3, 6);

  // Validate prefix against known valid Philippine mobile prefixes
  return VALID_PH_PREFIXES.includes(prefix);
}

/**
 * Mask phone number for privacy, showing only last 2 digits.
 * 
 * Format: +63 *** *** **34
 * 
 * Preserves country code and displays last 2 digits for verification.
 * Invalid or empty inputs return empty string.
 * 
 * @param phone - Phone number to mask
 * @returns Masked phone number or empty string if invalid
 * 
 * @example
 * maskPhoneNumber('+639123456789') // '+63 *** *** **89'
 * maskPhoneNumber('09123456789') // '+63 *** *** **89'
 * maskPhoneNumber('invalid') // ''
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Format to E.164 first to ensure valid input
  const formatted = formatPhoneNumber(phone);

  if (!formatted) {
    return '';
  }

  // E.164 format: +63XXXXXXXXXX (13 chars)
  // Extract last 2 digits
  const lastTwo = formatted.slice(-2);

  // Return masked format: +63 *** *** **34
  return `+63 *** *** **${lastTwo}`;
}
