"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, Loader2, X, Upload, AlertCircle } from "lucide-react";
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
import {
  uploadProfilePicture,
  validateProfileImage,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/firebase";
import type { UploadProgress } from "@/lib/firebase";
import { getProfileAvatar, isDiceBearAvatar } from "@/lib/avatar";
import type { AvatarUser } from "@/lib/avatar";

interface ProfilePictureUploadProps {
  user: AvatarUser | null | undefined;
  onUploadComplete: (photoURL: string) => Promise<void>;
}

export function ProfilePictureUpload({
  user,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = getProfileAvatar(user);
  const isGenerated = isDiceBearAvatar(avatarUrl);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadProgress(null);
    setError(null);
    setIsDragging(false);
  }, [previewUrl]);

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
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    },
    [previewUrl],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset input so the same file can be re-selected
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

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user?.id) return;

    setUploading(true);
    setError(null);

    try {
      const { downloadURL } = await uploadProfilePicture(
        user.id,
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      await onUploadComplete(downloadURL);
      toast.success("Profile picture updated!");
      handleCloseDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, user?.id, onUploadComplete, handleCloseDialog]);

  const acceptString = ACCEPTED_IMAGE_TYPES.join(",");
  const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);

  return (
    <>
      {/* Avatar display with camera button */}
      <div className="relative flex-shrink-0">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg">
          <Image
            src={avatarUrl}
            alt={`${user?.displayName || user?.firstName || "User"} profile picture`}
            width={96}
            height={96}
            className="object-cover"
            unoptimized={isGenerated}
          />
        </div>
        <button
          type="button"
          onClick={handleOpenDialog}
          className="absolute bottom-0 right-0 p-2 bg-[#1E392A] rounded-full text-white hover:bg-[#2d5a42] transition-colors shadow-lg"
          aria-label="Change profile picture"
          data-testid="profile-picture-camera-btn"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Upload dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. Accepted formats: JPEG, PNG, WebP.
              Max size: {maxSizeMB} MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview or drop zone */}
            {previewUrl ? (
              <div className="relative flex items-center justify-center">
                <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-muted shadow-md">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setError(null);
                  }}
                  className="absolute top-0 right-12 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  aria-label="Remove selected image"
                  data-testid="profile-picture-remove-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#1E392A] bg-[#1E392A]/5"
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
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {isDragging
                      ? "Drop image here"
                      : "Click or drag an image here"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, or WebP up to {maxSizeMB} MB
                  </p>
                </div>
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

            {/* Upload progress */}
            {uploading && uploadProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
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
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-[#1E392A] hover:bg-[#2d5a42] text-white"
              data-testid="profile-picture-upload-btn"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
