# 🚀 CMS API Endpoints Implementation Guide

This guide provides the complete API structure needed to support all CMS models in your Admin Dashboard.

## 📁 API Directory Structure

```
src/app/api/cms/
├── hero/
│   ├── route.ts              # GET/POST hero sections
│   └── [id]/route.ts         # GET/PUT/DELETE specific hero
├── features/
│   ├── route.ts              # GET/POST feature sections
│   └── [id]/route.ts         # GET/PUT/DELETE specific feature
├── about/
│   ├── route.ts              # GET/POST about sections
│   ├── hero/route.ts          # About hero section
│   ├── challenges/route.ts    # Challenges section
│   ├── solutions/route.ts     # Solutions section
│   ├── team/route.ts          # Team members
│   ├── mentor/route.ts        # Mentor section
│   └── vision/route.ts        # Vision section
├── faq/
│   ├── route.ts              # GET/POST FAQ categories
│   ├── categories/route.ts   # FAQ categories management
│   └── [id]/route.ts         # Individual FAQ items
├── contact/
│   ├── route.ts              # GET/POST contact info
│   ├── info/route.ts          # Contact information
│   ├── hours/route.ts          # Business hours
│   └── social/route.ts        # Social links
├── policies/
│   ├── privacy/route.ts      # Privacy policy sections
│   ├── terms/route.ts        # Terms of service sections
│   ├── shipping/route.ts     # Shipping information
│   └── returns/route.ts      # Returns policy
├── blog/
│   ├── route.ts              # GET/POST blog posts
│   ├── [id]/route.ts         # Individual blog post
│   └── categories/route.ts    # Blog categories
├── site/
│   ├── settings/route.ts     # Global site settings
│   ├── seo/route.ts          # SEO settings
│   ├── email/route.ts         # Email settings
│   └── banners/route.ts      # Site banners/announcements
└── upload/
    └── route.ts              # File upload for images
```

## 🔧 API Implementation Examples

### **1. Hero Section API**

#### **GET/POST Hero Sections** - `src/app/api/cms/hero/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { HeroSection } from '@/types/cms';

export async function GET() {
  try {
    // TODO: Replace with actual database query
    const heroes = await getHeroesFromDatabase();
    
    return NextResponse.json({
      data: heroes,
      success: true,
      message: 'Heroes retrieved successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch heroes'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'subtitle', 'primaryButton', 'secondaryButton'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // TODO: Save to database
    const newHero = await createHeroInDatabase(body);

    return NextResponse.json({
      data: newHero,
      success: true,
      message: 'Hero created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create hero'
    }, { status: 500 });
  }
}
```

#### **Individual Hero Management** - `src/app/api/cms/hero/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hero = await getHeroByIdFromDatabase(params.id);
    
    if (!hero) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: hero,
      success: true
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hero'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedHero = await updateHeroInDatabase(params.id, body);

    if (!updatedHero) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: updatedHero,
      success: true,
      message: 'Hero updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update hero'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteHeroFromDatabase(params.id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Hero deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete hero'
    }, { status: 500 });
  }
}
```

### **2. About Page API**

#### **About Hero Section** - `src/app/api/cms/about/hero/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const aboutHero = await getAboutHeroFromDatabase();
    return NextResponse.json({ data: aboutHero, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch about hero'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedHero = await updateAboutHeroInDatabase(body);
    
    return NextResponse.json({
      data: updatedHero,
      success: true,
      message: 'About hero updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update about hero'
    }, { status: 500 });
  }
}
```

#### **Team Members API** - `src/app/api/cms/about/team/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const teamMembers = await getTeamMembersFromDatabase();
    return NextResponse.json({ data: teamMembers, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team members'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.role) {
      return NextResponse.json({
        success: false,
        error: 'Name and role are required'
      }, { status: 400 });
    }

    const newMember = await createTeamMemberInDatabase(body);
    
    return NextResponse.json({
      data: newMember,
      success: true,
      message: 'Team member created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create team member'
    }, { status: 500 });
  }
}
```

### **3. FAQ API**

#### **FAQ Categories** - `src/app/api/cms/faq/categories/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await getFAQCategoriesFromDatabase();
    return NextResponse.json({ data: categories, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FAQ categories'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    const newCategory = await createFAQCategoryInDatabase(body);
    
    return NextResponse.json({
      data: newCategory,
      success: true,
      message: 'FAQ category created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create FAQ category'
    }, { status: 500 });
  }
}
```

#### **Individual FAQ Items** - `src/app/api/cms/faq/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedFAQ = await updateFAQInDatabase(params.id, body);

    if (!updatedFAQ) {
      return NextResponse.json({
        success: false,
        error: 'FAQ not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: updatedFAQ,
      success: true,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update FAQ'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteFAQFromDatabase(params.id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'FAQ not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete FAQ'
    }, { status: 500 });
  }
}
```

### **4. Contact Information API**

#### **Contact Info Management** - `src/app/api/cms/contact/info/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const contactInfo = await getContactInfoFromDatabase();
    return NextResponse.json({ data: contactInfo, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact info'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.type || !body.title || !body.value) {
      return NextResponse.json({
        success: false,
        error: 'Type, title, and value are required'
      }, { status: 400 });
    }

    const newContact = await createContactInfoInDatabase(body);
    
    return NextResponse.json({
      data: newContact,
      success: true,
      message: 'Contact info created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create contact info'
    }, { status: 500 });
  }
}
```

### **5. Site Settings API**

#### **Global Settings** - `src/app/api/cms/site/settings/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await getSiteSettingsFromDatabase();
    return NextResponse.json({ data: settings, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch site settings'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedSettings = await updateSiteSettingsInDatabase(body);
    
    return NextResponse.json({
      data: updatedSettings,
      success: true,
      message: 'Site settings updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update site settings'
    }, { status: 500 });
  }
}
```

### **6. File Upload API**

#### **Image Upload** - `src/app/api/cms/upload/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', filename);

    // Save file
    await writeFile(path, buffer);

    return NextResponse.json({
      data: {
        filename,
        url: `/uploads/${filename}`
      },
      success: true,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file'
    }, { status: 500 });
  }
}
```

## 🔄 Database Operations

### **Database Helper Functions**

Create these utility functions in `src/lib/cms/database.ts`:

```typescript
// Hero operations
export async function getHeroesFromDatabase(): Promise<HeroSection[]> {
  // TODO: Replace with actual database implementation
  return [
    {
      id: '1',
      title: 'Fresh Mushrooms Delivered Daily',
      subtitle: 'Premium quality mushrooms from local growers',
      backgroundImages: ['/hero-bg-1.jpg'],
      primaryButton: {
        text: 'Shop Now',
        url: '/catalog',
        variant: 'primary'
      },
      secondaryButton: {
        text: 'Meet Growers',
        url: '/growers',
        variant: 'outline'
      },
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export async function createHeroInDatabase(data: Partial<HeroSection>): Promise<HeroSection> {
  // TODO: Implement database insertion
  const newHero: HeroSection = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save to database
  return newHero;
}

export async function updateHeroInDatabase(id: string, data: Partial<HeroSection>): Promise<HeroSection | null> {
  // TODO: Implement database update
  return null;
}

export async function deleteHeroFromDatabase(id: string): Promise<boolean> {
  // TODO: Implement database deletion
  return true;
}

// Similar functions for other models...
```

## 📊 Advanced API Features

### **1. Bulk Operations**

#### **Bulk Update Display Order**
```typescript
// PATCH /api/cms/hero/reorder
export async function PATCH(request: NextRequest) {
  try {
    const { items } = await request.json();
    
    // Update display order for multiple items
    await updateDisplayOrdersInDatabase(items);
    
    return NextResponse.json({
      success: true,
      message: 'Display order updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update display order'
    }, { status: 500 });
  }
}
```

### **2. Search and Filter**

#### **Search FAQ Items**
```typescript
// GET /api/cms/faq/search?q=delivery
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  try {
    const results = await searchFAQsInDatabase(query);
    return NextResponse.json({ data: results, success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 });
  }
}
```

### **3. Export/Import**

#### **Export All CMS Data**
```typescript
// GET /api/cms/export
export async function GET() {
  try {
    const allData = await exportAllCMSData();
    
    return NextResponse.json({
      data: allData,
      success: true,
      message: 'CMS data exported successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Export failed'
    }, { status: 500 });
  }
}
```

## 🔐 Authentication & Authorization

### **Protected Routes**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const user = await verifyAdminToken(request);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    // Continue with CMS operation
    const data = await getCMSData();
    return NextResponse.json({ data, success: true });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 401 });
  }
}
```

## 📈 Performance Optimization

### **1. Caching**
```typescript
import { cache } from 'react';

// Cached data fetching
export const getCachedHeroes = cache(async (): Promise<HeroSection[]> => {
  return await getHeroesFromDatabase();
});
```

### **2. Database Indexing**
```typescript
// Recommended database indexes
CREATE INDEX idx_cms_content_type_active ON cms_content(type, is_active);
CREATE INDEX idx_cms_content_display_order ON cms_content(display_order);
CREATE INDEX idx_faq_category ON faq_items(category_id);
```

## 🧪 Testing Examples

### **API Route Testing**
```typescript
// tests/api/cms/hero.test.ts
describe('Hero API', () => {
  test('GET /api/cms/hero returns hero sections', async () => {
    const response = await fetch('/api/cms/hero');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('POST /api/cms/hero creates new hero', async () => {
    const heroData = {
      title: 'Test Hero',
      subtitle: 'Test subtitle',
      primaryButton: { text: 'Shop', url: '/catalog', variant: 'primary' },
      secondaryButton: { text: 'Learn', url: '/about', variant: 'outline' }
    };

    const response = await fetch('/api/cms/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heroData)
    });

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
```

## 🚀 Deployment Considerations

### **Environment Variables**
```bash
# .env.local
CMS_DB_URL=postgresql://username:password@localhost:5432/mash_cms
CMS_UPLOAD_PATH=/uploads
CMS_MAX_FILE_SIZE=5242880  # 5MB
CMS_ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
```

### **Database Setup**
```sql
-- Create CMS database schema
CREATE DATABASE mash_cms;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
```

This API implementation provides a solid foundation for your CMS system, allowing your Admin Dashboard to fully manage all dynamic content across the MASH platform.
