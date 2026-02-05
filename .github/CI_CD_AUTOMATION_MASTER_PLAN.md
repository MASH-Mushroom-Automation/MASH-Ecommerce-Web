# CI/CD Automation - MASH E-Commerce Platform

> **Goal:** Automated PR checks with Railway deployment

---

## Overview

- **Status:** ✅ Complete
- **Deployment:** Railway (not Vercel)
- **Last Updated:** 2026-02-05

---

## Active Workflows

| Workflow | Purpose | Required | Blocking |
|----------|---------|----------|----------|
| `build.yml` | Production build check | ✅ Yes | ✅ Yes |
| `test.yml` | Unit tests | ❌ No | ❌ No |
| `pr-checks.yml` | Lint, TypeScript, Tests, Build | Build only | Build only |
| `playwright-e2e.yml` | E2E browser tests | ❌ No | ❌ No |
| `security.yml` | NPM audit | ❌ No | ❌ No |
| `deploy-railway.yml` | Pre-deploy validation | ✅ Yes | ✅ Yes |

---

## How Checks Work

### PR Checks (Non-Blocking except Build)

1. **Lint** - ESLint check (non-blocking, warnings only)
2. **TypeScript** - Type checking (non-blocking, warnings only)
3. **Tests** - Unit tests (non-blocking, informational)
4. **Build** - Production build (**REQUIRED - blocks merge**)
5. **Security** - NPM audit (non-blocking, weekly scan)

### Deployment

Railway deployment is handled automatically via GitHub integration:
- Push to `main` → Deploy to production (www.mashmarket.app)
- Push to `develop` → Deploy to staging (beta.mashmarket.app)

---

## Environment Variables

The workflows use hardcoded defaults that work without GitHub secrets:

```yaml
NEXT_PUBLIC_API_URL: https://api.mashmarket.app/api/v1
NEXT_PUBLIC_SANITY_PROJECT_ID: gerattrr
NEXT_PUBLIC_SANITY_DATASET: production
NEXT_PUBLIC_SANITY_API_VERSION: 2024-11-26
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: mash-ddf8d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID: mash-ddf8d
```

Optional secrets (for full functionality):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `CODECOV_TOKEN`

---

## Required Actions

### 1. Remove Vercel Integration (Manual Step)

The Vercel GitHub App is still connected and causing the error:
> "Cannot deploy from a private GitHub organization repository on the Hobby plan"

**To fix:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find the project linked to this repo
3. Go to **Settings → Git → Disconnect**
4. Or go to [GitHub Settings → Integrations](https://github.com/settings/installations)
5. Find Vercel and remove access to this repository

### 2. Configure Branch Protection (Optional)

In **GitHub → Settings → Branches → Branch protection rules**:

For `main` branch:
- ✅ Require status checks to pass before merging
- ✅ Required checks: `Build Check / Build` or `PR Checks / Build`

---

## Local Development

Before pushing, run:

```bash
npm run lint      # Check for linting issues
npm run build     # REQUIRED - must pass
npm test          # Optional but recommended
```

---

## Troubleshooting

### Build Failing in CI?

1. Check if it builds locally: `npm run build`
2. Environment variables are pre-configured with defaults
3. Check the workflow logs for specific error messages

### Tests Failing?

Tests are non-blocking. Check the output for details but they won't prevent merge.

### Vercel Check Still Appearing?

Remove the Vercel GitHub integration as described above.
