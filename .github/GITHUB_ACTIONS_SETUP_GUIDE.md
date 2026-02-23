# GitHub Actions Setup Guide

> Quick guide for MASH E-Commerce CI/CD

---

## Workflows Overview

All workflows are in `.github/workflows/`:

| File | Runs On | Purpose |
|------|---------|---------|
| `build.yml` | Push & PR | Verify build passes |
| `test.yml` | Push & PR | Run unit tests |
| `pr-checks.yml` | PR only | Combined quality gates |
| `playwright-e2e.yml` | PR only | E2E tests (non-blocking) |
| `security.yml` | Push & PR & Weekly | Security audit |
| `deploy-railway.yml` | Push to main/develop | Pre-deploy validation |

---

## No Secrets Required

All workflows use hardcoded defaults that work without configuration:

- ✅ API URL: `https://api.mashmarket.app/api/v1`
- ✅ Sanity: `gerattrr` / `production`
- ✅ Firebase: `mash-ddf8d`

Optional secrets for enhanced functionality:
- `NEXT_PUBLIC_FIREBASE_API_KEY` - For real Firebase auth in CI
- `CODECOV_TOKEN` - For coverage reporting

---

## Removing Vercel

If you see the error:
> "Cannot deploy from a private GitHub organization repository on the Hobby plan"

Remove Vercel integration:
1. Go to https://vercel.com → Project Settings → Git → Disconnect
2. Or go to https://github.com/settings/installations → Remove Vercel

---

## Branch Protection (Recommended)

Go to: **Settings → Branches → Add rule**

For `main`:
- Branch name pattern: `main`
- ✅ Require status checks before merging
- Search and select: `Build` or `Build Check / Build`

---

## Local Commands

```bash
# Before pushing
npm run lint      # Linting
npm run build     # Build (REQUIRED to pass)
npm test          # Unit tests

# E2E tests
npm run test:e2e
```
