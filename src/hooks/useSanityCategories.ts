/**
 * useSanityCategories Hook - WITH REAL-TIME UPDATES
 * 
 * Custom React hook for fetching product categories from Sanity CMS with instant updates.
 * Updates automatically when categories change in Sanity Studio (~1-2 seconds).
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient, listenSafe } from '@/lib/sanity/client';
import type { SanityCategory, SanityProduct } from '@/types/sanity';

/**
 * Transformed Category Interface
 * Simplified structure for frontend consumption
 */
export interface TransformedCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category Filter Options
 */
export interface CategoryFilters {
  limit?: number;
  includeProductCount?: boolean;
}

/**
 * Transform Sanity Category to Frontend Format
 */
function transformCategory(category: SanityCategory & { productCount?: number; parentId?: string }): TransformedCategory {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug.current,
    description: category.description,
    image: category.image,
    productCount: category.productCount || 0,
    parentId: category.parentId,
    createdAt: category._createdAt,
    updatedAt: category._updatedAt,
  };
}

/**
 * Hook 1: useSanityCategories
 * Fetches all categories with REAL-TIME UPDATES
 * 
 * @param filters - Optional filters for categories
 * @returns { categories, loading, error, refetch }
 * 
 * Updates instantly when:
 * - New category is created
 * - Category name/description is edited
 * - Category image is changed
 * - Category is deleted
 * 
 * @example
 * ```tsx
 * const { categories, loading } = useSanityCategories({ limit: 10 });
 * ```
 */
export function useSanityCategories(filters?: CategoryFilters) {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const includeProductCount = filters?.includeProductCount !== false; // Default true

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build GROQ query
      let query = `*[_type == "category" && !(_id in path("drafts.**"))] | order(name asc)`;
      
      if (filters?.limit) {
        query += ` [0...${filters.limit}]`;
      }

      query += ` {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "image": image.asset->url,
        "parentId": parent->_id,
        ${includeProductCount ? `"productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])` : ''}
      }`;

      const data = await sanityClient.fetch<Array<SanityCategory & { productCount?: number; parentId?: string }>>(query);
      
      const transformed = data.map(transformCategory);
      setCategories(transformed);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters?.limit, includeProductCount]);

  useEffect(() => {
    fetchCategories();

    // Set up REAL-TIME subscription
    let query = `*[_type == "category" && !(_id in path("drafts.**"))] | order(name asc)`;
    
    if (filters?.limit) {
      query += ` [0...${filters.limit}]`;
    }

    const subscription = listenSafe(query)
      .subscribe((update) => {
        if (update.type === 'mutation') {
          fetchCategories();
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCategories, filters?.limit]);

  return { categories, loading, error, refetch: fetchCategories };
}

/**
 * Hook 2: useSanityCategory
 * Fetches a single category by slug with REAL-TIME UPDATES
 * 
 * @param slug - Category slug
 * @returns { category, loading, error, refetch }
 * 
 * Updates instantly when:
 * - Category details are edited
 * - Category image is changed
 * - Category is deleted (returns null)
 * - Product count changes
 * 
 * @example
 * ```tsx
 * const { category, loading } = useSanityCategory('oyster-mushrooms');
 * ```
 */
export function useSanityCategory(slug: string) {
  const [category, setCategory] = useState<TransformedCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "category" && slug.current == $slug][0] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "image": image.asset->url,
        "parentId": parent->_id,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
      }`;

      const data = await sanityClient.fetch<SanityCategory & { productCount?: number; parentId?: string }>(query, { slug });
      
      if (data) {
        setCategory(transformCategory(data));
      } else {
        setCategory(null);
      }
    } catch (err) {
      console.error(`Error fetching category "${slug}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    fetchCategory();

    // Set up REAL-TIME subscription for this specific category
    const query = `*[_type == "category" && slug.current == $slug][0]`;

    const subscription = sanityClient
      .listen(query, { slug })
      .subscribe((update) => {
        if (update.type === 'mutation') {
          if (update.result) {
            fetchCategory();
          } else {
            setCategory(null);
          }
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [slug, fetchCategory]);

  return { category, loading, error, refetch: fetchCategory };
}

/**
 * Hook 3: useSanityParentCategories
 * Fetches parent categories (categories without a parent) with REAL-TIME UPDATES
 * Used for main category navigation
 * 
 * @returns { categories, loading, error, refetch }
 * 
 * Updates instantly when parent categories change
 * 
 * @example
 * ```tsx
 * const { categories, loading } = useSanityParentCategories();
 * ```
 */
export function useSanityParentCategories() {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParentCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "category" && !defined(parent) && !(_id in path("drafts.**"))] | order(name asc) {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "image": image.asset->url,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
      }`;

      const data = await sanityClient.fetch<Array<SanityCategory & { productCount?: number }>>(query);
      
      const transformed = data.map(transformCategory);
      setCategories(transformed);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParentCategories();

    // Set up REAL-TIME subscription
    const query = `*[_type == "category" && !defined(parent) && !(_id in path("drafts.**"))]`;

    const subscription = listenSafe(query)
      .subscribe((update) => {
        if (update.type === 'mutation') {
          fetchParentCategories();
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchParentCategories]);

  return { categories, loading, error, refetch: fetchParentCategories };
}

/**
 * Hook 4: useSanitySubcategories
 * Fetches subcategories for a specific parent category with REAL-TIME UPDATES
 * 
 * @param parentId - Parent category ID
 * @returns { categories, loading, error, refetch }
 * 
 * Updates instantly when subcategories change
 * 
 * @example
 * ```tsx
 * const { categories, loading } = useSanitySubcategories('category_id_123');
 * ```
 */
export function useSanitySubcategories(parentId: string) {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubcategories = useCallback(async () => {
    if (!parentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "category" && parent._ref == $parentId && !(_id in path("drafts.**"))] | order(name asc) {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "image": image.asset->url,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
      }`;

      const data = await sanityClient.fetch<Array<SanityCategory & { productCount?: number }>>(query, { parentId });
      
      const transformed = data.map((cat) => ({
        ...transformCategory(cat),
        parentId,
      }));
      setCategories(transformed);
    } catch (err) {
      console.error(`Error fetching subcategories for parent "${parentId}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    if (!parentId) return;

    fetchSubcategories();

    // Set up REAL-TIME subscription
    const query = `*[_type == "category" && parent._ref == $parentId && !(_id in path("drafts.**"))]`;

    const subscription = listenSafe(query, { parentId })
      .subscribe((update) => {
        if (update.type === 'mutation') {
          fetchSubcategories();
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [parentId, fetchSubcategories]);

  return { categories, loading, error, refetch: fetchSubcategories };
}

/**
 * Hook 5: useSanityProductsByCategory
 * Fetches products filtered by category with REAL-TIME UPDATES
 * 
 * @param categorySlug - Category slug to filter by
 * @param limit - Optional limit on number of products
 * @returns { products, loading, error, refetch }
 * 
 * Updates instantly when:
 * - Products are added to category
 * - Products are removed from category
 * - Product details change
 * 
 * @example
 * ```tsx
 * const { products, loading } = useSanityProductsByCategory('oyster-mushrooms', 12);
 * ```
 */
export function useSanityProductsByCategory(categorySlug: string, limit?: number) {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = `*[_type == "product" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))] | order(name asc)`;
      
      if (limit) {
        query += ` [0...${limit}]`;
      }

      query += ` {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        price,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        "images": images[].asset->url,
        category->{
          _id,
          name,
          slug
        },
        inStock,
        featured,
        unit,
        weight,
        nutrition
      }`;

      const data = await sanityClient.fetch<SanityProduct[]>(query, { categorySlug });
      
      setProducts(data || []);
    } catch (err) {
      console.error(`Error fetching products for category "${categorySlug}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, limit]);

  useEffect(() => {
    if (!categorySlug) return;

    fetchProducts();

    // Set up REAL-TIME subscription for products in this category
    let query = `*[_type == "product" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))]`;
    
    if (limit) {
      query += ` [0...${limit}]`;
    }

    const subscription = listenSafe(query, { categorySlug })
      .subscribe((update) => {
        if (update.type === 'mutation') {
          fetchProducts();
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [categorySlug, limit, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
