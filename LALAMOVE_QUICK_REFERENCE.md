# 🚀 Lalamove API - Quick Reference Card

**Last Updated:** November 26, 2025  
**Status:** ✅ WORKING (₱64 quotation verified)

---

## ⚡ Quick Commands

```bash
# Test Lalamove API (quotation only, no charge)
node scripts/test-lalamove-delivery.js

# Expected: ✅ Quotation SUCCESS - ₱64 for 4.62km
```

---

## 📋 Working Request Schema (VERIFIED ✅)

```javascript
// POST /v3/quotations
const requestBody = {
  data: {
    language: 'en_PH',           // ✅ CRITICAL: Required for PH
    serviceType: 'MOTORCYCLE',   // ✅ FIXED: Specific vehicle type
    stops: [
      {
        coordinates: {           // ✅ FIXED: Use 'coordinates' not 'location'
          lat: '14.7217675',
          lng: '121.0383229'
        },
        address: '266 Quirino Hwy, Novaliches'
      },
      {
        coordinates: {
          lat: '14.7407171',
          lng: '121.0067588'
        },
        address: '936 Llano rd, Caloocan'
      }
    ],
    item: {
      quantity: '1',
      weight: 'LESS_THAN_3KG',
      categories: ['FOOD_DELIVERY'],
      handlingInstructions: ['KEEP_UPRIGHT']
    }
  }
};
```

---

## 🔧 Critical Fixes Applied

| Error | Fix | Status |
|-------|-----|--------|
| ERR_INVALID_LOCALE | Added `language: 'en_PH'` | ✅ FIXED |
| ERR_UNKNOWN_FIELD | Changed `location` → `coordinates` | ✅ FIXED |
| ERR_INVALID_FIELD | Changed `COURIER` → `MOTORCYCLE` | ✅ FIXED |

---

## 🚗 Vehicle Types (PH Market)

```javascript
const VEHICLE_TYPES = {
  MOTORCYCLE: 'MOTORCYCLE',  // ✅ BEST for mushrooms (< 3kg, ₱39 base)
  SEDAN: 'SEDAN',            // Small boxes (3-10kg)
  MPV: 'MPV',                // Medium boxes (10-30kg)
  VAN: 'VAN',                // Large orders (30-100kg)
  VAN1000: 'VAN1000',        // Extra large (100-500kg)
  TRUCK550: 'TRUCK550'       // Bulk delivery (500kg+)
};
```

**Recommendation:** Use `MOTORCYCLE` for fresh mushrooms (fastest + cheapest)

---

## 📍 Your Test Addresses

```javascript
// PICKUP: Paulo (Store) in Novaliches
{
  lat: '14.7217675',
  lng: '121.0383229',
  address: '266 Quirino Hwy, Novaliches, Quezon City'
}

// DROPOFF: Mary Jane (Customer) in Caloocan
{
  lat: '14.7407171',
  lng: '121.0067588',
  address: '936 Llano rd, Caloocan'
}

// Distance: 4.62 km | Cost: ₱64 | Time: ~30 min
```

---

## 🎯 Next Steps

### **Option 1: Fix Sanity Token (5 min)**
```bash
# Follow guide to regenerate token with Editor permissions
# File: .github/SANITY_TOKEN_FIX.md

# Then run imports:
node scripts/sanity/import-variants.js
node scripts/sanity/import-bundles.js
node scripts/sanity/import-reviews.js
```

### **Option 2: Start Lalamove Phase 1 (3 hours)**
```bash
# Build quotation system
# Follow: .github/LALAMOVE_INTEGRATION_COMPLETE.md (Phase 1)

# Create:
# - src/lib/lalamove/client.ts (copy from test script)
# - src/app/api/lalamove/quotation/route.ts
# - Quotation UI on checkout page
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `.github/LALAMOVE_TESTING_COMPLETE_SUMMARY.md` | Complete test results (350 lines) |
| `.github/LALAMOVE_INTEGRATION_COMPLETE.md` | Master guide (1500+ lines, 8 phases) |
| `.github/LALAMOVE_SUCCESS_REPORT.md` | Working code examples (500 lines) |
| `scripts/test-lalamove-delivery.js` | Test script (457 lines) |

---

## ❌ Common Errors → ✅ Solutions

```javascript
// ❌ ERROR: ERR_INVALID_LOCALE (422)
// ✅ FIX: Add language field
data: { language: 'en_PH', ... }

// ❌ ERROR: ERR_UNKNOWN_FIELD (400) - "location not allowed"
// ✅ FIX: Use coordinates field
stops: [{ coordinates: { lat, lng }, address: '...' }]

// ❌ ERROR: ERR_INVALID_FIELD (400) - "COURIER not valid"
// ✅ FIX: Use specific vehicle type
serviceType: 'MOTORCYCLE'

// ❌ ERROR: Quotation expired
// ✅ FIX: Place order within 10 minutes
```

---

## 🔑 Environment Variables

```env
# In .env.local (root directory)

# Lalamove API (Same-Day Delivery)
LALAMOVE_API_KEY="pk_test_8611e4fa8a2f51f6664d26aded0e5d2b"
LALAMOVE_API_SECRET="sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq"
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"  # Sandbox for testing
LALAMOVE_MARKET="PH"

# For production: Update LALAMOVE_HOST to https://rest.lalamove.com
```

---

## 🏁 Success Checklist

- [x] Test script working (₱64 quotation verified)
- [x] API errors identified and fixed (3 critical errors)
- [x] Coordinates extracted from Google Maps
- [x] Request schema documented with working examples
- [x] Troubleshooting guide created (100+ lines)
- [x] Ready for Phase 1 implementation
- [ ] **YOUR TURN:** Choose Sanity token fix OR Lalamove Phase 1

---

**🎉 TESTING COMPLETE - ALL SYSTEMS GO!** ✅

**Need Help?** Reference `.github/LALAMOVE_INTEGRATION_COMPLETE.md` for detailed implementation guide
