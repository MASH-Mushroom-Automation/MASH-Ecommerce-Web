/**
 * SEO Metadata Editor Component
 * Configure SEO settings for seller profile page
 */

'use client';

import React from 'react';
import { Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SEOFormData } from '@/lib/types/seller-profile';

interface SEOMetadataEditorProps {
  seo: SEOFormData;
  onChange: (seo: SEOFormData) => void;
  storeName: string;
}

export function SEOMetadataEditor({ seo, onChange, storeName }: SEOMetadataEditorProps) {
  const [keywordInput, setKeywordInput] = React.useState('');

  const keywords = seo.metaKeywords ? seo.metaKeywords.split(',').map(k => k.trim()).filter(Boolean) : [];

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    const newKeywords = [...keywords, keywordInput.trim()];
    onChange({ ...seo, metaKeywords: newKeywords.join(', ') });
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    onChange({ ...seo, metaKeywords: newKeywords.join(', ') });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Settings
        </CardTitle>
        <CardDescription>
          Optimize your store profile for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input
            id="meta-title"
            placeholder={`${storeName} - Fresh Mushrooms Delivery`}
            value={seo.metaTitle}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            maxLength={60}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {seo.metaTitle.length}/60 characters
          </p>
        </div>

        <div>
          <Label htmlFor="meta-description">Meta Description</Label>
          <Textarea
            id="meta-description"
            placeholder="Shop fresh, organic mushrooms grown sustainably in Metro Manila..."
            value={seo.metaDescription}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            maxLength={160}
            rows={3}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {seo.metaDescription.length}/160 characters
          </p>
        </div>

        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="keywords"
              placeholder="Add keyword and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
            >
              Add
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(index)}>
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Search Engine Preview</h4>
          <div className="space-y-1">
            <div className="text-sm text-primary font-medium truncate">
              {seo.metaTitle || `${storeName} - Fresh Mushrooms`}
            </div>
            <div className="text-xs text-green-600">mash-ecommerce-web-black.vercel.app/stores/{storeName.toLowerCase().replace(/\s+/g, '-')}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {seo.metaDescription || 'No description provided'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
