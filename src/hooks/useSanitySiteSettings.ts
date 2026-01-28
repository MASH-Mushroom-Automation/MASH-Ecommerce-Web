"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient, listenSafe } from "@/lib/sanity/client";

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
    linkText?: string;
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
    enableSameDayDelivery?: boolean; // Phase 5: Lalamove same-day delivery toggle
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
    linkText?: string;
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
    enableSameDayDelivery?: boolean; // Phase 5: Lalamove same-day delivery toggle
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
    logo: settings.logo || '/logo.png', // Default logo from public folder
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

      // ✅ Phase 5 Update: Full query for comprehensive siteSettings schema
      // Schema file: studio/src/schemaTypes/singletons/siteSettings.ts
      const query = `*[_type == "siteSettings"][0] {
        _id,
        _createdAt,
        _updatedAt,
        _type,
        // Company Info
        companyName,
        tagline,
        description,
        "logo": logo.asset->url,
        "favicon": favicon.asset->url,
        // Contact Info
        contactEmail,
        contactPhone,
        address {
          street,
          city,
          state,
          zipCode,
          country
        },
        // Social Media
        socialMedia {
          facebook,
          instagram,
          twitter,
          linkedin,
          youtube,
          tiktok
        },
        // Announcement Bar
        announcementBar {
          enabled,
          message,
          link,
          linkText,
          backgroundColor,
          textColor
        },
        // Footer
        footer {
          aboutText,
          copyrightText,
          showNewsletter,
          newsletterTitle,
          newsletterDescription,
          links[] {
            title,
            url,
            external
          }
        },
        // SEO
        seo {
          metaTitle,
          metaDescription,
          keywords,
          "ogImage": ogImage.asset->url
        },
        // Business Hours
        businessHours {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
          timezone,
          note
        },
        // Features
        features {
          enableBlog,
          enableShop,
          enableGrowerProfiles,
          enableReviews,
          enableWishlist,
          enableSameDayDelivery
        }
      }`;

      console.log('📦 Fetching site settings from Sanity (siteSettings)...');
      const data = await sanityClient.fetch<SanitySiteSettings | null>(query);
      
      if (data) {
        const transformedData = transformSiteSettings(data);
        setSettings(transformedData);
        console.log('✅ Site settings fetched successfully');
      } else {
        // Fallback to legacy settings document if siteSettings not found
        console.log('⚠️ No siteSettings found, trying legacy settings...');
        const legacyQuery = `*[_type == "settings"][0] {
          _id,
          _createdAt,
          _updatedAt,
          _type,
          title,
          description,
          "ogImage": ogImage.asset->url
        }`;
        
        interface LegacySettings {
          _id: string;
          _createdAt: string;
          _updatedAt: string;
          _type: string;
          title?: string;
          description?: string;
          ogImage?: string;
        }
        
        const legacyData = await sanityClient.fetch<LegacySettings | null>(legacyQuery);
        
        if (legacyData) {
          // Transform legacy data to expected format
          const transformedLegacy: TransformedSiteSettings = {
            id: legacyData._id,
            companyName: legacyData.title || 'MASH Mushroom E-Commerce',
            tagline: 'Premium Quality Mushrooms',
            description: typeof legacyData.description === 'string' 
              ? legacyData.description 
              : 'Premium quality fresh, dried, and specialty mushrooms delivered same-day',
            logo: undefined,
            favicon: undefined,
            contactEmail: undefined,
            contactPhone: undefined,
            address: undefined,
            socialMedia: undefined,
            announcementBar: undefined,
            footer: undefined,
            seo: legacyData.ogImage ? { ogImage: legacyData.ogImage } : undefined,
            businessHours: undefined,
            features: undefined,
            createdAt: legacyData._createdAt,
            updatedAt: legacyData._updatedAt,
          };
          setSettings(transformedLegacy);
          console.log('✅ Legacy settings used as fallback');
        } else {
          setSettings(null);
          console.log('⚠️ No settings found');
        }
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
    console.debug('🔌 Setting up site settings real-time subscription');
    
    // Listen to both siteSettings and legacy settings
    const query = `*[_type in ["siteSettings", "settings"]][0]`;

    const subscription = listenSafe(query)
      .subscribe((update) => {
        console.debug('📡 Site settings mutation event received:', update.type);
        
        if (update.type === 'mutation') {
          // Re-fetch to get fresh data with image URLs
          fetchSettings();
          console.info('🔄 Site settings updated in real-time!');
        }
      });

    return () => {
      subscription.unsubscribe();
      console.debug('🧹 Site settings subscription cleaned up');
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

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION HOOKS - Phase 5
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Navigation Menu Item Interface
 */
export interface NavigationMenuItem {
  _key: string;
  label: string;
  linkType: 'internal' | 'external' | 'pageRef' | 'none';
  internalPath?: string;
  externalUrl?: string;
  pageReference?: {
    _id: string;
    slug?: { current: string };
    title?: string;
  };
  openInNewTab?: boolean;
  icon?: string;
  highlight?: boolean;
  highlightText?: string;
  children?: NavigationMenuItem[];
}

/**
 * Navigation Menu Interface
 */
export interface NavigationMenu {
  _id: string;
  title: string;
  slug: { current: string };
  menuType: 'header-main' | 'header-secondary' | 'header-mobile' | 'footer-shop' | 'footer-support' | 'footer-about' | 'footer-legal';
  items: NavigationMenuItem[];
  isActive: boolean;
  displayOrder: number;
}

/**
 * Hook: useSanityNavigation
 * Fetches navigation menus by type with real-time updates
 * 
 * @param menuType - Type of menu to fetch (e.g., 'header-main', 'footer-shop')
 * @returns { menu, loading, error, refetch }
 * 
 * @example
 * ```tsx
 * const { menu } = useSanityNavigation('header-main');
 * 
 * return (
 *   <nav>
 *     {menu?.items.map((item) => (
 *       <a key={item._key} href={item.internalPath || item.externalUrl}>
 *         {item.label}
 *       </a>
 *     ))}
 *   </nav>
 * );
 * ```
 */
export function useSanityNavigation(menuType: NavigationMenu['menuType']) {
  const [menu, setMenu] = useState<NavigationMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "navigation" && menuType == $menuType && isActive == true][0] {
        _id,
        title,
        slug,
        menuType,
        displayOrder,
        isActive,
        items[] {
          _key,
          label,
          linkType,
          internalPath,
          externalUrl,
          pageReference-> {
            _id,
            slug,
            title
          },
          openInNewTab,
          icon,
          highlight,
          highlightText,
          children[] {
            _key,
            label,
            linkType,
            internalPath,
            externalUrl,
            openInNewTab,
            icon
          }
        }
      }`;

      console.log(`📦 Fetching ${menuType} navigation from Sanity...`);
      const data = await sanityClient.fetch<NavigationMenu | null>(query, { menuType });
      
      if (data) {
        setMenu(data);
        console.log(`✅ ${menuType} navigation fetched (${data.items?.length || 0} items)`);
      } else {
        setMenu(null);
        console.log(`⚠️ No ${menuType} navigation found`);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${menuType} navigation:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [menuType]);

  useEffect(() => {
    fetchMenu();

    // Set up REAL-TIME subscription for navigation
    console.debug(`🔌 Setting up ${menuType} navigation real-time subscription`);
    
    const query = `*[_type == "navigation" && menuType == $menuType]`;

    const subscription = listenSafe(query, { menuType })
      .subscribe((update) => {
        console.log(`📡 ${menuType} navigation mutation event received:`, update.type);
        
        if (update.type === 'mutation') {
          fetchMenu();
          console.log(`🔄 ${menuType} navigation updated in real-time!`);
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log(`🧹 ${menuType} navigation subscription cleaned up`);
    };
  }, [fetchMenu, menuType]);

  return { menu, loading, error, refetch: fetchMenu };
}

/**
 * Hook: useSanityAllNavigations
 * Fetches all navigation menus at once
 * 
 * @returns { navigations, loading, error }
 */
export function useSanityAllNavigations() {
  const [navigations, setNavigations] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNavigations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "navigation" && isActive == true] | order(displayOrder asc) {
        _id,
        title,
        slug,
        menuType,
        displayOrder,
        isActive,
        items[] {
          _key,
          label,
          linkType,
          internalPath,
          externalUrl,
          pageReference-> {
            _id,
            slug,
            title
          },
          openInNewTab,
          icon,
          highlight,
          highlightText,
          children[] {
            _key,
            label,
            linkType,
            internalPath,
            externalUrl,
            openInNewTab,
            icon
          }
        }
      }`;

      console.log('📦 Fetching all navigation menus from Sanity...');
      const data = await sanityClient.fetch<NavigationMenu[]>(query);
      
      if (data) {
        setNavigations(data);
        console.log(`✅ All navigations fetched (${data.length} menus)`);
      } else {
        setNavigations([]);
        console.log('⚠️ No navigation menus found');
      }
    } catch (err) {
      console.error('❌ Error fetching all navigations:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavigations();

    // Set up REAL-TIME subscription for all navigations
    console.debug('🔌 Setting up all navigations real-time subscription');
    
    const query = `*[_type == "navigation"]`;

    const subscription = listenSafe(query)
      .subscribe((update) => {
        console.log('📡 Navigation mutation event received:', update.type);
        
        if (update.type === 'mutation') {
          fetchNavigations();
          console.log('🔄 Navigations updated in real-time!');
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 All navigations subscription cleaned up');
    };
  }, [fetchNavigations]);

  return { navigations, loading, error, refetch: fetchNavigations };
}

/**
 * Helper: Get navigation menu by type from array
 */
export function getNavigationByType(
  navigations: NavigationMenu[],
  menuType: NavigationMenu['menuType']
): NavigationMenu | undefined {
  return navigations.find((nav) => nav.menuType === menuType);
}
