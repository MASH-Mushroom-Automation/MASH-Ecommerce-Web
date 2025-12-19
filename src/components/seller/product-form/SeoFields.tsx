"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface SeoFieldsProps {
  metaTitle: string;
  metaDescription: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  productName: string;
}

export function SeoFields({
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  productName,
}: SeoFieldsProps) {
  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const titleWarning = titleLength > 60;
  const descWarning = descLength > 160;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          SEO fields help your product rank better in search engines. If left
          empty, the product name and description will be used.
        </p>
      </div>

      {/* Meta Title */}
      <div className="space-y-2">
        <Label htmlFor="seo-title">
          Meta Title
          <span className="text-muted-foreground ml-2 text-xs">(Optional)</span>
        </Label>
        <Input
          id="seo-title"
          placeholder={productName || "Product name will be used"}
          value={metaTitle}
          onChange={(e) => onMetaTitleChange(e.target.value)}
          maxLength={70}
        />
        <div className="flex items-center justify-between text-xs">
          <p className="text-muted-foreground">
            Appears in search engine results
          </p>
          <p
            className={
              titleWarning
                ? "text-orange-600 font-medium"
                : "text-muted-foreground"
            }
          >
            {titleLength} / 60 characters
            {titleWarning && " (too long)"}
          </p>
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <Label htmlFor="seo-description">
          Meta Description
          <span className="text-muted-foreground ml-2 text-xs">(Optional)</span>
        </Label>
        <Textarea
          id="seo-description"
          placeholder="Brief description for search engines..."
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          rows={3}
          maxLength={200}
        />
        <div className="flex items-center justify-between text-xs">
          <p className="text-muted-foreground">
            Shown below the title in search results
          </p>
          <p
            className={
              descWarning
                ? "text-orange-600 font-medium"
                : "text-muted-foreground"
            }
          >
            {descLength} / 160 characters
            {descWarning && " (too long)"}
          </p>
        </div>
      </div>
    </div>
  );
}
