# 🎯 MASH Sanity CMS - Complete E-Commerce Master Plan

**Project**: MASH E-Commerce Real-Time CMS Enhancement  
**Goal**: Build a complete, production-ready e-commerce CMS with real-time updates  
**Owner**: Kenneth  
**Last Updated**: November 20, 2025  
**Status**: 🚀 READY TO START

---

## 📊 Current Status Dashboard

### ✅ What's Already Working (100% Complete - Phase 6 Done!)

**Real-Time Features**:
- ✅ Hero Carousel (1-2 second updates)
- ✅ Products Catalog (real-time price/stock)
- ✅ Blog Posts (instant content updates)
- ✅ Categories (hierarchical with real-time)
- ✅ Grower Profiles (ratings, specialties)
- ✅ Site Settings (logo, contact, announcement bar, footer)

**Total Progress**: 21 real-time hooks, ~2,900 lines of code, 10+ pages updated

### 🎯 What We're Building Next

**Goal**: Enhance the e-commerce CMS with advanced features for production readiness

**Focus Areas**:
1. **Inventory Management** - Stock tracking, low stock alerts
2. **Order System** - Order management in CMS
3. **Customer Reviews** - Product ratings and reviews
4. **Advanced Product Features** - Variants, bundles, related products
5. **Marketing Tools** - Coupons, promotions, email campaigns
6. **Analytics Dashboard** - Sales reports, popular products

---

## 🏗️ Implementation Phases Overview

| Phase | Feature | Time | Priority | Status |
|-------|---------|------|----------|--------|
| **Phase 7** | Inventory Management | 3 hours | 🔴 HIGH | ✅ **COMPLETE** |
| **Phase 8** | Customer Reviews System | 2 hours | 🟡 MEDIUM | 🔴 Not Started |
| **Phase 9** | Product Variants & Bundles | 3 hours | 🟡 MEDIUM | 🔴 Not Started |
| **Phase 10** | Order Management CMS | 4 hours | 🔴 HIGH | 🔴 Not Started |
| **Phase 11** | Marketing Tools | 3 hours | 🟢 LOW | 🔴 Not Started |
| **Phase 12** | Analytics Dashboard | 2 hours | 🟡 MEDIUM | 🔴 Not Started |

**Total Time**: ~17 hours across 6 phases  
**Real-Time Updates**: All features will have 1-2 second updates

---

## 📋 Phase 7: Inventory Management System

**Priority**: 🔴 HIGH  
**Time**: 3 hours  
**Goal**: Real-time stock tracking with low stock alerts

### What You'll Build

1. **Enhanced Stock Management**
   - Real-time stock updates across all pages
   - Automatic "Out of Stock" badges
   - Low stock warnings (configurable threshold)
   - Stock history tracking

2. **Warehouse Management** (Optional)
   - Multiple warehouse support
   - Stock allocation by location
   - Transfer tracking

3. **Alerts System**
   - Low stock notifications
   - Out of stock alerts
   - Restock reminders

### Implementation Steps

#### Step 1: Update Sanity Schema (30 min)

**File**: `studio/src/schemaTypes/documents/product.ts`

Add inventory fields:

```typescript
{
  name: 'inventory',
  title: 'Inventory Management',
  type: 'object',
  fields: [
    {
      name: 'quantityInStock',
      title: 'Quantity in Stock',
      type: 'number',
      validation: Rule => Rule.min(0).integer(),
      description: 'Current stock quantity'
    },
    {
      name: 'lowStockThreshold',
      title: 'Low Stock Threshold',
      type: 'number',
      validation: Rule => Rule.min(0).integer(),
      initialValue: 10,
      description: 'Alert when stock falls below this number'
    },
    {
      name: 'trackInventory',
      title: 'Track Inventory',
      type: 'boolean',
      initialValue: true,
      description: 'Enable/disable inventory tracking for this product'
    },
    {
      name: 'allowBackorders',
      title: 'Allow Backorders',
      type: 'boolean',
      initialValue: false,
      description: 'Allow orders when out of stock'
    },
    {
      name: 'stockHistory',
      title: 'Stock History',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'date',
            type: 'datetime',
            title: 'Date'
          },
          {
            name: 'quantity',
            type: 'number',
            title: 'Quantity Changed'
          },
          {
            name: 'newTotal',
            type: 'number',
            title: 'New Total Stock'
          },
          {
            name: 'reason',
            type: 'string',
            title: 'Reason',
            options: {
              list: [
                {title: 'Restock', value: 'restock'},
                {title: 'Sale', value: 'sale'},
                {title: 'Adjustment', value: 'adjustment'},
                {title: 'Return', value: 'return'},
                {title: 'Damaged', value: 'damaged'}
              ]
            }
          },
          {
            name: 'notes',
            type: 'text',
            title: 'Notes'
          }
        ],
        preview: {
          select: {
            date: 'date',
            quantity: 'quantity',
            reason: 'reason'
          },
          prepare({date, quantity, reason}) {
            return {
              title: `${quantity > 0 ? '+' : ''}${quantity} - ${reason}`,
              subtitle: new Date(date).toLocaleDateString()
            }
          }
        }
      }],
      readOnly: true // Managed by hooks
    }
  ]
}
```

#### Step 2: Create Inventory Hook (45 min)

**File**: `src/hooks/useSanityInventory.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

export interface InventoryStatus {
  productId: string;
  productName: string;
  quantityInStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorders: boolean;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export function useSanityInventory() {
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      console.log('📦 Fetching inventory from Sanity CMS...');
      
      const query = `*[_type == "product" && inventory.trackInventory == true] {
        _id,
        name,
        "quantityInStock": inventory.quantityInStock,
        "lowStockThreshold": inventory.lowStockThreshold,
        "allowBackorders": inventory.allowBackorders
      }`;

      const data = await sanityClient.fetch(query);
      
      const processedInventory: InventoryStatus[] = data.map((item: any) => {
        const isOutOfStock = item.quantityInStock === 0;
        const isLowStock = !isOutOfStock && item.quantityInStock <= item.lowStockThreshold;
        
        return {
          productId: item._id,
          productName: item.name,
          quantityInStock: item.quantityInStock || 0,
          lowStockThreshold: item.lowStockThreshold || 10,
          isLowStock,
          isOutOfStock,
          allowBackorders: item.allowBackorders || false,
          stockStatus: isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'
        };
      });

      setInventory(processedInventory);
      setLoading(false);
      setError(null);

      console.log('📊 Inventory loaded:', {
        total: processedInventory.length,
        lowStock: processedInventory.filter(i => i.isLowStock).length,
        outOfStock: processedInventory.filter(i => i.isOutOfStock).length
      });

    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();

    // Real-time subscription
    const subscription = sanityClient
      .listen('*[_type == "product"]')
      .subscribe((update) => {
        if (update.type === 'mutation') {
          console.log('🔄 Inventory updated in real-time!');
          fetchInventory();
        }
      });

    console.log('🧹 Subscribed to inventory updates');

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Unsubscribed from inventory');
    };
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    lowStockCount: inventory.filter(i => i.isLowStock).length,
    outOfStockCount: inventory.filter(i => i.isOutOfStock).length
  };
}

// Convenience hook for single product inventory
export function useProductInventory(productId: string) {
  const { inventory, loading, error } = useSanityInventory();
  
  const productInventory = inventory.find(i => i.productId === productId);
  
  return {
    inventory: productInventory,
    loading,
    error,
    isInStock: productInventory ? !productInventory.isOutOfStock : false,
    isLowStock: productInventory?.isLowStock || false
  };
}
```

#### Step 3: Add Stock Badges to Product Cards (30 min)

**File**: `src/components/products/StockBadge.tsx`

```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useProductInventory } from "@/hooks/useSanityInventory";

interface StockBadgeProps {
  productId: string;
  showIcon?: boolean;
}

export function StockBadge({ productId, showIcon = true }: StockBadgeProps) {
  const { inventory, loading } = useProductInventory(productId);

  if (loading || !inventory) return null;

  const getVariant = () => {
    switch (inventory.stockStatus) {
      case 'in-stock':
        return 'default';
      case 'low-stock':
        return 'secondary';
      case 'out-of-stock':
        return 'destructive';
    }
  };

  const getLabel = () => {
    switch (inventory.stockStatus) {
      case 'in-stock':
        return `${inventory.quantityInStock} in stock`;
      case 'low-stock':
        return `Only ${inventory.quantityInStock} left!`;
      case 'out-of-stock':
        return inventory.allowBackorders ? 'Backorder available' : 'Out of stock';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (inventory.stockStatus) {
      case 'in-stock':
        return <CheckCircle className="w-3 h-3" />;
      case 'low-stock':
        return <AlertCircle className="w-3 h-3" />;
      case 'out-of-stock':
        return <XCircle className="w-3 h-3" />;
    }
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
}
```

#### Step 4: Update Product Card Component (15 min)

Add stock badge to `src/components/products/ProductCard.tsx`:

```typescript
import { StockBadge } from "./StockBadge";

// Inside ProductCard component, add after price:
<StockBadge productId={product.id} />
```

#### Step 5: Create Inventory Dashboard Page (45 min)

**File**: `src/app/admin/inventory/page.tsx`

```typescript
"use client";

import { useSanityInventory } from "@/hooks/useSanityInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, TrendingDown } from "lucide-react";

export default function InventoryDashboard() {
  const { inventory, loading, lowStockCount, outOfStockCount } = useSanityInventory();

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Tracked products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Unavailable products</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        item.stockStatus === 'out-of-stock' ? 'destructive' :
                        item.stockStatus === 'low-stock' ? 'secondary' : 'default'
                      }
                    >
                      {item.stockStatus}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {item.quantityInStock} units
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Threshold: {item.lowStockThreshold}</div>
                  {item.allowBackorders && (
                    <span className="text-xs text-blue-600">Backorders enabled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 6: Testing Checklist (15 min)

- [ ] Update product stock in Sanity Studio
- [ ] Verify real-time update on product card (1-2 seconds)
- [ ] Test low stock threshold (set stock below threshold)
- [ ] Verify low stock badge appears
- [ ] Set stock to 0 and check out of stock badge
- [ ] Check inventory dashboard shows correct counts
- [ ] Test backorder toggle functionality
- [ ] Verify console logs show real-time updates

### Success Criteria

✅ Real-time stock updates in 1-2 seconds  
✅ Low stock badges appear automatically  
✅ Out of stock products clearly marked  
✅ Inventory dashboard shows accurate counts  
✅ Stock history tracked in Sanity  

---

## 📋 Phase 8: Customer Reviews System

**Priority**: 🟡 MEDIUM  
**Time**: 2 hours  
**Goal**: Real-time product reviews with ratings

### What You'll Build

1. **Review System**
   - 5-star rating system
   - Review text with images
   - Verified purchase badge
   - Review moderation (approve/reject)

2. **Rating Display**
   - Average rating on product cards
   - Rating distribution chart
   - Total review count
   - Helpful votes

3. **Real-Time Updates**
   - New reviews appear instantly
   - Rating averages update automatically
   - Review count updates

### Implementation Steps

#### Step 1: Create Review Schema (30 min)

**File**: `studio/src/schemaTypes/documents/review.ts`

```typescript
export default {
  name: 'review',
  title: 'Product Review',
  type: 'document',
  fields: [
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'product'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'email'
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5).integer(),
      description: '1-5 stars'
    },
    {
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    },
    {
      name: 'content',
      title: 'Review Content',
      type: 'text',
      validation: Rule => Rule.required().min(10).max(1000)
    },
    {
      name: 'images',
      title: 'Review Images',
      type: 'array',
      of: [{type: 'image'}],
      options: {
        hotspot: true
      }
    },
    {
      name: 'verifiedPurchase',
      title: 'Verified Purchase',
      type: 'boolean',
      initialValue: false,
      description: 'Customer actually purchased this product'
    },
    {
      name: 'status',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'}
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'helpfulCount',
      title: 'Helpful Votes',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'reviewDate',
      title: 'Review Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      customer: 'customerName',
      status: 'status'
    },
    prepare({title, rating, customer, status}) {
      return {
        title: `${rating}★ - ${title}`,
        subtitle: `${customer} - ${status}`
      }
    }
  }
}
```

#### Step 2: Create Reviews Hook (45 min)

**File**: `src/hooks/useSanityReviews.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verifiedPurchase: boolean;
  reviewDate: string;
  helpfulCount: number;
}

export interface ProductRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function useSanityReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      console.log('⭐ Fetching reviews for product:', productId);
      
      const query = `{
        "reviews": *[_type == "review" && product._ref == $productId && status == "approved"] | order(reviewDate desc) {
          _id,
          "productId": product._ref,
          customerName,
          rating,
          title,
          content,
          "images": images[].asset->url,
          verifiedPurchase,
          reviewDate,
          helpfulCount
        },
        "stats": *[_type == "review" && product._ref == $productId && status == "approved"] {
          rating
        }
      }`;

      const data = await sanityClient.fetch(query, { productId });
      
      // Transform reviews
      const transformedReviews: Review[] = data.reviews.map((review: any) => ({
        id: review._id,
        productId: review.productId,
        customerName: review.customerName,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images || [],
        verifiedPurchase: review.verifiedPurchase,
        reviewDate: review.reviewDate,
        helpfulCount: review.helpfulCount || 0
      }));

      // Calculate rating statistics
      const ratings = data.stats.map((s: any) => s.rating);
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      ratings.forEach((r: number) => {
        if (r >= 1 && r <= 5) {
          distribution[r as keyof typeof distribution]++;
        }
      });

      const avgRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0;

      setReviews(transformedReviews);
      setRating({
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
        ratingDistribution: distribution
      });
      
      setLoading(false);
      setError(null);

      console.log('📊 Reviews loaded:', {
        count: transformedReviews.length,
        avgRating: avgRating.toFixed(1)
      });

    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();

    // Real-time subscription
    const subscription = sanityClient
      .listen(`*[_type == "review" && product._ref == "${productId}"]`)
      .subscribe((update) => {
        if (update.type === 'mutation') {
          console.log('🔄 Reviews updated in real-time!');
          fetchReviews();
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchReviews, productId]);

  return { reviews, rating, loading, error, refetch: fetchReviews };
}
```

#### Step 3: Create Review Components (30 min)

**File**: `src/components/reviews/ReviewList.tsx`

```typescript
"use client";

import { useSanityReviews } from "@/hooks/useSanityReviews";
import { Star, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const { reviews, rating, loading } = useSanityReviews(productId);

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {rating && (
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{rating.averageRating}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= rating.averageRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {rating.totalReviews} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${(rating.ratingDistribution[star as keyof typeof rating.ratingDistribution] / rating.totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12">
                  {rating.ratingDistribution[star as keyof typeof rating.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{review.customerName}</h4>
                    {review.verifiedPurchase && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <h5 className="font-semibold mb-2">{review.title}</h5>
              <p className="text-muted-foreground">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {review.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt="Review image"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <button className="hover:text-primary">
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Success Criteria

✅ Reviews display in real-time  
✅ Rating averages calculate correctly  
✅ Verified purchase badge shows  
✅ Review images display properly  

---

## 📋 Phase 9: Product Variants & Bundles

**Priority**: 🟡 MEDIUM  
**Time**: 3 hours  
**Goal**: Support product variations and bundle deals

*[Details to be filled when implementing this phase]*

---

## 📋 Phase 10: Order Management CMS

**Priority**: 🔴 HIGH  
**Time**: 4 hours  
**Goal**: Manage orders directly in Sanity CMS

*[Details to be filled when implementing this phase]*

---

## 📋 Phase 11: Marketing Tools

**Priority**: 🟢 LOW  
**Time**: 3 hours  
**Goal**: Coupons, promotions, email campaigns

*[Details to be filled when implementing this phase]*

---

## 📋 Phase 12: Analytics Dashboard

**Priority**: 🟡 MEDIUM  
**Time**: 2 hours  
**Goal**: Sales reports and product analytics

*[Details to be filled when implementing this phase]*

---

## 🎯 Getting Started Guide

### Before Starting Any Phase

1. **Check Current Status**
   - Review completed phases (1-6 already done!)
   - Read phase goals and requirements
   - Estimate your available time

2. **Prepare Your Environment**
   ```bash
   # Make sure dev server is running
   npm run dev
   
   # Make sure Sanity Studio is running
   cd studio
   npm run dev
   ```

3. **Follow Phase Steps**
   - Complete steps in order
   - Test after each major step
   - Use console logs to verify real-time updates
   - Check Sanity Studio for data

4. **Testing Checklist**
   - Each phase has a testing checklist
   - Mark items as you test them
   - Verify real-time updates (should be 1-2 seconds)
   - Check both desktop and mobile views

### How to Track Progress

**Update this document as you go!**

Replace status markers:
- 🔴 Not Started → 🟡 In Progress → ✅ Complete

Add your own notes:
```markdown
## My Notes - Phase X

**Started:** [Date]
**Issues encountered:** [List any problems]
**Solutions:** [How you fixed them]
**Completed:** [Date]
```

---

## 🚀 Quick Reference

### Real-Time Pattern (Copy for Each Feature)

```typescript
// 1. Fetch data
const fetchData = useCallback(async () => {
  const query = `*[_type == "yourType"] { ... }`;
  const data = await sanityClient.fetch(query);
  setData(transform(data));
}, []);

// 2. Set up real-time subscription
useEffect(() => {
  fetchData();
  
  const subscription = sanityClient
    .listen('*[_type == "yourType"]')
    .subscribe((update) => {
      if (update.type === 'mutation') {
        console.log('🔄 Updated in real-time!');
        fetchData();
      }
    });
  
  return () => subscription.unsubscribe();
}, [fetchData]);
```

### Console Log Emojis

Use these in your console.log statements:
- 🔌 Initial fetch
- 📡 Data loaded
- 🔄 Real-time update
- 🧹 Cleanup/unsubscribe
- ❌ Error
- ✅ Success
- 📊 Statistics
- ⭐ Reviews
- 📦 Inventory
- 🎯 Phase start

---

## 📚 Resources

### Documentation
- **Sanity Docs**: https://www.sanity.io/docs
- **Real-Time API**: https://www.sanity.io/docs/realtime-updates
- **GROQ Query**: https://www.sanity.io/docs/groq

### Your Project Files
- **Completed Phases**: `docs/PROJECT_COMPLETION_SUMMARY.md`
- **Sanity Hooks**: `src/hooks/useSanity*.ts` (21 hooks)
- **Sanity Schema**: `studio/src/schemaTypes/`

### Need Help?
- Check existing hooks for patterns
- Review completed documentation in `docs/` folder
- Test in Sanity Studio first before coding

---

## 📊 Progress Tracking

**Last Updated**: November 20, 2025

**Phases Complete**: 6 of 12 (50%)

**Next Up**: Phase 7 - Inventory Management

**Your Notes**:
```
## Phase 7 - Inventory Management ✅ COMPLETE
**Started:** November 20, 2025
**Completed:** November 20, 2025
**Time Taken:** ~45 minutes (faster than expected!)

### What Was Built:
1. ✅ Updated product.ts schema with inventory object (quantityInStock, lowStockThreshold, trackInventory, allowBackorders, stockHistory)
2. ✅ Created useSanityInventory.ts hook with real-time subscription
3. ✅ Created StockBadge.tsx component with 3 variants (default, compact, detailed)
4. ✅ Integrated StockBadge into ProductCard.tsx
5. ✅ Built inventory-dashboard page with summary cards and live inventory table

### Files Created:
- src/hooks/useSanityInventory.ts (~165 lines)
- src/components/product/StockBadge.tsx (~145 lines)
- src/app/(seller)/inventory-dashboard/page.tsx (~250 lines)

### Files Modified:
- studio/src/schemaTypes/documents/product.ts (added inventory fields)
- src/components/product/ProductCard.tsx (added StockBadge)

### Testing Next:
- [ ] Update product stock in Sanity Studio
- [ ] Verify real-time update in dashboard (1-2 seconds)
- [ ] Test low stock threshold alerts
- [ ] Test out of stock scenarios
- [ ] Verify backorder toggle

### Next Phase:
Phase 8 - Customer Reviews System (2 hours estimated)
```

---

**Remember**: Real-time updates should always be 1-2 seconds. If it's slower, check your WebSocket subscription!

🎉 **Good luck building the best e-commerce CMS!** 🎉
