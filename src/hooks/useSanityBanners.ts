/**
 * useSanityBanners Hook
 * Phase 7: Fetch promotional banners from Sanity CMS
 * 
 * Provides client-side and server-side functions for fetching banners.
 * Supports filtering by position, scheduling, and device type.
 * 
 * @file src/hooks/useSanityBanners.ts
 * @created November 27, 2025
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type BannerPosition = 
  | 'homepage-top'
  | 'homepage-middle'
  | 'homepage-bottom'
  | 'shop-top'
  | 'shop-sidebar'
  | 'product-bottom'
  | 'cart-top'
  | 'checkout-bottom'
  | 'announcement';

export type BannerHeight = 'small' | 'medium' | 'large' | 'full';
export type ButtonStyle = 'primary' | 'outline' | 'secondary' | 'accent';
export type TextColor = 'white' | 'black' | 'primary' | 'accent';
export type TextAlignment = 'left' | 'center' | 'right';

export interface SanityBanner {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  promoCode?: string;
  desktopImage?: {
    asset: { url: string };
    alt?: string;
    hotspot?: { x: number; y: number };
  };
  mobileImage?: {
    asset: { url: string };
    alt?: string;
  };
  overlayOpacity?: number;
  backgroundColor?: string;
  textColor?: TextColor;
  textAlignment?: TextAlignment;
  bannerHeight?: BannerHeight;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: ButtonStyle;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  startDate?: string;
  endDate?: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  showOnMobile: boolean;
  showOnDesktop: boolean;
}

export interface TransformedBanner {
  id: string;
  title: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  promoCode?: string;
  desktopImage?: string;
  desktopImageAlt?: string;
  mobileImage?: string;
  mobileImageAlt?: string;
  overlayOpacity: number;
  backgroundColor?: string;
  textColor: TextColor;
  textAlignment: TextAlignment;
  bannerHeight: BannerHeight;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle: ButtonStyle;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  startDate?: string;
  endDate?: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  isScheduled: boolean;
  isExpired: boolean;
}

export interface BannerFilters {
  position?: BannerPosition;
  includeScheduled?: boolean;
  includeExpired?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// GROQ QUERIES
// ═══════════════════════════════════════════════════════════════

const BANNERS_QUERY = `*[_type == "banner" && isActive == true] | order(sortOrder asc) {
  _id,
  _createdAt,
  _updatedAt,
  title,
  headline,
  subheadline,
  description,
  promoCode,
  "desktopImage": desktopImage.asset->url,
  "desktopImageAlt": desktopImage.alt,
  "mobileImage": mobileImage.asset->url,
  "mobileImageAlt": mobileImage.alt,
  overlayOpacity,
  backgroundColor,
  textColor,
  textAlignment,
  bannerHeight,
  buttonText,
  buttonLink,
  buttonStyle,
  secondaryButtonText,
  secondaryButtonLink,
  startDate,
  endDate,
  position,
  sortOrder,
  isActive,
  showOnMobile,
  showOnDesktop
}`;

const BANNERS_BY_POSITION_QUERY = `*[_type == "banner" && isActive == true && position == $position] | order(sortOrder asc) {
  _id,
  _createdAt,
  _updatedAt,
  title,
  headline,
  subheadline,
  description,
  promoCode,
  "desktopImage": desktopImage.asset->url,
  "desktopImageAlt": desktopImage.alt,
  "mobileImage": mobileImage.asset->url,
  "mobileImageAlt": mobileImage.alt,
  overlayOpacity,
  backgroundColor,
  textColor,
  textAlignment,
  bannerHeight,
  buttonText,
  buttonLink,
  buttonStyle,
  secondaryButtonText,
  secondaryButtonLink,
  startDate,
  endDate,
  position,
  sortOrder,
  isActive,
  showOnMobile,
  showOnDesktop
}`;

// ═══════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function transformBanner(raw: SanityBanner): TransformedBanner {
  const now = new Date();
  const startDate = raw.startDate ? new Date(raw.startDate) : null;
  const endDate = raw.endDate ? new Date(raw.endDate) : null;
  
  const isScheduled = startDate ? startDate > now : false;
  const isExpired = endDate ? endDate < now : false;
  
  return {
    id: raw._id,
    title: raw.title,
    headline: raw.headline,
    subheadline: raw.subheadline,
    description: raw.description,
    promoCode: raw.promoCode,
    desktopImage: raw.desktopImage?.asset?.url || (raw.desktopImage as unknown as string),
    desktopImageAlt: raw.desktopImage?.alt,
    mobileImage: raw.mobileImage?.asset?.url || (raw.mobileImage as unknown as string),
    mobileImageAlt: raw.mobileImage?.alt,
    overlayOpacity: raw.overlayOpacity ?? 0.3,
    backgroundColor: raw.backgroundColor,
    textColor: raw.textColor || 'white',
    textAlignment: raw.textAlignment || 'center',
    bannerHeight: raw.bannerHeight || 'medium',
    buttonText: raw.buttonText,
    buttonLink: raw.buttonLink,
    buttonStyle: raw.buttonStyle || 'primary',
    secondaryButtonText: raw.secondaryButtonText,
    secondaryButtonLink: raw.secondaryButtonLink,
    startDate: raw.startDate,
    endDate: raw.endDate,
    position: raw.position,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    showOnMobile: raw.showOnMobile ?? true,
    showOnDesktop: raw.showOnDesktop ?? true,
    isScheduled,
    isExpired,
  };
}

/**
 * Filter banners based on scheduling and device
 */
function filterActiveBanners(
  banners: TransformedBanner[], 
  filters?: BannerFilters
): TransformedBanner[] {
  return banners.filter(banner => {
    // Filter by scheduling
    if (!filters?.includeScheduled && banner.isScheduled) return false;
    if (!filters?.includeExpired && banner.isExpired) return false;
    
    // Filter by device
    if (filters?.mobileOnly && !banner.showOnMobile) return false;
    if (filters?.desktopOnly && !banner.showOnDesktop) return false;
    
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// CLIENT-SIDE HOOKS
// ═══════════════════════════════════════════════════════════════

interface UseSanityBannersReturn {
  banners: TransformedBanner[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all active banners
 */
export function useSanityBanners(filters?: BannerFilters): UseSanityBannersReturn {
  const [banners, setBanners] = useState<TransformedBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = BANNERS_QUERY;
      const params: Record<string, unknown> = {};

      if (filters?.position) {
        query = BANNERS_BY_POSITION_QUERY;
        params.position = filters.position;
      }

      const data = await sanityClient.fetch(query, params);
      const transformed = (data || []).map(transformBanner);
      const filtered = filterActiveBanners(transformed, filters);

      setBanners(filtered);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch banners'));
    } finally {
      setLoading(false);
    }
  }, [filters?.position, filters?.includeScheduled, filters?.includeExpired, filters?.mobileOnly, filters?.desktopOnly]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return { banners, loading, error, refetch: fetchBanners };
}

/**
 * Fetch banners for a specific position
 */
export function useBannersByPosition(position: BannerPosition): UseSanityBannersReturn {
  return useSanityBanners({ position });
}

/**
 * Fetch homepage banners (top, middle, bottom)
 */
export function useHomepageBanners(): {
  topBanners: TransformedBanner[];
  middleBanners: TransformedBanner[];
  bottomBanners: TransformedBanner[];
  loading: boolean;
  error: Error | null;
} {
  const { banners, loading, error } = useSanityBanners();
  
  return {
    topBanners: banners.filter(b => b.position === 'homepage-top'),
    middleBanners: banners.filter(b => b.position === 'homepage-middle'),
    bottomBanners: banners.filter(b => b.position === 'homepage-bottom'),
    loading,
    error,
  };
}

/**
 * Fetch the announcement bar banner
 */
export function useAnnouncementBanner(): {
  banner: TransformedBanner | null;
  loading: boolean;
  error: Error | null;
} {
  const { banners, loading, error } = useBannersByPosition('announcement');
  
  return {
    banner: banners[0] || null,
    loading,
    error,
  };
}

// ═══════════════════════════════════════════════════════════════
// SERVER-SIDE FUNCTIONS (for SSR/SSG)
// ═══════════════════════════════════════════════════════════════

/**
 * Server-side: Fetch all banners
 */
export async function fetchBanners(filters?: BannerFilters): Promise<TransformedBanner[]> {
  try {
    let query = BANNERS_QUERY;
    const params: Record<string, unknown> = {};

    if (filters?.position) {
      query = BANNERS_BY_POSITION_QUERY;
      params.position = filters.position;
    }

    const data = await sanityClient.fetch(query, params);
    const transformed = (data || []).map(transformBanner);
    return filterActiveBanners(transformed, filters);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

/**
 * Server-side: Fetch banners by position
 */
export async function fetchBannersByPosition(position: BannerPosition): Promise<TransformedBanner[]> {
  return fetchBanners({ position });
}

/**
 * Server-side: Fetch homepage banners
 */
export async function fetchHomepageBanners(): Promise<{
  topBanners: TransformedBanner[];
  middleBanners: TransformedBanner[];
  bottomBanners: TransformedBanner[];
}> {
  const banners = await fetchBanners();
  
  return {
    topBanners: banners.filter(b => b.position === 'homepage-top'),
    middleBanners: banners.filter(b => b.position === 'homepage-middle'),
    bottomBanners: banners.filter(b => b.position === 'homepage-bottom'),
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get CSS height class for banner
 */
export function getBannerHeightClass(height: BannerHeight): string {
  const heights: Record<BannerHeight, string> = {
    small: 'h-[200px] md:h-[200px]',
    medium: 'h-[250px] md:h-[300px]',
    large: 'h-[300px] md:h-[400px]',
    full: 'h-[400px] md:h-[600px]',
  };
  return heights[height] || heights.medium;
}

/**
 * Get CSS text color class
 */
export function getTextColorClass(color: TextColor): string {
  const colors: Record<TextColor, string> = {
    white: 'text-white',
    black: 'text-gray-900',
    primary: 'text-primary',
    accent: 'text-accent',
  };
  return colors[color] || colors.white;
}

/**
 * Get CSS text alignment class
 */
export function getTextAlignmentClass(alignment: TextAlignment): string {
  const alignments: Record<TextAlignment, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  return alignments[alignment] || alignments.center;
}

/**
 * Get button variant
 */
export function getButtonVariant(style: ButtonStyle): 'default' | 'outline' | 'secondary' | 'ghost' {
  const variants: Record<ButtonStyle, 'default' | 'outline' | 'secondary' | 'ghost'> = {
    primary: 'default',
    outline: 'outline',
    secondary: 'secondary',
    accent: 'default',
  };
  return variants[style] || 'default';
}

/**
 * Check if banner should be displayed now (based on schedule)
 */
export function isBannerActive(banner: TransformedBanner): boolean {
  if (!banner.isActive) return false;
  if (banner.isScheduled) return false;
  if (banner.isExpired) return false;
  return true;
}

/**
 * Get time remaining until banner expires
 */
export function getTimeRemaining(endDate?: string): string | null {
  if (!endDate) return null;
  
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
  return 'Ending soon';
}
