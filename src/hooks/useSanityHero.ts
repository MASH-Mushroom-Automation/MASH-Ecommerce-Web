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
        // Filter and sort slides
        // Handle old data structure where isActive/order might be null
        const processedSlides = data.slides
          .filter(slide => {
            // If isActive is null/undefined, treat as active (for backwards compatibility)
            return slide.isActive !== false;
          })
          .map((slide, index) => ({
            ...slide,
            // Fill in missing required fields with defaults
            title: slide.title || 'Welcome to MASH',
            subtitle: slide.subtitle || '',
            buttonText: slide.buttonText || '',
            buttonLink: slide.buttonLink || '',
            buttonStyle: slide.buttonStyle || 'primary',
            order: slide.order || (index + 1),
            isActive: slide.isActive !== false,
          }))
          .sort((a, b) => a.order - b.order);
        
        setSlides(processedSlides);
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

    // Set up real-time listener for immediate updates
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

    // Subscribe to changes (Sanity's live updates)
    const subscription = sanityClient
      .listen(query, {}, { includeResult: true })
      .subscribe((update) => {
        // Check if this is a mutation event with result
        if (update.type === 'mutation' && 'result' in update && update.result) {
          const data = update.result as unknown as SanityHeroCarousel;
          if (data && data.slides) {
            const processedSlides = data.slides
              .filter(slide => slide.isActive !== false)
              .map((slide, index) => ({
                ...slide,
                subtitle: slide.subtitle || '',
                buttonStyle: slide.buttonStyle || 'primary',
                order: slide.order || (index + 1),
                isActive: slide.isActive !== false,
              }))
              .sort((a, b) => a.order - b.order);
            
            setSlides(processedSlides);
            console.log('🔄 Hero carousel updated in real-time!');
          }
        }
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    slides,
    loading,
    error,
    refetch: fetchHero,
  };
}
