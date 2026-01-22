"use client";

import React, { useCallback, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Image from "next/image";
import { Upload, X, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  alt: string;
  isPrimary: boolean;
  sanityAssetId?: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  error?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  error,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);

      // Validate file count
      if (images.length + fileArray.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Validate and process files
      const validFiles: UploadedImage[] = [];
      for (const file of fileArray) {
        // Check file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Check file size
        if (file.size > maxFileSize) {
          toast.error(
            `${file.name} exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`
          );
          continue;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          url,
          alt: "",
          isPrimary: images.length === 0 && validFiles.length === 0, // First image is primary
        });
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles]);
        toast.success(`${validFiles.length} image(s) added`);
      }
    },
    [images, maxImages, maxFileSize, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDeleteImage = useCallback(
    (imageId: string) => {
      const updatedImages = images.filter((img) => img.id !== imageId);

      // If deleted image was primary, make first image primary
      if (updatedImages.length > 0) {
        const wasPrimary = images.find((img) => img.id === imageId)?.isPrimary;
        if (wasPrimary) {
          updatedImages[0].isPrimary = true;
        }
      }

      onImagesChange(updatedImages);
      toast.success("Image removed");
    },
    [images, onImagesChange]
  );

  const handleUpdateAlt = useCallback(
    (imageId: string, alt: string) => {
      const updatedImages = images.map((img) =>
        img.id === imageId ? { ...img, alt } : img
      );
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(images);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update primary flag based on position
      const updatedItems = items.map((item, index) => ({
        ...item,
        isPrimary: index === 0,
      }));

      onImagesChange(updatedItems);
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            error && "border-destructive"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                Drag & drop images or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Up to {maxImages} images, max{" "}
                {Math.round(maxFileSize / 1024 / 1024)}MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Image Grid with Drag & Drop */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Product Images ({images.length}/{maxImages})
            </Label>
            <p className="text-xs text-muted-foreground">
              Drag to reorder • First image is primary
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images-grid">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {images.map((image, index) => (
                    <Draggable
                      key={image.id}
                      draggableId={image.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group relative border rounded-lg p-3 bg-card transition-shadow",
                            snapshot.isDragging &&
                              "shadow-lg ring-2 ring-primary",
                            image.isPrimary && "border-primary"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-2"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            {/* Image Preview */}
                            <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
                              <Image
                                src={image.url}
                                alt={image.alt || "Product image"}
                                fill
                                className="object-cover"
                              />
                              {image.isPrimary && (
                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                  Primary
                                </div>
                              )}
                            </div>

                            {/* Alt Text Input */}
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`alt-${image.id}`}
                                className="text-xs mb-1 block"
                              >
                                Alt Text {index === 0 && "(Primary Image)"}
                              </Label>
                              <Input
                                id={`alt-${image.id}`}
                                placeholder="Describe this image..."
                                value={image.alt}
                                onChange={(e) =>
                                  handleUpdateAlt(image.id, e.target.value)
                                }
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Delete Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                              className="flex-shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
