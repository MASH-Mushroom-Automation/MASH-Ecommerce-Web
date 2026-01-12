// Cloudinary upload utility for frontend file uploads
// Uses unsigned uploads (no API secret needed on frontend)

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  originalFilename: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: "image" | "raw" | "auto";
  tags?: string[];
  context?: Record<string, string>;
}

/**
 * Upload a file to Cloudinary using unsigned upload
 * @param file - The file to upload
 * @param options - Upload options (folder, tags, etc.)
 * @returns Promise with the upload result including the secure URL
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  // Optional: Set folder for organization
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  // Optional: Add tags for easy filtering
  if (options.tags && options.tags.length > 0) {
    formData.append("tags", options.tags.join(","));
  }

  // Optional: Add context (custom metadata)
  if (options.context) {
    const contextString = Object.entries(options.context)
      .map(([key, value]) => `${key}=${value}`)
      .join("|");
    formData.append("context", contextString);
  }

  // Determine resource type (auto for PDFs and images)
  const resourceType = options.resourceType || "auto";

  // Log upload attempt for debugging
  console.log(
    `[Cloudinary] Uploading ${file.name} (${file.type}, ${file.size} bytes) as ${resourceType}`
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("[Cloudinary] Upload failed:", error);
    throw new Error(
      error.error?.message || `Failed to upload ${file.name} to Cloudinary`
    );
  }

  const data = await response.json();

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    originalFilename: data.original_filename,
  };
}

/**
 * Upload multiple files to Cloudinary in parallel
 * @param files - Array of files to upload
 * @param options - Upload options applied to all files
 * @returns Promise with array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(files.map((file) => uploadToCloudinary(file, options)));
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @param allowedTypes - Array of allowed MIME types
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}
