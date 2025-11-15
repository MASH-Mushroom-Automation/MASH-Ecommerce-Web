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
        bio: (user.publicMetadata?.bio as string) || "",
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
