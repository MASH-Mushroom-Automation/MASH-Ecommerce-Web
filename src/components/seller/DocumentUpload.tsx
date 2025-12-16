/**
 * Document Upload Component
 * 
 * Drag-and-drop file upload with preview and validation
 * Supports PDF, JPG, PNG files up to 10MB
 */

"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  validateFile,
  formatFileSize,
  isImageFile,
  isPdfFile,
  type DocumentType,
  DOCUMENT_TYPE_LABELS,
  MAX_FILE_SIZE,
  ALLOWED_DOCUMENT_TYPES,
} from "@/lib/utils/file-validation";

export interface UploadedDocument {
  id: string;
  file: File;
  documentType: DocumentType;
  preview?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface DocumentUploadProps {
  documentType: DocumentType;
  onUpload: (file: File, documentType: DocumentType) => Promise<{ url: string; id: string }>;
  onRemove?: (documentId: string) => void;
  maxFiles?: number;
  existingDocuments?: UploadedDocument[];
  disabled?: boolean;
  required?: boolean;
}

export function DocumentUpload({
  documentType,
  onUpload,
  onRemove,
  maxFiles = 1,
  existingDocuments = [],
  disabled = false,
  required = false,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>(existingDocuments);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Check if we've reached max files
      if (documents.length + acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} file(s) allowed`);
        return;
      }

      for (const file of acceptedFiles) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          alert(validation.error);
          continue;
        }

        // Create document entry
        const documentId = `${documentType}_${Date.now()}_${Math.random()}`;
        const newDocument: UploadedDocument = {
          id: documentId,
          file,
          documentType,
          preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
          uploadProgress: 0,
          uploadStatus: 'pending',
        };

        setDocuments((prev) => [...prev, newDocument]);

        // Start upload
        try {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? { ...doc, uploadStatus: 'uploading' as const }
                : doc
            )
          );

          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setDocuments((prev) =>
              prev.map((doc) => {
                if (doc.id === documentId && doc.uploadProgress < 90) {
                  return { ...doc, uploadProgress: doc.uploadProgress + 10 };
                }
                return doc;
              })
            );
          }, 200);

          const result = await onUpload(file, documentType);

          clearInterval(progressInterval);

          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    uploadProgress: 100,
                    uploadStatus: 'success' as const,
                    url: result.url,
                    id: result.id,
                  }
                : doc
            )
          );
        } catch (error) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    uploadStatus: 'error' as const,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : doc
            )
          );
        }
      }
    },
    [documentType, documents.length, maxFiles, onUpload, disabled]
  );

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop: handleDrop,
    accept: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: maxFiles > 1,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const handleRemove = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc?.preview) {
      URL.revokeObjectURL(doc.preview);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    if (onRemove) {
      onRemove(documentId);
    }
  };

  const canUploadMore = documents.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive || dropzoneActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? "Drop file here" : "Upload Document"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: PDF, JPG, PNG • Max size: 10MB
            {maxFiles > 1 && ` • Max ${maxFiles} files`}
          </p>
          {required && (
            <p className="text-xs text-red-500 mt-2">* Required</p>
          )}
        </div>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {doc.preview ? (
                    <img
                      src={doc.preview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : isPdfFile(doc.file) ? (
                    <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {doc.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file.size)}
                      </p>
                    </div>

                    {/* Remove button */}
                    {doc.uploadStatus !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(doc.id)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {doc.uploadStatus === 'uploading' && (
                    <div className="mt-2 space-y-1">
                      <Progress value={doc.uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        Uploading... {doc.uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Status */}
                  {doc.uploadStatus === 'success' && (
                    <div className="mt-2 flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Uploaded successfully</span>
                    </div>
                  )}

                  {doc.uploadStatus === 'error' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Upload failed</span>
                      </div>
                      {doc.error && (
                        <p className="text-xs text-red-500">{doc.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
