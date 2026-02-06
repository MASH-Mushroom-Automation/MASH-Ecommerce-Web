# Firebase Redirect Authentication Debugging Guide

## Current Issue

Firebase `signInWithRedirect` is **losing authentication state** after returning from Google OAuth. After redirect, both `getRedirectResult()` and `auth.currentUser` return `null`.

## What We've Tried

1. ✅ **Verified Firebase Console** - `localhost` is in authorized domains
2. ✅ **IndexedDB Persistence** - Switched to `browserLocalPersistence` (localStorage)
3. ✅ **SessionStorage Markers** - Track redirect intent across page loads
4. ✅ **Polling Mechanism** - Check for Firebase user every 200ms for 5 seconds
5. ✅ **Auth State Initialization** - Wait for `onAuthStateChanged` before redirect
6. ✅ **Dual Storage** - Use both sessionStorage and localStorage

## Root Cause

Firebase redirect auth in **Next.js development** fails when:

- Browser blocks third-party cookies (even for localhost)
- Turbopack hot-reload interferes with Firebase SDK
- IndexedDB/localStorage isn't persisting across the Google redirect
- Firebase SDK version incompatibility with Next.js 15+

## Solutions (in order of preference)

### Option 1: Use Popup for Development, Redirect for Production ⭐ **RECOMMENDED**

```typescript
// src/lib/firebase/auth.ts
export async function signInWithGoogle(): Promise<FirebaseUser | void> {
  if (process.env.NODE_ENV === "development") {
    // Popup works reliably in development
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } else {
    // Redirect for production security
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, googleProvider);
  }
}
```

**Why this works:**

- Popup bypasses the redirect persistence issue in development
- Production uses secure redirect flow
- No code changes needed for deployment

### Option 2: Deploy to Vercel and Test

Redirect auth works better on:

- **Production domains** (not localhost)
- **HTTPS** (required by Firebase)
- **Vercel** (optimized for Next.js)

```bash
vercel --prod
```

Then test Google Sign-In on your Vercel URL.

### Option 3: Use Firebase Emulator

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then update `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="localhost:9099"
```

### Option 4: Check Browser Settings

**Chrome:**

1. `chrome://settings/cookies`
2. Ensure "Allow all cookies" or add exception for `localhost` and `*.firebaseapp.com`
3. Disable "Block third-party cookies"

**Clear all site data:**

1. DevTools → Application → Clear storage
2. Check all boxes → Clear site data
3. Hard refresh (Ctrl+Shift+R)

## Testing Checklist

- [ ] Clear browser cache and site data
- [ ] Try incognito/private window
- [ ] Check browser console for Firebase errors
- [ ] Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches Console
- [ ] Test on different browser (Firefox, Edge)
- [ ] Try production build: `npm run build && npm start`
- [ ] Deploy to Vercel and test there

## Environment Variables

Ensure these match your Firebase Console project `mash-ddf8d`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBQ1r2ZHKorNknHpzBDeaLY8FXMM58CNL4"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mash-ddf8d.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mash-ddf8d"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mash-ddf8d.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="784415877696"
NEXT_PUBLIC_FIREBASE_APP_ID="1:784415877696:web:89853cbc7b1c54d6da4da5"
```

## Next Steps

**Immediate:**

1. Try **Option 1** (popup for dev) - fastest solution
2. Clear browser data and retry
3. Test in incognito

**For Production:**

1. Deploy to Vercel
2. Test redirect flow on production domain
3. If it works there, use Option 1 (env-based switching)
