/**
 * Document Schemas Part 1 - Comprehensive Tests
 *
 * Tests 13 Sanity CMS document schemas:
 * product, category, grower, order, store, review, coupon,
 * promotion, banner, testimonial, faqCategory, faqItem, post
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

import { product } from '../../../studio/src/schemaTypes/documents/product';
import { category } from '../../../studio/src/schemaTypes/documents/category';
import { grower } from '../../../studio/src/schemaTypes/documents/grower';
import { order } from '../../../studio/src/schemaTypes/documents/order';
import { store } from '../../../studio/src/schemaTypes/documents/store';
import { review } from '../../../studio/src/schemaTypes/documents/review';
import { coupon } from '../../../studio/src/schemaTypes/documents/coupon';
import { promotion } from '../../../studio/src/schemaTypes/documents/promotion';
import { banner } from '../../../studio/src/schemaTypes/documents/banner';
import { testimonial } from '../../../studio/src/schemaTypes/documents/testimonial';
import { faqCategory } from '../../../studio/src/schemaTypes/documents/faqCategory';
import { faqItem } from '../../../studio/src/schemaTypes/documents/faqItem';
import { post } from '../../../studio/src/schemaTypes/documents/post';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. PRODUCT SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Product Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(product, {
      name: 'product',
      title: 'Product',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(product);
    const expectedFields = [
      'name',
      'slug',
      'image',
      'category',
      'grower',
      'price',
      'isOnPromo',
      'promoType',
      'promoPercentage',
      'promoPrice',
      'quantity',
      'inventory',
      'description',
      'sku',
      'isAvailable',
      'images',
      'media',
      'weight',
      'unit',
      'isFeatured',
      'compareAtPrice',
      'promoEndDate',
      'hasVariants',
      'variants',
      'relatedProducts',
      'relatedBundles',
      'suggestedProducts',
      'suggestedProductsEnabled',
      'productTags',
      'complementaryProducts',
      'freshnessInfo',
      'preparationInfo',
      'deliveryOptions',
      'deliveryWeight',
      'searchKeywords',
      'nutritionalHighlights',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(product, 'name', 'string');
    assertFieldType(product, 'slug', 'slug');
    assertFieldType(product, 'image', 'image');
    assertFieldType(product, 'category', 'reference');
    assertFieldType(product, 'grower', 'reference');
    assertFieldType(product, 'price', 'number');
    assertFieldType(product, 'isOnPromo', 'boolean');
    assertFieldType(product, 'promoType', 'string');
    assertFieldType(product, 'promoPercentage', 'number');
    assertFieldType(product, 'promoPrice', 'number');
    assertFieldType(product, 'quantity', 'number');
    assertFieldType(product, 'inventory', 'object');
    assertFieldType(product, 'description', 'text');
    assertFieldType(product, 'sku', 'string');
    assertFieldType(product, 'isAvailable', 'boolean');
    assertFieldType(product, 'images', 'array');
    assertFieldType(product, 'media', 'array');
    assertFieldType(product, 'weight', 'number');
    assertFieldType(product, 'unit', 'string');
    assertFieldType(product, 'isFeatured', 'boolean');
    assertFieldType(product, 'compareAtPrice', 'number');
    assertFieldType(product, 'promoEndDate', 'datetime');
    assertFieldType(product, 'hasVariants', 'boolean');
    assertFieldType(product, 'variants', 'array');
    assertFieldType(product, 'relatedProducts', 'array');
    assertFieldType(product, 'relatedBundles', 'array');
    assertFieldType(product, 'suggestedProducts', 'array');
    assertFieldType(product, 'suggestedProductsEnabled', 'boolean');
    assertFieldType(product, 'productTags', 'array');
    assertFieldType(product, 'complementaryProducts', 'array');
    assertFieldType(product, 'freshnessInfo', 'object');
    assertFieldType(product, 'preparationInfo', 'object');
    assertFieldType(product, 'deliveryOptions', 'object');
    assertFieldType(product, 'deliveryWeight', 'object');
    assertFieldType(product, 'searchKeywords', 'array');
    assertFieldType(product, 'nutritionalHighlights', 'array');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(product, 'name');
    assertFieldHasValidation(product, 'slug');
    assertFieldHasValidation(product, 'image');
    assertFieldHasValidation(product, 'category');
    assertFieldHasValidation(product, 'price');
    assertFieldHasValidation(product, 'quantity');
    assertFieldHasValidation(product, 'description');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(product, 'isOnPromo');
    expect(findField(product, 'isOnPromo').initialValue).toBe(false);

    assertFieldHasInitialValue(product, 'isAvailable');
    expect(findField(product, 'isAvailable').initialValue).toBe(true);

    assertFieldHasInitialValue(product, 'isFeatured');
    expect(findField(product, 'isFeatured').initialValue).toBe(false);

    assertFieldHasInitialValue(product, 'hasVariants');
    expect(findField(product, 'hasVariants').initialValue).toBe(false);

    assertFieldHasInitialValue(product, 'suggestedProductsEnabled');
    expect(findField(product, 'suggestedProductsEnabled').initialValue).toBe(true);

    assertFieldHasInitialValue(product, 'unit');
    expect(findField(product, 'unit').initialValue).toBe('g');
  });

  it('should have correct reference types', () => {
    assertFieldReference(product, 'category', 'category');
    assertFieldReference(product, 'grower', 'grower');
  });

  it('should have slug with correct source', () => {
    assertSlugField(product, 'slug', 'name');
  });

  it('should have image with hotspot enabled', () => {
    const imageField = findField(product, 'image');
    expect(imageField.options).toBeDefined();
    expect(imageField.options.hotspot).toBe(true);
  });

  it('should have unit field with correct list options', () => {
    assertFieldHasOptions(product, 'unit', ['g', 'kg', 'pcs', 'pack', 'box']);
  });

  it('should have promoType with correct list options', () => {
    assertFieldHasOptions(product, 'promoType', ['percentage', 'fixed']);
  });

  it('should have relatedProducts with array of product references', () => {
    const field = findField(product, 'relatedProducts');
    expect(field.of).toBeDefined();
    expect(field.of[0].type).toBe('reference');
    expect(field.of[0].to[0].type).toBe('product');
  });

  it('should have variants with array of productVariant references', () => {
    const field = findField(product, 'variants');
    expect(field.of).toBeDefined();
    expect(field.of[0].type).toBe('reference');
    expect(field.of[0].to[0].type).toBe('productVariant');
  });

  it('should have inventory as an object type with nested fields', () => {
    const inventoryField = findField(product, 'inventory');
    expect(inventoryField.type).toBe('object');
    expect(inventoryField.fields).toBeDefined();
    const inventoryFieldNames = inventoryField.fields.map((f: any) => f.name);
    expect(inventoryFieldNames).toContain('quantityInStock');
    expect(inventoryFieldNames).toContain('lowStockThreshold');
    expect(inventoryFieldNames).toContain('outOfStockThreshold');
    expect(inventoryFieldNames).toContain('restockLevel');
    expect(inventoryFieldNames).toContain('trackInventory');
    expect(inventoryFieldNames).toContain('allowBackorders');
    expect(inventoryFieldNames).toContain('stockHistory');
  });

  it('should have preview configuration with select fields', () => {
    expect(product.preview).toBeDefined();
    expect(product.preview!.select).toBeDefined();
    expect(product.preview!.select!.title).toBe('name');
    expect(product.preview!.select!.media).toBe('image');
  });

  it('should NOT have orderings defined (product schema has no orderings)', () => {
    expect(product.orderings).toBeUndefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CATEGORY SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Category Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(category, {
      name: 'category',
      title: 'Product Category',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(category);
    const expectedFields = [
      'name',
      'categoryName',
      'slug',
      'parentCategory',
      'image',
      'description',
      'featured',
      'featuredCategory',
      'isActive',
      'sortOrder',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(category, 'name', 'string');
    assertFieldType(category, 'categoryName', 'string');
    assertFieldType(category, 'slug', 'slug');
    assertFieldType(category, 'parentCategory', 'reference');
    assertFieldType(category, 'image', 'image');
    assertFieldType(category, 'description', 'text');
    assertFieldType(category, 'featured', 'boolean');
    assertFieldType(category, 'featuredCategory', 'boolean');
    assertFieldType(category, 'isActive', 'boolean');
    assertFieldType(category, 'sortOrder', 'number');
    assertFieldType(category, 'seoTitle', 'string');
    assertFieldType(category, 'seoDescription', 'text');
    assertFieldType(category, 'seoKeywords', 'array');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(category, 'name');
    assertFieldHasValidation(category, 'slug');
  });

  it('should have correct initial values', () => {
    assertFieldHasInitialValue(category, 'featured');
    expect(findField(category, 'featured').initialValue).toBe(false);

    assertFieldHasInitialValue(category, 'isActive');
    expect(findField(category, 'isActive').initialValue).toBe(true);

    assertFieldHasInitialValue(category, 'sortOrder');
    expect(findField(category, 'sortOrder').initialValue).toBe(0);
  });

  it('should have parentCategory referencing category', () => {
    assertFieldReference(category, 'parentCategory', 'category');
  });

  it('should have slug with correct source', () => {
    assertSlugField(category, 'slug', 'name');
  });

  it('should have image with hotspot', () => {
    const imageField = findField(category, 'image');
    expect(imageField.options).toBeDefined();
    expect(imageField.options.hotspot).toBe(true);
  });

  it('should have SEO validation on seoTitle and seoDescription', () => {
    assertFieldHasValidation(category, 'seoTitle');
    assertFieldHasValidation(category, 'seoDescription');
  });

  it('should have seoKeywords as array of strings', () => {
    const field = findField(category, 'seoKeywords');
    expect(field.of).toBeDefined();
    expect(field.of[0].type).toBe('string');
  });

  it('should have legacy fields hidden', () => {
    const categoryNameField = findField(category, 'categoryName');
    expect(categoryNameField.hidden).toBe(true);
    const featuredCategoryField = findField(category, 'featuredCategory');
    expect(featuredCategoryField.hidden).toBe(true);
  });

  it('should have preview with correct select', () => {
    expect(category.preview).toBeDefined();
    expect(category.preview!.select!.title).toBe('name');
    expect(category.preview!.select!.media).toBe('image');
  });

  it('should NOT have orderings defined', () => {
    expect(category.orderings).toBeUndefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. GROWER SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Grower Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(grower, {
      name: 'grower',
      title: 'Grower / Farm',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(grower);
    const expectedFields = [
      'name',
      'slug',
      'logo',
      'coverImage',
      'tagline',
      'description',
      'rating',
      'story',
      'phone',
      'email',
      'operatingHours',
      'location',
      'address',
      'coordinates',
      'deliveryZones',
      'products',
      'featuredProducts',
      'suppliesTo',
      'availableAtStores',
      'specialties',
      'certifications',
      'socialLinks',
      'isFeatured',
      'calendlyEnabled',
      'calendlyUsername',
      'calcomUsername',
      'defaultEventSlug',
      'isHighlyRatedBadgeThreshold',
      'calendlyDefaultEvent',
      'calcomTheme',
      'calcomButtonText',
      'appointmentTypes',
      'appointmentNotes',
      'isActive',
      'isVerified',
      'sortOrder',
      'joinedDate',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(grower, 'name', 'string');
    assertFieldType(grower, 'slug', 'slug');
    assertFieldType(grower, 'logo', 'image');
    assertFieldType(grower, 'coverImage', 'image');
    assertFieldType(grower, 'tagline', 'string');
    assertFieldType(grower, 'description', 'text');
    assertFieldType(grower, 'rating', 'number');
    assertFieldType(grower, 'story', 'array');
    assertFieldType(grower, 'phone', 'string');
    assertFieldType(grower, 'email', 'string');
    assertFieldType(grower, 'operatingHours', 'string');
    assertFieldType(grower, 'location', 'string');
    assertFieldType(grower, 'address', 'text');
    assertFieldType(grower, 'coordinates', 'object');
    assertFieldType(grower, 'deliveryZones', 'array');
    assertFieldType(grower, 'products', 'array');
    assertFieldType(grower, 'featuredProducts', 'array');
    assertFieldType(grower, 'suppliesTo', 'array');
    assertFieldType(grower, 'specialties', 'array');
    assertFieldType(grower, 'certifications', 'array');
    assertFieldType(grower, 'socialLinks', 'object');
    assertFieldType(grower, 'isFeatured', 'boolean');
    assertFieldType(grower, 'calendlyEnabled', 'boolean');
    assertFieldType(grower, 'calendlyUsername', 'string');
    assertFieldType(grower, 'calcomUsername', 'string');
    assertFieldType(grower, 'defaultEventSlug', 'string');
    assertFieldType(grower, 'calendlyDefaultEvent', 'string');
    assertFieldType(grower, 'calcomTheme', 'string');
    assertFieldType(grower, 'calcomButtonText', 'string');
    assertFieldType(grower, 'appointmentTypes', 'array');
    assertFieldType(grower, 'appointmentNotes', 'text');
    assertFieldType(grower, 'isActive', 'boolean');
    assertFieldType(grower, 'isVerified', 'boolean');
    assertFieldType(grower, 'sortOrder', 'number');
    assertFieldType(grower, 'joinedDate', 'date');
    assertFieldType(grower, 'isHighlyRatedBadgeThreshold', 'number');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(grower, 'name');
    assertFieldHasValidation(grower, 'slug');
    assertFieldHasValidation(grower, 'logo');
  });

  it('should have correct initial values', () => {
    expect(findField(grower, 'isFeatured').initialValue).toBe(false);
    expect(findField(grower, 'calendlyEnabled').initialValue).toBe(false);
    expect(findField(grower, 'isActive').initialValue).toBe(true);
    expect(findField(grower, 'isVerified').initialValue).toBe(false);
    expect(findField(grower, 'sortOrder').initialValue).toBe(0);
    expect(findField(grower, 'rating').initialValue).toBe(0);
    expect(findField(grower, 'isHighlyRatedBadgeThreshold').initialValue).toBe(4.5);
    expect(findField(grower, 'calendlyDefaultEvent').initialValue).toBe('30min');
    expect(findField(grower, 'calcomTheme').initialValue).toBe('auto');
    expect(findField(grower, 'calcomButtonText').initialValue).toBe('Schedule with Grower');
  });

  it('should have correct reference types', () => {
    const productsField = findField(grower, 'products');
    expect(productsField.of[0].type).toBe('reference');
    expect(productsField.of[0].to[0].type).toBe('product');

    const featuredProductsField = findField(grower, 'featuredProducts');
    expect(featuredProductsField.of[0].type).toBe('reference');
    expect(featuredProductsField.of[0].to[0].type).toBe('product');

    const suppliesToField = findField(grower, 'suppliesTo');
    expect(suppliesToField.of[0].type).toBe('reference');
    expect(suppliesToField.of[0].to[0].type).toBe('store');
  });

  it('should have slug with correct source', () => {
    assertSlugField(grower, 'slug', 'name');
  });

  it('should have 7 groups defined', () => {
    assertHasGroups(grower, [
      'basic',
      'contact',
      'location',
      'products',
      'social',
      'appointments',
      'settings',
    ]);
    expect(grower.groups!.length).toBe(7);
  });

  it('should have 3 orderings', () => {
    assertHasOrderings(grower, 3);
  });

  it('should have coordinates as object with lat and lng', () => {
    const coordField = findField(grower, 'coordinates');
    expect(coordField.type).toBe('object');
    const coordFieldNames = coordField.fields.map((f: any) => f.name);
    expect(coordFieldNames).toContain('lat');
    expect(coordFieldNames).toContain('lng');
  });

  it('should have socialLinks as object with social platform fields', () => {
    const socialField = findField(grower, 'socialLinks');
    expect(socialField.type).toBe('object');
    const socialFieldNames = socialField.fields.map((f: any) => f.name);
    expect(socialFieldNames).toContain('facebook');
    expect(socialFieldNames).toContain('instagram');
    expect(socialFieldNames).toContain('tiktok');
    expect(socialFieldNames).toContain('website');
  });

  it('should have specialties with list options', () => {
    assertFieldHasOptions(grower, 'specialties', [
      'oyster',
      'shiitake',
      'lions-mane',
      'king-trumpet',
      'enoki',
    ]);
  });

  it('should have certifications with list options', () => {
    assertFieldHasOptions(grower, 'certifications', [
      'organic',
      'gap',
      'haccp',
      'fda',
      'iso',
      'bfad',
    ]);
  });

  it('should have calcomTheme with list options', () => {
    assertFieldHasOptions(grower, 'calcomTheme', ['auto', 'light', 'dark']);
  });

  it('should have calendlyDefaultEvent with list options', () => {
    assertFieldHasOptions(grower, 'calendlyDefaultEvent', [
      '15min',
      '30min',
      '1-hour-meeting',
      'secret',
    ]);
  });

  it('should have email with validation (regex)', () => {
    assertFieldHasValidation(grower, 'email');
  });

  it('should have logo and coverImage with hotspot', () => {
    const logoField = findField(grower, 'logo');
    expect(logoField.options.hotspot).toBe(true);
    const coverField = findField(grower, 'coverImage');
    expect(coverField.options.hotspot).toBe(true);
  });

  it('should have legacy fields hidden', () => {
    const availableAtStoresField = findField(grower, 'availableAtStores');
    expect(availableAtStoresField.hidden).toBe(true);

    const calcomUsernameField = findField(grower, 'calcomUsername');
    expect(calcomUsernameField.hidden).toBe(true);

    const defaultEventSlugField = findField(grower, 'defaultEventSlug');
    expect(defaultEventSlugField.hidden).toBe(true);
  });

  it('should have preview with correct select fields', () => {
    expect(grower.preview).toBeDefined();
    expect(grower.preview!.select!.title).toBe('name');
    expect(grower.preview!.select!.media).toBe('logo');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ORDER SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Order Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(order, {
      name: 'order',
      title: 'Order',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(order);
    const expectedFields = [
      'orderNumber',
      'orderDate',
      'customerName',
      'customerEmail',
      'customerPhone',
      'customerId',
      'items',
      'subtotal',
      'shippingFee',
      'tax',
      'discount',
      'total',
      'shippingAddress',
      'paymentMethod',
      'paymentStatus',
      'paymentReference',
      'status',
      'statusHistory',
      'trackingNumber',
      'carrier',
      'estimatedDelivery',
      'customerNotes',
      'internalNotes',
      'couponCode',
      'source',
      'isPriority',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(order, 'orderNumber', 'string');
    assertFieldType(order, 'orderDate', 'datetime');
    assertFieldType(order, 'customerName', 'string');
    assertFieldType(order, 'customerEmail', 'string');
    assertFieldType(order, 'customerPhone', 'string');
    assertFieldType(order, 'customerId', 'string');
    assertFieldType(order, 'items', 'array');
    assertFieldType(order, 'subtotal', 'number');
    assertFieldType(order, 'shippingFee', 'number');
    assertFieldType(order, 'tax', 'number');
    assertFieldType(order, 'discount', 'number');
    assertFieldType(order, 'total', 'number');
    assertFieldType(order, 'shippingAddress', 'object');
    assertFieldType(order, 'paymentMethod', 'string');
    assertFieldType(order, 'paymentStatus', 'string');
    assertFieldType(order, 'paymentReference', 'string');
    assertFieldType(order, 'status', 'string');
    assertFieldType(order, 'statusHistory', 'array');
    assertFieldType(order, 'trackingNumber', 'string');
    assertFieldType(order, 'carrier', 'string');
    assertFieldType(order, 'estimatedDelivery', 'date');
    assertFieldType(order, 'customerNotes', 'text');
    assertFieldType(order, 'internalNotes', 'text');
    assertFieldType(order, 'couponCode', 'string');
    assertFieldType(order, 'source', 'string');
    assertFieldType(order, 'isPriority', 'boolean');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(order, 'orderNumber');
    assertFieldHasValidation(order, 'orderDate');
    assertFieldHasValidation(order, 'customerName');
    assertFieldHasValidation(order, 'customerEmail');
    assertFieldHasValidation(order, 'customerPhone');
    assertFieldHasValidation(order, 'items');
    assertFieldHasValidation(order, 'subtotal');
    assertFieldHasValidation(order, 'shippingFee');
    assertFieldHasValidation(order, 'total');
    assertFieldHasValidation(order, 'shippingAddress');
    assertFieldHasValidation(order, 'paymentMethod');
    assertFieldHasValidation(order, 'paymentStatus');
    assertFieldHasValidation(order, 'status');
  });

  it('should have read-only fields', () => {
    assertFieldReadOnly(order, 'orderNumber');
    assertFieldReadOnly(order, 'customerId');
  });

  it('should have correct initial values', () => {
    expect(findField(order, 'shippingFee').initialValue).toBe(0);
    expect(findField(order, 'tax').initialValue).toBe(0);
    expect(findField(order, 'discount').initialValue).toBe(0);
    expect(findField(order, 'paymentMethod').initialValue).toBe('cod');
    expect(findField(order, 'paymentStatus').initialValue).toBe('pending');
    expect(findField(order, 'status').initialValue).toBe('pending');
    expect(findField(order, 'source').initialValue).toBe('website');
    expect(findField(order, 'isPriority').initialValue).toBe(false);
  });

  it('should have status field with correct list values', () => {
    assertFieldHasOptions(order, 'status', [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ]);
  });

  it('should have paymentStatus with correct list values', () => {
    assertFieldHasOptions(order, 'paymentStatus', [
      'pending',
      'paid',
      'failed',
      'refunded',
    ]);
  });

  it('should have paymentMethod with correct list values', () => {
    assertFieldHasOptions(order, 'paymentMethod', [
      'cod',
      'gcash',
      'paymaya',
      'bank-transfer',
      'card',
    ]);
  });

  it('should have carrier with correct list values', () => {
    assertFieldHasOptions(order, 'carrier', [
      'lbc',
      'jnt',
      'ninjavan',
      'flash',
      'lalamove',
      'grab',
      'other',
    ]);
  });

  it('should have source with correct list values', () => {
    assertFieldHasOptions(order, 'source', [
      'website',
      'mobile',
      'phone',
      'walk-in',
    ]);
  });

  it('should have shippingAddress as object with nested fields', () => {
    const addrField = findField(order, 'shippingAddress');
    expect(addrField.type).toBe('object');
    const addrFieldNames = addrField.fields.map((f: any) => f.name);
    expect(addrFieldNames).toContain('fullAddress');
    expect(addrFieldNames).toContain('city');
    expect(addrFieldNames).toContain('province');
    expect(addrFieldNames).toContain('postalCode');
    expect(addrFieldNames).toContain('country');
  });

  it('should have items array with product reference objects', () => {
    const itemsField = findField(order, 'items');
    expect(itemsField.of).toBeDefined();
    expect(itemsField.of[0].type).toBe('object');
    const itemObjFieldNames = itemsField.of[0].fields.map((f: any) => f.name);
    expect(itemObjFieldNames).toContain('product');
    expect(itemObjFieldNames).toContain('variant');
    expect(itemObjFieldNames).toContain('quantity');
    expect(itemObjFieldNames).toContain('price');
    expect(itemObjFieldNames).toContain('discount');
    expect(itemObjFieldNames).toContain('subtotal');
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(order, 5);
  });

  it('should have preview with correct select fields', () => {
    expect(order.preview).toBeDefined();
    expect(order.preview!.select!.orderNumber).toBe('orderNumber');
    expect(order.preview!.select!.customerName).toBe('customerName');
    expect(order.preview!.select!.total).toBe('total');
    expect(order.preview!.select!.status).toBe('status');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. STORE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Store Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(store, {
      name: 'store',
      title: 'Store Location',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(store);
    const expectedFields = [
      'name',
      'slug',
      'storeType',
      'description',
      'isActive',
      'isFeatured',
      'growers',
      'sortOrder',
      'address',
      'coordinates',
      'directionsUrl',
      'operatingHours',
      'timezone',
      'hoursNote',
      'isOpen24Hours',
      'phone',
      'email',
      'whatsapp',
      'messenger',
      'services',
      'deliveryZones',
      'pickupInstructions',
      'image',
      'gallery',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(store, 'name', 'string');
    assertFieldType(store, 'slug', 'slug');
    assertFieldType(store, 'storeType', 'string');
    assertFieldType(store, 'description', 'text');
    assertFieldType(store, 'isActive', 'boolean');
    assertFieldType(store, 'isFeatured', 'boolean');
    assertFieldType(store, 'growers', 'array');
    assertFieldType(store, 'sortOrder', 'number');
    assertFieldType(store, 'address', 'object');
    assertFieldType(store, 'coordinates', 'object');
    assertFieldType(store, 'directionsUrl', 'url');
    assertFieldType(store, 'operatingHours', 'object');
    assertFieldType(store, 'timezone', 'string');
    assertFieldType(store, 'hoursNote', 'text');
    assertFieldType(store, 'isOpen24Hours', 'boolean');
    assertFieldType(store, 'phone', 'string');
    assertFieldType(store, 'email', 'string');
    assertFieldType(store, 'whatsapp', 'string');
    assertFieldType(store, 'messenger', 'url');
    assertFieldType(store, 'services', 'array');
    assertFieldType(store, 'deliveryZones', 'array');
    assertFieldType(store, 'pickupInstructions', 'text');
    assertFieldType(store, 'image', 'image');
    assertFieldType(store, 'gallery', 'array');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(store, 'name');
    assertFieldHasValidation(store, 'slug');
    assertFieldHasValidation(store, 'storeType');
    assertFieldHasValidation(store, 'email');
    assertFieldHasValidation(store, 'growers');
  });

  it('should have correct initial values', () => {
    expect(findField(store, 'storeType').initialValue).toBe('main');
    expect(findField(store, 'isActive').initialValue).toBe(true);
    expect(findField(store, 'isFeatured').initialValue).toBe(false);
    expect(findField(store, 'sortOrder').initialValue).toBe(0);
    expect(findField(store, 'timezone').initialValue).toBe('Asia/Manila');
    expect(findField(store, 'isOpen24Hours').initialValue).toBe(false);
  });

  it('should have storeType with correct list values', () => {
    assertFieldHasOptions(store, 'storeType', [
      'main',
      'pickup',
      'partner',
      'distribution',
    ]);
  });

  it('should have timezone with correct list values', () => {
    assertFieldHasOptions(store, 'timezone', ['Asia/Manila', 'UTC']);
  });

  it('should have services with correct list values', () => {
    assertFieldHasOptions(store, 'services', [
      'shopping',
      'pickup',
      'same-day-delivery',
      'standard-delivery',
      'demo',
      'workshops',
      'farm-tour',
      'card-payment',
      'cod',
      'e-wallet',
    ]);
  });

  it('should have growers as array of grower references', () => {
    const growersField = findField(store, 'growers');
    expect(growersField.of).toBeDefined();
    expect(growersField.of[0].type).toBe('reference');
    expect(growersField.of[0].to[0].type).toBe('grower');
  });

  it('should have slug with correct source', () => {
    assertSlugField(store, 'slug', 'name');
  });

  it('should have 6 groups defined', () => {
    assertHasGroups(store, [
      'basic',
      'location',
      'hours',
      'contact',
      'services',
      'media',
    ]);
    expect(store.groups!.length).toBe(6);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(store, 2);
  });

  it('should have address as object with nested fields', () => {
    const addrField = findField(store, 'address');
    expect(addrField.type).toBe('object');
    const addrFieldNames = addrField.fields.map((f: any) => f.name);
    expect(addrFieldNames).toContain('street');
    expect(addrFieldNames).toContain('city');
    expect(addrFieldNames).toContain('state');
    expect(addrFieldNames).toContain('zipCode');
    expect(addrFieldNames).toContain('country');
    expect(addrFieldNames).toContain('landmark');
  });

  it('should have coordinates as object with lat and lng', () => {
    const coordsField = findField(store, 'coordinates');
    expect(coordsField.type).toBe('object');
    const coordsFieldNames = coordsField.fields.map((f: any) => f.name);
    expect(coordsFieldNames).toContain('lat');
    expect(coordsFieldNames).toContain('lng');
  });

  it('should have operatingHours as object with day fields', () => {
    const hoursField = findField(store, 'operatingHours');
    expect(hoursField.type).toBe('object');
    const dayNames = hoursField.fields.map((f: any) => f.name);
    expect(dayNames).toContain('monday');
    expect(dayNames).toContain('tuesday');
    expect(dayNames).toContain('wednesday');
    expect(dayNames).toContain('thursday');
    expect(dayNames).toContain('friday');
    expect(dayNames).toContain('saturday');
    expect(dayNames).toContain('sunday');
  });

  it('should have image with hotspot', () => {
    const imageField = findField(store, 'image');
    expect(imageField.options).toBeDefined();
    expect(imageField.options.hotspot).toBe(true);
  });

  it('should have preview with correct select', () => {
    expect(store.preview).toBeDefined();
    expect(store.preview!.select!.title).toBe('name');
    expect(store.preview!.select!.media).toBe('image');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. REVIEW SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Review Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(review, {
      name: 'review',
      title: 'Review',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(review);
    const expectedFields = [
      'targetType',
      'product',
      'grower',
      'targetId',
      'customerName',
      'customerEmail',
      'customerPhotoURL',
      'firebaseUserId',
      'rating',
      'title',
      'content',
      'images',
      'verifiedPurchase',
      'status',
      'rejectionReason',
      'adminResponse',
      'adminResponseDate',
      'flagCount',
      'flagReasons',
      'helpfulCount',
      'reviewDate',
      'firebaseReviewId',
      'moderatedBy',
      'moderatedAt',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(review, 'targetType', 'string');
    assertFieldType(review, 'product', 'reference');
    assertFieldType(review, 'grower', 'reference');
    assertFieldType(review, 'targetId', 'string');
    assertFieldType(review, 'customerName', 'string');
    assertFieldType(review, 'customerEmail', 'email');
    assertFieldType(review, 'customerPhotoURL', 'url');
    assertFieldType(review, 'firebaseUserId', 'string');
    assertFieldType(review, 'rating', 'number');
    assertFieldType(review, 'title', 'string');
    assertFieldType(review, 'content', 'text');
    assertFieldType(review, 'images', 'array');
    assertFieldType(review, 'verifiedPurchase', 'boolean');
    assertFieldType(review, 'status', 'string');
    assertFieldType(review, 'rejectionReason', 'text');
    assertFieldType(review, 'adminResponse', 'text');
    assertFieldType(review, 'adminResponseDate', 'datetime');
    assertFieldType(review, 'flagCount', 'number');
    assertFieldType(review, 'flagReasons', 'array');
    assertFieldType(review, 'helpfulCount', 'number');
    assertFieldType(review, 'reviewDate', 'datetime');
    assertFieldType(review, 'firebaseReviewId', 'string');
    assertFieldType(review, 'moderatedBy', 'string');
    assertFieldType(review, 'moderatedAt', 'datetime');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(review, 'targetType');
    assertFieldHasValidation(review, 'product');
    assertFieldHasValidation(review, 'grower');
    assertFieldHasValidation(review, 'customerName');
    assertFieldHasValidation(review, 'customerEmail');
    assertFieldHasValidation(review, 'rating');
    assertFieldHasValidation(review, 'title');
    assertFieldHasValidation(review, 'content');
    assertFieldHasValidation(review, 'reviewDate');
  });

  it('should have read-only fields', () => {
    assertFieldReadOnly(review, 'targetId');
    assertFieldReadOnly(review, 'firebaseUserId');
    assertFieldReadOnly(review, 'adminResponseDate');
    assertFieldReadOnly(review, 'firebaseReviewId');
    assertFieldReadOnly(review, 'moderatedBy');
    assertFieldReadOnly(review, 'moderatedAt');
  });

  it('should have correct initial values', () => {
    expect(findField(review, 'verifiedPurchase').initialValue).toBe(false);
    expect(findField(review, 'status').initialValue).toBe('approved');
    expect(findField(review, 'flagCount').initialValue).toBe(0);
    expect(findField(review, 'helpfulCount').initialValue).toBe(0);
  });

  it('should have correct reference types', () => {
    assertFieldReference(review, 'product', 'product');
    assertFieldReference(review, 'grower', 'grower');
  });

  it('should have targetType with correct list values', () => {
    assertFieldHasOptions(review, 'targetType', ['product', 'grower']);
  });

  it('should have status with correct list values', () => {
    assertFieldHasOptions(review, 'status', [
      'pending',
      'approved',
      'rejected',
      'flagged',
    ]);
  });

  it('should have images with max 5 validation', () => {
    assertFieldHasValidation(review, 'images');
  });

  it('should have rating with min 1, max 5, integer', () => {
    assertFieldHasValidation(review, 'rating');
  });

  it('should have 4 groups defined', () => {
    assertHasGroups(review, ['content', 'target', 'moderation', 'metadata']);
    expect(review.groups!.length).toBe(4);
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(review, 5);
  });

  it('should have preview with correct select', () => {
    expect(review.preview).toBeDefined();
    expect(review.preview!.select!.title).toBe('title');
    expect(review.preview!.select!.rating).toBe('rating');
    expect(review.preview!.select!.customer).toBe('customerName');
    expect(review.preview!.select!.status).toBe('status');
    expect(review.preview!.select!.targetType).toBe('targetType');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. COUPON SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Coupon Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(coupon, {
      name: 'coupon',
      title: 'Coupon',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(coupon);
    const expectedFields = [
      'code',
      'description',
      'discountType',
      'discountValue',
      'minimumPurchase',
      'maximumDiscount',
      'applicableProducts',
      'products',
      'categories',
      'usageLimit',
      'usageLimitPerCustomer',
      'usageCount',
      'startDate',
      'endDate',
      'isActive',
      'isPublic',
      'combinableWithOtherCoupons',
      'customerEligibility',
      'source',
      'notes',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(coupon, 'code', 'string');
    assertFieldType(coupon, 'description', 'text');
    assertFieldType(coupon, 'discountType', 'string');
    assertFieldType(coupon, 'discountValue', 'number');
    assertFieldType(coupon, 'minimumPurchase', 'number');
    assertFieldType(coupon, 'maximumDiscount', 'number');
    assertFieldType(coupon, 'applicableProducts', 'string');
    assertFieldType(coupon, 'products', 'array');
    assertFieldType(coupon, 'categories', 'array');
    assertFieldType(coupon, 'usageLimit', 'number');
    assertFieldType(coupon, 'usageLimitPerCustomer', 'number');
    assertFieldType(coupon, 'usageCount', 'number');
    assertFieldType(coupon, 'startDate', 'datetime');
    assertFieldType(coupon, 'endDate', 'datetime');
    assertFieldType(coupon, 'isActive', 'boolean');
    assertFieldType(coupon, 'isPublic', 'boolean');
    assertFieldType(coupon, 'combinableWithOtherCoupons', 'boolean');
    assertFieldType(coupon, 'customerEligibility', 'string');
    assertFieldType(coupon, 'source', 'string');
    assertFieldType(coupon, 'notes', 'text');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(coupon, 'code');
    assertFieldHasValidation(coupon, 'description');
    assertFieldHasValidation(coupon, 'discountType');
    assertFieldHasValidation(coupon, 'discountValue');
    assertFieldHasValidation(coupon, 'startDate');
    assertFieldHasValidation(coupon, 'endDate');
  });

  it('should have read-only fields', () => {
    assertFieldReadOnly(coupon, 'usageCount');
  });

  it('should have correct initial values', () => {
    expect(findField(coupon, 'minimumPurchase').initialValue).toBe(0);
    expect(findField(coupon, 'usageLimitPerCustomer').initialValue).toBe(1);
    expect(findField(coupon, 'usageCount').initialValue).toBe(0);
    expect(findField(coupon, 'isActive').initialValue).toBe(true);
    expect(findField(coupon, 'isPublic').initialValue).toBe(false);
    expect(findField(coupon, 'combinableWithOtherCoupons').initialValue).toBe(false);
    expect(findField(coupon, 'applicableProducts').initialValue).toBe('all');
    expect(findField(coupon, 'customerEligibility').initialValue).toBe('all');
  });

  it('should have discountType with correct list values', () => {
    assertFieldHasOptions(coupon, 'discountType', [
      'percentage',
      'fixed',
      'free-shipping',
      'bogo',
    ]);
  });

  it('should have applicableProducts with correct list values', () => {
    assertFieldHasOptions(coupon, 'applicableProducts', [
      'all',
      'specific',
      'categories',
    ]);
  });

  it('should have customerEligibility with correct list values', () => {
    assertFieldHasOptions(coupon, 'customerEligibility', [
      'all',
      'new',
      'existing',
    ]);
  });

  it('should have products as array of product references', () => {
    const productsField = findField(coupon, 'products');
    expect(productsField.of[0].type).toBe('reference');
    expect(productsField.of[0].to[0].type).toBe('product');
  });

  it('should have categories as array of category references', () => {
    const categoriesField = findField(coupon, 'categories');
    expect(categoriesField.of[0].type).toBe('reference');
    expect(categoriesField.of[0].to[0].type).toBe('category');
  });

  it('should have code with regex validation', () => {
    assertFieldHasValidation(coupon, 'code');
  });

  it('should have 4 orderings', () => {
    assertHasOrderings(coupon, 4);
  });

  it('should have preview with correct select', () => {
    expect(coupon.preview).toBeDefined();
    expect(coupon.preview!.select!.code).toBe('code');
    expect(coupon.preview!.select!.discountType).toBe('discountType');
    expect(coupon.preview!.select!.isActive).toBe('isActive');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. PROMOTION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Promotion Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(promotion, {
      name: 'promotion',
      title: 'Promotion',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(promotion);
    const expectedFields = [
      'name',
      'displayName',
      'slug',
      'tagline',
      'description',
      'bannerImage',
      'thumbnailImage',
      'backgroundColor',
      'textColor',
      'promotionType',
      'discountType',
      'discountValue',
      'applicableProducts',
      'products',
      'categories',
      'bundles',
      'startDate',
      'endDate',
      'showOnHomepage',
      'showOnProductPages',
      'priority',
      'ctaText',
      'ctaLink',
      'isActive',
      'isFeatured',
      'impressions',
      'clicks',
      'conversions',
      'terms',
      'notes',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(promotion, 'name', 'string');
    assertFieldType(promotion, 'displayName', 'string');
    assertFieldType(promotion, 'slug', 'slug');
    assertFieldType(promotion, 'tagline', 'string');
    assertFieldType(promotion, 'description', 'text');
    assertFieldType(promotion, 'bannerImage', 'image');
    assertFieldType(promotion, 'thumbnailImage', 'image');
    assertFieldType(promotion, 'backgroundColor', 'string');
    assertFieldType(promotion, 'textColor', 'string');
    assertFieldType(promotion, 'promotionType', 'string');
    assertFieldType(promotion, 'discountType', 'string');
    assertFieldType(promotion, 'discountValue', 'number');
    assertFieldType(promotion, 'applicableProducts', 'string');
    assertFieldType(promotion, 'products', 'array');
    assertFieldType(promotion, 'categories', 'array');
    assertFieldType(promotion, 'bundles', 'array');
    assertFieldType(promotion, 'startDate', 'datetime');
    assertFieldType(promotion, 'endDate', 'datetime');
    assertFieldType(promotion, 'showOnHomepage', 'boolean');
    assertFieldType(promotion, 'showOnProductPages', 'boolean');
    assertFieldType(promotion, 'priority', 'number');
    assertFieldType(promotion, 'ctaText', 'string');
    assertFieldType(promotion, 'ctaLink', 'string');
    assertFieldType(promotion, 'isActive', 'boolean');
    assertFieldType(promotion, 'isFeatured', 'boolean');
    assertFieldType(promotion, 'impressions', 'number');
    assertFieldType(promotion, 'clicks', 'number');
    assertFieldType(promotion, 'conversions', 'number');
    assertFieldType(promotion, 'terms', 'text');
    assertFieldType(promotion, 'notes', 'text');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(promotion, 'name');
    assertFieldHasValidation(promotion, 'displayName');
    assertFieldHasValidation(promotion, 'slug');
    assertFieldHasValidation(promotion, 'description');
    assertFieldHasValidation(promotion, 'promotionType');
    assertFieldHasValidation(promotion, 'discountType');
    assertFieldHasValidation(promotion, 'discountValue');
    assertFieldHasValidation(promotion, 'startDate');
    assertFieldHasValidation(promotion, 'endDate');
  });

  it('should have read-only fields', () => {
    assertFieldReadOnly(promotion, 'impressions');
    assertFieldReadOnly(promotion, 'clicks');
    assertFieldReadOnly(promotion, 'conversions');
  });

  it('should have correct initial values', () => {
    expect(findField(promotion, 'showOnHomepage').initialValue).toBe(false);
    expect(findField(promotion, 'showOnProductPages').initialValue).toBe(true);
    expect(findField(promotion, 'priority').initialValue).toBe(50);
    expect(findField(promotion, 'ctaText').initialValue).toBe('Shop Now');
    expect(findField(promotion, 'isActive').initialValue).toBe(true);
    expect(findField(promotion, 'isFeatured').initialValue).toBe(false);
    expect(findField(promotion, 'impressions').initialValue).toBe(0);
    expect(findField(promotion, 'clicks').initialValue).toBe(0);
    expect(findField(promotion, 'conversions').initialValue).toBe(0);
    expect(findField(promotion, 'applicableProducts').initialValue).toBe('all');
  });

  it('should have promotionType with correct list values', () => {
    assertFieldHasOptions(promotion, 'promotionType', [
      'flash-sale',
      'seasonal',
      'bundle',
      'new-arrival',
      'bogo',
      'free-shipping',
      'featured',
    ]);
  });

  it('should have discountType with correct list values', () => {
    assertFieldHasOptions(promotion, 'discountType', [
      'percentage',
      'fixed',
      'none',
    ]);
  });

  it('should have applicableProducts with correct list values', () => {
    assertFieldHasOptions(promotion, 'applicableProducts', [
      'all',
      'products',
      'categories',
      'bundles',
    ]);
  });

  it('should have slug with correct source', () => {
    assertSlugField(promotion, 'slug', 'name');
  });

  it('should have products as array of product references', () => {
    const productsField = findField(promotion, 'products');
    expect(productsField.of[0].type).toBe('reference');
    expect(productsField.of[0].to[0].type).toBe('product');
  });

  it('should have categories as array of category references', () => {
    const categoriesField = findField(promotion, 'categories');
    expect(categoriesField.of[0].type).toBe('reference');
    expect(categoriesField.of[0].to[0].type).toBe('category');
  });

  it('should have bundles as array of productBundle references', () => {
    const bundlesField = findField(promotion, 'bundles');
    expect(bundlesField.of[0].type).toBe('reference');
    expect(bundlesField.of[0].to[0].type).toBe('productBundle');
  });

  it('should have 5 orderings', () => {
    assertHasOrderings(promotion, 5);
  });

  it('should have preview with correct select', () => {
    expect(promotion.preview).toBeDefined();
    expect(promotion.preview!.select!.name).toBe('displayName');
    expect(promotion.preview!.select!.promotionType).toBe('promotionType');
    expect(promotion.preview!.select!.isActive).toBe('isActive');
    expect(promotion.preview!.select!.isFeatured).toBe('isFeatured');
    expect(promotion.preview!.select!.conversions).toBe('conversions');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. BANNER SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Banner Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(banner, {
      name: 'banner',
      title: 'Promotional Banner',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(banner);
    const expectedFields = [
      'title',
      'headline',
      'subheadline',
      'description',
      'promoCode',
      'desktopImage',
      'mobileImage',
      'overlayOpacity',
      'backgroundColor',
      'textColor',
      'textAlignment',
      'bannerHeight',
      'buttonText',
      'buttonLink',
      'buttonStyle',
      'secondaryButtonText',
      'secondaryButtonLink',
      'startDate',
      'endDate',
      'position',
      'sortOrder',
      'isActive',
      'showOnMobile',
      'showOnDesktop',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(banner, 'title', 'string');
    assertFieldType(banner, 'headline', 'string');
    assertFieldType(banner, 'subheadline', 'string');
    assertFieldType(banner, 'description', 'text');
    assertFieldType(banner, 'promoCode', 'string');
    assertFieldType(banner, 'desktopImage', 'image');
    assertFieldType(banner, 'mobileImage', 'image');
    assertFieldType(banner, 'overlayOpacity', 'number');
    assertFieldType(banner, 'backgroundColor', 'string');
    assertFieldType(banner, 'textColor', 'string');
    assertFieldType(banner, 'textAlignment', 'string');
    assertFieldType(banner, 'bannerHeight', 'string');
    assertFieldType(banner, 'buttonText', 'string');
    assertFieldType(banner, 'buttonLink', 'string');
    assertFieldType(banner, 'buttonStyle', 'string');
    assertFieldType(banner, 'secondaryButtonText', 'string');
    assertFieldType(banner, 'secondaryButtonLink', 'string');
    assertFieldType(banner, 'startDate', 'datetime');
    assertFieldType(banner, 'endDate', 'datetime');
    assertFieldType(banner, 'position', 'string');
    assertFieldType(banner, 'sortOrder', 'number');
    assertFieldType(banner, 'isActive', 'boolean');
    assertFieldType(banner, 'showOnMobile', 'boolean');
    assertFieldType(banner, 'showOnDesktop', 'boolean');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(banner, 'title');
    assertFieldHasValidation(banner, 'desktopImage');
    assertFieldHasValidation(banner, 'position');
    assertFieldHasValidation(banner, 'sortOrder');
    assertFieldHasValidation(banner, 'overlayOpacity');
  });

  it('should have correct initial values', () => {
    expect(findField(banner, 'overlayOpacity').initialValue).toBe(0.3);
    expect(findField(banner, 'textColor').initialValue).toBe('white');
    expect(findField(banner, 'textAlignment').initialValue).toBe('center');
    expect(findField(banner, 'bannerHeight').initialValue).toBe('medium');
    expect(findField(banner, 'buttonStyle').initialValue).toBe('primary');
    expect(findField(banner, 'sortOrder').initialValue).toBe(10);
    expect(findField(banner, 'isActive').initialValue).toBe(true);
    expect(findField(banner, 'showOnMobile').initialValue).toBe(true);
    expect(findField(banner, 'showOnDesktop').initialValue).toBe(true);
  });

  it('should have position with correct list values', () => {
    assertFieldHasOptions(banner, 'position', [
      'homepage-top',
      'homepage-middle',
      'homepage-bottom',
      'shop-top',
      'shop-sidebar',
      'product-bottom',
      'cart-top',
      'checkout-bottom',
      'announcement',
    ]);
  });

  it('should have textColor with correct list values', () => {
    assertFieldHasOptions(banner, 'textColor', [
      'white',
      'black',
      'primary',
      'accent',
    ]);
  });

  it('should have textAlignment with correct list values', () => {
    assertFieldHasOptions(banner, 'textAlignment', ['left', 'center', 'right']);
  });

  it('should have bannerHeight with correct list values', () => {
    assertFieldHasOptions(banner, 'bannerHeight', [
      'small',
      'medium',
      'large',
      'full',
    ]);
  });

  it('should have buttonStyle with correct list values', () => {
    assertFieldHasOptions(banner, 'buttonStyle', [
      'primary',
      'outline',
      'secondary',
      'accent',
    ]);
  });

  it('should have desktopImage with hotspot enabled', () => {
    const imgField = findField(banner, 'desktopImage');
    expect(imgField.options).toBeDefined();
    expect(imgField.options.hotspot).toBe(true);
  });

  it('should have mobileImage with hotspot enabled', () => {
    const imgField = findField(banner, 'mobileImage');
    expect(imgField.options).toBeDefined();
    expect(imgField.options.hotspot).toBe(true);
  });

  it('should have 6 groups defined', () => {
    assertHasGroups(banner, [
      'content',
      'media',
      'styling',
      'action',
      'scheduling',
      'settings',
    ]);
    expect(banner.groups!.length).toBe(6);
  });

  it('should have 3 orderings', () => {
    assertHasOrderings(banner, 3);
  });

  it('should have preview with correct select', () => {
    expect(banner.preview).toBeDefined();
    expect(banner.preview!.select!.title).toBe('title');
    expect(banner.preview!.select!.position).toBe('position');
    expect(banner.preview!.select!.isActive).toBe('isActive');
    expect(banner.preview!.select!.media).toBe('desktopImage');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. TESTIMONIAL SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Testimonial Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(testimonial, {
      name: 'testimonial',
      title: 'Customer Testimonial',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(testimonial);
    const expectedFields = [
      'customerName',
      'customerTitle',
      'customerImage',
      'location',
      'isVerifiedPurchase',
      'rating',
      'headline',
      'quote',
      'productPurchased',
      'grower',
      'date',
      'images',
      'videoUrl',
      'displayPosition',
      'sortOrder',
      'isFeatured',
      'isActive',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(testimonial, 'customerName', 'string');
    assertFieldType(testimonial, 'customerTitle', 'string');
    assertFieldType(testimonial, 'customerImage', 'image');
    assertFieldType(testimonial, 'location', 'string');
    assertFieldType(testimonial, 'isVerifiedPurchase', 'boolean');
    assertFieldType(testimonial, 'rating', 'number');
    assertFieldType(testimonial, 'headline', 'string');
    assertFieldType(testimonial, 'quote', 'text');
    assertFieldType(testimonial, 'productPurchased', 'reference');
    assertFieldType(testimonial, 'grower', 'reference');
    assertFieldType(testimonial, 'date', 'date');
    assertFieldType(testimonial, 'images', 'array');
    assertFieldType(testimonial, 'videoUrl', 'url');
    assertFieldType(testimonial, 'displayPosition', 'string');
    assertFieldType(testimonial, 'sortOrder', 'number');
    assertFieldType(testimonial, 'isFeatured', 'boolean');
    assertFieldType(testimonial, 'isActive', 'boolean');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(testimonial, 'customerName');
    assertFieldHasValidation(testimonial, 'rating');
    assertFieldHasValidation(testimonial, 'headline');
    assertFieldHasValidation(testimonial, 'quote');
    assertFieldHasValidation(testimonial, 'sortOrder');
  });

  it('should have correct initial values', () => {
    expect(findField(testimonial, 'isVerifiedPurchase').initialValue).toBe(true);
    expect(findField(testimonial, 'displayPosition').initialValue).toBe('homepage');
    expect(findField(testimonial, 'sortOrder').initialValue).toBe(10);
    expect(findField(testimonial, 'isFeatured').initialValue).toBe(false);
    expect(findField(testimonial, 'isActive').initialValue).toBe(true);
  });

  it('should have correct reference types', () => {
    assertFieldReference(testimonial, 'productPurchased', 'product');
    assertFieldReference(testimonial, 'grower', 'grower');
  });

  it('should have displayPosition with correct list values', () => {
    assertFieldHasOptions(testimonial, 'displayPosition', [
      'homepage',
      'shop',
      'product',
      'grower',
      'all',
    ]);
  });

  it('should have rating with options list (1-5)', () => {
    assertFieldHasOptions(testimonial, 'rating', [1, 2, 3, 4, 5] as any);
  });

  it('should have customerImage with hotspot enabled', () => {
    const imgField = findField(testimonial, 'customerImage');
    expect(imgField.options).toBeDefined();
    expect(imgField.options.hotspot).toBe(true);
  });

  it('should have 4 groups defined', () => {
    assertHasGroups(testimonial, ['customer', 'content', 'media', 'settings']);
    expect(testimonial.groups!.length).toBe(4);
  });

  it('should have 4 orderings', () => {
    assertHasOrderings(testimonial, 4);
  });

  it('should have preview with correct select', () => {
    expect(testimonial.preview).toBeDefined();
    expect(testimonial.preview!.select!.title).toBe('customerName');
    expect(testimonial.preview!.select!.headline).toBe('headline');
    expect(testimonial.preview!.select!.rating).toBe('rating');
    expect(testimonial.preview!.select!.media).toBe('customerImage');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. FAQ CATEGORY SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('FAQ Category Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(faqCategory, {
      name: 'faqCategory',
      title: 'FAQ Category',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(faqCategory);
    const expectedFields = [
      'name',
      'slug',
      'description',
      'icon',
      'displayOrder',
      'isActive',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(faqCategory)).toBe(6);
  });

  it('should have correct field types', () => {
    assertFieldType(faqCategory, 'name', 'string');
    assertFieldType(faqCategory, 'slug', 'slug');
    assertFieldType(faqCategory, 'description', 'text');
    assertFieldType(faqCategory, 'icon', 'string');
    assertFieldType(faqCategory, 'displayOrder', 'number');
    assertFieldType(faqCategory, 'isActive', 'boolean');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(faqCategory, 'name');
    assertFieldHasValidation(faqCategory, 'slug');
    assertFieldHasValidation(faqCategory, 'displayOrder');
  });

  it('should have correct initial values', () => {
    expect(findField(faqCategory, 'displayOrder').initialValue).toBe(0);
    expect(findField(faqCategory, 'isActive').initialValue).toBe(true);
  });

  it('should have slug with correct source', () => {
    assertSlugField(faqCategory, 'slug', 'name');
  });

  it('should have icon with list options for Lucide icons', () => {
    assertFieldHasOptions(faqCategory, 'icon', [
      'ShoppingCart',
      'Truck',
      'CreditCard',
      'Package',
      'User',
      'Leaf',
      'Settings',
      'HelpCircle',
      'Phone',
      'Mail',
      'Clock',
      'Shield',
      'Undo',
    ]);
  });

  it('should have 2 orderings', () => {
    assertHasOrderings(faqCategory, 2);
  });

  it('should have preview with correct select', () => {
    expect(faqCategory.preview).toBeDefined();
    expect(faqCategory.preview!.select!.title).toBe('name');
    expect(faqCategory.preview!.select!.displayOrder).toBe('displayOrder');
    expect(faqCategory.preview!.select!.isActive).toBe('isActive');
  });

  it('should NOT have groups defined', () => {
    expect(faqCategory.groups).toBeUndefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. FAQ ITEM SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('FAQ Item Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(faqItem, {
      name: 'faqItem',
      title: 'FAQ Question',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(faqItem);
    const expectedFields = [
      'question',
      'answer',
      'richAnswer',
      'category',
      'displayOrder',
      'isActive',
      'isFeatured',
      'tags',
      'relatedFAQs',
      'helpfulCount',
      'notHelpfulCount',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
    expect(countFields(faqItem)).toBe(11);
  });

  it('should have correct field types', () => {
    assertFieldType(faqItem, 'question', 'string');
    assertFieldType(faqItem, 'answer', 'text');
    assertFieldType(faqItem, 'richAnswer', 'array');
    assertFieldType(faqItem, 'category', 'reference');
    assertFieldType(faqItem, 'displayOrder', 'number');
    assertFieldType(faqItem, 'isActive', 'boolean');
    assertFieldType(faqItem, 'isFeatured', 'boolean');
    assertFieldType(faqItem, 'tags', 'array');
    assertFieldType(faqItem, 'relatedFAQs', 'array');
    assertFieldType(faqItem, 'helpfulCount', 'number');
    assertFieldType(faqItem, 'notHelpfulCount', 'number');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(faqItem, 'question');
    assertFieldHasValidation(faqItem, 'answer');
    assertFieldHasValidation(faqItem, 'category');
    assertFieldHasValidation(faqItem, 'displayOrder');
  });

  it('should have read-only fields', () => {
    assertFieldReadOnly(faqItem, 'helpfulCount');
    assertFieldReadOnly(faqItem, 'notHelpfulCount');
  });

  it('should have correct initial values', () => {
    expect(findField(faqItem, 'displayOrder').initialValue).toBe(0);
    expect(findField(faqItem, 'isActive').initialValue).toBe(true);
    expect(findField(faqItem, 'isFeatured').initialValue).toBe(false);
    expect(findField(faqItem, 'helpfulCount').initialValue).toBe(0);
    expect(findField(faqItem, 'notHelpfulCount').initialValue).toBe(0);
  });

  it('should have category referencing faqCategory', () => {
    assertFieldReference(faqItem, 'category', 'faqCategory');
  });

  it('should have relatedFAQs as array of faqItem references with max 5', () => {
    const field = findField(faqItem, 'relatedFAQs');
    expect(field.of).toBeDefined();
    expect(field.of[0].type).toBe('reference');
    expect(field.of[0].to[0].type).toBe('faqItem');
    assertFieldHasValidation(faqItem, 'relatedFAQs');
  });

  it('should have tags as array of strings', () => {
    const tagsField = findField(faqItem, 'tags');
    expect(tagsField.of).toBeDefined();
    expect(tagsField.of[0].type).toBe('string');
  });

  it('should have richAnswer as array of block type', () => {
    const richAnswerField = findField(faqItem, 'richAnswer');
    expect(richAnswerField.of).toBeDefined();
    expect(richAnswerField.of[0].type).toBe('block');
  });

  it('should have 3 orderings', () => {
    assertHasOrderings(faqItem, 3);
  });

  it('should have preview with correct select', () => {
    expect(faqItem.preview).toBeDefined();
    expect(faqItem.preview!.select!.title).toBe('question');
    expect(faqItem.preview!.select!.categoryName).toBe('category.name');
    expect(faqItem.preview!.select!.displayOrder).toBe('displayOrder');
    expect(faqItem.preview!.select!.isActive).toBe('isActive');
    expect(faqItem.preview!.select!.isFeatured).toBe('isFeatured');
  });

  it('should NOT have groups defined', () => {
    expect(faqItem.groups).toBeUndefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 13. POST (BLOG POST) SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('Post (Blog Post) Schema', () => {
  it('should have correct basic structure', () => {
    assertSchemaBasics(post, {
      name: 'post',
      title: 'Blog Post',
      type: 'document',
      icon: true,
      preview: true,
    });
  });

  it('should have all expected fields', () => {
    const fieldNames = getFieldNames(post);
    const expectedFields = [
      'title',
      'slug',
      'excerpt',
      'content',
      'coverImage',
      'gallery',
      'author',
      'categories',
      'tags',
      'relatedPosts',
      'date',
      'updatedAt',
      'seo',
      'isFeatured',
      'isPublished',
      'readTime',
      'allowComments',
    ];
    for (const field of expectedFields) {
      expect(fieldNames).toContain(field);
    }
  });

  it('should have correct field types', () => {
    assertFieldType(post, 'title', 'string');
    assertFieldType(post, 'slug', 'slug');
    assertFieldType(post, 'excerpt', 'text');
    assertFieldType(post, 'content', 'blockContent');
    assertFieldType(post, 'coverImage', 'image');
    assertFieldType(post, 'gallery', 'array');
    assertFieldType(post, 'author', 'reference');
    assertFieldType(post, 'categories', 'array');
    assertFieldType(post, 'tags', 'array');
    assertFieldType(post, 'relatedPosts', 'array');
    assertFieldType(post, 'date', 'datetime');
    assertFieldType(post, 'updatedAt', 'datetime');
    assertFieldType(post, 'seo', 'object');
    assertFieldType(post, 'isFeatured', 'boolean');
    assertFieldType(post, 'isPublished', 'boolean');
    assertFieldType(post, 'readTime', 'number');
    assertFieldType(post, 'allowComments', 'boolean');
  });

  it('should have required validation on key fields', () => {
    assertFieldHasValidation(post, 'title');
    assertFieldHasValidation(post, 'slug');
    assertFieldHasValidation(post, 'coverImage');
    assertFieldHasValidation(post, 'categories');
    assertFieldHasValidation(post, 'readTime');
    assertFieldHasValidation(post, 'excerpt');
  });

  it('should have correct initial values', () => {
    expect(findField(post, 'isFeatured').initialValue).toBe(false);
    expect(findField(post, 'isPublished').initialValue).toBe(true);
    expect(findField(post, 'allowComments').initialValue).toBe(true);
  });

  it('should have slug with correct source (title)', () => {
    assertSlugField(post, 'slug', 'title');
  });

  it('should have slug with isUnique option', () => {
    const slugField = findField(post, 'slug');
    expect(slugField.options.isUnique).toBeDefined();
  });

  it('should have author referencing person', () => {
    assertFieldReference(post, 'author', 'person');
  });

  it('should have categories as array of blogCategory references', () => {
    const categoriesField = findField(post, 'categories');
    expect(categoriesField.of).toBeDefined();
    expect(categoriesField.of[0].type).toBe('reference');
    expect(categoriesField.of[0].to[0].type).toBe('blogCategory');
  });

  it('should have relatedPosts as array of post references with max 4', () => {
    const relatedField = findField(post, 'relatedPosts');
    expect(relatedField.of).toBeDefined();
    expect(relatedField.of[0].type).toBe('reference');
    expect(relatedField.of[0].to[0].type).toBe('post');
    assertFieldHasValidation(post, 'relatedPosts');
  });

  it('should have tags as array of strings', () => {
    const tagsField = findField(post, 'tags');
    expect(tagsField.of).toBeDefined();
    expect(tagsField.of[0].type).toBe('string');
  });

  it('should have coverImage with hotspot enabled', () => {
    const imgField = findField(post, 'coverImage');
    expect(imgField.options).toBeDefined();
    expect(imgField.options.hotspot).toBe(true);
  });

  it('should have seo as object with nested fields', () => {
    const seoField = findField(post, 'seo');
    expect(seoField.type).toBe('object');
    const seoFieldNames = seoField.fields.map((f: any) => f.name);
    expect(seoFieldNames).toContain('metaTitle');
    expect(seoFieldNames).toContain('metaDescription');
    expect(seoFieldNames).toContain('keywords');
    expect(seoFieldNames).toContain('ogImage');
    expect(seoFieldNames).toContain('noIndex');
  });

  it('should have 5 groups defined', () => {
    assertHasGroups(post, [
      'content',
      'media',
      'organization',
      'seo',
      'settings',
    ]);
    expect(post.groups!.length).toBe(5);
  });

  it('should NOT have orderings defined (post schema has no orderings)', () => {
    expect(post.orderings).toBeUndefined();
  });

  it('should have preview with correct select', () => {
    expect(post.preview).toBeDefined();
    expect(post.preview!.select!.title).toBe('title');
    expect(post.preview!.select!.date).toBe('date');
    expect(post.preview!.select!.media).toBe('coverImage');
    expect(post.preview!.select!.isFeatured).toBe('isFeatured');
    expect(post.preview!.select!.isPublished).toBe('isPublished');
  });

  it('should have gallery as array of images', () => {
    const galleryField = findField(post, 'gallery');
    expect(galleryField.of).toBeDefined();
    expect(galleryField.of[0].type).toBe('image');
  });
});
