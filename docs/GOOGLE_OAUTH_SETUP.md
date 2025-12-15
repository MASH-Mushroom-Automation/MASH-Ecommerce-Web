# Google OAuth Authentication Setup Guide

## Overview

This guide covers the complete implementation of Google OAuth authentication using Firebase in the MASH e-commerce platform. The authentication flow uses a redirect-based approach (not popup) to avoid browser blockers.

## Architecture

### Authentication Flow

```
1. User clicks "Sign in with Google" button
   ↓
2. Page redirects to Google OAuth screen
   ↓
3. User authenticates with Google account
   ↓
4. Google redirects back to the app with authentication result
   ↓
5. AuthContext detects redirect result
   ↓
6. Firebase ID token is sent to /api/auth/firebase-sync
   ↓
7. Backend verifies Firebase token and returns JWT
   ↓
8. JWT stored in auth-token cookie
   ↓
9. User state updated in context and localStorage
   ↓
10. User redirected to home or original destination
```

### Key Features

- **Dual Authentication**: Preserves existing email/password auth alongside Google OAuth
- **Unified Token System**: Both methods use the same `auth-token` cookie for middleware compatibility
- **Persistent State**: User data stored in localStorage for persistence across page reloads
- **Redirect Flow**: Uses redirect instead of popup to avoid browser popup blockers
- **Seamless Integration**: Works with existing middleware and route protection

## Implementation Files

### 1. Firebase Configuration (`src/lib/firebase.ts`)

Initializes Firebase app and provides authentication functions:

- `signInWithGoogle()` - Initiates Google sign-in redirect
- `checkRedirectResult()` - Checks for OAuth redirect result
- `getFirebaseIdToken()` - Gets Firebase ID token for backend verification

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

Manages authentication state across the app:

- Handles OAuth redirect results
- Syncs Firebase auth with backend JWT
- Provides `useAuth()` hook for components
- Manages user state and logout

### 3. Google Sign-In Button (`src/components/auth/GoogleSignInButton.tsx`)

Reusable button component for Google authentication:

- Custom Google branding (follows Google design guidelines)
- Configurable variant and styling
- Handles redirect flow initiation

### 4. Backend API Route (`src/app/api/auth/firebase-sync/route.ts`)

Verifies Firebase ID token and returns JWT:

- Forwards Firebase token to NestJS backend
- Validates user data
- Returns JWT access token and refresh token

### 5. Updated Login Page (`src/app/(auth)/login/page.tsx`)

Integrated Google sign-in button with existing email/password login:

- Preserved existing authentication UI
- Added Google sign-in option below email/password form
- Maintains Facebook sign-in placeholder

### 6. Client Layout (`src/app/client-layout.tsx`)

Wraps app with AuthProvider for global auth state:

- AuthProvider placed above CartProvider and WishlistProvider
- Ensures auth state is available throughout app

## Firebase Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "MASH Ecommerce"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Google Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle "Enable"
6. Set support email (your email address)
7. Click "Save"

### Step 3: Register Web App

1. In Project Overview, click the **Web** icon (</>)
2. Enter app nickname: "MASH Web App"
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

### Step 4: Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Firebase Configuration (Google OAuth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Example values from Firebase config:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp",
  authDomain: "mash-ecommerce.firebaseapp.com",
  projectId: "mash-ecommerce",
  storageBucket: "mash-ecommerce.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

### Step 5: Configure Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** tab
2. Scroll to "Authorized domains"
3. Add your domains:
   - `localhost` (already added by default)
   - `your-production-domain.com`
   - `your-production-domain.vercel.app`

## Backend Implementation (NestJS)

Your NestJS backend needs to implement the `/auth/firebase-sync` endpoint:

### Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Backend Endpoint Example

```typescript
// src/auth/auth.controller.ts

import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("firebase-sync")
  async firebaseSync(
    @Body()
    body: {
      idToken: string;
      email: string;
      displayName: string;
      photoURL: string;
      uid: string;
    }
  ) {
    return this.authService.firebaseSync(body);
  }
}
```

```typescript
// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as admin from "firebase-admin";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
    // Initialize Firebase Admin (do this once in app module)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
  }

  async firebaseSync(data: {
    idToken: string;
    email: string;
    displayName: string;
    photoURL: string;
    uid: string;
  }) {
    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(data.idToken);

      if (decodedToken.email !== data.email) {
        throw new UnauthorizedException("Token email mismatch");
      }

      // Find or create user in database
      let user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        // Create new user from Google data
        const [firstName, ...lastNameParts] = data.displayName.split(" ");
        const lastName = lastNameParts.join(" ") || "";

        user = await this.prisma.user.create({
          data: {
            email: data.email,
            firstName,
            lastName,
            role: "BUYER",
            emailVerified: true, // Google email is already verified
            firebaseUid: data.uid,
            avatar: data.photoURL,
          },
        });
      } else {
        // Update existing user with Firebase data
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: data.uid,
            emailVerified: true,
          },
        });
      }

      // Generate JWT tokens
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: "15m" }
      );

      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: "7d" }
      );

      return {
        success: true,
        data: {
          token: accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            photoURL: user.avatar,
          },
        },
      };
    } catch (error) {
      console.error("Firebase sync error:", error);
      throw new UnauthorizedException("Invalid Firebase token");
    }
  }
}
```

### Backend Environment Variables

Add to your backend `.env` file:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**To get Firebase Admin credentials:**

1. Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key"
3. Download JSON file
4. Extract `project_id`, `client_email`, and `private_key` values

## Testing the Implementation

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Google Sign-In Flow

1. Navigate to http://localhost:4000/login
2. Click "Sign in with Google" button
3. You should be redirected to Google OAuth screen
4. Select your Google account
5. Grant permissions
6. You should be redirected back to the app
7. Check console for authentication logs
8. Verify user state in React DevTools (AuthContext)

### 3. Verify Token Storage

Open browser DevTools:

```javascript
// Check cookie
document.cookie;

// Check localStorage
localStorage.getItem("user");
localStorage.getItem("refreshToken");
```

### 4. Test Protected Routes

1. Sign in with Google
2. Navigate to protected route (e.g., `/profile`)
3. Verify you can access without redirect
4. Sign out
5. Try accessing protected route again
6. Should redirect to login

## Troubleshooting

### Issue: "auth/unauthorized-domain"

**Solution:** Add your domain to Firebase Authorized domains:

- Firebase Console → Authentication → Settings → Authorized domains

### Issue: "Firebase auth not initialized"

**Solution:** Check that Firebase config environment variables are set correctly in `.env.local`

### Issue: Backend returns 401 Unauthorized

**Solution:**

- Verify Firebase Admin SDK is configured in backend
- Check that service account credentials are correct
- Ensure token is being sent in request body

### Issue: User state not persisting

**Solution:**

- Check that `setAuthToken()` is being called with token
- Verify localStorage is not disabled
- Check browser console for errors

### Issue: Redirect not working

**Solution:**

- Ensure redirect URL is added to Firebase Authorized domains
- Check that OAuth redirect is enabled in Google Cloud Console
- Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches Firebase project

## Usage in Components

### Using the Auth Hook

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.displayName || user?.firstName}!</h1>
      {user?.photoURL && (
        <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
      )}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Using Google Sign-In Button

```typescript
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignInButton variant="outline" />
    </div>
  );
}
```

## Security Considerations

1. **Token Verification**: Always verify Firebase ID tokens on the backend
2. **HTTPS Only**: Use HTTPS in production to prevent token interception
3. **Token Expiration**: JWT tokens expire after 15 minutes, refresh tokens after 7 days
4. **CORS**: Ensure backend only accepts requests from authorized domains
5. **Rate Limiting**: Implement rate limiting on `/auth/firebase-sync` endpoint
6. **Input Validation**: Validate all user input on backend

## Next Steps

1. **Add User Profile Update**: Allow users to update profile after OAuth sign-in
2. **Link Accounts**: Allow linking Google account to existing email/password account
3. **Multi-Factor Authentication**: Add additional security layer
4. **Session Management**: Implement session timeout and forced re-authentication
5. **Analytics**: Track OAuth sign-in success/failure rates
6. **Error Logging**: Set up error tracking (Sentry, LogRocket, etc.)

## Production Deployment

### Frontend (Vercel)

1. Add Firebase environment variables to Vercel project settings
2. Add production domain to Firebase Authorized domains
3. Deploy and test OAuth flow in production

### Backend (Railway/Heroku)

1. Add Firebase Admin SDK environment variables
2. Ensure CORS is configured for production frontend URL
3. Test `/auth/firebase-sync` endpoint with production credentials

## Support

For issues or questions:

- Check Firebase Console logs
- Review browser console for errors
- Check backend logs for Firebase verification errors
- Refer to [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
