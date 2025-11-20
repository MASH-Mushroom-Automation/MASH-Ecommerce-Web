# 🍄 MASH E-Commerce - Complete Sanity CMS Workflow

**Last Updated:** November 21, 2025 - 9:00 AM  
**Your Complete Guide:** Sanity CMS → Frontend → Same-Day Delivery  
**Status:** 🔴 **URGENT:** Complete Phase 3 (Images) + Phase 4 (References) NOW!

---

## 📊 **QUICK PROGRESS TRACKER** (Update as you go!)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Phase 1: Schema Structure        100% ✅ COMPLETE
✅ Phase 2: Data Population          100% ✅ COMPLETE  
✅ Phase 2.5: Schema Enhancements    100% ✅ COMPLETE
🔴 Phase 3: Product Images           0% ⏳ DO NOW (30 min)
🔴 Phase 4: Link References          0% ⏳ DO NOW (45 min)
⏸️  Phase 5: Frontend Integration     0% 🔜 NEXT
⏸️  Phase 6: Lalamove Same-Day        0% 🚚 DELIVERY
⏸️  Phase 7: Testing & Launch         0% 🧪 TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  TIME LEFT TO COMPLETE: ~2.5 hours (manageable today!)
```

**✅ UPDATE THIS:** When you complete a task:
- Change `0%` → `100%` 
- Change `⏳ DO NOW` → `✅ COMPLETE`
- Add completion time in Session Log (bottom of document)

---

## 🎯 **WHAT TO DO RIGHT NOW** (Next 75 Minutes)

### **Step 1: Add Product Images** (30 minutes) 🖼️

**Why:** Products with images get 3x more clicks and conversions

**Tools Needed:**
- Sanity Studio (http://localhost:3333)
- 15 mushroom product images (see sources below)

**Instructions:**

```bash
# 1. Start Sanity Studio (if not running)
cd studio
npm run dev
# Opens at: http://localhost:3333
```

**For EACH of your 15 products:**

1. Click **"Products"** in left sidebar
2. Select product (e.g., "Fresh Oyster Mushrooms")
3. Scroll to **"Product Image"** field (main image)
4. Click **"Upload"** or drag image file
5. **Adjust crop/hotspot** → Click + drag blue circle to center of focus point
6. Add **Alt Text** (SEO): `"Fresh oyster mushrooms in wicker basket"`
7. Scroll to **"Additional Images"** field (gallery)
8. Click **"+ Add Item"** → Upload 2-4 more images
9. Click **"Publish"** button (green, top right corner)
10. ✅ Mark as complete in checklist below

**Image Sources (Free):**
- **Unsplash**: https://unsplash.com/s/photos/mushrooms
- **Pexels**: https://www.pexels.com/search/mushrooms/
- **Pixabay**: https://pixabay.com/images/search/mushrooms/
- **Your Own**: Take photos of actual products

**Image Requirements:**
| Requirement | Specification |
|-------------|---------------|
| **Format** | JPG, PNG, or WebP |
| **Size** | Minimum 1200x1200px (square ratio ideal) |
| **Quality** | High resolution, sharp focus |
| **File Size** | < 2MB (Sanity auto-optimizes) |
| **Lighting** | Bright, natural light, white background preferred |
| **Content** | Close-up of mushrooms, clear details visible |

**✅ CHECKLIST:** Mark [x] when image added + published

- [ ] 1. Fresh Oyster Mushrooms (main + 3 gallery)
- [ ] 2. Fresh Shiitake Mushrooms  
- [ ] 3. Fresh Enoki Mushrooms
- [ ] 4. King Oyster Mushrooms
- [ ] 5. White Button Mushrooms
- [ ] 6. Portobello Mushrooms
- [ ] 7. Premium Dried Shiitake
- [ ] 8. Dried Wood Ear
- [ ] 9. Lion's Mane (Fresh)
- [ ] 10. Oyster Growing Kit
- [ ] 11. Shiitake Growing Kit
- [ ] 12. Gourmet Bundle
- [ ] 13. Starter Bundle
- [ ] 14. Chef's Bundle
- [ ] 15. Family Pack Bundle

**After all images added:**
```bash
# Test on frontend
npm run dev
# Open: http://localhost:3000/shop
# Verify: All products show images
```

---

### **Step 2: Link Related Products & Bundles** (45 minutes) 🔗

**Why:** Increases average order value by 35% with smart product recommendations

**Current Status:** Your products have `"No items"` in:
- Suggested Products (You May Also Like)
- Related Products
- Complementary Products (Frequently Bought Together)
- Related Bundles

**This is NORMAL!** Sanity reference fields need manual linking.

**Instructions for EACH Product:**

1. Open product in Sanity Studio (http://localhost:3333)
2. Scroll to **"Suggested Products"** section
3. Click **"+ Add Item"** button
4. **Search for product** by typing name (e.g., "shiitake")
5. Click product to add → Repeat 3-5 times
6. Scroll to **"Complementary Products"** (Frequently Bought Together)
7. Add 2-3 products often bought together
8. Scroll to **"Related Bundles"**
9. Search and add 1-2 relevant bundles
10. Click **"Publish"** (top right)

**⚡ SMART SUGGESTIONS BY PRODUCT:**

#### **Fresh Mushrooms → Suggest Other Fresh + Kits**

**1. Fresh Oyster Mushrooms**
- **Suggested:** Shiitake, Enoki, King Oyster, Button, Lion's Mane
- **Complementary:** Shiitake, Garlic (if you have), Butter (if you have)
- **Bundles:** Starter Bundle, Gourmet Bundle

**2. Fresh Shiitake Mushrooms**
- **Suggested:** Oyster, Enoki, Lion's Mane, Dried Shiitake, Shiitake Kit
- **Complementary:** Oyster, Soy Sauce (if you have)
- **Bundles:** Gourmet Bundle, Chef's Bundle

**3. Fresh Enoki Mushrooms**
- **Suggested:** Oyster, Shiitake, King Oyster, Button, Wood Ear
- **Complementary:** Ramen noodles (if you have), Shiitake
- **Bundles:** Starter Bundle, Family Pack

**4. King Oyster Mushrooms**
- **Suggested:** Oyster, Portobello, Lion's Mane, Shiitake
- **Complementary:** Oyster, Portobello, Olive Oil (if you have)
- **Bundles:** Gourmet Bundle, Chef's Bundle

**5. White Button Mushrooms**
- **Suggested:** Portobello, Shiitake, Oyster, Enoki
- **Complementary:** Portobello, Oyster, Cheese (if you have)
- **Bundles:** Starter Bundle, Family Pack

**6. Portobello Mushrooms**
- **Suggested:** Button, King Oyster, Lion's Mane, Shiitake
- **Complementary:** Button, King Oyster, Balsamic vinegar (if you have)
- **Bundles:** Gourmet Bundle, Chef's Bundle

#### **Dried Mushrooms → Suggest Other Dried + Fresh Alternatives**

**7. Premium Dried Shiitake**
- **Suggested:** Fresh Shiitake, Dried Wood Ear, Lion's Mane, Shiitake Kit
- **Complementary:** Wood Ear, Fresh Shiitake
- **Bundles:** Chef's Bundle, Family Pack

**8. Dried Wood Ear**
- **Suggested:** Dried Shiitake, Fresh Shiitake, Enoki, Oyster
- **Complementary:** Dried Shiitake, Fresh Shiitake
- **Bundles:** Starter Bundle, Family Pack

#### **Growing Kits → Suggest Fresh + Other Kits**

**9. Oyster Growing Kit**
- **Suggested:** Fresh Oyster, Shiitake Kit, Lion's Mane Kit (if you have), King Oyster
- **Complementary:** Fresh Oyster, Shiitake Kit
- **Bundles:** Starter Bundle, Gourmet Bundle

**10. Shiitake Growing Kit**
- **Suggested:** Fresh Shiitake, Oyster Kit, Dried Shiitake, Lion's Mane
- **Complementary:** Fresh Shiitake, Oyster Kit
- **Bundles:** Gourmet Bundle, Chef's Bundle

#### **Bundles → Suggest Individual Products + Other Bundles**

**11. Starter Bundle (Oyster + Button + Enoki)**
- **Suggested:** Fresh Oyster, Button, Enoki, Gourmet Bundle
- **Complementary:** Family Pack, Oyster Kit
- **Bundles:** Gourmet Bundle, Family Pack

**12. Gourmet Bundle (Shiitake + King Oyster + Lion's Mane)**
- **Suggested:** Fresh Shiitake, King Oyster, Lion's Mane, Chef's Bundle
- **Complementary:** Chef's Bundle, Shiitake Kit
- **Bundles:** Chef's Bundle, Starter Bundle

**13. Chef's Bundle (Portobello + Shiitake + Dried Shiitake)**
- **Suggested:** Portobello, Shiitake, Dried Shiitake, Gourmet Bundle
- **Complementary:** Gourmet Bundle, King Oyster
- **Bundles:** Gourmet Bundle, Family Pack

**14. Family Pack (Oyster + Button + Shiitake + Enoki)**
- **Suggested:** Fresh Oyster, Button, Shiitake, Enoki, Starter Bundle
- **Complementary:** Starter Bundle, Gourmet Bundle
- **Bundles:** Starter Bundle, Gourmet Bundle

**15. Lion's Mane (Fresh)**
- **Suggested:** King Oyster, Shiitake, Oyster, Portobello, Gourmet Bundle
- **Complementary:** King Oyster, Shiitake
- **Bundles:** Gourmet Bundle, Chef's Bundle

**✅ CHECKLIST:** Mark [x] when references linked + published

- [ ] 1. Fresh Oyster (5 suggested + 2 complementary + 2 bundles)
- [ ] 2. Shiitake (5 + 2 + 2)
- [ ] 3. Enoki (5 + 2 + 2)
- [ ] 4. King Oyster (4 + 3 + 2)
- [ ] 5. Button (4 + 3 + 2)
- [ ] 6. Portobello (4 + 3 + 2)
- [ ] 7. Dried Shiitake (4 + 2 + 2)
- [ ] 8. Dried Wood Ear (4 + 2 + 2)
- [ ] 9. Lion's Mane (5 + 2 + 2)
- [ ] 10. Oyster Kit (4 + 2 + 2)
- [ ] 11. Shiitake Kit (4 + 2 + 2)
- [ ] 12. Starter Bundle (4 + 2 + 2)
- [ ] 13. Gourmet Bundle (4 + 2 + 2)
- [ ] 14. Chef's Bundle (4 + 2 + 2)
- [ ] 15. Family Pack (4 + 2 + 2)

**After all references linked:**
- Test on frontend: `http://localhost:3000/product/[any-product]`
- Scroll to "You May Also Like" section
- Verify products appear
- ✅ Update progress bar to 100%

---

## 🛍️ **COMPLETE E-COMMERCE FLOW** (Your Roadmap)

This is the **complete customer journey** from discovery to delivery:

### **Phase A: Product Discovery** ✅ (95% Complete)

**Customer Actions:**
1. Visits `https://mash.ph` (your domain)
2. Sees hero section with featured products (Sanity CMS)
3. Clicks "Shop Now" → Lands on `/shop`
4. Filters by category (Fresh, Dried, Kits)
5. Searches "shiitake" → Sees matching products
6. Clicks product → Views product detail page

**Your Implementation Status:**
- [x] Sanity CMS schema structure (100%)
- [x] 15 products populated with data (100%)
- [x] Categories (3) created (100%)
- [x] Product variants (15) created (100%)
- [x] Reviews (45) imported (100%)
- [ ] Product images uploaded (0% - DO NOW)
- [ ] Related products linked (0% - DO NOW)
- [x] Frontend product listing page (`/shop`) (100%)
- [x] Frontend product detail page (`/product/[id]`) (100%)
- [x] Search & filter functionality (100%)

**Next Steps:**
1. ✅ Add product images (30 min)
2. ✅ Link suggested/related products (45 min)
3. ✅ Test product pages show images + suggestions

---

### **Phase B: Add to Cart & Checkout** ✅ (90% Complete)

**Customer Actions:**
1. Clicks "Add to Cart" on product page
2. Selects variant (weight, size) if applicable
3. Cart icon shows item count (red badge)
4. Clicks cart icon → Views cart summary
5. Adjusts quantities, removes items
6. Clicks "Proceed to Checkout"
7. Enters shipping address (or selects saved address)
8. Sees delivery options:
   - **Same-Day Delivery** (Lalamove) - ₱150-₱300
   - **Standard Delivery** (3-5 days) - ₱50
   - **Pickup** (Free)
9. Enters payment details
10. Reviews order summary
11. Clicks "Place Order"

**Your Implementation Status:**
- [x] Cart functionality (localStorage-based) (100%)
- [x] Checkout page (`/checkout`) (100%)
- [x] Address management (`/profile/addresses`) (100%)
- [x] Order summary components (100%)
- [ ] Lalamove API integration (0% - Phase 6)
- [ ] Payment gateway integration (50% - needs testing)
- [x] Order creation API endpoint (100%)

**Next Steps:**
1. ⏸️ Test checkout flow with mock data
2. ⏸️ Integrate Lalamove API (Phase 6)
3. ⏸️ Connect payment gateway (GCash, PayMaya, Credit Card)

---

### **Phase C: Same-Day Delivery (Lalamove)** 🚚 (0% - Phase 6)

**How It Works:**

```
ORDER PLACED → LALAMOVE API → DRIVER ASSIGNED → PICKUP → DELIVERY
   (Customer)     (Your Backend)    (Lalamove)      (Your Store)  (Customer)
      ↓                 ↓                ↓              ↓            ↓
   Checkout        Calculate        Notify         Package       Deliver
   Complete        Delivery Fee     Driver         Mushrooms     to Door
                   Based on                        with Ice
                   Distance                        Pack
```

**Lalamove Integration Steps:**

1. **Sign up for Lalamove Business Account**
   - URL: https://www.lalamove.com/ph/business
   - Get API credentials (Sandbox + Production)

2. **Install Lalamove SDK**
   ```bash
   npm install @lalamove/sdk
   ```

3. **Configure in Backend** (`MASH-Backend/src/services/delivery.service.ts`)
   ```typescript
   import Lalamove from '@lalamove/sdk';
   
   const lalamove = new Lalamove({
     apiKey: process.env.LALAMOVE_API_KEY,
     apiSecret: process.env.LALAMOVE_API_SECRET,
     environment: 'production', // or 'sandbox'
     region: 'PH', // Philippines
   });
   
   // Calculate delivery quote
   async function getDeliveryQuote(origin, destination, items) {
     const quote = await lalamove.calculateQuotation({
       serviceType: 'MOTORCYCLE', // or 'CAR' for bulk orders
       stops: [
         { location: origin }, // Your store address
         { location: destination }, // Customer address
       ],
       deliveries: items.map(item => ({
         weight: item.deliveryWeight.packageWeight,
         dimensions: item.deliveryWeight.packageDimensions,
       })),
     });
     return quote.priceBreakdown.total; // ₱150-₱300 typical
   }
   ```

4. **Display Delivery Options in Checkout**
   - Show "Same-Day Delivery (Lalamove)" option
   - Calculate delivery fee in real-time based on address
   - Show estimated delivery time (e.g., "Delivered by 6:00 PM today")

5. **Create Delivery Order When Customer Completes Purchase**
   ```typescript
   async function createDeliveryOrder(order) {
     const delivery = await lalamove.createOrder({
       quotationId: order.lalamoveQuotationId,
       sender: {
         stopId: 'your-store-stop-id',
         name: 'MASH Mushroom Farm',
         phone: '+639123456789',
       },
       recipients: [{
         stopId: 'customer-stop-id',
         name: order.customerName,
         phone: order.customerPhone,
         address: order.deliveryAddress,
         remarks: 'Perishable - Handle with care. Keep refrigerated.',
       }],
       items: order.items.map(item => ({
         quantity: item.quantity,
         weight: item.deliveryWeight.packageWeight,
         categories: ['FOOD'],
         handlingInstructions: ['KEEP_UPRIGHT', 'FRAGILE'],
       })),
     });
     
     // Track delivery in real-time
     return delivery.orderId; // Save to database
   }
   ```

6. **Track Delivery in Real-Time**
   - Use Lalamove webhook to get driver location updates
   - Show customer live tracking on order page
   - Send SMS/email when driver is nearby

**Sanity CMS Fields for Lalamove (Already in Product Schema):**

```typescript
deliveryOptions: {
  sameDayDeliveryEligible: true, // Can be delivered same-day?
  deliveryZones: ['metro-manila', 'quezon-city'], // Where available
  perishable: true, // Special handling for fresh mushrooms
  deliveryNotes: "Keep refrigerated. Handle with care.",
}

deliveryWeight: {
  packageWeight: 0.5, // kg (500g package)
  packageDimensions: {
    length: 25, // cm
    width: 20,  // cm  
    height: 10, // cm
  }
}
```

**Cost Estimate:**
- **Motorcycle Delivery** (< 5kg): ₱150-₱200
- **Car Delivery** (5-20kg): ₱250-₱350
- **Distance Factor**: +₱10 per km beyond 5km

**Timeline for Phase 6:**
- [ ] Sign up Lalamove Business (15 min)
- [ ] Get API credentials (5 min)
- [ ] Install SDK in backend (10 min)
- [ ] Implement quote calculation (2 hours)
- [ ] Implement order creation (2 hours)
- [ ] Test in sandbox environment (1 hour)
- [ ] Add frontend UI for delivery options (1 hour)
- [ ] Test end-to-end flow (1 hour)
- **Total:** ~8 hours

---

### **Phase D: Order Management & Tracking** ⏸️ (70% Complete)

**Customer Actions:**
1. Receives order confirmation email
2. Gets SMS with tracking link
3. Visits `/profile/order-history`
4. Sees order status:
   - **Processing** (payment confirmed)
   - **Out for Delivery** (driver assigned)
   - **Delivered** (completed)
5. Clicks "Track Order" → Sees live map (if Lalamove)
6. Receives delivery → Marks as complete
7. Leaves review on product page

**Your Implementation Status:**
- [x] Order history page (`/profile/order-history`) (100%)
- [x] Order status tracking (100%)
- [x] Email notifications (50% - needs email service)
- [ ] SMS notifications (0% - needs Twilio/Semaphore)
- [ ] Live delivery tracking map (0% - Phase 6)
- [x] Review submission form (100%)
- [x] Review display on product pages (100%)

**Next Steps:**
1. ⏸️ Set up email service (SendGrid, AWS SES)
2. ⏸️ Integrate SMS (Twilio or Semaphore API)
3. ⏸️ Add live tracking map (Lalamove SDK)

---

### **Phase E: Seller Dashboard** ⏸️ (80% Complete)

**Grower/Seller Actions:**
1. Logs in to `/seller` dashboard
2. Views analytics:
   - Today's orders
   - Revenue this month
   - Top-selling products
   - Low stock alerts
3. Manages inventory:
   - Updates stock quantities
   - Marks products unavailable
   - Adds new products
4. Processes orders:
   - Views new orders
   - Marks as "Ready for Pickup" (Lalamove driver)
   - Marks as "Shipped" (standard delivery)
5. Manages products:
   - Edits product details
   - Uploads new images
   - Updates prices

**Your Implementation Status:**
- [x] Seller dashboard layout (100%)
- [x] Analytics widgets (90% - needs real data)
- [x] Order management table (100%)
- [x] Inventory management (80% - needs backend API)
- [x] Product management (100%)
- [ ] Lalamove pickup scheduling (0% - Phase 6)

**Next Steps:**
1. ⏸️ Connect analytics to real order data
2. ⏸️ Implement inventory API endpoints
3. ⏸️ Add Lalamove pickup scheduling

---

## 📋 **ENHANCED PRODUCT SCHEMA GUIDE**

Your Sanity product schema now includes **25+ fields** across 8 categories:

### **1. Basic Product Information** ✅

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Product name (e.g., "Fresh Oyster Mushrooms") |
| `slug` | slug | ✅ | URL-friendly identifier (auto-generated) |
| `description` | text | ✅ | Full product description (5-10 sentences) |
| `image` | image | ✅ | Main product image (1200x1200px recommended) |
| `images` | array[image] | ⬜ | Additional gallery images (2-6 images) |
| `category` | reference | ✅ | Category (Fresh, Dried, Kits) |
| `sku` | string | ⬜ | Stock Keeping Unit (e.g., "MUSH-OYS-250G") |

### **2. Pricing & Promotions** ✅

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `price` | number | ✅ | Regular price in PHP (₱) |
| `isOnPromo` | boolean | ⬜ | Is product on promotion? |
| `promoType` | string | ⬜ | `percentage` or `fixed` |
| `promoPercentage` | number | ⬜ | Discount % (e.g., 20 for 20% off) |
| `promoPrice` | number | ⬜ | Fixed promotional price |
| `promoEndDate` | datetime | ⬜ | When promotion expires |
| `compareAtPrice` | number | ⬜ | Original price for display |

**Example:**
```
Regular Price: ₱350
Promo Type: percentage
Promo Percentage: 22
→ Customer pays: ₱273 (22% off)
→ Shows: "₱273 (was ₱350) 🏷️ 22% OFF"
```

### **3. Inventory Management** ✅

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | number | ✅ | Current stock quantity |
| `inventory.quantityInStock` | number | ⬜ | Duplicate for tracking |
| `inventory.lowStockThreshold` | number | ⬜ | Alert when stock < this (default: 10) |
| `inventory.trackInventory` | boolean | ⬜ | Enable/disable tracking |
| `inventory.allowBackorders` | boolean | ⬜ | Allow orders when out of stock? |
| `inventory.stockHistory` | array | ⬜ | Automatic stock change log |
| `isAvailable` | boolean | ⬜ | Available for purchase? |

**Low Stock Alert:**
```
If quantity < lowStockThreshold:
  Show "Only 5 left!" badge on product card
  Send email to admin
  Show in seller dashboard alerts
```

### **4. Product Variants** ✅

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hasVariants` | boolean | ⬜ | Does product have size/weight options? |
| `variants` | array[reference] | ⬜ | Link to `productVariant` documents |
| `weight` | number | ⬜ | Product weight in grams |
| `unit` | string | ⬜ | `g`, `kg`, `pcs`, `pack`, `box` |

**Example Variants:**
```
Product: Fresh Oyster Mushrooms
Variants:
  - 250g (₱350) [SKU: MUSH-OYS-250G]
  - 500g (₱650) [SKU: MUSH-OYS-500G]
  - 1kg (₱1200) [SKU: MUSH-OYS-1KG]
```

### **5. Smart Recommendations** 🆕 (Phase 2.5)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `suggestedProducts` | array[reference] | ⬜ | "You May Also Like" (max 8) |
| `relatedProducts` | array[reference] | ⬜ | Similar products (max 8) |
| `complementaryProducts` | array[reference] | ⬜ | "Frequently Bought Together" (max 4) |
| `relatedBundles` | array[reference] | ⬜ | Bundles including this product (max 4) |
| `productTags` | array[string] | ⬜ | Search tags (e.g., "organic", "vegan") |
| `searchKeywords` | array[string] | ⬜ | SEO keywords |

**Impact on Conversions:**
- Suggested Products: +15-25% cross-sells
- Complementary Products: +30-40% cart value
- Related Bundles: +20% bundle purchases

### **6. Freshness & Quality** 🆕 (Phase 2.5)

| Field | Type | Description |
|-------|------|-------------|
| `freshnessInfo.harvestWindow` | string | Time from harvest to delivery |
| `freshnessInfo.shelfLife` | string | How long product stays fresh |
| `freshnessInfo.storageInstructions` | text | How to store (refrigerator, paper bag) |
| `freshnessInfo.qualityIndicators` | text | What to look for (firm caps, no slime) |

**Example:**
```
Product: Fresh Oyster Mushrooms
Harvest Window: "Within 24 hours"
Shelf Life: "5-7 days (refrigerated)"
Storage: "Store in paper bag in refrigerator. Do not wash until ready to use."
Quality: "Look for firm caps, no slimy texture, fresh earthy smell, no dark spots."
```

### **7. Preparation & Cooking** 🆕 (Phase 2.5)

| Field | Type | Description |
|-------|------|-------------|
| `preparationInfo.difficultyLevel` | string | `beginner`, `intermediate`, `advanced` |
| `preparationInfo.cookingTime` | string | E.g., "10-15 minutes" |
| `preparationInfo.preparationTips` | array[string] | Step-by-step tips |
| `preparationInfo.recipeIdeas` | array[string] | Quick recipe suggestions |

**Example:**
```
Difficulty: ⭐ Beginner-Friendly
Cooking Time: "5-8 minutes"
Preparation Tips:
  1. "Gently wipe caps with damp cloth (don't soak)"
  2. "Trim tough stems"
  3. "Cook on high heat for best texture"
Recipe Ideas:
  - "Sautéed with garlic butter and parsley"
  - "Stir-fry with vegetables and oyster sauce"
  - "Add to pasta with cream sauce"
```

### **8. Same-Day Delivery (Lalamove)** 🆕 (Phase 2.5)

| Field | Type | Description |
|-------|------|-------------|
| `deliveryOptions.sameDayDeliveryEligible` | boolean | Can be delivered same-day? |
| `deliveryOptions.deliveryZones` | array[string] | Areas where available |
| `deliveryOptions.deliveryNotes` | text | Special instructions for driver |
| `deliveryOptions.perishable` | boolean | Requires special handling? |
| `deliveryWeight.packageWeight` | number | Weight in kg (for pricing) |
| `deliveryWeight.packageDimensions` | object | Length, width, height in cm |

**Example:**
```
Same-Day Eligible: ✅ Yes
Delivery Zones: Metro Manila, Quezon City, Makati, BGC
Perishable: ✅ Yes
Package Weight: 0.5 kg
Dimensions: 25cm x 20cm x 10cm
Delivery Notes: "Keep refrigerated. Handle with care - delicate caps."

→ Lalamove Delivery Fee: ₱180 (calculated by API)
```

### **9. Nutritional Highlights** 🆕 (Phase 2.5)

| Field | Type | Description |
|-------|------|-------------|
| `nutritionalHighlights` | array[string] | Key health benefits (max 5) |

**Options:**
- 🌟 High in Vitamin D
- 💪 Rich in Antioxidants
- 🥩 High Protein
- 🪶 Low Calorie
- 🛡️ Immune Support
- ❤️ Heart Healthy
- 🌱 Vegan
- 🌾 Organic
- 🧠 Brain Health
- 🦴 Bone Health

**Display on Product Cards:**
```
Fresh Shiitake Mushrooms
₱450 per 500g
🌟 High in Vitamin D | 💪 Rich in Antioxidants | 🛡️ Immune Support
```

---

## 🧪 **TESTING CHECKLIST** (Phase 7)

Before launching to production:

### **Frontend Testing**

- [ ] All product pages load with images
- [ ] Suggested products appear on product detail pages
- [ ] "Frequently Bought Together" shows on product pages
- [ ] Add to cart works for all products
- [ ] Cart updates quantity correctly
- [ ] Checkout flow completes successfully
- [ ] Delivery options display (Standard, Same-Day, Pickup)
- [ ] Payment form validates correctly
- [ ] Order confirmation email sends
- [ ] Order history shows completed orders
- [ ] Product search works (search "shiitake")
- [ ] Category filters work (Fresh, Dried, Kits)
- [ ] Mobile responsive (test on phone)
- [ ] Page load speed < 3 seconds

### **Sanity CMS Testing**

- [ ] All 15 products have main images
- [ ] Gallery images show on product pages
- [ ] Suggested products linked (3-5 per product)
- [ ] Related bundles linked (1-2 per product)
- [ ] Product tags populated (for search)
- [ ] Freshness info filled (harvest window, shelf life)
- [ ] Preparation tips added (cooking time, difficulty)
- [ ] Delivery options configured (zones, weight)
- [ ] Nutritional highlights selected (3-5 per product)
- [ ] All products published (green checkmark)

### **Lalamove Integration Testing** (Phase 6)

- [ ] Delivery quote calculates correctly (₱150-₱300)
- [ ] Quote updates when address changes
- [ ] Order creation succeeds in Lalamove sandbox
- [ ] Driver receives pickup notification
- [ ] Live tracking shows on order page
- [ ] Delivery completes in Lalamove dashboard
- [ ] Order status updates in your database
- [ ] Customer receives delivery confirmation email

### **Performance Testing**

- [ ] Homepage loads < 2 seconds
- [ ] Product listing (/shop) loads < 2 seconds
- [ ] Product detail loads < 1.5 seconds
- [ ] Images optimized (< 2MB each)
- [ ] Sanity CDN delivers images fast
- [ ] No console errors in browser
- [ ] No 404 errors for missing images

---

## 📞 **SUPPORT & RESOURCES**

### **Sanity CMS Help**
- **Docs:** https://www.sanity.io/docs
- **Community:** https://slack.sanity.io
- **YouTube:** https://www.youtube.com/c/SanityCMS

### **Lalamove API**
- **Docs:** https://developers.lalamove.com
- **Support:** business@lalamove.com
- **Sandbox:** https://sandbox.lalamove.com

### **MASH Project Files**
- **Sanity Studio:** `studio/` directory
- **Product Schema:** `studio/src/schemaTypes/documents/product.ts`
- **Frontend Shop:** `src/app/(shop)/shop/page.tsx`
- **Product Detail:** `src/app/(shop)/product/[id]/page.tsx`
- **API Client:** `src/lib/api-client.ts`
- **CMS Database:** `src/lib/cms/database.ts`

---

## 📝 **SESSION LOG** (Update after each work session)

### November 21, 2025 - 9:00 AM
**Phase:** 3 (Images) + 4 (References)  
**Time Spent:** __ hours __ minutes  
**Progress:** ___%  
**Completed:**
- [ ] Added images to __ products
- [ ] Linked references for __ products
- [ ] Tested frontend product pages

**Blockers:**
- (None / List any issues here)

**Next Session:**
- (What to work on next time)

**Notes:**
- (Any learnings, tips, or observations)

---

**⏱️ TIME TO COMPLETE ALL PHASES:** ~12-15 hours total
- ✅ Phase 1-2.5: ~6 hours (DONE - Nov 21, 8:45 AM)
- 🔴 Phase 3-4: ~1.25 hours (DO NOW - Nov 21, 8:49 AM - 10:04 AM)
- ⏸️ Phase 5-6: ~8 hours (Next session)
- ⏸️ Phase 7: ~2 hours (Testing)

**You're 50% done! Keep going! 🚀**

---

## 🎉 **WHAT YOU'VE ACCOMPLISHED SO FAR**

### **Phase 1-2.5 Complete! (Nov 21, 8:45 AM)**

✅ **CMS Schema Structure** (13 document types + 4 singletons)
- Product schema with 25+ fields across 9 categories
- Smart recommendations (suggested products, complementary products)
- Freshness tracking (harvest window, shelf life, storage)
- Same-day delivery fields (Lalamove zones, weight, dimensions)
- Preparation info (cooking time, difficulty, recipe ideas)
- SEO optimization (search keywords, nutritional highlights)

✅ **Data Population** (84 items imported)
- 3 Categories (Fresh, Dried, Kits)
- 15 Products (with full descriptions, pricing, inventory)
- 15 Product Variants (size/weight options)
- 6 Product Bundles (package deals with savings)
- 45 Customer Reviews (4.84 stars average)

✅ **Enhanced E-Commerce Features**
- Promotional pricing (percentage & fixed discount)
- Inventory management (low stock alerts, backorders)
- Product variants (multiple sizes per product)
- Bundle deals (save 18-30%)
- Review system (verified purchases, helpful votes)

### **What's Next: Phases 3 & 4 (75 minutes)**

🔴 **Phase 3: Product Images** (30 min)
- Upload main product image for 15 products
- Add 2-4 gallery images per product
- Set alt text for SEO
- Test frontend display

🔴 **Phase 4: Reference Linking** (45 min)
- Link suggested products (3-5 per product)
- Link complementary products (2-3 per product)
- Link related bundles (1-2 per product)
- Test recommendations display

### **Impact on Conversions:**

| Feature | Impact |
|---------|--------|
| Product Images | +300% clicks (products without images = 0% conversions) |
| Suggested Products | +15-25% cross-sells |
| Complementary Products | +30-40% average cart value |
| Related Bundles | +20% bundle purchases |
| Same-Day Delivery | +50% fresh mushroom sales |
| **TOTAL POTENTIAL** | **+100-200% revenue increase** |

---

## 📞 **QUICK LINKS & RESOURCES**

### **Your Project**
- **Sanity Studio**: http://localhost:3333
- **Frontend Dev**: http://localhost:3000
- **Shop Page**: http://localhost:3000/shop
- **Product Detail**: http://localhost:3000/product/[slug]

### **Documentation**
- **This Guide**: `.github/SANITY_CMS_COMPLETE_WORKFLOW.md`
- **Master Plan**: `.github/MASTER_IMPLEMENTATION_PLAN.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Product Schema**: `studio/src/schemaTypes/documents/product.ts`

### **Free Image Sources**
- Unsplash: https://unsplash.com/s/photos/mushrooms
- Pexels: https://www.pexels.com/search/mushrooms/
- Pixabay: https://pixabay.com/images/search/mushrooms/

### **Lalamove**
- Business Account: https://www.lalamove.com/ph/business
- API Docs: https://developers.lalamove.com
- Sandbox: https://sandbox.lalamove.com

---

## ✅ **YOUR ACTION PLAN FOR TODAY**

### **Right Now (8:49 AM - 10:04 AM):**

1. ✅ **Verify Phase 2.5 Complete** (2 min)
   - Open Sanity Studio (http://localhost:3333)
   - Click any product
   - Verify you see ALL enhanced fields:
     * Suggested Products
     * Complementary Products
     * Freshness Info
     * Preparation Info
     * Delivery Options
     * Nutritional Highlights

2. 🔴 **Phase 3: Add Images** (30 min - Start 8:49 AM)
   - Download 15 mushroom images
   - Upload to each product in Sanity
   - Add alt text for SEO
   - Publish each product

3. 🔴 **Phase 4: Link References** (45 min - Start 9:19 AM)
   - For each product, link suggested products
   - Link complementary products
   - Link related bundles
   - Publish each product

4. ✅ **Test & Celebrate** (5 min - 10:04 AM)
   - Open frontend (http://localhost:3000/shop)
   - Verify all products show images
   - Click any product → Check "You May Also Like"
   - Update progress bars to 100%
   - **CELEBRATE!** 🎉 You're 50% done!

### **Next Session (Schedule for next work day):**

5. ⏸️ **Phase 5: Frontend Integration** (~4 hours)
   - Connect Sanity CMS to frontend product pages
   - Display suggested products
   - Show complementary products in cart
   - Add freshness info to product cards

6. ⏸️ **Phase 6: Lalamove Integration** (~8 hours)
   - Sign up for Lalamove Business
   - Get API credentials
   - Implement delivery quote calculator
   - Add same-day delivery option to checkout
   - Test end-to-end delivery flow

7. ⏸️ **Phase 7: Testing & QA** (~2 hours)
   - Test all product pages load
   - Verify images display correctly
   - Test recommendations work
   - Check mobile responsiveness
   - Performance testing

8. ⏸️ **Phase 8: Production Deployment** (~1 hour)
   - Deploy to Vercel
   - Verify Sanity CDN working
   - Test production API
   - Launch! 🚀

---

**🎯 FOCUS FOR TODAY: Complete Phases 3 & 4 (75 minutes)**
**🎯 GOAL: 100% product catalog ready with images + recommendations**
**🎯 RESULT: Professional e-commerce site ready for customers**

**You've got this! 💪 Let's finish Phases 3 & 4!**
