"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  X,
  Upload,
  AlertCircle,
  ImagePlus,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  uploadProfilePicture,
  validateProfileImage,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/firebase";
import type { UploadProgress } from "@/lib/firebase";
import { getProfileAvatar, isDiceBearAvatar } from "@/lib/avatar";
import type { AvatarUser } from "@/lib/avatar";
import { ImageCropEditor } from "./ImageCropEditor";

interface ProfilePictureUploadProps {
  user: AvatarUser | null | undefined;
  onUploadComplete: (photoURL: string) => Promise<void>;
}

type UploadStep = "select" | "crop" | "uploading";

export function ProfilePictureUpload({
  user,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<UploadStep>("select");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = getProfileAvatar(user);
  const isGenerated = isDiceBearAvatar(avatarUrl);
  const hasCustomPhoto =
    user?.photoURL?.startsWith("data:") ||
    (user?.photoURL?.startsWith("http") &&
      !user?.photoURL?.includes("dicebear.com"));

  const resetState = useCallback(() => {
    setSelectedFile(null);
    if (rawPreviewUrl) {
      URL.revokeObjectURL(rawPreviewUrl);
    }
    setRawPreviewUrl(null);
    setCroppedDataUrl(null);
    setUploadProgress(null);
    setError(null);
    setIsDragging(false);
    setStep("select");
  }, [rawPreviewUrl]);

  const handleOpenDialog = useCallback(() => {
    resetState();
    setIsDialogOpen(true);
  }, [resetState]);

  const handleCloseDialog = useCallback(() => {
    resetState();
    setIsDialogOpen(false);
  }, [resetState]);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateProfileImage(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      if (rawPreviewUrl) {
        URL.revokeObjectURL(rawPreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setRawPreviewUrl(url);
      setStep("crop");
    },
    [rawPreviewUrl],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleCropComplete = useCallback((dataUrl: string) => {
    setCroppedDataUrl(dataUrl);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user?.id || !croppedDataUrl) return;

    setStep("uploading");
    setUploading(true);
    setError(null);

    try {
      await uploadProfilePicture(
        user.id,
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      await onUploadComplete(croppedDataUrl);
      toast.success("Profile picture updated successfully!");
      handleCloseDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      setStep("crop");
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, user?.id, croppedDataUrl, onUploadComplete, handleCloseDialog]);

  const handleRemovePhoto = useCallback(async () => {
    if (!user?.id) return;
    try {
      await onUploadComplete("");
      toast.success("Profile picture removed.");
      handleCloseDialog();
    } catch {
      toast.error("Failed to remove profile picture.");
    }
  }, [user?.id, onUploadComplete, handleCloseDialog]);

  const handleBackToSelect = useCallback(() => {
    setSelectedFile(null);
    if (rawPreviewUrl) {
      URL.revokeObjectURL(rawPreviewUrl);
    }
    setRawPreviewUrl(null);
    setCroppedDataUrl(null);
    setError(null);
    setStep("select");
  }, [rawPreviewUrl]);

  const acceptString = ACCEPTED_IMAGE_TYPES.join(",");
  const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);

  return (
    <>
      {/* Avatar display with camera button */}
      <div className="relative flex-shrink-0 group">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg transition-transform group-hover:scale-105">
          <Image
            src={avatarUrl}
            alt={`${user?.displayName || user?.firstName || "User"} profile picture`}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized={isGenerated}
          />
        </div>
        {/* Overlay on hover */}
        <div
          className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center cursor-pointer"
          onClick={handleOpenDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpenDialog();
            }
          }}
          aria-label="Change profile picture"
          data-testid="profile-picture-overlay"
        >
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {/* Camera badge */}
        <button
          type="button"
          onClick={handleOpenDialog}
          className="absolute bottom-0 right-0 p-2 bg-[#1E392A] rounded-full text-white hover:bg-[#2d5a42] transition-colors shadow-lg ring-2 ring-background"
          aria-label="Change profile picture"
          data-testid="profile-picture-camera-btn"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Upload dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-lg"
          data-testid="profile-picture-dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-[#1E392A]" />
              {step === "select" && "Update Profile Picture"}
              {step === "crop" && "Adjust Your Photo"}
              {step === "uploading" && "Uploading..."}
            </DialogTitle>
            <DialogDescription>
              {step === "select" &&
                `Upload a new profile picture. Accepted formats: JPEG, PNG, WebP. Max size: ${maxSizeMB} MB.`}
              {step === "crop" &&
                "Zoom and drag to adjust your photo. The circular area shows your final profile picture."}
              {step === "uploading" && "Your profile picture is being processed..."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Step 1: Select image */}
            {step === "select" && (
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="upload">Upload New</TabsTrigger>
                  <TabsTrigger value="current">Current Photo</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#1E392A] bg-[#1E392A]/5 scale-[1.02]"
                        : "border-muted-foreground/30 hover:border-[#1E392A]/50 hover:bg-muted/30"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    data-testid="profile-picture-dropzone"
                  >
                    <div className="p-4 rounded-full bg-[#1E392A]/10">
                      <Upload className="h-8 w-8 text-[#1E392A]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {isDragging
                          ? "Drop your image here"
                          : "Click to browse or drag an image"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, or WebP up to {maxSizeMB} MB
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="current" className="mt-4">
                  <div className="flex flex-col items-center gap-4 p-6">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted shadow-md">
                      <Image
                        src={avatarUrl}
                        alt="Current profile picture"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                        unoptimized={isGenerated}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {hasCustomPhoto
                        ? "Your current custom profile picture"
                        : "Auto-generated avatar based on your profile"}
                    </p>
                    {hasCustomPhoto && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemovePhoto}
                        data-testid="remove-photo-btn"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Step 2: Crop and adjust */}
            {step === "crop" && rawPreviewUrl && (
              <div className="flex flex-col items-center gap-4">
                <ImageCropEditor
                  imageSrc={rawPreviewUrl}
                  onCropComplete={handleCropComplete}
                  cropSize={220}
                  outputSize={256}
                  outputQuality={0.9}
                />

                {/* Preview comparison */}
                {croppedDataUrl && (
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg w-full" data-testid="crop-preview-comparison">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Preview</span>
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-border">
                        <Image
                          src={croppedDataUrl}
                          alt="Small preview"
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Profile</span>
                      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border">
                        <Image
                          src={croppedDataUrl}
                          alt="Profile preview"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground">
                        This is how your photo will look on your profile
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Uploading */}
            {step === "uploading" && (
              <div className="flex flex-col items-center gap-4 py-6">
                {croppedDataUrl && (
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#1E392A]/20 shadow-lg animate-pulse">
                    <Image
                      src={croppedDataUrl}
                      alt="Uploading"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                )}

                {uploadProgress && (
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                      <span className="font-medium">
                        {Math.round(uploadProgress.percentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E392A] rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(uploadProgress.percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        data-testid="profile-picture-progress"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptString}
              onChange={handleFileSelect}
              className="hidden"
              data-testid="profile-picture-file-input"
            />

            {/* Error display */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive"
                role="alert"
                data-testid="profile-picture-error"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {step === "select" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
            )}

            {step === "crop" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToSelect}
                >
                  <X className="h-4 w-4 mr-2" />
                  Choose Different
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!croppedDataUrl}
                  className="bg-[#1E392A] hover:bg-[#2d5a42] text-white"
                  data-testid="profile-picture-upload-btn"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Photo
                </Button>
              </>
            )}

            {step === "uploading" && (
              <Button type="button" variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Please wait...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
