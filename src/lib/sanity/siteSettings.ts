/**
 * Server-side Site Settings Fetching
 * 
 * Used for generating metadata in Next.js App Router.
 * This file provides functions that can be called from Server Components.
 */

import { sanityClient } from "@/lib/sanity/client";

export interface SiteSettingsForMetadata {
  companyName: string;
  tagline?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

/**
 * Fetch site settings for metadata generation (Server-side)
 * 
 * Used in layout.tsx or page.tsx generateMetadata function.
 * Caches the result for 5 minutes to reduce API calls.
 */
export async function getSiteSettingsForMetadata(): Promise<SiteSettingsForMetadata | null> {
  try {
    const query = `*[_type == "siteSettings"][0] {
      companyName,
      tagline,
      description,
      "logo": logo.asset->url,
      "favicon": favicon.asset->url,
      seo {
        metaTitle,
        metaDescription,
        keywords,
        "ogImage": ogImage.asset->url
      }
    }`;

    const settings = await sanityClient.fetch<SiteSettingsForMetadata | null>(
      query,
      {},
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    return settings;
  } catch (error) {
    console.error("Error fetching site settings for metadata:", error);
    return null;
  }
}

/**
 * Fetch full site settings (Server-side)
 * 
 * Returns complete site settings including contact, social, etc.
 */
export async function getFullSiteSettings() {
  try {
    const query = `*[_type == "siteSettings"][0] {
      _id,
      companyName,
      tagline,
      description,
      "logo": logo.asset->url,
      "favicon": favicon.asset->url,
      contactEmail,
      contactPhone,
      address {
        street,
        city,
        state,
        zipCode,
        country
      },
      socialMedia {
        facebook,
        instagram,
        twitter,
        linkedin,
        youtube,
        tiktok
      },
      announcementBar {
        enabled,
        message,
        link,
        linkText,
        backgroundColor,
        textColor
      },
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
      seo {
        metaTitle,
        metaDescription,
        keywords,
        "ogImage": ogImage.asset->url
      },
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
      features {
        enableBlog,
        enableShop,
        enableGrowerProfiles,
        enableReviews,
        enableWishlist,
        enableSameDayDelivery
      }
    }`;

    const settings = await sanityClient.fetch(
      query,
      {},
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    return settings;
  } catch (error) {
    console.error("Error fetching full site settings:", error);
    return null;
  }
}
