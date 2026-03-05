/**
 * Schema Registry Integration Tests
 * Validates the complete schema registry exported from index.ts
 * Ensures all 35 schemas are properly registered and no duplicates exist
 */

import { schemaTypes } from '../../../studio/src/schemaTypes/index';

describe('Schema Registry (schemaTypes)', () => {
  it('should export exactly 35 schemas', () => {
    expect(schemaTypes).toBeDefined();
    expect(Array.isArray(schemaTypes)).toBe(true);
    expect(schemaTypes.length).toBe(35);
  });

  it('should have no duplicate schema names', () => {
    const names = schemaTypes.map((s: any) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have no undefined or null entries', () => {
    schemaTypes.forEach((schema: any, index: number) => {
      expect(schema).toBeDefined();
      expect(schema).not.toBeNull();
      expect(schema.name).toBeDefined();
      expect(typeof schema.name).toBe('string');
    });
  });

  describe('Singleton schemas', () => {
    const singletonNames = [
      'settings',
      'siteSettings',
      'featuredProducts',
      'heroCarousel',
      'aboutPage',
      'contactPage',
    ];

    it('should include all 6 singletons', () => {
      const registeredNames = schemaTypes.map((s: any) => s.name);
      singletonNames.forEach((name) => {
        expect(registeredNames).toContain(name);
      });
    });

    it('should register singletons as document type', () => {
      singletonNames.forEach((name) => {
        const schema = schemaTypes.find((s: any) => s.name === name);
        expect(schema).toBeDefined();
        expect(schema.type).toBe('document');
      });
    });
  });

  describe('Document schemas', () => {
    const documentNames = [
      'page',
      'post',
      'blogCategory',
      'person',
      'grower',
      'faqCategory',
      'faqItem',
      'featureSection',
      'navigation',
      'store',
      'testimonial',
      'banner',
      'recipe',
      'growingGuide',
      'category',
      'product',
      'review',
      'productVariant',
      'productBundle',
      'order',
      'stockAdjustment',
      'coupon',
      'promotion',
      'emailCampaign',
      'analytics',
    ];

    it('should include all 25 document schemas', () => {
      const registeredNames = schemaTypes.map((s: any) => s.name);
      documentNames.forEach((name) => {
        expect(registeredNames).toContain(name);
      });
    });

    it('should register all documents as document type', () => {
      documentNames.forEach((name) => {
        const schema = schemaTypes.find((s: any) => s.name === name);
        expect(schema).toBeDefined();
        expect(schema.type).toBe('document');
      });
    });
  });

  describe('Object schemas', () => {
    const objectNames = ['blockContent', 'infoSection', 'callToAction', 'link'];

    it('should include all 4 object schemas', () => {
      const registeredNames = schemaTypes.map((s: any) => s.name);
      objectNames.forEach((name) => {
        expect(registeredNames).toContain(name);
      });
    });

    it('should register blockContent as array type', () => {
      const blockContent = schemaTypes.find((s: any) => s.name === 'blockContent');
      expect(blockContent).toBeDefined();
      expect(blockContent.type).toBe('array');
    });

    it('should register infoSection as object type', () => {
      const infoSection = schemaTypes.find((s: any) => s.name === 'infoSection');
      expect(infoSection).toBeDefined();
      expect(infoSection.type).toBe('object');
    });

    it('should register callToAction as object type', () => {
      const callToAction = schemaTypes.find((s: any) => s.name === 'callToAction');
      expect(callToAction).toBeDefined();
      expect(callToAction.type).toBe('object');
    });

    it('should register link as object type', () => {
      const link = schemaTypes.find((s: any) => s.name === 'link');
      expect(link).toBeDefined();
      expect(link.type).toBe('object');
    });
  });

  describe('Schema ordering in registry', () => {
    it('should list singletons first', () => {
      const names = schemaTypes.map((s: any) => s.name);
      const settingsIndex = names.indexOf('settings');
      const pageIndex = names.indexOf('page');
      expect(settingsIndex).toBeLessThan(pageIndex);
    });

    it('should list objects last', () => {
      const names = schemaTypes.map((s: any) => s.name);
      const blockContentIndex = names.indexOf('blockContent');
      const analyticsIndex = names.indexOf('analytics');
      expect(blockContentIndex).toBeGreaterThan(analyticsIndex);
    });
  });

  describe('Cross-schema reference integrity', () => {
    const referenceMap: Record<string, string[]> = {
      product: ['category', 'grower'],
      review: ['product', 'grower'],
      order: ['product'],
      productVariant: ['product'],
      productBundle: ['product', 'productVariant'],
      faqItem: ['faqCategory', 'faqItem'],
      post: ['person', 'blogCategory', 'post'],
      store: ['grower'],
      testimonial: ['product', 'grower'],
      stockAdjustment: ['product'],
      coupon: ['product', 'category'],
      promotion: ['product', 'category', 'productBundle'],
      recipe: ['person', 'product', 'recipe'],
      growingGuide: ['person', 'product', 'growingGuide', 'recipe'],
      aboutPage: ['person'],
      featuredProducts: ['product'],
      category: ['category'],
    };

    it('should have all referenced schema types registered', () => {
      const registeredNames = new Set(schemaTypes.map((s: any) => s.name));

      Object.entries(referenceMap).forEach(([schemaName, referencedTypes]) => {
        expect(registeredNames.has(schemaName)).toBe(true);
        referencedTypes.forEach((refType) => {
          expect(registeredNames.has(refType)).toBe(true);
        });
      });
    });
  });

  describe('All schemas have required properties', () => {
    it('every schema should have a name property', () => {
      schemaTypes.forEach((schema: any) => {
        expect(schema.name).toBeDefined();
        expect(typeof schema.name).toBe('string');
        expect(schema.name.length).toBeGreaterThan(0);
      });
    });

    it('every schema should have a type property', () => {
      schemaTypes.forEach((schema: any) => {
        expect(schema.type).toBeDefined();
        expect(['document', 'object', 'array']).toContain(schema.type);
      });
    });

    it('every document schema should have a title', () => {
      schemaTypes
        .filter((s: any) => s.type === 'document')
        .forEach((schema: any) => {
          expect(schema.title).toBeDefined();
          expect(typeof schema.title).toBe('string');
        });
    });

    it('every document schema should have fields array', () => {
      schemaTypes
        .filter((s: any) => s.type === 'document')
        .forEach((schema: any) => {
          expect(schema.fields).toBeDefined();
          expect(Array.isArray(schema.fields)).toBe(true);
          expect(schema.fields.length).toBeGreaterThan(0);
        });
    });

    it('every object schema should have fields array', () => {
      schemaTypes
        .filter((s: any) => s.type === 'object')
        .forEach((schema: any) => {
          expect(schema.fields).toBeDefined();
          expect(Array.isArray(schema.fields)).toBe(true);
          expect(schema.fields.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Complete schema name list', () => {
    const expectedSchemas = [
      'settings',
      'siteSettings',
      'featuredProducts',
      'heroCarousel',
      'aboutPage',
      'contactPage',
      'page',
      'post',
      'blogCategory',
      'person',
      'grower',
      'faqCategory',
      'faqItem',
      'featureSection',
      'navigation',
      'store',
      'testimonial',
      'banner',
      'recipe',
      'growingGuide',
      'category',
      'product',
      'review',
      'productVariant',
      'productBundle',
      'order',
      'stockAdjustment',
      'coupon',
      'promotion',
      'emailCampaign',
      'analytics',
      'blockContent',
      'infoSection',
      'callToAction',
      'link',
    ];

    it('should contain exactly the expected schemas', () => {
      const actual = schemaTypes.map((s: any) => s.name).sort();
      const expected = [...expectedSchemas].sort();
      expect(actual).toEqual(expected);
    });
  });
});
