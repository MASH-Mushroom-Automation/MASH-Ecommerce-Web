# 🔐 Sanity API Token Permissions Fix

**Issue**: Import scripts failing with "Insufficient permissions; permission create required"  
**Root Cause**: Current API token lacks write permissions for document types  
**Solution**: Regenerate token with full Editor permissions  
**Time Required**: 5 minutes

---

## ❌ Current Error

```
Error creating document: ForbiddenError: Insufficient permissions
Permission 'create' required
Document types affected: productBundle, review, productVariant, and more
```

---

## ✅ Step-by-Step Fix (5 Minutes)

### Step 1: Access Sanity API Settings (1 min)

1. **Open Sanity Dashboard**: https://www.sanity.io/manage/personal/project/gerattrr/api
2. **Login** with your Sanity account (Google OAuth)
3. **Navigate to "API" tab** in left sidebar
4. **Click "Tokens" section**

### Step 2: Create New Token with Full Permissions (2 min)

1. **Click "+ Add API Token"** button
2. **Configure token settings**:
   ```
   Name: MASH Write Token - Full Permissions
   Permissions: Editor (NOT Viewer!)
   ```
3. **Click "Add Token"**
4. **IMPORTANT**: Copy the token immediately (shown only once)
   - Token format: `skCVttQRCl0qVx22gul6...` (long string starting with `sk`)
   - Keep this window open until you paste it below

### Step 3: Update Environment Variables (2 min)

**File 1: `.env.local` (Root Directory)**

Open file and update BOTH these lines:

```env
SANITY_API_WRITE_TOKEN="sk_PASTE_YOUR_NEW_TOKEN_HERE"
SANITY_AUTH_TOKEN="sk_PASTE_YOUR_NEW_TOKEN_HERE"
```

**File 2: `studio/.env.local` (Studio Directory)**

Open file and add this line:

```env
SANITY_AUTH_TOKEN="sk_PASTE_YOUR_NEW_TOKEN_HERE"
```

### Step 4: Verify Token Works (30 seconds)

Test connection:

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
node scripts\sanity\test-connection.js
```

**Expected Output:**
```
🧪 Testing Sanity Connection...

Test 1: Connection
   ✅ Connected to Sanity (Project: gerattrr, Dataset: production)

Test 2: Document Counts
   Categories: 3
   Products: 15
   ...

✅ All tests completed!
```

---

## 🚀 Resume Imports After Fix

Once token is updated, run these commands:

```powershell
# Phase 6: Import Variants (15 min)
node scripts\sanity\import-variants.js
node scripts\sanity\verify-variants.js

# Phase 7: Link Relationships (15 min)
node scripts\sanity\link-relationships.js

# Phase 8: Import Bundles (10 min)
node scripts\sanity\import-bundles.js

# Phase 9: Import Reviews (15 min)
node scripts\sanity\import-reviews.js
```

---

## 🔍 Troubleshooting

### Issue: "Token not found in environment"

**Solution**: Make sure you saved `.env.local` after pasting token

```powershell
# Verify environment variable is loaded
$env:SANITY_AUTH_TOKEN
# Should print your token
```

### Issue: Still getting permission errors

**Solutions**:
1. **Verify token permissions**: Go back to Sanity dashboard → API → Tokens → Check that token shows "Editor" role
2. **Try deleting old token**: Remove old tokens that might be conflicting
3. **Clear Node cache**: 
   ```powershell
   Remove-Item node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue
   ```

### Issue: Token shows but test-connection fails

**Solution**: Check project ID matches:

```env
SANITY_STUDIO_PROJECT_ID="gerattrr"  # Must match!
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
```

---

## 📋 Token Permission Checklist

Your new token MUST have these permissions:

- ✅ **Read**: View documents
- ✅ **Create**: Create new documents (productBundle, review, etc.)
- ✅ **Update**: Modify existing documents
- ✅ **Delete**: Remove documents (for cleanup scripts)
- ✅ **Publish**: Publish documents (required for Studio)

**Permission Level Required**: `Editor` (full access)  
**NOT**: `Viewer` (read-only) or `Custom` (may lack create permission)

---

## 🎯 Why This Happened

**Reason**: Sanity API tokens are **permission-scoped at creation time**

- Your original token was created before all document types existed
- New types like `productBundle`, `review`, `productVariant` added later
- Old token doesn't have `create` permission for these new types
- Solution: Generate new token that includes all current schema types

**Best Practice**: Regenerate tokens after major schema changes

---

## 📝 Post-Fix Validation

After updating token, verify all document types work:

```powershell
# Test creating each document type
node scripts\sanity\import-categories.js  # Should say "already exists"
node scripts\sanity\import-products.js    # Should say "already exists"
node scripts\sanity\import-variants.js    # Should create 15 variants ✅
node scripts\sanity\import-bundles.js     # Should create 6 bundles ✅
node scripts\sanity\import-reviews.js     # Should create 45 reviews ✅
```

**Expected Results:**
```
✅ Variants: 15/15 created
✅ Bundles: 6/6 created
✅ Reviews: 45/45 created
Total: 66 new documents added to Sanity
```

---

## 🔐 Security Notes

1. **Never commit tokens to Git**: `.env.local` is in `.gitignore` ✅
2. **Use environment-specific tokens**: Separate tokens for dev/staging/production
3. **Rotate tokens regularly**: Update every 3-6 months or after team member leaves
4. **Delete unused tokens**: Remove old tokens from Sanity dashboard after updating

---

## ✅ Success Checklist

- [ ] Opened Sanity dashboard at https://www.sanity.io/manage/personal/project/gerattrr/api
- [ ] Created new token with **Editor** permissions
- [ ] Copied token (starts with `sk`)
- [ ] Updated `SANITY_API_WRITE_TOKEN` in `.env.local`
- [ ] Updated `SANITY_AUTH_TOKEN` in `.env.local`
- [ ] Updated `SANITY_AUTH_TOKEN` in `studio/.env.local`
- [ ] Saved all files
- [ ] Ran `node scripts\sanity\test-connection.js` → ✅ PASS
- [ ] Resumed imports with new token

---

**After Fix**: Proceed to `.github/SANITY_COMPLETE_EXECUTION_GUIDE.md` to complete all remaining imports!
