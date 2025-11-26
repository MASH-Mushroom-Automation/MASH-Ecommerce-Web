"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

/**
 * Sanity Site Settings Interface
 * Matches the siteSettings singleton document type in Sanity Studio
 */
export interface SanitySiteSettings {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _type: 'siteSettings';
  
  // Company Information
  companyName: string;
  tagline?: string;
  description?: string;
  logo?: string; // Logo image URL
  favicon?: string; // Favicon URL
  
  // Contact Information
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Social Media Links
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  
  // Announcement Bar
  announcementBar?: {
    enabled: boolean;
    message: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  
  // Footer Content
  footer?: {
    aboutText?: string;
    copyrightText?: string;
    showNewsletter?: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string;
    links?: Array<{
      title: string;
      url: string;
      external?: boolean;
    }>;
  };
  
  // SEO Defaults
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string; // Open Graph image URL
  };
  
  // Business Hours
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  // Features Toggles
  features?: {
    enableBlog?: boolean;
    enableShop?: boolean;
    enableGrowerProfiles?: boolean;
    enableReviews?: boolean;
    enableWishlist?: boolean;
  };
}

/**
 * Transformed Site Settings Interface
 * Simplified structure for frontend consumption
 */
export interface TransformedSiteSettings {
  id: string;
  companyName: string;
  tagline?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    full?: string; // Formatted full address
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  announcementBar?: {
    enabled: boolean;
    message: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  footer?: {
    aboutText?: string;
    copyrightText?: string;
    showNewsletter?: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string;
    links?: Array<{
      title: string;
      url: string;
      external?: boolean;
    }>;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    formatted?: string; // Human-readable hours
  };
  features?: {
    enableBlog?: boolean;
    enableShop?: boolean;
    enableGrowerProfiles?: boolean;
    enableReviews?: boolean;
    enableWishlist?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform Sanity Site Settings to Frontend Format
 */
function transformSiteSettings(settings: SanitySiteSettings): TransformedSiteSettings {
  // Format full address
  const fullAddress = settings.address
    ? [
        settings.address.street,
        settings.address.city,
        settings.address.state,
        settings.address.zipCode,
        settings.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;

  // Format business hours as readable string
  const formatBusinessHours = () => {
    if (!settings.businessHours) return undefined;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = [
      settings.businessHours.monday,
      settings.businessHours.tuesday,
      settings.businessHours.wednesday,
      settings.businessHours.thursday,
      settings.businessHours.friday,
      settings.businessHours.saturday,
      settings.businessHours.sunday,
    ];
    
    const formatted = days
      .map((day, index) => (hours[index] ? `${day}: ${hours[index]}` : null))
      .filter(Boolean)
      .join(' | ');
    
    return formatted || undefined;
  };

  return {
    id: settings._id,
    companyName: settings.companyName,
    tagline: settings.tagline,
    description: settings.description,
    logo: settings.logo || '/images/logo.png', // Default logo
    favicon: settings.favicon || '/favicon.ico',
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address
      ? {
          ...settings.address,
          full: fullAddress,
        }
      : undefined,
    socialMedia: settings.socialMedia,
    announcementBar: settings.announcementBar,
    footer: settings.footer,
    seo: settings.seo,
    businessHours: settings.businessHours
      ? {
          ...settings.businessHours,
          formatted: formatBusinessHours(),
        }
      : undefined,
    features: settings.features,
    createdAt: settings._createdAt,
    updatedAt: settings._updatedAt,
  };
}

/**
 * Hook: useSanitySiteSettings
 * Fetches site-wide settings with REAL-TIME UPDATES
 * 
 * @returns { settings, loading, error, refetch }
 * 
 * Updates instantly when:
 * - Logo is changed
 * - Company name/tagline edited
 * - Contact information updated
 * - Social media links changed
 * - Announcement bar toggled/edited
 * - Footer content modified
 * - SEO metadata updated
 * - Business hours changed
 * - Feature toggles updated
 * 
 * @example
 * ```tsx
 * const { settings, loading } = useSanitySiteSettings();
 * 
 * return (
 *   <header>
 *     <img src={settings?.logo} alt={settings?.companyName} />
 *     {settings?.announcementBar?.enabled && (
 *       <div>{settings.announcementBar.message}</div>
 *     )}
 *   </header>
 * );
 * ```
 */
export function useSanitySiteSettings() {
  const [settings, setSettings] = useState<TransformedSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🚨 TEMPORARY FIX: Query only fields that exist in current schema
      // Schema file: studio/src/schemaTypes/singletons/settings.tsx
      // Current schema has: title, description, ogImage
      // TODO: Extend schema to include all fields (see SANITY_PRODUCTS_INTEGRATION_PLAN.md Phase 0)
      const query = `*[_type == "settings"][0] {
        _id,
        _createdAt,
        _updatedAt,
        _type,
        title,
        description,
        "ogImage": ogImage.asset->url
      }`;

      console.log('📦 Fetching site settings from Sanity (simplified query)...');
      const data = await sanityClient.fetch<any>(query);
      
      if (data) {
        // Transform simplified data to expected format
        const transformedData: TransformedSiteSettings = {
          id: data._id,
          companyName: data.title || 'MASH Mushroom E-Commerce',
          tagline: 'Premium Quality Mushrooms',
          description: Array.isArray(data.description) ? data.description.map((block: any) => block.children?.map((child: any) => child.text).join(' ')).join('\n') : data.description,
          logo: undefined,
          favicon: undefined,
          contactEmail: undefined,
          contactPhone: undefined,
          address: undefined,
          socialMedia: undefined,
          announcementBar: undefined,
          footer: undefined,
          seo: undefined,
          businessHours: undefined,
          features: undefined,
        };
        setSettings(transformedData);
        console.log('✅ Site settings fetched (simplified)');
      } else {
        setSettings(null);
        console.log('⚠️ No site settings found');
      }
    } catch (err) {
      console.error('❌ Error fetching site settings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Set up REAL-TIME subscription for site settings
    console.log('🔌 Setting up site settings real-time subscription');
    
    const query = `*[_type == "siteSettings"][0]`;

    const subscription = sanityClient
      .listen(query)
      .subscribe((update) => {
        console.log('📡 Site settings mutation event received:', update.type);
        
        if (update.type === 'mutation') {
          // Re-fetch to get fresh data with image URLs
          fetchSettings();
          console.log('🔄 Site settings updated in real-time!');
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Site settings subscription cleaned up');
    };
  }, [fetchSettings]);

  return { settings, loading, error, refetch: fetchSettings };
}

/**
 * Hook: useSanityAnnouncementBar
 * Convenience hook for announcement bar only
 * 
 * @returns { announcementBar, loading, error }
 * 
 * @example
 * ```tsx
 * const { announcementBar } = useSanityAnnouncementBar();
 * 
 * if (!announcementBar?.enabled) return null;
 * 
 * return <div>{announcementBar.message}</div>;
 * ```
 */
export function useSanityAnnouncementBar() {
  const { settings, loading, error } = useSanitySiteSettings();
  
  return {
    announcementBar: settings?.announcementBar,
    loading,
    error,
  };
}

/**
 * Hook: useSanitySocialLinks
 * Convenience hook for social media links only
 * 
 * @returns { socialMedia, loading, error }
 * 
 * @example
 * ```tsx
 * const { socialMedia } = useSanitySocialLinks();
 * 
 * return (
 *   <div>
 *     {socialMedia?.facebook && <a href={socialMedia.facebook}>Facebook</a>}
 *     {socialMedia?.instagram && <a href={socialMedia.instagram}>Instagram</a>}
 *   </div>
 * );
 * ```
 */
export function useSanitySocialLinks() {
  const { settings, loading, error } = useSanitySiteSettings();
  
  return {
    socialMedia: settings?.socialMedia,
    loading,
    error,
  };
}

/**
 * Hook: useSanityFooterContent
 * Convenience hook for footer content only
 * 
 * @returns { footer, loading, error }
 * 
 * @example
 * ```tsx
 * const { footer } = useSanityFooterContent();
 * 
 * return (
 *   <footer>
 *     <p>{footer?.aboutText}</p>
 *     <p>{footer?.copyrightText}</p>
 *   </footer>
 * );
 * ```
 */
export function useSanityFooterContent() {
  const { settings, loading, error } = useSanitySiteSettings();
  
  return {
    footer: settings?.footer,
    loading,
    error,
  };
}
