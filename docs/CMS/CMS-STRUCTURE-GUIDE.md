# 📝 CMS Structure Guide - Making Pages CMS-Supported

## 🎯 Overview

This guide outlines how to transform hardcoded page content into dynamic, CMS-managed content that can be edited through your Admin Dashboard. The goal is to make all static content manageable without touching code.

## 🔍 Current State Analysis

### ✅ Already CMS-Ready Sections
- **Featured Products**: Using `useHomePageData()` hook
- **Featured Growers**: Using `useHomePageData()` hook
- **Product Catalog**: Dynamic product fetching
- **Seller Dashboard**: Dynamic data management

### ❌ Hardcoded Sections Needing CMS Integration

#### Landing Page (`src/app/page.tsx`)
- **HeroSection**: Hardcoded title, subtitle, images, buttons
- **WhyMASHSection**: Hardcoded feature items, headlines, descriptions

#### Static Pages
- About page content
- FAQ content
- Contact information
- Terms & Policies

## 🏗️ CMS Architecture

### **1. CMS Models Structure**

Create these CMS models in your Admin Dashboard:

```typescript
// Hero Section Model
interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImages: string[];
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
}

// Feature Section Model
interface FeatureSection {
  id: string;
  title: string;
  subtitle: string;
  features: {
    id: string;
    icon: string; // lucide icon name
    headline: string;
    subheadline: string;
    displayOrder: number;
  }[];
  isActive: boolean;
}

// Static Content Model
interface StaticContent {
  id: string;
  page: 'about' | 'faq' | 'contact' | 'terms' | 'privacy' | 'shipping' | 'returns';
  title: string;
  content: string;
  sections?: {
    id: string;
    title: string;
    content: string;
    displayOrder: number;
  }[];
  isActive: boolean;
}

// Site Settings Model
interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  businessHours: string;
  address: string;
}
```

### **2. API Endpoints Structure**

Create these API endpoints in your main project:

```
src/app/api/cms/
├── hero/
│   ├── route.ts              # GET/POST hero sections
│   └── [id]/route.ts         # GET/PUT/DELETE specific hero
├── features/
│   ├── route.ts              # GET/POST feature sections
│   └── [id]/route.ts         # GET/PUT/DELETE specific feature
├── content/
│   ├── route.ts              # GET/POST static content
│   └── [id]/route.ts         # GET/PUT/DELETE specific content
└── settings/
    ├── route.ts              # GET/POST site settings
    └── [id]/route.ts         # GET/PUT/DELETE specific settings
```

## 🔧 Implementation Examples

### **1. Refactoring HeroSection**

#### Current Hardcoded Version:
```typescript
const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[600px] overflow-hidden">
      <h1 className="text-6xl font-bold text-white mb-6">
        Freshly Harvested Mushrooms, Straight From a Grower Near You.
      </h1>
      <p className="text-xl text-white/90 mb-8">
        Discover the best of Philippine-grown gourmet mushrooms...
      </p>
    </section>
  );
};
```

#### CMS-Ready Version:
```typescript
// Custom Hook for Hero Data
export function useHeroSection() {
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/hero');
      const data = await response.json();
      setHeroData(data.data);
    } catch (err) {
      setError('Failed to fetch hero content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroData();
  }, [fetchHeroData]);

  return { heroData, loading, error, refetch: fetchHeroData };
}

// Updated Component
const HeroSection: React.FC = () => {
  const { heroData, loading, error } = useHeroSection();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!heroData) return null;

  return (
    <section className="relative h-[600px] overflow-hidden">
      <h1 className="text-6xl font-bold text-white mb-6">
        {heroData.title}
      </h1>
      <p className="text-xl text-white/90 mb-8">
        {heroData.subtitle}
      </p>
      <div className="flex gap-4">
        <Link href={heroData.primaryButton.url}>
          <Button>{heroData.primaryButton.text}</Button>
        </Link>
        <Link href={heroData.secondaryButton.url}>
          <Button variant="outline">{heroData.secondaryButton.text}</Button>
        </Link>
      </div>
    </section>
  );
};
```

### **2. Refactoring WhyMASHSection**

#### Current Hardcoded Version:
```typescript
const WhyMASHSection: React.FC = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-8">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Why MASH?
      </h2>
      <p className="text-lg text-gray-600 mb-12">
        Freshness and Quality You Can Trust
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureItem
          icon={<Leaf size={32} />}
          headline="Locally Sourced"
          subheadline="Every mushroom is cultivated with care..."
        />
        {/* More hardcoded features */}
      </div>
    </div>
  </section>
);
```

#### CMS-Ready Version:
```typescript
// Custom Hook for Features
export function useFeatureSection() {
  const [features, setFeatures] = useState<FeatureSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/features');
      const data = await response.json();
      setFeatures(data.data);
    } catch (err) {
      setError('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return { features, loading, error, refetch: fetchFeatures };
}

// Updated Component
const WhyMASHSection: React.FC = () => {
  const { features, loading, error } = useFeatureSection();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!features) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {features.title}
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          {features.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.features.map((feature) => (
            <FeatureItem
              key={feature.id}
              icon={getIcon(feature.icon)}
              headline={feature.headline}
              subheadline={feature.subheadline}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
```

## 📊 CMS Models for Admin Dashboard

### **1. Hero Management Interface**

Create these fields in your Admin Dashboard:

```
Hero Sections Management:
├── Title (Text Input)
├── Subtitle (Text Area)
├── Background Images (Image Upload - Multiple)
├── Primary Button
│   ├── Text (Input)
│   ├── URL (Input)
│   └── Style (Select: Primary/Secondary)
├── Secondary Button
│   ├── Text (Input)
│   ├── URL (Input)
│   └── Style (Select: Outline/Ghost)
├── Active (Toggle)
└── Display Order (Number)
```

### **2. Features Management Interface**

```
Features Management:
├── Section Title (Input)
├── Section Subtitle (Text Area)
├── Features List (Repeatable)
│   ├── Icon (Select from Lucide icons)
│   ├── Headline (Input)
│   ├── Description (Text Area)
│   └── Display Order (Number)
└── Active (Toggle)
```

### **3. Static Content Management Interface**

```
Static Pages Management:
├── Page Type (Select: About/FAQ/Contact/etc.)
├── Title (Input)
├── Content (Rich Text Editor)
├── Sections (Repeatable - for complex pages)
│   ├── Section Title (Input)
│   ├── Section Content (Rich Text Editor)
│   └── Display Order (Number)
└── Active (Toggle)
```

## 🔗 Integration with Admin Dashboard

### **1. API Integration**

In your Admin Dashboard, create API calls to manage content:

```typescript
// Admin Dashboard API calls
const CMS_API = {
  // Hero Management
  getHeroes: () => fetch('/api/cms/hero'),
  createHero: (data) => fetch('/api/cms/hero', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateHero: (id, data) => fetch(`/api/cms/hero/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Features Management
  getFeatures: () => fetch('/api/cms/features'),
  createFeature: (data) => fetch('/api/cms/features', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Static Content
  getContent: (page) => fetch(`/api/cms/content?page=${page}`),
  updateContent: (id, data) => fetch(`/api/cms/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
```

### **2. Real-time Updates**

Implement real-time updates so changes in Admin reflect immediately:

```typescript
// Add refresh mechanism
const useRefreshableData = (fetcher) => {
  const [data, setData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetcher().then(setData);
  }, [fetcher, refreshTrigger]);

  return { data, refresh };
};

// In Admin Dashboard, call refresh after saving
const handleSave = async (data) => {
  await saveToAPI(data);
  // Notify all components to refresh
  window.dispatchEvent(new CustomEvent('cms-content-updated'));
};
```

## 📋 Implementation Checklist

### **Phase 1: Foundation**
- [ ] Create CMS API routes (`/api/cms/*`)
- [ ] Define TypeScript interfaces for all CMS models
- [ ] Create custom hooks for CMS data fetching
- [ ] Set up error handling and loading states

### **Phase 2: Landing Page**
- [ ] Refactor HeroSection to use CMS data
- [ ] Refactor WhyMASHSection to use CMS data
- [ ] Test all sections load properly
- [ ] Add fallback content for missing CMS data

### **Phase 3: Static Pages**
- [ ] Convert About page to CMS
- [ ] Convert FAQ page to CMS
- [ ] Convert Contact page to CMS
- [ ] Convert Terms & Policies to CMS

### **Phase 4: Admin Integration**
- [ ] Create CMS management interfaces in Admin Dashboard
- [ ] Implement CRUD operations for all content types
- [ ] Add image upload functionality
- [ ] Implement real-time preview

## 🚨 Important Notes

1. **Always provide fallbacks** for when CMS data is unavailable
2. **Cache CMS data** to avoid excessive API calls
3. **Validate data** on both frontend and backend
4. **Handle loading states** gracefully
5. **Test with empty/missing data** scenarios

## 🔄 Migration Path

### **Step 1: Set up CMS API**
Create the API routes and basic CRUD operations

### **Step 2: Create Admin Interfaces**
Build the management interfaces in your Admin Dashboard

### **Step 3: Gradual Migration**
Convert sections one by one, testing each thoroughly

### **Step 4: Content Population**
Use Admin Dashboard to populate content for all sections

### **Step 5: Go Live**
Remove hardcoded content and rely entirely on CMS

This approach ensures a smooth transition from hardcoded to CMS-managed content while maintaining functionality throughout the process.
