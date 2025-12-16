/**
 * Document Upload Hook
 * 
 * Hook for uploading documents to cloud storage with progress tracking
 * Uses presigned URLs for secure uploads
 */

"use client";

import { useState, useCallback } from "react";
import type { DocumentType } from "@/lib/utils/file-validation";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UseDocumentUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string, documentId: string) => void;
  onError?: (error: Error) => void;
}

export function useDocumentUpload(options: UseDocumentUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  const uploadDocument = useCallback(
    async (file: File, documentType: DocumentType): Promise<{ url: string; id: string }> => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        // Step 1: Request presigned URL from backend
        const presignedResponse = await fetch('/api/seller/documents/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            documentType,
            fileSize: file.size,
          }),
        });

        if (!presignedResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, documentId, fileUrl } = await presignedResponse.json();

        // Step 2: Upload file to cloud storage using presigned URL
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            const progressData = {
              loaded: event.loaded,
              total: event.total,
              percentage,
            };
            setProgress(progressData);
            options.onProgress?.(progressData);
          }
        });

        // Upload completion
        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);

        await uploadPromise;

        // Step 3: Confirm upload with backend
        const confirmResponse = await fetch('/api/seller/documents/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId,
            documentType,
            filename: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm upload');
        }

        const result = { url: fileUrl, id: documentId };
        options.onSuccess?.(fileUrl, documentId);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    uploadDocument,
    isUploading,
    progress,
    error,
    reset,
  };
}
