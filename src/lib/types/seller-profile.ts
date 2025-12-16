/**
 * Seller Profile Types
 * Type definitions for seller profile configuration, store customization, and branding
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum StoreStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum DeliveryMethod {
  HOME_DELIVERY = 'HOME_DELIVERY',
  PICKUP = 'PICKUP',
  BOTH = 'BOTH',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// ============================================================================
// CORE TYPES
// ============================================================================

export interface BusinessHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string; // Format: "HH:mm" (24-hour format)
  closeTime: string; // Format: "HH:mm"
  isOvernight?: boolean; // True if closeTime is next day
}

export interface DeliveryArea {
  id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string; // e.g., "30-45 minutes"
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
  messenger?: string;
  customLinks?: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
}

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export interface StoreImages {
  logo?: {
    url: string;
    alt: string;
    width: number;
    height: number;
    sanityRef?: string; // Sanity asset reference
  };
  banner?: {
    url: string;
    alt: string;
    width: number;
    height: number;
    sanityRef?: string;
  };
  gallery?: Array<{
    url: string;
    alt: string;
    caption?: string;
    width: number;
    height: number;
    sanityRef?: string;
  }>;
}

export interface SellerProfile {
  id: string;
  userId: string;
  
  // Basic Information
  storeName: string;
  tagline?: string;
  description: string;
  status: StoreStatus;
  
  // Branding
  images: StoreImages;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Contact & Location
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Business Hours
  businessHours: BusinessHours[];
  timezone: string; // e.g., "Asia/Manila"
  
  // Delivery Settings
  deliveryMethod: DeliveryMethod;
  deliveryAreas: DeliveryArea[];
  pickupInstructions?: string;
  
  // Social Media
  socialMedia: SocialMediaLinks;
  
  // SEO
  seo: SEOMetadata;
  slug: string; // URL-friendly store name
  
  // Statistics (Read-only)
  stats?: {
    totalProducts: number;
    totalOrders: number;
    averageRating: number;
    totalReviews: number;
    responseTime: string; // e.g., "< 1 hour"
    joinedDate: Date;
  };
  
  // Metadata
  isVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface BasicInfoFormData {
  storeName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AddressFormData {
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessHoursFormData {
  hours: BusinessHours[];
  timezone: string;
}

export interface DeliverySettingsFormData {
  deliveryMethod: DeliveryMethod;
  deliveryAreas: DeliveryArea[];
  pickupInstructions?: string;
}

export interface SocialMediaFormData {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
  messenger?: string;
}

export interface SEOFormData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

// ============================================================================
// IMAGE UPLOAD TYPES
// ============================================================================

export interface ImageCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageUploadConfig {
  type: 'logo' | 'banner' | 'gallery';
  maxSizeMB: number;
  acceptedFormats: string[];
  aspectRatio?: number;
  minDimensions?: {
    width: number;
    height: number;
  };
  maxDimensions?: {
    width: number;
    height: number;
  };
}

export interface OptimizedImage {
  original: File;
  optimized: Blob;
  preview: string;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
  format: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const IMAGE_UPLOAD_CONFIGS: Record<string, ImageUploadConfig> = {
  logo: {
    type: 'logo',
    maxSizeMB: 2,
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    aspectRatio: 1, // 1:1 square
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 1000, height: 1000 },
  },
  banner: {
    type: 'banner',
    maxSizeMB: 5,
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    aspectRatio: 21 / 9, // Ultra-wide banner
    minDimensions: { width: 1200, height: 400 },
    maxDimensions: { width: 3000, height: 1200 },
  },
  gallery: {
    type: 'gallery',
    maxSizeMB: 3,
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    aspectRatio: 4 / 3, // Standard photo
    minDimensions: { width: 800, height: 600 },
    maxDimensions: { width: 2000, height: 1500 },
  },
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: DayOfWeek.MONDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.TUESDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.WEDNESDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.THURSDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.FRIDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.SATURDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: DayOfWeek.SUNDAY, isOpen: false, openTime: '08:00', closeTime: '17:00' },
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday',
  [DayOfWeek.SUNDAY]: 'Sunday',
};

export const PHILIPPINES_PROVINCES = [
  'Metro Manila',
  'Cavite',
  'Laguna',
  'Batangas',
  'Rizal',
  'Quezon',
  'Bulacan',
  'Pampanga',
  'Bataan',
  'Zambales',
  'Tarlac',
  'Nueva Ecija',
  'Aurora',
  'Pangasinan',
  'La Union',
  'Ilocos Norte',
  'Ilocos Sur',
  'Abra',
  'Benguet',
  'Mountain Province',
  'Ifugao',
  'Kalinga',
  'Apayao',
  'Cagayan',
  'Isabela',
  'Nueva Vizcaya',
  'Quirino',
  // Add more as needed
] as const;

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  [DeliveryMethod.HOME_DELIVERY]: 'Home Delivery Only',
  [DeliveryMethod.PICKUP]: 'Pickup Only',
  [DeliveryMethod.BOTH]: 'Both Home Delivery & Pickup',
};

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  [StoreStatus.DRAFT]: 'Draft',
  [StoreStatus.ACTIVE]: 'Active',
  [StoreStatus.INACTIVE]: 'Inactive',
  [StoreStatus.SUSPENDED]: 'Suspended',
};

export const STORE_STATUS_COLORS: Record<StoreStatus, string> = {
  [StoreStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [StoreStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [StoreStatus.INACTIVE]: 'bg-yellow-100 text-yellow-800',
  [StoreStatus.SUSPENDED]: 'bg-red-100 text-red-800',
};
