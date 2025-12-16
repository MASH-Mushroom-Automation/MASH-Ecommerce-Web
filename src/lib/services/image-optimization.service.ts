/**
 * Image Optimization Service
 * Handles image compression, resizing, format conversion, and Sanity CMS upload
 */

import { sanityClient } from '@/lib/sanity/client';
import type { ImageUploadConfig, OptimizedImage } from '@/lib/types/seller-profile';

// ============================================================================
// TYPES
// ============================================================================

interface SanityImageAsset {
  _id: string;
  url: string;
  metadata: {
    dimensions: {
      width: number;
      height: number;
    };
  };
}

interface UploadResult {
  success: boolean;
  asset?: SanityImageAsset;
  url?: string;
  error?: string;
}

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

/**
 * Validate image file against configuration
 */
export function validateImage(file: File, config: ImageUploadConfig): string | null {
  // Check file type
  if (!config.acceptedFormats.includes(file.type)) {
    return `Invalid file type. Accepted formats: ${config.acceptedFormats.map(f => f.replace('image/', '')).join(', ')}`;
  }

  // Check file size
  const maxBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size too large. Maximum: ${config.maxSizeMB}MB`;
  }

  return null;
}

/**
 * Check image dimensions
 */
export async function checkImageDimensions(file: File, config: ImageUploadConfig): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;

      if (config.minDimensions) {
        if (width < config.minDimensions.width || height < config.minDimensions.height) {
          resolve(`Image too small. Minimum: ${config.minDimensions.width}x${config.minDimensions.height}px`);
          return;
        }
      }

      if (config.maxDimensions) {
        if (width > config.maxDimensions.width || height > config.maxDimensions.height) {
          resolve(`Image too large. Maximum: ${config.maxDimensions.width}x${config.maxDimensions.height}px`);
          return;
        }
      }

      resolve(null);
    };

    img.onerror = () => {
      resolve('Failed to load image');
    };

    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Optimize image: compress, resize, and convert format
 */
export async function optimizeImage(
  file: File,
  config: ImageUploadConfig,
  targetWidth?: number,
  targetHeight?: number
): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (targetWidth && targetHeight) {
        width = targetWidth;
        height = targetHeight;
      } else if (targetWidth) {
        const ratio = targetWidth / width;
        width = targetWidth;
        height = Math.round(height * ratio);
      } else if (targetHeight) {
        const ratio = targetHeight / height;
        height = targetHeight;
        width = Math.round(width * ratio);
      } else if (config.maxDimensions) {
        // Auto-resize if exceeds max dimensions
        const maxWidth = config.maxDimensions.width;
        const maxHeight = config.maxDimensions.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to optimized format
      const quality = 0.85; // 85% quality for good balance
      const format = 'image/webp'; // Always use WebP for best compression

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          resolve({
            original: file,
            optimized: blob,
            preview: canvas.toDataURL(format, quality),
            dimensions: { width, height },
            size: blob.size,
            format: format.replace('image/', ''),
          });
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Crop and optimize image
 */
export async function cropAndOptimizeImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number },
  config: ImageUploadConfig,
  targetWidth?: number,
  targetHeight?: number
): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas to target dimensions or cropped dimensions
      canvas.width = targetWidth || cropArea.width;
      canvas.height = targetHeight || cropArea.height;

      // Draw cropped and resized image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const format = 'image/webp';
      const quality = 0.85;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          resolve({
            original: file,
            optimized: blob,
            preview: canvas.toDataURL(format, quality),
            dimensions: { width: canvas.width, height: canvas.height },
            size: blob.size,
            format: format.replace('image/', ''),
          });
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// SANITY CMS UPLOAD
// ============================================================================

/**
 * Upload optimized image to Sanity CMS
 */
export async function uploadToSanity(
  optimizedImage: OptimizedImage,
  fileName: string,
  altText?: string
): Promise<UploadResult> {
  try {
    // Convert blob to file for upload
    const file = new File([optimizedImage.optimized], fileName, {
      type: `image/${optimizedImage.format}`,
    });

    // Upload to Sanity
    const asset = await sanityClient.assets.upload('image', file, {
      filename: fileName,
      // Optional metadata
      title: altText,
      description: altText,
    });

    return {
      success: true,
      asset: asset as SanityImageAsset,
      url: asset.url,
    };
  } catch (error) {
    console.error('Sanity upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload image with automatic optimization and Sanity upload
 */
export async function processAndUploadImage(
  file: File,
  config: ImageUploadConfig,
  altText?: string,
  cropArea?: { x: number; y: number; width: number; height: number }
): Promise<UploadResult> {
  try {
    // Validate image
    const validationError = validateImage(file, config);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Check dimensions
    const dimensionError = await checkImageDimensions(file, config);
    if (dimensionError) {
      return { success: false, error: dimensionError };
    }

    // Optimize image (with or without crop)
    let optimized: OptimizedImage;
    if (cropArea) {
      optimized = await cropAndOptimizeImage(file, cropArea, config);
    } else {
      optimized = await optimizeImage(file, config);
    }

    // Generate filename
    const fileName = `${config.type}-${Date.now()}.${optimized.format}`;

    // Upload to Sanity
    const result = await uploadToSanity(optimized, fileName, altText);

    return result;
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    };
  }
}

// ============================================================================
// BATCH UPLOAD
// ============================================================================

/**
 * Upload multiple images to Sanity
 */
export async function uploadMultipleImages(
  files: File[],
  config: ImageUploadConfig,
  onProgress?: (index: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    const result = await processAndUploadImage(files[i], config);
    results.push(result);
  }

  return results;
}

// ============================================================================
// IMAGE URL HELPERS
// ============================================================================

/**
 * Get Sanity image URL with transformations
 */
export function getSanityImageUrl(
  imageRef: string,
  width?: number,
  height?: number,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

  // Extract image ID from reference
  // Format: image-{id}-{width}x{height}-{format}
  const parts = imageRef.replace('image-', '').split('-');
  if (parts.length < 2) {
    return ''; // Invalid reference
  }

  const imageId = parts[0];
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${imageId}`;

  // Add transformations
  const params: string[] = [];
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (format) params.push(`fm=${format}`);
  params.push('q=85'); // Quality

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

/**
 * Convert File to data URL for preview
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
