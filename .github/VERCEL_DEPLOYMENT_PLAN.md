# 🚀 MASH E-Commerce Vercel Deployment Plan

**Version:** 1.1  
**Created:** December 8, 2025  
**Updated:** December 10, 2025  
**Project:** MASH Mushroom E-Commerce Platform  
**Vercel Project:** https://vercel.com/mash-mushroom-automation/mash-ecommerce  
**Project ID:** `prj_T0c5MwwNkBQ4XaardQs2q5QtNfuX`  
**Repository:** https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web (Private)

---

## 📋 Table of Contents

1. [Deployment Overview](#-deployment-overview)
2. [Prerequisites Checklist](#-prerequisites-checklist)
3. [Step 1: Get Vercel Credentials](#-step-1-get-vercel-credentials)
4. [Step 2: Configure GitHub Secrets](#-step-2-configure-github-secrets)
5. [Step 3: Configure Vercel Environment Variables](#-step-3-configure-vercel-environment-variables)
6. [Step 4: Verify GitHub Actions Workflow](#-step-4-verify-github-actions-workflow)
7. [Step 5: Test Deployment](#-step-5-test-deployment)
8. [Deployment Environments](#-deployment-environments)
9. [Troubleshooting Guide](#-troubleshooting-guide)
10. [Post-Deployment Checklist](#-post-deployment-checklist)

---

## 🎯 Deployment Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                            │
│                 MASH-Mushroom-Automation/MASH-Ecommerce-Web         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GitHub Actions Workflow                         │
│                    .github/workflows/deploy-vercel.yml              │
│                                                                     │
│   ┌─────────────────┐     ┌─────────────────────────────────────┐  │
│   │  Push to main   │────▶│  Production Deployment              │  │
│   └─────────────────┘     │  https://mash-ecommerce.vercel.app  │  │
│                           └─────────────────────────────────────┘  │
│   ┌─────────────────┐     ┌─────────────────────────────────────┐  │
│   │  Pull Request   │────▶│  Preview Deployment                 │  │
│   └─────────────────┘     │  https://mash-ecommerce-*.vercel.app│  │
│                           └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Vercel Platform                            │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐│
│  │ Next.js App │  │ Edge Network │  │ Serverless Functions        ││
│  │ (Frontend)  │  │ (CDN)        │  │ (API Routes)                ││
│  └─────────────┘  └──────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
           ┌──────────────┐ ┌────────────┐ ┌──────────────┐
           │ Sanity CMS   │ │ Firebase   │ │ Lalamove API │
           │ (Content)    │ │ (Auth)     │ │ (Delivery)   │
           │ gerattrr     │ │ mash-5b627 │ │ PH Market    │
           └──────────────┘ └────────────┘ └──────────────┘
```

### Deployment Strategy

| Trigger | Environment | URL | Purpose |
|---------|-------------|-----|---------|
| Push to `main` | Production | https://mash-ecommerce.vercel.app | Live site for customers |
| Pull Request | Preview | https://mash-ecommerce-{hash}.vercel.app | Test changes before merge |

---

## ✅ Prerequisites Checklist

Before proceeding, ensure you have:

- [ ] **Vercel Account** - Team/Org account with MASH project
- [ ] **GitHub Repository** - Private repo with admin access
- [ ] **Node.js 20+** - For local testing
- [ ] **Vercel CLI** - `npm install -g vercel@latest`

### Required Access Levels

| Platform | Required Role | Purpose |
|----------|--------------|---------|
| GitHub | Admin on repository | Configure secrets |
| Vercel | Owner/Admin on team | Get tokens and project IDs |
| Sanity | Editor | Manage content |

---

## 🔑 Step 1: Get Vercel Credentials

You need 3 pieces of information from Vercel:

### 1.1 Get VERCEL_TOKEN

1. Go to **Vercel Dashboard** → https://vercel.com/account/tokens
2. Click **"Create"**
3. Configure token:
   - **Name:** `MASH-GitHub-Actions`
   - **Scope:** `Full Account` (or specific to your team)
   - **Expiration:** `No Expiration` (recommended for CI/CD)
4. Click **"Create Token"**
5. **⚠️ COPY THE TOKEN IMMEDIATELY** - You won't see it again!

```
Example: xxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.2 Get VERCEL_ORG_ID

1. Go to **Vercel Dashboard** → https://vercel.com/mash-mushroom-automation
2. Click **Settings** (gear icon)
3. Scroll to **"General"** section
4. Find **"Team ID"** (this is your ORG_ID)

```
Example: team_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.3 Get VERCEL_PROJECT_ID

1. Go to **Vercel Project** → https://vercel.com/mash-mushroom-automation/mash-ecommerce
2. Click **Settings** tab
3. Scroll to **"General"** section
4. Find **"Project ID"**

```
Actual Value: prj_T0c5MwwNkBQ4XaardQs2q5QtNfuX
```

### Quick Reference Table

| Credential | Where to Find | Example Format |
|------------|--------------|----------------|
| VERCEL_TOKEN | vercel.com/account/tokens | `xxxxxxxx...` |
| VERCEL_ORG_ID | Team Settings → General → Team ID | `team_xxxx...` |
| VERCEL_PROJECT_ID | Project Settings → General → Project ID | `prj_xxxx...` |

### ✅ YOUR CREDENTIALS (December 8, 2025)

| Secret Name | Value | Status |
|-------------|-------|--------|
| `VERCEL_TOKEN` | `v8U1Dqe38muKe3cf88YITF80` | ✅ Generated |
| `VERCEL_ORG_ID` | `team_vN7zYO21dC4pa3F6LkhMkJB0` | ✅ Found |
| `VERCEL_PROJECT_ID` | `prj_T0c5MwwNkBQ4XaardQs2q5QtNfuX` | ✅ Found |

**⚠️ SECURITY NOTE:** After adding these to GitHub Secrets, consider removing this section from the document to avoid exposing credentials in version control.

---

## 🔐 Step 2: Configure GitHub Secrets

### Navigate to Repository Secrets

1. Go to **GitHub Repository** → https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

### Required Secrets

Add these 3 secrets (the workflow already uses GITHUB_TOKEN automatically):

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | Your Vercel token from Step 1.1 | Authenticates with Vercel API |
| `VERCEL_ORG_ID` | Team ID from Step 1.2 | Identifies your Vercel team |
| `VERCEL_PROJECT_ID` | Project ID from Step 1.3 | Targets the correct project |

### Adding Each Secret

For each secret:

1. Click **"New repository secret"**
2. Enter the **Name** (exactly as shown above)
3. Paste the **Value**
4. Click **"Add secret"**

### Verify Secrets Are Set

After adding all secrets, you should see:

```
Repository secrets (3)
├── VERCEL_ORG_ID         Updated just now
├── VERCEL_PROJECT_ID     Updated just now
└── VERCEL_TOKEN          Updated just now
```

---

## 🌍 Step 3: Configure Vercel Environment Variables

Your app needs environment variables to connect to external services. Configure these in Vercel:

### Navigate to Environment Variables

1. Go to **Vercel Project** → https://vercel.com/mash-mushroom-automation/mash-ecommerce
2. Click **Settings** tab
3. Left sidebar → **Environment Variables**

### Required Environment Variables

Add the following variables for **Production**, **Preview**, and **Development** environments:

#### Backend API Configuration

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url/api/v1` | All |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | All |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` | All |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | Production |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Preview, Development |

#### Sanity CMS (PP_Namias Free Project)

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `gerattrr` | All |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | All |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-11-26` | All |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | `https://ppnamias.sanity.studio` | All |
| `NEXT_PUBLIC_SANITY_REALTIME_ENABLED` | `false` | All |
| `SANITY_API_READ_TOKEN` | `sk1Yxrb9AJ72mvAc...` | All (⚠️ Sensitive) |
| `SANITY_API_WRITE_TOKEN` | `sk8tLquq2h8oKzHC...` | All (⚠️ Sensitive) |

#### Firebase Configuration

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0` | All |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `mash-5b627.firebaseapp.com` | All |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `mash-5b627` | All |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `mash-5b627.firebasestorage.app` | All |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1001664140460` | All |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1001664140460:web:0328621f8c7c0da13cfb09` | All |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XZFRQ8332D` | All |

#### Google Analytics

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-5XD8QWQP6J` | Production only |

#### Lalamove API (Delivery)

| Variable | Value | Environments |
|----------|-------|--------------|
| `LALAMOVE_API_KEY` | `pk_test_8611e4fa...` (sandbox) | Preview, Development |
| `LALAMOVE_API_KEY` | `pk_prod_YOUR_KEY` (production) | Production |
| `LALAMOVE_API_SECRET` | `sk_test_KeCmtaJP...` (sandbox) | Preview, Development |
| `LALAMOVE_API_SECRET` | `sk_prod_YOUR_SECRET` (production) | Production |
| `LALAMOVE_HOST` | `https://rest.lalamove.com` | All |
| `LALAMOVE_MARKET` | `PH` | All |

#### Google Maps API

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSyCyQdnT0W3TI04xJ5tBjQ-LJF7CSOtxy5U` | All |

### Quick Add Script (Copy-Paste Friendly)

Use Vercel CLI to add variables quickly:

```bash
# Install Vercel CLI if not installed
npm install -g vercel@latest

# Login to Vercel
vercel login

# Link to project
vercel link

# Add environment variables (run from project root)
# Sanity CMS
vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID production preview development
# Enter: gerattrr

vercel env add NEXT_PUBLIC_SANITY_DATASET production preview development
# Enter: production

vercel env add NEXT_PUBLIC_SANITY_API_VERSION production preview development
# Enter: 2024-11-26

vercel env add SANITY_API_READ_TOKEN production preview development
# Enter: sk1Yxrb9AJ72mvAc... (your full token)

# Firebase (repeat for each variable)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production preview development
# Enter: AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0

# ... continue for all variables
```

---

## 📄 Step 4: Verify GitHub Actions Workflow

The workflow file already exists at `.github/workflows/deploy-vercel.yml`. Let's verify it's correct:

### Current Workflow Configuration

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read
  deployments: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Deploy to Vercel (Production)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          PRODUCTION: true

      - name: Deploy to Vercel (Preview)
        if: github.event_name == 'pull_request'
        uses: BetaHuhn/deploy-to-vercel-action@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          PRODUCTION: false
```

### Workflow Features

| Feature | Description |
|---------|-------------|
| **Production Deploy** | Triggered on push to `main` branch |
| **Preview Deploy** | Triggered on pull requests to `main` |
| **Node.js 20** | Uses LTS version for compatibility |
| **Automatic Comments** | Posts deployment URL on PRs |

---

## 🧪 Step 5: Test Deployment

### Option A: Trigger Production Deploy

1. Make a small change (e.g., update README.md)
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "chore: trigger initial Vercel deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub → https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/actions
4. Watch the workflow run

### Option B: Trigger Preview Deploy

1. Create a new branch:
   ```bash
   git checkout -b test/vercel-deployment
   ```
2. Make a small change
3. Push and create PR:
   ```bash
   git add .
   git commit -m "test: verify Vercel preview deployment"
   git push origin test/vercel-deployment
   ```
4. Create Pull Request on GitHub
5. Wait for preview deployment URL in PR comments

### Expected Results

**Successful Production Deploy:**
```
✅ Deploy to Vercel (Production)
   Deployment URL: https://mash-ecommerce.vercel.app
   Status: Production
```

**Successful Preview Deploy:**
```
✅ Deploy to Vercel (Preview)
   Deployment URL: https://mash-ecommerce-git-test-vercel-mash.vercel.app
   Status: Preview
```

---

## 🌐 Deployment Environments

### Production Environment

| Setting | Value |
|---------|-------|
| **URL** | https://mash-ecommerce.vercel.app |
| **Branch** | `main` |
| **Auto Deploy** | Yes, on push to main |
| **Analytics** | Enabled |
| **Lalamove** | Production API |

### Preview Environment

| Setting | Value |
|---------|-------|
| **URL** | https://mash-ecommerce-{hash}.vercel.app |
| **Branch** | Any PR branch |
| **Auto Deploy** | Yes, on PR creation/update |
| **Analytics** | Disabled |
| **Lalamove** | Sandbox API |

### Domain Configuration (Optional)

To add a custom domain (e.g., `shop.mashmarketph.com`):

1. Go to Vercel Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

---

## 🔧 Troubleshooting Guide

### Common Issues

#### 1. "Error: Missing VERCEL_TOKEN"

**Cause:** Secret not configured in GitHub

**Fix:**
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add `VERCEL_TOKEN` secret
3. Re-run the workflow

#### 2. "Error: Project not found"

**Cause:** Incorrect VERCEL_PROJECT_ID or VERCEL_ORG_ID

**Fix:**
1. Verify Project ID in Vercel dashboard
2. Verify Org/Team ID in Vercel team settings
3. Update GitHub secrets

#### 3. "Build failed: Module not found"

**Cause:** Missing dependencies or incorrect imports

**Fix:**
1. Run locally: `npm install && npm run build`
2. Fix any build errors
3. Push changes

#### 4. "Error: Environment variable not found"

**Cause:** Missing env vars in Vercel

**Fix:**
1. Add missing variable in Vercel dashboard
2. Redeploy (push a commit or click "Redeploy" in Vercel)

#### 5. "Sanity API error: Unauthorized"

**Cause:** Invalid or expired Sanity tokens

**Fix:**
1. Go to https://www.sanity.io/manage/project/gerattrr/api#tokens
2. Regenerate tokens
3. Update in Vercel environment variables

### Debugging Steps

```bash
# 1. Test build locally
npm run build

# 2. Check environment variables
vercel env pull .env.local

# 3. Deploy manually to test
vercel --prod

# 4. View deployment logs
vercel logs <deployment-url>

# 5. Check function logs
vercel logs <deployment-url> --since 1h
```

---

## ✅ Post-Deployment Checklist

After successful deployment, verify these features:

### Frontend Checks

- [ ] Homepage loads with hero carousel
- [ ] Products display with images from Sanity
- [ ] Category filtering works
- [ ] Product detail pages load correctly
- [ ] Search autocomplete returns results
- [ ] Cart functionality works
- [ ] Mobile responsive design

### Integration Checks

- [ ] Sanity CMS content appears (products, categories, FAQ)
- [ ] Google Analytics tracking (check real-time in GA dashboard)
- [ ] Google Maps displays on store/grower pages
- [ ] Firebase authentication (if enabled)

### Performance Checks

- [ ] Lighthouse score > 80 (Performance)
- [ ] Images lazy load correctly
- [ ] No console errors in browser

### Security Checks

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Sensitive env vars not exposed in client
- [ ] API routes protected

---

## 📊 Monitoring & Maintenance

### Vercel Analytics

1. Go to Vercel Project → Analytics tab
2. Monitor:
   - Page views
   - Web Vitals (LCP, FID, CLS)
   - Top pages
   - Error rates

### GitHub Actions Monitoring

1. Go to Actions tab in GitHub repo
2. Check workflow run history
3. Set up notifications for failed deployments

### Recommended Alerts

Configure in Vercel:
- [ ] Deployment failed notifications (email/Slack)
- [ ] High error rate alerts
- [ ] Performance degradation alerts

---

## 🗓️ Deployment Schedule

### Recommended Workflow

| Day | Activity |
|-----|----------|
| Daily | Preview deployments for feature branches |
| Weekly | Production deployment with tested features |
| Monthly | Dependency updates and security patches |

### Rollback Procedure

If a production deployment causes issues:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click the three dots (⋮) menu
4. Select "Promote to Production"
5. Confirm rollback

---

## 📝 Quick Reference Commands

```bash
# Deploy manually to production
vercel --prod

# Deploy to preview
vercel

# Pull environment variables
vercel env pull .env.local

# View deployment list
vercel ls

# View deployment logs
vercel logs <url>

# Link project (first time setup)
vercel link

# Check project info
vercel inspect <url>
```

---

## 🎉 Summary

Once you complete all steps above:

1. ✅ GitHub Actions will automatically deploy to Vercel
2. ✅ Pushes to `main` → Production deployment
3. ✅ Pull Requests → Preview deployment with unique URL
4. ✅ Environment variables securely configured
5. ✅ Full integration with Sanity CMS, Firebase, and external APIs

**Next Steps:**
1. Complete [Step 1](#-step-1-get-vercel-credentials) - Get Vercel credentials
2. Complete [Step 2](#-step-2-configure-github-secrets) - Add GitHub secrets
3. Complete [Step 3](#-step-3-configure-vercel-environment-variables) - Add Vercel env vars
4. Test deployment with a commit to `main`

---

**Questions?** Check the [Troubleshooting Guide](#-troubleshooting-guide) or open an issue in the repository.
