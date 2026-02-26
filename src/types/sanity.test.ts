/**
 * Tests for Sanity Type Transformers
 * @module src/types/sanity
 *
 * Covers: transformSanityProduct, transformSanityCategory
 */

import {
  transformSanityProduct,
  transformSanityCategory,
  type SanityProduct,
  type SanityCategory,
} from './sanity';

// ============================================================================
// Helpers: minimal valid inputs
// ============================================================================

function minimalSanityProduct(overrides: Partial<SanityProduct> = {}): SanityProduct {
  return {
    _id: 'prod-1',
    _createdAt: '2026-01-01T00:00:00Z',
    _updatedAt: '2026-01-02T00:00:00Z',
    name: 'Oyster Mushroom',
    slug: { current: 'oyster-mushroom', _type: 'slug' as const },
    price: 250,
    stock: 100,
    sku: 'SKU-001',
    isAvailable: true,
    isFeatured: false,
    isPromo: false,
    ...overrides,
  };
}

function minimalSanityCategory(overrides: Partial<SanityCategory> = {}): SanityCategory {
  return {
    _id: 'cat-1',
    name: 'Fresh Mushrooms',
    slug: { current: 'fresh-mushrooms', _type: 'slug' as const },
    ...overrides,
  };
}

// ============================================================================
// transformSanityProduct
// ============================================================================

describe('transformSanityProduct', () => {
  it('transforms minimal product correctly', () => {
    const product = minimalSanityProduct();
    const result = transformSanityProduct(product);

    expect(result.id).toBe('prod-1');
    expect(result.name).toBe('Oyster Mushroom');
    expect(result.slug).toBe('oyster-mushroom');
    expect(result.price).toBe(250);
    expect(result.stock).toBe(100);
    expect(result.sku).toBe('SKU-001');
    expect(result.isAvailable).toBe(true);
    expect(result.isFeatured).toBe(false);
    expect(result.isPromo).toBe(false);
  });

  it('uses placeholder image when mainImage is missing', () => {
    const product = minimalSanityProduct({ mainImage: undefined });
    const result = transformSanityProduct(product);
    expect(result.image).toBe('/mushroom-placeholder.png');
  });

  it('uses placeholder image when mainImage is "null" string', () => {
    const product = minimalSanityProduct({ mainImage: 'null' });
    const result = transformSanityProduct(product);
    expect(result.image).toBe('/mushroom-placeholder.png');
  });

  it('uses actual mainImage when provided', () => {
    const product = minimalSanityProduct({
      mainImage: 'https://cdn.sanity.io/images/project/dataset/image.png',
    });
    const result = transformSanityProduct(product);
    expect(result.image).toBe('https://cdn.sanity.io/images/project/dataset/image.png');
  });

  it('uses images array when provided, filtering nulls', () => {
    const product = minimalSanityProduct({
      mainImage: 'https://cdn.example.com/main.jpg',
      images: [
        'https://cdn.example.com/1.jpg',
        null as unknown as string,
        'null',
        'https://cdn.example.com/2.jpg',
      ],
    });
    const result = transformSanityProduct(product);
    // Filter out null and 'null'
    expect(result.images).toEqual([
      'https://cdn.example.com/1.jpg',
      'https://cdn.example.com/2.jpg',
    ]);
  });

  it('falls back to [imageUrl] when images is empty', () => {
    const product = minimalSanityProduct({
      mainImage: 'https://cdn.example.com/main.jpg',
      images: [],
    });
    const result = transformSanityProduct(product);
    expect(result.images).toEqual(['https://cdn.example.com/main.jpg']);
  });

  it('handles slug as string', () => {
    const product = minimalSanityProduct();
    // Override with string slug (can happen from GROQ projection)
    (product as any).slug = 'oyster-direct';
    const result = transformSanityProduct(product);
    expect(result.slug).toBe('oyster-direct');
  });

  it('extracts category name and slug (object slug)', () => {
    const product = minimalSanityProduct({
      category: {
        _id: 'cat-1',
        name: 'Fresh Mushrooms',
        slug: { current: 'fresh-mushrooms', _type: 'slug' },
      },
    });
    const result = transformSanityProduct(product);
    expect(result.category).toBe('Fresh Mushrooms');
    expect(result.categorySlug).toBe('fresh-mushrooms');
  });

  it('extracts category slug as string', () => {
    const product = minimalSanityProduct({
      category: {
        _id: 'cat-1',
        name: 'Dried Mushrooms',
        slug: 'dried-mushrooms',
      },
    });
    const result = transformSanityProduct(product);
    expect(result.categorySlug).toBe('dried-mushrooms');
  });

  it('handles missing category', () => {
    const product = minimalSanityProduct({ category: undefined });
    const result = transformSanityProduct(product);
    expect(result.category).toBeUndefined();
    expect(result.categorySlug).toBeUndefined();
  });

  it('transforms grower information', () => {
    const product = minimalSanityProduct({
      grower: {
        _id: 'grower-1',
        name: 'Mushroom Farms PH',
        slug: 'mushroom-farms-ph',
        tagline: 'Fresh from farm to table',
        location: 'Tagaytay',
        isVerified: true,
        image: 'https://cdn.example.com/grower.jpg',
      },
    });
    const result = transformSanityProduct(product);
    expect(result.grower).toBeDefined();
    expect(result.grower!.id).toBe('grower-1');
    expect(result.grower!.name).toBe('Mushroom Farms PH');
    expect(result.grower!.slug).toBe('mushroom-farms-ph');
    expect(result.grower!.isVerified).toBe(true);
  });

  it('handles missing grower', () => {
    const product = minimalSanityProduct({ grower: undefined });
    const result = transformSanityProduct(product);
    expect(result.grower).toBeUndefined();
  });

  it('preserves compareAtPrice', () => {
    const product = minimalSanityProduct({ compareAtPrice: 300 });
    const result = transformSanityProduct(product);
    expect(result.compareAtPrice).toBe(300);
  });

  it('transforms complementary products', () => {
    const product = minimalSanityProduct();
    (product as any).complementaryProducts = [
      { _id: 'cp-1', name: 'Shiitake', slug: 'shiitake', price: 200, image: '/img.jpg', isPromo: false },
      null,
      { _id: 'cp-2', name: 'Enoki', slug: { current: 'enoki' }, price: 150, image: '/img2.jpg', isPromo: true },
    ];
    const result = transformSanityProduct(product);
    expect(result.complementaryProducts).toHaveLength(2);
    expect(result.complementaryProducts![0].id).toBe('cp-1');
    expect(result.complementaryProducts![1].id).toBe('cp-2');
  });

  it('returns undefined complementaryProducts when array is empty after filtering', () => {
    const product = minimalSanityProduct();
    (product as any).complementaryProducts = [null, undefined];
    const result = transformSanityProduct(product);
    expect(result.complementaryProducts).toBeUndefined();
  });

  it('transforms media gallery sorted by sortOrder', () => {
    const product = minimalSanityProduct();
    (product as any).media = [
      { _key: 'a', mediaType: 'image', image: '/img1.jpg', sortOrder: 2 },
      { _key: 'b', mediaType: 'video', videoUrl: 'https://youtube.com', sortOrder: 1 },
    ];
    const result = transformSanityProduct(product);
    expect(result.media).toHaveLength(2);
    expect(result.media![0]._key).toBe('b'); // sortOrder 1 first
    expect(result.media![1]._key).toBe('a'); // sortOrder 2 second
  });

  it('always sets suggestedProducts to undefined (deprecated)', () => {
    const product = minimalSanityProduct();
    const result = transformSanityProduct(product);
    expect(result.suggestedProducts).toBeUndefined();
  });

  it('preserves enhanced product info fields', () => {
    const product = minimalSanityProduct();
    (product as any).freshnessInfo = { harvestWindow: '24h', shelfLife: '5-7d' };
    (product as any).nutritionalHighlights = ['High Protein', 'Low Fat'];
    (product as any).searchKeywords = ['oyster', 'mushroom', 'fresh'];

    const result = transformSanityProduct(product);
    expect(result.freshnessInfo).toEqual({ harvestWindow: '24h', shelfLife: '5-7d' });
    expect(result.nutritionalHighlights).toEqual(['High Protein', 'Low Fat']);
    expect(result.searchKeywords).toEqual(['oyster', 'mushroom', 'fresh']);
  });
});

// ============================================================================
// transformSanityCategory
// ============================================================================

describe('transformSanityCategory', () => {
  it('transforms category with object slug', () => {
    const category = minimalSanityCategory();
    const result = transformSanityCategory(category);

    expect(result.id).toBe('cat-1');
    expect(result.name).toBe('Fresh Mushrooms');
    expect(result.slug).toBe('fresh-mushrooms');
  });

  it('preserves optional description', () => {
    const category = minimalSanityCategory({ description: 'Premium fresh mushrooms' });
    const result = transformSanityCategory(category);
    expect(result.description).toBe('Premium fresh mushrooms');
  });

  it('preserves optional image', () => {
    const category = minimalSanityCategory({ image: 'https://cdn.example.com/cat.jpg' });
    const result = transformSanityCategory(category);
    expect(result.image).toBe('https://cdn.example.com/cat.jpg');
  });

  it('handles missing optional fields', () => {
    const category = minimalSanityCategory();
    const result = transformSanityCategory(category);
    expect(result.description).toBeUndefined();
    expect(result.image).toBeUndefined();
  });
});
