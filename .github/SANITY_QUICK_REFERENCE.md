# 🎯 Sanity CMS - Quick Execution Guide

**Date**: November 26, 2025  
**Status**: Ready to Execute (70% → 100%)  
**Time**: 115 minutes (1 hour 55 min)  
**Goal**: Complete e-commerce CMS with automated scripts

---

## 🚀 **30-SECOND START**

```powershell
# Copy-paste this entire block
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
node scripts\sanity\test-connection.js
node scripts\sanity\fix-product-images.js
node scripts\sanity\import-variants.js
node scripts\sanity\link-relationships.js
node scripts\sanity\import-bundles.js
node scripts\sanity\import-reviews.js
node scripts\sanity\run-all-tests.js
cd studio && npm run build && npm run deploy
```

---

## 📋 **7 PHASES TO COMPLETION**

| Phase | Name | Time | Command | Success Check |
|-------|------|------|---------|---------------|
| 0 | Pre-Flight | 5 min | `node scripts\sanity\test-connection.js` | Connection OK ✅ |
| 1 | Fix Images | 10 min | `node scripts\sanity\fix-product-images.js` | 15/15 images valid ✅ |
| 2 | Import Variants | 15 min | `node scripts\sanity\import-variants.js` | 15 variants created ✅ |
| 3 | Link Relationships | 15 min | `node scripts\sanity\link-relationships.js` | All products linked ✅ |
| 4 | Import Bundles | 10 min | `node scripts\sanity\import-bundles.js` | 6 bundles created ✅ |
| 5 | Import Reviews | 10 min | `node scripts\sanity\import-reviews.js` | 45 reviews created ✅ |
| 6 | Validation | 30 min | `node scripts\sanity\run-all-tests.js` | 8/8 tests pass ✅ |
| 7 | Deployment | 20 min | `cd studio && npm run deploy` | Studio live ✅ |

**Total**: 115 minutes

---

## ✅ **SUCCESS CRITERIA**

**You're done when**:

1. **84 Documents in Sanity**:
   - 3 categories
   - 15 products
   - 15 variants
   - 6 bundles
   - 45 reviews

2. **All Tests Pass**:
   - Connection test ✅
   - Document counts ✅
   - Images valid ✅
   - Category links ✅
   - Variant links ✅
   - Relationships ✅
   - Bundle links ✅
   - Review links ✅

3. **Studio Deployed**:
   - Live at: https://pp-namias.sanity.studio
   - Login works
   - All 17 document types visible
   - Can create/edit content

---

## 🆘 **QUICK TROUBLESHOOTING**

**Issue**: Image upload fails  
**Fix**: Check `SANITY_API_WRITE_TOKEN` in `.env.local`

**Issue**: Import fails with "reference not found"  
**Fix**: Run `node scripts\sanity\test-connection.js` first

**Issue**: Deployment fails  
**Fix**: `cd studio && del /s /q node_modules && npm install`

---

## 📚 **DOCUMENTATION**

**Main Guide**: `.github/SANITY_MASTER_EXECUTION_PLAN.md` (complete 700+ line guide)

**Keep These Files**:
- ✅ SANITY_MASTER_EXECUTION_PLAN.md (master reference)
- ✅ SANITY_SCHEMA_REFERENCE.md (schema docs)
- ✅ SANITY_TESTING_DEPLOYMENT.md (testing guide)

**Archive These** (outdated):
- ❌ SANITY_AUTOMATION_SUMMARY.md
- ❌ SANITY_CMS_COMPLETE_WORKFLOW.md
- ❌ SANITY_CMS_CURRENT_STATUS.md
- ❌ SANITY_CMS_MASTER_PLAN.md
- ❌ SANITY_MIGRATION_PLAN.md
- ❌ SANITY_QUICK_START.md
- ❌ SANITY_COMPLETE_ACTION_PLAN.md

---

**🎯 Start Now**: `node scripts\sanity\test-connection.js`

**⏱️ Estimated Completion**: November 26, 2025 - 4:00 PM (if started at 2:00 PM)
