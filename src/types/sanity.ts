/**
 * Sanity CMS Type Definitions
 * 
 * TypeScript interfaces for Sanity CMS data structures.
 * These match the schema defined in studio/src/schemaTypes/
 */

/**
 * Sanity Product
 * Matches the product document type in Sanity Studio
 */
export interface SanityProduct {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: {
    current: string;
    _type: 'slug';
  };
  description?: string;
  price: number;
  compareAtPrice?: number; // Sale/original price
  stock: number;
  sku: string;
  weight?: number;
  unit?: string; // 'grams' | 'kilograms' | 'pieces'
  isAvailable: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  promoEndDate?: string;
  mainImage?: string; // URL from Sanity CDN
  images?: string[]; // Array of URLs
  category?: SanityCategory;
  subcategory?: SanityCategory;
  grower?: {
    _id: string;
    name: string;
    slug: string;
    tagline?: string;
    location?: string;
    isVerified?: boolean;
    image?: string;
  };
}

/**
 * Sanity Category
 * Matches the category document type in Sanity Studio
 * Note: slug can be string (from GROQ projection) or object (direct query)
 */
export interface SanityCategory {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  name: string;
  slug: string | {
    current: string;
    _type: 'slug';
  };
  description?: string;
  image?: string; // URL from Sanity CDN
  parent?: {
    _ref: string;
    _type: 'reference';
  };
}

/**
 * Sanity Post (Blog)
 * Matches the post document type in Sanity Studio
 */
export interface SanityPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
    _type: 'slug';
  };
  author?: SanityPerson;
  mainImage?: string;
  categories?: SanityCategory[];
  publishedAt: string;
  body?: any; // Block content (Portable Text)
  excerpt?: string;
}

/**
 * Sanity Person (Author)
 * Matches the person document type in Sanity Studio
 */
export interface SanityPerson {
  _id: string;
  name: string;
  slug: {
    current: string;
    _type: 'slug';
  };
  image?: string;
  bio?: any; // Block content
}

/**
 * Product Filter Options
 * Used for filtering products in hooks
 */
export interface ProductFilters {
  category?: string; // Category slug
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isAvailable?: boolean;
  search?: string;
  tags?: string[]; // Filter by product tags
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest' | 'featured';
}

/**
 * Transformed Product
 * Product data transformed to match existing ProductCard interface
 * This bridges Sanity data structure with frontend components
 */
/**
 * Related Product (for suggestions and complementary)
 */
export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  isPromo: boolean;
  isFeatured?: boolean;
}

/**
 * Freshness Information
 * Tracks harvest window, shelf life, and storage for fresh mushrooms
 */
export interface FreshnessInfo {
  harvestWindow?: string;  // e.g., "24h", "48h", "3-5d"
  shelfLife?: string;      // e.g., "5-7d", "1-2w", "6-12m"
  storageInstructions?: string;  // Storage tips text
  qualityIndicators?: string;  // Comma-separated string (text field in Sanity)
}

/**
 * Preparation Information
 * Cooking guidance for mushroom products
 */
export interface PreparationInfo {
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  cookingTime?: string;  // String like "10-15 minutes"
  preparationTips?: string[];  // Array of tips
  recipeIdeas?: string[];  // Array of recipe suggestions (simple strings in Sanity)
}

/**
 * Recipe Idea (for future use if we expand to objects)
 * Recipe suggestion with optional link
 */
export interface RecipeIdea {
  name: string;
  description?: string;
  url?: string;
}

/**
 * Media Item
 * Image or video for product media gallery
 */
export interface MediaItem {
  _key: string;
  mediaType: 'image' | 'video';
  image?: string;  // URL for image
  imageAlt?: string;  // Alt text for image
  video?: string;  // URL for uploaded video file
  videoUrl?: string;  // YouTube/Vimeo URL
  title?: string;
  caption?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

/**
 * Delivery Options
 * Same-day delivery configuration for Lalamove integration
 */
export interface DeliveryOptions {
  sameDayDeliveryEligible?: boolean;
  deliveryZones?: string[];  // e.g., ["Metro Manila", "Quezon City"]
  deliveryNotes?: string;
  perishable?: boolean;
}

/**
 * Delivery Weight
 * Package weight and dimensions for shipping calculation
 */
export interface DeliveryWeight {
  packageWeight?: number;  // in kg
  packageDimensions?: {
    length?: number;  // in cm
    width?: number;
    height?: number;
  };
}

export interface TransformedProduct {
  id: string;
  name: string;
  slug: string; // string instead of { current: string }
  description?: string;
  price: number;
  compareAtPrice?: number;
  image: string; // mainImage URL
  images?: string[];
  media?: MediaItem[];  // Product media gallery (images + videos)
  category?: string; // category name
  categorySlug?: string;
  stock: number;
  sku: string;
  weight?: number;
  unit?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  promoEndDate?: string;
  
  // E-Commerce Enhancements (Phase 9)
  suggestedProducts?: RelatedProduct[];  // "You May Also Like"
  complementaryProducts?: RelatedProduct[];  // "Frequently Bought Together"
  productTags?: string[];  // Smart search tags
  
  // Enhanced Product Info (Phase 10 - Rich CMS Data)
  freshnessInfo?: FreshnessInfo;  // Harvest window, shelf life, storage
  preparationInfo?: PreparationInfo;  // Cooking difficulty, time, tips, recipes
  deliveryOptions?: DeliveryOptions;  // Same-day delivery, zones, perishable
  deliveryWeight?: DeliveryWeight;  // Package weight and dimensions
  nutritionalHighlights?: string[];  // Nutrition badges
  searchKeywords?: string[];  // SEO keywords
  
  // Grower Information
  grower?: {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    location?: string;
    isVerified?: boolean;
    image?: string;
  };
}

/**
 * Transform Sanity Product to Transformed Product
 * Converts Sanity data structure to match existing component interfaces
 */
export function transformSanityProduct(product: SanityProduct): TransformedProduct {
  // Handle image URL - Sanity returns full CDN URLs with image.asset->url
  const imageUrl = product.mainImage && product.mainImage !== 'null' 
    ? product.mainImage 
    : '/mushroom-placeholder.png';
  
  const imageUrls = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(img => img && img !== 'null')
    : [imageUrl];

  // Handle category slug - might be string or object depending on GROQ projection
  const categorySlug = product.category?.slug 
    ? (typeof product.category.slug === 'string' 
        ? product.category.slug 
        : product.category.slug.current)
    : undefined;

  // Transform suggested products (filter out null references from deleted products)
  const suggestedProducts: RelatedProduct[] | undefined = (product as any).suggestedProducts
    ?.filter((p: any) => p !== null && p !== undefined && p._id)
    ?.map((p: any) => ({
      id: p._id,
      name: p.name || 'Unknown Product',
      slug: typeof p.slug === 'string' ? p.slug : p.slug?.current || '',
      price: p.price || 0,
      image: p.image || '/mushroom-placeholder.png',
      isPromo: p.isPromo || false,
      isFeatured: p.isFeatured || false,
    }));

  // Transform complementary products (filter out null references from deleted products)
  const complementaryProducts: RelatedProduct[] | undefined = (product as any).complementaryProducts
    ?.filter((p: any) => p !== null && p !== undefined && p._id)
    ?.map((p: any) => ({
      id: p._id,
      name: p.name || 'Unknown Product',
      slug: typeof p.slug === 'string' ? p.slug : p.slug?.current || '',
      price: p.price || 0,
      image: p.image || '/mushroom-placeholder.png',
      isPromo: p.isPromo || false,
    }));

  // Transform media gallery (images + videos)
  const mediaItems: MediaItem[] | undefined = (product as any).media
    ?.filter((m: any) => m !== null && m !== undefined)
    ?.map((m: any) => ({
      _key: m._key || '',
      mediaType: m.mediaType || 'image',
      image: m.image || undefined,
      imageAlt: m.imageAlt || m.image?.alt || undefined,
      video: m.video || undefined,
      videoUrl: m.videoUrl || undefined,
      title: m.title || undefined,
      caption: m.caption || undefined,
      isPrimary: m.isPrimary || false,
      sortOrder: m.sortOrder || 0,
    }))
    ?.sort((a: MediaItem, b: MediaItem) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return {
    id: product._id,
    name: product.name,
    slug: typeof product.slug === 'string' ? product.slug : product.slug.current,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: imageUrl,
    images: imageUrls,
    media: mediaItems?.length ? mediaItems : undefined,
    category: product.category?.name,
    categorySlug: categorySlug,
    stock: product.stock,
    sku: product.sku,
    weight: product.weight,
    unit: product.unit,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    isPromo: product.isPromo,
    promoEndDate: product.promoEndDate,
    
    // E-Commerce Enhancements
    suggestedProducts: suggestedProducts?.length ? suggestedProducts : undefined,
    complementaryProducts: complementaryProducts?.length ? complementaryProducts : undefined,
    productTags: (product as any).productTags,
    
    // Enhanced Product Info (Rich CMS Data)
    freshnessInfo: (product as any).freshnessInfo || undefined,
    preparationInfo: (product as any).preparationInfo || undefined,
    deliveryOptions: (product as any).deliveryOptions || undefined,
    deliveryWeight: (product as any).deliveryWeight || undefined,
    nutritionalHighlights: (product as any).nutritionalHighlights || undefined,
    searchKeywords: (product as any).searchKeywords || undefined,
    
    // Grower Information
    grower: product.grower ? {
      id: product.grower._id,
      name: product.grower.name,
      slug: product.grower.slug,
      tagline: product.grower.tagline,
      location: product.grower.location,
      isVerified: product.grower.isVerified,
      image: product.grower.image,
    } : undefined,
  };
}

/**
 * Transform Sanity Category
 * Converts Sanity category to simpler format
 */
export interface TransformedCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export function transformSanityCategory(category: SanityCategory): TransformedCategory {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug.current,
    description: category.description,
    image: category.image,
  };
}

/**
 * Sanity Grower
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
  location?: string;
  region?: string;
  image?: string; // Profile image URL
  coverImage?: string; // Cover/banner image URL
  farmImages?: string[]; // Array of farm images
  specialties?: string[]; // Types of mushrooms grown
  certifications?: string[]; // Certifications
  contactEmail?: string;
  contactPhone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
  rating?: number;
  totalReviews?: number;
  joinedDate?: string;
}

/**
 * Transformed Grower
 * Simplified structure for frontend consumption
 */
export interface TransformedGrower {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  location?: string;
  region?: string;
  image?: string;
  coverImage?: string;
  farmImages?: string[];
  specialties?: string[];
  certifications?: string[];
  contactEmail?: string;
  contactPhone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
  rating?: number;
  totalReviews?: number;
  productCount?: number;
  joinedDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sanity Site Settings
 * Singleton document for site-wide settings
 */
export interface SanitySiteSettings {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _type: 'siteSettings';
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
  };
  features?: {
    enableBlog?: boolean;
    enableShop?: boolean;
    enableGrowerProfiles?: boolean;
    enableReviews?: boolean;
    enableWishlist?: boolean;
  };
}

/**
 * Transformed Site Settings
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
    full?: string;
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
    formatted?: string;
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
