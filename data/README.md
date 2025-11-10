# MASH Platform - Data Templates & Database Files

This folder contains JSON data files for the MASH e-commerce platform, including the main products database and example templates for all entities.

## 🎯 Main Database File

### **`products-database.json`** ⭐ PRIMARY PRODUCTS FILE
**Complete products database with 9 products** - This is the main file used throughout the website for displaying all products.

**Usage**:
```typescript
import productsData from '@/data/products-database.json';
const products = productsData; // All 9 products ready to use
```

Contains all products from `src/lib/api/products.ts`:
- Fresh White Oyster Mushrooms
- Mushroom Chips  
- Blue Oyster Mushrooms
- White Oyster Mushroom Growing Kit
- Crispy Mushroom Chicharon
- Bagoong Mushroom
- Blue Oyster Mushroom Growing Kit
- Premium Golden Oyster Growing Kit
- King Oyster Mushroom Growing Kit

---

## 📁 Folder Structure

```
data/
├── products-database.json    # ⭐ MAIN PRODUCTS FILE (9 products)
├── tables/                   # Complete database schema (45 tables)
├── products/                 # 3 product examples (fresh, dried, kit)
├── users/                    # 2 user profiles (buyer, grower)
├── orders/                   # 1 complete order with timeline
├── addresses/                # 2 Philippines addresses (Manila, Quezon City)
├── categories/               # 3 category examples
├── growers/                  # 2 grower farm profiles
├── inventory/                # 1 inventory management example
├── reviews/                  # 1 verified product review
├── notifications/            # 2 notification examples
└── devices/                  # 1 IoT device example (optional)
```

## 🚀 Quick Start

1. **Browse the examples** to understand data structure
2. **Copy templates** for your own data
3. **Modify values** to match your needs
4. **Use for testing** or database seeding

## 📋 File Index

### Products (3 files)
- `oyster-mushroom-fresh.json` - Fresh product with discount pricing
- `shiitake-mushroom-dried.json` - Dried/preserved product
- `mushroom-growing-kit.json` - DIY kit product

### Users (2 files)
- `buyer-profile.json` - Regular customer profile
- `grower-profile.json` - Seller/grower profile with 2FA

### Orders (1 file)
- `order-completed.json` - Complete order with all statuses

### Addresses (2 files)
- `manila-address.json` - Metro Manila shipping address
- `quezon-city-address.json` - Alternative address example

### Categories (3 files)
- `fresh-mushrooms.json` - Fresh category
- `dried-mushrooms.json` - Dried category
- `mushroom-kits.json` - Growing kits category

### Growers (2 files)
- `manila-urban-farm.json` - Urban farming profile
- `baguio-highland-farms.json` - Highland farming profile

### Inventory (1 file)
- `product-stock.json` - Stock management with movements

### Reviews (1 file)
- `verified-review.json` - 5-star review with seller reply

### Notifications (2 files)
- `order-shipped.json` - Order status notification
- `low-stock-alert.json` - Inventory alert for sellers

### Devices (1 file)
- `growing-chamber-01.json` - IoT environmental controller

## 🔑 Key Features

### All Examples Include:
✅ **Required fields** - All mandatory data present
✅ **Optional fields** - Common optional fields shown
✅ **Realistic data** - Philippines-specific examples
✅ **Proper formats** - Correct date/number/enum formats
✅ **Related data** - Shows relationships between entities
✅ **Comments** - Field descriptions in the guide

### Data Highlights:
- **Philippines addresses** with PSGC codes
- **Proper enums** - UPPERCASE format matching backend
- **Timestamps** - ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Price format** - Numbers with 2 decimal places
- **Arrays** - Multiple categories, tags, images
- **Relations** - userId, productId, growerId references

## 📖 Documentation

For detailed field descriptions and requirements, see:
- **`docs/JSON_DATA_STRUCTURE_GUIDE.md`** - Complete reference guide
- **`docs/SCHEMA_REFERENCE.md`** - Backend database schema
- **`src/types/api.ts`** - TypeScript type definitions

## 💡 Usage Examples

### Product Creation
Use `products/oyster-mushroom-fresh.json` as template:
- Copy all required fields
- Add your own images, name, description
- Set proper price, stock, categories
- Ensure `slug` is URL-friendly (lowercase, hyphens)

### Order Processing
Follow `orders/order-completed.json` timeline:
1. PENDING - Order placed
2. CONFIRMED - Seller confirms
3. PROCESSING - Being prepared
4. SHIPPED - Out for delivery
5. DELIVERED - Completed

### Address Format
For Philippines addresses, include:
- Region, Province, City, Barangay
- PSGC codes (optional but recommended)
- Proper postal code format

## ⚠️ Important Notes

### Enum Values (UPPERCASE)
❌ **Wrong**: `"status": "pending"`
✅ **Correct**: `"status": "PENDING"`

All status enums use UPPERCASE to match backend.

### Payment Methods
❌ **Wrong**: `"method": "cod"`
✅ **Correct**: `"method": "CASH_ON_DELIVERY"`

### Date Format
❌ **Wrong**: `"2025-11-10"`
✅ **Correct**: `"2025-11-10T10:30:00.000Z"`

Use ISO 8601 with timezone.

### Categories (Array vs String)
⚠️ **Frontend Migration Needed**
- Frontend currently uses: `"category": "fresh-mushrooms"`
- Backend expects: `"categories": ["fresh-mushrooms", "organic"]`

Use arrays for future compatibility.

## 🔄 Data Flow

```
1. User browses products → products/*.json
2. User adds to cart → CartItem structure
3. User places order → orders/*.json (PENDING)
4. Seller confirms → Status: CONFIRMED
5. Order fulfilled → Status: DELIVERED
6. User reviews → reviews/*.json
```

## 🛠️ Development Tips

### For Frontend Testing
```typescript
import productData from '@/data/products/oyster-mushroom-fresh.json';

// Use directly in components
const product = productData;
```

### For Database Seeding
```typescript
// Read all JSON files and insert into database
const products = [
  require('./data/products/oyster-mushroom-fresh.json'),
  require('./data/products/shiitake-mushroom-dried.json'),
  // ...
];

await prisma.product.createMany({ data: products });
```

### For API Testing
```bash
# POST request with JSON data
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d @data/products/oyster-mushroom-fresh.json
```

## 📞 Support

Questions about data structure?
- Check `docs/JSON_DATA_STRUCTURE_GUIDE.md` for field explanations
- Review `src/types/api.ts` for TypeScript interfaces
- See `documents/API_IMPLEMENTATION_GUIDE.md` for API contracts

---

**Last Updated:** November 10, 2025  
**Total Examples:** 18 JSON files across 10 categories
