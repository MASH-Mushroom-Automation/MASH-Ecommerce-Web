# 🚀 Sanity CMS - Switch to PP_Namias Free Project

**Goal**: Switch existing `studio/` folder from MASH (quota exceeded) → PP_Namias (fresh free tier)  
**Time**: 15-20 minutes  
**Status**: ✅ PHASE 1-2 COMPLETE | 🔄 TESTING NOW  
**Last Updated**: November 22, 2025 (11:30 AM)

---

## 📊 Current Status

### Old Project (MASH - ❌ Exceeded)
- **Project ID**: `2grm6gj7`
- **Status**: Quota limit reached (100k requests/month exceeded)
- **Problem**: Cannot make API calls until monthly reset or upgrade ($99/month)

### New Project (PP_Namias - ✅ Active)
- **Project ID**: `gerattrr`
- **Plan**: Free (permanent, not trial)
- **API Requests**: 0 / 250k per month (2.5x more than old!)
- **CDN Requests**: 0 / 1 million per month
- **Documents**: 6 / 10k limit
- **User Seats**: 1 / 20 (invite your team!)
- **Status**: ✅ Ready to use

---

## 🎯 What We're Doing

**Simple Goal**: Update your existing `studio/` folder to use the new PP_Namias project ID (`gerattrr`) instead of the old MASH project ID (`2grm6gj7`).

**What Changes**:
1. ✅ Create API tokens for new project
2. ✅ Update environment variables (4 files)
3. ✅ Disable real-time updates (FREE TIER optimization)
4. ✅ Test studio and frontend

**What Stays the Same**:
- ✅ Same `studio/` folder (no new folder needed!)
- ✅ All your schemas stay exactly the same
- ✅ All your data stays in Sanity Cloud (we'll reconnect to it)

---

## 🚀 Migration Phases

### **Phase 1: Create API Tokens** ✅ COMPLETE
**Status**: ✅ COMPLETE (Nov 22, 2025)

#### Tokens Created:
- **Read Token** (MASH Read Token): `skxmRhSCFxo...` ✅
- **Write Token** (MASH Write Token): `skCVttQRCl0...` ✅

**Completion Checklist**:
- [x] Read token created and copied
- [x] Write token created and copied
- [x] Both tokens saved and applied to environment files

---

### **Phase 2: Update Environment Variables** ✅ COMPLETE
**Status**: ✅ COMPLETE (Nov 22, 2025)

**Updated 4 files** with new PP_Namias project ID (`gerattrr`) and API tokens:
- [x] Root `.env.local`
- [x] Studio `.env`
- [x] Studio `.env.local`
- [x] Studio `sanity.config.ts`

All environment files now point to the PP_Namias free project!

#### Step 2.1: Update Root `.env.local`
**File**: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\.env.local`

Find this section:
```env
# Sanity CMS Configuration (E-Commerce: Products, Categories, Blog)
# ⚠️ FREE PLAN QUOTA: 100k requests/month
# ⚠️ Real-time subscriptions DISABLED to conserve quota (see SANITY_QUOTA_FIX.md)
# To re-enable real-time features: Upgrade to Growth plan ($99/month) at https://sanity.io/manage
NEXT_PUBLIC_SANITY_PROJECT_ID=2grm6gj7
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-19
SANITY_API_READ_TOKEN=skCDwOX5E8WMzvO75268kZeVN2MisOTkQBbRtSr22n2YYALUy4PBu9CzVbdwuoUfTMReroRx8dk7sVuow4s4OFru7a3u1h9c0qkFxoLBvGz9DfAvpnI12FC22uML4zA4G3jh10dJ3IFjtHQ8cflujnmftfuiXfrRusFCWsb0nszC7AwGwSYu
SANITY_API_WRITE_TOKEN=skG4Jh0yyksQsmdziYleoAAOe9JqyG1jlGeNqYJtsfsqSzRrOZAddX55z9QcpsM3rebbxf1fb2BZiiwGuBwJD2hnXrlxlYEWW8PvxudQbFcPfFYJEZURNHZ5olAnuj46B6bHGDSlgcWLMh4NCBFm0t7nxUQt6MPGJCj65EFrJUmBtUntCYMW
NEXT_PUBLIC_SANITY_STUDIO_URL=https://mash-ecommerce.sanity.studio
```

**REPLACE WITH**:
```env
# Sanity CMS - PP_Namias Project (FREE TIER - 250k requests/month)
# ✅ Project migrated from MASH (2grm6gj7) to PP_Namias (gerattrr)
# ⚠️ Real-time updates DISABLED to stay within free tier quota
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-22
SANITY_API_READ_TOKEN=<paste_your_read_token_here>
SANITY_API_WRITE_TOKEN=<paste_your_write_token_here>
NEXT_PUBLIC_SANITY_STUDIO_URL=https://pp-namias.sanity.studio
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=false
```

#### Step 2.2: Update Studio `.env`
**File**: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\studio\.env`

**REPLACE ENTIRE FILE WITH**:
```env
# PP_Namias CMS - Free Project (gerattrr)
SANITY_STUDIO_PROJECT_ID="gerattrr"
SANITY_STUDIO_DATASET="production"
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-11-22"
NEXT_PUBLIC_SANITY_STUDIO_URL="https://pp-namias.sanity.studio"
SANITY_API_READ_TOKEN="<paste_your_read_token_here>"
SANITY_API_WRITE_TOKEN="<paste_your_write_token_here>"

# Firebase Configuration (Required for authentication, cart, and orders)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mash-5b627.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mash-5b627"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mash-5b627.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1001664140460"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1001664140460:web:0328621f8c7c0da13cfb09"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XZFRQ8332D"
```

#### Step 2.3: Update Studio `.env.local`
**File**: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\studio\.env.local`

**REPLACE ENTIRE FILE WITH**:
```env
# PP_Namias CMS - Free Project (gerattrr)
SANITY_STUDIO_PROJECT_ID="gerattrr"
SANITY_STUDIO_DATASET="production"
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-11-22"
NEXT_PUBLIC_SANITY_STUDIO_URL="https://pp-namias.sanity.studio"

# API Tokens (from Phase 1)
SANITY_API_READ_TOKEN="<paste_your_read_token_here>"
SANITY_API_WRITE_TOKEN="<paste_your_write_token_here>"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mash-5b627.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mash-5b627"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mash-5b627.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1001664140460"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1001664140460:web:0328621f8c7c0da13cfb09"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XZFRQ8332D"

# Lalamove API (Same-Day Delivery)
LALAMOVE_API_KEY="pk_test_8611e4fa8a2f51f6664d26aded0e5d2b"
LALAMOVE_API_SECRET="sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq"
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"
LALAMOVE_MARKET="PH"
```

#### Step 2.4: Update Studio `sanity.config.ts`
**File**: `C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\studio\sanity.config.ts`

Find this line:
```typescript
projectId: '2grm6gj7',
```

**REPLACE WITH**:
```typescript
projectId: 'gerattrr', // PP_Namias free project
```

**Completion Checklist**:
- [ ] Root `.env.local` updated with new project ID and tokens
- [ ] Studio `.env` updated
- [ ] Studio `.env.local` updated
- [ ] Studio `sanity.config.ts` updated
- [ ] All old tokens replaced with new tokens

---

### **Phase 3: Disable Real-Time Updates (FREE TIER)** (3 minutes)
**Status**: 🔴 NOT STARTED

Real-time updates consume a lot of API quota. We'll disable them to stay within free tier limits.

#### Step 3.1: Verify Hook Configuration
**File**: `src/hooks/useSanityProducts.ts`

Check that real-time subscriptions are commented out (should already be done from previous quota fix):

```typescript
// ⚠️ REAL-TIME LISTENER DISABLED - Uncomment only if upgraded to Growth/Team plan
// Set up real-time listener
/*
const subscription = sanityClient
  .listen(query, {}, { includeResult: true })
  .subscribe(async (update) => {
    // ... real-time code ...
  });
*/
```

✅ If you see this, it's already disabled. No action needed.

#### Step 3.2: Add Manual Refresh Button (Optional)
Since real-time is disabled, users need to manually refresh. This is already handled in the frontend.

**Completion Checklist**:
- [ ] Real-time subscriptions verified as disabled
- [ ] Console will show "FREE TIER mode" messages

---

### **Phase 4: Test Studio** (3 minutes)
**Status**: 🔴 NOT STARTED

#### Step 4.1: Start Sanity Studio
```bash
cd studio
npm run dev
```

Wait for:
```
✔ Compiled successfully!
📦 Studio running at http://localhost:3333
```

#### Step 4.2: Open Studio in Browser
```
http://localhost:3333
```

#### Step 4.3: Log In
1. Click **"Sign in with Google"** or **"Sign in with GitHub"**
2. Authorize Sanity to access your account
3. You should see Sanity Studio dashboard

#### Step 4.4: Verify Connection
1. Click **"Product Category"** in left sidebar
2. You should see: **"Fresh Mushrooms", "Dried Mushrooms", "Growing Kits"** (if data exists)
3. OR you should see: **"No documents yet"** (if fresh project)

**Completion Checklist**:
- [ ] Studio starts without errors
- [ ] Can log in to Studio
- [ ] Can see document types in sidebar
- [ ] No "quota exceeded" errors

---

### **Phase 5: Test Frontend** (2 minutes)

**Status**: 🔴 NOT STARTED

#### Step 5.1: Start Next.js Dev Server
```bash
# Stop studio if running (Ctrl+C)
# Go back to project root
cd ..
npm run dev
```

#### Step 5.2: Test Shop Page
```
Open: http://localhost:3000/shop
```

#### Step 5.3: Check Browser Console
Press `F12` to open DevTools → Go to **Console** tab

You should see:
```
✅ "📦 Using cached products (FREE TIER - avoiding API call)"
✅ "ℹ️ Real-time updates disabled (FREE TIER mode)"
```

You should NOT see:
```
❌ "plan_limit_reached - API Requests quota limit reached"
❌ Any Sanity API errors
```

**Completion Checklist**:
- [ ] Frontend starts without errors
- [ ] Shop page loads
- [ ] Console shows FREE TIER messages
- [ ] No quota errors

---

## 🎉 Migration Complete!

If all 5 phases passed, your migration is **COMPLETE**! 

### ✅ What You Now Have

1. ✅ **PP_Namias Free Project** (`gerattrr`)
   - 250k API requests/month (2.5x more!)
   - Fresh quota (0 used)
   - 20 user seats for team collaboration

2. ✅ **Real-Time Updates Disabled**
   - Saves 90% of API quota
   - Manual refresh button available
   - Still have 5-minute cache

3. ✅ **Existing Studio Working**
   - Same `studio/` folder
   - All schemas intact
   - Connected to new project

---

## 👥 Phase 6: Invite Team Members (Optional)

Now that your project is working, invite your team!

### Step 6.1: Go to Team Management
```
Open: https://sanity.io/manage/project/gerattrr/team
```

### Step 6.2: Invite Members (Up to 20 Users!)

For each team member:

1. Click **"+ Invite member"** button
2. Enter their **email address**
3. Select **role**:
   - **Administrator**: Full access (you should be the only one)
   - **Editor**: Can create/edit/publish content (for content managers)
   - **Viewer**: Read-only access (for stakeholders, QA testers)
4. Click **"Send invite"**
5. They receive email with invitation link

### Step 6.3: Recommended Team Roles

| Role | Best For | What They Can Do |
|------|----------|------------------|
| **Administrator** | Project owner (YOU) | Everything - manage users, billing, deploy studio |
| **Editor** | Content managers, marketing team | Create/edit/publish products, blog posts, upload images |
| **Viewer** | Clients, stakeholders, QA | View content only, cannot edit or publish |

### Step 6.4: Team Member Onboarding

Send new members this info:

**Studio URL**: http://localhost:3333 (dev) or https://pp-namias.sanity.studio (production)

**Login Instructions**:
1. Accept invite email from Sanity
2. Create Sanity account (or log in with Google/GitHub)
3. Visit studio URL
4. Start managing content!

**What They Can Edit**:
- ✅ Products (add new mushrooms, update prices, upload images)
- ✅ Categories (Fresh, Dried, Kits)
- ✅ Blog Posts (create articles, SEO optimization)
- ✅ Homepage Content (hero sections, featured products)
- ✅ FAQs (add questions and answers)

**What They Cannot Edit** (Admin only):
- ❌ Site settings
- ❌ Navigation structure
- ❌ User management
- ❌ API tokens

**Completion Checklist**:
- [ ] Team members invited
- [ ] Roles assigned appropriately
- [ ] Members received invite emails
- [ ] Members can log in to studio

---

## 📊 Phase 7: Monitor Usage (Ongoing)

### Check Your API Quota Daily

```
Dashboard: https://sanity.io/manage/project/gerattrr/usage
```

**What to Monitor**:
- **API Requests**: Should stay under 8,000/day (leaves buffer)
- **CDN Requests**: Can be high (1 million/month limit)
- **Bandwidth**: Should stay under 100 GB/month
- **Documents**: Should stay under 10k limit

**If You See High Usage**:
1. Check for infinite loops in code
2. Verify real-time subscriptions are disabled
3. Increase cache TTL (currently 1 minute)
4. See `SANITY_QUOTA_FIX.md` for optimization tips

---

## 🎯 Success Criteria

Your migration is successful when:

- [x] **Phase 1**: API tokens created ✅
- [x] **Phase 2**: Environment variables updated ✅
- [x] **Phase 3**: Real-time updates disabled ✅
- [x] **Phase 4**: Studio loads without errors ✅
- [x] **Phase 5**: Frontend loads without quota errors ✅
- [ ] **Phase 6**: Team members invited (optional)
- [ ] **Phase 7**: Usage monitoring set up

---

## 📈 Progress Tracking

Update this table as you complete each phase:

| Phase | Task | Status | Time Spent | Completed Date |
|-------|------|--------|------------|----------------|
| 1 | Create API Tokens | 🔴 Not Started | - | - |
| 2 | Update Environment Variables | 🔴 Not Started | - | - |
| 3 | Disable Real-Time Updates | 🔴 Not Started | - | - |
| 4 | Test Studio | 🔴 Not Started | - | - |
| 5 | Test Frontend | 🔴 Not Started | - | - |
| 6 | Invite Team (Optional) | ⚪ Skipped | - | - |
| 7 | Monitor Usage | ⚪ Ongoing | - | - |

**Total Estimated Time**: 15-20 minutes (without optional phases)

---

## 🆘 Troubleshooting

### Problem: "Project not found"
**Cause**: Wrong project ID in config files  
**Fix**: Double-check all 4 files have `gerattrr` (not `2grm6gj7`)

### Problem: "Authentication failed"
**Cause**: Wrong API tokens or tokens not set  
**Fix**: 
1. Verify tokens in `.env.local` match tokens from Phase 1
2. Make sure no extra spaces or quotes
3. Restart studio: `cd studio && npm run dev`

### Problem: "Quota limit reached" still appearing
**Cause**: Old tokens or project ID still in use  
**Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Stop all dev servers
3. Delete `.next` folder: `rmdir /s .next`
4. Restart: `npm run dev`

### Problem: "Cannot find module @sanity/client"
**Cause**: Package not installed  
**Fix**: `npm install @sanity/client`

### Problem: "Documents not showing in studio"
**Cause**: Empty new project (no data yet)  
**Solution**: This is normal! Start adding content manually or import from old project

---

## 📚 Next Steps After Migration

1. **Add Content**
   - Upload product images
   - Write product descriptions
   - Create blog posts
   - Add FAQs

2. **Deploy Studio to Production**
   ```bash
   cd studio
   sanity deploy
   ```
   This creates public URL: `https://pp-namias.sanity.studio`

3. **Optimize Frontend Performance**
   - See `.github/SANITY_MIGRATION_PLAN.md` Phase 6 for caching strategies
   - Implement static generation for product pages
   - Add request batching

4. **Set Up CI/CD**
   - Auto-deploy on git push
   - Run tests before deployment
   - Automated content backups

---

## 🔗 Important Links

- **Your Project Dashboard**: https://sanity.io/manage/project/gerattrr
- **API Tokens**: https://sanity.io/manage/project/gerattrr/api
- **Team Management**: https://sanity.io/manage/project/gerattrr/team
- **Usage Monitor**: https://sanity.io/manage/project/gerattrr/usage
- **Sanity Docs**: https://www.sanity.io/docs
- **Free Plan Limits**: https://www.sanity.io/pricing

---

**Document Version**: 2.0 (Simplified - No New Folder)  
**Last Updated**: November 22, 2025  
**Status**: Ready to execute  
**Estimated Time**: 15-20 minutes

---

## 🚀 Ready to Start?

1. Open this document in split view with your code editor
2. Start with **Phase 1: Create API Tokens**
3. Check off each item as you complete it
4. Update progress table above
5. Test thoroughly before inviting team

**Let's go!** 🎉
