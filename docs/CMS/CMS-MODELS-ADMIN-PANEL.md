# 📋 Complete CMS Models for MASH E-commerce Admin Panel

This document provides all the CMS models needed for your Admin Dashboard to manage dynamic content across the entire MASH platform.

## 🏗️ Core CMS Models

### **1. Hero Section Model**
```typescript
interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImages: string[]; // Array of image URLs
  primaryButton: {
    text: string;
    url: string;
    variant: 'primary' | 'secondary';
  };
  secondaryButton: {
    text: string;
    url: string;
    variant: 'outline' | 'ghost';
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### **2. Feature Section Model**
```typescript
interface FeatureSection {
  id: string;
  title: string;
  subtitle: string;
  features: FeatureItem[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FeatureItem {
  id: string;
  icon: string; // Lucide icon name (e.g., 'Leaf', 'Truck', 'Heart')
  headline: string;
  subheadline: string;
  displayOrder: number;
  isActive: boolean;
}
```

### **3. Team Member Model**
```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string; // Profile image URL
  bio?: string;
  socialLinks?: {
    platform: 'linkedin' | 'github' | 'twitter' | 'facebook';
    url: string;
  }[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 📄 Page-Specific Models

### **About Page Models**

#### **About Hero Section**
```typescript
interface AboutHeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Challenges Section**
```typescript
interface ChallengesSection {
  id: string;
  title: string;
  subtitle: string;
  challenges: string[]; // Array of challenge descriptions
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Solutions Section**
```typescript
interface SolutionsSection {
  id: string;
  title: string;
  subtitle: string;
  solutions: SolutionItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SolutionItem {
  id: string;
  title: string;
  description: string;
  icon?: string; // Lucide icon name
  displayOrder: number;
}
```

#### **Vision Section**
```typescript
interface VisionSection {
  id: string;
  title: string;
  content: string[]; // Array of paragraphs
  callToAction: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Mentor Section**
```typescript
interface MentorSection {
  id: string;
  title: string;
  subtitle: string;
  mentor: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **FAQ Page Models**

#### **FAQ Category**
```typescript
interface FAQCategory {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Contact Page Models**

#### **Contact Information**
```typescript
interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'address';
  title: string;
  value: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Business Hours**
```typescript
interface BusinessHours {
  id: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string; // Format: "08:00"
  closeTime: string; // Format: "18:00"
  isClosed: boolean;
  notes?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

#### **Social Links**
```typescript
interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Policy Pages Models**

#### **Privacy Policy Section**
```typescript
interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string; // Rich text content
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Terms of Service**
```typescript
interface TermsSection {
  id: string;
  title: string;
  content: string; // Rich text content
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Shipping Information**
```typescript
interface ShippingInfo {
  id: string;
  section: 'timeline' | 'fees' | 'packaging' | 'tracking' | 'instructions' | 'failed_delivery' | 'holidays';
  title: string;
  content: string; // Rich text content
  data?: any; // For structured data like pricing tables
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### **Returns Policy**
```typescript
interface ReturnsPolicy {
  id: string;
  title: string;
  content: string; // Rich text content
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Blog Models**

#### **Blog Post**
```typescript
interface BlogPost {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## ⚙️ Site Settings Models

### **Global Site Settings**
```typescript
interface SiteSettings {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}
```

### **SEO Settings**
```typescript
interface SEOSettings {
  id: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  twitterCard: 'summary' | 'summary_large_image';
  structuredData?: string; // JSON-LD
  robots: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Email Settings**
```typescript
interface EmailSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 📊 E-commerce Specific Models

### **Product Category**
```typescript
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string; // For subcategories
  displayOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Grower Profile**
```typescript
interface GrowerProfile {
  id: string;
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
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

## 🛒 Shop Page Models

### **Catalog Filters**
```typescript
interface CatalogFilters {
  id: string;
  categories: ProductCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  growers: GrowerProfile[];
  sortOptions: SortOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
}
```

### **Product Showcase**
```typescript
interface ProductShowcase {
  id: string;
  title: string;
  products: string[]; // Product IDs
  displayType: 'featured' | 'bestseller' | 'new' | 'sale';
  maxItems: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

## 📱 UI Components Models

### **Banner/Announcement**
```typescript
interface Banner {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  position: 'top' | 'bottom' | 'inline';
  isDismissible: boolean;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### **Footer Links**
```typescript
interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  displayOrder: number;
}
```

## 🔧 API Response Models

### **Paginated Response**
```typescript
interface PaginatedResponse<T> {
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
```

### **CMS Content Response**
```typescript
interface CMSContentResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  lastModified: string;
  version: number;
}
```

## 📋 Complete Model Usage Examples

### **Admin Dashboard CRUD Operations**

```typescript
// Fetch all hero sections
GET /api/cms/hero

// Create new hero section
POST /api/cms/hero
{
  "title": "Fresh Mushrooms Delivered Daily",
  "subtitle": "Premium quality mushrooms from local growers",
  "backgroundImages": ["/hero-bg-1.jpg", "/hero-bg-2.jpg"],
  "primaryButton": {
    "text": "Shop Now",
    "url": "/catalog",
    "variant": "primary"
  },
  "secondaryButton": {
    "text": "Meet Growers",
    "url": "/growers",
    "variant": "outline"
  },
  "isActive": true,
  "displayOrder": 1
}

// Update hero section
PUT /api/cms/hero/{id}
{
  "title": "Updated Hero Title",
  "isActive": false
}

// Delete hero section
DELETE /api/cms/hero/{id}
```

### **Frontend Integration Examples**

```typescript
// Custom hook for hero data
export function useHeroSections() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/hero')
      .then(res => res.json())
      .then(data => setHeroes(data.data))
      .finally(() => setLoading(false));
  }, []);

  return { heroes, loading };
}

// Component usage
const HeroSlider: React.FC = () => {
  const { heroes, loading } = useHeroSections();
  const activeHeroes = heroes.filter(h => h.isActive);

  if (loading) return <div>Loading...</div>;

  return (
    <Carousel>
      {activeHeroes.map(hero => (
        <CarouselItem key={hero.id}>
          <HeroContent hero={hero} />
        </CarouselItem>
      ))}
    </Carousel>
  );
};
```

## 🎯 Implementation Priority

### **Phase 1: Essential Models**
1. ✅ Hero Sections
2. ✅ Feature Sections  
3. ✅ Team Members
4. ✅ FAQ Categories & Items
5. ✅ Contact Information

### **Phase 2: Content Pages**
1. ✅ About Page Sections
2. ✅ Privacy Policy
3. ✅ Terms of Service
4. ✅ Shipping Information
5. ✅ Returns Policy

### **Phase 3: Advanced Features**
1. ✅ Blog Posts & Categories
2. ✅ Site Settings
3. ✅ SEO Settings
4. ✅ Email Settings
5. ✅ Banners & Announcements

## 📊 Database Schema Recommendations

### **CMS Content Table Structure**
```sql
-- Main content table
CREATE TABLE cms_content (
  id VARCHAR PRIMARY KEY,
  type VARCHAR NOT NULL, -- 'hero', 'feature', 'about', etc.
  title VARCHAR,
  content TEXT, -- JSON or rich text
  metadata JSON, -- Additional structured data
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content relationships
CREATE TABLE cms_content_relationships (
  id VARCHAR PRIMARY KEY,
  parent_id VARCHAR,
  child_id VARCHAR,
  relationship_type VARCHAR, -- 'category', 'section', 'item'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

This comprehensive model system will allow your Admin Dashboard to manage all dynamic content across the MASH platform efficiently and effectively.
