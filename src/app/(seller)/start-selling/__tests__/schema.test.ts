/**
 * Tests for start-selling schema validation
 * Pure Zod schema - high branch coverage impact
 */

import { sellerApplicationSchema } from '../schema';

function createValidFile(name = 'id.jpg', type = 'image/jpeg', sizeMB = 1) {
  const content = new ArrayBuffer(sizeMB * 1024 * 1024);
  return new File([content], name, { type });
}

function validData() {
  return {
    businessName: 'MASH Market',
    businessType: 'individual' as const,
    taxId: '123456',
    fullName: 'Juan Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    address: '123 Some Street, Quezon City, Metro Manila',
    city: 'Quezon City',
    region: 'Metro Manila',
    mushroomTypes: ['oyster'],
    mushroomOther: '',
    productionCapacity: '100kg',
    certifications: 'Organic',
    validIdFile: createValidFile('id.jpg', 'image/jpeg'),
    birCertificateFile: createValidFile('bir.pdf', 'application/pdf'),
    businessCertificateFile: createValidFile('cert.png', 'image/png'),
    agreeToTerms: true,
  };
}

describe('sellerApplicationSchema', () => {
  it('should accept valid complete data', () => {
    const result = sellerApplicationSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  describe('businessName', () => {
    it('should reject empty business name', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessName: '' });
      expect(result.success).toBe(false);
    });

    it('should reject single char business name', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessName: 'A' });
      expect(result.success).toBe(false);
    });

    it('should reject business name over 24 chars', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessName: 'A'.repeat(25) });
      expect(result.success).toBe(false);
    });

    it('should accept 2-char business name', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessName: 'AB' });
      expect(result.success).toBe(true);
    });
  });

  describe('businessType', () => {
    it('should accept individual', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessType: 'individual' });
      expect(result.success).toBe(true);
    });

    it('should accept company', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessType: 'company' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid business type', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), businessType: 'partnership' });
      expect(result.success).toBe(false);
    });
  });

  describe('taxId', () => {
    it('should accept numeric tax ID', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), taxId: '999888' });
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric tax ID', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), taxId: 'ABC123' });
      expect(result.success).toBe(false);
    });

    it('should accept empty/undefined tax ID (optional)', () => {
      const data = validData();
      delete (data as any).taxId;
      const result = sellerApplicationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('email', () => {
    it('should reject invalid email', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), email: 'not-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('should accept valid PH phone 09XX format', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), phone: '09171234567' });
      expect(result.success).toBe(true);
    });

    it('should reject empty phone', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), phone: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('mushroomTypes', () => {
    it('should accept array with items', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), mushroomTypes: ['oyster', 'shiitake'] });
      expect(result.success).toBe(true);
    });

    it('should reject empty array', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), mushroomTypes: [] });
      expect(result.success).toBe(false);
    });
  });

  describe('file uploads', () => {
    it('should reject file over 5MB', () => {
      const result = sellerApplicationSchema.safeParse({
        ...validData(),
        validIdFile: createValidFile('big.jpg', 'image/jpeg', 6),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid file type', () => {
      const result = sellerApplicationSchema.safeParse({
        ...validData(),
        validIdFile: createValidFile('doc.txt', 'text/plain', 1),
      });
      expect(result.success).toBe(false);
    });

    it('should accept webp file', () => {
      const result = sellerApplicationSchema.safeParse({
        ...validData(),
        validIdFile: createValidFile('id.webp', 'image/webp', 1),
      });
      expect(result.success).toBe(true);
    });

    it('should accept pdf file', () => {
      const result = sellerApplicationSchema.safeParse({
        ...validData(),
        birCertificateFile: createValidFile('cert.pdf', 'application/pdf', 1),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('agreeToTerms', () => {
    it('should reject false terms agreement', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), agreeToTerms: false });
      expect(result.success).toBe(false);
    });
  });

  describe('address fields', () => {
    it('should reject short address', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), address: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject short city', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), city: 'Q' });
      expect(result.success).toBe(false);
    });

    it('should reject short region', () => {
      const result = sellerApplicationSchema.safeParse({ ...validData(), region: 'M' });
      expect(result.success).toBe(false);
    });
  });
});
