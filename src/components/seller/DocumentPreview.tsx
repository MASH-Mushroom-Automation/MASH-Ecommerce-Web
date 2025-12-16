/**
 * Document Preview Modal
 * 
 * Full-screen modal for previewing uploaded documents
 * Supports image and PDF preview
 */

"use client";

import React from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isImageFile, isPdfFile } from "@/lib/utils/file-validation";
import type { UploadedDocument } from "./DocumentUpload";

interface DocumentPreviewProps {
  document: UploadedDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreview({
  document,
  isOpen,
  onClose,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = React.useState(100);

  if (!document) return null;

  const handleDownload = () => {
    const url = document.preview || document.url;
    if (url) {
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file.name;
      link.click();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  React.useEffect(() => {
    if (!isOpen) {
      setZoom(100);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg truncate pr-4">
              {document.file.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isImageFile(document.file) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-6">
          {isImageFile(document.file) && document.preview && (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={document.preview}
                alt={document.file.name}
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          )}

          {isPdfFile(document.file) && document.preview && (
            <div className="w-full h-full">
              <iframe
                src={document.preview}
                className="w-full h-full border-0"
                title={document.file.name}
              />
            </div>
          )}

          {!document.preview && document.url && (
            <div className="w-full h-full">
              <iframe
                src={document.url}
                className="w-full h-full border-0"
                title={document.file.name}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
