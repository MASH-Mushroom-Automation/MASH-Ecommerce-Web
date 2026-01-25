/**
 * Sanity RAG (Retrieval-Augmented Generation) System
 * 
 * Fetches product data from Sanity CMS for AI chatbot context.
 * Enables product card embedding in chatbot responses.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.1
 */

import { sanityClient } from '@/lib/sanity/client';
import { groq } from 'next-sanity';

/**
 * Product data structure for RAG context
 * Contains all data needed for product card embedding
 */
export interface RAGProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  grower?: {
    name: string;
    id: string;
  };
  tags: string[];
  benefits?: string[];
}

/**
 * Category data structure for RAG context
 */
export interface RAGCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

/**
 * Recipe data structure for RAG context
 */
export interface RAGRecipe {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  ingredients: string[];
  cookingTime?: number;
}

/**
 * Grower/Seller data structure for RAG context
 */
export interface RAGGrower {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  specialties: string[];
  location?: string;
}

/**
 * Fetches all products from Sanity CMS with complete data for product cards
 * 
 * @returns Array of products with images, prices, and descriptions
 */
export async function fetchAllProducts(): Promise<RAGProduct[]> {
  const query = groq`*[_type == "product" && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    "image": coalesce(mainImage.asset->url, image.asset->url),
    "category": category->title,
    inStock,
    "grower": grower->{
      name,
      "_id": _id
    },
    tags,
    benefits
  }`;

  try {
    const products = await sanityClient.fetch<RAGProduct[]>(query);
    return products || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching products:', error);
    return [];
  }
}

/**
 * Fetches all categories from Sanity CMS
 * 
 * @returns Array of categories
 */
export async function fetchAllCategories(): Promise<RAGCategory[]> {
  const query = groq`*[_type == "category" && !(_id in path("drafts.**"))] {
    _id,
    title,
    "slug": slug.current,
    description
  }`;

  try {
    const categories = await sanityClient.fetch<RAGCategory[]>(query);
    return categories || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetches all recipes from Sanity CMS
 * 
 * @returns Array of recipes
 */
export async function fetchAllRecipes(): Promise<RAGRecipe[]> {
  const query = groq`*[_type == "recipe" && !(_id in path("drafts.**"))] {
    _id,
    title,
    "slug": slug.current,
    description,
    ingredients,
    cookingTime
  }`;

  try {
    const recipes = await sanityClient.fetch<RAGRecipe[]>(query);
    return recipes || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching recipes:', error);
    return [];
  }
}

/**
 * Fetches all growers/sellers from Sanity CMS
 * 
 * @returns Array of growers with specialties
 */
export async function fetchAllGrowers(): Promise<RAGGrower[]> {
  const query = groq`*[_type == "grower" && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    bio,
    specialties,
    location
  }`;

  try {
    const growers = await sanityClient.fetch<RAGGrower[]>(query);
    return growers || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching growers:', error);
    return [];
  }
}

/**
 * Fetches a specific product by ID or slug
 * 
 * @param identifier - Product ID or slug
 * @returns Product data or null
 */
export async function fetchProductByIdentifier(
  identifier: string
): Promise<RAGProduct | null> {
  const query = groq`*[_type == "product" && (_id == $id || slug.current == $slug)] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    "image": coalesce(mainImage.asset->url, image.asset->url),
    "category": category->title,
    inStock,
    "grower": grower->{
      name,
      "_id": _id
    },
    tags,
    benefits
  }[0]`;

  try {
    const product = await sanityClient.fetch<RAGProduct | null>(query, {
      id: identifier,
      slug: identifier,
    });
    return product;
  } catch (error) {
    console.error('[Sanity RAG] Error fetching product:', error);
    return null;
  }
}

/**
 * Fetches products by category
 * 
 * @param categorySlug - Category slug
 * @returns Array of products in that category
 */
export async function fetchProductsByCategory(
  categorySlug: string
): Promise<RAGProduct[]> {
  const query = groq`*[_type == "product" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    "image": coalesce(mainImage.asset->url, image.asset->url),
    "category": category->title,
    inStock,
    "grower": grower->{
      name,
      "_id": _id
    },
    tags,
    benefits
  }`;

  try {
    const products = await sanityClient.fetch<RAGProduct[]>(query, {
      categorySlug,
    });
    return products || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching products by category:', error);
    return [];
  }
}

/**
 * Fetches products by grower
 * 
 * @param growerId - Grower ID
 * @returns Array of products from that grower
 */
export async function fetchProductsByGrower(
  growerId: string
): Promise<RAGProduct[]> {
  const query = groq`*[_type == "product" && grower._ref == $growerId && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    "image": coalesce(mainImage.asset->url, image.asset->url),
    "category": category->title,
    inStock,
    "grower": grower->{
      name,
      "_id": _id
    },
    tags,
    benefits
  }`;

  try {
    const products = await sanityClient.fetch<RAGProduct[]>(query, {
      growerId,
    });
    return products || [];
  } catch (error) {
    console.error('[Sanity RAG] Error fetching products by grower:', error);
    return [];
  }
}

/**
 * Caches Sanity data for faster RAG lookups
 */
class SanityRAGCache {
  private products: RAGProduct[] | null = null;
  private categories: RAGCategory[] | null = null;
  private recipes: RAGRecipe[] | null = null;
  private growers: RAGGrower[] | null = null;
  private lastFetchTime: number = 0;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Gets cached products or fetches fresh data
   */
  async getProducts(): Promise<RAGProduct[]> {
    if (this.shouldRefresh() || !this.products) {
      this.products = await fetchAllProducts();
      this.lastFetchTime = Date.now();
    }
    return this.products;
  }

  /**
   * Gets cached categories or fetches fresh data
   */
  async getCategories(): Promise<RAGCategory[]> {
    if (this.shouldRefresh() || !this.categories) {
      this.categories = await fetchAllCategories();
    }
    return this.categories;
  }

  /**
   * Gets cached recipes or fetches fresh data
   */
  async getRecipes(): Promise<RAGRecipe[]> {
    if (this.shouldRefresh() || !this.recipes) {
      this.recipes = await fetchAllRecipes();
    }
    return this.recipes;
  }

  /**
   * Gets cached growers or fetches fresh data
   */
  async getGrowers(): Promise<RAGGrower[]> {
    if (this.shouldRefresh() || !this.growers) {
      this.growers = await fetchAllGrowers();
    }
    return this.growers;
  }

  /**
   * Clears all cached data
   */
  clear(): void {
    this.products = null;
    this.categories = null;
    this.recipes = null;
    this.growers = null;
    this.lastFetchTime = 0;
  }

  /**
   * Checks if cache should be refreshed
   */
  private shouldRefresh(): boolean {
    return Date.now() - this.lastFetchTime > this.CACHE_TTL;
  }
}

// Export singleton cache instance
export const ragCache = new SanityRAGCache();

/**
 * Gets all RAG data (products, categories, recipes, growers) from cache
 * 
 * @returns Complete RAG data for search and context building
 */
export async function getAllRAGData() {
  const [products, categories, recipes, growers] = await Promise.all([
    ragCache.getProducts(),
    ragCache.getCategories(),
    ragCache.getRecipes(),
    ragCache.getGrowers(),
  ]);

  return {
    products,
    categories,
    recipes,
    growers,
  };
}
