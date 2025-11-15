# 🚀 Clerk SSO Enhancement Roadmap - Next Steps

**Date**: January 2025  
**Project**: MASH E-Commerce Platform  
**Current Status**: ✅ Phases 1-5 Complete (Google SSO Basic Implementation)  
**Next Phase**: Enhancement & Optimization

---

## 📋 Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Phase 6: User Experience Enhancements](#phase-6-user-experience-enhancements)
3. [Phase 7: Profile & Avatar Management](#phase-7-profile--avatar-management)
4. [Phase 8: Social Account Expansion](#phase-8-social-account-expansion)
5. [Phase 9: Advanced Security Features](#phase-9-advanced-security-features)
6. [Phase 10: Analytics & Monitoring](#phase-10-analytics--monitoring)
7. [Phase 11: Mobile App Integration](#phase-11-mobile-app-integration)
8. [Quick Win Improvements](#quick-win-improvements)
9. [Long-term Roadmap](#long-term-roadmap)

---

## Current Implementation Status

### ✅ What's Working
- Google SSO sign-up and sign-in
- Protected routes with middleware
- Account dashboard with Clerk + backend data
- Link/unlink Google accounts
- Backend API integration
- Header component with Clerk authentication

### ⚠️ What's Missing
- User profile picture/avatar management
- Profile editing functionality
- Additional social providers (Facebook, Twitter, Apple)
- Two-factor authentication (2FA)
- Session management UI
- User activity logs
- Email notifications
- Account deletion workflow
- Password change UI (for email/password accounts)

---

## Phase 6: User Experience Enhancements

**Priority**: 🔥 High  
**Estimated Time**: 6-8 hours  
**Impact**: Significantly improves user satisfaction

### 6.1 Enhanced Loading States

**Files to Create/Modify:**
- `src/components/ui/loading-skeleton.tsx` (NEW)
- `src/app/account/page.tsx` (UPDATE)
- `src/app/settings/page.tsx` (UPDATE)

**Implementation:**

```typescript
// src/components/ui/loading-skeleton.tsx
export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="h-20 w-20 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          {/* Name skeleton */}
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          {/* Email skeleton */}
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          {/* Badges skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-full bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
```

**Usage in account page:**
```typescript
if (!isLoaded || loading) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <ProfileSkeleton />
        <div className="mt-6">
          <AccountInfoSkeleton />
        </div>
      </div>
    </div>
  );
}
```

### 6.2 Toast Notifications

**Files to Create:**
- Already using `sonner` (Toaster component exists)
- Just need to replace `alert()` calls with toast notifications

**Update settings page:**
```typescript
import { toast } from "sonner";

// Replace alert() with:
toast.success("Google account linked successfully!", {
  description: "You can now sign in with Google",
  duration: 4000,
});

toast.error("Failed to unlink account", {
  description: error.message,
  duration: 5000,
});

toast.info("Processing your request...", {
  duration: 2000,
});
```

### 6.3 Smooth Transitions & Animations

**Files to Create:**
- `src/lib/animations.ts` (NEW)

**Implementation:**
```typescript
// src/lib/animations.ts
import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

**Usage:**
```typescript
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";

<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  <motion.div variants={fadeIn}>
    {/* Profile card */}
  </motion.div>
  <motion.div variants={fadeIn}>
    {/* Account info */}
  </motion.div>
</motion.div>
```

### 6.4 Error Boundaries

**Files to Create:**
- `src/components/error-boundary.tsx` (NEW)
- `src/app/error.tsx` (NEW - Next.js error boundary)

**Implementation:**
```typescript
// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 7: Profile & Avatar Management

**Priority**: 🔥 High  
**Estimated Time**: 8-10 hours  
**Impact**: Essential for user personalization

### 7.1 User Avatar Display & Upload

**Files to Create:**
- `src/components/user-avatar.tsx` (NEW)
- `src/app/profile/edit/page.tsx` (NEW)
- `src/lib/upload.ts` (NEW)

**Implementation:**

```typescript
// src/components/user-avatar.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, User } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export function UserAvatar({ size = 'lg', editable = false }: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}) {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
    xl: 'h-32 w-32',
  };

  const handleAvatarClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Upload to Clerk
      await user?.setProfileImage({ file });

      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={user?.imageUrl} 
          alt={user?.fullName || 'User'} 
        />
        <AvatarFallback className="bg-primary-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 7.2 Profile Edit Page

**Files to Create:**
- `src/app/profile/edit/page.tsx` (NEW)

**Implementation:**
```typescript
// src/app/profile/edit/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/user-avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: user?.unsafeMetadata?.bio as string || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      // Update Clerk profile
      await user?.update({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio: data.bio,
        },
      });

      toast.success('Profile updated successfully!');
      router.push('/account');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-dark">Edit Profile</h1>
          <Link href="/account">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <UserAvatar size="xl" editable />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Click the avatar to upload a new profile picture
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg bg-white p-6 shadow space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

          {/* First Name */}
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="mt-1"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className="mt-1"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username (Optional)</Label>
            <Input
              id="username"
              {...register('username')}
              className="mt-1"
              placeholder="@username"
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              className="mt-1"
              rows={4}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/account')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 7.3 Update Account Page with Avatar

**Files to Modify:**
- `src/app/account/page.tsx` (UPDATE)

**Changes:**
```typescript
import { UserAvatar } from '@/components/user-avatar';

// In the User Profile Card section, replace the img tag:
<div className="flex items-start gap-4">
  <UserAvatar size="xl" />
  {/* Rest of profile info */}
</div>

// Add Edit Profile button:
<div className="mb-8 flex items-center justify-between">
  <h1 className="text-4xl font-bold text-primary-dark">My Account</h1>
  <div className="flex gap-2">
    <Link href="/profile/edit">
      <Button variant="outline">
        <User className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
    </Link>
    <Link href="/settings">
      <Button variant="default">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </Link>
  </div>
</div>
```

---

## Phase 8: Social Account Expansion

**Priority**: 🟡 Medium  
**Estimated Time**: 6-8 hours  
**Impact**: More sign-in options for users

### 8.1 Add Facebook OAuth

**Clerk Dashboard Setup:**
1. Go to https://dashboard.clerk.com
2. User & Authentication → Social Connections
3. Enable Facebook
4. Add Facebook App ID and Secret

**Frontend Implementation:**
```typescript
// src/app/settings/page.tsx - Add Facebook section

const facebookAccount = user?.externalAccounts?.find(
  (account) => account.provider === 'oauth_facebook'
);

// Add Facebook card similar to Google:
<div className="border-b border-gray-200 pb-4 mt-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24">
          <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
      <div>
        <p className="font-medium text-gray-900">Facebook</p>
        <p className="text-sm text-gray-600">
          {facebookAccount ? (
            <span className="text-green-600">✓ Connected</span>
          ) : (
            'Not connected'
          )}
        </p>
      </div>
    </div>
    {/* Link/Unlink buttons similar to Google */}
  </div>
</div>
```

### 8.2 Add Apple Sign In

**Implementation similar to Facebook, with Apple-specific styling:**
```typescript
// Apple icon SVG
<svg className="h-5 w-5" viewBox="0 0 24 24">
  <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
</svg>
```

### 8.3 Backend API Updates

**Required backend endpoints:**
```typescript
POST   /auth/social/link/facebook
DELETE /auth/social/unlink/facebook
POST   /auth/social/link/apple
DELETE /auth/social/unlink/apple
```

---

## Phase 9: Advanced Security Features

**Priority**: 🔴 Critical  
**Estimated Time**: 10-12 hours  
**Impact**: Essential for production security

### 9.1 Two-Factor Authentication (2FA)

**Files to Create:**
- `src/app/settings/security/page.tsx` (NEW)
- `src/components/two-factor-setup.tsx` (NEW)

**Implementation:**
```typescript
// src/components/two-factor-setup.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Shield, Smartphone, Key } from 'lucide-react';

export function TwoFactorSetup() {
  const { user } = useUser();
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startSetup = async () => {
    try {
      // Enable TOTP via Clerk
      const totp = await user?.createTOTP();
      setSecret(totp?.secret || '');
      setQrCode(totp?.uri || '');
      setStep('setup');
    } catch (error) {
      toast.error('Failed to start 2FA setup');
    }
  };

  const verifyAndEnable = async () => {
    try {
      await user?.verifyTOTP({ code: verificationCode });
      
      // Generate backup codes
      const codes = await user?.createBackupCodes();
      setBackupCodes(codes || []);
      
      setStep('verify');
      toast.success('2FA enabled successfully!');
    } catch (error) {
      toast.error('Invalid verification code');
    }
  };

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      await user?.disableTOTP();
      setStep('initial');
      toast.success('2FA disabled');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  const is2FAEnabled = user?.twoFactorEnabled;

  if (step === 'initial') {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600">
              {is2FAEnabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>

        {is2FAEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">2FA is currently enabled</span>
            </div>
            <Button variant="outline" onClick={disable2FA}>
              Disable 2FA
            </Button>
          </div>
        ) : (
          <Button onClick={startSetup}>
            Enable Two-Factor Authentication
          </Button>
        )}
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Set Up Authenticator App
        </h3>

        {/* Step 1: Download App */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Step 1: Download App</h4>
          </div>
          <p className="text-sm text-gray-600 ml-7">
            Download an authenticator app like Google Authenticator, Authy, or 1Password.
          </p>
        </div>

        {/* Step 2: Scan QR Code */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Step 2: Scan QR Code</h4>
          </div>
          <div className="ml-7 flex flex-col items-start gap-4">
            <QRCodeSVG value={qrCode} size={200} />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Or enter this code manually:
              </p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                {secret}
              </code>
            </div>
          </div>
        </div>

        {/* Step 3: Verify */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">
            Step 3: Enter Verification Code
          </h4>
          <Input
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="max-w-xs"
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={verifyAndEnable} disabled={verificationCode.length !== 6}>
            Verify and Enable
          </Button>
          <Button variant="outline" onClick={() => setStep('initial')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          2FA Enabled Successfully!
        </h3>

        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">
            Save Your Backup Codes
          </h4>
          <p className="text-sm text-yellow-800 mb-4">
            Store these codes in a safe place. You can use them to access your account if you lose your phone.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code) => (
              <code key={code} className="bg-white px-3 py-2 rounded">
                {code}
              </code>
            ))}
          </div>
        </div>

        <Button onClick={() => setStep('initial')}>
          Done
        </Button>
      </div>
    );
  }

  return null;
}
```

### 9.2 Session Management

**Files to Create:**
- `src/components/active-sessions.tsx` (NEW)

**Implementation:**
```typescript
// src/components/active-sessions.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Laptop, Smartphone, Monitor, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  status: string;
  lastActiveAt: Date;
  expireAt: Date;
  client: {
    deviceType: string;
    browserName: string;
    ipAddress: string;
    city: string;
    country: string;
  };
}

export function ActiveSessions() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      const userSessions = await user?.getSessions();
      setSessions(userSessions as Session[] || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session?')) {
      return;
    }

    try {
      await user?.sessions.find(s => s.id === sessionId)?.revoke();
      toast.success('Session ended successfully');
      loadSessions();
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Active Sessions
      </h3>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between border-b pb-4 last:border-0"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {getDeviceIcon(session.client.deviceType)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {session.client.browserName} on {session.client.deviceType}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.client.city}, {session.client.country}
                  </span>
                  <span>{session.client.ipAddress}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last active: {new Date(session.lastActiveAt).toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => revokeSession(session.id)}
            >
              End Session
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9.3 Account Activity Log

**Files to Create:**
- `src/app/settings/activity/page.tsx` (NEW)

**Implementation:**
```typescript
// Simplified activity log showing Clerk events
'use client';

import { useUser } from '@clerk/nextjs';
import { Shield, LogIn, LogOut, Settings, User } from 'lucide-react';

export default function ActivityPage() {
  const { user } = useUser();

  // In production, fetch from backend API
  const activities = [
    {
      type: 'login',
      description: 'Signed in with Google',
      timestamp: new Date(),
      ip: '192.168.1.1',
    },
    {
      type: 'profile_update',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 86400000),
      ip: '192.168.1.1',
    },
    {
      type: 'security',
      description: 'Enabled two-factor authentication',
      timestamp: new Date(Date.now() - 172800000),
      ip: '192.168.1.1',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-5 w-5 text-green-600" />;
      case 'logout':
        return <LogOut className="h-5 w-5 text-gray-600" />;
      case 'security':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'profile_update':
        return <User className="h-5 w-5 text-purple-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Account Activity
        </h1>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border-b pb-4 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{activity.timestamp.toLocaleString()}</span>
                    <span>IP: {activity.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Quick Win Improvements

**Priority**: 🟢 Low (but high ROI)  
**Estimated Time**: 2-4 hours total

### 1. Add "Remember Me" Functionality
Already supported by Clerk - just enable persistent sessions:
```typescript
<ClerkProvider
  appearance={{/* ... */}}
  // Add this:
  sessionRefresh={{
    timeout: 60 * 1000, // Refresh every 60 seconds
  }}
>
```

### 2. Email Verification Badge
Show verified email badge in account:
```typescript
{user?.primaryEmailAddress?.verification?.status === 'verified' && (
  <Badge variant="success" className="gap-1">
    <CheckCircle className="h-3 w-3" />
    Email Verified
  </Badge>
)}
```

### 3. Account Deletion
Add to settings page:
```typescript
<Button
  variant="destructive"
  onClick={async () => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      await user?.delete();
      window.location.href = '/';
    }
  }}
>
  Delete Account
</Button>
```

### 4. Export User Data (GDPR Compliance)
```typescript
const exportUserData = async () => {
  const data = {
    profile: {
      id: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName,
      createdAt: user?.createdAt,
    },
    // Add more data from backend
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-data.json';
  a.click();
};
```

---

## Long-term Roadmap

### Phase 11: Mobile App Integration
- React Native with Clerk SDK
- Biometric authentication (Face ID, Touch ID)
- Push notification authentication

### Phase 12: Enterprise Features
- SAML SSO for enterprise customers
- Custom OAuth providers
- Organization management

### Phase 13: Advanced Analytics
- User behavior tracking
- Authentication success rates
- Session duration analytics

---

## Implementation Priority Matrix

| Feature | Priority | Time | Impact | Complexity |
|---------|----------|------|--------|------------|
| User Avatar Upload | 🔥 High | 3h | High | Low |
| Profile Edit Page | 🔥 High | 4h | High | Low |
| Loading Skeletons | 🔥 High | 2h | Medium | Low |
| Toast Notifications | 🔥 High | 1h | Medium | Low |
| Two-Factor Auth | 🔴 Critical | 8h | Very High | High |
| Session Management | 🔴 Critical | 6h | High | Medium |
| Facebook OAuth | 🟡 Medium | 4h | Medium | Low |
| Apple Sign In | 🟡 Medium | 4h | Medium | Medium |
| Activity Log | 🟡 Medium | 6h | Medium | Medium |
| Account Deletion | 🟢 Low | 2h | Low | Low |
| Export Data | 🟢 Low | 3h | Low | Low |

---

## Next Steps Action Plan

### Week 1: User Experience Polish
1. ✅ Implement loading skeletons
2. ✅ Replace alerts with toast notifications
3. ✅ Add smooth transitions with Framer Motion
4. ✅ Implement error boundaries

### Week 2: Profile Management
1. ✅ Create UserAvatar component
2. ✅ Build profile edit page
3. ✅ Integrate avatar upload
4. ✅ Test profile updates

### Week 3: Security Hardening
1. ✅ Implement 2FA setup flow
2. ✅ Add session management UI
3. ✅ Create activity log
4. ✅ Test security features

### Week 4: Social Expansion & Polish
1. ✅ Add Facebook OAuth
2. ✅ Add Apple Sign In
3. ✅ Implement quick wins
4. ✅ Final testing & bug fixes

---

## Resources & References

### Clerk Documentation
- [User Profile Management](https://clerk.com/docs/users/overview)
- [Two-Factor Authentication](https://clerk.com/docs/authentication/configuration/two-factor)
- [Social Connections](https://clerk.com/docs/authentication/social-connections/overview)
- [Session Management](https://clerk.com/docs/authentication/configuration/session-options)

### Design Inspiration
- [Clerk Dashboard](https://dashboard.clerk.com)
- [GitHub Settings](https://github.com/settings/profile)
- [Vercel Account](https://vercel.com/account)

### Libraries to Consider
- `qrcode.react` - QR code generation for 2FA
- `react-dropzone` - Better file upload UX
- `react-image-crop` - Avatar cropping
- `date-fns` - Better date formatting

---

## Success Metrics

Track these metrics to measure enhancement success:

1. **User Engagement**
   - Profile completion rate
   - Avatar upload rate
   - Social account linking rate

2. **Security**
   - 2FA adoption rate
   - Average session duration
   - Account recovery requests

3. **Performance**
   - Page load times
   - Avatar upload success rate
   - API response times

4. **User Satisfaction**
   - User feedback scores
   - Support ticket reduction
   - Feature usage analytics

---

**Last Updated**: January 2025  
**Next Review**: After Phase 6 completion  
**Maintained By**: Development Team
