/**
 * Profile Picture Upload Service
 *
 * Uses client-side Canvas API to resize and compress profile pictures
 * into optimized data URLs stored in Firestore via the user profile.
 *
 * This eliminates the need for Firebase Storage (which requires a separately
 * provisioned Cloud Storage bucket) and avoids all CORS configuration.
 * Images are resized to a max dimension and compressed as JPEG for efficiency.
 */

// Max file size: 5 MB (before resize)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Accepted MIME types
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: "running" | "paused" | "success" | "canceled" | "error";
}

export interface UploadResult {
  downloadURL: string;
  storagePath: string;
}

// Max output dimension for profile pictures (pixels)
const PROFILE_PIC_MAX_DIMENSION = 256;

// JPEG compression quality (0-1)
const JPEG_QUALITY = 0.8;

/**
 * Validate a file before upload
 */
export function validateProfileImage(file: File): string | null {
  if (!file) return "No file provided";

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as AcceptedImageType)) {
    return "File must be JPEG, PNG, or WebP";
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum size is 5 MB`;
  }

  return null;
}

/**
 * Resize an image using the Canvas API and return a compressed JPEG data URL.
 * Maintains aspect ratio while fitting within maxDimension x maxDimension.
 */
function resizeImage(
  file: File,
  maxDimension: number = PROFILE_PIC_MAX_DIMENSION,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down to fit within maxDimension, maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataURL = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataURL);
      };

      img.onerror = () => reject(new Error("Failed to load image for resize"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a profile picture by resizing it client-side and returning a data URL.
 *
 * The data URL is stored in Firestore via the onUploadComplete callback,
 * eliminating the need for a separate Firebase Storage bucket.
 *
 * @param userId - The authenticated user's UID
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress
 * @param _previousStoragePath - Unused (kept for API compatibility)
 * @returns Promise resolving to the data URL and a virtual storage path
 */
export async function uploadProfilePicture(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  _previousStoragePath?: string,
): Promise<UploadResult> {
  const validationError = validateProfileImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // Report initial progress
  onProgress?.({
    bytesTransferred: 0,
    totalBytes: file.size,
    percentage: 0,
    state: "running",
  });

  // Resize and compress the image
  const dataURL = await resizeImage(file);

  // Report progress at 50% (resize done)
  onProgress?.({
    bytesTransferred: Math.round(file.size / 2),
    totalBytes: file.size,
    percentage: 50,
    state: "running",
  });

  // Simulate a brief processing delay for UX feedback
  await new Promise((r) => setTimeout(r, 200));

  // Report completion
  onProgress?.({
    bytesTransferred: file.size,
    totalBytes: file.size,
    percentage: 100,
    state: "success",
  });

  const timestamp = Date.now();
  return {
    downloadURL: dataURL,
    storagePath: `profile-pictures/${userId}/avatar_${timestamp}`,
  };
}

/**
 * Delete a profile picture.
 *
 * Since profile pictures are stored as data URLs in Firestore,
 * deletion is handled by clearing the photoURL field in the user profile.
 * This function is a no-op kept for API compatibility.
 */
export async function deleteProfilePicture(_storagePath: string): Promise<void> {
  // Data URLs are stored in Firestore - deletion is handled by
  // clearing the photoURL field in the user profile document.
  return;
}
