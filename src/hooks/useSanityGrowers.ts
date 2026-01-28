"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient, listenSafe } from '@/lib/sanity/client';

/**
 * Sanity Grower Interface
 * Matches the grower document type in Sanity Studio
 */
export interface SanityGrower {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: {
    current: string;
    _type: 'slug';
  };
  bio?: string;
  tagline?: string;
  description?: string;
  location?: string;
  region?: string;
  image?: string; // Profile image URL (from logo field)
  coverImage?: string; // Cover/banner image URL
  farmImages?: string[]; // Array of farm images
  specialties?: string[]; // Types of mushrooms grown
  certifications?: string[]; // Certifications
  contactEmail?: string;
  contactPhone?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  rating?: number;
  totalReviews?: number;
  joinedDate?: string;
  
  // Social Links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  
  // Linked stores (from availableAtStores field)
  availableAtStores?: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    storeType: 'main' | 'pickup' | 'partner' | 'distribution';
    address?: {
      city?: string;
      state?: string;
    };
    image?: {
      asset: { _ref: string };
    };
  }>;
}

/**
 * Transformed Grower Interface
 * Simplified structure for frontend consumption
 */
export interface TransformedGrower {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  tagline?: string;
  description?: string;
  location?: string;
  region?: string;
  image?: string;
  logo?: string; // Alias for image
  coverImage?: string;
  farmImages?: string[];
  specialties?: string[];
  certifications?: string[];
  contactEmail?: string;
  contactPhone?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  rating?: number;
  totalReviews?: number;
  productCount?: number;
  joinedDate?: string;
  
  // Social Media Links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  
  // Linked stores where grower's products are available
  availableAtStores?: Array<{
    id: string;
    name: string;
    slug: string;
    storeType: 'main' | 'pickup' | 'partner' | 'distribution';
    city?: string;
    state?: string;
    imageUrl?: string;
  }>;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Grower Filter Options
 */
export interface GrowerFilters {
  region?: string;
  specialty?: string;
  isActive?: boolean;
  limit?: number;
}

/**
 * Transform Sanity Grower to Frontend Format
 */
function transformGrower(grower: SanityGrower & { productCount?: number }): TransformedGrower {
  return {
    id: grower._id,
    name: grower.name,
    slug: grower.slug.current,
    bio: grower.bio,
    tagline: grower.tagline,
    description: grower.description,
    location: grower.location,
    region: grower.region,
    image: grower.image || '/images/default-grower.jpg',
    logo: grower.image || '/images/default-grower.jpg', // Alias for GrowerCard
    coverImage: grower.coverImage,
    farmImages: grower.farmImages || [],
    specialties: grower.specialties || [],
    certifications: grower.certifications || [],
    contactEmail: grower.contactEmail || grower.email,
    contactPhone: grower.contactPhone || grower.phone,
    phone: grower.phone,
    email: grower.email,
    operatingHours: grower.operatingHours,
    coordinates: grower.coordinates,
    isActive: grower.isActive !== false, // Default true
    isVerified: grower.isVerified || false,
    isFeatured: grower.isFeatured || false,
    rating: grower.rating || 0,
    totalReviews: grower.totalReviews || 0,
    productCount: grower.productCount || 0,
    joinedDate: grower.joinedDate,
    // Transform linked stores
    availableAtStores: grower.availableAtStores?.map(store => ({
      id: store._id,
      name: store.name,
      slug: store.slug?.current || '',
      storeType: store.storeType,
      city: store.address?.city,
      state: store.address?.state,
      imageUrl: store.image?.asset?._ref 
        ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr'}/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}/${store.image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
        : undefined,
    })),
    // Social Media Links
    socialLinks: grower.socialLinks ? {
      facebook: grower.socialLinks.facebook,
      instagram: grower.socialLinks.instagram,
      tiktok: grower.socialLinks.tiktok,
      website: grower.socialLinks.website,
    } : undefined,
    createdAt: grower._createdAt,
    updatedAt: grower._updatedAt,
  };
}

/**
 * Hook 1: useSanityGrowers
 * Fetches all growers with REAL-TIME UPDATES
 * 
 * @param filters - Optional filters for growers
 * @returns { growers, loading, error, refetch }
 * 
 * Updates instantly when:
 * - New grower is created
 * - Grower information is edited
 * - Grower profile image is changed
 * - Grower is deleted
 * - Grower status changes (active/inactive)
 * 
 * @example
 * ```tsx
 * const { growers, loading } = useSanityGrowers({ limit: 20, isActive: true });
 * ```
 */
export function useSanityGrowers(filters?: GrowerFilters) {
  const [growers, setGrowers] = useState<TransformedGrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrowers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build GROQ query with filters
      let query = `*[_type == "grower" && !(_id in path("drafts.**"))`;
      
      if (filters?.region) {
        query += ` && region == "${filters.region}"`;
      }
      
      if (filters?.specialty) {
        query += ` && "${filters.specialty}" in specialties[]`;
      }
      
      if (filters?.isActive !== undefined) {
        query += ` && isActive == ${filters.isActive}`;
      }
      
      query += `] | order(name asc)`;
      
      if (filters?.limit) {
        query += ` [0...${filters.limit}]`;
      }

      query += ` {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        bio,
        tagline,
        description,
        location,
        region,
        "image": logo.asset->url,
        "coverImage": coverImage.asset->url,
        "farmImages": farmImages[].asset->url,
        specialties,
        certifications,
        contactEmail,
        contactPhone,
        phone,
        email,
        operatingHours,
        coordinates,
        isActive,
        isVerified,
        isFeatured,
        rating,
        totalReviews,
        joinedDate,
        socialLinks,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))]),
        // Fetch linked stores from both fields (suppliesTo is canonical, availableAtStores is legacy)
        "availableAtStores": coalesce(suppliesTo, availableAtStores)[]-> {
          _id,
          name,
          slug,
          storeType,
          address { city, state },
          "image": mainImage
        }
      }`;

      console.log('📦 Fetching growers from Sanity...');
      const data = await sanityClient.fetch<Array<SanityGrower & { productCount: number }>>(query);
      
      const transformed = data.map(transformGrower);
      setGrowers(transformed);
      console.log('✅ Growers fetched:', transformed.length);
    } catch (err) {
      console.error('❌ Error fetching growers:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters?.region, filters?.specialty, filters?.isActive, filters?.limit]);

  useEffect(() => {
    fetchGrowers();

    // Set up REAL-TIME subscription
    console.debug('🔌 Setting up growers real-time subscription');
    
    let query = `*[_type == "grower" && !(_id in path("drafts.**"))`;
    
    if (filters?.region) {
      query += ` && region == "${filters.region}"`;
    }
    
    if (filters?.specialty) {
      query += ` && "${filters.specialty}" in specialties[]`;
    }
    
    if (filters?.isActive !== undefined) {
      query += ` && isActive == ${filters.isActive}`;
    }
    
    query += `]`;
    
    if (filters?.limit) {
      query += ` [0...${filters.limit}]`;
    }

    const subscription = listenSafe(query)
      .subscribe((update: any) => {
        // Only log at debug level to avoid noisy console output
        console.debug('📡 Growers mutation event received:', update?.type);
        
        if (update?.type === 'mutation') {
          // Re-fetch to get fresh data with product counts
          fetchGrowers();
          console.debug('🔄 Growers updated in real-time!');
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Growers subscription cleaned up');
    };
  }, [fetchGrowers, filters?.region, filters?.specialty, filters?.isActive, filters?.limit]);

  return { growers, loading, error, refetch: fetchGrowers };
}

/**
 * Hook 2: useSanityGrower
 * Fetches a single grower by slug with REAL-TIME UPDATES
 * 
 * @param slug - Grower slug
 * @returns { grower, loading, error, refetch }
 * 
 * Updates instantly when:
 * - Grower details are edited
 * - Grower images are changed
 * - Grower is deleted (returns null)
 * - Product count changes
 * - Certifications are added/removed
 * 
 * @example
 * ```tsx
 * const { grower, loading } = useSanityGrower('manila-urban-farm');
 * ```
 */
export function useSanityGrower(slug: string) {
  const [grower, setGrower] = useState<TransformedGrower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrower = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = `*[_type == "grower" && slug.current == $slug][0] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        bio,
        tagline,
        description,
        location,
        region,
        "image": logo.asset->url,
        "coverImage": coverImage.asset->url,
        "farmImages": farmImages[].asset->url,
        specialties,
        certifications,
        contactEmail,
        contactPhone,
        phone,
        email,
        operatingHours,
        coordinates,
        isActive,
        isVerified,
        isFeatured,
        rating,
        totalReviews,
        joinedDate,
        socialLinks,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))]),
        // Fetch linked stores from both fields (suppliesTo is canonical, availableAtStores is legacy)
        "availableAtStores": coalesce(suppliesTo, availableAtStores)[]-> {
          _id,
          name,
          slug,
          storeType,
          address { city, state },
          "image": mainImage
        }
      }`;

      console.log(`📦 Fetching grower "${slug}" from Sanity...`);
      const data = await sanityClient.fetch<SanityGrower & { productCount: number }>(query, { slug });
      
      if (data) {
        setGrower(transformGrower(data));
        console.log(`✅ Grower "${slug}" fetched`);
      } else {
        setGrower(null);
        console.log(`⚠️ Grower "${slug}" not found`);
      }
    } catch (err) {
      console.error(`❌ Error fetching grower "${slug}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    fetchGrower();

    // Set up REAL-TIME subscription for this specific grower
    console.log(`🔌 Setting up real-time subscription for grower "${slug}"`);
    
    const query = `*[_type == "grower" && slug.current == $slug][0]`;

    const subscription = listenSafe(query, { slug })
      .subscribe((update: any) => {
        console.debug(`📡 Grower "${slug}" mutation event received:`, update?.type);
        
        if (update?.type === 'mutation') {
          if (update.result) {
            // Grower updated - re-fetch to get fresh data
            fetchGrower();
            console.debug(`🔄 Grower "${slug}" updated in real-time!`);
          } else {
            // Grower deleted
            setGrower(null);
            console.debug(`🗑️ Grower "${slug}" deleted in real-time!`);
          }
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log(`🧹 Grower "${slug}" subscription cleaned up`);
    };
  }, [slug, fetchGrower]);

  return { grower, loading, error, refetch: fetchGrower };
}

/**
 * Hook 3: useSanityGrowerProducts
 * Fetches products by grower with REAL-TIME UPDATES
 * 
 * @param growerId - Grower ID to filter by
 * @param limit - Optional limit on number of products
 * @returns { products, loading, error, refetch }
 * 
 * Updates instantly when:
 * - Products are added by grower
 * - Products are removed
 * - Product details change
 * - Product stock status changes
 * 
 * @example
 * ```tsx
 * const { products, loading } = useSanityGrowerProducts('grower_001', 12);
 * ```
 */
/**
 * Product by Grower Interface
 */
export interface GrowerProduct {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: { current: string };
  description?: string;
  price: number;
  mainImage?: string;
  images?: string[];
  category?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  inStock: boolean;
  featured: boolean;
  unit?: string;
  weight?: string;
  nutrition?: Record<string, unknown>;
}

export function useSanityGrowerProducts(growerId: string, limit?: number) {
  const [products, setProducts] = useState<GrowerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!growerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = `*[_type == "product" && references($growerId) && !(_id in path("drafts.**"))] | order(name asc)`;
      
      if (limit) {
        query += ` [0...${limit}]`;
      }

      query += ` {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        price,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        "images": images[].asset->url,
        category->{
          _id,
          name,
          slug
        },
        inStock,
        featured,
        unit,
        weight,
        nutrition
      }`;

      console.log(`📦 Fetching products for grower "${growerId}"...`);
      const data = await sanityClient.fetch<GrowerProduct[]>(query, { growerId });
      
      setProducts(data || []);
      console.log(`✅ Products fetched for grower "${growerId}":`, data?.length || 0);
    } catch (err) {
      console.error(`❌ Error fetching products for grower "${growerId}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [growerId, limit]);

  useEffect(() => {
    if (!growerId) return;

    fetchProducts();

    // Set up REAL-TIME subscription for products by this grower
    console.log(`🔌 Setting up real-time subscription for products by grower "${growerId}"`);
    
    let query = `*[_type == "product" && references($growerId) && !(_id in path("drafts.**"))]`;
    
    if (limit) {
      query += ` [0...${limit}]`;
    }

    const subscription = listenSafe(query, { growerId })
      .subscribe((update) => {
        console.log(`📡 Products by grower "${growerId}" mutation event received:`, update.type);
        
        if (update.type === 'mutation') {
          // Re-fetch products to get fresh data
          fetchProducts();
          console.log(`🔄 Products by grower "${growerId}" updated in real-time!`);
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log(`🧹 Products by grower "${growerId}" subscription cleaned up`);
    };
  }, [growerId, limit, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

/**
 * Hook 4: useSanityActiveGrowers
 * Fetches only active growers with REAL-TIME UPDATES
 * Convenience hook for displaying active growers only
 * 
 * @param limit - Optional limit on results
 * @returns { growers, loading, error, refetch }
 * 
 * @example
 * ```tsx
 * const { growers, loading } = useSanityActiveGrowers(10);
 * ```
 */
export function useSanityActiveGrowers(limit?: number) {
  return useSanityGrowers({ isActive: true, limit });
}

/**
 * Hook 5: useSanityGrowersByRegion
 * Fetches growers filtered by region with REAL-TIME UPDATES
 * 
 * @param region - Region to filter by
 * @param limit - Optional limit on results
 * @returns { growers, loading, error, refetch }
 * 
 * @example
 * ```tsx
 * const { growers, loading } = useSanityGrowersByRegion('Metro Manila', 20);
 * ```
 */
export function useSanityGrowersByRegion(region: string, limit?: number) {
  return useSanityGrowers({ region, limit });
}
