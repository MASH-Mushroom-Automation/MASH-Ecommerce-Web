# MASH Platform - Data Structure Quick Reference

## 📊 Complete JSON Structure Overview

### 🍄 Product (Complete Example)
```json
{
  "id": "prod_001",
  "name": "Fresh Oyster Mushrooms",
  "slug": "fresh-oyster-mushrooms",
  "sku": "MUSH-OYS-250G",
  "description": "Fresh, organic oyster mushrooms...",
  "price": 150.00,
  "comparePrice": 180.00,
  "costPrice": 90.00,
  "stock": 50,
  "minStock": 10,
  "weight": "250g",
  "images": ["url1", "url2"],
  "categories": ["fresh-mushrooms", "organic"],
  "tags": ["bestseller", "organic", "local"],
  "growerId": "grower_001",
  "grower": "Manila Urban Farm",
  "isActive": true,
  "isFeatured": true,
  "isDeleted": false,
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-11-10T10:30:00.000Z"
}
```

**Required**: id, name, slug, price, stock, minStock, images, isActive, isFeatured, isDeleted, createdAt, updatedAt  
**Optional**: sku, description, comparePrice, costPrice, weight, categories, tags, growerId, grower

---

### 👤 User Profile (Complete Example)
```json
{
  "id": "user_001",
  "clerkId": "clerk_user_xyz123",
  "email": "juan.delacruz@example.com",
  "username": "juandc",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "avatar": "https://...",
  "phone": "+639123456789",
  "bio": "Home cook and mushroom enthusiast...",
  "role": "BUYER",
  "isActive": true,
  "twoFactorEnabled": false,
  "preferences": { /* ... */ },
  "createdAt": "2025-08-15T12:00:00.000Z",
  "updatedAt": "2025-11-10T09:15:00.000Z"
}
```

**Required**: id, email, firstName, lastName, role, isActive, createdAt, updatedAt  
**Optional**: clerkId, username, avatar, phone, bio, twoFactorEnabled, preferences

**Roles**: USER | BUYER | GROWER | ADMIN | SUPER_ADMIN

---

### 📦 Order (Complete Example)
```json
{
  "id": "order_001",
  "userId": "user_001",
  "status": "DELIVERED",
  "items": [
    {
      "id": "item_001",
      "productId": "prod_001",
      "name": "Fresh Oyster Mushrooms",
      "quantity": 2,
      "price": 150.00,
      "total": 300.00
    }
  ],
  "customer": {
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com",
    "phone": "+639123456789",
    "address": "123 Mabini Street..."
  },
  "coordination": {
    "method": "Home Delivery",
    "preferredDate": "2025-11-05",
    "preferredTime": "2:00 PM - 4:00 PM",
    "instructions": "Please call upon arrival"
  },
  "payment": {
    "method": "GCASH",
    "status": "PAID",
    "transactionId": "GCASH-20251103-ABC123"
  },
  "totals": {
    "subtotal": 650.00,
    "coordinationFee": 50.00,
    "total": 700.00
  },
  "timeline": [ /* status history */ ],
  "createdAt": "2025-11-03T10:30:00.000Z",
  "updatedAt": "2025-11-05T14:45:00.000Z"
}
```

**Order Status**: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED  
**Cancel/Refund**: CANCELLED | REFUNDED

**Payment Methods**: CASH_ON_DELIVERY | GCASH | CREDIT_CARD | DEBIT_CARD | MAYA

---

### 📍 Address (Philippines Format)
```json
{
  "id": "addr_001",
  "userId": "user_001",
  "type": "shipping",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "phone": "+639123456789",
  "street1": "123 Mabini Street",
  "street2": "Unit 4B, Sunshine Apartments",
  "barangay": "San Roque",
  "barangayCode": "137404041",
  "city": "Manila",
  "cityCode": "133900000",
  "state": "Metro Manila",
  "stateCode": "130000000",
  "region": "NCR",
  "regionCode": "130000000",
  "postalCode": "1006",
  "country": "Philippines",
  "isDefault": true,
  "createdAt": "2025-08-20T10:00:00.000Z"
}
```

**Required**: id, userId, type, firstName, lastName, phone, street1, barangay, city, state, region, postalCode, country, isDefault  
**Optional**: street2, barangayCode, cityCode, stateCode, regionCode

**Address Types**: shipping | billing | home | work

---

### 🏷️ Category
```json
{
  "id": "cat_001",
  "name": "Fresh Mushrooms",
  "slug": "fresh-mushrooms",
  "description": "Locally grown fresh mushrooms...",
  "image": "https://...",
  "parentId": null,
  "order": 1,
  "isActive": true,
  "createdAt": "2025-06-01T08:00:00.000Z"
}
```

**Common Categories**: fresh-mushrooms | dried-mushrooms | mushroom-kits | supplements | equipment

---

### 🌱 Grower Profile
```json
{
  "id": "grower_001",
  "userId": "user_002",
  "name": "Manila Urban Farm",
  "location": "Makati City, Metro Manila",
  "bio": "Pioneering urban farming...",
  "image": "https://...",
  "coverImage": "https://...",
  "specialties": ["Oyster Mushrooms", "Shiitake Mushrooms"],
  "certifications": ["Organic Certified (DA)", "GAP"],
  "coordinates": { "lat": 14.5547, "lng": 121.0244 },
  "contactEmail": "info@manilafarming.com",
  "isActive": true,
  "stats": {
    "totalProducts": 8,
    "rating": 4.8,
    "totalReviews": 156
  }
}
```

---

### 📊 Inventory
```json
{
  "productId": "prod_001",
  "stock": 50,
  "minStock": 10,
  "reservedStock": 8,
  "availableStock": 42,
  "location": "Manila Urban Farm - Warehouse A",
  "batchNumber": "BATCH-2025-11-08-001",
  "expiryDate": "2025-11-15T23:59:59.000Z",
  "lastUpdated": "2025-11-10T08:00:00.000Z"
}
```

---

### ⭐ Review
```json
{
  "id": "review_001",
  "productId": "prod_001",
  "userId": "user_001",
  "rating": 5,
  "comment": "Absolutely fresh and delicious!...",
  "images": ["https://..."],
  "verified": true,
  "helpful": 12,
  "reply": {
    "sellerId": "user_002",
    "message": "Thank you so much...",
    "date": "2025-11-06T10:00:00.000Z"
  },
  "createdAt": "2025-11-05T18:30:00.000Z"
}
```

**Rating**: 1-5 stars (integer)

---

### 🔔 Notification
```json
{
  "id": "notif_001",
  "userId": "user_001",
  "type": "order_status",
  "title": "Your order has been shipped!",
  "message": "Good news! Your order #order_001 is on its way...",
  "data": {
    "orderId": "order_001",
    "status": "SHIPPED",
    "trackingNumber": "MASH-TRACK-001"
  },
  "actionUrl": "/profile/order-history/order_001",
  "isRead": false,
  "createdAt": "2025-11-05T09:30:00.000Z"
}
```

**Notification Types**: order_status | low_stock | new_order | review_received | system

---

### 🔌 IoT Device (Optional)
```json
{
  "id": "device_001",
  "name": "Growing Chamber Alpha",
  "type": "ENVIRONMENTAL_CONTROLLER",
  "serialNumber": "MASH-GC-2025-001",
  "status": "ONLINE",
  "userId": "user_002",
  "location": "Manila Urban Farm - Chamber A",
  "firmware": "v2.3.1",
  "sensors": [
    {
      "type": "TEMPERATURE",
      "unit": "°C",
      "currentValue": 24.5
    },
    {
      "type": "HUMIDITY",
      "unit": "%",
      "currentValue": 85
    },
    {
      "type": "CO2",
      "unit": "ppm",
      "currentValue": 12500
    }
  ],
  "isActive": true
}
```

**Device Status**: ONLINE | OFFLINE | ERROR

---

## 🔑 Common Patterns

### ID Format
- Products: `prod_001`, `prod_002`
- Users: `user_001`, `user_002`
- Orders: `order_001`, `order_002`
- Growers: `grower_001`, `grower_002`

### Date Format (ISO 8601)
```
"2025-11-10T10:30:00.000Z"
```

### Price Format (PHP)
```json
"price": 150.00,  // Always 2 decimal places
"total": 300.00
```

### Philippine Phone Format
```
"+639123456789"   // +63 followed by 10 digits
```

### Image URLs
```json
"images": [
  "https://images.unsplash.com/photo-id?w=800",
  "https://placehold.co/600x400"
]
```

---

## 📁 File Locations

All example JSON files are in the `data/` folder:

```
data/
├── products/
│   ├── oyster-mushroom-fresh.json
│   ├── shiitake-mushroom-dried.json
│   └── mushroom-growing-kit.json
├── users/
│   ├── buyer-profile.json
│   └── grower-profile.json
├── orders/
│   └── order-completed.json
├── addresses/
│   ├── manila-address.json
│   └── quezon-city-address.json
├── categories/
│   ├── fresh-mushrooms.json
│   ├── dried-mushrooms.json
│   └── mushroom-kits.json
├── growers/
│   ├── manila-urban-farm.json
│   └── baguio-highland-farms.json
├── inventory/
│   └── product-stock.json
├── reviews/
│   └── verified-review.json
├── notifications/
│   ├── order-shipped.json
│   └── low-stock-alert.json
└── devices/
    └── growing-chamber-01.json
```

---

## 📚 Additional Resources

- **Full Guide**: `docs/JSON_DATA_STRUCTURE_GUIDE.md`
- **Backend Schema**: `docs/SCHEMA_REFERENCE.md`
- **TypeScript Types**: `src/types/api.ts`
- **API Reference**: `documents/API_IMPLEMENTATION_GUIDE.md`

---

**Last Updated:** November 10, 2025
