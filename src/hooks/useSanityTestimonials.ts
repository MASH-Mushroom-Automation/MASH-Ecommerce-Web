/**
 * useSanityTestimonials Hook
 * Phase 7: Fetch customer testimonials from Sanity CMS
 * 
 * Provides client-side and server-side functions for fetching testimonials.
 * Supports filtering by position, rating, and featured status.
 * 
 * @file src/hooks/useSanityTestimonials.ts
 * @created November 27, 2025
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface SanityTestimonial {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  customerName: string;
  customerTitle?: string;
  customerImage?: {
    asset: {
      _ref: string;
      url: string;
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  };
  location?: string;
  isVerifiedPurchase: boolean;
  rating: number;
  headline: string;
  quote: string;
  productPurchased?: {
    _id: string;
    name: string;
    slug: { current: string };
    image?: { asset: { url: string } };
  };
  grower?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  date?: string;
  images?: Array<{
    asset: { url: string };
    alt?: string;
    caption?: string;
  }>;
  videoUrl?: string;
  displayPosition: 'homepage' | 'shop' | 'product' | 'grower' | 'all';
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface TransformedTestimonial {
  id: string;
  customerName: string;
  customerTitle?: string;
  customerImage?: string;
  location?: string;
  isVerified: boolean;
  rating: number;
  headline: string;
  quote: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
  grower?: {
    id: string;
    name: string;
    slug: string;
  };
  date?: string;
  images?: string[];
  videoUrl?: string;
  position: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface TestimonialFilters {
  position?: 'homepage' | 'shop' | 'product' | 'grower' | 'all';
  featured?: boolean;
  minRating?: number;
  limit?: number;
  productId?: string;
  growerId?: string;
}

// ═══════════════════════════════════════════════════════════════
// GROQ QUERIES
// ═══════════════════════════════════════════════════════════════

const TESTIMONIALS_QUERY = `*[_type == "testimonial" && isActive == true] | order(isFeatured desc, sortOrder asc) {
  _id,
  _createdAt,
  _updatedAt,
  customerName,
  customerTitle,
  "customerImage": customerImage.asset->url,
  location,
  isVerifiedPurchase,
  rating,
  headline,
  quote,
  productPurchased->{
    _id,
    name,
    slug,
    "image": image.asset->url
  },
  grower->{
    _id,
    name,
    slug
  },
  date,
  "images": images[].asset->url,
  videoUrl,
  displayPosition,
  sortOrder,
  isFeatured,
  isActive
}`;

const FEATURED_TESTIMONIALS_QUERY = `*[_type == "testimonial" && isActive == true && isFeatured == true] | order(sortOrder asc) [0...$limit] {
  _id,
  _createdAt,
  customerName,
  customerTitle,
  "customerImage": customerImage.asset->url,
  location,
  isVerifiedPurchase,
  rating,
  headline,
  quote,
  productPurchased->{
    _id,
    name,
    slug,
    "image": image.asset->url
  },
  date,
  isFeatured
}`;

const TESTIMONIALS_BY_POSITION_QUERY = `*[_type == "testimonial" && isActive == true && (displayPosition == $position || displayPosition == "all")] | order(isFeatured desc, sortOrder asc) [0...$limit] {
  _id,
  _createdAt,
  customerName,
  customerTitle,
  "customerImage": customerImage.asset->url,
  location,
  isVerifiedPurchase,
  rating,
  headline,
  quote,
  productPurchased->{
    _id,
    name,
    slug,
    "image": image.asset->url
  },
  date,
  displayPosition,
  isFeatured
}`;

// ═══════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function transformTestimonial(raw: SanityTestimonial): TransformedTestimonial {
  return {
    id: raw._id,
    customerName: raw.customerName,
    customerTitle: raw.customerTitle,
    customerImage: raw.customerImage?.asset?.url || raw.customerImage as unknown as string,
    location: raw.location,
    isVerified: raw.isVerifiedPurchase,
    rating: raw.rating,
    headline: raw.headline,
    quote: raw.quote,
    product: raw.productPurchased ? {
      id: raw.productPurchased._id,
      name: raw.productPurchased.name,
      slug: raw.productPurchased.slug?.current || '',
      image: raw.productPurchased.image?.asset?.url,
    } : undefined,
    grower: raw.grower ? {
      id: raw.grower._id,
      name: raw.grower.name,
      slug: raw.grower.slug?.current || '',
    } : undefined,
    date: raw.date,
    images: raw.images?.map((img) => typeof img === 'string' ? img : img.asset?.url).filter(Boolean) as string[],
    videoUrl: raw.videoUrl,
    position: raw.displayPosition,
    isFeatured: raw.isFeatured,
    createdAt: raw._createdAt,
  };
}

// ═══════════════════════════════════════════════════════════════
// CLIENT-SIDE HOOKS
// ═══════════════════════════════════════════════════════════════

interface UseSanityTestimonialsReturn {
  testimonials: TransformedTestimonial[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all active testimonials
 */
export function useSanityTestimonials(filters?: TestimonialFilters): UseSanityTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<TransformedTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = TESTIMONIALS_QUERY;
      const params: Record<string, unknown> = {};

      // If filtering by position, use position-specific query
      if (filters?.position) {
        query = TESTIMONIALS_BY_POSITION_QUERY;
        params.position = filters.position;
        params.limit = filters.limit || 10;
      }

      // If filtering by featured only
      if (filters?.featured) {
        query = FEATURED_TESTIMONIALS_QUERY;
        params.limit = filters.limit || 6;
      }

      const data = await sanityClient.fetch(query, params);
      const transformed: TransformedTestimonial[] = (data || []).map(transformTestimonial);
      
      // Apply additional client-side filters
      let filtered: TransformedTestimonial[] = transformed;
      
      if (filters?.minRating) {
        filtered = filtered.filter((t: TransformedTestimonial) => t.rating >= (filters.minRating || 0));
      }
      
      if (filters?.productId) {
        filtered = filtered.filter((t: TransformedTestimonial) => t.product?.id === filters.productId);
      }
      
      if (filters?.growerId) {
        filtered = filtered.filter((t: TransformedTestimonial) => t.grower?.id === filters.growerId);
      }
      
      if (filters?.limit && !filters?.position && !filters?.featured) {
        filtered = filtered.slice(0, filters.limit);
      }

      setTestimonials(filtered);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch testimonials'));
    } finally {
      setLoading(false);
    }
  }, [filters?.position, filters?.featured, filters?.minRating, filters?.productId, filters?.growerId, filters?.limit]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, loading, error, refetch: fetchTestimonials };
}

/**
 * Fetch featured testimonials only
 */
export function useFeaturedTestimonials(limit: number = 6): UseSanityTestimonialsReturn {
  return useSanityTestimonials({ featured: true, limit });
}

/**
 * Fetch testimonials for homepage
 */
export function useHomepageTestimonials(limit: number = 6): UseSanityTestimonialsReturn {
  return useSanityTestimonials({ position: 'homepage', limit });
}

/**
 * Fetch testimonials for a specific product
 */
export function useProductTestimonials(productId: string, limit: number = 5): UseSanityTestimonialsReturn {
  return useSanityTestimonials({ productId, limit });
}

/**
 * Fetch testimonials for a specific grower
 */
export function useGrowerTestimonials(growerId: string, limit: number = 5): UseSanityTestimonialsReturn {
  return useSanityTestimonials({ growerId, limit });
}

// ═══════════════════════════════════════════════════════════════
// SERVER-SIDE FUNCTIONS (for SSR/SSG)
// ═══════════════════════════════════════════════════════════════

/**
 * Server-side: Fetch all testimonials
 */
export async function fetchTestimonials(filters?: TestimonialFilters): Promise<TransformedTestimonial[]> {
  try {
    let query = TESTIMONIALS_QUERY;
    const params: Record<string, unknown> = {};

    if (filters?.position) {
      query = TESTIMONIALS_BY_POSITION_QUERY;
      params.position = filters.position;
      params.limit = filters.limit || 10;
    }

    if (filters?.featured) {
      query = FEATURED_TESTIMONIALS_QUERY;
      params.limit = filters.limit || 6;
    }

    const data = await sanityClient.fetch(query, params);
    let transformed = (data || []).map(transformTestimonial);

    if (filters?.minRating) {
      transformed = transformed.filter((t: TransformedTestimonial) => t.rating >= (filters.minRating || 0));
    }

    if (filters?.limit && !filters?.position && !filters?.featured) {
      transformed = transformed.slice(0, filters.limit);
    }

    return transformed;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

/**
 * Server-side: Fetch featured testimonials
 */
export async function fetchFeaturedTestimonials(limit: number = 6): Promise<TransformedTestimonial[]> {
  return fetchTestimonials({ featured: true, limit });
}

/**
 * Server-side: Fetch homepage testimonials
 */
export async function fetchHomepageTestimonials(limit: number = 6): Promise<TransformedTestimonial[]> {
  return fetchTestimonials({ position: 'homepage', limit });
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Render star rating as emojis or icons
 */
export function renderStarRating(rating: number): string {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

/**
 * Get average rating from testimonials
 */
export function getAverageRating(testimonials: TransformedTestimonial[]): number {
  if (testimonials.length === 0) return 0;
  const sum = testimonials.reduce((acc, t) => acc + t.rating, 0);
  return Math.round((sum / testimonials.length) * 10) / 10;
}

/**
 * Format date for display
 */
export function formatTestimonialDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
