"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
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
