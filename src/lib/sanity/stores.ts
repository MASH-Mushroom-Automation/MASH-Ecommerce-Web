/**
 * Sanity Store Data Functions (Server-Side)
 * 
 * This file contains server-compatible functions for fetching store data.
 * These can be used in Server Components, generateStaticParams, and generateMetadata.
 * 
 * For client-side hooks, use @/hooks/useSanityStores instead.
 */

import { sanityClient } from './client';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SanityStore {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _type: 'store';
  name: string;
  slug: { current: string };
  storeType: 'main' | 'pickup' | 'partner' | 'distribution';
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    landmark?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  directionsUrl?: string;
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  timezone?: string;
  hoursNote?: string;
  isOpen24Hours?: boolean;
  phone?: string;
  email?: string;
  whatsapp?: string;
  messenger?: string;
  services?: string[];
  deliveryZones?: string[];
  pickupInstructions?: string;
  image?: {
    asset: { _ref: string };
    alt?: string;
  };
  gallery?: Array<{
    asset: { _ref: string };
    alt?: string;
    caption?: string;
  }>;
  growers?: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    tagline?: string;
    isVerified?: boolean;
    image?: {
      asset: { _ref: string };
      alt?: string;
    };
    specialties?: string[];
    rating?: number;
    topProducts?: Array<{
      _id: string;
      name: string;
      slug: string;
      price: number;
      mainImage?: string;
    }>;
  }>;
}

export interface TransformedStore {
  id: string;
  name: string;
  slug: string;
  storeType: 'main' | 'pickup' | 'partner' | 'distribution';
  storeTypeLabel: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    landmark?: string;
    full?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  directionsUrl?: string;
  googleMapsUrl?: string;
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    today?: string;
  };
  timezone?: string;
  hoursNote?: string;
  isOpen24Hours?: boolean;
  isOpenNow?: boolean;
  phone?: string;
  email?: string;
  whatsapp?: string;
  whatsappUrl?: string;
  messenger?: string;
  services?: string[];
  servicesFormatted?: string[];
  deliveryZones?: string[];
  pickupInstructions?: string;
  imageUrl?: string;
  imageAlt?: string;
  gallery?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  growers?: Array<{
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    isVerified: boolean;
    imageUrl?: string;
    specialties?: string[];
    rating?: number;
    topProducts?: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      imageUrl?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SERVICE_LABELS: Record<string, string> = {
  'shopping': 'In-Store Shopping',
  'pickup': 'In-Store Pickup',
  'same-day-delivery': 'Same-Day Delivery (Lalamove)',
  'standard-delivery': 'Standard Delivery',
  'demo': 'Product Demo',
  'workshops': 'Growing Workshops',
  'farm-tour': 'Mushroom Farm Tour',
  'card-payment': 'Card Payment',
  'cod': 'Cash on Delivery',
  'e-wallet': 'GCash/PayMaya',
};

const STORE_TYPE_LABELS: Record<string, string> = {
  'main': 'Main Store',
  'pickup': 'Pickup Point',
  'partner': 'Partner Store',
  'distribution': 'Distribution Center',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

function checkIsOpenNow(hours?: Record<string, string | undefined>, isOpen24Hours?: boolean): boolean {
  if (isOpen24Hours) return true;
  if (!hours) return false;
  
  const today = getDayOfWeek();
  const todayHours = hours[today];
  if (!todayHours || todayHours.toLowerCase() === 'closed') return false;
  
  return true;
}

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

function transformStore(store: SanityStore): TransformedStore {
  const fullAddress = store.address
    ? [
        store.address.street,
        store.address.city,
        store.address.state,
        store.address.zipCode,
        store.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;

  const googleMapsUrl = store.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`
    : undefined;

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`
    : undefined;

  const todayKey = getDayOfWeek() as keyof typeof store.operatingHours;
  const todayHours = store.operatingHours?.[todayKey];

  const isOpenNow = checkIsOpenNow(
    store.operatingHours as Record<string, string | undefined>,
    store.isOpen24Hours
  );

  const servicesFormatted = store.services?.map(
    service => SERVICE_LABELS[service] || service
  );

  const imageUrl = store.image?.asset?._ref
    ? buildImageUrl(store.image.asset._ref)
    : undefined;

  const gallery = store.gallery?.map(item => ({
    url: buildImageUrl(item.asset?._ref) || '',
    alt: item.alt,
    caption: item.caption,
  })).filter(item => item.url);

  const growers = store.growers?.map(grower => ({
    id: grower._id,
    name: grower.name,
    slug: grower.slug?.current || '',
    tagline: grower.tagline,
    isVerified: grower.isVerified ?? false,
    imageUrl: grower.image?.asset?._ref ? buildImageUrl(grower.image.asset._ref) : undefined,
    specialties: grower.specialties,
    rating: grower.rating,
    topProducts: grower.topProducts?.map(product => ({
      id: product._id,
      name: product.name,
      slug: product.slug || '',
      price: product.price,
      imageUrl: product.mainImage || undefined,
    })),
  }));

  return {
    id: store._id,
    name: store.name,
    slug: store.slug?.current || '',
    storeType: store.storeType,
    storeTypeLabel: STORE_TYPE_LABELS[store.storeType] || store.storeType,
    description: store.description,
    isActive: store.isActive ?? true,
    isFeatured: store.isFeatured ?? false,
    sortOrder: store.sortOrder ?? 0,
    address: store.address ? { ...store.address, full: fullAddress } : undefined,
    coordinates: store.coordinates,
    directionsUrl: store.directionsUrl,
    googleMapsUrl,
    operatingHours: store.operatingHours
      ? { ...store.operatingHours, today: todayHours }
      : undefined,
    timezone: store.timezone,
    hoursNote: store.hoursNote,
    isOpen24Hours: store.isOpen24Hours,
    isOpenNow,
    phone: store.phone,
    email: store.email,
    whatsapp: store.whatsapp,
    whatsappUrl,
    messenger: store.messenger,
    services: store.services,
    servicesFormatted,
    deliveryZones: store.deliveryZones,
    pickupInstructions: store.pickupInstructions,
    imageUrl,
    imageAlt: store.image?.alt,
    gallery,
    growers,
    createdAt: store._createdAt,
    updatedAt: store._updatedAt,
  };
}

// ============================================================
// GROQ QUERIES
// ============================================================

const STORES_QUERY = `*[_type == "store" && isActive == true] | order(sortOrder asc, name asc) {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  storeType,
  description,
  isActive,
  isFeatured,
  sortOrder,
  address,
  coordinates,
  directionsUrl,
  operatingHours,
  timezone,
  hoursNote,
  isOpen24Hours,
  phone,
  email,
  whatsapp,
  messenger,
  services,
  deliveryZones,
  pickupInstructions,
  image,
  gallery,
  growers[]-> {
    _id,
    name,
    slug,
    tagline,
    isVerified,
    image,
    specialties,
    rating,
    "topProducts": products[0...3]-> {
      _id,
      name,
      "slug": slug.current,
      price,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url)
    }
  }
}`;

const STORE_BY_SLUG_QUERY = `*[_type == "store" && slug.current == $slug][0] {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  storeType,
  description,
  isActive,
  isFeatured,
  sortOrder,
  address,
  coordinates,
  directionsUrl,
  operatingHours,
  timezone,
  hoursNote,
  isOpen24Hours,
  phone,
  email,
  whatsapp,
  messenger,
  services,
  deliveryZones,
  pickupInstructions,
  image,
  gallery,
  growers[]-> {
    _id,
    name,
    slug,
    tagline,
    isVerified,
    image,
    specialties,
    rating,
    "topProducts": products[0...3]-> {
      _id,
      name,
      "slug": slug.current,
      price,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url)
    }
  }
}`;

const FEATURED_STORES_QUERY = `*[_type == "store" && isActive == true && isFeatured == true] | order(sortOrder asc, name asc) {
  _id,
  _createdAt,
  _updatedAt,
  _type,
  name,
  slug,
  storeType,
  description,
  isActive,
  isFeatured,
  sortOrder,
  address,
  coordinates,
  phone,
  image
}`;

// ============================================================
// SERVER-SIDE FETCH FUNCTIONS
// ============================================================

/**
 * Fetch all active stores
 * Use this in Server Components and generateStaticParams
 */
export async function fetchStores(): Promise<TransformedStore[]> {
  try {
    const data = await sanityClient.fetch<SanityStore[]>(STORES_QUERY);
    return (data || []).map(transformStore);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}

/**
 * Fetch a single store by slug
 * Use this in Server Components and generateMetadata
 */
export async function fetchStoreBySlug(slug: string): Promise<TransformedStore | null> {
  try {
    const data = await sanityClient.fetch<SanityStore | null>(
      STORE_BY_SLUG_QUERY,
      { slug }
    );
    return data ? transformStore(data) : null;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

/**
 * Fetch featured stores
 * Use this in Server Components
 */
export async function fetchFeaturedStores(): Promise<TransformedStore[]> {
  try {
    const data = await sanityClient.fetch<SanityStore[]>(FEATURED_STORES_QUERY);
    return (data || []).map(transformStore);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    return [];
  }
}
