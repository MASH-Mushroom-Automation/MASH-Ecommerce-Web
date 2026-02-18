/**
 * Firebase Storage Service - Profile Picture Upload
 *
 * Handles uploading, retrieving, and deleting profile pictures
 * from Firebase Storage. Images are stored under `profile-pictures/{userId}/`.
 *
 * Storage Rules should restrict read/write to authenticated users for their own folder.
 */

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { firebaseApp } from "./config";

const storage = getStorage(firebaseApp);

// Max file size: 5 MB
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
 * Build storage path for user profile picture
 */
function getProfilePicturePath(userId: string): string {
  const timestamp = Date.now();
  return `profile-pictures/${userId}/avatar_${timestamp}`;
}

/**
 * Upload a profile picture to Firebase Storage
 *
 * @param userId - The authenticated user's UID
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise resolving to the download URL and storage path
 */
export async function uploadProfilePicture(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const validationError = validateProfileImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const storagePath = getProfilePicturePath(userId);
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type,
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  };

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage,
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadURL, storagePath });
        } catch (error) {
          reject(
            new Error(
              `Failed to get download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
            ),
          );
        }
      },
    );
  });
}

/**
 * Delete a profile picture from Firebase Storage
 *
 * @param storagePath - The full storage path of the image
 */
export async function deleteProfilePicture(storagePath: string): Promise<void> {
  if (!storagePath) return;

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error: unknown) {
    // Ignore "object-not-found" errors (already deleted)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "storage/object-not-found"
    ) {
      return;
    }
    throw error;
  }
}
