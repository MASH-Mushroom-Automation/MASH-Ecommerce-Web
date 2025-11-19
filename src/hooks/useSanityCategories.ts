/**
 * useSanityCategories Hook
 * 
 * Custom React hook for fetching product categories from Sanity CMS.
 */

import { useEffect, useState } from 'react';
import { sanityClient } from '@/lib/sanity/client';
import type { SanityCategory } from '@/types/sanity';

interface TransformedCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  parentId?: string;
}

interface UseSanityCategoriesReturn {
  categories: TransformedCategory[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all product categories from Sanity CMS
 * 
 * @param includeProductCount - Include product count for each category (default: true)
 * @returns categories, loading state, error, and refetch function
 * 
 * @example
 * const { categories, loading } = useSanityCategories();
 */
export function useSanityCategories(includeProductCount: boolean = true): UseSanityCategoriesReturn {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // GROQ query to fetch categories with optional product count
      const query = `*[_type == "category"] | order(name asc) {
        _id,
        name,
        slug,
        description,
        "image": image.asset->url,
        "parentId": parent->_id,
        ${includeProductCount ? `"productCount": count(*[_type == "product" && category._ref == ^._id && isAvailable == true])` : ''}
      }`;

      const data: Array<SanityCategory & { productCount?: number; parentId?: string }> = await sanityClient.fetch(query);
      
      // Transform categories to simpler format
      const transformedCategories: TransformedCategory[] = data.map((category) => ({
        id: category._id,
        name: category.name,
        slug: category.slug.current,
        description: category.description,
        image: category.image,
        productCount: category.productCount,
        parentId: category.parentId,
      }));
      
      setCategories(transformedCategories);
    } catch (err) {
      console.error('Error fetching categories from Sanity:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeProductCount]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Fetch single category by slug from Sanity CMS
 * 
 * @param slug - Category slug
 * @returns category, loading state, error
 * 
 * @example
 * const { category, loading } = useSanityCategory('oyster-mushroom');
 */
export function useSanityCategory(slug: string) {
  const [category, setCategory] = useState<TransformedCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "category" && slug.current == $slug][0] {
          _id,
          name,
          slug,
          description,
          "image": image.asset->url,
          "parentId": parent->_id,
          "productCount": count(*[_type == "product" && category._ref == ^._id && isAvailable == true])
        }`;

        const data: (SanityCategory & { productCount?: number; parentId?: string }) | null = await sanityClient.fetch(query, { slug });
        
        if (data) {
          setCategory({
            id: data._id,
            name: data.name,
            slug: data.slug.current,
            description: data.description,
            image: data.image,
            productCount: data.productCount,
            parentId: data.parentId,
          });
        } else {
          setCategory(null);
        }
      } catch (err) {
        console.error('Error fetching category from Sanity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  return { category, loading, error };
}

/**
 * Fetch parent categories (categories without a parent) from Sanity CMS
 * Used for main category navigation
 * 
 * @returns parent categories, loading state, error
 * 
 * @example
 * const { categories, loading } = useSanityParentCategories();
 */
export function useSanityParentCategories() {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchParentCategories() {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "category" && !defined(parent)] | order(name asc) {
          _id,
          name,
          slug,
          description,
          "image": image.asset->url,
          "productCount": count(*[_type == "product" && category._ref == ^._id && isAvailable == true])
        }`;

        const data: Array<SanityCategory & { productCount?: number }> = await sanityClient.fetch(query);
        
        const transformedCategories: TransformedCategory[] = data.map((category) => ({
          id: category._id,
          name: category.name,
          slug: category.slug.current,
          description: category.description,
          image: category.image,
          productCount: category.productCount,
        }));
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching parent categories from Sanity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchParentCategories();
  }, []);

  return { categories, loading, error };
}

/**
 * Fetch subcategories for a specific parent category
 * 
 * @param parentId - Parent category ID
 * @returns subcategories, loading state, error
 * 
 * @example
 * const { categories, loading } = useSanitySubcategories('category_id_123');
 */
export function useSanitySubcategories(parentId: string) {
  const [categories, setCategories] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubcategories() {
      try {
        setLoading(true);
        setError(null);

        const query = `*[_type == "category" && parent._ref == $parentId] | order(name asc) {
          _id,
          name,
          slug,
          description,
          "image": image.asset->url,
          "productCount": count(*[_type == "product" && category._ref == ^._id && isAvailable == true])
        }`;

        const data: Array<SanityCategory & { productCount?: number }> = await sanityClient.fetch(query, { parentId });
        
        const transformedCategories: TransformedCategory[] = data.map((category) => ({
          id: category._id,
          name: category.name,
          slug: category.slug.current,
          description: category.description,
          image: category.image,
          productCount: category.productCount,
          parentId,
        }));
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching subcategories from Sanity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (parentId) {
      fetchSubcategories();
    }
  }, [parentId]);

  return { categories, loading, error };
}
