# 🚨 SANITY TOKEN FIX - QUICK ACTION CARD

**Status**: 🔴 BLOCKING ALL IMPORTS  
**Fix Time**: 5 minutes  
**Impact**: Unblocks 66 documents (variants, bundles, reviews)

---

## ⚡ 3-STEP FIX

### Step 1: Generate New Token (2 min)
1. Open: https://www.sanity.io/manage/personal/project/gerattrr/api
2. Click "+ Add API Token"
3. Settings:
   - Name: `MASH Write Token - Full Permissions`
   - Permissions: **Editor** (NOT Viewer!)
4. Click "Add Token"
5. **Copy the token** (starts with `sk...`)

### Step 2: Update Tokens (2 min)
Open these files and paste your new token:

**File 1: `.env.local`** (lines 51-53)
```env
SANITY_API_WRITE_TOKEN=sk_YOUR_NEW_TOKEN_HERE
SANITY_AUTH_TOKEN=sk_YOUR_NEW_TOKEN_HERE
```

**File 2: `studio/.env.local`** (lines 14-15)
```env
SANITY_API_WRITE_TOKEN="sk_YOUR_NEW_TOKEN_HERE"
SANITY_AUTH_TOKEN="sk_YOUR_NEW_TOKEN_HERE"
```

### Step 3: Test & Resume (1 min)
```powershell
# Test connection
node scripts\sanity\test-connection.js

# Should show ✅ Connected to Sanity successfully

# Resume imports
node scripts\sanity\import-variants.js
node scripts\sanity\import-bundles.js
node scripts\sanity\import-reviews.js
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Generated new token with **Editor** permissions
- [ ] Updated `SANITY_API_WRITE_TOKEN` in `.env.local`
- [ ] Updated `SANITY_AUTH_TOKEN` in `.env.local`
- [ ] Updated `SANITY_API_WRITE_TOKEN` in `studio/.env.local`
- [ ] Updated `SANITY_AUTH_TOKEN` in `studio/.env.local`
- [ ] Ran `test-connection.js` → ✅ PASS
- [ ] All imports now working!

---

## 📖 Detailed Guide

See: `.github/SANITY_TOKEN_FIX.md` for complete troubleshooting

---

## 🎯 After Fix - Complete Imports

Run these commands to finish CMS setup:

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Phase 6: Variants (15 min)
node scripts\sanity\import-variants.js
node scripts\sanity\verify-variants.js

# Phase 7: Relationships (15 min)
node scripts\sanity\link-relationships.js

# Phase 8: Bundles (10 min)
node scripts\sanity\import-bundles.js

# Phase 9: Reviews (15 min)
node scripts\sanity\import-reviews.js

# Final verification
node scripts\sanity\run-all-tests.js
```

**Total Time**: 55 minutes to complete all imports

---

## ⚠️ Why This Happened

Your original token was created before document types like `productBundle`, `review`, and `productVariant` existed. Sanity tokens are **permission-scoped at creation time**, so the old token doesn't have `create` permission for these new types.

**Solution**: Generate fresh token that includes all current schema types.

---

**Need Help?** See full guide: `.github/SANITY_TOKEN_FIX.md`
