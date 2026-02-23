import {
  formatPhoneNumber,
  validatePhilippinePhoneNumber,
  normalizePhoneNumber,
  maskPhoneNumber,
} from '../phone-utils';

describe('Phone Number Utilities', () => {
  describe('normalizePhoneNumber', () => {
    describe('Null Safety', () => {
      it('should return empty string for null input', () => {
        expect(normalizePhoneNumber(null as any)).toBe('');
      });

      it('should return empty string for undefined input', () => {
        expect(normalizePhoneNumber(undefined as any)).toBe('');
      });

      it('should return empty string for empty string', () => {
        expect(normalizePhoneNumber('')).toBe('');
      });

      it('should return empty string for non-string input', () => {
        expect(normalizePhoneNumber(123456789 as any)).toBe('');
      });
    });

    describe('Format Normalization', () => {
      it('should remove spaces from phone number', () => {
        expect(normalizePhoneNumber('+63 912 345 6789')).toBe('+639123456789');
      });

      it('should remove dashes from phone number', () => {
        expect(normalizePhoneNumber('+63-912-345-6789')).toBe('+639123456789');
      });

      it('should remove parentheses from phone number', () => {
        expect(normalizePhoneNumber('(09) 123-456-789')).toBe('09123456789');
      });

      it('should remove mixed formatting characters', () => {
        expect(normalizePhoneNumber('+63 (912) 345-6789')).toBe('+639123456789');
      });

      it('should trim whitespace from edges', () => {
        expect(normalizePhoneNumber('  +639123456789  ')).toBe('+639123456789');
      });

      it('should preserve + prefix', () => {
        expect(normalizePhoneNumber('+639123456789')).toBe('+639123456789');
      });

      it('should handle numbers without + prefix', () => {
        expect(normalizePhoneNumber('639123456789')).toBe('639123456789');
      });

      it('should handle local format with leading 0', () => {
        expect(normalizePhoneNumber('09123456789')).toBe('09123456789');
      });
    });
  });

  describe('formatPhoneNumber', () => {
    describe('Null Safety', () => {
      it('should return empty string for null input', () => {
        expect(formatPhoneNumber(null as any)).toBe('');
      });

      it('should return empty string for undefined input', () => {
        expect(formatPhoneNumber(undefined as any)).toBe('');
      });

      it('should return empty string for empty string', () => {
        expect(formatPhoneNumber('')).toBe('');
      });

      it('should return empty string for invalid format', () => {
        expect(formatPhoneNumber('invalid')).toBe('');
      });
    });

    describe('Format Conversion', () => {
      it('should format local with 0 prefix (09XXXXXXXXX) to E.164', () => {
        expect(formatPhoneNumber('09123456789')).toBe('+639123456789');
      });

      it('should format local without 0 (9XXXXXXXXX) to E.164', () => {
        expect(formatPhoneNumber('9123456789')).toBe('+639123456789');
      });

      it('should format international without + (63XXXXXXXXXX) to E.164', () => {
        expect(formatPhoneNumber('639123456789')).toBe('+639123456789');
      });

      it('should preserve valid E.164 format (+63XXXXXXXXXX)', () => {
        expect(formatPhoneNumber('+639123456789')).toBe('+639123456789');
      });

      it('should format with spaces to E.164', () => {
        expect(formatPhoneNumber('+63 912 345 6789')).toBe('+639123456789');
      });

      it('should format with dashes to E.164', () => {
        expect(formatPhoneNumber('09-12-34-56-789')).toBe('+639123456789');
      });

      it('should format with parentheses to E.164', () => {
        expect(formatPhoneNumber('(09) 123-456-789')).toBe('+639123456789');
      });

      it('should return empty string for too short number', () => {
        expect(formatPhoneNumber('912345')).toBe('');
      });

      it('should return empty string for too long number', () => {
        expect(formatPhoneNumber('09123456789012345')).toBe('');
      });

      it('should return empty string for wrong country code', () => {
        expect(formatPhoneNumber('+19123456789')).toBe('');
      });
    });
  });

  describe('validatePhilippinePhoneNumber', () => {
    describe('Null Safety', () => {
      it('should return false for null input', () => {
        expect(validatePhilippinePhoneNumber(null as any)).toBe(false);
      });

      it('should return false for undefined input', () => {
        expect(validatePhilippinePhoneNumber(undefined as any)).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(validatePhilippinePhoneNumber('')).toBe(false);
      });

      it('should return false for non-string input', () => {
        expect(validatePhilippinePhoneNumber(123456789 as any)).toBe(false);
      });
    });

    describe('Valid Philippine Numbers', () => {
      it('should validate Smart prefix 0813', () => {
        expect(validatePhilippinePhoneNumber('+639133456789')).toBe(true);
      });

      it('should validate Smart prefix 0905', () => {
        expect(validatePhilippinePhoneNumber('09053456789')).toBe(true);
      });

      it('should validate Smart prefix 0917', () => {
        expect(validatePhilippinePhoneNumber('9173456789')).toBe(true);
      });

      it('should validate Globe prefix 0960', () => {
        expect(validatePhilippinePhoneNumber('+639603456789')).toBe(true);
      });

      it('should validate Globe prefix 0975', () => {
        expect(validatePhilippinePhoneNumber('09753456789')).toBe(true);
      });

      it('should validate DITO prefix 0980', () => {
        expect(validatePhilippinePhoneNumber('639803456789')).toBe(true);
      });

      it('should validate DITO prefix 0999', () => {
        expect(validatePhilippinePhoneNumber('+639993456789')).toBe(true);
      });

      it('should validate with various formatting', () => {
        expect(validatePhilippinePhoneNumber('+63 917 345 6789')).toBe(true);
        expect(validatePhilippinePhoneNumber('0917-345-6789')).toBe(true);
        expect(validatePhilippinePhoneNumber('(0917) 345-6789')).toBe(true);
      });
    });

    describe('Invalid Philippine Numbers', () => {
      it('should reject invalid prefix 0900', () => {
        expect(validatePhilippinePhoneNumber('+639003456789')).toBe(false);
      });

      it('should reject invalid prefix 0800', () => {
        expect(validatePhilippinePhoneNumber('08003456789')).toBe(false);
      });

      it('should reject invalid prefix 0811', () => {
        expect(validatePhilippinePhoneNumber('8113456789')).toBe(false);
      });

      it('should reject too short number', () => {
        expect(validatePhilippinePhoneNumber('917345678')).toBe(false);
      });

      it('should reject too long number', () => {
        expect(validatePhilippinePhoneNumber('+6391734567890123')).toBe(false);
      });

      it('should reject wrong country code', () => {
        expect(validatePhilippinePhoneNumber('+19173456789')).toBe(false);
      });

      it('should reject alphabetic characters', () => {
        expect(validatePhilippinePhoneNumber('09abc456789')).toBe(false);
      });

      it('should reject special characters only', () => {
        expect(validatePhilippinePhoneNumber('***-***-****')).toBe(false);
      });
    });
  });

  describe('maskPhoneNumber', () => {
    describe('Null Safety', () => {
      it('should return empty string for null input', () => {
        expect(maskPhoneNumber(null as any)).toBe('');
      });

      it('should return empty string for undefined input', () => {
        expect(maskPhoneNumber(undefined as any)).toBe('');
      });

      it('should return empty string for empty string', () => {
        expect(maskPhoneNumber('')).toBe('');
      });

      it('should return empty string for invalid format', () => {
        expect(maskPhoneNumber('invalid')).toBe('');
      });
    });

    describe('Masking Logic', () => {
      it('should mask E.164 format showing last 2 digits', () => {
        expect(maskPhoneNumber('+639123456789')).toBe('+63 *** *** **89');
      });

      it('should mask local with 0 format showing last 2 digits', () => {
        expect(maskPhoneNumber('09123456789')).toBe('+63 *** *** **89');
      });

      it('should mask local without 0 format showing last 2 digits', () => {
        expect(maskPhoneNumber('9123456789')).toBe('+63 *** *** **89');
      });

      it('should mask international without + format showing last 2 digits', () => {
        expect(maskPhoneNumber('639123456789')).toBe('+63 *** *** **89');
      });

      it('should mask number with formatting showing last 2 digits', () => {
        expect(maskPhoneNumber('+63 912 345 6789')).toBe('+63 *** *** **89');
      });

      it('should preserve last 2 digits for verification', () => {
        expect(maskPhoneNumber('09173456734')).toBe('+63 *** *** **34');
      });

      it('should handle different last digits correctly', () => {
        expect(maskPhoneNumber('+639999999900')).toBe('+63 *** *** **00');
        expect(maskPhoneNumber('+639999999999')).toBe('+63 *** *** **99');
      });

      it('should return empty string for invalid input after formatting attempt', () => {
        expect(maskPhoneNumber('123')).toBe('');
        expect(maskPhoneNumber('invalid phone')).toBe('');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should normalize, format, validate, and mask a complete flow', () => {
      const input = '  (09) 17-345-6789  ';
      
      // Step 1: Normalize
      const normalized = normalizePhoneNumber(input);
      expect(normalized).toBe('09173456789');
      
      // Step 2: Format
      const formatted = formatPhoneNumber(normalized);
      expect(formatted).toBe('+639173456789');
      
      // Step 3: Validate
      const isValid = validatePhilippinePhoneNumber(formatted);
      expect(isValid).toBe(true);
      
      // Step 4: Mask
      const masked = maskPhoneNumber(formatted);
      expect(masked).toBe('+63 *** *** **89');
    });

    it('should handle edge case with all functions (short invalid number)', () => {
      const input = '123';
      
      const normalized = normalizePhoneNumber(input);
      expect(normalized).toBe('123');
      
      const formatted = formatPhoneNumber(normalized);
      expect(formatted).toBe('');
      
      const isValid = validatePhilippinePhoneNumber(normalized);
      expect(isValid).toBe(false);
      
      const masked = maskPhoneNumber(normalized);
      expect(masked).toBe('');
    });

    it('should handle all valid PH prefix ranges', () => {
      const validPrefixes = [
        '0813', '0819', // Smart 0810 range
        '0905', '0906', '0909', // Smart 0900 range
        '0917', '0918', // Smart 0910 range
        '0920', '0929', // Smart 0920 range
        '0930', '0939', // Smart 0930 range
        '0940', '0949', // Smart 0940 range
        '0950', '0959', // Smart 0950 range
        '0960', '0969', // Globe 0960 range
        '0975', '0977', // Globe 0970 range
        '0980', '0989', // DITO 0980 range
        '0995', '0999', // DITO 0990 range
      ];

      validPrefixes.forEach(prefix => {
        const phone = `${prefix}1234567`;
        expect(validatePhilippinePhoneNumber(phone)).toBe(true);
      });
    });
  });
});
