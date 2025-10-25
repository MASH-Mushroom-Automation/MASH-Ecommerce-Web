# 🔗 Complete CMS Integration Guide

This guide provides the final steps to connect your Admin Dashboard with the main MASH E-commerce project.

## 📁 Final Project Structure

```
MASH E-commerce Platform:
├── MASH-Ecommerce-Web/                    # Main e-commerce site
│   ├── src/
│   │   ├── app/api/cms/                   # CMS API endpoints
│   │   ├── components/cms/                # CMS components (empty, ready for integration)
│   │   ├── types/cms.ts                   # CMS type definitions
│   │   └── hooks/useCMS.ts                # CMS data hooks
│   └── CMS-*.md                           # Documentation files
└── MASH-Admin-Dashboard/                  # Admin Dashboard (separate repo)
    ├── src/pages/cms/                     # CMS management pages
    ├── src/components/cms/                # CMS UI components
    └── src/hooks/useCMS.ts                # Shared CMS hooks
```

## 🔧 Integration Steps

### **Step 1: Set Up Shared Types**

In your Admin Dashboard, create the same CMS types:

```typescript
// MASH-Admin-Dashboard/src/types/cms.ts
export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImages: string[];
  primaryButton: {
    text: string;
    url: string;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  secondaryButton: {
    text: string;
    url: string;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Copy all types from MASH-Ecommerce-Web/src/types/cms.ts
```

### **Step 2: Set Up API Client**

Create a shared API client in Admin Dashboard:

```typescript
// MASH-Admin-Dashboard/src/lib/cms-api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const CMSApi = {
  // Hero Management
  async getHeroes() {
    const response = await fetch(`${API_BASE_URL}/api/cms/hero`);
    return await response.json();
  },

  async createHero(data: CreateHeroForm) {
    const response = await fetch(`${API_BASE_URL}/api/cms/hero`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async updateHero(id: string, data: Partial<HeroSection>) {
    const response = await fetch(`${API_BASE_URL}/api/cms/hero/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async deleteHero(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/cms/hero/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },

  // Add other CMS endpoints...
};
```

### **Step 3: Implement Admin Hooks**

```typescript
// MASH-Admin-Dashboard/src/hooks/useCMS.ts
import { useState, useEffect, useCallback } from 'react';
import { CMSApi } from '@/lib/cms-api';
import { HeroSection, CreateHeroForm } from '@/types/cms';

export function useHeroes() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await CMSApi.getHeroes();
      if (response.success) {
        setHeroes(response.data);
      } else {
        setError(response.error || 'Failed to fetch heroes');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createHero = useCallback(async (data: CreateHeroForm) => {
    try {
      const response = await CMSApi.createHero(data);
      if (response.success) {
        await fetchHeroes(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create hero');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchHeroes]);

  const updateHero = useCallback(async (id: string, data: Partial<HeroSection>) => {
    try {
      const response = await CMSApi.updateHero(id, data);
      if (response.success) {
        await fetchHeroes(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update hero');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchHeroes]);

  const deleteHero = useCallback(async (id: string) => {
    try {
      const response = await CMSApi.deleteHero(id);
      if (response.success) {
        await fetchHeroes(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to delete hero');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchHeroes]);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  return {
    heroes,
    loading,
    error,
    createHero,
    updateHero,
    deleteHero,
    refetch: fetchHeroes
  };
}
```

### **Step 4: Update Main Project Hooks**

Update the main project's hooks to use the new CMS API:

```typescript
// MASH-Ecommerce-Web/src/hooks/useCMS.ts
import { useState, useEffect, useCallback } from 'react';
import { HeroSection } from '@/types/cms';

export function useHeroSections() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cms/hero');
      const data = await response.json();

      if (data.success) {
        // Filter only active heroes and sort by display order
        const activeHeroes = data.data
          .filter((hero: HeroSection) => hero.isActive)
          .sort((a: HeroSection, b: HeroSection) => a.displayOrder - b.displayOrder);
        setHeroes(activeHeroes);
      } else {
        setError(data.error || 'Failed to fetch hero sections');
      }
    } catch (err) {
      setError('Network error occurred');
      setHeroes([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  return {
    heroes,
    loading,
    error,
    refetch: fetchHeroes
  };
}
```

### **Step 5: Update Components to Use CMS Data**

Update the main page component:

```typescript
// MASH-Ecommerce-Web/src/app/page.tsx
"use client";

import { HeroSection } from '@/components/hero/HeroSection';
import { useHeroSections } from '@/hooks/useCMS';

export default function Home() {
  const { heroes, loading, error } = useHeroSections();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A994E] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading content...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#6A994E] text-white rounded hover:bg-[#5A8A3E]"
        >
          Try Again
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Use CMS hero sections */}
        {heroes.map((hero) => (
          <HeroSection key={hero.id} data={hero} />
        ))}

        {/* Keep other sections as they are, or convert them to CMS too */}
        <FeaturedProductsSection />
        <WhyMASHSection />
        <FeaturedGrowersSection />
      </main>
    </div>
  );
}
```

## 🚀 Deployment Integration

### **Environment Configuration**

#### **Main Project** (MASH-Ecommerce-Web)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
CMS_UPLOAD_PATH=/uploads
CMS_MAX_FILE_SIZE=5242880
DATABASE_URL=postgresql://username:password@localhost:5432/mash_cms
```

#### **Admin Dashboard** (MASH-Admin-Dashboard)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000  # Points to main project
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### **CORS Configuration**

Update the main project to allow Admin Dashboard requests:

```typescript
// MASH-Ecommerce-Web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/cms/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔄 Real-time Updates

### **WebSocket Integration for Live Updates**

```typescript
// MASH-Ecommerce-Web/src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      path: '/api/socket',
    });
  }
  return socket;
}

// Listen for CMS updates
export function onCMSUpdate(callback: (data: any) => void) {
  const socket = getSocket();
  socket.on('cms-update', callback);
  return () => socket.off('cms-update', callback);
}
```

### **Update Main Project on CMS Changes**

```typescript
// MASH-Ecommerce-Web/src/lib/cms-cache.ts
import { onCMSUpdate } from './websocket';

// Clear cache when CMS content updates
onCMSUpdate((data) => {
  // Clear relevant caches
  if (data.type === 'hero') {
    // Clear hero cache
    revalidatePath('/');
  }
  if (data.type === 'faq') {
    // Clear FAQ cache
    revalidatePath('/faq');
  }
});
```

## 🧪 Testing Integration

### **End-to-End Testing**

```typescript
// tests/integration/cms-integration.test.ts
describe('CMS Integration', () => {
  test('Admin can create hero and it appears on main site', async () => {
    // 1. Admin creates hero via Admin Dashboard
    const adminResponse = await fetch('http://localhost:3001/api/cms/hero', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Hero',
        subtitle: 'Test subtitle',
        primaryButton: { text: 'Shop', url: '/catalog', variant: 'primary' },
        isActive: true,
        displayOrder: 1
      })
    });

    expect(adminResponse.status).toBe(201);

    // 2. Main site fetches updated content
    const siteResponse = await fetch('http://localhost:3000/api/cms/hero');
    const siteData = await siteResponse.json();

    expect(siteData.success).toBe(true);
    expect(siteData.data).toContainEqual(
      expect.objectContaining({
        title: 'Test Hero',
        isActive: true
      })
    );
  });
});
```

## 📊 Performance Optimization

### **Caching Strategy**

```typescript
// MASH-Ecommerce-Web/src/lib/cms-cache.ts
import { cache } from 'react';

// Cache CMS data with revalidation
export const getCachedHeroes = cache(async (): Promise<HeroSection[]> => {
  const response = await fetch(`${process.env.API_BASE_URL}/api/cms/hero`, {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });

  const data = await response.json();
  return data.success ? data.data.filter((h: HeroSection) => h.isActive) : [];
});

// In components
export default async function HomePage() {
  const heroes = await getCachedHeroes();
  return <HeroSlider heroes={heroes} />;
}
```

### **Image Optimization**

```typescript
// MASH-Ecommerce-Web/src/components/cms/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, className, priority }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <p className="text-gray-500 text-sm">Image not available</p>
        </div>
      )}
    </div>
  );
}
```

## 🔍 Monitoring & Analytics

### **CMS Analytics**

```typescript
// MASH-Ecommerce-Web/src/lib/analytics.ts
export function trackCMSView(contentType: string, contentId: string) {
  // Track which CMS content is being viewed
  fetch('/api/analytics/cms-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, contentId }),
  });
}

// In components
useEffect(() => {
  heroes.forEach(hero => {
    trackCMSView('hero', hero.id);
  });
}, [heroes]);
```

## 🛠️ Maintenance & Updates

### **Version Management**

```typescript
// MASH-Ecommerce-Web/src/lib/cms-versions.ts
export async function createVersion(contentId: string, contentType: string) {
  // Create a version snapshot before updates
  const response = await fetch(`/api/cms/${contentType}/${contentId}`);
  const data = await response.json();

  if (data.success) {
    await fetch('/api/cms/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        contentType,
        data: data.data,
        createdBy: 'admin'
      })
    });
  }
}
```

### **Health Check**

```typescript
// MASH-Ecommerce-Web/src/app/api/health/cms/route.ts
export async function GET() {
  try {
    // Check CMS API endpoints
    const heroResponse = await fetch(`${process.env.API_BASE_URL}/api/cms/hero`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!heroResponse.ok) {
      throw new Error('CMS API not responding');
    }

    return NextResponse.json({
      status: 'healthy',
      cms: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      cms: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
```

## 🎯 Final Integration Checklist

### **Backend Integration**
- [ ] All CMS API endpoints implemented and tested
- [ ] Database schema created and migrated
- [ ] File upload functionality working
- [ ] Authentication and authorization configured
- [ ] CORS settings properly configured

### **Frontend Integration**
- [ ] All CMS hooks implemented in main project
- [ ] Components updated to use CMS data
- [ ] Fallback mechanisms in place
- [ ] Loading states and error handling
- [ ] Real-time updates working

### **Admin Dashboard Integration**
- [ ] All management interfaces implemented
- [ ] API client configured correctly
- [ ] Form validation working
- [ ] Image upload integrated
- [ ] User authentication connected

### **Testing & Quality Assurance**
- [ ] End-to-end integration tests passing
- [ ] Performance testing completed
- [ ] Error scenarios handled
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### **Production Deployment**
- [ ] Environment variables configured
- [ ] Database seeded with initial content
- [ ] Monitoring and analytics set up
- [ ] Backup and recovery procedures
- [ ] Documentation updated

## 🚨 Troubleshooting Common Issues

### **1. CORS Errors**
```bash
# Check if Admin Dashboard URL is whitelisted
# Verify NEXT_PUBLIC_ADMIN_URL environment variable
# Check browser console for detailed error messages
```

### **2. API Connection Issues**
```bash
# Verify API_BASE_URL configuration
# Check if main project is running on correct port
# Test API endpoints individually using curl or Postman
```

### **3. Real-time Updates Not Working**
```bash
# Check WebSocket connection
# Verify socket.io server configuration
# Test with simple socket events first
```

### **4. Images Not Loading**
```bash
# Verify upload API is working
# Check image paths in database
# Confirm Next.js Image optimization settings
```

## 📚 Next Steps After Integration

1. **Content Migration**: Use Admin Dashboard to populate all CMS content
2. **User Training**: Train content managers on using the CMS interface
3. **Performance Monitoring**: Set up monitoring for CMS performance
4. **Feature Expansion**: Add more advanced CMS features as needed
5. **Content Strategy**: Develop content management workflows

## 🎉 Integration Complete!

Once all steps are completed, your MASH E-commerce platform will have:

- ✅ **Dynamic Content Management**: All content editable via Admin Dashboard
- ✅ **Real-time Updates**: Changes reflect immediately on main site
- ✅ **Performance Optimized**: Fast loading with caching and optimization
- ✅ **User Friendly**: Intuitive admin interface for content management
- ✅ **Scalable Architecture**: Easy to extend and maintain
- ✅ **Production Ready**: Robust error handling and monitoring

Your platform is now fully CMS-integrated and ready for content management! 🎊
