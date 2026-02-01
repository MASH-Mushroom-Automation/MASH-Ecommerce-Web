/**
 * Unit Tests for Sanity Product Search Queries
 */

import { 
  buildProductSearchQuery, 
  getProductFiltersQuery,
  countProductsQuery,
  getProductByIdOrSlugQuery
} from './products';
import type { ProductFilters } from '@/types/product-filters';
import { DEFAULT_FILTERS } from '@/types/product-filters';

describe('buildProductSearchQuery', () => {
  it('should build basic query with no filters', () => {
    const query = buildProductSearchQuery(DEFAULT_FILTERS, 50, 0);
    
    expect(query).toContain('*[_type == "product"');
    expect(query).toContain('order(_updatedAt desc)');
    expect(query).toContain('[0...50]');
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');
  });

  it('should filter by search text', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'mushroom',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('lower(name) match "mushroom*"');
    expect(query).toContain('lower(sku) match "mushroom*"');
    expect(query).toContain('lower(description) match "mushroom*"');
  });

  it('should filter by categories', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      categories: ['cat1', 'cat2'],
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('category._ref == "cat1"');
    expect(query).toContain('category._ref == "cat2"');
  });

  it('should filter by price range', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [100, 500],
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('price >= 100');
    expect(query).toContain('price <= 500');
  });

  it('should filter by stock status - in-stock', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      stockStatus: 'in-stock',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('stockQuantity > 10');
  });

  it('should filter by stock status - low-stock', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      stockStatus: 'low-stock',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('stockQuantity > 0 && stockQuantity <= 10');
  });

  it('should filter by stock status - out-of-stock', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      stockStatus: 'out-of-stock',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('stockQuantity <= 0');
  });

  it('should filter by product status - published', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      productStatus: 'published',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('!(_id in path("drafts.**"))');
  });

  it('should filter by product status - draft', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      productStatus: 'draft',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('_id in path("drafts.**")');
  });

  it('should filter by product status - archived', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      productStatus: 'archived',
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('archived == true');
  });

  it('should filter by date range', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      },
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('_updatedAt >= "2024-01-01T00:00:00.000Z"');
    expect(query).toContain('_updatedAt <= "2024-12-31T00:00:00.000Z"');
  });

  it('should combine multiple filters with AND logic', () => {
    const filters: ProductFilters = {
      search: 'oyster',
      categories: ['cat1'],
      priceRange: [50, 200],
      stockStatus: 'in-stock',
      productStatus: 'published',
      dateRange: null,
    };
    
    const query = buildProductSearchQuery(filters, 50, 0);
    
    expect(query).toContain('lower(name) match "oyster*"');
    expect(query).toContain('category._ref == "cat1"');
    expect(query).toContain('price >= 50');
    expect(query).toContain('stockQuantity > 10');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('&&');
  });

  it('should support pagination with limit and offset', () => {
    const query1 = buildProductSearchQuery(DEFAULT_FILTERS, 20, 0);
    expect(query1).toContain('[0...20]');
    
    const query2 = buildProductSearchQuery(DEFAULT_FILTERS, 20, 20);
    expect(query2).toContain('[20...40]');
  });
});

describe('getProductFiltersQuery', () => {
  it('should return query for filter options', () => {
    const query = getProductFiltersQuery();
    
    expect(query).toContain('categories');
    expect(query).toContain('priceRange');
    expect(query).toContain('stockCounts');
    expect(query).toContain('statusCounts');
    expect(query).toContain('*[_type == "category"]');
    expect(query).toContain('min(*[_type == "product"');
    expect(query).toContain('max(*[_type == "product"');
  });

  it('should include product counts per category', () => {
    const query = getProductFiltersQuery();
    
    expect(query).toContain('productCount');
    expect(query).toContain('count(*[_type == "product" && references(^._id)])');
  });

  it('should order categories by product count', () => {
    const query = getProductFiltersQuery();
    
    expect(query).toContain('order(productCount desc)');
  });
});

describe('countProductsQuery', () => {
  it('should count products with no filters', () => {
    const query = countProductsQuery(DEFAULT_FILTERS);
    
    expect(query).toContain('count(*[_type == "product"');
  });

  it('should count products with filters applied', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'test',
      stockStatus: 'in-stock',
    };
    
    const query = countProductsQuery(filters);
    
    expect(query).toContain('count(');
    expect(query).toContain('_type == "product"');
  });
});

describe('getProductByIdOrSlugQuery', () => {
  it('should query by ID', () => {
    const query = getProductByIdOrSlugQuery('prod-123');
    
    expect(query).toContain('_id == "prod-123"');
    expect(query).toContain('slug.current == "prod-123"');
    expect(query).toContain('||');
    expect(query).toContain('[0]');
  });

  it('should query by slug', () => {
    const query = getProductByIdOrSlugQuery('oyster-mushroom');
    
    expect(query).toContain('_id == "oyster-mushroom"');
    expect(query).toContain('slug.current == "oyster-mushroom"');
  });

  it('should include all product fields', () => {
    const query = getProductByIdOrSlugQuery('test');
    
    expect(query).toContain('_id');
    expect(query).toContain('name');
    expect(query).toContain('sku');
    expect(query).toContain('description');
    expect(query).toContain('price');
    expect(query).toContain('stockQuantity');
    expect(query).toContain('mainImage');
    expect(query).toContain('category->');
    expect(query).toContain('grower->');
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');
  });
});
