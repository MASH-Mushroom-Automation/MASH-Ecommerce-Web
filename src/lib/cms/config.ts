// CMS API Base Configuration
// src/lib/cms/config.ts

export const CMS_CONFIG = {
  // Database
  DB_URL: process.env.CMS_DB_URL || process.env.DATABASE_URL,

  // File Upload
  UPLOAD_PATH: process.env.CMS_UPLOAD_PATH || '/uploads',
  MAX_FILE_SIZE: parseInt(process.env.CMS_MAX_FILE_SIZE || '5242880'), // 5MB
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'webp'],

  // API
  API_VERSION: 'v1',
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  REVALIDATE_SECRET: process.env.CMS_REVALIDATE_SECRET,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Helper function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to validate required fields
export function validateRequired(data: Record<string, any>, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
