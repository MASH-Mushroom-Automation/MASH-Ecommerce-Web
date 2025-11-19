/**
 * useSanityHero Hook
 * 
 * Custom React hook for fetching hero carousel from Sanity CMS.
 * Connects to the heroCarousel singleton for real-time updates.
 */

import { useEffect, useState } from 'react';
import { sanityClient } from '@/lib/sanity/client';

export interface SanityHeroSlide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: 'primary' | 'secondary' | 'ghost';
  image?: string;
  order: number;
  isActive: boolean;
}

export interface SanityHeroCarousel {
  slides: SanityHeroSlide[];
}

interface UseSanityHeroReturn {
  slides: SanityHeroSlide[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch hero carousel from Sanity CMS
 * 
 * @returns slides, loading state, error, and refetch function
 * 
 * @example
 * const { slides, loading, error } = useSanityHero();
 */
export function useSanityHero(): UseSanityHeroReturn {
  const [slides, setSlides] = useState<SanityHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHero = async () => {
    try {
      setLoading(true);
      setError(null);

      // GROQ query to fetch hero carousel singleton
      const query = `*[_type == "heroCarousel"][0] {
        slides[] {
          title,
          subtitle,
          buttonText,
          buttonLink,
          buttonStyle,
          "image": image.asset->url,
          order,
          isActive
        }
      }`;

      const data: SanityHeroCarousel | null = await sanityClient.fetch(query);

      if (data && data.slides) {
        // Filter active slides and sort by order
        const activeSlides = data.slides
          .filter(slide => slide.isActive)
          .sort((a, b) => a.order - b.order);
        
        setSlides(activeSlides);
      } else {
        setSlides([]);
      }
    } catch (err) {
      console.error('Error fetching hero carousel:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch hero carousel'));
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  return {
    slides,
    loading,
    error,
    refetch: fetchHero,
  };
}
