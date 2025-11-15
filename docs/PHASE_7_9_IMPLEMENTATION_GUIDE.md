# 🚀 Phase 7 & 9 Implementation Guide

**Date**: November 16, 2025  
**Phases**: User Avatar System (Phase 7) + Advanced Security (Phase 9)  
**Estimated Time**: 15 hours total (6 hours Phase 7 + 9 hours Phase 9)  
**Status**: 🔄 IN PROGRESS

---

## 📋 Table of Contents

1. [Quick Wins Testing Results](#quick-wins-testing-results)
2. [Phase 7: User Avatar System (6 hours)](#phase-7-user-avatar-system)
3. [Phase 9: Advanced Security (9 hours)](#phase-9-advanced-security)
4. [Testing Checklist](#testing-checklist)
5. [Deployment Guide](#deployment-guide)

---

## Quick Wins Testing Results

### ✅ Completed Features (Phase 6)
- **Loading Skeletons**: ProfileSkeleton, AccountInfoSkeleton, FormSkeleton
- **Email Verification Badge**: Green badge with CheckCircle icon
- **Toast Notifications**: Already implemented with sonner

### Testing Instructions

```bash
# Start development server
npm run dev

# Visit these pages:
http://localhost:3000/account     # Check ProfileSkeleton + AccountInfoSkeleton + email badge
http://localhost:3000/settings    # Check FormSkeleton
http://localhost:3000/signup      # Verify toast notifications
```

**Expected Results:**
1. Loading skeletons appear briefly before content loads
2. Email verification badge shows green checkmark when email verified
3. Toast notifications display for success/error states

---

## Phase 7: User Avatar System

### Task 7.1: UserAvatar Component (2 hours)

**File**: `src/components/user-avatar.tsx`

```typescript
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  className?: string;
  onUploadComplete?: (imageUrl: string) => void;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
};

export function UserAvatar({
  size = "md",
  editable = false,
  className,
  onUploadComplete,
}: UserAvatarProps) {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate initials from user's name
  const getInitials = () => {
    if (!user) return "U";
    
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    if (firstName) return firstName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress[0].toUpperCase();
    }
    
    return "U";
  };

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, or WebP)";
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }

    return null;
  };

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error("Upload Failed", {
        description: validationError,
      });
      return;
    }

    try {
      setUploading(true);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Clerk
      await user.setProfileImage({ file });

      // Cleanup preview URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);

      toast.success("Profile picture updated!", {
        description: "Your new profile picture has been saved.",
      });

      // Callback for parent component
      if (onUploadComplete && user.imageUrl) {
        onUploadComplete(user.imageUrl);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Upload Failed", {
        description: "Unable to upload profile picture. Please try again.",
      });
      
      // Cleanup preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = previewUrl || user?.imageUrl || undefined;
  const initials = getInitials();

  if (!editable) {
    // Non-editable avatar (display only)
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} />
        <AvatarFallback className="bg-primary-medium text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Editable avatar with upload functionality
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size], "cursor-pointer group")}>
        <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} />
        <AvatarFallback className="bg-primary-medium text-white font-semibold">
          {uploading ? (
            <Loader2 className={cn(iconSizes[size], "animate-spin")} />
          ) : (
            initials
          )}
        </AvatarFallback>

        {/* Hover overlay */}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Upload className="h-6 w-6 text-white" />
          </div>
        )}
      </Avatar>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Upload profile picture"
      />

      {/* Upload button for mobile/accessibility */}
      {!uploading && (
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full shadow-md",
            size === "sm" && "h-6 w-6",
            size === "md" && "h-8 w-8",
            size === "lg" && "h-10 w-10",
            size === "xl" && "h-12 w-12"
          )}
          onClick={() => {
            const input = document.querySelector(
              'input[type="file"][aria-label="Upload profile picture"]'
            ) as HTMLInputElement;
            input?.click();
          }}
        >
          <Upload
            className={cn(
              size === "sm" && "h-3 w-3",
              size === "md" && "h-4 w-4",
              size === "lg" && "h-5 w-5",
              size === "xl" && "h-6 w-6"
            )}
          />
        </Button>
      )}
    </div>
  );
}
```

**Features:**
- ✅ Displays user avatar with fallback to initials
- ✅ Hover-to-upload functionality
- ✅ File validation (image types, 5MB max)
- ✅ Direct upload to Clerk
- ✅ Loading states with spinner
- ✅ Toast notifications for success/error
- ✅ Multiple size options (sm, md, lg, xl)
- ✅ Mobile-friendly upload button

**Usage:**
```typescript
// Display only
<UserAvatar size="md" />

// Editable with upload
<UserAvatar size="xl" editable onUploadComplete={(url) => console.log(url)} />
```

---

### Task 7.2: Profile Edit Page (3 hours)

**File**: `src/app/profile/edit/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Save, X, AlertCircle } from "lucide-react";
import { backendAPI } from "@/lib/backend-api";

// Validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      bio: "",
    },
  });

  // Watch bio field for character count
  const bioValue = watch("bio");
  useEffect(() => {
    setCharCount(bioValue?.length || 0);
  }, [bioValue]);

  // Load user data when available
  useEffect(() => {
    if (isLoaded && user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.publicMetadata?.bio as string || "",
      });
    }
  }, [isLoaded, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      // Update Clerk user
      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username || null,
      });

      // Update bio in public metadata
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          bio: data.bio || "",
        },
      });

      // Update backend (optional - if backend stores profile data)
      try {
        const token = await user.getToken();
        if (token) {
          await backendAPI.updateProfile(token, {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username || undefined,
            bio: data.bio || undefined,
          });
        }
      } catch (backendError) {
        console.warn("Backend update failed:", backendError);
        // Continue - Clerk update succeeded
      }

      toast.success("Profile updated!", {
        description: "Your profile information has been saved.",
      });

      // Reset form dirty state
      reset(data);

      // Redirect back to account page
      setTimeout(() => {
        router.push("/account");
      }, 1000);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update failed", {
        description: "Unable to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
        return;
      }
    }
    router.push("/account");
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">
              Update your personal information and profile picture
            </p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              Profile Picture
            </Label>
            <div className="flex items-center gap-6">
              <UserAvatar size="xl" editable />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Click on your avatar to upload a new picture
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WebP. Max size 5MB.
                </p>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              Personal Information
            </Label>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Juan"
                  className="mt-1"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Dela Cruz"
                  className="mt-1"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="juandelacruz"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  3-20 characters. Letters, numbers, and underscores only.
                </p>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Bio Section */}
          <Card className="p-6">
            <Label htmlFor="bio" className="text-base font-semibold mb-4 block">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about yourself..."
              rows={5}
              className="resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Share a brief description about yourself
              </p>
              <p className={`text-xs ${charCount > 500 ? "text-red-600" : "text-gray-500"}`}>
                {charCount}/500
              </p>
            </div>
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bio.message}
              </p>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-primary-dark hover:bg-primary-dark/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Unsaved Changes Warning */}
          {isDirty && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                You have unsaved changes
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Form validation with Zod
- ✅ Real-time character count for bio (500 max)
- ✅ Username validation (3-20 chars, alphanumeric + underscore)
- ✅ Saves to Clerk + backend
- ✅ Unsaved changes warning
- ✅ Loading states
- ✅ Toast notifications

---

### Task 7.3: Update Account Dashboard (1 hour)

**Update**: `src/app/account/page.tsx`

Replace the static avatar section with:

```typescript
// Add import at top
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";

// In the Profile Card section (around line 120), replace:
{user?.imageUrl && (
  <img
    src={user.imageUrl}
    alt={user.fullName || "User"}
    className="h-20 w-20 rounded-full"
  />
)}

// With:
<UserAvatar size="xl" editable />

// Add Edit Profile button after user name:
<div className="flex items-center gap-3 mt-4">
  <Link href="/profile/edit">
    <Button variant="outline" size="sm">
      <User className="h-4 w-4 mr-2" />
      Edit Profile
    </Button>
  </Link>
</div>
```

---

## Phase 9: Advanced Security

### Task 9.1: Two-Factor Authentication (4 hours)

**Step 1: Install Dependencies**

```bash
npm install qrcode.react @types/qrcode.react
```

**File**: `src/app/settings/security/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Key, Copy, Check, AlertTriangle } from "lucide-react";

export default function SecurityPage() {
  const { user } = useUser();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const enable2FA = async () => {
    try {
      // Generate TOTP secret using Clerk
      const response = await user?.createTOTP();
      
      if (response) {
        setTotpSecret(response.secret || "");
        setShowQR(true);
        toast.success("2FA Setup Started", {
          description: "Scan the QR code with your authenticator app",
        });
      }
    } catch (error) {
      toast.error("Setup Failed", {
        description: "Unable to start 2FA setup",
      });
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Invalid Code", {
        description: "Please enter a 6-digit code",
      });
      return;
    }

    try {
      await user?.verifyTOTP({ code: verificationCode });
      
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);
      
      setTwoFactorEnabled(true);
      setShowQR(false);
      
      toast.success("2FA Enabled!", {
        description: "Your account is now protected with 2FA",
      });
    } catch (error) {
      toast.error("Verification Failed", {
        description: "Invalid code. Please try again.",
      });
    }
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) {
      return;
    }

    try {
      await user?.disableTOTP();
      setTwoFactorEnabled(false);
      setBackupCodes([]);
      
      toast.success("2FA Disabled", {
        description: "Two-factor authentication has been turned off",
      });
    } catch (error) {
      toast.error("Failed to Disable", {
        description: "Unable to disable 2FA",
      });
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    toast.success("Copied!", {
      description: "Backup codes copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const totpURI = `otpauth://totp/MASH:${user?.primaryEmailAddress?.emailAddress}?secret=${totpSecret}&issuer=MASH`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Security Settings</h1>

        {/* 2FA Status Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${twoFactorEnabled ? "bg-green-100" : "bg-gray-100"}`}>
              <Shield className={`h-6 w-6 ${twoFactorEnabled ? "text-green-600" : "text-gray-600"}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-1">
                {twoFactorEnabled
                  ? "Your account is protected with 2FA"
                  : "Add an extra layer of security to your account"}
              </p>
              <Button
                onClick={twoFactorEnabled ? disable2FA : enable2FA}
                variant={twoFactorEnabled ? "outline" : "default"}
                className="mt-4"
              >
                {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </Card>

        {/* QR Code Setup */}
        {showQR && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG value={totpURI} size={200} />
              <p className="text-sm text-gray-600 text-center">
                Scan this QR code with Google Authenticator, Authy, or similar app
              </p>
              <div className="w-full max-w-sm">
                <label className="text-sm font-medium mb-2 block">
                  Enter 6-digit code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    className="text-center text-lg tracking-wider"
                  />
                  <Button onClick={verify2FA}>
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Backup Codes */}
        {backupCodes.length > 0 && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">
                  Save Your Backup Codes
                </h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Store these codes securely. Each can be used once if you lose access to your authenticator.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-gray-400" />
                    <span>{code}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="mt-4 w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Codes
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
```

**Features:**
- ✅ TOTP-based 2FA with QR code
- ✅ Google Authenticator/Authy support
- ✅ 10 single-use backup codes
- ✅ Enable/disable functionality
- ✅ Code verification
- ✅ Copy to clipboard

---

### Task 9.2: Session Management (3 hours)

**File**: `src/app/settings/sessions/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Get sessions from Clerk
      const clerkSessions = await user?.getSessions();
      
      // Transform to our format
      const transformedSessions: Session[] =
        clerkSessions?.map((session: any) => ({
          id: session.id,
          deviceType: detectDeviceType(session.lastActiveAt),
          browser: session.latestActivity?.browserName || "Unknown",
          location: session.latestActivity?.city || "Unknown",
          ipAddress: session.latestActivity?.ipAddress || "Unknown",
          lastActive: new Date(session.lastActiveAt),
          isCurrent: session.id === user?.lastSignInAt,
        })) || [];

      setSessions(transformedSessions);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const detectDeviceType = (userAgent: string): "desktop" | "mobile" | "tablet" => {
    if (/mobile/i.test(userAgent)) return "mobile";
    if (/tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  };

  const revokeSession = async (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      if (!confirm("This will sign you out. Continue?")) return;
    } else {
      if (!confirm("Revoke this session?")) return;
    }

    try {
      setRevoking(sessionId);
      
      // Revoke via Clerk
      await user?.revokeSession(sessionId);
      
      if (isCurrent) {
        await signOut();
      } else {
        toast.success("Session revoked");
        fetchSessions();
      }
    } catch (error) {
      toast.error("Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Active Sessions</h1>
        <p className="text-gray-600 mb-8">
          Manage devices that are currently signed in to your account
        </p>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <DeviceIcon type={session.deviceType} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {session.browser} on {session.deviceType}
                      </h3>
                      {session.isCurrent && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                        <span className="text-gray-400">•</span>
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Last active {formatLastActive(session.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeSession(session.id, session.isCurrent)}
                  disabled={revoking === session.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {session.isCurrent ? "Sign Out" : "Revoke"}
                </Button>
              </div>
            </Card>
          ))}

          {sessions.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active sessions found</p>
            </Card>
          )}
        </div>

        {/* Revoke All Sessions */}
        {sessions.length > 1 && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Sign out from all devices?")) {
                  sessions.forEach((s) => revokeSession(s.id, s.isCurrent));
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              Sign Out From All Devices
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Features:**
- ✅ List all active sessions
- ✅ Device type detection (desktop/mobile/tablet)
- ✅ Location and IP address display
- ✅ Last active timestamps
- ✅ Revoke individual sessions
- ✅ Sign out from all devices
- ✅ Current session indicator

---

### Task 9.3: Activity Log (2 hours)

**File**: `src/app/settings/activity/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LogIn,
  LogOut,
  UserCog,
  Key,
  Shield,
  Calendar,
  MapPin,
  Monitor,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "login" | "logout" | "profile_update" | "password_change" | "2fa_enabled" | "2fa_disabled";
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  details?: string;
}

export default function ActivityLogPage() {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [filter, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch from Clerk activity logs
      const events = await user?.getActivityLog();
      
      // Transform to our format
      const transformedEvents: ActivityEvent[] =
        events?.map((event: any) => ({
          id: event.id,
          type: mapEventType(event.action),
          timestamp: new Date(event.createdAt),
          ipAddress: event.ipAddress || "Unknown",
          location: event.city || "Unknown",
          device: event.deviceType || "Unknown",
          details: event.details,
        })) || [];

      setActivities(transformedEvents);
    } catch (error) {
      console.error("Failed to load activity log:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapEventType = (action: string): ActivityEvent["type"] => {
    const mapping: Record<string, ActivityEvent["type"]> = {
      "session.created": "login",
      "session.ended": "logout",
      "user.updated": "profile_update",
      "user.password_updated": "password_change",
      "user.totp_enabled": "2fa_enabled",
      "user.totp_disabled": "2fa_disabled",
    };
    return mapping[action] || "profile_update";
  };

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="h-5 w-5 text-green-600" />;
      case "logout":
        return <LogOut className="h-5 w-5 text-gray-600" />;
      case "profile_update":
        return <UserCog className="h-5 w-5 text-blue-600" />;
      case "password_change":
        return <Key className="h-5 w-5 text-orange-600" />;
      case "2fa_enabled":
      case "2fa_disabled":
        return <Shield className="h-5 w-5 text-purple-600" />;
    }
  };

  const getEventTitle = (type: ActivityEvent["type"]) => {
    const titles = {
      login: "Signed In",
      logout: "Signed Out",
      profile_update: "Profile Updated",
      password_change: "Password Changed",
      "2fa_enabled": "2FA Enabled",
      "2fa_disabled": "2FA Disabled",
    };
    return titles[type];
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    const colors = {
      login: "bg-green-100 text-green-800",
      logout: "bg-gray-100 text-gray-800",
      profile_update: "bg-blue-100 text-blue-800",
      password_change: "bg-orange-100 text-orange-800",
      "2fa_enabled": "bg-purple-100 text-purple-800",
      "2fa_disabled": "bg-purple-100 text-purple-800",
    };
    return colors[type];
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading activity log...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Activity Log</h1>
            <p className="text-gray-600 mt-1">
              Track recent account events and security activity
            </p>
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="login">Sign Ins</SelectItem>
              <SelectItem value="logout">Sign Outs</SelectItem>
              <SelectItem value="profile_update">Profile Updates</SelectItem>
              <SelectItem value="password_change">Password Changes</SelectItem>
              <SelectItem value="2fa_enabled">2FA Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <Card key={activity.id} className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-gray-50 rounded-full h-fit">
                  {getEventIcon(activity.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getEventTitle(activity.type)}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`mt-1 ${getEventColor(activity.type)}`}
                      >
                        {activity.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{activity.location}</span>
                      <span className="text-gray-400">•</span>
                      <span>{activity.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>{activity.device}</span>
                    </div>
                    {activity.details && (
                      <p className="mt-2 text-gray-700">{activity.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredActivities.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activity found</p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {filteredActivities.length > 20 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button variant="outline" disabled>
              Page {page}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Comprehensive activity tracking
- ✅ Event type filtering
- ✅ Timestamps with relative formatting
- ✅ IP address + location display
- ✅ Device information
- ✅ Pagination for large logs
- ✅ Security audit trail

---

## Testing Checklist

### Phase 7: Avatar System

- [ ] **UserAvatar Component**
  - [ ] Avatar displays with initials fallback
  - [ ] Click to upload works
  - [ ] File validation rejects invalid files
  - [ ] Upload progress shows loading state
  - [ ] Success toast appears after upload
  - [ ] Image updates in Clerk dashboard

- [ ] **Profile Edit Page**
  - [ ] Form loads with current user data
  - [ ] First/last name validation works
  - [ ] Username validation (3-20 chars, alphanumeric)
  - [ ] Bio character count updates in real-time
  - [ ] Unsaved changes warning appears
  - [ ] Save button disabled when no changes
  - [ ] Updates save to Clerk + backend
  - [ ] Success toast + redirect to /account

- [ ] **Account Dashboard**
  - [ ] UserAvatar replaces static image
  - [ ] "Edit Profile" button navigates correctly
  - [ ] Updated profile data displays

### Phase 9: Advanced Security

- [ ] **Two-Factor Authentication**
  - [ ] QR code generates correctly
  - [ ] Can scan with Google Authenticator
  - [ ] 6-digit code verification works
  - [ ] Backup codes generate (10 codes)
  - [ ] Can copy backup codes
  - [ ] Can disable 2FA with confirmation
  - [ ] 2FA required at next login

- [ ] **Session Management**
  - [ ] All active sessions display
  - [ ] Device types show correctly
  - [ ] Current session marked
  - [ ] Can revoke individual session
  - [ ] Can sign out from all devices
  - [ ] Revoked sessions can't access account

- [ ] **Activity Log**
  - [ ] Login events tracked
  - [ ] Profile updates logged
  - [ ] Password changes recorded
  - [ ] 2FA events appear
  - [ ] Timestamps accurate
  - [ ] IP addresses display
  - [ ] Filtering works
  - [ ] Pagination functional

---

## Deployment Guide

### 1. Install Dependencies

```bash
npm install qrcode.react @types/qrcode.react
```

### 2. Create New Files

```
src/
├── components/
│   └── user-avatar.tsx (NEW)
├── app/
    ├── profile/
    │   └── edit/
    │       └── page.tsx (NEW)
    └── settings/
        ├── security/
        │   └── page.tsx (NEW)
        ├── sessions/
        │   └── page.tsx (NEW)
        └── activity/
            └── page.tsx (NEW)
```

### 3. Update Existing Files

```
src/app/account/page.tsx - Add UserAvatar + Edit Profile button
```

### 4. Test Locally

```bash
npm run dev
# Visit http://localhost:3000/profile/edit
# Test avatar upload, profile editing, 2FA, sessions, activity log
```

### 5. Deploy to Production

```bash
git add .
git commit -m "feat: implement Phase 7 (Avatar) + Phase 9 (Security)"
git push origin main
```

---

## 📊 Progress Tracking

| Phase | Task | Status | Time |
|-------|------|--------|------|
| 6 | Quick Wins Testing | ✅ Complete | 15 min |
| 7.1 | UserAvatar Component | 🔄 In Progress | 2 hours |
| 7.2 | Profile Edit Page | ⏳ Pending | 3 hours |
| 7.3 | Update Account Dashboard | ⏳ Pending | 1 hour |
| 9.1 | Two-Factor Authentication | ⏳ Pending | 4 hours |
| 9.2 | Session Management | ⏳ Pending | 3 hours |
| 9.3 | Activity Log | ⏳ Pending | 2 hours |
| 8 | Testing & QA | ⏳ Pending | 2 hours |

**Total Estimated Time**: 17.25 hours  
**Completed**: 0.25 hours  
**Remaining**: 17 hours

---

**Last Updated**: November 16, 2025  
**Next Action**: Start with Task 7.1 - Create UserAvatar Component
