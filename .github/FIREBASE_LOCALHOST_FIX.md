# Firebase Localhost Authorization Fix

## Problem
Google Sign-In redirect returns `null` result because `localhost` is not authorized in Firebase Console.

## Solution: Add Localhost to Authorized Domains

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/mash-5b627/authentication/settings
2. Or navigate: Firebase Console → Project Settings → Authentication → Settings tab

### Step 2: Add Authorized Domains
Scroll down to **Authorized domains** section and add:
- `localhost` 
- `127.0.0.1` (if not already there)

Click **Add domain** for each one.

### Step 3: Test Again
1. Clear your browser cache and cookies (or use Incognito mode)
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. Sign in with Google
5. You should be redirected back and the console should show:
   ```
   ✅ [Firebase Auth] Redirect result received
   ```

## Expected Console Output After Fix

### Before Google Redirect:
```
🔵 [Firebase Auth] Initiating Google sign-in redirect...
```

### After Returning from Google:
```
🔵 [Firebase Auth] Checking for redirect result...
✅ [Firebase Auth] Redirect result received: { uid: '...', email: '...' }
🟢 [Auth Context] User found in redirect result, syncing...
🟣 [Firebase Sync API] POST request received
🟢 [Auth] Setting cookie...
✅ [Auth Context] Backend sync completed successfully!
```

## Alternative: Test Without Localhost Issue

If you cannot access Firebase Console, test with the deployed version:
1. Deploy to Vercel/Netlify
2. The production domain should already be authorized
3. Test Google Sign-In there

## Verify Authorized Domains

Current authorized domains for project `mash-5b627` should include:
- ✅ `mash-5b627.firebaseapp.com` (auto-added)
- ✅ `mash-5b627.web.app` (auto-added)  
- ⚠️ `localhost` (YOU NEED TO ADD THIS)
- ⚠️ `127.0.0.1` (Optional but recommended)
- Your production domain when deployed

## Additional Checks

### Check IndexedDB (Browser DevTools)
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB
4. Look for `firebaseLocalStorageDb`
5. Should have data after redirect

### Check Third-Party Cookies
Make sure third-party cookies are not blocked:
- Chrome: Settings → Privacy → Cookies → Allow all cookies (for testing)
- Or add exception for `googleapis.com` and `firebaseapp.com`
