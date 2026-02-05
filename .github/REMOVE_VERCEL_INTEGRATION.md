# How to Remove Vercel GitHub App Integration

## Issue
PR #243 shows: "Vercel — Cannot deploy from a private GitHub organization repository on the Hobby plan"

## Root Cause
The Vercel GitHub App is still connected to this repository, trying to deploy on every PR.

## Solution: Remove Vercel Integration

### Step 1: Remove Vercel GitHub App

**Option A: Via GitHub Repository Settings**
1. Go to: https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/settings/installations
2. Find "Vercel" in the installed GitHub Apps list
3. Click "Configure"
4. Scroll down to "Repository access"
5. Either:
   - **Remove this specific repo** from Vercel's access list
   - OR **Uninstall Vercel completely** if not used anywhere in the org

**Option B: Via Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Find this project (MASH-Ecommerce-Web)
3. Project Settings → Git
4. Click "Disconnect" to remove GitHub integration
5. Or delete the project entirely if not needed

### Step 2: Verify Removal

After removing the integration:
1. Go to PR #243: https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/pull/243
2. The Vercel check should disappear from the checks list
3. Only GitHub Actions workflows should remain

---

## Expected Result

**Before removal:**
- ❌ Vercel check appears and fails
- 16 failing checks including Vercel

**After removal:**
- ✅ Vercel check completely gone
- Only GitHub Actions checks (build, test, lint, etc.)
- With secrets added, all checks should pass

---

## Alternative: If You Can't Remove Vercel

If you need to keep Vercel for another project but want it to ignore this repo:

1. Go to Vercel Dashboard
2. Find MASH-Ecommerce-Web project
3. Project Settings → Git → Production Branch
4. Change to a non-existent branch like `vercel-disabled`
5. This prevents Vercel from deploying on PR commits

---

## Railway is Already Configured

Railway deployment is handled by:
- **GitHub Integration**: Railway watches the `main` and `develop` branches
- **Workflow**: `.github/workflows/deploy-railway.yml` runs pre-deployment checks
- **Automatic**: No manual deployment needed

Railway deploys to:
- **Production**: https://www.mashmarket.app (main branch)
- **Development**: https://beta.mashmarket.app (develop branch)
- **Admin**: https://zen.mashmarket.app

---

## Next Steps

1. **Remove Vercel integration** (see Step 1 above)
2. **Wait 1 minute** for GitHub to update checks
3. **Re-run failed workflows**:
   ```bash
   gh pr checks 243 --watch
   ```
4. **All checks should pass** with secrets configured

---

## Status Check

After completing these steps, PR #243 should show:
- ✅ Build Check / build (20.x)
- ✅ PR Checks - Unified Quality Gates / Setup & Cache
- ✅ PR Checks - Unified Quality Gates / Lint & Format
- ✅ PR Checks - Unified Quality Gates / TypeScript Check
- ✅ PR Checks - Unified Quality Gates / Unit Tests
- ✅ PR Checks - Unified Quality Gates / Build Check
- ✅ PR Checks - Unified Quality Gates / E2E Tests
- ✅ Run Tests / test (20.x)
- ✅ Playwright E2E Tests / playwright-e2e
- ✅ Security Scanning checks
- ✅ Performance Monitoring checks
- ❌ **NO VERCEL CHECK**

---

**Quick Link to Remove Vercel:**
https://github.com/organizations/MASH-Mushroom-Automation/settings/installations
