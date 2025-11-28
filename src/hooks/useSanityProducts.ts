/**
 * useSanityProducts Hook
 * 
 * Custom React hook for fetching products from Sanity CMS.
 * Supports filtering, sorting, and pagination.
 * 
 * ⚠️ QUOTA WARNING: Real-time subscriptions are DISABLED to avoid API quota limits.
 * Use refetch() to manually refresh data.
 */

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';
import type { SanityProduct, ProductFilters, TransformedProduct } from '@/types/sanity';

// Memory cache to prevent duplicate API calls (1 minute TTL)
const productCache = new Map<string, { data: TransformedProduct[]; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

// Clear cache on hot reload during development
if (typeof window !== 'undefined') {
  productCache.clear();
  console.log('🧹 Product cache cleared');
}

interface UseSanityProductsReturn {
  products: TransformedProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch products from Sanity CMS with filters
 * 
 * @param filters - Product filter options (category, price, featured, etc.)
 * @returns products, loading state, error, and refetch function
 * 
 * @example
 * const { products, loading, error } = useSanityProducts({
 *   category: 'oyster-mushroom',
 *   minPrice: 100,
 *   maxPrice: 500,
 *   featured: true
 * });
 */
export function useSanityProducts(filters?: ProductFilters): UseSanityProductsReturn {
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    console.log('🔍 Fetching products from Sanity with filters:', filters);
    try {
      setLoading(true);
      setError(null);

      // Build GROQ query with filters
      let query = `*[_type == "product"`;
      
      // Filter by availability (always show only available products)
      if (filters?.isAvailable !== false) {
        query += ` && isAvailable == true`;
      }
      
      // Filter by category
      if (filters?.category) {
        query += ` && category->slug.current == "${filters.category}"`;
      }
      
      // Filter by featured
      if (filters?.featured) {
        query += ` && isFeatured == true`;
      }
      
      // Filter by search term
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        query += ` && (
          lower(name) match "*${searchTerm}*" ||
          lower(description) match "*${searchTerm}*"
        )`;
      }
      
      // Filter by tags
      if (filters?.tags && filters.tags.length > 0) {
        // Match products that have ALL selected tags
        const tagConditions = filters.tags.map(tag => `"${tag}" in productTags`).join(' && ');
        query += ` && (${tagConditions})`;
      }
      
      query += `] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        price,
        compareAtPrice,
        "stock": quantity,
        sku,
        weight,
        unit,
        isAvailable,
        isFeatured,
        "isPromo": isOnPromo,
        promoEndDate,
        productTags,
        "mainImage": image.asset->url,
        "images": images[].asset->url,
        category->{
          _id,
          name,
          "slug": slug.current,
          description
        },
        subcategory->{
          _id,
          name,
          "slug": slug.current
        }
      }`;
      
      // Add sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            query += ` | order(price asc)`;
            break;
          case 'price-desc':
            query += ` | order(price desc)`;
            break;
          case 'name':
            query += ` | order(name asc)`;
            break;
          case 'newest':
            query += ` | order(_createdAt desc)`;
            break;
          case 'featured':
            query += ` | order(isFeatured desc, _createdAt desc)`;
            break;
          default:
            query += ` | order(isFeatured desc, _createdAt desc)`;
        }
      } else {
        // Default sorting: featured first, then newest
        query += ` | order(isFeatured desc, _createdAt desc)`;
      }

      // Fetch from Sanity
      console.log('📡 Executing GROQ query:', query.substring(0, 200) + '...');
      const data: SanityProduct[] = await sanityClient.fetch(query);
      console.log('📥 Raw Sanity response:', data.length, 'products');
      
      // Client-side price filtering (more flexible than GROQ)
      let filteredData = data;
      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        filteredData = data.filter((product) => {
          if (filters.minPrice !== undefined && product.price < filters.minPrice) {
            return false;
          }
          if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
            return false;
          }
          return true;
        });
      }
      
      // Transform Sanity products to match component interface
      const { transformSanityProduct } = await import('@/types/sanity');
      const transformedProducts = filteredData.map(transformSanityProduct);
      
      console.log('🛒 Fetched products from Sanity:', transformedProducts.length);
      
      // Store in cache BEFORE setting state (use transformed data directly)
      const cacheKey = JSON.stringify(filters || {});
      productCache.set(cacheKey, { data: transformedProducts, timestamp: Date.now() });
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products from Sanity:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Check cache first
    const cacheKey = JSON.stringify(filters || {});
    const cached = productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Using cached products:', cached.data.length);
      setProducts(cached.data);
      setLoading(false);
      return;
    }
    
    // Fetch if cache miss or expired
    fetchProducts();

    // ⚠️ REAL-TIME SUBSCRIPTIONS DISABLED TO SAVE API QUOTA
    // Uncomment only if you upgrade to Growth/Team plan
    /*
    // Build query for real-time subscription
    let query = `*[_type == "product"`;
    if (filters?.isAvailable !== false) {
      query += ` && isAvailable == true`;
    }
    if (filters?.category) {
      query += ` && category->slug.current == "${filters.category}"`;
    }
    if (filters?.featured) {
      query += ` && isFeatured == true`;
    }
    if (filters?.search) {
      query += ` && name match "${filters.search}*"`;
    }
    query += `]`;
    
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          query += ` | order(price asc)`;
          break;
        case 'price-desc':
          query += ` | order(price desc)`;
          break;
        case 'name':
          query += ` | order(name asc)`;
          break;
        case 'newest':
          query += ` | order(_createdAt desc)`;
          break;
        case 'featured':
          query += ` | order(isFeatured desc, _createdAt desc)`;
          break;
        default:
          query += ` | order(isFeatured desc, _createdAt desc)`;
      }
    } else {
      query += ` | order(isFeatured desc, _createdAt desc)`;
    }

    query += ` {
      _id,
      _createdAt,
      _updatedAt,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "stock": quantity,
      sku,
      weight,
      unit,
      isAvailable,
      isFeatured,
      "isPromo": isOnPromo,
      promoEndDate,
      "mainImage": image.asset->url,
      "images": images[].asset->url,
      category->{ _id, name, slug, description },
      subcategory->{ _id, name, slug }
    }`;

    // ⚠️ REAL-TIME LISTENER DISABLED - Uncomment only if upgraded to Growth/Team plan
    // Set up real-time listener
    /*
    const subscription = sanityClient
      .listen(query, {}, { includeResult: true })
      .subscribe(async (update) => {
        if (update.type === 'mutation' && 'result' in update && update.result) {
          const data = update.result as unknown as SanityProduct[];
          
          if (Array.isArray(data)) {
            // Apply client-side price filtering
            let filteredData = data;
            if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
              filteredData = data.filter((product) => {
                if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
                if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
                return true;
              });
            }
            
            const { transformSanityProduct } = await import('@/types/sanity');
            const transformedProducts = filteredData.map(transformSanityProduct);
            setProducts(transformedProducts);
            console.log('🔄 Products updated in real-time!', { count: transformedProducts.length });
          }
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Products subscription cleaned up');
    };
    */
  }, [
    filters?.category,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.featured,
    filters?.isAvailable,
    filters?.search,
    filters?.sortBy,
    fetchProducts,
  ]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}

/**
 * Fetch single product by slug from Sanity CMS
 * 
 * @param slug - Product slug
 * @returns product, loading state, error
 * 
 * @example
 * const { product, loading } = useSanityProduct('fresh-oyster-mushroom-250g');
 */
export function useSanityProduct(slug: string) {
  const [product, setProduct] = useState<TransformedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "product" && slug.current == $slug][0] {
          _id,
          _createdAt,
          _updatedAt,
          name,
          slug,
          description,
          price,
          compareAtPrice,
          "stock": quantity,
          sku,
          weight,
          unit,
          isAvailable,
          isFeatured,
          "isPromo": isOnPromo,
          promoEndDate,
          "mainImage": image.asset->url,
          "images": images[].asset->url,
          category->{
            _id,
            name,
            "slug": slug.current,
            description
          },
          subcategory->{
            _id,
            name,
            "slug": slug.current
          },
          
          // E-Commerce Enhancements: Related Products
          suggestedProducts[]->{
            _id,
            name,
            "slug": slug.current,
            price,
            "image": image.asset->url,
            "isPromo": isOnPromo,
            isFeatured
          },
          complementaryProducts[]->{
            _id,
            name,
            "slug": slug.current,
            price,
            "image": image.asset->url,
            "isPromo": isOnPromo
          },
          productTags,
          
          // Enhanced Product Info: Freshness, Preparation, Delivery
          freshnessInfo {
            harvestWindow,
            shelfLife,
            storageInstructions,
            qualityIndicators
          },
          preparationInfo {
            difficultyLevel,
            cookingTime,
            preparationTips,
            recipeIdeas[] {
              name,
              description,
              url
            }
          },
          deliveryOptions {
            sameDayDeliveryEligible,
            deliveryZones,
            deliveryNotes,
            perishable
          },
          deliveryWeight {
            packageWeight,
            packageDimensions {
              length,
              width,
              height
            }
          },
          nutritionalHighlights,
          searchKeywords
        }`;

        const data: SanityProduct | null = await sanityClient.fetch(query, { slug });
        
        if (data) {
          const { transformSanityProduct } = await import('@/types/sanity');
          setProduct(transformSanityProduct(data));
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product from Sanity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();

      // Set up real-time listener for single product
      const query = `*[_type == "product" && slug.current == "${slug}"][0] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        price,
        compareAtPrice,
        "stock": quantity,
        sku,
        weight,
        unit,
        isAvailable,
        isFeatured,
        "isPromo": isOnPromo,
        promoEndDate,
        "mainImage": image.asset->url,
        "images": images[].asset->url,
        category->{ _id, name, "slug": slug.current, description },
        subcategory->{ _id, name, "slug": slug.current },
        suggestedProducts[]->{
          _id,
          name,
          "slug": slug.current,
          price,
          "image": image.asset->url,
          "isPromo": isOnPromo,
          isFeatured
        },
        complementaryProducts[]->{
          _id,
          name,
          "slug": slug.current,
          price,
          "image": image.asset->url,
          "isPromo": isOnPromo
        },
        productTags,
        freshnessInfo,
        preparationInfo,
        deliveryOptions,
        deliveryWeight,
        nutritionalHighlights,
        searchKeywords
      }`;

      const subscription = sanityClient
        .listen(query, {}, { includeResult: true })
        .subscribe(async (update) => {
          if (update.type === 'mutation' && 'result' in update && update.result) {
            const data = update.result as unknown as SanityProduct;
            
            if (data) {
              const { transformSanityProduct } = await import('@/types/sanity');
              setProduct(transformSanityProduct(data));
              console.log('🔄 Product updated in real-time!', data.name);
            }
          }
        });

      return () => {
        subscription.unsubscribe();
        console.log('🧹 Product subscription cleaned up');
      };
    }
  }, [slug]);

  return { product, loading, error };
}

/**
 * Fetch featured products from Sanity CMS
 * Used for homepage product carousel
 * 
 * @param limit - Number of featured products to fetch (default: 8)
 * @returns featured products, loading state, error
 * 
 * @example
 * const { products, loading } = useSanityFeaturedProducts(6);
 */
export function useSanityFeaturedProducts(limit: number = 8) {
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "product" && isFeatured == true && isAvailable == true] | order(_createdAt desc) [0...${limit}] {
          _id,
          _createdAt,
          name,
          slug,
          description,
          price,
          compareAtPrice,
          "stock": quantity,
          sku,
          weight,
          unit,
          "isPromo": isOnPromo,
          promoEndDate,
          "mainImage": image.asset->url,
          "images": images[].asset->url,
          category->{
            name,
            slug
          }
        }`;

        const data: SanityProduct[] = await sanityClient.fetch(query);
        
        const { transformSanityProduct } = await import('@/types/sanity');
        const transformedProducts = data.map(transformSanityProduct);
        
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching featured products from Sanity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();

    // Set up real-time listener for featured products
    const query = `*[_type == "product" && isFeatured == true && isAvailable == true] | order(_createdAt desc) [0...${limit}] {
      _id,
      _createdAt,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "stock": quantity,
      sku,
      weight,
      unit,
      "isPromo": isOnPromo,
      promoEndDate,
      "mainImage": image.asset->url,
      "images": images[].asset->url,
      category->{ name, slug }
    }`;

    const subscription = sanityClient
      .listen(query, {}, { includeResult: true })
      .subscribe(async (update) => {
        if (update.type === 'mutation' && 'result' in update && update.result) {
          const data = update.result as unknown as SanityProduct[];
          
          if (Array.isArray(data)) {
            const { transformSanityProduct } = await import('@/types/sanity');
            const transformedProducts = data.map(transformSanityProduct);
            setProducts(transformedProducts);
            console.log('🔄 Featured products updated in real-time!', { count: transformedProducts.length });
          }
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Featured products subscription cleaned up');
    };
  }, [limit]);

  return { products, loading, error };
}
