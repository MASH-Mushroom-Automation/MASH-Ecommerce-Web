# MASH E-Commerce - Complete Buyer Checkout Flow

> **Version:** 2.0 | **Created:** December 16, 2025  
> **Status:** In Progress | **Target:** Full Firebase-based cart & orders (no backend dependency)

---

## 📋 Executive Summary

This document outlines the **complete buyer flow** from browsing products to placing an order that requires **admin/seller approval**. Since the NestJS backend is not yet complete, we will use **Firebase Firestore** to store cart data and orders, ensuring the system works immediately.

### Key Features
1. **Firebase-Synced Cart** - Cart persists across devices for logged-in users
2. **Lalamove Delivery Integration** - Real-time delivery quotes with Google Maps
3. **Order Approval Workflow** - Orders require admin/seller approval before processing
4. **No Backend Dependency** - Uses Firebase until backend is ready

---

## 🎯 User Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUYER CHECKOUT FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. BROWSE & ADD TO CART                                                    │
│     └─> Products from Sanity CMS                                            │
│     └─> Cart saved to localStorage + Firebase (if logged in)                │
│                                                                             │
│  2. CART REVIEW                                                             │
│     └─> View items, quantities, stock validation                            │
│     └─> Apply promo codes (future)                                          │
│                                                                             │
│  3. CHECKOUT - STEP 1: DELIVERY METHOD                                      │
│     ├─> Option A: PICKUP (free) - Select location                           │
│     └─> Option B: DELIVERY (Lalamove) - Enter address with map              │
│         └─> Google Maps address picker                                      │
│         └─> Real-time Lalamove quotation                                    │
│                                                                             │
│  4. CHECKOUT - STEP 2: CONTACT INFO                                         │
│     └─> Auto-fill from Firebase user profile                                │
│     └─> Name, email, phone                                                  │
│                                                                             │
│  5. CHECKOUT - STEP 3: PAYMENT METHOD                                       │
│     ├─> Cash on Pickup/Delivery (COD) ✅ Available                          │
│     ├─> GCash (Coming Soon) 🚧                                              │
│     └─> Credit/Debit Card (Coming Soon) 🚧                                  │
│                                                                             │
│  6. PLACE ORDER                                                             │
│     └─> Order saved to Firebase with status: PENDING_APPROVAL               │
│     └─> Notification sent to admin/seller                                   │
│     └─> Buyer sees confirmation with order number                           │
│                                                                             │
│  7. ORDER APPROVAL (Admin/Seller)                                           │
│     └─> Review order in seller dashboard                                    │
│     ├─> APPROVE → Status: APPROVED → Process for delivery/pickup            │
│     └─> REJECT → Status: REJECTED → Notify buyer with reason                │
│                                                                             │
│  8. ORDER FULFILLMENT                                                       │
│     ├─> Pickup: Mark as READY_FOR_PICKUP → COMPLETED                        │
│     └─> Delivery: Create Lalamove order → SHIPPED → DELIVERED               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Current Implementation Status

### ✅ COMPLETED (Phase 1-3)

| Component | Status | Notes |
|-----------|--------|-------|
| CartContext with full product data | ✅ Done | Stores name, image, slug, stock, grower, unit |
| localStorage persistence | ✅ Done | Version 2 schema with migration |
| Stock validation on add/update | ✅ Done | Prevents over-ordering |
| Cart dropdown display | ✅ Done | Shows real product data |
| Product detail add-to-cart | ✅ Done | Uses AddToCartProduct interface |
| Shop page add-to-cart | ✅ Done | Via ProductCard component |
| Toast notifications | ✅ Done | Sonner toasts for feedback |
| Basic checkout page | ✅ Partial | 2-step form, needs delivery options |
| Firebase auth (Google Sign-in) | ✅ Done | Redirect flow working |
| Lalamove client | ✅ Done | HMAC auth, quotation, order APIs |

### 🚧 IN PROGRESS / TO BE BUILT (Phase 4-8)

| Component | Status | Priority |
|-----------|--------|----------|
| Firebase Firestore cart sync | ❌ Not Started | 🔴 Critical |
| Firebase Firestore orders | ❌ Not Started | 🔴 Critical |
| Delivery method selection (Pickup/Lalamove) | ❌ Not Started | 🔴 Critical |
| Google Maps address picker | ❌ Not Started | 🔴 Critical |
| Real-time Lalamove quote in checkout | ❌ Not Started | 🔴 Critical |
| Order approval workflow | ❌ Not Started | 🔴 Critical |
| Seller dashboard for orders | ❌ Not Started | 🟠 High |
| Order status tracking page | ❌ Not Started | 🟠 High |
| Email/push notifications | ❌ Not Started | 🟡 Medium |

---

## 🔥 Phase 4: Firebase Cart & Orders Integration

### 4.1 Firestore Data Structure

```typescript
// Firestore Collections Structure

// Collection: users/{userId}
interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  defaultAddress?: UserAddress;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: carts/{userId}
interface FirestoreCart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
  version: number; // For optimistic locking
}

// Collection: orders/{orderId}
interface FirestoreOrder {
  id: string;
  orderNumber: string; // Human-readable: MASH-20251216-001
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  
  // Items
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  
  // Delivery
  deliveryMethod: 'pickup' | 'lalamove';
  pickupLocation?: {
    id: string;
    name: string;
    address: string;
  };
  deliveryAddress?: {
    address: string;
    lat: number;
    lng: number;
    name: string;
    phone: string;
    notes?: string;
  };
  lalamoveQuotationId?: string;
  lalamoveOrderId?: string;
  
  // Payment
  paymentMethod: 'cod' | 'gcash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Order Status
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  
  // Metadata
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
}

type OrderStatus = 
  | 'pending_approval'  // Waiting for seller/admin approval
  | 'approved'          // Approved, ready to process
  | 'rejected'          // Rejected by seller/admin
  | 'processing'        // Being prepared
  | 'ready_for_pickup'  // Ready at pickup location
  | 'shipped'           // Handed to Lalamove driver
  | 'delivered'         // Delivered to customer
  | 'completed'         // Confirmed by customer
  | 'cancelled';        // Cancelled by customer or seller

interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string;
  note?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  grower?: string;
  unit?: string;
}
```

### 4.2 Firebase Service - Cart Operations

```typescript
// src/lib/firebase/cart.ts

import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';
import { CartItem } from '@/types/api';

const db = getFirestore(firebaseApp);

export class FirebaseCartService {
  /**
   * Get user's cart from Firestore
   */
  static async getCart(userId: string): Promise<CartItem[]> {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      return cartSnap.data().items || [];
    }
    return [];
  }

  /**
   * Save cart to Firestore
   */
  static async saveCart(userId: string, items: CartItem[]): Promise<void> {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, {
      userId,
      items,
      updatedAt: Timestamp.now(),
      version: Date.now(),
    }, { merge: true });
  }

  /**
   * Subscribe to cart changes (real-time sync)
   */
  static subscribeToCart(
    userId: string, 
    onUpdate: (items: CartItem[]) => void
  ): () => void {
    const cartRef = doc(db, 'carts', userId);
    
    const unsubscribe = onSnapshot(cartRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data().items || []);
      }
    });
    
    return unsubscribe;
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId: string): Promise<void> {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, {
      userId,
      items: [],
      updatedAt: Timestamp.now(),
      version: Date.now(),
    });
  }
}
```

### 4.3 Firebase Service - Order Operations

```typescript
// src/lib/firebase/orders.ts

import { 
  collection,
  doc, 
  getDoc, 
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';

const db = getFirestore(firebaseApp);

export interface CreateOrderData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: 'pickup' | 'lalamove';
  pickupLocation?: { id: string; name: string; address: string };
  deliveryAddress?: { address: string; lat: number; lng: number; name: string; phone: string };
  lalamoveQuotationId?: string;
  paymentMethod: 'cod' | 'gcash' | 'card';
  notes?: string;
}

export class FirebaseOrdersService {
  /**
   * Generate human-readable order number
   */
  private static generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MASH-${dateStr}-${random}`;
  }

  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData): Promise<string> {
    const ordersRef = collection(db, 'orders');
    const orderNumber = this.generateOrderNumber();
    const orderId = `${data.userId}-${Date.now()}`;
    const orderRef = doc(ordersRef, orderId);
    
    const order: FirestoreOrder = {
      id: orderId,
      orderNumber,
      ...data,
      paymentStatus: 'pending',
      status: 'pending_approval',
      statusHistory: [{
        status: 'pending_approval',
        timestamp: Timestamp.now(),
        updatedBy: data.userId,
        note: 'Order placed, awaiting seller approval',
      }],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(orderRef, order);
    return orderId;
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string): Promise<FirestoreOrder[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreOrder);
  }

  /**
   * Get single order
   */
  static async getOrder(orderId: string): Promise<FirestoreOrder | null> {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    return snap.exists() ? (snap.data() as FirestoreOrder) : null;
  }

  /**
   * Subscribe to order updates (real-time)
   */
  static subscribeToOrder(
    orderId: string,
    onUpdate: (order: FirestoreOrder | null) => void
  ): () => void {
    const orderRef = doc(db, 'orders', orderId);
    return onSnapshot(orderRef, (snap) => {
      onUpdate(snap.exists() ? (snap.data() as FirestoreOrder) : null);
    });
  }

  /**
   * Get all pending orders (for admin/seller)
   */
  static async getPendingOrders(): Promise<FirestoreOrder[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('status', '==', 'pending_approval'),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreOrder);
  }

  /**
   * Approve order (admin/seller)
   */
  static async approveOrder(orderId: string, adminId: string): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const order = orderSnap.data() as FirestoreOrder;
      if (order.status !== 'pending_approval') {
        throw new Error('Order is not pending approval');
      }
      
      const newHistory = [...order.statusHistory, {
        status: 'approved' as OrderStatus,
        timestamp: Timestamp.now(),
        updatedBy: adminId,
        note: 'Order approved by seller',
      }];
      
      transaction.update(orderRef, {
        status: 'approved',
        statusHistory: newHistory,
        approvedBy: adminId,
        approvedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
  }

  /**
   * Reject order (admin/seller)
   */
  static async rejectOrder(
    orderId: string, 
    adminId: string, 
    reason: string
  ): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const order = orderSnap.data() as FirestoreOrder;
      const newHistory = [...order.statusHistory, {
        status: 'rejected' as OrderStatus,
        timestamp: Timestamp.now(),
        updatedBy: adminId,
        note: `Rejected: ${reason}`,
      }];
      
      transaction.update(orderRef, {
        status: 'rejected',
        statusHistory: newHistory,
        rejectionReason: reason,
        updatedAt: Timestamp.now(),
      });
    });
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    updatedBy: string,
    note?: string
  ): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const order = orderSnap.data() as FirestoreOrder;
      const newHistory = [...order.statusHistory, {
        status: newStatus,
        timestamp: Timestamp.now(),
        updatedBy,
        note,
      }];
      
      transaction.update(orderRef, {
        status: newStatus,
        statusHistory: newHistory,
        updatedAt: Timestamp.now(),
      });
    });
  }
}
```

### 4.4 Updated CartContext with Firebase Sync

```typescript
// src/contexts/CartContext.tsx - Key additions

// Add Firebase sync when user is authenticated
useEffect(() => {
  if (!user?.id) return;
  
  // Subscribe to Firebase cart changes
  const unsubscribe = FirebaseCartService.subscribeToCart(user.id, (firebaseItems) => {
    // Merge with local cart (local wins for new items)
    setItems(prevItems => {
      // If Firebase has items and local is empty, use Firebase
      if (prevItems.length === 0 && firebaseItems.length > 0) {
        return firebaseItems;
      }
      // Otherwise keep local (it will sync back to Firebase)
      return prevItems;
    });
  });
  
  return () => unsubscribe();
}, [user?.id]);

// Sync to Firebase whenever cart changes
useEffect(() => {
  if (!user?.id || !isLoaded) return;
  
  // Debounce Firebase writes
  const timeout = setTimeout(() => {
    FirebaseCartService.saveCart(user.id, items);
  }, 500);
  
  return () => clearTimeout(timeout);
}, [items, user?.id, isLoaded]);
```

---

## 🗺️ Phase 5: Lalamove Delivery with Google Maps

### 5.1 Google Maps Address Picker Component

```typescript
// src/components/checkout/AddressPicker.tsx

"use client";

import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface AddressPickerProps {
  onAddressSelect: (address: {
    formattedAddress: string;
    lat: number;
    lng: number;
    components: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  }) => void;
  defaultValue?: string;
}

export function AddressPicker({ onAddressSelect, defaultValue }: AddressPickerProps) {
  const [address, setAddress] = useState(defaultValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places'],
      });

      const google = await loader.load();
      
      // Initialize map centered on Metro Manila
      if (mapRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 14.5995, lng: 120.9842 }, // Manila
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });

        markerRef.current = new google.maps.Marker({
          map: mapInstanceRef.current,
          draggable: true,
        });

        // Handle marker drag
        markerRef.current.addListener('dragend', async () => {
          const position = markerRef.current?.getPosition();
          if (position) {
            await reverseGeocode(position.lat(), position.lng());
          }
        });

        // Handle map click
        mapInstanceRef.current.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            markerRef.current?.setPosition(e.latLng);
            await reverseGeocode(e.latLng.lat(), e.latLng.lng());
          }
        });
      }

      // Initialize autocomplete
      if (inputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'ph' },
          fields: ['formatted_address', 'geometry', 'address_components'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            mapInstanceRef.current?.setCenter({ lat, lng });
            mapInstanceRef.current?.setZoom(16);
            markerRef.current?.setPosition({ lat, lng });
            
            setAddress(place.formatted_address || '');
            
            onAddressSelect({
              formattedAddress: place.formatted_address || '',
              lat,
              lng,
              components: extractAddressComponents(place.address_components),
            });
          }
        });
      }
    };

    initMap();
  }, [onAddressSelect]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const place = response.results[0];
        setAddress(place.formatted_address);
        onAddressSelect({
          formattedAddress: place.formatted_address,
          lat,
          lng,
          components: extractAddressComponents(place.address_components),
        });
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractAddressComponents = (components?: google.maps.GeocoderAddressComponent[]) => {
    if (!components) return {};
    
    const getComponent = (type: string) => 
      components.find(c => c.types.includes(type))?.long_name;
    
    return {
      street: getComponent('route') || getComponent('street_address'),
      city: getComponent('locality') || getComponent('administrative_area_level_2'),
      state: getComponent('administrative_area_level_1'),
      zipCode: getComponent('postal_code'),
    };
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter delivery address..."
          className="pl-10"
        />
      </div>
      
      <div 
        ref={mapRef} 
        className="h-[300px] w-full rounded-lg border"
      />
      
      <p className="text-sm text-muted-foreground">
        💡 Tip: Click on the map or drag the marker to set your exact location
      </p>
    </div>
  );
}
```

### 5.2 Lalamove Quote Component

```typescript
// src/components/checkout/LalamoveQuote.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Truck, Clock, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LalamoveQuoteProps {
  pickupAddress: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryAddress: {
    lat: number;
    lng: number;
    address: string;
    name: string;
    phone: string;
  };
  onQuoteReceived: (quote: {
    quotationId: string;
    price: number;
    distance: string;
    estimatedTime: string;
  }) => void;
}

export function LalamoveQuote({ 
  pickupAddress, 
  deliveryAddress, 
  onQuoteReceived 
}: LalamoveQuoteProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<{
    quotationId: string;
    price: number;
    distance: string;
    estimatedTime: string;
  } | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!deliveryAddress.lat || !deliveryAddress.lng) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/lalamove/quotation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: 'MOTORCYCLE', // Smallest vehicle for mushrooms
            stops: [
              {
                coordinates: {
                  lat: pickupAddress.lat.toString(),
                  lng: pickupAddress.lng.toString(),
                },
                address: pickupAddress.address,
              },
              {
                coordinates: {
                  lat: deliveryAddress.lat.toString(),
                  lng: deliveryAddress.lng.toString(),
                },
                address: deliveryAddress.address,
              },
            ],
            item: {
              weight: 'LESS_THAN_3_KG',
              categories: ['FOOD_DELIVERY'],
            },
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          const quoteData = {
            quotationId: data.data.quotationId,
            price: parseFloat(data.data.priceBreakdown.total),
            distance: `${data.data.distance.value} ${data.data.distance.unit}`,
            estimatedTime: '30-45 mins', // Lalamove doesn't provide ETA in quote
          };
          
          setQuote(quoteData);
          onQuoteReceived(quoteData);
        } else {
          setError(data.message || 'Failed to get delivery quote');
        }
      } catch (err) {
        setError('Unable to get delivery quote. Please try again.');
        console.error('Lalamove quote error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuote();
  }, [pickupAddress, deliveryAddress, onQuoteReceived]);

  if (loading) {
    return (
      <Card className="p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Getting delivery quote...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Lalamove Same-Day Delivery</p>
            <div className="flex items-center gap-4 text-sm text-green-700">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {quote.distance}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quote.estimatedTime}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(quote.price)}
          </p>
          <p className="text-xs text-green-600">Delivery Fee</p>
        </div>
      </div>
    </Card>
  );
}
```

---

## 👨‍💼 Phase 6: Admin/Seller Order Approval

### 6.1 Order Status Flow

```
                                    ┌──────────────┐
                                    │   CREATED    │
                                    └──────┬───────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │   PENDING_APPROVAL    │◄─── Order placed by buyer
                               └───────────┬───────────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
                 ┌──────────┐      ┌──────────────┐    ┌───────────┐
                 │ APPROVED │      │   REJECTED   │    │ CANCELLED │
                 └────┬─────┘      └──────────────┘    └───────────┘
                      │                   │                  │
                      │                   │                  │
                      ▼                   ▼                  ▼
              ┌───────────────┐      (End State)        (End State)
              │  PROCESSING   │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        │ (Pickup)    │             │ (Delivery)
        ▼             │             ▼
┌─────────────────┐   │    ┌─────────────┐
│ READY_FOR_PICKUP│   │    │   SHIPPED   │◄─── Lalamove order created
└────────┬────────┘   │    └──────┬──────┘
         │            │           │
         ▼            │           ▼
   ┌───────────┐      │    ┌───────────┐
   │ COMPLETED │◄─────┘    │ DELIVERED │
   └───────────┘           └─────┬─────┘
                                 │
                                 ▼
                          ┌───────────┐
                          │ COMPLETED │
                          └───────────┘
```

### 6.2 Seller Dashboard - Pending Orders

```typescript
// src/app/(seller)/seller/orders/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { FirebaseOrdersService, FirestoreOrder } from '@/lib/firebase/orders';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, Truck, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let fetchedOrders: FirestoreOrder[];
      
      if (activeTab === 'pending') {
        fetchedOrders = await FirebaseOrdersService.getPendingOrders();
      } else {
        // For now, get all orders (in production, add pagination)
        fetchedOrders = await FirebaseOrdersService.getAllOrders();
        if (activeTab === 'approved') {
          fetchedOrders = fetchedOrders.filter(o => 
            !['pending_approval', 'rejected', 'cancelled'].includes(o.status)
          );
        }
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    if (!user?.id) return;
    
    try {
      await FirebaseOrdersService.approveOrder(orderId, user.id);
      toast.success('Order approved!');
      loadOrders();
    } catch (error) {
      console.error('Failed to approve order:', error);
      toast.error('Failed to approve order');
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !user?.id) return;
    
    try {
      await FirebaseOrdersService.rejectOrder(orderId, user.id, reason);
      toast.success('Order rejected');
      loadOrders();
    } catch (error) {
      console.error('Failed to reject order:', error);
      toast.error('Failed to reject order');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!user?.id) return;
    
    try {
      await FirebaseOrdersService.updateOrderStatus(orderId, newStatus, user.id);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval
            {orders.filter(o => o.status === 'pending_approval').length > 0 && (
              <Badge className="ml-2 bg-yellow-500">
                {orders.filter(o => o.status === 'pending_approval').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Active Orders</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onApprove={() => handleApprove(order.id)}
                  onReject={() => handleReject(order.id)}
                  onUpdateStatus={(status) => handleUpdateStatus(order.id, status)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📦 Phase 7: Updated Checkout Page

### 7.1 New Checkout Flow Structure

```typescript
// src/app/(shop)/checkout/page.tsx - New structure

export default function CheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Step 1: Delivery Method (Pickup or Lalamove)
  // Step 2: Contact Info + Address (if delivery)
  // Step 3: Payment & Review
  
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'lalamove'>('pickup');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [lalamoveQuote, setLalamoveQuote] = useState<LalamoveQuote | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  
  // ... rest of implementation
}
```

### 7.2 Delivery Method Selection (Step 1)

```tsx
// Step 1: Delivery Method
<div className="space-y-4">
  <h2 className="text-xl font-semibold">Choose Delivery Method</h2>
  
  {/* Pickup Option */}
  <Card 
    className={cn(
      "p-4 cursor-pointer transition-all",
      deliveryMethod === 'pickup' && "border-primary ring-2 ring-primary"
    )}
    onClick={() => setDeliveryMethod('pickup')}
  >
    <div className="flex items-center gap-4">
      <MapPin className="h-8 w-8 text-primary" />
      <div className="flex-1">
        <h3 className="font-medium">Pickup (Free)</h3>
        <p className="text-sm text-muted-foreground">
          Pick up your order at our location
        </p>
      </div>
      <RadioButton checked={deliveryMethod === 'pickup'} />
    </div>
    
    {deliveryMethod === 'pickup' && (
      <div className="mt-4 pt-4 border-t">
        <Label>Select Pickup Location</Label>
        <Select value={pickupLocation} onValueChange={setPickupLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Choose location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">
              MASH Main Hub - Caloocan City
            </SelectItem>
            <SelectItem value="bgc">
              MASH BGC Pickup Point - Taguig
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
  </Card>
  
  {/* Delivery Option */}
  <Card 
    className={cn(
      "p-4 cursor-pointer transition-all",
      deliveryMethod === 'lalamove' && "border-primary ring-2 ring-primary"
    )}
    onClick={() => setDeliveryMethod('lalamove')}
  >
    <div className="flex items-center gap-4">
      <Truck className="h-8 w-8 text-primary" />
      <div className="flex-1">
        <h3 className="font-medium">Same-Day Delivery (Lalamove)</h3>
        <p className="text-sm text-muted-foreground">
          Get it delivered to your doorstep today
        </p>
      </div>
      <RadioButton checked={deliveryMethod === 'lalamove'} />
    </div>
    
    {deliveryMethod === 'lalamove' && (
      <div className="mt-4 pt-4 border-t space-y-4">
        <AddressPicker 
          onAddressSelect={(addr) => setDeliveryAddress(addr)}
          defaultValue={deliveryAddress?.formattedAddress}
        />
        
        {deliveryAddress && (
          <LalamoveQuote
            pickupAddress={MASH_PICKUP_LOCATION}
            deliveryAddress={deliveryAddress}
            onQuoteReceived={setLalamoveQuote}
          />
        )}
      </div>
    )}
  </Card>
</div>
```

---

## 🧪 Implementation Phases & Tickets

### Phase 4: Firebase Integration (Estimated: 4-6 hours)

| Ticket | Title | Priority | Estimate |
|--------|-------|----------|----------|
| #16 | Set up Firestore with security rules | 🔴 Critical | 1h |
| #17 | Create FirebaseCartService | 🔴 Critical | 1.5h |
| #18 | Create FirebaseOrdersService | 🔴 Critical | 2h |
| #19 | Update CartContext with Firebase sync | 🔴 Critical | 1.5h |

### Phase 5: Lalamove + Maps (Estimated: 4-5 hours)

| Ticket | Title | Priority | Estimate |
|--------|-------|----------|----------|
| #20 | Create AddressPicker component | 🔴 Critical | 2h |
| #21 | Create LalamoveQuote component | 🔴 Critical | 1.5h |
| #22 | Update checkout with delivery selection | 🔴 Critical | 1.5h |

### Phase 6: Order Approval (Estimated: 3-4 hours)

| Ticket | Title | Priority | Estimate |
|--------|-------|----------|----------|
| #23 | Create seller orders dashboard page | 🔴 Critical | 2h |
| #24 | Add approve/reject functionality | 🔴 Critical | 1h |
| #25 | Add order status update flow | 🟠 High | 1h |

### Phase 7: Order Tracking (Estimated: 2-3 hours)

| Ticket | Title | Priority | Estimate |
|--------|-------|----------|----------|
| #26 | Create order confirmation page | 🟠 High | 1h |
| #27 | Create order tracking page | 🟠 High | 1.5h |
| #28 | Add real-time order status updates | 🟡 Medium | 1h |

### Phase 8: Polish & Testing (Estimated: 2-3 hours)

| Ticket | Title | Priority | Estimate |
|--------|-------|----------|----------|
| #29 | Add toast notifications for order updates | 🟡 Medium | 0.5h |
| #30 | E2E testing: full checkout flow | 🟡 Medium | 1.5h |
| #31 | Mobile responsiveness check | 🟡 Medium | 1h |

---

## 🔐 Firebase Security Rules

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Carts collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isAdmin());
      
      // Users can create orders
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      // Only admins/sellers can update orders
      allow update: if request.auth != null && isAdmin();
    }
    
    // Helper function to check admin status
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SELLER', 'GROWER'];
    }
  }
}
```

---

## ✅ Success Criteria

### MVP Complete When:
- [ ] User can add products to cart
- [ ] Cart syncs to Firebase for logged-in users
- [ ] User can select Pickup or Lalamove delivery
- [ ] Lalamove shows real-time delivery quote
- [ ] Google Maps address picker works
- [ ] Order is saved to Firebase with `pending_approval` status
- [ ] Seller can see pending orders in dashboard
- [ ] Seller can approve/reject orders
- [ ] Order status updates reflect in buyer's view

### Nice to Have:
- [ ] Email notifications for order status changes
- [ ] Push notifications for mobile
- [ ] Lalamove driver tracking integration
- [ ] Order history with filtering
- [ ] Reorder functionality

---

## 📁 Files to Create/Modify

### New Files
```
src/lib/firebase/cart.ts         - Cart Firestore service
src/lib/firebase/orders.ts       - Orders Firestore service
src/components/checkout/AddressPicker.tsx
src/components/checkout/LalamoveQuote.tsx
src/components/checkout/DeliveryMethodSelector.tsx
src/components/checkout/OrderSummaryCard.tsx
src/app/(seller)/seller/orders/page.tsx
src/app/(shop)/order/[orderId]/page.tsx
```

### Modified Files
```
src/contexts/CartContext.tsx     - Add Firebase sync
src/app/(shop)/checkout/page.tsx - Complete rewrite
src/lib/firebase/index.ts        - Export new services
```

---

## 🚀 Quick Start

1. **Install Google Maps package** (if not installed):
   ```bash
   npm install @googlemaps/js-api-loader
   ```

2. **Add environment variables**:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
   ```

3. **Enable Firestore in Firebase Console**:
   - Go to Firebase Console → Firestore Database
   - Create database in production mode
   - Add security rules from above

4. **Start implementation with Phase 4 (Firebase)**

---

**Document Version:** 2.0  
**Last Updated:** December 16, 2025  
**Author:** AI Assistant (GitHub Copilot)
