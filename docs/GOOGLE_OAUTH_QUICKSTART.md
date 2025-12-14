# Google OAuth - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Enable Google Auth in Firebase Console

```bash
1. Go to: https://console.firebase.google.com/project/mash-5b627/authentication
2. Click "Sign-in method" tab
3. Click "Google" provider → Toggle "Enable" → Save
```

### 2. Test the Implementation

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:4000/login

# Click "Sign in with Google" button
# → Should redirect to Google OAuth screen
```

### 3. Verify Backend Endpoint

Your backend needs this endpoint:

```typescript
POST /api/v1/auth/firebase-sync
Body: { idToken, email, displayName, photoURL, uid }
Response: { success: true, data: { token, refreshToken, user } }
```

## 📁 What Was Implemented

### New Files (5)

```
src/lib/firebase.ts                          # Firebase config & helpers
src/contexts/AuthContext.tsx                 # Global auth state
src/components/auth/GoogleSignInButton.tsx   # Sign-in button component
src/app/api/auth/firebase-sync/route.ts      # Token exchange API
docs/GOOGLE_OAUTH_SETUP.md                   # Complete setup guide
```

### Modified Files (3)

```
src/app/(auth)/login/page.tsx        # Added Google sign-in button
src/app/client-layout.tsx            # Wrapped with AuthProvider
package.json                          # Added firebase dependency
```

## 🔄 Authentication Flow

```
User clicks "Sign in with Google"
    ↓
Redirect to Google OAuth (select account)
    ↓
Google authenticates user
    ↓
Redirect back to app with Firebase token
    ↓
Send Firebase token to /api/auth/firebase-sync
    ↓
Backend verifies token → Returns JWT
    ↓
Store JWT in cookie + user data in localStorage
    ↓
User authenticated! Redirect to shop or original page
```

## 🎯 Using in Your Code

### Get Current User

```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <img src={user?.photoURL} alt="Profile" />
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Add Google Sign-In Button

```typescript
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

<GoogleSignInButton variant="outline" />
```

## 🔑 Environment Variables

Already configured in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mash-5b627.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mash-5b627"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mash-5b627.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1001664140460"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1001664140460:web:0328621f8c7c0da13cfb09"
```

## ✅ Testing Checklist

- [ ] Firebase Google OAuth enabled
- [ ] Dev server running (`npm run dev`)
- [ ] Click "Sign in with Google" on login page
- [ ] Redirected to Google OAuth screen
- [ ] Can select Google account
- [ ] Redirected back to app
- [ ] Check console for auth logs
- [ ] Verify cookie: `document.cookie` has `auth-token`
- [ ] Verify localStorage: `localStorage.getItem('user')`
- [ ] Navigate to `/profile` (should work if authenticated)
- [ ] Logout works and clears state

## 🐛 Common Issues

### "Firebase auth not initialized"

→ Restart dev server after adding env variables

### Backend 401 Error

→ Implement `/api/v1/auth/firebase-sync` endpoint in NestJS

### "auth/unauthorized-domain"

→ Add domain to Firebase Console → Authentication → Settings → Authorized domains

### Redirect loop

→ Check middleware.ts isn't blocking auth routes

## 🔧 Backend Implementation (NestJS)

### Install Firebase Admin

```bash
npm install firebase-admin
```

### Get Service Account

1. Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key"
3. Download JSON and add to backend `.env`:

```env
FIREBASE_PROJECT_ID=mash-5b627
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mash-5b627.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Create Endpoint

```typescript
// auth.controller.ts
@Post('firebase-sync')
async firebaseSync(@Body() body: FirebaseSyncDto) {
  return this.authService.firebaseSync(body);
}

// auth.service.ts
async firebaseSync(data: { idToken: string; email: string; ... }) {
  // 1. Verify Firebase ID token with Firebase Admin SDK
  const decodedToken = await admin.auth().verifyIdToken(data.idToken);

  // 2. Find or create user in database
  let user = await this.prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    user = await this.prisma.user.create({ data: { email, firstName, lastName, ... } });
  }

  // 3. Generate JWT tokens
  const accessToken = this.jwtService.sign({ sub: user.id, email, role });
  const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

  // 4. Return tokens and user data
  return { success: true, data: { token: accessToken, refreshToken, user } };
}
```

## 📚 Full Documentation

- **Setup Guide**: `docs/GOOGLE_OAUTH_SETUP.md` (600+ lines)
- **Implementation Summary**: `docs/GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md`

## 🎯 Key Features

✅ Redirect flow (no popup blockers)  
✅ Preserves email/password auth  
✅ Same JWT token system  
✅ Persistent user state  
✅ Automatic redirect after auth  
✅ Secure token storage  
✅ Loading states  
✅ Error handling

## 🚨 Important Notes

1. **Backend Required**: Frontend is ready, but backend `/auth/firebase-sync` endpoint must be implemented
2. **Firebase Setup**: Enable Google OAuth in Firebase Console (1 minute)
3. **Testing**: Use localhost:4000 (configured in Firebase authorized domains)
4. **Production**: Add production domain to Firebase authorized domains before deploying

---

**Status**: ✅ Frontend Complete | ⏳ Backend Pending  
**Next Step**: Enable Google OAuth in Firebase Console → Test sign-in flow
