"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

/**
 * Sanity Store Interface
 * Matches the store document type in Sanity Studio (Phase 6)
 */
export interface SanityStore {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _type: 'store';
  
  // Basic Info
  name: string;
  slug: { current: string };
  storeType: 'main' | 'pickup' | 'partner' | 'distribution';
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  
  // Location
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
  
  // Operating Hours
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
  
  // Contact
  phone?: string;
  email?: string;
  whatsapp?: string;
  messenger?: string;
  
  // Services
  services?: string[];
  deliveryZones?: string[];
  pickupInstructions?: string;
  
  // Media
  image?: {
    asset: { _ref: string };
    alt?: string;
  };
  gallery?: Array<{
    asset: { _ref: string };
    alt?: string;
    caption?: string;
  }>;
}

/**
 * Transformed Store Interface
 * Simplified structure for frontend consumption
 */
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
  
  // Location
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    landmark?: string;
    full?: string; // Formatted full address
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  directionsUrl?: string;
  googleMapsUrl?: string; // Generated from coordinates
  
  // Operating Hours
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    today?: string; // Current day's hours
  };
  timezone?: string;
  hoursNote?: string;
  isOpen24Hours?: boolean;
  isOpenNow?: boolean; // Computed based on current time
  
  // Contact
  phone?: string;
  email?: string;
  whatsapp?: string;
  whatsappUrl?: string; // wa.me link
  messenger?: string;
  
  // Services
  services?: string[];
  servicesFormatted?: string[]; // Human-readable service names
  deliveryZones?: string[];
  pickupInstructions?: string;
  
  // Media
  imageUrl?: string;
  imageAlt?: string;
  gallery?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Service labels for display
 */
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

/**
 * Store type labels for display
 */
const STORE_TYPE_LABELS: Record<string, string> = {
  'main': 'Main Store',
  'pickup': 'Pickup Point',
  'partner': 'Partner Store',
  'distribution': 'Distribution Center',
};

/**
 * Get current day of week
 */
function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

/**
 * Check if store is open now (simplified check)
 */
function checkIsOpenNow(hours?: Record<string, string | undefined>, isOpen24Hours?: boolean): boolean {
  if (isOpen24Hours) return true;
  if (!hours) return false;
  
  const today = getDayOfWeek();
  const todayHours = hours[today];
  if (!todayHours || todayHours.toLowerCase() === 'closed') return false;
  
  // Simple check - if hours are defined for today, consider it open
  // A more sophisticated check would parse the time ranges
  return true;
}

/**
 * Build Sanity image URL from reference
 */
function buildImageUrl(ref?: string): string | undefined {
  if (!ref) return undefined;
  
  // Extract project ID and dataset from environment
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  
  // Parse the image reference
  // Format: image-{id}-{width}x{height}-{format}
  const parts = ref.replace('image-', '').split('-');
  if (parts.length < 3) return undefined;
  
  const id = parts[0];
  const dimensions = parts[1];
  const format = parts[2];
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
}

/**
 * Transform Sanity Store to Frontend Format
 */
function transformStore(store: SanityStore): TransformedStore {
  // Format full address
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

  // Build Google Maps URL from coordinates
  const googleMapsUrl = store.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`
    : undefined;

  // Build WhatsApp URL
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`
    : undefined;

  // Get today's hours
  const todayKey = getDayOfWeek() as keyof typeof store.operatingHours;
  const todayHours = store.operatingHours?.[todayKey];

  // Check if open now
  const isOpenNow = checkIsOpenNow(
    store.operatingHours as Record<string, string | undefined>,
    store.isOpen24Hours
  );

  // Format services with labels
  const servicesFormatted = store.services?.map(
    service => SERVICE_LABELS[service] || service
  );

  // Build image URL
  const imageUrl = store.image?.asset?._ref
    ? buildImageUrl(store.image.asset._ref)
    : undefined;

  // Build gallery URLs
  const gallery = store.gallery?.map(item => ({
    url: buildImageUrl(item.asset?._ref) || '',
    alt: item.alt,
    caption: item.caption,
  })).filter(item => item.url);

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
    
    address: store.address
      ? { ...store.address, full: fullAddress }
      : undefined,
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
    
    createdAt: store._createdAt,
    updatedAt: store._updatedAt,
  };
}

// GROQ Queries
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
  gallery
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
  gallery
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

const STORES_BY_TYPE_QUERY = `*[_type == "store" && isActive == true && storeType == $storeType] | order(sortOrder asc, name asc) {
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

/**
 * Hook: useSanityStores
 * Fetch all active stores from Sanity
 */
export function useSanityStores() {
  const [stores, setStores] = useState<TransformedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await sanityClient.fetch<SanityStore[]>(STORES_QUERY);
      const transformed = (data || []).map(transformStore);
      setStores(transformed);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stores'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    isLoading,
    error,
    refetch: fetchStores,
    // Filtered lists
    mainStores: stores.filter(s => s.storeType === 'main'),
    pickupPoints: stores.filter(s => s.storeType === 'pickup'),
    partnerStores: stores.filter(s => s.storeType === 'partner'),
    featuredStores: stores.filter(s => s.isFeatured),
  };
}

/**
 * Hook: useSanityStore
 * Fetch a single store by slug
 */
export function useSanityStore(slug: string) {
  const [store, setStore] = useState<TransformedStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStore = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await sanityClient.fetch<SanityStore | null>(
        STORE_BY_SLUG_QUERY,
        { slug }
      );
      
      if (data) {
        setStore(transformStore(data));
      } else {
        setStore(null);
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch store'));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  return {
    store,
    isLoading,
    error,
    refetch: fetchStore,
  };
}

/**
 * Hook: useFeaturedStores
 * Fetch only featured stores
 */
export function useFeaturedStores() {
  const [stores, setStores] = useState<TransformedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await sanityClient.fetch<SanityStore[]>(FEATURED_STORES_QUERY);
      const transformed = (data || []).map(transformStore);
      setStores(transformed);
    } catch (err) {
      console.error('Error fetching featured stores:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch featured stores'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, isLoading, error, refetch: fetchStores };
}

/**
 * Hook: useStoresByType
 * Fetch stores by type (main, pickup, partner, distribution)
 */
export function useStoresByType(storeType: 'main' | 'pickup' | 'partner' | 'distribution') {
  const [stores, setStores] = useState<TransformedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await sanityClient.fetch<SanityStore[]>(
        STORES_BY_TYPE_QUERY,
        { storeType }
      );
      const transformed = (data || []).map(transformStore);
      setStores(transformed);
    } catch (err) {
      console.error('Error fetching stores by type:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stores'));
    } finally {
      setIsLoading(false);
    }
  }, [storeType]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, isLoading, error, refetch: fetchStores };
}

/**
 * Server-side function: fetchStores
 * For use in Server Components
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
 * Server-side function: fetchStoreBySlug
 * For use in Server Components
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
 * Server-side function: fetchFeaturedStores
 * For use in Server Components
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
