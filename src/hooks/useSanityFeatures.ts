/**
 * useSanityFeatures Hook - WITH REAL-TIME UPDATES
 * Phase 4: Feature Sections from Sanity CMS
 * 
 * Custom React hook for fetching feature sections from Sanity CMS.
 * Used for homepage "Why MASH" section and similar feature highlights.
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

/**
 * Feature Item Interface (nested in Feature Section)
 */
export interface SanityFeatureItem {
  icon: string;
  headline: string;
  subheadline: string;
  link?: string;
  isActive: boolean;
  displayOrder: number;
}

/**
 * Feature Section Interface from Sanity
 */
export interface SanityFeatureSection {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  subtitle?: string;
  features: SanityFeatureItem[];
  backgroundColor?: 'light' | 'muted' | 'dark' | 'gradient';
  columns?: number;
  showOnHomepage: boolean;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Transformed Feature Section for Frontend
 */
export interface TransformedFeatureSection {
  id: string;
  title: string;
  subtitle: string;
  features: {
    id: string;
    icon: string;
    headline: string;
    subheadline: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
  }[];
  backgroundColor: string;
  columns: number;
  showOnHomepage: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform Sanity Feature Section to Frontend Format
 */
function transformFeatureSection(section: SanityFeatureSection): TransformedFeatureSection {
  return {
    id: section._id,
    title: section.title,
    subtitle: section.subtitle || '',
    features: (section.features || []).map((feature, index) => ({
      id: `${section._id}-feature-${index}`,
      icon: feature.icon || 'Leaf',
      headline: feature.headline,
      subheadline: feature.subheadline,
      link: feature.link,
      isActive: feature.isActive !== false,
      displayOrder: feature.displayOrder || index,
    })),
    backgroundColor: section.backgroundColor || 'light',
    columns: section.columns || 3,
    showOnHomepage: section.showOnHomepage !== false,
    displayOrder: section.displayOrder || 0,
    isActive: section.isActive !== false,
    createdAt: section._createdAt,
    updatedAt: section._updatedAt,
  };
}

// Cache for feature sections to reduce API calls
const featureCache = new Map<string, { data: TransformedFeatureSection[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Hook: useSanityFeatures
 * Fetches all active feature sections from Sanity
 * 
 * @param options - Filter options
 * @returns { features, loading, error, refetch }
 * 
 * @example
 * ```tsx
 * const { features, loading, error } = useSanityFeatures({ homepageOnly: true });
 * ```
 */
export function useSanityFeatures(options?: { homepageOnly?: boolean }) {
  const [features, setFeatures] = useState<TransformedFeatureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const homepageOnly = options?.homepageOnly ?? true;
  const cacheKey = `features-${homepageOnly ? 'homepage' : 'all'}`;

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = featureCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Using cached feature sections');
        setFeatures(cached.data);
        setLoading(false);
        return;
      }

      // Build GROQ query
      let query = `*[_type == "featureSection" && isActive == true`;
      
      if (homepageOnly) {
        query += ` && showOnHomepage == true`;
      }
      
      query += `] | order(displayOrder asc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        subtitle,
        features[] {
          icon,
          headline,
          subheadline,
          link,
          isActive,
          displayOrder
        },
        backgroundColor,
        columns,
        showOnHomepage,
        displayOrder,
        isActive
      }`;

      console.log('🔍 Fetching feature sections from Sanity...');
      const data: SanityFeatureSection[] = await sanityClient.fetch(query);
      
      // Transform to frontend format
      const transformedFeatures = data.map(transformFeatureSection);
      
      // Update cache
      featureCache.set(cacheKey, { data: transformedFeatures, timestamp: Date.now() });
      
      console.log(`✅ Loaded ${transformedFeatures.length} feature section(s) from Sanity`);
      setFeatures(transformedFeatures);
    } catch (err) {
      console.error('❌ Error fetching feature sections:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, homepageOnly]);

  useEffect(() => {
    fetchFeatures();

    // ⚠️ REAL-TIME SUBSCRIPTIONS DISABLED TO SAVE API QUOTA
    // Uncomment only if you upgrade to Growth/Team plan
    /*
    const query = `*[_type == "featureSection" && isActive == true${
      homepageOnly ? ' && showOnHomepage == true' : ''
    }]`;
    
    const subscription = sanityClient.listen(query).subscribe({
      next: () => {
        console.log('🔄 Feature section updated, refetching...');
        featureCache.delete(cacheKey);
        fetchFeatures();
      },
      error: (err) => console.error('Subscription error:', err),
    });

    return () => subscription.unsubscribe();
    */
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    refetch: () => {
      featureCache.delete(cacheKey);
      fetchFeatures();
    },
  };
}

/**
 * Hook: useSanityFeatureSection
 * Fetches a single feature section by slug
 * 
 * @param slug - The feature section slug
 * @returns { feature, loading, error }
 * 
 * @example
 * ```tsx
 * const { feature, loading } = useSanityFeatureSection('why-choose-mash');
 * ```
 */
export function useSanityFeatureSection(slug: string) {
  const [feature, setFeature] = useState<TransformedFeatureSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeature = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "featureSection" && slug.current == $slug][0] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        subtitle,
        features[] {
          icon,
          headline,
          subheadline,
          link,
          isActive,
          displayOrder
        },
        backgroundColor,
        columns,
        showOnHomepage,
        displayOrder,
        isActive
      }`;

      const data: SanityFeatureSection | null = await sanityClient.fetch(query, { slug });
      
      if (data) {
        setFeature(transformFeatureSection(data));
      } else {
        setFeature(null);
      }
    } catch (err) {
      console.error('Error fetching feature section:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFeature();
  }, [fetchFeature]);

  return {
    feature,
    loading,
    error,
    refetch: fetchFeature,
  };
}

/**
 * API Function: getFeatureSections
 * Server-side fetching of feature sections
 * 
 * @param homepageOnly - Only fetch sections marked for homepage
 * @returns Promise<TransformedFeatureSection[]>
 */
export async function getFeatureSections(homepageOnly: boolean = true): Promise<TransformedFeatureSection[]> {
  try {
    let query = `*[_type == "featureSection" && isActive == true`;
    
    if (homepageOnly) {
      query += ` && showOnHomepage == true`;
    }
    
    query += `] | order(displayOrder asc) {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      subtitle,
      features[] {
        icon,
        headline,
        subheadline,
        link,
        isActive,
        displayOrder
      },
      backgroundColor,
      columns,
      showOnHomepage,
      displayOrder,
      isActive
    }`;

    const data: SanityFeatureSection[] = await sanityClient.fetch(query);
    return data.map(transformFeatureSection);
  } catch (error) {
    console.error('Error fetching feature sections:', error);
    return [];
  }
}
