# Dev Token Setup for Admin Dashboard

## Quick Reference

### Hardcoded Admin Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWo2eDVvbG8wMDAwaHp4b2Iczhjemk0IiwiZW1haWwiOiJtYXNoLnNlbGxlci50ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTc5MzY0OSwiZXhwIjoxNzY1ODgwMDQ5fQ.luZXzDF7yyd617TREDaBR_fGu5xknHTO8lT5tavHrLU
```

**Token Details:**

- User: mash.seller.test@gmail.com
- Role: ADMIN
- User ID: cmj6x5olo0000hzxobn8czj4
- Expires: December 16, 2025

## Implementation

### 1. Login Page Dev Button

**File:** `src/app/(auth)/login/page.tsx`

Added a "Quick Login as Admin (Dev)" button that:

- Sets the hardcoded admin token in cookies
- Saves user data to localStorage/sessionStorage
- Redirects to `/seller/dashboard`
- Only visible in development mode

**Usage:**

1. Go to `/login`
2. Click "🔐 Quick Login as Admin (Dev)" button
3. Automatically logged in and redirected to dashboard

### 2. API Hook Token Override

**File:** `src/hooks/useAdminDashboard.ts`

Added optional dev token override:

```typescript
const USE_DEV_TOKEN = process.env.NEXT_PUBLIC_USE_DEV_TOKEN === "true";
```

**To Enable:**
Add to `.env.local`:

```env
NEXT_PUBLIC_USE_DEV_TOKEN=true
```

When enabled:

- Hook bypasses cookie-based auth
- Uses hardcoded token directly in Authorization header
- Console logs: "[Admin Dashboard] 🔐 Using hardcoded dev token for testing"

### 3. Token Flow

**Normal Flow (Default):**

1. User logs in → Backend returns JWT
2. JWT stored in `auth-token` cookie
3. `apiRequest()` reads cookie and adds to header
4. Dashboard endpoint receives authenticated request

**Dev Token Flow (Optional):**

1. Set `NEXT_PUBLIC_USE_DEV_TOKEN=true`
2. Hook directly adds hardcoded token to request
3. Overrides cookie-based auth
4. Useful for testing without login flow

**Dev Button Flow:**

1. Click dev admin button on login page
2. Token stored in cookie (normal flow)
3. Works with dashboard without env var

## Testing

### Option 1: Dev Button (Recommended)

```bash
npm run dev
```

1. Navigate to http://localhost:3000/login
2. Click "🔐 Quick Login as Admin (Dev)"
3. Dashboard loads with real data

### Option 2: Env Variable Override

```bash
# Add to .env.local
NEXT_PUBLIC_USE_DEV_TOKEN=true

npm run dev
```

1. Navigate directly to http://localhost:3000/seller/dashboard
2. Dashboard loads with hardcoded token (no login needed)

## Token Handling in API Client

**File:** `src/lib/api-client.ts`

The API client properly handles token priority:

```typescript
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(options.headers as Record<string, string>), // Custom headers
};

// Cookie token (lower priority)
if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}
```

Custom headers from `options.headers` are merged first, so if the hook provides an Authorization header (dev token), it will override the cookie token.

## Security Notes

⚠️ **Development Only**

- Dev button only appears when `NODE_ENV === "development"`
- Token is hardcoded in source (not in env file by default)
- Token expires December 16, 2025
- Do NOT commit active tokens to production

## Troubleshooting

### Token Not Working

**Symptoms:** 401 Unauthorized error

**Solutions:**

1. Check token expiration (Dec 16, 2025)
2. Verify backend is running
3. Check console for token usage logs
4. Inspect cookies (DevTools → Application → Cookies)

### Dev Button Not Visible

**Cause:** Not in development mode

**Solution:**

```bash
# Ensure you're running in dev mode
npm run dev
# NOT: npm start
```

### Dashboard Shows "Failed to Load"

**Check:**

1. Backend URL in env: `NEXT_PUBLIC_API_URL`
2. Token in cookie: `auth-token`
3. Console for API errors
4. Network tab for request details

## Files Modified

1. `src/hooks/useAdminDashboard.ts` - Dev token override logic
2. `src/app/(auth)/login/page.tsx` - Dev admin login button
3. `.github/DEV_TOKEN_SETUP.md` - This documentation

## Alternative: Manual Cookie Setup

If you want to manually set the token:

```javascript
// In browser console
document.cookie = `auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWo2eDVvbG8wMDAwaHp4b2Iczhjemk0IiwiZW1haWwiOiJtYXNoLnNlbGxlci50ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTc5MzY0OSwiZXhwIjoxNzY1ODgwMDQ5fQ.luZXzDF7yyd617TREDaBR_fGu5xknHTO8lT5tavHrLU; Path=/`;

// Reload page
location.reload();
```

## Summary

✅ **Yes**, the bearer token is being passed:

- Via `auth-token` cookie (automatic)
- Or via custom header (optional dev override)

✅ **Token is hardcoded** in two places:

1. Login page dev button (always available in dev)
2. Dashboard hook (optional via env var)

Choose the method that works best for your workflow!
