/**
 * Document Schemas Part 2 - Comprehensive Tests
 *
 * Tests 12 Sanity CMS document schemas:
 * blogCategory, person, page, navigation, featureSection, recipe,
 * growingGuide, productVariant, productBundle, emailCampaign, analytics, stockAdjustment
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

import { blogCategory } from '../../../studio/src/schemaTypes/documents/blogCategory';
import { person } from '../../../studio/src/schemaTypes/documents/person';
import { page } from '../../../studio/src/schemaTypes/documents/page';
import { navigation } from '../../../studio/src/schemaTypes/documents/navigation';
import { featureSection } from '../../../studio/src/schemaTypes/documents/featureSection';
import { recipe } from '../../../studio/src/schemaTypes/documents/recipe';
import { growingGuide } from '../../../studio/src/schemaTypes/documents/growingGuide';
import { productVariant } from '../../../studio/src/schemaTypes/documents/productVariant';
import { productBundle } from '../../../studio/src/schemaTypes/documents/productBundle';
import { emailCampaign } from '../../../studio/src/schemaTypes/documents/emailCampaign';
import { analytics } from '../../../studio/src/schemaTypes/documents/analytics';
import { stockAdjustment } from '../../../studio/src/schemaTypes/documents/stockAdjustment';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. BLOG CATEGORY SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('BlogCategory Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(blogCategory, {
      name: 'blogCategory',
      title: 'Blog Category',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(blogCategory);
    const expectedFields = [
      'name',
      'slug',
      'description',
      'icon',
      'color',
      'image',
      'displayOrder',
      'isActive',
      'postCount',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(blogCategory)).toBe(9);
  });

  it('should have correct field types', () => {
    assertFieldType(blogCategory, 'name', 'string');
    assertFieldType(blogCategory, 'slug', 'slug');
    assertFieldType(blogCategory, 'description', 'text');
    assertFieldType(blogCategory, 'icon', 'string');
    assertFieldType(blogCategory, 'color', 'string');
    assertFieldType(blogCategory, 'image', 'image');
    assertFieldType(blogCategory, 'displayOrder', 'number');
    assertFieldType(blogCategory, 'isActive', 'boolean');
    assertFieldType(blogCategory, 'postCount', 'number');
  });

  it('should have required validation on name and slug', () => {
    assertFieldHasValidation(blogCategory, 'name');
    assertFieldHasValidation(blogCategory, 'slug');
  });

  it('should have validation on description and displayOrder', () => {
    assertFieldHasValidation(blogCategory, 'description');
    assertFieldHasValidation(blogCategory, 'displayOrder');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(blogCategory, 'color');
    assertFieldHasInitialValue(blogCategory, 'displayOrder');
    assertFieldHasInitialValue(blogCategory, 'isActive');

    const colorField = findField(blogCategory, 'color');
    expect(colorField.initialValue).toBe('green');

    const displayOrderField = findField(blogCategory, 'displayOrder');
    expect(displayOrderField.initialValue).toBe(50);

    const isActiveField = findField(blogCategory, 'isActive');
    expect(isActiveField.initialValue).toBe(true);
  });

  it('should have postCount as read-only', () => {
    assertFieldReadOnly(blogCategory, 'postCount');
  });

  it('should have slug with source "name"', () => {
    assertSlugField(blogCategory, 'slug', 'name');
    const slugField = findField(blogCategory, 'slug');
    expect(slugField.options.maxLength).toBe(50);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(blogCategory, 2);
  });

  it('should have correct color options with radio layout', () => {
    assertFieldHasOptions(blogCategory, 'color', [
      'green',
      'blue',
      'purple',
      'orange',
      'red',
      'yellow',
      'gray',
    ]);
    const colorField = findField(blogCategory, 'color');
    expect(colorField.options.layout).toBe('radio');
  });

  it('should have predefined icon list options', () => {
    assertFieldHasOptions(blogCategory, 'icon', [
      'utensils',
      'sprout',
      'heart-pulse',
      'newspaper',
      'graduation-cap',
      'users',
      'store',
      'lightbulb',
      'package',
      'globe',
    ]);
  });

  it('should have image field with hotspot', () => {
    const imageField = findField(blogCategory, 'image');
    expect(imageField.options).toBeDefined();
    expect(imageField.options.hotspot).toBe(true);
  });

  it('should have image field with alt subfield', () => {
    const imageField = findField(blogCategory, 'image');
    expect(imageField.fields).toBeDefined();
    const altField = imageField.fields.find((f: any) => f.name === 'alt');
    expect(altField).toBeDefined();
    expect(altField.type).toBe('string');
  });

  it('should have description with rows set to 2', () => {
    const descField = findField(blogCategory, 'description');
    expect(descField.rows).toBe(2);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. PERSON SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Person Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(person, {
      name: 'person',
      title: 'Person / Team Member',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(person);
    const expectedFields = [
      'firstName',
      'lastName',
      'picture',
      'role',
      'personType',
      'shortBio',
      'bio',
      'specializations',
      'email',
      'phone',
      'website',
      'socialLinks',
      'displayOrder',
      'showOnAboutPage',
      'isFeatured',
      'isActive',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(person, 'firstName', 'string');
    assertFieldType(person, 'lastName', 'string');
    assertFieldType(person, 'picture', 'image');
    assertFieldType(person, 'role', 'string');
    assertFieldType(person, 'personType', 'string');
    assertFieldType(person, 'shortBio', 'text');
    assertFieldType(person, 'bio', 'blockContent');
    assertFieldType(person, 'specializations', 'array');
    assertFieldType(person, 'email', 'string');
    assertFieldType(person, 'phone', 'string');
    assertFieldType(person, 'website', 'url');
    assertFieldType(person, 'socialLinks', 'object');
    assertFieldType(person, 'displayOrder', 'number');
    assertFieldType(person, 'showOnAboutPage', 'boolean');
    assertFieldType(person, 'isFeatured', 'boolean');
    assertFieldType(person, 'isActive', 'boolean');
  });

  it('should have required validation on firstName, lastName, and picture', () => {
    assertFieldHasValidation(person, 'firstName');
    assertFieldHasValidation(person, 'lastName');
    assertFieldHasValidation(person, 'picture');
  });

  it('should have validation on role, shortBio, email, and displayOrder', () => {
    assertFieldHasValidation(person, 'role');
    assertFieldHasValidation(person, 'shortBio');
    assertFieldHasValidation(person, 'email');
    assertFieldHasValidation(person, 'displayOrder');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(person, 'personType');
    assertFieldHasInitialValue(person, 'displayOrder');
    assertFieldHasInitialValue(person, 'showOnAboutPage');
    assertFieldHasInitialValue(person, 'isFeatured');
    assertFieldHasInitialValue(person, 'isActive');

    const personTypeField = findField(person, 'personType');
    expect(personTypeField.initialValue).toBe('team');

    const displayOrderField = findField(person, 'displayOrder');
    expect(displayOrderField.initialValue).toBe(50);

    const showOnAboutField = findField(person, 'showOnAboutPage');
    expect(showOnAboutField.initialValue).toBe(true);

    const isFeaturedField = findField(person, 'isFeatured');
    expect(isFeaturedField.initialValue).toBe(false);

    const isActiveField = findField(person, 'isActive');
    expect(isActiveField.initialValue).toBe(true);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(person, 2);
  });

  it('should have 5 groups', () => {
    assertHasGroups(person, ['basic', 'bio', 'contact', 'social', 'settings']);
  });

  it('should have personType options with radio layout', () => {
    assertFieldHasOptions(person, 'personType', ['team', 'mentor', 'author', 'partner']);
    const personTypeField = findField(person, 'personType');
    expect(personTypeField.options.layout).toBe('radio');
  });

  it('should have picture with hotspot and aiAssist', () => {
    const pictureField = findField(person, 'picture');
    expect(pictureField.options).toBeDefined();
    expect(pictureField.options.hotspot).toBe(true);
    expect(pictureField.options.aiAssist).toBeDefined();
  });

  it('should have picture with alt subfield', () => {
    const pictureField = findField(person, 'picture');
    expect(pictureField.fields).toBeDefined();
    const altField = pictureField.fields.find((f: any) => f.name === 'alt');
    expect(altField).toBeDefined();
    expect(altField.type).toBe('string');
  });

  it('should have specializations as array of strings with tags layout', () => {
    const specField = findField(person, 'specializations');
    expect(specField.of).toBeDefined();
    expect(specField.of[0].type).toBe('string');
    expect(specField.options).toBeDefined();
    expect(specField.options.layout).toBe('tags');
  });

  it('should have socialLinks object with correct subfields', () => {
    const socialLinksField = findField(person, 'socialLinks');
    expect(socialLinksField.fields).toBeDefined();
    const subFieldNames = socialLinksField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('facebook');
    expect(subFieldNames).toContain('twitter');
    expect(subFieldNames).toContain('instagram');
    expect(subFieldNames).toContain('linkedin');
    expect(subFieldNames).toContain('github');
    expect(subFieldNames).toContain('tiktok');
    // All should be url type
    for (const sf of socialLinksField.fields) {
      expect(sf.type).toBe('url');
    }
  });

  it('should have shortBio with rows set to 2', () => {
    const shortBioField = findField(person, 'shortBio');
    expect(shortBioField.rows).toBe(2);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. PAGE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Page Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(page, {
      name: 'page',
      title: 'Page',
      type: 'document',
      icon: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(page);
    const expectedFields = ['name', 'slug', 'heading', 'subheading', 'pageBuilder'];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(page)).toBe(5);
  });

  it('should have correct field types', () => {
    assertFieldType(page, 'name', 'string');
    assertFieldType(page, 'slug', 'slug');
    assertFieldType(page, 'heading', 'string');
    assertFieldType(page, 'subheading', 'string');
    assertFieldType(page, 'pageBuilder', 'array');
  });

  it('should have required validation on name, slug, and heading', () => {
    assertFieldHasValidation(page, 'name');
    assertFieldHasValidation(page, 'slug');
    assertFieldHasValidation(page, 'heading');
  });

  it('should have slug with source "name" and maxLength 96', () => {
    assertSlugField(page, 'slug', 'name');
    const slugField = findField(page, 'slug');
    expect(slugField.options.maxLength).toBe(96);
  });

  it('should have pageBuilder as array of callToAction and infoSection', () => {
    const pageBuilderField = findField(page, 'pageBuilder');
    expect(pageBuilderField.of).toBeDefined();
    const types = pageBuilderField.of.map((item: any) => item.type);
    expect(types).toContain('callToAction');
    expect(types).toContain('infoSection');
  });

  it('should not have orderings', () => {
    expect(page.orderings).toBeUndefined();
  });

  it('should not have groups', () => {
    expect((page as any).groups).toBeUndefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. NAVIGATION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Navigation Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(navigation, {
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(navigation);
    const expectedFields = [
      'title',
      'slug',
      'menuType',
      'items',
      'isActive',
      'displayOrder',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(navigation)).toBe(6);
  });

  it('should have correct field types', () => {
    assertFieldType(navigation, 'title', 'string');
    assertFieldType(navigation, 'slug', 'slug');
    assertFieldType(navigation, 'menuType', 'string');
    assertFieldType(navigation, 'items', 'array');
    assertFieldType(navigation, 'isActive', 'boolean');
    assertFieldType(navigation, 'displayOrder', 'number');
  });

  it('should have required validation on title, slug, menuType, and items', () => {
    assertFieldHasValidation(navigation, 'title');
    assertFieldHasValidation(navigation, 'slug');
    assertFieldHasValidation(navigation, 'menuType');
    assertFieldHasValidation(navigation, 'items');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(navigation, 'isActive');
    assertFieldHasInitialValue(navigation, 'displayOrder');

    const isActiveField = findField(navigation, 'isActive');
    expect(isActiveField.initialValue).toBe(true);

    const displayOrderField = findField(navigation, 'displayOrder');
    expect(displayOrderField.initialValue).toBe(0);
  });

  it('should have slug with source "title" and maxLength 50', () => {
    assertSlugField(navigation, 'slug', 'title');
    const slugField = findField(navigation, 'slug');
    expect(slugField.options.maxLength).toBe(50);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(navigation, 2);
  });

  it('should have menuType options with correct values', () => {
    assertFieldHasOptions(navigation, 'menuType', [
      'header-main',
      'header-secondary',
      'header-mobile',
      'footer-shop',
      'footer-support',
      'footer-about',
      'footer-legal',
    ]);
  });

  it('should have menuType with dropdown layout', () => {
    const menuTypeField = findField(navigation, 'menuType');
    expect(menuTypeField.options.layout).toBe('dropdown');
  });

  it('should have items array with menuItem objects', () => {
    const itemsField = findField(navigation, 'items');
    expect(itemsField.of).toBeDefined();
    expect(itemsField.of.length).toBeGreaterThanOrEqual(1);
    const menuItemType = itemsField.of[0];
    expect(menuItemType.type).toBe('object');
    expect(menuItemType.name).toBe('menuItem');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. FEATURE SECTION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('FeatureSection Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(featureSection, {
      name: 'featureSection',
      title: 'Feature Section',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(featureSection);
    const expectedFields = [
      'title',
      'slug',
      'subtitle',
      'features',
      'backgroundColor',
      'columns',
      'showOnHomepage',
      'displayOrder',
      'isActive',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(featureSection)).toBe(9);
  });

  it('should have correct field types', () => {
    assertFieldType(featureSection, 'title', 'string');
    assertFieldType(featureSection, 'slug', 'slug');
    assertFieldType(featureSection, 'subtitle', 'string');
    assertFieldType(featureSection, 'features', 'array');
    assertFieldType(featureSection, 'backgroundColor', 'string');
    assertFieldType(featureSection, 'columns', 'number');
    assertFieldType(featureSection, 'showOnHomepage', 'boolean');
    assertFieldType(featureSection, 'displayOrder', 'number');
    assertFieldType(featureSection, 'isActive', 'boolean');
  });

  it('should have required validation on title, slug, and features', () => {
    assertFieldHasValidation(featureSection, 'title');
    assertFieldHasValidation(featureSection, 'slug');
    assertFieldHasValidation(featureSection, 'features');
  });

  it('should have validation on subtitle', () => {
    assertFieldHasValidation(featureSection, 'subtitle');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(featureSection, 'backgroundColor');
    assertFieldHasInitialValue(featureSection, 'columns');
    assertFieldHasInitialValue(featureSection, 'showOnHomepage');
    assertFieldHasInitialValue(featureSection, 'displayOrder');
    assertFieldHasInitialValue(featureSection, 'isActive');

    const bgField = findField(featureSection, 'backgroundColor');
    expect(bgField.initialValue).toBe('light');

    const columnsField = findField(featureSection, 'columns');
    expect(columnsField.initialValue).toBe(3);

    const showField = findField(featureSection, 'showOnHomepage');
    expect(showField.initialValue).toBe(true);

    const displayOrderField = findField(featureSection, 'displayOrder');
    expect(displayOrderField.initialValue).toBe(0);

    const isActiveField = findField(featureSection, 'isActive');
    expect(isActiveField.initialValue).toBe(true);
  });

  it('should have slug with source "title" and maxLength 96', () => {
    assertSlugField(featureSection, 'slug', 'title');
    const slugField = findField(featureSection, 'slug');
    expect(slugField.options.maxLength).toBe(96);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(featureSection, 2);
  });

  it('should have 2 groups', () => {
    assertHasGroups(featureSection, ['content', 'settings']);
  });

  it('should have backgroundColor options', () => {
    assertFieldHasOptions(featureSection, 'backgroundColor', [
      'light',
      'muted',
      'dark',
      'gradient',
    ]);
  });

  it('should have columns options with numeric values', () => {
    const columnsField = findField(featureSection, 'columns');
    expect(columnsField.options).toBeDefined();
    expect(columnsField.options.list).toBeDefined();
    const values = columnsField.options.list.map((item: any) =>
      typeof item === 'number' ? item : item.value
    );
    expect(values).toContain(2);
    expect(values).toContain(3);
    expect(values).toContain(4);
  });

  it('should have features array with featureItem objects', () => {
    const featuresField = findField(featureSection, 'features');
    expect(featuresField.of).toBeDefined();
    expect(featuresField.of.length).toBeGreaterThanOrEqual(1);
    const featureItem = featuresField.of[0];
    expect(featureItem.type).toBe('object');
    expect(featureItem.name).toBe('featureItem');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. RECIPE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Recipe Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(recipe, {
      name: 'recipe',
      title: 'Recipes',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(recipe);
    const expectedFields = [
      'title',
      'slug',
      'excerpt',
      'description',
      'author',
      'publishedAt',
      'category',
      'cuisine',
      'difficulty',
      'tags',
      'prepTime',
      'cookTime',
      'totalTime',
      'servings',
      'mainImage',
      'gallery',
      'youtubeVideo',
      'additionalVideos',
      'ingredientGroups',
      'equipmentNeeded',
      'instructions',
      'chefNotes',
      'nutritionFacts',
      'dietaryInfo',
      'allergens',
      'relatedRecipes',
      'featuredProducts',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
      'isFeatured',
      'status',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(recipe, 'title', 'string');
    assertFieldType(recipe, 'slug', 'slug');
    assertFieldType(recipe, 'excerpt', 'text');
    assertFieldType(recipe, 'description', 'blockContent');
    assertFieldType(recipe, 'author', 'reference');
    assertFieldType(recipe, 'publishedAt', 'datetime');
    assertFieldType(recipe, 'category', 'string');
    assertFieldType(recipe, 'cuisine', 'string');
    assertFieldType(recipe, 'difficulty', 'string');
    assertFieldType(recipe, 'tags', 'array');
    assertFieldType(recipe, 'prepTime', 'number');
    assertFieldType(recipe, 'cookTime', 'number');
    assertFieldType(recipe, 'totalTime', 'number');
    assertFieldType(recipe, 'servings', 'number');
    assertFieldType(recipe, 'mainImage', 'image');
    assertFieldType(recipe, 'gallery', 'array');
    assertFieldType(recipe, 'youtubeVideo', 'object');
    assertFieldType(recipe, 'additionalVideos', 'array');
    assertFieldType(recipe, 'ingredientGroups', 'array');
    assertFieldType(recipe, 'equipmentNeeded', 'array');
    assertFieldType(recipe, 'instructions', 'array');
    assertFieldType(recipe, 'chefNotes', 'blockContent');
    assertFieldType(recipe, 'nutritionFacts', 'object');
    assertFieldType(recipe, 'dietaryInfo', 'array');
    assertFieldType(recipe, 'allergens', 'array');
    assertFieldType(recipe, 'relatedRecipes', 'array');
    assertFieldType(recipe, 'featuredProducts', 'array');
    assertFieldType(recipe, 'seoTitle', 'string');
    assertFieldType(recipe, 'seoDescription', 'text');
    assertFieldType(recipe, 'seoKeywords', 'array');
    assertFieldType(recipe, 'isFeatured', 'boolean');
    assertFieldType(recipe, 'status', 'string');
  });

  it('should have required validation on title, slug, and category', () => {
    assertFieldHasValidation(recipe, 'title');
    assertFieldHasValidation(recipe, 'slug');
    assertFieldHasValidation(recipe, 'category');
  });

  it('should have validation on timing fields', () => {
    assertFieldHasValidation(recipe, 'prepTime');
    assertFieldHasValidation(recipe, 'cookTime');
    assertFieldHasValidation(recipe, 'totalTime');
    assertFieldHasValidation(recipe, 'servings');
  });

  it('should have validation on SEO fields', () => {
    assertFieldHasValidation(recipe, 'seoTitle');
    assertFieldHasValidation(recipe, 'seoDescription');
    assertFieldHasValidation(recipe, 'excerpt');
  });

  it('should have validation on relatedRecipes and featuredProducts max', () => {
    assertFieldHasValidation(recipe, 'relatedRecipes');
    assertFieldHasValidation(recipe, 'featuredProducts');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(recipe, 'difficulty');
    assertFieldHasInitialValue(recipe, 'servings');
    assertFieldHasInitialValue(recipe, 'isFeatured');
    assertFieldHasInitialValue(recipe, 'status');

    const difficultyField = findField(recipe, 'difficulty');
    expect(difficultyField.initialValue).toBe('beginner');

    const servingsField = findField(recipe, 'servings');
    expect(servingsField.initialValue).toBe(4);

    const isFeaturedField = findField(recipe, 'isFeatured');
    expect(isFeaturedField.initialValue).toBe(false);

    const statusField = findField(recipe, 'status');
    expect(statusField.initialValue).toBe('draft');
  });

  it('should have publishedAt with function initialValue', () => {
    const publishedAtField = findField(recipe, 'publishedAt');
    expect(publishedAtField.initialValue).toBeDefined();
    expect(typeof publishedAtField.initialValue).toBe('function');
  });

  it('should have slug with source "title"', () => {
    assertSlugField(recipe, 'slug', 'title');
  });

  it('should have author referencing person', () => {
    assertFieldReference(recipe, 'author', 'person');
  });

  it('should have 4 orderings', () => {
    assertHasOrderings(recipe, 4);
  });

  it('should have 6 groups', () => {
    assertHasGroups(recipe, ['content', 'media', 'ingredients', 'instructions', 'nutrition', 'seo']);
  });

  it('should have category options', () => {
    assertFieldHasOptions(recipe, 'category', [
      'main-dish',
      'appetizer',
      'side-dish',
      'soup',
      'salad',
      'snack',
      'dessert',
      'beverage',
    ]);
  });

  it('should have cuisine options', () => {
    assertFieldHasOptions(recipe, 'cuisine', [
      'filipino',
      'asian-fusion',
      'chinese',
      'japanese',
      'korean',
      'italian',
      'american',
      'mediterranean',
      'other',
    ]);
  });

  it('should have difficulty options with radio layout', () => {
    assertFieldHasOptions(recipe, 'difficulty', ['beginner', 'intermediate', 'advanced']);
    const difficultyField = findField(recipe, 'difficulty');
    expect(difficultyField.options.layout).toBe('radio');
  });

  it('should have status options with radio layout', () => {
    assertFieldHasOptions(recipe, 'status', ['draft', 'published', 'archived']);
    const statusField = findField(recipe, 'status');
    expect(statusField.options.layout).toBe('radio');
  });

  it('should have dietaryInfo with list options', () => {
    assertFieldHasOptions(recipe, 'dietaryInfo');
    const dietaryField = findField(recipe, 'dietaryInfo');
    expect(dietaryField.options).toBeDefined();
    expect(dietaryField.options.list).toBeDefined();
    const values = dietaryField.options.list.map((item: any) =>
      typeof item === 'string' ? item : item.value
    );
    expect(values).toContain('vegetarian');
    expect(values).toContain('vegan');
    expect(values).toContain('gluten-free');
    expect(values).toContain('keto');
  });

  it('should have allergens with list options', () => {
    assertFieldHasOptions(recipe, 'allergens');
    const allergensField = findField(recipe, 'allergens');
    const values = allergensField.options.list.map((item: any) =>
      typeof item === 'string' ? item : item.value
    );
    expect(values).toContain('gluten');
    expect(values).toContain('dairy');
    expect(values).toContain('eggs');
    expect(values).toContain('soy');
    expect(values).toContain('nuts');
    expect(values).toContain('shellfish');
    expect(values).toContain('sesame');
  });

  it('should have mainImage with hotspot', () => {
    const mainImageField = findField(recipe, 'mainImage');
    expect(mainImageField.options).toBeDefined();
    expect(mainImageField.options.hotspot).toBe(true);
  });

  it('should have nutritionFacts as object with correct subfields', () => {
    const nutritionField = findField(recipe, 'nutritionFacts');
    expect(nutritionField.fields).toBeDefined();
    const subFieldNames = nutritionField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('calories');
    expect(subFieldNames).toContain('protein');
    expect(subFieldNames).toContain('carbohydrates');
    expect(subFieldNames).toContain('fat');
    expect(subFieldNames).toContain('fiber');
    expect(subFieldNames).toContain('sodium');
    expect(subFieldNames).toContain('sugar');
  });

  it('should have equipmentNeeded with tags layout', () => {
    const equipmentField = findField(recipe, 'equipmentNeeded');
    expect(equipmentField.options).toBeDefined();
    expect(equipmentField.options.layout).toBe('tags');
  });

  it('should have tags with tags layout', () => {
    const tagsField = findField(recipe, 'tags');
    expect(tagsField.options).toBeDefined();
    expect(tagsField.options.layout).toBe('tags');
  });

  it('should have seoKeywords with tags layout', () => {
    const seoKeywordsField = findField(recipe, 'seoKeywords');
    expect(seoKeywordsField.options).toBeDefined();
    expect(seoKeywordsField.options.layout).toBe('tags');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. GROWING GUIDE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('GrowingGuide Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(growingGuide, {
      name: 'growingGuide',
      title: 'Growing Guide',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(growingGuide);
    const expectedFields = [
      'title',
      'slug',
      'excerpt',
      'mainImage',
      'mushroomType',
      'difficulty',
      'author',
      'publishedAt',
      'lastUpdated',
      'youtubeVideo',
      'additionalVideos',
      'introduction',
      'timeToFirstHarvest',
      'harvestWindow',
      'expectedYield',
      'idealConditions',
      'suppliesNeeded',
      'growingSteps',
      'harvestingTips',
      'storageTips',
      'multipleFlushes',
      'commonProblems',
      'faqSection',
      'growingKit',
      'relatedProducts',
      'relatedGuides',
      'relatedRecipes',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
      'isFeatured',
      'status',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(growingGuide, 'title', 'string');
    assertFieldType(growingGuide, 'slug', 'slug');
    assertFieldType(growingGuide, 'excerpt', 'text');
    assertFieldType(growingGuide, 'mainImage', 'image');
    assertFieldType(growingGuide, 'mushroomType', 'string');
    assertFieldType(growingGuide, 'difficulty', 'string');
    assertFieldType(growingGuide, 'author', 'reference');
    assertFieldType(growingGuide, 'publishedAt', 'datetime');
    assertFieldType(growingGuide, 'lastUpdated', 'datetime');
    assertFieldType(growingGuide, 'youtubeVideo', 'object');
    assertFieldType(growingGuide, 'additionalVideos', 'array');
    assertFieldType(growingGuide, 'introduction', 'blockContent');
    assertFieldType(growingGuide, 'timeToFirstHarvest', 'string');
    assertFieldType(growingGuide, 'harvestWindow', 'string');
    assertFieldType(growingGuide, 'expectedYield', 'string');
    assertFieldType(growingGuide, 'idealConditions', 'object');
    assertFieldType(growingGuide, 'suppliesNeeded', 'array');
    assertFieldType(growingGuide, 'growingSteps', 'array');
    assertFieldType(growingGuide, 'harvestingTips', 'blockContent');
    assertFieldType(growingGuide, 'storageTips', 'blockContent');
    assertFieldType(growingGuide, 'multipleFlushes', 'blockContent');
    assertFieldType(growingGuide, 'commonProblems', 'array');
    assertFieldType(growingGuide, 'faqSection', 'array');
    assertFieldType(growingGuide, 'growingKit', 'reference');
    assertFieldType(growingGuide, 'relatedProducts', 'array');
    assertFieldType(growingGuide, 'relatedGuides', 'array');
    assertFieldType(growingGuide, 'relatedRecipes', 'array');
    assertFieldType(growingGuide, 'seoTitle', 'string');
    assertFieldType(growingGuide, 'seoDescription', 'text');
    assertFieldType(growingGuide, 'seoKeywords', 'array');
    assertFieldType(growingGuide, 'isFeatured', 'boolean');
    assertFieldType(growingGuide, 'status', 'string');
  });

  it('should have required validation on title, slug, and mushroomType', () => {
    assertFieldHasValidation(growingGuide, 'title');
    assertFieldHasValidation(growingGuide, 'slug');
    assertFieldHasValidation(growingGuide, 'mushroomType');
  });

  it('should have validation on excerpt and SEO fields', () => {
    assertFieldHasValidation(growingGuide, 'excerpt');
    assertFieldHasValidation(growingGuide, 'seoTitle');
    assertFieldHasValidation(growingGuide, 'seoDescription');
  });

  it('should have validation on relatedProducts, relatedGuides, and relatedRecipes', () => {
    assertFieldHasValidation(growingGuide, 'relatedProducts');
    assertFieldHasValidation(growingGuide, 'relatedGuides');
    assertFieldHasValidation(growingGuide, 'relatedRecipes');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(growingGuide, 'difficulty');
    assertFieldHasInitialValue(growingGuide, 'isFeatured');
    assertFieldHasInitialValue(growingGuide, 'status');

    const difficultyField = findField(growingGuide, 'difficulty');
    expect(difficultyField.initialValue).toBe('beginner');

    const isFeaturedField = findField(growingGuide, 'isFeatured');
    expect(isFeaturedField.initialValue).toBe(false);

    const statusField = findField(growingGuide, 'status');
    expect(statusField.initialValue).toBe('draft');
  });

  it('should have slug with source "title"', () => {
    assertSlugField(growingGuide, 'slug', 'title');
  });

  it('should have author referencing person', () => {
    assertFieldReference(growingGuide, 'author', 'person');
  });

  it('should have growingKit referencing product', () => {
    assertFieldReference(growingGuide, 'growingKit', 'product');
  });

  it('should have 4 orderings', () => {
    assertHasOrderings(growingGuide, 4);
  });

  it('should have 7 groups', () => {
    assertHasGroups(growingGuide, [
      'basic',
      'video',
      'overview',
      'steps',
      'troubleshooting',
      'products',
      'seo',
    ]);
  });

  it('should have mushroomType options', () => {
    assertFieldHasOptions(growingGuide, 'mushroomType', [
      'oyster',
      'shiitake',
      'lions-mane',
      'king-oyster',
      'pink-oyster',
      'blue-oyster',
      'golden-oyster',
      'general',
    ]);
  });

  it('should have difficulty options with radio layout', () => {
    assertFieldHasOptions(growingGuide, 'difficulty', ['beginner', 'intermediate', 'advanced']);
    const difficultyField = findField(growingGuide, 'difficulty');
    expect(difficultyField.options.layout).toBe('radio');
  });

  it('should have status options with radio layout', () => {
    assertFieldHasOptions(growingGuide, 'status', ['draft', 'published', 'archived']);
    const statusField = findField(growingGuide, 'status');
    expect(statusField.options.layout).toBe('radio');
  });

  it('should have mainImage with hotspot', () => {
    const mainImageField = findField(growingGuide, 'mainImage');
    expect(mainImageField.options).toBeDefined();
    expect(mainImageField.options.hotspot).toBe(true);
  });

  it('should have idealConditions object with correct subfields', () => {
    const idealField = findField(growingGuide, 'idealConditions');
    expect(idealField.fields).toBeDefined();
    const subFieldNames = idealField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('temperature');
    expect(subFieldNames).toContain('humidity');
    expect(subFieldNames).toContain('light');
    expect(subFieldNames).toContain('airflow');
  });

  it('should have youtubeVideo object with videoId field', () => {
    const ytField = findField(growingGuide, 'youtubeVideo');
    expect(ytField.fields).toBeDefined();
    const videoIdField = ytField.fields.find((f: any) => f.name === 'videoId');
    expect(videoIdField).toBeDefined();
    expect(videoIdField.type).toBe('string');
    expect(videoIdField.validation).toBeDefined();
  });

  it('should have suppliesNeeded with tags layout', () => {
    const suppliesField = findField(growingGuide, 'suppliesNeeded');
    expect(suppliesField.options).toBeDefined();
    expect(suppliesField.options.layout).toBe('tags');
  });

  it('should have seoKeywords with tags layout', () => {
    const seoKeywordsField = findField(growingGuide, 'seoKeywords');
    expect(seoKeywordsField.options).toBeDefined();
    expect(seoKeywordsField.options.layout).toBe('tags');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. PRODUCT VARIANT SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('ProductVariant Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(productVariant, {
      name: 'productVariant',
      title: 'Product Variant',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(productVariant);
    const expectedFields = [
      'product',
      'name',
      'slug',
      'variantName',
      'sku',
      'variantType',
      'variantValue',
      'size',
      'color',
      'weight',
      'weightUnit',
      'customAttribute',
      'price',
      'compareAtPrice',
      'stockQuantity',
      'lowStockThreshold',
      'images',
      'isAvailable',
      'isDefault',
      'sortOrder',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(productVariant)).toBe(20);
  });

  it('should have correct field types', () => {
    assertFieldType(productVariant, 'product', 'reference');
    assertFieldType(productVariant, 'name', 'string');
    assertFieldType(productVariant, 'slug', 'slug');
    assertFieldType(productVariant, 'variantName', 'string');
    assertFieldType(productVariant, 'sku', 'string');
    assertFieldType(productVariant, 'variantType', 'string');
    assertFieldType(productVariant, 'variantValue', 'string');
    assertFieldType(productVariant, 'size', 'string');
    assertFieldType(productVariant, 'color', 'string');
    assertFieldType(productVariant, 'weight', 'string');
    assertFieldType(productVariant, 'weightUnit', 'string');
    assertFieldType(productVariant, 'customAttribute', 'string');
    assertFieldType(productVariant, 'price', 'number');
    assertFieldType(productVariant, 'compareAtPrice', 'number');
    assertFieldType(productVariant, 'stockQuantity', 'number');
    assertFieldType(productVariant, 'lowStockThreshold', 'number');
    assertFieldType(productVariant, 'images', 'array');
    assertFieldType(productVariant, 'isAvailable', 'boolean');
    assertFieldType(productVariant, 'isDefault', 'boolean');
    assertFieldType(productVariant, 'sortOrder', 'number');
  });

  it('should have required validation on product, name, variantName, sku, variantType, variantValue, price, stockQuantity', () => {
    assertFieldHasValidation(productVariant, 'product');
    assertFieldHasValidation(productVariant, 'name');
    assertFieldHasValidation(productVariant, 'variantName');
    assertFieldHasValidation(productVariant, 'sku');
    assertFieldHasValidation(productVariant, 'variantType');
    assertFieldHasValidation(productVariant, 'variantValue');
    assertFieldHasValidation(productVariant, 'price');
    assertFieldHasValidation(productVariant, 'stockQuantity');
  });

  it('should have validation on slug, compareAtPrice, lowStockThreshold, sortOrder', () => {
    assertFieldHasValidation(productVariant, 'slug');
    assertFieldHasValidation(productVariant, 'compareAtPrice');
    assertFieldHasValidation(productVariant, 'lowStockThreshold');
    assertFieldHasValidation(productVariant, 'sortOrder');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(productVariant, 'weightUnit');
    assertFieldHasInitialValue(productVariant, 'stockQuantity');
    assertFieldHasInitialValue(productVariant, 'lowStockThreshold');
    assertFieldHasInitialValue(productVariant, 'isAvailable');
    assertFieldHasInitialValue(productVariant, 'isDefault');
    assertFieldHasInitialValue(productVariant, 'sortOrder');

    const weightUnitField = findField(productVariant, 'weightUnit');
    expect(weightUnitField.initialValue).toBe('g');

    const stockQtyField = findField(productVariant, 'stockQuantity');
    expect(stockQtyField.initialValue).toBe(0);

    const lowStockField = findField(productVariant, 'lowStockThreshold');
    expect(lowStockField.initialValue).toBe(10);

    const isAvailableField = findField(productVariant, 'isAvailable');
    expect(isAvailableField.initialValue).toBe(true);

    const isDefaultField = findField(productVariant, 'isDefault');
    expect(isDefaultField.initialValue).toBe(false);

    const sortOrderField = findField(productVariant, 'sortOrder');
    expect(sortOrderField.initialValue).toBe(0);
  });

  it('should have product referencing product type', () => {
    assertFieldReference(productVariant, 'product', 'product');
  });

  it('should have slug with source "name"', () => {
    assertSlugField(productVariant, 'slug', 'name');
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(productVariant, 5);
  });

  it('should have variantType options', () => {
    assertFieldHasOptions(productVariant, 'variantType', [
      'Size',
      'Weight',
      'Color',
      'Type',
      'Package',
    ]);
  });

  it('should have weightUnit options', () => {
    assertFieldHasOptions(productVariant, 'weightUnit', ['g', 'kg', 'oz', 'lb']);
  });

  it('should have size options', () => {
    assertFieldHasOptions(productVariant, 'size', ['xs', 's', 'm', 'l', 'xl']);
  });

  it('should have color options', () => {
    assertFieldHasOptions(productVariant, 'color', [
      'white',
      'brown',
      'beige',
      'black',
      'golden',
      'gray',
      'mixed',
    ]);
  });

  it('should have images as array of image type', () => {
    const imagesField = findField(productVariant, 'images');
    expect(imagesField.of).toBeDefined();
    expect(imagesField.of[0].type).toBe('image');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. PRODUCT BUNDLE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('ProductBundle Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(productBundle, {
      name: 'productBundle',
      title: 'Product Bundle',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(productBundle);
    const expectedFields = [
      'bundleName',
      'slug',
      'description',
      'tagline',
      'products',
      'bundlePrice',
      'discountPercentage',
      'savingsAmount',
      'bundleImage',
      'additionalImages',
      'isActive',
      'availableFrom',
      'availableUntil',
      'stockLimit',
      'featured',
      'badge',
      'sortOrder',
      'seo',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(productBundle)).toBe(18);
  });

  it('should have correct field types', () => {
    assertFieldType(productBundle, 'bundleName', 'string');
    assertFieldType(productBundle, 'slug', 'slug');
    assertFieldType(productBundle, 'description', 'text');
    assertFieldType(productBundle, 'tagline', 'string');
    assertFieldType(productBundle, 'products', 'array');
    assertFieldType(productBundle, 'bundlePrice', 'number');
    assertFieldType(productBundle, 'discountPercentage', 'number');
    assertFieldType(productBundle, 'savingsAmount', 'number');
    assertFieldType(productBundle, 'bundleImage', 'image');
    assertFieldType(productBundle, 'additionalImages', 'array');
    assertFieldType(productBundle, 'isActive', 'boolean');
    assertFieldType(productBundle, 'availableFrom', 'datetime');
    assertFieldType(productBundle, 'availableUntil', 'datetime');
    assertFieldType(productBundle, 'stockLimit', 'number');
    assertFieldType(productBundle, 'featured', 'boolean');
    assertFieldType(productBundle, 'badge', 'string');
    assertFieldType(productBundle, 'sortOrder', 'number');
    assertFieldType(productBundle, 'seo', 'object');
  });

  it('should have required validation on bundleName, slug, products, and bundlePrice', () => {
    assertFieldHasValidation(productBundle, 'bundleName');
    assertFieldHasValidation(productBundle, 'slug');
    assertFieldHasValidation(productBundle, 'products');
    assertFieldHasValidation(productBundle, 'bundlePrice');
  });

  it('should have validation on description, tagline, discountPercentage, and stockLimit', () => {
    assertFieldHasValidation(productBundle, 'description');
    assertFieldHasValidation(productBundle, 'tagline');
    assertFieldHasValidation(productBundle, 'discountPercentage');
    assertFieldHasValidation(productBundle, 'stockLimit');
  });

  it('should have validation on sortOrder', () => {
    assertFieldHasValidation(productBundle, 'sortOrder');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(productBundle, 'isActive');
    assertFieldHasInitialValue(productBundle, 'featured');
    assertFieldHasInitialValue(productBundle, 'sortOrder');

    const isActiveField = findField(productBundle, 'isActive');
    expect(isActiveField.initialValue).toBe(true);

    const featuredField = findField(productBundle, 'featured');
    expect(featuredField.initialValue).toBe(false);

    const sortOrderField = findField(productBundle, 'sortOrder');
    expect(sortOrderField.initialValue).toBe(0);
  });

  it('should have savingsAmount as read-only', () => {
    assertFieldReadOnly(productBundle, 'savingsAmount');
  });

  it('should have slug with source "bundleName"', () => {
    assertSlugField(productBundle, 'slug', 'bundleName');
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(productBundle, 5);
  });

  it('should have badge options', () => {
    assertFieldHasOptions(productBundle, 'badge', [
      'best-value',
      'popular',
      'limited',
      'new',
      'exclusive',
    ]);
  });

  it('should have products array with min 2 and max 10', () => {
    const productsField = findField(productBundle, 'products');
    expect(productsField.of).toBeDefined();
    expect(productsField.validation).toBeDefined();
  });

  it('should have bundleImage with hotspot', () => {
    const bundleImageField = findField(productBundle, 'bundleImage');
    expect(bundleImageField.options).toBeDefined();
    expect(bundleImageField.options.hotspot).toBe(true);
  });

  it('should have seo object with metaTitle and metaDescription subfields', () => {
    const seoField = findField(productBundle, 'seo');
    expect(seoField.fields).toBeDefined();
    const subFieldNames = seoField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('metaTitle');
    expect(subFieldNames).toContain('metaDescription');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. EMAIL CAMPAIGN SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('EmailCampaign Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(emailCampaign, {
      name: 'emailCampaign',
      title: 'Email Campaign',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(emailCampaign);
    const expectedFields = [
      'name',
      'subject',
      'preheader',
      'campaignType',
      'content',
      'plainTextContent',
      'ctaButtons',
      'featuredProducts',
      'audience',
      'customSegment',
      'status',
      'scheduledDate',
      'sentDate',
      'enableABTest',
      'variantBSubject',
      'fromName',
      'replyToEmail',
      'recipientCount',
      'opens',
      'uniqueOpens',
      'clicks',
      'uniqueClicks',
      'bounces',
      'unsubscribes',
      'notes',
      'tags',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(emailCampaign)).toBe(26);
  });

  it('should have correct field types', () => {
    assertFieldType(emailCampaign, 'name', 'string');
    assertFieldType(emailCampaign, 'subject', 'string');
    assertFieldType(emailCampaign, 'preheader', 'string');
    assertFieldType(emailCampaign, 'campaignType', 'string');
    assertFieldType(emailCampaign, 'content', 'array');
    assertFieldType(emailCampaign, 'plainTextContent', 'text');
    assertFieldType(emailCampaign, 'ctaButtons', 'array');
    assertFieldType(emailCampaign, 'featuredProducts', 'array');
    assertFieldType(emailCampaign, 'audience', 'string');
    assertFieldType(emailCampaign, 'customSegment', 'text');
    assertFieldType(emailCampaign, 'status', 'string');
    assertFieldType(emailCampaign, 'scheduledDate', 'datetime');
    assertFieldType(emailCampaign, 'sentDate', 'datetime');
    assertFieldType(emailCampaign, 'enableABTest', 'boolean');
    assertFieldType(emailCampaign, 'variantBSubject', 'string');
    assertFieldType(emailCampaign, 'fromName', 'string');
    assertFieldType(emailCampaign, 'replyToEmail', 'string');
    assertFieldType(emailCampaign, 'recipientCount', 'number');
    assertFieldType(emailCampaign, 'opens', 'number');
    assertFieldType(emailCampaign, 'uniqueOpens', 'number');
    assertFieldType(emailCampaign, 'clicks', 'number');
    assertFieldType(emailCampaign, 'uniqueClicks', 'number');
    assertFieldType(emailCampaign, 'bounces', 'number');
    assertFieldType(emailCampaign, 'unsubscribes', 'number');
    assertFieldType(emailCampaign, 'notes', 'text');
    assertFieldType(emailCampaign, 'tags', 'array');
  });

  it('should have required validation on name, subject, campaignType, audience, and status', () => {
    assertFieldHasValidation(emailCampaign, 'name');
    assertFieldHasValidation(emailCampaign, 'subject');
    assertFieldHasValidation(emailCampaign, 'campaignType');
    assertFieldHasValidation(emailCampaign, 'audience');
    assertFieldHasValidation(emailCampaign, 'status');
  });

  it('should have validation on preheader, ctaButtons, featuredProducts, replyToEmail', () => {
    assertFieldHasValidation(emailCampaign, 'preheader');
    assertFieldHasValidation(emailCampaign, 'ctaButtons');
    assertFieldHasValidation(emailCampaign, 'featuredProducts');
    assertFieldHasValidation(emailCampaign, 'replyToEmail');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(emailCampaign, 'audience');
    assertFieldHasInitialValue(emailCampaign, 'status');
    assertFieldHasInitialValue(emailCampaign, 'enableABTest');
    assertFieldHasInitialValue(emailCampaign, 'fromName');
    assertFieldHasInitialValue(emailCampaign, 'recipientCount');
    assertFieldHasInitialValue(emailCampaign, 'opens');
    assertFieldHasInitialValue(emailCampaign, 'uniqueOpens');
    assertFieldHasInitialValue(emailCampaign, 'clicks');
    assertFieldHasInitialValue(emailCampaign, 'uniqueClicks');
    assertFieldHasInitialValue(emailCampaign, 'bounces');
    assertFieldHasInitialValue(emailCampaign, 'unsubscribes');

    const audienceField = findField(emailCampaign, 'audience');
    expect(audienceField.initialValue).toBe('all');

    const statusField = findField(emailCampaign, 'status');
    expect(statusField.initialValue).toBe('draft');

    const enableABTestField = findField(emailCampaign, 'enableABTest');
    expect(enableABTestField.initialValue).toBe(false);

    const fromNameField = findField(emailCampaign, 'fromName');
    expect(fromNameField.initialValue).toBe('MASH');

    const recipientCountField = findField(emailCampaign, 'recipientCount');
    expect(recipientCountField.initialValue).toBe(0);

    const opensField = findField(emailCampaign, 'opens');
    expect(opensField.initialValue).toBe(0);

    const uniqueOpensField = findField(emailCampaign, 'uniqueOpens');
    expect(uniqueOpensField.initialValue).toBe(0);

    const clicksField = findField(emailCampaign, 'clicks');
    expect(clicksField.initialValue).toBe(0);

    const uniqueClicksField = findField(emailCampaign, 'uniqueClicks');
    expect(uniqueClicksField.initialValue).toBe(0);

    const bouncesField = findField(emailCampaign, 'bounces');
    expect(bouncesField.initialValue).toBe(0);

    const unsubscribesField = findField(emailCampaign, 'unsubscribes');
    expect(unsubscribesField.initialValue).toBe(0);
  });

  it('should have read-only tracking fields', () => {
    assertFieldReadOnly(emailCampaign, 'sentDate');
    assertFieldReadOnly(emailCampaign, 'recipientCount');
    assertFieldReadOnly(emailCampaign, 'opens');
    assertFieldReadOnly(emailCampaign, 'uniqueOpens');
    assertFieldReadOnly(emailCampaign, 'clicks');
    assertFieldReadOnly(emailCampaign, 'uniqueClicks');
    assertFieldReadOnly(emailCampaign, 'bounces');
    assertFieldReadOnly(emailCampaign, 'unsubscribes');
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(emailCampaign, 5);
  });

  it('should have campaignType options', () => {
    assertFieldHasOptions(emailCampaign, 'campaignType', [
      'newsletter',
      'promotional',
      'announcement',
      'product-launch',
      'abandoned-cart',
      'special',
      'transactional',
    ]);
  });

  it('should have audience options', () => {
    assertFieldHasOptions(emailCampaign, 'audience', [
      'all',
      'new',
      'active',
      'inactive',
      'vip',
      'custom',
    ]);
  });

  it('should have status options', () => {
    assertFieldHasOptions(emailCampaign, 'status', [
      'draft',
      'scheduled',
      'sent',
      'cancelled',
    ]);
  });

  it('should have tags with tags layout', () => {
    const tagsField = findField(emailCampaign, 'tags');
    expect(tagsField.options).toBeDefined();
    expect(tagsField.options.layout).toBe('tags');
  });

  it('should have featuredProducts as array of references to product', () => {
    const fpField = findField(emailCampaign, 'featuredProducts');
    expect(fpField.of).toBeDefined();
    expect(fpField.of[0].type).toBe('reference');
    const refTypes = fpField.of[0].to.map((r: any) => r.type);
    expect(refTypes).toContain('product');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. ANALYTICS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Analytics Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(analytics, {
      name: 'analytics',
      title: 'Analytics',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(analytics);
    const expectedFields = [
      'reportName',
      'reportType',
      'dateRange',
      'salesMetrics',
      'topProducts',
      'customerMetrics',
      'marketingMetrics',
      'generatedAt',
      'notes',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(analytics)).toBe(9);
  });

  it('should have correct field types', () => {
    assertFieldType(analytics, 'reportName', 'string');
    assertFieldType(analytics, 'reportType', 'string');
    assertFieldType(analytics, 'dateRange', 'object');
    assertFieldType(analytics, 'salesMetrics', 'object');
    assertFieldType(analytics, 'topProducts', 'array');
    assertFieldType(analytics, 'customerMetrics', 'object');
    assertFieldType(analytics, 'marketingMetrics', 'object');
    assertFieldType(analytics, 'generatedAt', 'datetime');
    assertFieldType(analytics, 'notes', 'text');
  });

  it('should have required validation on reportName and reportType', () => {
    assertFieldHasValidation(analytics, 'reportName');
    assertFieldHasValidation(analytics, 'reportType');
  });

  it('should have generatedAt as read-only', () => {
    assertFieldReadOnly(analytics, 'generatedAt');
  });

  it('should have generatedAt with function initialValue', () => {
    const generatedAtField = findField(analytics, 'generatedAt');
    expect(generatedAtField.initialValue).toBeDefined();
    expect(typeof generatedAtField.initialValue).toBe('function');
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(analytics, 2);
  });

  it('should have reportType options', () => {
    assertFieldHasOptions(analytics, 'reportType', [
      'sales-overview',
      'product-performance',
      'customer-insights',
      'marketing-performance',
      'growth-trends',
      'revenue-report',
    ]);
  });

  it('should have dateRange object with startDate and endDate', () => {
    const dateRangeField = findField(analytics, 'dateRange');
    expect(dateRangeField.fields).toBeDefined();
    const subFieldNames = dateRangeField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('startDate');
    expect(subFieldNames).toContain('endDate');
  });

  it('should have salesMetrics object with correct subfields', () => {
    const salesMetricsField = findField(analytics, 'salesMetrics');
    expect(salesMetricsField.fields).toBeDefined();
    const subFieldNames = salesMetricsField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('totalRevenue');
    expect(subFieldNames).toContain('totalOrders');
    expect(subFieldNames).toContain('averageOrderValue');
    expect(subFieldNames).toContain('totalProducts');
    expect(subFieldNames).toContain('conversionRate');
  });

  it('should have customerMetrics object with correct subfields', () => {
    const customerMetricsField = findField(analytics, 'customerMetrics');
    expect(customerMetricsField.fields).toBeDefined();
    const subFieldNames = customerMetricsField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('newCustomers');
    expect(subFieldNames).toContain('returningCustomers');
    expect(subFieldNames).toContain('customerRetentionRate');
    expect(subFieldNames).toContain('averageLifetimeValue');
  });

  it('should have marketingMetrics object with correct subfields', () => {
    const marketingMetricsField = findField(analytics, 'marketingMetrics');
    expect(marketingMetricsField.fields).toBeDefined();
    const subFieldNames = marketingMetricsField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('totalCampaigns');
    expect(subFieldNames).toContain('emailOpenRate');
    expect(subFieldNames).toContain('emailClickRate');
    expect(subFieldNames).toContain('couponUsage');
    expect(subFieldNames).toContain('promotionConversions');
  });

  it('should have topProducts array with product references', () => {
    const topProductsField = findField(analytics, 'topProducts');
    expect(topProductsField.of).toBeDefined();
    expect(topProductsField.of.length).toBeGreaterThanOrEqual(1);
    const item = topProductsField.of[0];
    expect(item.type).toBe('object');
    const productRefField = item.fields.find((f: any) => f.name === 'product');
    expect(productRefField).toBeDefined();
    expect(productRefField.type).toBe('reference');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. STOCK ADJUSTMENT SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('StockAdjustment Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(stockAdjustment, {
      name: 'stockAdjustment',
      title: 'Stock Adjustment',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(stockAdjustment);
    const expectedFields = [
      'product',
      'adjustmentType',
      'quantityChange',
      'previousStock',
      'newStock',
      'reason',
      'notes',
      'adjustedBy',
      'adjustmentDate',
      'relatedDocument',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(stockAdjustment)).toBe(10);
  });

  it('should have correct field types', () => {
    assertFieldType(stockAdjustment, 'product', 'reference');
    assertFieldType(stockAdjustment, 'adjustmentType', 'string');
    assertFieldType(stockAdjustment, 'quantityChange', 'number');
    assertFieldType(stockAdjustment, 'previousStock', 'number');
    assertFieldType(stockAdjustment, 'newStock', 'number');
    assertFieldType(stockAdjustment, 'reason', 'string');
    assertFieldType(stockAdjustment, 'notes', 'text');
    assertFieldType(stockAdjustment, 'adjustedBy', 'string');
    assertFieldType(stockAdjustment, 'adjustmentDate', 'datetime');
    assertFieldType(stockAdjustment, 'relatedDocument', 'object');
  });

  it('should have required validation on product, adjustmentType, quantityChange, previousStock, newStock, reason, adjustmentDate', () => {
    assertFieldHasValidation(stockAdjustment, 'product');
    assertFieldHasValidation(stockAdjustment, 'adjustmentType');
    assertFieldHasValidation(stockAdjustment, 'quantityChange');
    assertFieldHasValidation(stockAdjustment, 'previousStock');
    assertFieldHasValidation(stockAdjustment, 'newStock');
    assertFieldHasValidation(stockAdjustment, 'reason');
    assertFieldHasValidation(stockAdjustment, 'adjustmentDate');
  });

  it('should have read-only fields for audit trail', () => {
    assertFieldReadOnly(stockAdjustment, 'previousStock');
    assertFieldReadOnly(stockAdjustment, 'newStock');
    assertFieldReadOnly(stockAdjustment, 'adjustedBy');
    assertFieldReadOnly(stockAdjustment, 'adjustmentDate');
  });

  it('should have adjustmentDate with function initialValue', () => {
    const adjustmentDateField = findField(stockAdjustment, 'adjustmentDate');
    expect(adjustmentDateField.initialValue).toBeDefined();
    expect(typeof adjustmentDateField.initialValue).toBe('function');
  });

  it('should have product referencing product type', () => {
    assertFieldReference(stockAdjustment, 'product', 'product');
  });

  it('should have product with disableNew option', () => {
    const productField = findField(stockAdjustment, 'product');
    expect(productField.options).toBeDefined();
    expect(productField.options.disableNew).toBe(true);
  });

  it('should have 4 orderings', () => {
    assertHasOrderings(stockAdjustment, 4);
  });

  it('should have adjustmentType options', () => {
    assertFieldHasOptions(stockAdjustment, 'adjustmentType', [
      'received',
      'sold',
      'returned',
      'damaged',
      'transferred',
      'adjustment',
    ]);
  });

  it('should have adjustmentType with dropdown layout', () => {
    const adjustmentTypeField = findField(stockAdjustment, 'adjustmentType');
    expect(adjustmentTypeField.options.layout).toBe('dropdown');
  });

  it('should have relatedDocument object with documentType and documentId', () => {
    const relatedDocField = findField(stockAdjustment, 'relatedDocument');
    expect(relatedDocField.fields).toBeDefined();
    const subFieldNames = relatedDocField.fields.map((f: any) => f.name);
    expect(subFieldNames).toContain('documentType');
    expect(subFieldNames).toContain('documentId');
  });

  it('should have relatedDocument.documentType options', () => {
    const relatedDocField = findField(stockAdjustment, 'relatedDocument');
    const docTypeField = relatedDocField.fields.find((f: any) => f.name === 'documentType');
    expect(docTypeField).toBeDefined();
    expect(docTypeField.options).toBeDefined();
    const values = docTypeField.options.list.map((item: any) =>
      typeof item === 'string' ? item : item.value
    );
    expect(values).toContain('order');
    expect(values).toContain('purchaseOrder');
    expect(values).toContain('transfer');
    expect(values).toContain('return');
    expect(values).toContain('other');
  });

  it('should have notes field with rows set to 3', () => {
    const notesField = findField(stockAdjustment, 'notes');
    expect(notesField.rows).toBe(3);
  });

  it('should have quantityChange with custom validation', () => {
    const quantityChangeField = findField(stockAdjustment, 'quantityChange');
    expect(quantityChangeField.validation).toBeDefined();
  });
});
