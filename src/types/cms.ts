// Complete TypeScript definitions for CMS Models
// Import this file in your Admin Dashboard and main project

// Base CMS Types
export interface CMSBaseModel {
  id: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Hero Section Types
export interface HeroSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  backgroundImages: string[];
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
}

export interface ButtonConfig {
  text: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
}

// Feature Section Types
export interface FeatureSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

export interface FeatureItem {
  id: string;
  icon: string; // Lucide icon name
  headline: string;
  subheadline: string;
  displayOrder: number;
  isActive: boolean;
}

// Team Types
export interface TeamMember extends CMSBaseModel {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github';
  url: string;
  displayOrder: number;
  isActive: boolean;
}

// About Page Types
export interface AboutHeroSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export interface ChallengesSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  challenges: string[];
}

export interface SolutionsSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  solutions: SolutionItem[];
}

export interface SolutionItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  displayOrder: number;
}

export interface VisionSection extends CMSBaseModel {
  title: string;
  content: string[];
  callToAction: string;
}

export interface MentorSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  mentor: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
}

// FAQ Types
export interface FAQCategory extends CMSBaseModel {
  name: string;
  description?: string;
}

export interface FAQItem extends CMSBaseModel {
  categoryId: string;
  question: string;
  answer: string;
}

// Contact Types
export interface ContactInfo extends CMSBaseModel {
  type: 'phone' | 'email' | 'address' | 'whatsapp' | 'telegram';
  title: string;
  value: string;
  description?: string;
}

export interface BusinessHours extends CMSBaseModel {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string; // Format: "08:00"
  closeTime: string; // Format: "18:00"
  isClosed: boolean;
  notes?: string;
}

// Policy Types
export interface PolicySection extends CMSBaseModel {
  title: string;
  content: string; // Rich text content
}

export interface PrivacyPolicySection extends PolicySection {}
export interface TermsSection extends PolicySection {}
export interface ShippingInfo extends PolicySection {
  section: 'timeline' | 'fees' | 'packaging' | 'tracking' | 'instructions' | 'failed_delivery' | 'holidays';
  data?: any; // For structured data like pricing tables
}
export interface ReturnsPolicy extends PolicySection {}

// Blog Types
export interface BlogCategory extends CMSBaseModel {
  name: string;
  slug: string;
  description?: string;
}

export interface BlogPost extends CMSBaseModel {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich text content
  featuredImage?: string;
  author: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number; // in minutes
}

// Site Settings Types
export interface SiteSettings extends CMSBaseModel {
  siteName: string;
  tagline: string;
  description: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  address: Address;
  businessHours: BusinessHours[];
  socialLinks: SocialLink[];
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface SEOSettings extends CMSBaseModel {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  twitterCard: 'summary' | 'summary_large_image';
  structuredData?: string; // JSON-LD
  robots: string;
  canonicalUrl?: string;
}

export interface EmailSettings extends CMSBaseModel {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  isActive: boolean;
}

// E-commerce Types
export interface ProductCategory extends CMSBaseModel {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string; // For subcategories
  metaTitle?: string;
  metaDescription?: string;
}

export interface GrowerProfile extends CMSBaseModel {
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  socialLinks: SocialLink[];
  businessHours: BusinessHours[];
  specialties: string[]; // Types of mushrooms they grow
  certifications: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

// UI Components Types
export interface Banner extends CMSBaseModel {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  position: 'top' | 'bottom' | 'inline';
  isDismissible: boolean;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterSection extends CMSBaseModel {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  displayOrder: number;
}

// Catalog Types
export interface CatalogFilters extends CMSBaseModel {
  categories: ProductCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  growers: GrowerProfile[];
  sortOptions: SortOption[];
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
}

export interface ProductShowcase extends CMSBaseModel {
  title: string;
  products: string[]; // Product IDs
  displayType: 'featured' | 'bestseller' | 'new' | 'sale' | 'seasonal';
  maxItems: number;
}

// API Response Types
export interface CMSApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  lastModified: string;
  version: number;
}

export interface PaginatedCMSResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
  message?: string;
}

// Content Types Union
export type CMSContentType =
  | HeroSection
  | FeatureSection
  | TeamMember
  | AboutHeroSection
  | ChallengesSection
  | SolutionsSection
  | VisionSection
  | MentorSection
  | FAQCategory
  | FAQItem
  | ContactInfo
  | BusinessHours
  | PrivacyPolicySection
  | TermsSection
  | ShippingInfo
  | ReturnsPolicy
  | BlogCategory
  | BlogPost
  | SiteSettings
  | SEOSettings
  | EmailSettings
  | ProductCategory
  | GrowerProfile
  | Banner
  | FooterSection
  | CatalogFilters
  | ProductShowcase;

// Filter and Search Types
export interface CMSFilterOptions {
  type?: string;
  isActive?: boolean;
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CMSSearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  url: string;
  lastModified: string;
}

// Form Types for Admin
export interface CreateHeroForm {
  title: string;
  subtitle: string;
  backgroundImages: string[];
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateFeatureForm {
  title: string;
  subtitle: string;
  features: Omit<FeatureItem, 'id' | 'displayOrder' | 'isActive'>[];
  isActive: boolean;
  displayOrder: number;
}

export interface CreateFAQForm {
  categoryId: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateContactForm {
  type: ContactInfo['type'];
  title: string;
  value: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateBlogPostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: string;
  categoryId: string;
  tags: string[];
  status: BlogPost['status'];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
}

// Export all types
export * from './api'; // Import existing API types
