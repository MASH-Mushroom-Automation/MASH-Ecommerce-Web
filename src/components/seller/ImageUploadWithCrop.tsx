/**
 * Image Upload with Cropping Component
 * Handles image selection, cropping, optimization, and Sanity upload
 * Uses HTML5 Canvas for cropping (no external dependencies)
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ZoomIn, ZoomOut, Move, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processAndUploadImage, validateImage } from '@/lib/services/image-optimization.service';
import type { ImageUploadConfig } from '@/lib/types/seller-profile';

interface ImageUploadWithCropProps {
  config: ImageUploadConfig;
  currentImage?: string;
  onUploadComplete: (imageUrl: string, sanityRef: string, dimensions: { width: number; height: number }) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  description?: string;
}

export function ImageUploadWithCrop({
  config,
  currentImage,
  onUploadComplete,
  onUploadError,
  label,
  description,
}: ImageUploadWithCropProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crop state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImage(file, config);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setCropDialogOpen(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  }, [config, onUploadError]);

  // Mouse drag handlers for cropping
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle crop and upload
  const handleCropAndUpload = async () => {
    if (!selectedFile || !imageRef.current || !canvasRef.current) return;

    setUploading(true);
    setError(null);

    try {
      const img = imageRef.current;
      const canvas = canvasRef.current;

      // Calculate crop area based on aspect ratio
      const containerWidth = 600; // Preview container width
      const containerHeight = config.aspectRatio 
        ? containerWidth / config.aspectRatio 
        : 400;

      // Get actual image dimensions
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Calculate scale factor
      const scale = imgWidth / (containerWidth / zoom);

      // Calculate crop dimensions
      const cropWidth = containerWidth / zoom;
      const cropHeight = containerHeight / zoom;

      // Calculate crop position (accounting for zoom and pan)
      const cropX = Math.max(0, -position.x / zoom);
      const cropY = Math.max(0, -position.y / zoom);

      // Set canvas size to desired output dimensions
      const outputWidth = config.maxDimensions?.width || imgWidth;
      const outputHeight = config.aspectRatio
        ? outputWidth / config.aspectRatio
        : config.maxDimensions?.height || imgHeight;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Draw cropped image
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        cropX * scale,
        cropY * scale,
        cropWidth * scale,
        cropHeight * scale,
        0,
        0,
        outputWidth,
        outputHeight
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/webp',
          0.85
        );
      });

      // Create file from blob
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/webp' });

      // Upload to Sanity
      const result = await processAndUploadImage(croppedFile, config);

      if (result.success && result.asset) {
        onUploadComplete(result.url!, result.asset._id, {
          width: outputWidth,
          height: outputHeight,
        });
        setCropDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setCropDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* Current Image Preview */}
      {currentImage && !selectedFile && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={currentImage}
            alt="Current image"
            className="w-full h-auto object-cover"
            style={{ maxHeight: config.type === 'logo' ? '200px' : '300px' }}
          />
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={config.acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id={`upload-${config.type}`}
        />
        <Label
          htmlFor={`upload-${config.type}`}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          {currentImage ? 'Change Image' : 'Upload Image'}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop {config.type === 'logo' ? 'Logo' : config.type === 'banner' ? 'Banner' : 'Image'}</DialogTitle>
            <DialogDescription>
              Adjust the crop area by dragging and zooming. Aspect ratio: {config.aspectRatio?.toFixed(2) || 'Free'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Crop Area */}
            <div
              className="relative bg-black rounded-lg overflow-hidden"
              style={{
                width: '600px',
                height: config.aspectRatio ? `${600 / config.aspectRatio}px` : '400px',
                margin: '0 auto',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {previewUrl && (
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="absolute"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'top left',
                    maxWidth: 'none',
                  }}
                />
              )}
              <div className="absolute inset-0 border-2 border-dashed border-white pointer-events-none" />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground min-w-[60px]">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="h-4 w-4" />
              <span>Click and drag to reposition</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleCropAndUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Crop & Upload
                </>
              )}
            </Button>
          </DialogFooter>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
