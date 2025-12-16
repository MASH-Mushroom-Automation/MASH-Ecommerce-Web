/**
 * File Validation Utilities
 * 
 * Utilities for validating file uploads (type, size, dimensions)
 * Used for seller document verification
 */

// Supported file types for document uploads
export const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const;

// File type labels for UI
export const FILE_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
} as const;

// Maximum file size (10MB in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Document types for categorization
export const DOCUMENT_TYPES = {
  BUSINESS_PERMIT: 'business_permit',
  DTI_REGISTRATION: 'dti_registration',
  SEC_REGISTRATION: 'sec_registration',
  BIR_CERTIFICATE: 'bir_certificate',
  MAYORS_PERMIT: 'mayors_permit',
  VALID_ID: 'valid_id',
  BUSINESS_LICENSE: 'business_license',
  TAX_CLEARANCE: 'tax_clearance',
  CERTIFICATION: 'certification',
  OTHER: 'other',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Document type labels
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DOCUMENT_TYPES.BUSINESS_PERMIT]: 'Business Permit',
  [DOCUMENT_TYPES.DTI_REGISTRATION]: 'DTI Registration',
  [DOCUMENT_TYPES.SEC_REGISTRATION]: 'SEC Registration',
  [DOCUMENT_TYPES.BIR_CERTIFICATE]: 'BIR Certificate of Registration',
  [DOCUMENT_TYPES.MAYORS_PERMIT]: "Mayor's Permit",
  [DOCUMENT_TYPES.VALID_ID]: 'Valid ID',
  [DOCUMENT_TYPES.BUSINESS_LICENSE]: 'Business License',
  [DOCUMENT_TYPES.TAX_CLEARANCE]: 'Tax Clearance',
  [DOCUMENT_TYPES.CERTIFICATION]: 'Certification',
  [DOCUMENT_TYPES.OTHER]: 'Other Document',
};

// Document type descriptions
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  [DOCUMENT_TYPES.BUSINESS_PERMIT]: 'Official business permit from LGU',
  [DOCUMENT_TYPES.DTI_REGISTRATION]: 'DTI Certificate of Registration for sole proprietors',
  [DOCUMENT_TYPES.SEC_REGISTRATION]: 'SEC Certificate of Registration for corporations',
  [DOCUMENT_TYPES.BIR_CERTIFICATE]: 'BIR Certificate of Registration (TIN)',
  [DOCUMENT_TYPES.MAYORS_PERMIT]: "Mayor's Permit / Business License",
  [DOCUMENT_TYPES.VALID_ID]: 'Government-issued valid ID',
  [DOCUMENT_TYPES.BUSINESS_LICENSE]: 'Business license or permit',
  [DOCUMENT_TYPES.TAX_CLEARANCE]: 'Tax clearance certificate',
  [DOCUMENT_TYPES.CERTIFICATION]: 'Professional or quality certifications',
  [DOCUMENT_TYPES.OTHER]: 'Additional supporting documents',
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type
 */
export function validateFileType(file: File): ValidationResult {
  const allowedTypes = Object.keys(ALLOWED_DOCUMENT_TYPES);
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please upload PDF, JPG, or PNG files only.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): ValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file (type and size)
 */
export function validateFile(file: File): ValidationResult {
  // Check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Generate a safe filename
 */
export function generateSafeFilename(originalFilename: string, documentType: DocumentType): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const safeName = originalFilename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
    .substring(0, 50); // Limit length

  return `${documentType}_${safeName}_${timestamp}.${extension}`;
}

/**
 * Create file preview URL
 */
export function createFilePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke file preview URL
 */
export function revokeFilePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Read file as data URL (for preview)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image dimensions (if needed)
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<ValidationResult> {
  if (!isImageFile(file)) {
    return { valid: true }; // Skip validation for non-images
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = createFilePreviewUrl(file);

    img.onload = () => {
      revokeFilePreviewUrl(url);

      if (minWidth && img.width < minWidth) {
        resolve({
          valid: false,
          error: `Image width must be at least ${minWidth}px`,
        });
        return;
      }

      if (minHeight && img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image height must be at least ${minHeight}px`,
        });
        return;
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({
          valid: false,
          error: `Image width must not exceed ${maxWidth}px`,
        });
        return;
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image height must not exceed ${maxHeight}px`,
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      revokeFilePreviewUrl(url);
      resolve({
        valid: false,
        error: 'Failed to load image',
      });
    };

    img.src = url;
  });
}
