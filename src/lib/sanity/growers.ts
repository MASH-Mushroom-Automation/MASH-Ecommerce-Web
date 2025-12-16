/**
 * Sanity Grower Data Functions (Server-Side)
 * 
 * This file contains server-compatible functions for fetching grower data.
 * These can be used in Server Components, generateStaticParams, and generateMetadata.
 * 
 * For client-side hooks, use @/hooks/useSanityGrowers instead.
 */

import { sanityClient } from './client';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SanityGrower {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _type: 'grower';
  name: string;
  slug: { current: string };
  tagline?: string;
  description?: string;
  bio?: string;
  location?: string;
  region?: string;
  logo?: {
    asset: { _ref: string };
    alt?: string;
  };
  coverImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  phone?: string;
  email?: string;
  operatingHours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryZones?: string[];
  specialties?: string[];
  certifications?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  sortOrder: number;
  joinedDate?: string;
  products?: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
    mainImage?: string;
  }>;
  suppliesTo?: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    storeType: 'main' | 'pickup' | 'partner' | 'distribution';
    address?: {
      city?: string;
      state?: string;
    };
  }>;
}

export interface TransformedGrower {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  bio?: string;
  location?: string;
  region?: string;
  imageUrl?: string;
  imageAlt?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  deliveryZones?: string[];
  specialties?: string[];
  specialtiesFormatted?: string[];
  certifications?: string[];
  certificationsFormatted?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  sortOrder: number;
  joinedDate?: string;
  productCount?: number;
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl?: string;
  }>;
  suppliesTo?: Array<{
    id: string;
    name: string;
    slug: string;
    storeType: 'main' | 'pickup' | 'partner' | 'distribution';
    city?: string;
    state?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SPECIALTY_LABELS: Record<string, string> = {
  'oyster': 'Oyster Mushrooms',
  'shiitake': 'Shiitake',
  'lions-mane': "Lion's Mane",
  'king-trumpet': 'King Trumpet',
  'enoki': 'Enoki',
  'maitake': 'Maitake',
  'reishi': 'Reishi',
  'chanterelle': 'Chanterelle',
  'portobello': 'Portobello',
  'white-button': 'White Button',
};

const CERTIFICATION_LABELS: Record<string, string> = {
  'organic': 'Organic Certified',
  'gap': 'GAP Certified',
  'haccp': 'HACCP',
  'fda': 'FDA Registered',
  'iso': 'ISO Certified',
  'bfad': 'BFAD Approved',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function buildImageUrl(ref?: string): string | undefined {
  if (!ref) return undefined;
  
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  
  const parts = ref.replace('image-', '').split('-');
  if (parts.length < 3) return undefined;
  
  const id = parts[0];
  const dimensions = parts[1];
  const format = parts[2];
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
}

// ============================================================
// TRANSFORM FUNCTION
// ============================================================

function transformGrower(grower: SanityGrower): TransformedGrower {
  const googleMapsUrl = grower.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${grower.coordinates.lat},${grower.coordinates.lng}`
    : undefined;

  const specialtiesFormatted = grower.specialties?.map(
    specialty => SPECIALTY_LABELS[specialty] || specialty
  );

  const certificationsFormatted = grower.certifications?.map(
    cert => CERTIFICATION_LABELS[cert] || cert
  );

  const imageUrl = grower.logo?.asset?._ref
    ? buildImageUrl(grower.logo.asset._ref)
    : undefined;

  const coverImageUrl = grower.coverImage?.asset?._ref
    ? buildImageUrl(grower.coverImage.asset._ref)
    : undefined;

  const products = grower.products?.map(product => ({
    id: product._id,
    name: product.name,
    slug: product.slug?.current || '',
    price: product.price,
    imageUrl: product.mainImage || undefined,
  }));

  const suppliesTo = grower.suppliesTo?.map(store => ({
    id: store._id,
    name: store.name,
    slug: store.slug?.current || '',
    storeType: store.storeType,
    city: store.address?.city,
    state: store.address?.state,
  }));

  return {
    id: grower._id,
    name: grower.name,
    slug: grower.slug?.current || '',
    tagline: grower.tagline,
    description: grower.description,
    bio: grower.bio,
    location: grower.location,
    region: grower.region,
    imageUrl,
    imageAlt: grower.logo?.alt,
    coverImageUrl,
    coverImageAlt: grower.coverImage?.alt,
    phone: grower.phone,
    email: grower.email,
    operatingHours: grower.operatingHours,
    coordinates: grower.coordinates,
    googleMapsUrl,
    deliveryZones: grower.deliveryZones,
    specialties: grower.specialties,
    specialtiesFormatted,
    certifications: grower.certifications,
    certificationsFormatted,
    socialLinks: grower.socialLinks,
    isActive: grower.isActive ?? true,
    isVerified: grower.isVerified ?? false,
    isFeatured: grower.isFeatured ?? false,
    sortOrder: grower.sortOrder ?? 0,
    joinedDate: grower.joinedDate,
    productCount: grower.products?.length || 0,
    products,
    suppliesTo,
    createdAt: grower._createdAt,
    updatedAt: grower._updatedAt,
  };
}

// ============================================================
// GROQ QUERIES
// ============================================================

const GROWERS_QUERY = `*[_type == "grower" && isActive == true] | order(sortOrder asc, name asc) {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  tagline,
  description,
  bio,
  location,
  region,
  logo,
  coverImage,
  phone,
  email,
  operatingHours,
  coordinates,
  deliveryZones,
  specialties,
  certifications,
  socialLinks,
  isActive,
  isVerified,
  isFeatured,
  sortOrder,
  joinedDate,
  "products": products[0...4]-> {
    _id,
    name,
    slug,
    price,
    "mainImage": coalesce(mainImage.asset->url, image.asset->url)
  },
  "suppliesTo": coalesce(suppliesTo, availableAtStores)[]-> {
    _id,
    name,
    slug,
    storeType,
    address { city, state }
  }
}`;

const GROWER_BY_SLUG_QUERY = `*[_type == "grower" && slug.current == $slug][0] {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  tagline,
  description,
  bio,
  location,
  region,
  logo,
  coverImage,
  phone,
  email,
  operatingHours,
  coordinates,
  deliveryZones,
  specialties,
  certifications,
  socialLinks,
  isActive,
  isVerified,
  isFeatured,
  sortOrder,
  joinedDate,
  "products": products[]-> {
    _id,
    name,
    slug,
    price,
    "mainImage": coalesce(mainImage.asset->url, image.asset->url)
  },
  "suppliesTo": coalesce(suppliesTo, availableAtStores)[]-> {
    _id,
    name,
    slug,
    storeType,
    address { city, state }
  }
}`;

const FEATURED_GROWERS_QUERY = `*[_type == "grower" && isActive == true && isFeatured == true] | order(sortOrder asc, name asc) [0...6] {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  tagline,
  location,
  region,
  logo,
  specialties,
  isVerified,
  isFeatured,
  "productCount": count(products)
}`;

const GROWER_SLUGS_QUERY = `*[_type == "grower" && isActive == true] {
  "slug": slug.current
}`;

// ============================================================
// SERVER-SIDE FETCH FUNCTIONS
// ============================================================

/**
 * Fetch all active growers
 * @returns Array of transformed growers
 */
export async function fetchGrowers(): Promise<TransformedGrower[]> {
  try {
    const growers = await sanityClient.fetch<SanityGrower[]>(
      GROWERS_QUERY,
      {},
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    return growers.map(transformGrower);
  } catch (error) {
    console.error('Error fetching growers:', error);
    return [];
  }
}

/**
 * Fetch a single grower by slug
 * @param slug - Grower slug
 * @returns Transformed grower or null
 */
export async function fetchGrowerBySlug(slug: string): Promise<TransformedGrower | null> {
  try {
    const grower = await sanityClient.fetch<SanityGrower | null>(
      GROWER_BY_SLUG_QUERY,
      { slug },
      { next: { revalidate: 300 } }
    );
    
    if (!grower) return null;
    
    return transformGrower(grower);
  } catch (error) {
    console.error('Error fetching grower by slug:', error);
    return null;
  }
}

/**
 * Fetch featured growers for homepage
 * @returns Array of featured growers
 */
export async function fetchFeaturedGrowers(): Promise<TransformedGrower[]> {
  try {
    const growers = await sanityClient.fetch<SanityGrower[]>(
      FEATURED_GROWERS_QUERY,
      {},
      { next: { revalidate: 300 } }
    );
    
    return growers.map(transformGrower);
  } catch (error) {
    console.error('Error fetching featured growers:', error);
    return [];
  }
}

/**
 * Fetch all grower slugs for static generation
 * @returns Array of slugs
 */
export async function fetchGrowerSlugs(): Promise<string[]> {
  try {
    const result = await sanityClient.fetch<Array<{ slug: string }>>(
      GROWER_SLUGS_QUERY,
      {},
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    return result.map(g => g.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching grower slugs:', error);
    return [];
  }
}

/**
 * Fetch grower for metadata generation
 * @param slug - Grower slug
 * @returns Basic grower info for metadata
 */
export async function fetchGrowerForMetadata(slug: string): Promise<{
  name: string;
  description?: string;
  image?: string;
} | null> {
  try {
    const grower = await sanityClient.fetch<{
      name: string;
      description?: string;
      tagline?: string;
      logo?: { asset: { _ref: string } };
    } | null>(
      `*[_type == "grower" && slug.current == $slug][0] {
        name,
        description,
        tagline,
        logo
      }`,
      { slug },
      { next: { revalidate: 300 } }
    );
    
    if (!grower) return null;
    
    return {
      name: grower.name,
      description: grower.description || grower.tagline,
      image: grower.logo?.asset?._ref ? buildImageUrl(grower.logo.asset._ref) : undefined,
    };
  } catch (error) {
    console.error('Error fetching grower for metadata:', error);
    return null;
  }
}
