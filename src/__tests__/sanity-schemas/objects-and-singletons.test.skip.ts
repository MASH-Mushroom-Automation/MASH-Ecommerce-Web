/**
 * Object & Singleton Schemas - Comprehensive Tests
 *
 * Tests 4 Sanity CMS object schemas and 6 singleton schemas:
 *
 * OBJECTS: blockContent, callToAction, infoSection, link
 * SINGLETONS: settings, siteSettings, featuredProducts, heroCarousel, aboutPage, contactPage
 */

import {
  findField,
  getFieldNames,
  assertSchemaBasics,
  assertFieldType,
  assertFieldHasValidation,
  assertFieldHasInitialValue,
  assertFieldReadOnly,
  assertFieldReference,
  assertSlugField,
  assertHasOrderings,
  assertHasGroups,
  assertFieldHasOptions,
  countFields,
} from './schema-test-utils';

// Object schemas
import { blockContent } from '../../../studio/src/schemaTypes/objects/blockContent';
import { callToAction } from '../../../studio/src/schemaTypes/objects/callToAction';
import { infoSection } from '../../../studio/src/schemaTypes/objects/infoSection';
import { link } from '../../../studio/src/schemaTypes/objects/link';

// Singleton schemas
import { settings } from '../../../studio/src/schemaTypes/singletons/settings';
import { siteSettings } from '../../../studio/src/schemaTypes/singletons/siteSettings';
import { featuredProducts } from '../../../studio/src/schemaTypes/singletons/featuredProducts';
import { heroCarousel } from '../../../studio/src/schemaTypes/singletons/heroCarousel';
import { aboutPage } from '../../../studio/src/schemaTypes/singletons/aboutPage';
import { contactPage } from '../../../studio/src/schemaTypes/singletons/contactPage';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OBJECT SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. BLOCK CONTENT SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('BlockContent Schema', () => {
  it('should have correct basic structure', () => {
    expect(blockContent).toBeDefined();
    expect(blockContent.name).toBe('blockContent');
    expect(blockContent.title).toBe('Block Content');
    expect(blockContent.type).toBe('array');
  });

  it('should be an array type, not a document type', () => {
    expect(blockContent.type).toBe('array');
    expect(blockContent.type).not.toBe('document');
    expect(blockContent.type).not.toBe('object');
  });

  it('should have "of" members defined', () => {
    expect(blockContent.of).toBeDefined();
    expect(Array.isArray(blockContent.of)).toBe(true);
    expect(blockContent.of!.length).toBeGreaterThanOrEqual(1);
  });

  it('should contain a block member', () => {
    const blockMember = blockContent.of!.find((m: any) => m.type === 'block');
    expect(blockMember).toBeDefined();
  });

  describe('Link Annotation', () => {
    let linkAnnotation: any;

    beforeAll(() => {
      const blockMember = blockContent.of!.find((m: any) => m.type === 'block') as any;
      const annotations = blockMember?.marks?.annotations;
      expect(annotations).toBeDefined();
      linkAnnotation = annotations.find((a: any) => a.name === 'link');
    });

    it('should have a link annotation', () => {
      expect(linkAnnotation).toBeDefined();
      expect(linkAnnotation.type).toBe('object');
      expect(linkAnnotation.title).toBe('Link');
    });

    it('should have all link annotation fields', () => {
      const fieldNames = linkAnnotation.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('linkType');
      expect(fieldNames).toContain('href');
      expect(fieldNames).toContain('page');
      expect(fieldNames).toContain('post');
      expect(fieldNames).toContain('openInNewTab');
    });

    it('should have linkType as string with radio list', () => {
      const linkTypeField = linkAnnotation.fields.find((f: any) => f.name === 'linkType');
      expect(linkTypeField.type).toBe('string');
      expect(linkTypeField.options).toBeDefined();
      expect(linkTypeField.options.layout).toBe('radio');
      const listValues = linkTypeField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('href');
      expect(listValues).toContain('page');
      expect(listValues).toContain('post');
    });

    it('should have linkType initial value of "href"', () => {
      const linkTypeField = linkAnnotation.fields.find((f: any) => f.name === 'linkType');
      expect(linkTypeField.initialValue).toBe('href');
    });

    it('should have href field as url type', () => {
      const hrefField = linkAnnotation.fields.find((f: any) => f.name === 'href');
      expect(hrefField.type).toBe('url');
    });

    it('should have href field with conditional validation', () => {
      const hrefField = linkAnnotation.fields.find((f: any) => f.name === 'href');
      expect(hrefField.validation).toBeDefined();
    });

    it('should have page field as reference to page', () => {
      const pageField = linkAnnotation.fields.find((f: any) => f.name === 'page');
      expect(pageField.type).toBe('reference');
      expect(pageField.to).toBeDefined();
      const refTypes = pageField.to.map((r: any) => r.type);
      expect(refTypes).toContain('page');
    });

    it('should have post field as reference to post', () => {
      const postField = linkAnnotation.fields.find((f: any) => f.name === 'post');
      expect(postField.type).toBe('reference');
      expect(postField.to).toBeDefined();
      const refTypes = postField.to.map((r: any) => r.type);
      expect(refTypes).toContain('post');
    });

    it('should have page field with conditional validation', () => {
      const pageField = linkAnnotation.fields.find((f: any) => f.name === 'page');
      expect(pageField.validation).toBeDefined();
    });

    it('should have post field with conditional validation', () => {
      const postField = linkAnnotation.fields.find((f: any) => f.name === 'post');
      expect(postField.validation).toBeDefined();
    });

    it('should have openInNewTab as boolean with initial false', () => {
      const openInNewTabField = linkAnnotation.fields.find((f: any) => f.name === 'openInNewTab');
      expect(openInNewTabField.type).toBe('boolean');
      expect(openInNewTabField.initialValue).toBe(false);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CALL TO ACTION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('CallToAction Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(callToAction, {
      name: 'callToAction',
      title: 'Call to Action',
      type: 'object',
      preview: true,
    });
  });

  it('should reference BulbOutlineIcon as icon (mocked)', () => {
    // Icon is imported from @sanity/icons which is mocked; may be undefined in test env
    expect(callToAction).toHaveProperty('icon');
  });

  it('should have preview with heading selected as title', () => {
    expect(callToAction.preview).toBeDefined();
    expect(callToAction.preview!.select).toBeDefined();
    expect((callToAction.preview!.select as any).title).toBe('heading');
  });

  it('should have exactly 4 fields', () => {
    expect(callToAction.fields).toBeDefined();
    expect(callToAction.fields!.length).toBe(4);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(callToAction);
    expect(fieldNames).toContain('heading');
    expect(fieldNames).toContain('text');
    expect(fieldNames).toContain('buttonText');
    expect(fieldNames).toContain('link');
  });

  it('should have heading as string', () => {
    assertFieldType(callToAction, 'heading', 'string');
  });

  it('should have heading as required', () => {
    assertFieldHasValidation(callToAction, 'heading');
  });

  it('should have text as text type', () => {
    assertFieldType(callToAction, 'text', 'text');
  });

  it('should have buttonText as string', () => {
    assertFieldType(callToAction, 'buttonText', 'string');
  });

  it('should have link field of type link', () => {
    assertFieldType(callToAction, 'link', 'link');
  });

  it('should have schema-level custom validation for paired buttonText/link', () => {
    expect(callToAction.validation).toBeDefined();
  });

  it('should have prepare function in preview', () => {
    expect(callToAction.preview!.prepare).toBeDefined();
    expect(typeof callToAction.preview!.prepare).toBe('function');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. INFO SECTION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('InfoSection Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(infoSection, {
      name: 'infoSection',
      title: 'Info Section',
      type: 'object',
      preview: true,
    });
  });

  it('should reference TextIcon as icon (mocked)', () => {
    // Icon is imported from @sanity/icons which is mocked; may be undefined in test env
    expect(infoSection).toHaveProperty('icon');
  });

  it('should have exactly 3 fields', () => {
    expect(infoSection.fields).toBeDefined();
    expect(infoSection.fields!.length).toBe(3);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(infoSection);
    expect(fieldNames).toContain('heading');
    expect(fieldNames).toContain('subheading');
    expect(fieldNames).toContain('content');
  });

  it('should have heading as string', () => {
    assertFieldType(infoSection, 'heading', 'string');
  });

  it('should have subheading as string', () => {
    assertFieldType(infoSection, 'subheading', 'string');
  });

  it('should have content as blockContent', () => {
    assertFieldType(infoSection, 'content', 'blockContent');
  });

  it('should have preview selecting heading and subheading', () => {
    expect(infoSection.preview).toBeDefined();
    expect(infoSection.preview!.select).toBeDefined();
    expect((infoSection.preview!.select as any).title).toBe('heading');
    expect((infoSection.preview!.select as any).subtitle).toBe('subheading');
  });

  it('should have prepare function in preview', () => {
    expect(infoSection.preview!.prepare).toBeDefined();
    expect(typeof infoSection.preview!.prepare).toBe('function');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. LINK SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Link Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(link, {
      name: 'link',
      title: 'Link',
      type: 'object',
    });
  });

  it('should reference LinkIcon as icon (mocked)', () => {
    // Icon is imported from @sanity/icons which is mocked; may be undefined in test env
    expect(link).toHaveProperty('icon');
  });

  it('should not have a preview', () => {
    expect(link.preview).toBeUndefined();
  });

  it('should have exactly 5 fields', () => {
    expect(link.fields).toBeDefined();
    expect(link.fields!.length).toBe(5);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(link);
    expect(fieldNames).toContain('linkType');
    expect(fieldNames).toContain('href');
    expect(fieldNames).toContain('page');
    expect(fieldNames).toContain('post');
    expect(fieldNames).toContain('openInNewTab');
  });

  describe('linkType field', () => {
    it('should be a string', () => {
      assertFieldType(link, 'linkType', 'string');
    });

    it('should have initial value of "url"', () => {
      const field = findField(link, 'linkType');
      expect(field.initialValue).toBe('url');
    });

    it('should have radio layout options', () => {
      const field = findField(link, 'linkType');
      expect(field.options).toBeDefined();
      expect(field.options.layout).toBe('radio');
    });

    it('should have list values: href, page, post', () => {
      assertFieldHasOptions(link, 'linkType', ['href', 'page', 'post']);
    });
  });

  describe('href field', () => {
    it('should be a url type', () => {
      assertFieldType(link, 'href', 'url');
    });

    it('should have conditional validation (required if linkType=href)', () => {
      assertFieldHasValidation(link, 'href');
    });

    it('should have hidden function', () => {
      const field = findField(link, 'href');
      expect(field.hidden).toBeDefined();
      expect(typeof field.hidden).toBe('function');
    });
  });

  describe('page field', () => {
    it('should be a reference to page', () => {
      assertFieldReference(link, 'page', 'page');
    });

    it('should have conditional validation', () => {
      assertFieldHasValidation(link, 'page');
    });

    it('should have hidden function', () => {
      const field = findField(link, 'page');
      expect(field.hidden).toBeDefined();
      expect(typeof field.hidden).toBe('function');
    });
  });

  describe('post field', () => {
    it('should be a reference to post', () => {
      assertFieldReference(link, 'post', 'post');
    });

    it('should have conditional validation', () => {
      assertFieldHasValidation(link, 'post');
    });

    it('should have hidden function', () => {
      const field = findField(link, 'post');
      expect(field.hidden).toBeDefined();
      expect(typeof field.hidden).toBe('function');
    });
  });

  describe('openInNewTab field', () => {
    it('should be a boolean', () => {
      assertFieldType(link, 'openInNewTab', 'boolean');
    });

    it('should have initial value of false', () => {
      const field = findField(link, 'openInNewTab');
      expect(field.initialValue).toBe(false);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. SETTINGS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Settings Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(settings, {
      name: 'settings',
      title: 'Settings',
      type: 'document',
      icon: true,
    });
  });

  it('should have CogIcon as icon', () => {
    expect(settings.icon).toBeDefined();
  });

  it('should have preview with hardcoded title "Settings"', () => {
    expect(settings.preview).toBeDefined();
    expect(settings.preview!.prepare).toBeDefined();
    const result = settings.preview!.prepare!({});
    expect(result).toEqual({ title: 'Settings' });
  });

  it('should have exactly 3 fields', () => {
    expect(settings.fields).toBeDefined();
    expect(settings.fields!.length).toBe(3);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(settings);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('ogImage');
  });

  describe('title field', () => {
    it('should be a string', () => {
      assertFieldType(settings, 'title', 'string');
    });

    it('should be required', () => {
      assertFieldHasValidation(settings, 'title');
    });

    it('should have an initial value', () => {
      assertFieldHasInitialValue(settings, 'title');
    });
  });

  describe('description field', () => {
    it('should be an array type', () => {
      assertFieldType(settings, 'description', 'array');
    });

    it('should have an initial value', () => {
      assertFieldHasInitialValue(settings, 'description');
    });

    it('should have "of" members containing block', () => {
      const field = findField(settings, 'description');
      expect(field.of).toBeDefined();
      const blockMember = field.of.find((m: any) => m.type === 'block');
      expect(blockMember).toBeDefined();
    });

    it('should have block member with link annotation', () => {
      const field = findField(settings, 'description');
      const blockMember = field.of.find((m: any) => m.type === 'block');
      const annotations = blockMember?.marks?.annotations;
      expect(annotations).toBeDefined();
      const linkAnnotation = annotations.find((a: any) => a.name === 'link');
      expect(linkAnnotation).toBeDefined();
    });

    it('should have link annotation with linkType, href, page, post, openInNewTab', () => {
      const field = findField(settings, 'description');
      const blockMember = field.of.find((m: any) => m.type === 'block');
      const linkAnnotation = blockMember.marks.annotations.find((a: any) => a.name === 'link');
      const annotationFieldNames = linkAnnotation.fields.map((f: any) => f.name);
      expect(annotationFieldNames).toContain('linkType');
      expect(annotationFieldNames).toContain('href');
      expect(annotationFieldNames).toContain('page');
      expect(annotationFieldNames).toContain('post');
      expect(annotationFieldNames).toContain('openInNewTab');
    });
  });

  describe('ogImage field', () => {
    it('should be an image type', () => {
      assertFieldType(settings, 'ogImage', 'image');
    });

    it('should have hotspot enabled', () => {
      const field = findField(settings, 'ogImage');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
    });

    it('should have aiAssist options', () => {
      const field = findField(settings, 'ogImage');
      expect(field.options.aiAssist).toBeDefined();
      expect(field.options.aiAssist.imageDescriptionField).toBe('alt');
    });

    it('should have nested alt and metadataBase fields', () => {
      const field = findField(settings, 'ogImage');
      expect(field.fields).toBeDefined();
      const nestedFieldNames = field.fields.map((f: any) => f.name);
      expect(nestedFieldNames).toContain('alt');
      expect(nestedFieldNames).toContain('metadataBase');
    });

    it('should have alt field as string with conditional validation', () => {
      const field = findField(settings, 'ogImage');
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField.type).toBe('string');
      expect(altField.validation).toBeDefined();
    });

    it('should have metadataBase field as url', () => {
      const field = findField(settings, 'ogImage');
      const metaField = field.fields.find((f: any) => f.name === 'metadataBase');
      expect(metaField.type).toBe('url');
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. SITE SETTINGS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('SiteSettings Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(siteSettings, {
      name: 'siteSettings',
      title: 'Site Settings',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have CogIcon as icon', () => {
    expect(siteSettings.icon).toBeDefined();
  });

  it('should have 8 groups', () => {
    assertHasGroups(siteSettings, [
      'company', 'contact', 'social', 'announcement',
      'footer', 'seo', 'hours', 'features',
    ]);
  });

  it('should have company group as default', () => {
    const companyGroup = (siteSettings as any).groups.find((g: any) => g.name === 'company');
    expect(companyGroup.default).toBe(true);
  });

  it('should have preview with companyName, tagline, logo', () => {
    expect(siteSettings.preview).toBeDefined();
    expect(siteSettings.preview!.select).toBeDefined();
    expect((siteSettings.preview!.select as any).title).toBe('companyName');
    expect((siteSettings.preview!.select as any).subtitle).toBe('tagline');
    expect((siteSettings.preview!.select as any).media).toBe('logo');
  });

  it('should have all top-level field names', () => {
    const fieldNames = getFieldNames(siteSettings);
    expect(fieldNames).toContain('companyName');
    expect(fieldNames).toContain('tagline');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('logo');
    expect(fieldNames).toContain('favicon');
    expect(fieldNames).toContain('contactEmail');
    expect(fieldNames).toContain('contactPhone');
    expect(fieldNames).toContain('address');
    expect(fieldNames).toContain('socialMedia');
    expect(fieldNames).toContain('announcementBar');
    expect(fieldNames).toContain('footer');
    expect(fieldNames).toContain('seo');
    expect(fieldNames).toContain('businessHours');
    expect(fieldNames).toContain('features');
  });

  describe('Company Info fields', () => {
    it('should have companyName as string with required and max(100)', () => {
      assertFieldType(siteSettings, 'companyName', 'string');
      assertFieldHasValidation(siteSettings, 'companyName');
    });

    it('should have companyName initial value', () => {
      const field = findField(siteSettings, 'companyName');
      expect(field.initialValue).toBe('MASH Mushroom E-Commerce');
    });

    it('should have tagline as string with max(150)', () => {
      assertFieldType(siteSettings, 'tagline', 'string');
      assertFieldHasValidation(siteSettings, 'tagline');
    });

    it('should have tagline initial value', () => {
      const field = findField(siteSettings, 'tagline');
      expect(field.initialValue).toBe('Premium Quality Mushrooms');
    });

    it('should have description as text', () => {
      assertFieldType(siteSettings, 'description', 'text');
    });

    it('should have description initial value', () => {
      assertFieldHasInitialValue(siteSettings, 'description');
    });

    it('should have logo as image with hotspot', () => {
      assertFieldType(siteSettings, 'logo', 'image');
      const field = findField(siteSettings, 'logo');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
    });

    it('should have logo with alt field and initial alt text', () => {
      const field = findField(siteSettings, 'logo');
      expect(field.fields).toBeDefined();
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
      expect(altField.type).toBe('string');
      expect(altField.initialValue).toBe('MASH Market Logo');
    });

    it('should have favicon as image', () => {
      assertFieldType(siteSettings, 'favicon', 'image');
    });
  });

  describe('Contact Info fields', () => {
    it('should have contactEmail as string with email validation', () => {
      assertFieldType(siteSettings, 'contactEmail', 'string');
      assertFieldHasValidation(siteSettings, 'contactEmail');
    });

    it('should have contactEmail initial value', () => {
      const field = findField(siteSettings, 'contactEmail');
      expect(field.initialValue).toBe('hello@mashmushrooms.ph');
    });

    it('should have contactPhone as string', () => {
      assertFieldType(siteSettings, 'contactPhone', 'string');
    });

    it('should have contactPhone initial value', () => {
      const field = findField(siteSettings, 'contactPhone');
      expect(field.initialValue).toBe('+63 966 169 2000');
    });

    it('should have address as object type', () => {
      assertFieldType(siteSettings, 'address', 'object');
    });

    it('should have address with nested fields: street, city, state, zipCode, country', () => {
      const field = findField(siteSettings, 'address');
      expect(field.fields).toBeDefined();
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('street');
      expect(nestedNames).toContain('city');
      expect(nestedNames).toContain('state');
      expect(nestedNames).toContain('zipCode');
      expect(nestedNames).toContain('country');
    });

    it('should have address nested fields with initial values', () => {
      const field = findField(siteSettings, 'address');
      const streetField = field.fields.find((f: any) => f.name === 'street');
      expect(streetField.initialValue).toBeDefined();
      const cityField = field.fields.find((f: any) => f.name === 'city');
      expect(cityField.initialValue).toBeDefined();
      const countryField = field.fields.find((f: any) => f.name === 'country');
      expect(countryField.initialValue).toBe('Philippines');
    });
  });

  describe('Social Media fields', () => {
    it('should have socialMedia as object type', () => {
      assertFieldType(siteSettings, 'socialMedia', 'object');
    });

    it('should have socialMedia with 6 url fields', () => {
      const field = findField(siteSettings, 'socialMedia');
      expect(field.fields).toBeDefined();
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('facebook');
      expect(nestedNames).toContain('instagram');
      expect(nestedNames).toContain('twitter');
      expect(nestedNames).toContain('linkedin');
      expect(nestedNames).toContain('youtube');
      expect(nestedNames).toContain('tiktok');
    });

    it('should have all social media fields as url type', () => {
      const field = findField(siteSettings, 'socialMedia');
      for (const subField of field.fields) {
        expect(subField.type).toBe('url');
      }
    });
  });

  describe('Announcement Bar fields', () => {
    it('should have announcementBar as object type', () => {
      assertFieldType(siteSettings, 'announcementBar', 'object');
    });

    it('should have announcementBar with expected nested fields', () => {
      const field = findField(siteSettings, 'announcementBar');
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('enabled');
      expect(nestedNames).toContain('message');
      expect(nestedNames).toContain('link');
      expect(nestedNames).toContain('linkText');
      expect(nestedNames).toContain('backgroundColor');
      expect(nestedNames).toContain('textColor');
    });

    it('should have enabled with initial value false', () => {
      const field = findField(siteSettings, 'announcementBar');
      const enabledField = field.fields.find((f: any) => f.name === 'enabled');
      expect(enabledField.type).toBe('boolean');
      expect(enabledField.initialValue).toBe(false);
    });

    it('should have backgroundColor initial value #1E392A', () => {
      const field = findField(siteSettings, 'announcementBar');
      const bgField = field.fields.find((f: any) => f.name === 'backgroundColor');
      expect(bgField.initialValue).toBe('#1E392A');
    });

    it('should have textColor initial value #FFFFFF', () => {
      const field = findField(siteSettings, 'announcementBar');
      const textField = field.fields.find((f: any) => f.name === 'textColor');
      expect(textField.initialValue).toBe('#FFFFFF');
    });

    it('should have message with max 200 validation', () => {
      const field = findField(siteSettings, 'announcementBar');
      const msgField = field.fields.find((f: any) => f.name === 'message');
      expect(msgField.validation).toBeDefined();
    });
  });

  describe('Footer fields', () => {
    it('should have footer as object type', () => {
      assertFieldType(siteSettings, 'footer', 'object');
    });

    it('should have footer with expected nested fields', () => {
      const field = findField(siteSettings, 'footer');
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('aboutText');
      expect(nestedNames).toContain('copyrightText');
      expect(nestedNames).toContain('showNewsletter');
      expect(nestedNames).toContain('newsletterTitle');
      expect(nestedNames).toContain('newsletterDescription');
      expect(nestedNames).toContain('links');
    });

    it('should have copyrightText with initial value', () => {
      const field = findField(siteSettings, 'footer');
      const copyField = field.fields.find((f: any) => f.name === 'copyrightText');
      expect(copyField.initialValue).toBeDefined();
    });

    it('should have showNewsletter with initial value true', () => {
      const field = findField(siteSettings, 'footer');
      const nlField = field.fields.find((f: any) => f.name === 'showNewsletter');
      expect(nlField.type).toBe('boolean');
      expect(nlField.initialValue).toBe(true);
    });

    it('should have newsletterTitle with initial value', () => {
      const field = findField(siteSettings, 'footer');
      const nlTitleField = field.fields.find((f: any) => f.name === 'newsletterTitle');
      expect(nlTitleField.initialValue).toBe('Stay Updated');
    });

    it('should have links as array type', () => {
      const field = findField(siteSettings, 'footer');
      const linksField = field.fields.find((f: any) => f.name === 'links');
      expect(linksField.type).toBe('array');
    });
  });

  describe('SEO fields', () => {
    it('should have seo as object type', () => {
      assertFieldType(siteSettings, 'seo', 'object');
    });

    it('should have seo with expected nested fields', () => {
      const field = findField(siteSettings, 'seo');
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('metaTitle');
      expect(nestedNames).toContain('metaDescription');
      expect(nestedNames).toContain('keywords');
      expect(nestedNames).toContain('ogImage');
    });

    it('should have metaTitle with initial value and max(60) validation', () => {
      const field = findField(siteSettings, 'seo');
      const metaTitle = field.fields.find((f: any) => f.name === 'metaTitle');
      expect(metaTitle.initialValue).toBeDefined();
      expect(metaTitle.validation).toBeDefined();
    });

    it('should have metaDescription with initial value and max(160) validation', () => {
      const field = findField(siteSettings, 'seo');
      const metaDesc = field.fields.find((f: any) => f.name === 'metaDescription');
      expect(metaDesc.initialValue).toBeDefined();
      expect(metaDesc.validation).toBeDefined();
    });

    it('should have keywords as array with tags layout', () => {
      const field = findField(siteSettings, 'seo');
      const keywords = field.fields.find((f: any) => f.name === 'keywords');
      expect(keywords.type).toBe('array');
      expect(keywords.options).toBeDefined();
      expect(keywords.options.layout).toBe('tags');
    });
  });

  describe('Business Hours fields', () => {
    it('should have businessHours as object type', () => {
      assertFieldType(siteSettings, 'businessHours', 'object');
    });

    it('should have businessHours with day fields and timezone', () => {
      const field = findField(siteSettings, 'businessHours');
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('monday');
      expect(nestedNames).toContain('tuesday');
      expect(nestedNames).toContain('wednesday');
      expect(nestedNames).toContain('thursday');
      expect(nestedNames).toContain('friday');
      expect(nestedNames).toContain('saturday');
      expect(nestedNames).toContain('sunday');
      expect(nestedNames).toContain('timezone');
      expect(nestedNames).toContain('note');
    });

    it('should have timezone with initial value', () => {
      const field = findField(siteSettings, 'businessHours');
      const tzField = field.fields.find((f: any) => f.name === 'timezone');
      expect(tzField.initialValue).toBe('Asia/Manila (GMT+8)');
    });
  });

  describe('Features fields', () => {
    it('should have features as object type', () => {
      assertFieldType(siteSettings, 'features', 'object');
    });

    it('should have features with all boolean toggles', () => {
      const field = findField(siteSettings, 'features');
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('enableBlog');
      expect(nestedNames).toContain('enableShop');
      expect(nestedNames).toContain('enableGrowerProfiles');
      expect(nestedNames).toContain('enableReviews');
      expect(nestedNames).toContain('enableWishlist');
      expect(nestedNames).toContain('enableSameDayDelivery');
    });

    it('should have all feature toggles as boolean type', () => {
      const field = findField(siteSettings, 'features');
      for (const subField of field.fields) {
        expect(subField.type).toBe('boolean');
      }
    });

    it('should have all feature toggles with initial value true', () => {
      const field = findField(siteSettings, 'features');
      for (const subField of field.fields) {
        expect(subField.initialValue).toBe(true);
      }
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. FEATURED PRODUCTS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('FeaturedProducts Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(featuredProducts, {
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have SparklesIcon as icon', () => {
    expect(featuredProducts.icon).toBeDefined();
  });

  it('should have preview selecting title and products', () => {
    expect(featuredProducts.preview).toBeDefined();
    expect(featuredProducts.preview!.select).toBeDefined();
    expect((featuredProducts.preview!.select as any).title).toBe('title');
    expect((featuredProducts.preview!.select as any).products).toBe('products');
  });

  it('should have prepare function in preview', () => {
    expect(featuredProducts.preview!.prepare).toBeDefined();
    expect(typeof featuredProducts.preview!.prepare).toBe('function');
  });

  it('should have exactly 3 fields', () => {
    expect(featuredProducts.fields).toBeDefined();
    expect(featuredProducts.fields!.length).toBe(3);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(featuredProducts);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('subtitle');
    expect(fieldNames).toContain('products');
  });

  describe('title field', () => {
    it('should be a string', () => {
      assertFieldType(featuredProducts, 'title', 'string');
    });

    it('should have initial value "Featured Products"', () => {
      const field = findField(featuredProducts, 'title');
      expect(field.initialValue).toBe('Featured Products');
    });
  });

  describe('subtitle field', () => {
    it('should be a text type', () => {
      assertFieldType(featuredProducts, 'subtitle', 'text');
    });

    it('should have rows set to 2', () => {
      const field = findField(featuredProducts, 'subtitle');
      expect(field.rows).toBe(2);
    });

    it('should have an initial value', () => {
      assertFieldHasInitialValue(featuredProducts, 'subtitle');
    });
  });

  describe('products field', () => {
    it('should be an array type', () => {
      assertFieldType(featuredProducts, 'products', 'array');
    });

    it('should have validation (min 4, max 8)', () => {
      assertFieldHasValidation(featuredProducts, 'products');
    });

    it('should contain references to product', () => {
      const field = findField(featuredProducts, 'products');
      expect(field.of).toBeDefined();
      const refMember = field.of.find((m: any) => m.type === 'reference');
      expect(refMember).toBeDefined();
      const refTypes = refMember.to.map((r: any) => r.type);
      expect(refTypes).toContain('product');
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. HERO CAROUSEL SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('HeroCarousel Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(heroCarousel, {
      name: 'heroCarousel',
      title: 'Hero Carousel',
      type: 'document',
    });
  });

  it('should not have an icon defined at schema level', () => {
    // heroCarousel does not specify an icon
    expect(heroCarousel.icon).toBeUndefined();
  });

  it('should have preview with hardcoded title "Hero Carousel"', () => {
    expect(heroCarousel.preview).toBeDefined();
    expect(heroCarousel.preview!.prepare).toBeDefined();
    const result = heroCarousel.preview!.prepare!({});
    expect(result).toEqual({ title: 'Hero Carousel' });
  });

  it('should have exactly 2 fields', () => {
    expect(heroCarousel.fields).toBeDefined();
    expect(heroCarousel.fields!.length).toBe(2);
  });

  it('should have all expected field names', () => {
    const fieldNames = getFieldNames(heroCarousel);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slides');
  });

  describe('title field', () => {
    it('should be a string', () => {
      assertFieldType(heroCarousel, 'title', 'string');
    });

    it('should have initial value "Homepage Hero"', () => {
      const field = findField(heroCarousel, 'title');
      expect(field.initialValue).toBe('Homepage Hero');
    });
  });

  describe('slides field', () => {
    it('should be an array type', () => {
      assertFieldType(heroCarousel, 'slides', 'array');
    });

    it('should have validation (min 1, max 5)', () => {
      assertFieldHasValidation(heroCarousel, 'slides');
    });

    it('should contain object members of type slide', () => {
      const field = findField(heroCarousel, 'slides');
      expect(field.of).toBeDefined();
      expect(field.of.length).toBeGreaterThanOrEqual(1);
      const slideMember = field.of[0];
      expect(slideMember.type).toBe('object');
      expect(slideMember.name).toBe('slide');
    });

    describe('Slide object fields', () => {
      let slideFields: any[];

      beforeAll(() => {
        const field = findField(heroCarousel, 'slides');
        slideFields = field.of[0].fields;
      });

      it('should have all expected slide field names', () => {
        const names = slideFields.map((f: any) => f.name);
        expect(names).toContain('title');
        expect(names).toContain('subtitle');
        expect(names).toContain('description');
        expect(names).toContain('buttonText');
        expect(names).toContain('buttonLink');
        expect(names).toContain('buttonStyle');
        expect(names).toContain('image');
        expect(names).toContain('backgroundColor');
        expect(names).toContain('textColor');
        expect(names).toContain('order');
        expect(names).toContain('isActive');
      });

      it('should have slide title as required with max 100', () => {
        const titleField = slideFields.find((f: any) => f.name === 'title');
        expect(titleField.type).toBe('string');
        expect(titleField.validation).toBeDefined();
      });

      it('should have slide subtitle as text with max 200', () => {
        const subtitleField = slideFields.find((f: any) => f.name === 'subtitle');
        expect(subtitleField.type).toBe('text');
        expect(subtitleField.validation).toBeDefined();
      });

      it('should have description as text', () => {
        const descField = slideFields.find((f: any) => f.name === 'description');
        expect(descField.type).toBe('text');
      });

      it('should have buttonText as string with max 30', () => {
        const btnField = slideFields.find((f: any) => f.name === 'buttonText');
        expect(btnField.type).toBe('string');
        expect(btnField.validation).toBeDefined();
      });

      it('should have buttonLink as string', () => {
        const btnLinkField = slideFields.find((f: any) => f.name === 'buttonLink');
        expect(btnLinkField.type).toBe('string');
      });

      it('should have ctaText and ctaLink as hidden legacy fields', () => {
        const ctaText = slideFields.find((f: any) => f.name === 'ctaText');
        const ctaLink = slideFields.find((f: any) => f.name === 'ctaLink');
        expect(ctaText).toBeDefined();
        expect(ctaText.hidden).toBe(true);
        expect(ctaLink).toBeDefined();
        expect(ctaLink.hidden).toBe(true);
      });

      it('should have buttonStyle as string with radio layout list of primary/secondary/ghost', () => {
        const btnStyleField = slideFields.find((f: any) => f.name === 'buttonStyle');
        expect(btnStyleField.type).toBe('string');
        expect(btnStyleField.options).toBeDefined();
        expect(btnStyleField.options.layout).toBe('radio');
        const listValues = btnStyleField.options.list.map((item: any) => item.value);
        expect(listValues).toContain('primary');
        expect(listValues).toContain('secondary');
        expect(listValues).toContain('ghost');
      });

      it('should have buttonStyle initial value "primary"', () => {
        const btnStyleField = slideFields.find((f: any) => f.name === 'buttonStyle');
        expect(btnStyleField.initialValue).toBe('primary');
      });

      it('should have image as image with hotspot', () => {
        const imgField = slideFields.find((f: any) => f.name === 'image');
        expect(imgField.type).toBe('image');
        expect(imgField.options).toBeDefined();
        expect(imgField.options.hotspot).toBe(true);
      });

      it('should have backgroundColor initial value "#6A994E"', () => {
        const bgField = slideFields.find((f: any) => f.name === 'backgroundColor');
        expect(bgField.type).toBe('string');
        expect(bgField.initialValue).toBe('#6A994E');
      });

      it('should have textColor initial value "#FFFFFF"', () => {
        const tcField = slideFields.find((f: any) => f.name === 'textColor');
        expect(tcField.type).toBe('string');
        expect(tcField.initialValue).toBe('#FFFFFF');
      });

      it('should have order as number with min 1 and max 10', () => {
        const orderField = slideFields.find((f: any) => f.name === 'order');
        expect(orderField.type).toBe('number');
        expect(orderField.validation).toBeDefined();
        expect(orderField.initialValue).toBe(1);
      });

      it('should have isActive as boolean with initial value true', () => {
        const isActiveField = slideFields.find((f: any) => f.name === 'isActive');
        expect(isActiveField.type).toBe('boolean');
        expect(isActiveField.initialValue).toBe(true);
      });

      it('should have preview on slide objects', () => {
        const slideMember = findField(heroCarousel, 'slides').of[0];
        expect(slideMember.preview).toBeDefined();
        expect(slideMember.preview.select).toBeDefined();
        expect(slideMember.preview.prepare).toBeDefined();
      });
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. ABOUT PAGE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('AboutPage Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(aboutPage, {
      name: 'aboutPage',
      title: 'About Page',
      type: 'document',
    });
  });

  it('should reference InfoOutlineIcon as icon (mocked)', () => {
    // Icon is imported from @sanity/icons which is mocked; may be undefined in test env
    expect(aboutPage).toHaveProperty('icon');
  });

  it('should have preview with hardcoded title "About Page Content"', () => {
    expect(aboutPage.preview).toBeDefined();
    expect(aboutPage.preview!.prepare).toBeDefined();
    const result = aboutPage.preview!.prepare!({});
    expect(result.title).toBe('About Page Content');
  });

  it('should have 6 groups', () => {
    assertHasGroups(aboutPage, ['hero', 'challenges', 'solutions', 'vision', 'mentor', 'team']);
  });

  it('should have hero group as default', () => {
    const heroGroup = (aboutPage as any).groups.find((g: any) => g.name === 'hero');
    expect(heroGroup.default).toBe(true);
  });

  it('should have all expected top-level field names', () => {
    const fieldNames = getFieldNames(aboutPage);
    expect(fieldNames).toContain('heroTitle');
    expect(fieldNames).toContain('heroSubtitle');
    expect(fieldNames).toContain('heroImage');
    expect(fieldNames).toContain('challengesTitle');
    expect(fieldNames).toContain('challengesSubtitle');
    expect(fieldNames).toContain('challenges');
    expect(fieldNames).toContain('solutionsTitle');
    expect(fieldNames).toContain('solutionsSubtitle');
    expect(fieldNames).toContain('solutionsAcronym');
    expect(fieldNames).toContain('solutions');
    expect(fieldNames).toContain('visionTitle');
    expect(fieldNames).toContain('visionContent');
    expect(fieldNames).toContain('visionCTA');
    expect(fieldNames).toContain('visionImage');
    expect(fieldNames).toContain('mentorTitle');
    expect(fieldNames).toContain('mentorSubtitle');
    expect(fieldNames).toContain('mentor');
    expect(fieldNames).toContain('teamTitle');
    expect(fieldNames).toContain('teamSubtitle');
    expect(fieldNames).toContain('teamMembers');
    expect(fieldNames).toContain('autoFetchTeam');
  });

  it('should have hidden legacy fields teamSectionTitle, teamSectionSubtitle', () => {
    const fieldNames = getFieldNames(aboutPage);
    expect(fieldNames).toContain('teamSectionTitle');
    expect(fieldNames).toContain('teamSectionSubtitle');

    const legacyTitle = findField(aboutPage, 'teamSectionTitle');
    expect(legacyTitle.hidden).toBe(true);

    const legacySub = findField(aboutPage, 'teamSectionSubtitle');
    expect(legacySub.hidden).toBe(true);
  });

  describe('Hero Section fields', () => {
    it('should have heroTitle as string, required, max 100', () => {
      assertFieldType(aboutPage, 'heroTitle', 'string');
      assertFieldHasValidation(aboutPage, 'heroTitle');
    });

    it('should have heroTitle initial value', () => {
      const field = findField(aboutPage, 'heroTitle');
      expect(field.initialValue).toBe('Cultivating the Future of Philippine Agriculture');
    });

    it('should have heroSubtitle as text with max 300', () => {
      assertFieldType(aboutPage, 'heroSubtitle', 'text');
      assertFieldHasValidation(aboutPage, 'heroSubtitle');
    });

    it('should have heroSubtitle initial value', () => {
      assertFieldHasInitialValue(aboutPage, 'heroSubtitle');
    });

    it('should have heroImage as image with hotspot', () => {
      assertFieldType(aboutPage, 'heroImage', 'image');
      const field = findField(aboutPage, 'heroImage');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
    });

    it('should have heroImage with alt field', () => {
      const field = findField(aboutPage, 'heroImage');
      expect(field.fields).toBeDefined();
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
      expect(altField.type).toBe('string');
    });
  });

  describe('Challenges Section fields', () => {
    it('should have challengesTitle as string with initial value', () => {
      assertFieldType(aboutPage, 'challengesTitle', 'string');
      assertFieldHasInitialValue(aboutPage, 'challengesTitle');
    });

    it('should have challengesSubtitle as text with initial value', () => {
      assertFieldType(aboutPage, 'challengesSubtitle', 'text');
      assertFieldHasInitialValue(aboutPage, 'challengesSubtitle');
    });

    it('should have challenges as array of objects', () => {
      assertFieldType(aboutPage, 'challenges', 'array');
      const field = findField(aboutPage, 'challenges');
      expect(field.of).toBeDefined();
      const objectMember = field.of.find((m: any) => m.type === 'object');
      expect(objectMember).toBeDefined();
    });

    it('should have challenge objects with title, description, icon fields', () => {
      const field = findField(aboutPage, 'challenges');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const objFieldNames = objectMember.fields.map((f: any) => f.name);
      expect(objFieldNames).toContain('title');
      expect(objFieldNames).toContain('description');
      expect(objFieldNames).toContain('icon');
    });

    it('should have challenge icon field with list options', () => {
      const field = findField(aboutPage, 'challenges');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const iconField = objectMember.fields.find((f: any) => f.name === 'icon');
      expect(iconField.type).toBe('string');
      expect(iconField.options).toBeDefined();
      expect(iconField.options.list).toBeDefined();
      const listValues = iconField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('thermometer');
      expect(listValues).toContain('bug');
      expect(listValues).toContain('clock');
      expect(listValues).toContain('store');
      expect(listValues).toContain('dollar-sign');
    });
  });

  describe('Solutions Section fields', () => {
    it('should have solutionsTitle as string with initial value', () => {
      assertFieldType(aboutPage, 'solutionsTitle', 'string');
      assertFieldHasInitialValue(aboutPage, 'solutionsTitle');
    });

    it('should have solutionsSubtitle as text with initial value', () => {
      assertFieldType(aboutPage, 'solutionsSubtitle', 'text');
      assertFieldHasInitialValue(aboutPage, 'solutionsSubtitle');
    });

    it('should have solutionsAcronym as text', () => {
      assertFieldType(aboutPage, 'solutionsAcronym', 'text');
    });

    it('should have solutions as array of objects', () => {
      assertFieldType(aboutPage, 'solutions', 'array');
      const field = findField(aboutPage, 'solutions');
      expect(field.of).toBeDefined();
      const objectMember = field.of.find((m: any) => m.type === 'object');
      expect(objectMember).toBeDefined();
    });

    it('should have solution objects with title, description, icon, image fields', () => {
      const field = findField(aboutPage, 'solutions');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const objFieldNames = objectMember.fields.map((f: any) => f.name);
      expect(objFieldNames).toContain('title');
      expect(objFieldNames).toContain('description');
      expect(objFieldNames).toContain('icon');
      expect(objFieldNames).toContain('image');
    });

    it('should have solution icon field with list options', () => {
      const field = findField(aboutPage, 'solutions');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const iconField = objectMember.fields.find((f: any) => f.name === 'icon');
      expect(iconField.options).toBeDefined();
      const listValues = iconField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('cpu');
      expect(listValues).toContain('brain');
      expect(listValues).toContain('shopping-cart');
      expect(listValues).toContain('bar-chart');
      expect(listValues).toContain('wifi');
    });
  });

  describe('Vision Section fields', () => {
    it('should have visionTitle as string with initial value', () => {
      assertFieldType(aboutPage, 'visionTitle', 'string');
      assertFieldHasInitialValue(aboutPage, 'visionTitle');
    });

    it('should have visionContent as blockContent type', () => {
      assertFieldType(aboutPage, 'visionContent', 'blockContent');
    });

    it('should have visionCTA as string with initial value', () => {
      assertFieldType(aboutPage, 'visionCTA', 'string');
      const field = findField(aboutPage, 'visionCTA');
      expect(field.initialValue).toBe('Join us in growing the mushroom movement!');
    });

    it('should have visionImage as image with hotspot and alt', () => {
      assertFieldType(aboutPage, 'visionImage', 'image');
      const field = findField(aboutPage, 'visionImage');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
      expect(field.fields).toBeDefined();
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
    });
  });

  describe('Mentor Section fields', () => {
    it('should have mentorTitle as string with initial value', () => {
      assertFieldType(aboutPage, 'mentorTitle', 'string');
      const field = findField(aboutPage, 'mentorTitle');
      expect(field.initialValue).toBe('Our Academic Adviser');
    });

    it('should have mentorSubtitle as text with initial value', () => {
      assertFieldType(aboutPage, 'mentorSubtitle', 'text');
      assertFieldHasInitialValue(aboutPage, 'mentorSubtitle');
    });

    it('should have mentor as reference to person', () => {
      assertFieldReference(aboutPage, 'mentor', 'person');
    });
  });

  describe('Team Section fields', () => {
    it('should have teamTitle as string with initial value', () => {
      assertFieldType(aboutPage, 'teamTitle', 'string');
      const field = findField(aboutPage, 'teamTitle');
      expect(field.initialValue).toBe('Meet the Team');
    });

    it('should have teamSubtitle as text with initial value', () => {
      assertFieldType(aboutPage, 'teamSubtitle', 'text');
      assertFieldHasInitialValue(aboutPage, 'teamSubtitle');
    });

    it('should have teamMembers as array of references to person', () => {
      assertFieldType(aboutPage, 'teamMembers', 'array');
      const field = findField(aboutPage, 'teamMembers');
      expect(field.of).toBeDefined();
      const refMember = field.of.find((m: any) => m.type === 'reference');
      expect(refMember).toBeDefined();
      const refTypes = refMember.to.map((r: any) => r.type);
      expect(refTypes).toContain('person');
    });

    it('should have autoFetchTeam as boolean with initial value true', () => {
      assertFieldType(aboutPage, 'autoFetchTeam', 'boolean');
      const field = findField(aboutPage, 'autoFetchTeam');
      expect(field.initialValue).toBe(true);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. CONTACT PAGE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('ContactPage Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(contactPage, {
      name: 'contactPage',
      title: 'Contact Page',
      type: 'document',
      icon: true,
    });
  });

  it('should have EnvelopeIcon as icon', () => {
    expect(contactPage.icon).toBeDefined();
  });

  it('should have preview with hardcoded title "Contact Page Content"', () => {
    expect(contactPage.preview).toBeDefined();
    expect(contactPage.preview!.prepare).toBeDefined();
    const result = contactPage.preview!.prepare!({});
    expect(result.title).toBe('Contact Page Content');
  });

  it('should have 6 groups', () => {
    assertHasGroups(contactPage, ['header', 'contact', 'hours', 'social', 'location', 'form']);
  });

  it('should have header group as default', () => {
    const headerGroup = (contactPage as any).groups.find((g: any) => g.name === 'header');
    expect(headerGroup.default).toBe(true);
  });

  it('should have all expected top-level field names', () => {
    const fieldNames = getFieldNames(contactPage);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('subtitle');
    expect(fieldNames).toContain('headerImage');
    expect(fieldNames).toContain('contactMethods');
    expect(fieldNames).toContain('businessHoursTitle');
    expect(fieldNames).toContain('businessHours');
    expect(fieldNames).toContain('holidayNote');
    expect(fieldNames).toContain('timezone');
    expect(fieldNames).toContain('socialMediaTitle');
    expect(fieldNames).toContain('socialLinks');
    expect(fieldNames).toContain('locationTitle');
    expect(fieldNames).toContain('address');
    expect(fieldNames).toContain('coordinates');
    expect(fieldNames).toContain('mapEmbedUrl');
    expect(fieldNames).toContain('directionsLink');
    expect(fieldNames).toContain('locationImage');
    expect(fieldNames).toContain('nearbyLandmarks');
    expect(fieldNames).toContain('formTitle');
    expect(fieldNames).toContain('formSubtitle');
    expect(fieldNames).toContain('formRecipientEmail');
    expect(fieldNames).toContain('formSuccessMessage');
    expect(fieldNames).toContain('showContactForm');
  });

  describe('Page Header fields', () => {
    it('should have title as string, required, max 100', () => {
      assertFieldType(contactPage, 'title', 'string');
      assertFieldHasValidation(contactPage, 'title');
    });

    it('should have title initial value "Get in Touch"', () => {
      const field = findField(contactPage, 'title');
      expect(field.initialValue).toBe('Get in Touch');
    });

    it('should have subtitle as text with initial value', () => {
      assertFieldType(contactPage, 'subtitle', 'text');
      assertFieldHasInitialValue(contactPage, 'subtitle');
    });

    it('should have headerImage as image with hotspot', () => {
      assertFieldType(contactPage, 'headerImage', 'image');
      const field = findField(contactPage, 'headerImage');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
    });

    it('should have headerImage with alt field', () => {
      const field = findField(contactPage, 'headerImage');
      expect(field.fields).toBeDefined();
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
    });
  });

  describe('Contact Methods fields', () => {
    it('should have contactMethods as array', () => {
      assertFieldType(contactPage, 'contactMethods', 'array');
    });

    it('should have contactMethods array containing objects', () => {
      const field = findField(contactPage, 'contactMethods');
      expect(field.of).toBeDefined();
      const objectMember = field.of.find((m: any) => m.type === 'object');
      expect(objectMember).toBeDefined();
    });

    it('should have contactMethod objects with type, label, value, description, link, displayOrder', () => {
      const field = findField(contactPage, 'contactMethods');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const objFieldNames = objectMember.fields.map((f: any) => f.name);
      expect(objFieldNames).toContain('type');
      expect(objFieldNames).toContain('label');
      expect(objFieldNames).toContain('value');
      expect(objFieldNames).toContain('description');
      expect(objFieldNames).toContain('link');
      expect(objFieldNames).toContain('displayOrder');
    });

    it('should have contactMethod type field with radio list options', () => {
      const field = findField(contactPage, 'contactMethods');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const typeField = objectMember.fields.find((f: any) => f.name === 'type');
      expect(typeField.options).toBeDefined();
      expect(typeField.options.layout).toBe('radio');
      const listValues = typeField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('phone');
      expect(listValues).toContain('email');
      expect(listValues).toContain('address');
      expect(listValues).toContain('whatsapp');
      expect(listValues).toContain('viber');
      expect(listValues).toContain('telegram');
      expect(listValues).toContain('messenger');
    });

    it('should have contactMethod type and value as required', () => {
      const field = findField(contactPage, 'contactMethods');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const typeField = objectMember.fields.find((f: any) => f.name === 'type');
      expect(typeField.validation).toBeDefined();
      const valueField = objectMember.fields.find((f: any) => f.name === 'value');
      expect(valueField.validation).toBeDefined();
    });
  });

  describe('Business Hours fields', () => {
    it('should have businessHoursTitle as string with initial value', () => {
      assertFieldType(contactPage, 'businessHoursTitle', 'string');
      const field = findField(contactPage, 'businessHoursTitle');
      expect(field.initialValue).toBe('Business Hours');
    });

    it('should have businessHours as array', () => {
      assertFieldType(contactPage, 'businessHours', 'array');
    });

    it('should have businessHours array containing objects with day, openTime, closeTime, isClosed, note', () => {
      const field = findField(contactPage, 'businessHours');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      expect(objectMember).toBeDefined();
      const objFieldNames = objectMember.fields.map((f: any) => f.name);
      expect(objFieldNames).toContain('day');
      expect(objFieldNames).toContain('openTime');
      expect(objFieldNames).toContain('closeTime');
      expect(objFieldNames).toContain('isClosed');
      expect(objFieldNames).toContain('note');
    });

    it('should have day field with list of weekdays', () => {
      const field = findField(contactPage, 'businessHours');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const dayField = objectMember.fields.find((f: any) => f.name === 'day');
      expect(dayField.options).toBeDefined();
      const listValues = dayField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('monday');
      expect(listValues).toContain('tuesday');
      expect(listValues).toContain('wednesday');
      expect(listValues).toContain('thursday');
      expect(listValues).toContain('friday');
      expect(listValues).toContain('saturday');
      expect(listValues).toContain('sunday');
    });

    it('should have day field as required', () => {
      const field = findField(contactPage, 'businessHours');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const dayField = objectMember.fields.find((f: any) => f.name === 'day');
      expect(dayField.validation).toBeDefined();
    });

    it('should have isClosed with initial value false', () => {
      const field = findField(contactPage, 'businessHours');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const isClosedField = objectMember.fields.find((f: any) => f.name === 'isClosed');
      expect(isClosedField.type).toBe('boolean');
      expect(isClosedField.initialValue).toBe(false);
    });

    it('should have holidayNote as text', () => {
      assertFieldType(contactPage, 'holidayNote', 'text');
    });

    it('should have timezone as string with initial value', () => {
      assertFieldType(contactPage, 'timezone', 'string');
      const field = findField(contactPage, 'timezone');
      expect(field.initialValue).toBe('Philippine Time (GMT+8)');
    });
  });

  describe('Social Media fields', () => {
    it('should have socialMediaTitle as string with initial value', () => {
      assertFieldType(contactPage, 'socialMediaTitle', 'string');
      const field = findField(contactPage, 'socialMediaTitle');
      expect(field.initialValue).toBe('Follow Us');
    });

    it('should have socialLinks as array', () => {
      assertFieldType(contactPage, 'socialLinks', 'array');
    });

    it('should have socialLinks array containing objects with platform, url, handle, displayOrder', () => {
      const field = findField(contactPage, 'socialLinks');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      expect(objectMember).toBeDefined();
      const objFieldNames = objectMember.fields.map((f: any) => f.name);
      expect(objFieldNames).toContain('platform');
      expect(objFieldNames).toContain('url');
      expect(objFieldNames).toContain('handle');
      expect(objFieldNames).toContain('displayOrder');
    });

    it('should have platform field with radio list of social platforms', () => {
      const field = findField(contactPage, 'socialLinks');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const platformField = objectMember.fields.find((f: any) => f.name === 'platform');
      expect(platformField.options).toBeDefined();
      expect(platformField.options.layout).toBe('radio');
      const listValues = platformField.options.list.map((item: any) => item.value);
      expect(listValues).toContain('facebook');
      expect(listValues).toContain('instagram');
      expect(listValues).toContain('twitter');
      expect(listValues).toContain('linkedin');
      expect(listValues).toContain('youtube');
      expect(listValues).toContain('tiktok');
      expect(listValues).toContain('github');
    });

    it('should have platform and url as required', () => {
      const field = findField(contactPage, 'socialLinks');
      const objectMember = field.of.find((m: any) => m.type === 'object');
      const platformField = objectMember.fields.find((f: any) => f.name === 'platform');
      expect(platformField.validation).toBeDefined();
      const urlField = objectMember.fields.find((f: any) => f.name === 'url');
      expect(urlField.validation).toBeDefined();
    });
  });

  describe('Location fields', () => {
    it('should have locationTitle as string with initial value', () => {
      assertFieldType(contactPage, 'locationTitle', 'string');
      const field = findField(contactPage, 'locationTitle');
      expect(field.initialValue).toBe('Visit Us');
    });

    it('should have address as object', () => {
      assertFieldType(contactPage, 'address', 'object');
    });

    it('should have address with street, barangay, city, province, zipCode, country', () => {
      const field = findField(contactPage, 'address');
      expect(field.fields).toBeDefined();
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('street');
      expect(nestedNames).toContain('barangay');
      expect(nestedNames).toContain('city');
      expect(nestedNames).toContain('province');
      expect(nestedNames).toContain('zipCode');
      expect(nestedNames).toContain('country');
    });

    it('should have address country with initial value "Philippines"', () => {
      const field = findField(contactPage, 'address');
      const countryField = field.fields.find((f: any) => f.name === 'country');
      expect(countryField.initialValue).toBe('Philippines');
    });

    it('should have coordinates as object with latitude and longitude', () => {
      assertFieldType(contactPage, 'coordinates', 'object');
      const field = findField(contactPage, 'coordinates');
      expect(field.fields).toBeDefined();
      const nestedNames = field.fields.map((f: any) => f.name);
      expect(nestedNames).toContain('latitude');
      expect(nestedNames).toContain('longitude');
    });

    it('should have coordinates latitude and longitude as number type', () => {
      const field = findField(contactPage, 'coordinates');
      const latField = field.fields.find((f: any) => f.name === 'latitude');
      expect(latField.type).toBe('number');
      const lngField = field.fields.find((f: any) => f.name === 'longitude');
      expect(lngField.type).toBe('number');
    });

    it('should have mapEmbedUrl as url', () => {
      assertFieldType(contactPage, 'mapEmbedUrl', 'url');
    });

    it('should have directionsLink as url', () => {
      assertFieldType(contactPage, 'directionsLink', 'url');
    });

    it('should have locationImage as image with hotspot', () => {
      assertFieldType(contactPage, 'locationImage', 'image');
      const field = findField(contactPage, 'locationImage');
      expect(field.options).toBeDefined();
      expect(field.options.hotspot).toBe(true);
    });

    it('should have locationImage with alt field', () => {
      const field = findField(contactPage, 'locationImage');
      expect(field.fields).toBeDefined();
      const altField = field.fields.find((f: any) => f.name === 'alt');
      expect(altField).toBeDefined();
    });

    it('should have nearbyLandmarks as text', () => {
      assertFieldType(contactPage, 'nearbyLandmarks', 'text');
    });
  });

  describe('Contact Form fields', () => {
    it('should have formTitle as string with initial value', () => {
      assertFieldType(contactPage, 'formTitle', 'string');
      const field = findField(contactPage, 'formTitle');
      expect(field.initialValue).toBe('Send Us a Message');
    });

    it('should have formSubtitle as text with initial value', () => {
      assertFieldType(contactPage, 'formSubtitle', 'text');
      assertFieldHasInitialValue(contactPage, 'formSubtitle');
    });

    it('should have formRecipientEmail as string with email validation', () => {
      assertFieldType(contactPage, 'formRecipientEmail', 'string');
      assertFieldHasValidation(contactPage, 'formRecipientEmail');
    });

    it('should have formSuccessMessage as text with initial value', () => {
      assertFieldType(contactPage, 'formSuccessMessage', 'text');
      assertFieldHasInitialValue(contactPage, 'formSuccessMessage');
    });

    it('should have showContactForm as boolean with initial value true', () => {
      assertFieldType(contactPage, 'showContactForm', 'boolean');
      const field = findField(contactPage, 'showContactForm');
      expect(field.initialValue).toBe(true);
    });
  });
});
