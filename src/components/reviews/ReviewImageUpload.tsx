/**
 * ReviewImageUpload Component
 *
 * Drag-and-drop image upload for reviews using Cloudinary.
 * Supports max 5 images, each < 2MB, jpg/png/webp only.
 */

"use client";

import React, { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drkcpvmfc";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Mash-Automation";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface ReviewImageUploadProps {
  /** Current list of uploaded Cloudinary URLs */
  images: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Disable interaction during form submission */
  disabled?: boolean;
}

export function ReviewImageUpload({
  images,
  onChange,
  disabled = false,
}: ReviewImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - images.length - uploading.length;

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPG, PNG, and WebP images are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File must be under 2MB`;
    }
    return null;
  }, []);

  const uploadToCloudinary = useCallback(
    async (file: File, uploadId: string): Promise<string | null> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "reviews");

      try {
        const response = await fetch(UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url as string;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setUploading((prev) =>
          prev.map((img) =>
            img.id === uploadId ? { ...img, error: message, progress: 0 } : img
          )
        );
        return null;
      }
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}`);
        return;
      }

      // Validate all files first
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      }

      if (validFiles.length === 0) return;

      // Create uploading state entries
      const newUploading: UploadingImage[] = validFiles.map((file) => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 50,
      }));

      setUploading((prev) => [...prev, ...newUploading]);

      // Upload all files in parallel
      const results = await Promise.allSettled(
        newUploading.map(async (item) => {
          const url = await uploadToCloudinary(item.file, item.id);
          // Revoke object URL to free memory
          URL.revokeObjectURL(item.preview);
          return { id: item.id, url };
        })
      );

      const newUrls: string[] = [];
      const failedIds: string[] = [];

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.url) {
          newUrls.push(result.value.url);
          failedIds.push(result.value.id); // remove from uploading state
        } else if (result.status === "fulfilled") {
          // URL was null - error already set in uploadToCloudinary
        }
      }

      // Remove successful uploads from uploading state
      setUploading((prev) =>
        prev.filter(
          (img) =>
            !newUrls.length ||
            !results.some(
              (r) =>
                r.status === "fulfilled" &&
                r.value.url &&
                r.value.id === img.id
            )
        )
      );

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    },
    [images, onChange, remainingSlots, validateFile, uploadToCloudinary]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset input value so same file can be selected again
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [images, onChange]
  );

  const removeUploading = useCallback((id: string) => {
    setUploading((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const retryUpload = useCallback(
    async (item: UploadingImage) => {
      setUploading((prev) =>
        prev.map((img) =>
          img.id === item.id ? { ...img, error: undefined, progress: 50 } : img
        )
      );

      const url = await uploadToCloudinary(item.file, item.id);
      if (url) {
        URL.revokeObjectURL(item.preview);
        setUploading((prev) => prev.filter((img) => img.id !== item.id));
        onChange([...images, url]);
      }
    },
    [images, onChange, uploadToCloudinary]
  );

  return (
    <div className="space-y-3">
      {/* Uploaded + Uploading Thumbnails */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {/* Uploaded images */}
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border"
            >
              <Image
                src={url}
                alt={`Review photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Uploading images */}
          {uploading.map((item) => (
            <div
              key={item.id}
              className="relative w-20 h-20 rounded-lg overflow-hidden border"
            >
              <Image
                src={item.preview}
                alt="Uploading"
                fill
                className="object-cover opacity-50"
                sizes="80px"
              />
              {item.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <AlertCircle className="w-4 h-4 text-red-400 mb-1" />
                  <button
                    type="button"
                    onClick={() => retryUpload(item)}
                    className="text-[10px] text-white underline"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => removeUploading(item.id)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                    aria-label="Remove failed upload"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {remainingSlots > 0 && !disabled && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors
            ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          `}
        >
          <ImagePlus className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop photos or{" "}
            <span className="text-primary font-medium">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Max {MAX_IMAGES} images, 2MB each (JPG, PNG, WebP)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleInputChange}
            className="hidden"
            aria-label="Upload review images"
          />
        </div>
      )}

      {/* Counter */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES} photos uploaded
        </p>
      )}
    </div>
  );
}
