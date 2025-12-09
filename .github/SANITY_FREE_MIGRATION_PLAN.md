# Sanity CMS Migration: PP_Namias Free Project

**Last Updated:** December 6, 2025  
**Status:** ✅ **MIGRATION COMPLETE**  
**Studio URL:** https://ppnamias.sanity.studio  
**Project Dashboard:** https://www.sanity.io/manage/project/gerattrr

---

## ✅ Migration Complete!

The MASH E-commerce CMS has been successfully migrated from the Growth Trial project (`xyq5fhxs`) to the PP_Namias Free project (`gerattrr`).

### What Was Done

| Task | Status | Details |
|------|--------|---------|
| **Schema Deployment** | ✅ Complete | 22 document types + 6 singletons deployed |
| **Environment Files** | ✅ Updated | `.env.local`, `studio/.env.local`, `studio/.env` |
| **Source Files** | ✅ Updated | `client.ts`, `stores.ts`, hooks, config files |
| **Scripts** | ✅ Updated | 9 migration scripts updated |
| **CLI Config** | ✅ Updated | `sanity.cli.ts` with appId for future deploys |
| **Studio Deployed** | ✅ Live | https://ppnamias.sanity.studio |

---

## 📊 Project Details

### PP_Namias Free Project

| Property | Value |
|----------|-------|
| **Project Name** | PP Namias |
| **Project ID** | `gerattrr` |
| **Organization ID** | `oBQP4vpxm` |
| **Plan** | Free (permanent) |
| **Status** | Active |
| **Dataset** | `production` (public) |
| **Studio URL** | https://ppnamias.sanity.studio |
| **App ID** | `esr18b2qp5du2mfuufq6n6ci` |

### Free Plan Includes

- ✅ Up to 20 user seats
- ✅ 2 permission roles (Administrator, Viewer)
- ✅ 2 datasets (public only)
- ✅ Unlimited content types and locales
- ✅ Compute and Agent Actions
- ✅ Hosted, real-time content database
- ✅ Live previews and visual editing tools
- ✅ **$0/month forever**

---

## 👥 Team Members

| Name | Role | Added |
|------|------|-------|
| Jhon Keneth Namias | Administrator | Aug 19, 2025 |
| VALENCIA, Ronan Renz T. | Administrator | Dec 4, 2025 |
| MASH Read Token (Robot) | Viewer | Nov 21, 2025 |
| MASH Write Token (Robot) | Editor | Nov 21, 2025 |

---

## 🔐 API Tokens

Tokens are managed at: https://www.sanity.io/manage/project/gerattrr/api#tokens

| Token Name | Permissions | Status |
|------------|-------------|--------|
| MASH Read Token | Viewer | ✅ Active |
| MASH Write Token | Editor | ✅ Active |

### Token Values (Current)

These tokens are configured in the environment files:

```env
# Read Token (Viewer permissions)
SANITY_API_READ_TOKEN="skxmRhSCFxoGkQX2Np0SYRLNSIpulPl1ow87IBBGtqrXQsfdaY3YqgX18Hr5bnUVWxijZs6qN71ugvG11EBZjFdJgGBi0y2qxDLWIaqxwDvRx8MxCZeW9wTNOWybsXGRA23kyZzVIiE15YFoDcM74ht8viMX9JlvQbeRxwFNaMHLKa9KwXRA"

# Write Token (Editor permissions)
SANITY_API_WRITE_TOKEN="skCVttQRCl0qVx22gul6MfW5PEg9CnDhWYVY8yygEHC5fmUmiYk3KRNFZcFQJHyJRcgKAO2hZxnLj1MyqsA2wI0GZFihzT7TzDm3xbmGwoeUdkG06ssL53R0TrwDVwVe9HSaJyXB1Ji3RPYAxHM7tbrBLOtdQfujmSHVr5CDRGLask9t25WG"
```

### How to Regenerate Tokens

1. Go to: https://www.sanity.io/manage/project/gerattrr/api#tokens
2. Click the token you want to regenerate
3. Click "Regenerate token"
4. Copy the new token immediately (shown only once!)
5. Update these files:
   - `.env.local` (root)
   - `studio/.env.local`
   - `studio/.env`

---

## 🌐 CORS Origins

CORS origins are managed at: https://www.sanity.io/manage/project/gerattrr/api#cors

| Origin | Credentials | Purpose | Added |
|--------|-------------|---------|-------|
| `http://localhost:5173` | Allowed | Vite development | Aug 20, 2025 |
| `http://localhost:3333` | Allowed | Sanity Studio local | Aug 20, 2025 |
| `https://ppnamias.sanity.studio` | Allowed | Deployed Studio | Aug 20, 2025 |

### Missing CORS Origins to Add

Add these for full development/production support:

| Origin | Purpose |
|--------|---------|
| `http://localhost:3001` | Next.js development (Turbopack) |
| `http://localhost:3000` | Next.js development (standard) |
| Your production URL | Production frontend |

**To add a CORS origin:**

1. Go to https://www.sanity.io/manage/project/gerattrr/api#cors
2. Click "Add CORS origin"
3. Enter the origin URL
4. Enable "Allow credentials"
5. Click "Add"

---

## 📁 Schema Structure

### Document Types (22)

| Type | Purpose |
|------|---------|
| `product` | Main product catalog (25+ fields) |
| `category` | Product categories |
| `productVariant` | Size/weight options |
| `productBundle` | Package deals |
| `review` | Customer reviews |
| `order` | Order management |
| `coupon` | Discount codes |
| `promotion` | Marketing campaigns |
| `post` | Blog posts |
| `blogCategory` | Blog categories |
| `page` | CMS pages |
| `person` | Authors/team members |
| `grower` | Mushroom growers |
| `store` | Store locations |
| `faqCategory` | FAQ categories |
| `faqItem` | FAQ items |
| `featureSection` | Feature highlights |
| `navigation` | Menu structure |
| `testimonial` | Customer testimonials |
| `banner` | Promotional banners |
| `emailCampaign` | Email marketing |
| `analytics` | Analytics tracking |

### Singleton Types (6)

| Type | Purpose |
|------|---------|
| `settings` | Global site config |
| `siteSettings` | Site-wide settings |
| `featuredProducts` | Homepage featured products |
| `heroCarousel` | Homepage hero sections |
| `aboutPage` | About page content |
| `contactPage` | Contact page content |

### Object Types (4)

| Type | Purpose |
|------|---------|
| `blockContent` | Rich text content |
| `infoSection` | Information sections |
| `callToAction` | CTA buttons |
| `link` | Internal/external links |

---

## 📍 Updated Files

### Environment Files

#### `.env.local` (Frontend Root)

```env
# Sanity CMS - PP_Namias Free Project (gerattrr)
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26
NEXT_PUBLIC_SANITY_STUDIO_URL=https://ppnamias.sanity.studio
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=false
```

#### `studio/.env.local`

```env
SANITY_STUDIO_PROJECT_ID="gerattrr"
SANITY_STUDIO_DATASET="production"
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-11-26"
NEXT_PUBLIC_SANITY_STUDIO_URL="https://ppnamias.sanity.studio"
```

#### `studio/.env`

```env
SANITY_STUDIO_PROJECT_ID="gerattrr"
SANITY_STUDIO_DATASET="production"
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-11-22"
NEXT_PUBLIC_SANITY_STUDIO_URL="https://pp-namias.sanity.studio"
```

### Source Files Updated

| File | Change |
|------|--------|
| `src/lib/sanity/client.ts` | Default fallback: `gerattrr` |
| `src/lib/sanity/stores.ts` | Default fallback: `gerattrr` |
| `src/hooks/useSanityStores.ts` | Default fallback: `gerattrr` |
| `src/hooks/useSanityGrowers.ts` | Default fallback: `gerattrr` |
| `studio/sanity.config.ts` | Default fallback: `gerattrr` |
| `studio/sanity.cli.ts` | Default fallback + appId |

### Scripts Updated

| Script | Path |
|--------|------|
| `audit-sanity-data.js` | `scripts/` |
| `verify-phase-b.js` | `scripts/` |
| `fix-product-variants-flag.js` | `scripts/` |
| `link-suggested-products.js` | `scripts/` |
| `migrate-testimonials-to-sanity.js` | `scripts/` |
| `verify-image-query.js` | `scripts/` |
| `test-frontend-query.js` | `scripts/sanity/` |
| `import-reviews.js` | `scripts/sanity/` |
| `import-bundles.js` | `scripts/sanity/` |

---

## 🧪 Testing

### Test Sanity Studio

1. **Access deployed Studio:**

   ```
   https://ppnamias.sanity.studio
   ```

2. **Login** with your Sanity account (Google/GitHub)

3. **Verify you can:**
   - View all content types in sidebar
   - Create new documents
   - Edit existing documents
   - Upload images
   - Publish changes

### Test Local Development

```bash
# Terminal 1: Start Frontend
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
npm run dev
# Opens at http://localhost:3001

# Terminal 2: Start Local Studio
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\studio"
npm run dev
# Opens at http://localhost:3333
```

### Test API Connection

```javascript
// Quick test script
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: true,
});

client.fetch('*[_type == "product"][0...5]')
  .then(products => console.log('Products:', products))
  .catch(err => console.error('Error:', err));
```

---

## 🔄 Future Deployments

To redeploy the studio after schema changes:

```bash
cd studio
npx sanity deploy
```

The `appId` is configured in `sanity.cli.ts`, so it won't prompt for hostname.

---

## 📝 Migration History

| Date | Action | Details |
|------|--------|---------|
| Aug 19, 2025 | Project Created | PP_Namias free project initialized |
| Nov 21, 2025 | Tokens Created | Read/Write tokens for API access |
| Nov 22, 2025 | Initial Migration | First migration attempt from old project |
| Dec 4, 2025 | Team Member Added | Ronan Renz T. Valencia as administrator |
| Dec 6, 2025 | **Full Migration** | MASH E-commerce schema deployed |

---

## ⚠️ Important Notes

1. **Free Tier Limitations:**
   - Real-time updates are **disabled** to save quota
   - Only 2 datasets allowed (both public)
   - 250K API calls/month (use CDN to reduce usage)

2. **CDN Usage:**
   - `useCdn: true` is set in `client.ts`
   - This caches responses and reduces API quota usage
   - For real-time updates, you'd need a paid plan

3. **Authentication:**
   - Studio login uses your personal Sanity account
   - API tokens are for programmatic access only
   - Never expose tokens in frontend code

4. **CORS:**
   - Add any new frontend URLs to CORS origins
   - Missing CORS will cause "CORS policy" errors

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Studio (Deployed)** | https://ppnamias.sanity.studio |
| **Project Dashboard** | https://www.sanity.io/manage/project/gerattrr |
| **API Tokens** | https://www.sanity.io/manage/project/gerattrr/api#tokens |
| **CORS Origins** | https://www.sanity.io/manage/project/gerattrr/api#cors |
| **Usage Stats** | https://www.sanity.io/manage/project/gerattrr/usage |
| **Datasets** | https://www.sanity.io/manage/project/gerattrr/datasets |
| **Team Members** | https://www.sanity.io/manage/project/gerattrr/members |

---

## 📞 Troubleshooting

### "Unauthorized" Error

- Check if tokens are correct in `.env.local` files
- Regenerate tokens at the API management page
- Ensure `SANITY_AUTH_TOKEN` is commented out (use personal login for deploys)

### "CORS Policy" Error

- Add the origin URL to CORS origins list
- Make sure credentials are allowed

### Studio Not Updating

- Clear browser cache
- Redeploy: `npx sanity deploy`
- Check for build errors in console

### API Quota Exceeded

- Enable CDN: `useCdn: true`
- Reduce API calls with caching
- Consider upgrading plan if needed

---

**Migration completed by:** AI Assistant  
**Verified by:** Jhon Keneth Namias  
**Date:** December 6, 2025
