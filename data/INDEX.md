# 📊 MASH Platform - Complete Data Structure Documentation

## ✅ What Has Been Created

I've created a comprehensive JSON data structure system for the MASH e-commerce platform with **18 complete example files** organized in **10 categories**.

---

## 📁 Complete File Structure

```
data/
├── README.md                           # Main documentation
├── QUICK_REFERENCE.md                  # Quick lookup guide
│
├── 📦 products/ (3 files)
│   ├── oyster-mushroom-fresh.json      # Fresh product with discount
│   ├── shiitake-mushroom-dried.json    # Dried product
│   └── mushroom-growing-kit.json       # DIY kit product
│
├── 👤 users/ (2 files)
│   ├── buyer-profile.json              # Regular customer
│   └── grower-profile.json             # Seller with 2FA
│
├── 📦 orders/ (1 file)
│   └── order-completed.json            # Full order lifecycle
│
├── 📍 addresses/ (2 files)
│   ├── manila-address.json             # Metro Manila address
│   └── quezon-city-address.json        # Alternative address
│
├── 🏷️ categories/ (3 files)
│   ├── fresh-mushrooms.json            # Fresh category
│   ├── dried-mushrooms.json            # Dried category
│   └── mushroom-kits.json              # Kits category
│
├── 🌱 growers/ (2 files)
│   ├── manila-urban-farm.json          # Urban farm profile
│   └── baguio-highland-farms.json      # Highland farm profile
│
├── 📊 inventory/ (1 file)
│   └── product-stock.json              # Stock management
│
├── ⭐ reviews/ (1 file)
│   └── verified-review.json            # 5-star review with reply
│
├── 🔔 notifications/ (2 files)
│   ├── order-shipped.json              # Shipping notification
│   └── low-stock-alert.json            # Inventory alert
│
└── 🔌 devices/ (1 file)
    └── growing-chamber-01.json         # IoT controller (optional)
```

---

## 📖 Documentation Files

### Main Documents
1. **`docs/JSON_DATA_STRUCTURE_GUIDE.md`**
   - Complete field-by-field documentation
   - Required vs optional fields
   - Enum value reference
   - Usage guidelines
   - Philippines-specific formats

2. **`data/README.md`**
   - Quick start guide
   - File index
   - Usage examples
   - Common pitfalls
   - Development tips

3. **`data/QUICK_REFERENCE.md`**
   - Condensed structure overview
   - All entities in one place
   - Common patterns
   - Quick lookup format

---

## 🎯 What Each Category Contains

### 🍄 Products (3 Examples)
- **Fresh Oyster Mushrooms** - Shows discount pricing, featured product
- **Dried Shiitake** - Premium product, medicinal category
- **Growing Kit** - Physical product with weight, educational

**Key Features:**
✅ Multiple images array
✅ Categories as array (backend format)
✅ Tags for filtering
✅ Stock management fields
✅ Grower relationship
✅ Price variants (price, comparePrice, costPrice)

### 👤 Users (2 Examples)
- **Buyer Profile** - Regular customer with preferences
- **Grower Profile** - Seller with 2FA enabled

**Key Features:**
✅ Role-based access (BUYER, GROWER)
✅ Clerk authentication integration
✅ Preferences object
✅ Notification settings
✅ Seller dashboard config

### 📦 Orders (1 Complete Example)
- **Completed Order** - Full lifecycle from PENDING to DELIVERED

**Key Features:**
✅ Complete timeline with 5 statuses
✅ Order items with line totals
✅ Customer information
✅ Coordination details (Philippines-specific)
✅ Payment information (GCash example)
✅ Price breakdown with fees

### 📍 Addresses (2 Philippines Examples)
- **Manila** - Metro Manila (NCR) format
- **Quezon City** - Alternative NCR address

**Key Features:**
✅ Philippines administrative divisions (Region → Province → City → Barangay)
✅ PSGC codes (optional)
✅ Proper phone format (+639...)
✅ Default address flag
✅ Address types (shipping, billing, home, work)

### 🏷️ Categories (3 Examples)
- **Fresh Mushrooms** - Main category
- **Dried Mushrooms** - Preserved products
- **Mushroom Kits** - DIY/Educational

**Key Features:**
✅ URL-friendly slugs
✅ Category images
✅ Parent-child hierarchy support
✅ Display order
✅ Active/inactive status

### 🌱 Growers (2 Farm Profiles)
- **Manila Urban Farm** - Urban farming, vertical systems
- **Baguio Highland Farms** - Mountain farm, organic certified

**Key Features:**
✅ Farm story and bio
✅ Specialties array
✅ Certifications
✅ GPS coordinates for map
✅ Contact information
✅ Performance statistics

### 📊 Inventory (1 Example)
- **Product Stock Management** - Real-time inventory tracking

**Key Features:**
✅ Available vs reserved stock
✅ Batch tracking
✅ Expiry dates (for perishables)
✅ Stock movement history
✅ Low stock alerts

### ⭐ Reviews (1 Example)
- **Verified 5-Star Review** - Customer review with seller reply

**Key Features:**
✅ Star rating (1-5)
✅ Review photos
✅ Verified purchase badge
✅ Helpful votes
✅ Seller response capability

### 🔔 Notifications (2 Examples)
- **Order Shipped** - Customer notification
- **Low Stock Alert** - Seller notification

**Key Features:**
✅ Notification types (order_status, low_stock, etc.)
✅ Rich data payload
✅ Action URLs
✅ Read/unread status
✅ Timestamp tracking

### 🔌 IoT Devices (1 Example)
- **Growing Chamber** - Environmental controller with sensors

**Key Features:**
✅ Multiple sensor types (temp, humidity, CO2)
✅ Real-time readings
✅ Device settings
✅ Performance statistics
✅ Online/offline status

---

## 🚀 How to Use This System

### 1. **For Learning**
- Open any JSON file to see complete data structure
- Compare required vs optional fields
- Understand relationships between entities

### 2. **For Development**
```typescript
// Import and use in your code
import productData from '@/data/products/oyster-mushroom-fresh.json';

const product: Product = productData;
```

### 3. **For Testing**
- Copy JSON files as test fixtures
- Modify values for edge case testing
- Use in unit tests

### 4. **For Database Seeding**
```typescript
// Seed database with example data
const products = [
  require('./data/products/oyster-mushroom-fresh.json'),
  require('./data/products/shiitake-mushroom-dried.json'),
  // ...
];

await prisma.product.createMany({ data: products });
```

### 5. **For API Testing**
```bash
# Test POST endpoint
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d @data/products/oyster-mushroom-fresh.json
```

---

## ⚠️ Important Notes

### Enum Formats (MUST USE UPPERCASE)
The backend requires UPPERCASE enums:

```json
✅ CORRECT:
"status": "PENDING"
"status": "CONFIRMED"
"status": "DELIVERED"
"method": "CASH_ON_DELIVERY"
"method": "GCASH"
"role": "BUYER"
"role": "GROWER"

❌ WRONG:
"status": "pending"
"method": "cod"
"role": "buyer"
```

### Date Format (ISO 8601)
```json
✅ CORRECT: "2025-11-10T10:30:00.000Z"
❌ WRONG: "2025-11-10" or "11/10/2025"
```

### Categories (Array Not String)
```json
✅ CORRECT (Backend): "categories": ["fresh-mushrooms", "organic"]
⚠️ LEGACY (Frontend): "category": "fresh-mushrooms"
```

Frontend is migrating from single string to array format.

### Philippine Address Format
Always include:
- Region (e.g., "NCR", "Region III")
- Province/State
- City/Municipality
- Barangay
- Postal Code

---

## 📊 Quick Stats

| Category | Files | Purpose |
|----------|-------|---------|
| Products | 3 | Product catalog examples |
| Users | 2 | Buyer and seller profiles |
| Orders | 1 | Complete order lifecycle |
| Addresses | 2 | Philippines address format |
| Categories | 3 | Product categorization |
| Growers | 2 | Farm/seller profiles |
| Inventory | 1 | Stock management |
| Reviews | 1 | Product review system |
| Notifications | 2 | User notifications |
| Devices | 1 | IoT integration (optional) |
| **TOTAL** | **18** | **Complete examples** |

---

## 🔗 Related Documentation

### Core References
- `docs/SCHEMA_REFERENCE.md` - Backend Prisma schema
- `src/types/api.ts` - TypeScript type definitions
- `documents/API_IMPLEMENTATION_GUIDE.md` - API contracts

### Architecture Guides
- `docs/COMPLETE_ARCHITECTURE.md` - Full file structure
- `docs/API_BACKEND_INTEGRATION_PROGRESS.md` - Integration status
- `.github/copilot-instructions.md` - AI coding guide

---

## ✨ Key Benefits

1. **Clear Structure** - See exactly what data each entity needs
2. **Real Examples** - Realistic Philippines-specific data
3. **Complete Coverage** - All major entities documented
4. **Ready to Use** - Copy and modify for your needs
5. **Type Safety** - Matches TypeScript interfaces
6. **Backend Aligned** - Follows Prisma schema format

---

## 🎯 Next Steps

1. **Review the templates** - Browse `data/` folder
2. **Read the guide** - Check `docs/JSON_DATA_STRUCTURE_GUIDE.md`
3. **Copy examples** - Use as templates for your data
4. **Test integration** - Import JSON in your code
5. **Seed database** - Populate with example data

---

## 📞 Need Help?

- **Missing a field?** Check `docs/SCHEMA_REFERENCE.md`
- **Type error?** See `src/types/api.ts`
- **API question?** Read `documents/API_IMPLEMENTATION_GUIDE.md`
- **Format issue?** Review `data/QUICK_REFERENCE.md`

---

**Created:** November 10, 2025  
**Total Files:** 18 JSON examples + 3 documentation files  
**Coverage:** 10 major entity types  
**Ready for:** Development, Testing, Database Seeding
