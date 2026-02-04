/**
 * Sanity Product Search Client Wrapper
 * Executes product search queries with error handling
 */

import { sanityClient } from '@/lib/sanity/client';
import { 
  buildProductSearchQuery, 
  getProductFiltersQuery,
  countProductsQuery,
  getProductByIdOrSlugQuery
} from './queries/products';
import type { ProductFilters, FilterOptions } from '@/types/product-filters';
import { toast } from 'sonner';

/**
 * Product search result from Sanity
 */
export interface SanityProduct {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: { current: string };
  sku?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  isOnPromo?: boolean;
  promoType?: 'percentage' | 'fixed';
  promoPercentage?: number;
  promoPrice?: number;
  stockQuantity?: number;
  mainImage?: string;
  category?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  grower?: {
    _id: string;
    name: string;
    businessName?: string;
  };
  tags?: string[];
  featured?: boolean;
  archived?: boolean;
  status?: 'published' | 'draft' | 'archived';
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
}

/**
 * Search results with pagination info
 */
export interface ProductSearchResults {
  products: SanityProduct[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Search products with filters
 * @param filters - Filter criteria
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of results per page
 * @returns Search results with pagination
 */
export async function searchProducts(
  filters: ProductFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<ProductSearchResults> {
  try {
    const offset = (page - 1) * pageSize;
    const query = buildProductSearchQuery(filters, pageSize, offset);
    
    // Execute search query
    const products = await sanityClient.fetch<SanityProduct[]>(query);
    
    // Get total count (for pagination)
    const totalQuery = countProductsQuery(filters);
    const total = await sanityClient.fetch<number>(totalQuery);
    
    return {
      products,
      total,
      hasMore: offset + products.length < total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('[searchProducts] Error:', error);
    toast.error('Failed to search products. Please try again.');
    throw error;
  }
}

/**
 * Get available filter options from Sanity data
 * @returns Filter options (categories, price ranges, counts)
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const query = getProductFiltersQuery();
    const options = await sanityClient.fetch<FilterOptions>(query);
    
    return {
      categories: options.categories || [],
      priceRange: options.priceRange || { min: 0, max: 1000 },
      stockCounts: options.stockCounts || { inStock: 0, outOfStock: 0, lowStock: 0 },
      statusCounts: options.statusCounts || { published: 0, draft: 0, archived: 0 },
    };
  } catch (error) {
    console.error('[getFilterOptions] Error:', error);
    toast.error('Failed to load filter options.');
    throw error;
  }
}

/**
 * Get single product by ID or slug
 * @param idOrSlug - Product ID or slug
 * @returns Product data or null if not found
 */
export async function getProductByIdOrSlug(
  idOrSlug: string
): Promise<SanityProduct | null> {
  try {
    const query = getProductByIdOrSlugQuery(idOrSlug);
    const product = await sanityClient.fetch<SanityProduct | null>(query);
    
    if (!product) {
      toast.error('Product not found.');
    }
    
    return product;
  } catch (error) {
    console.error('[getProductByIdOrSlug] Error:', error);
    toast.error('Failed to load product.');
    throw error;
  }
}

/**
 * Quick search for autocomplete (searches name and SKU only)
 * @param searchText - Search query
 * @param limit - Maximum results
 * @returns Matching products
 */
export async function quickSearchProducts(
  searchText: string,
  limit: number = 10
): Promise<Pick<SanityProduct, '_id' | 'name' | 'sku' | 'mainImage' | 'price'>[]> {
  try {
    if (!searchText || searchText.length < 2) {
      return [];
    }
    
    const query = `
      *[_type == "product" && (
        lower(name) match "${searchText.toLowerCase()}*" || 
        lower(sku) match "${searchText.toLowerCase()}*"
      )] | order(name asc) [0...${limit}] {
        _id,
        name,
        sku,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        price
      }
    `;
    
    return await sanityClient.fetch(query);
  } catch (error) {
    console.error('[quickSearchProducts] Error:', error);
    return [];
  }
}
