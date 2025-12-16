/**
 * Social Media Links Editor Component
 * Allows sellers to add social media links to their profile
 */

'use client';

import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MessageCircle, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SocialMediaFormData } from '@/lib/types/seller-profile';

interface SocialMediaEditorProps {
  socialMedia: SocialMediaFormData;
  onChange: (socialMedia: SocialMediaFormData) => void;
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook' as const, label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourstore' },
  { key: 'instagram' as const, label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourstore' },
  { key: 'twitter' as const, label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/yourstore' },
  { key: 'tiktok' as const, label: 'TikTok', icon: ExternalLink, placeholder: 'https://tiktok.com/@yourstore' },
  { key: 'youtube' as const, label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourstore' },
  { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, placeholder: '+639123456789' },
  { key: 'messenger' as const, label: 'Messenger', icon: MessageCircle, placeholder: 'https://m.me/yourstore' },
];

export function SocialMediaEditor({ socialMedia, onChange }: SocialMediaEditorProps) {
  const handleChange = (platform: keyof SocialMediaFormData, value: string) => {
    onChange({ ...socialMedia, [platform]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add your social media profiles to help customers connect with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key}>
            <Label htmlFor={key} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </Label>
            <Input
              id={key}
              type="text"
              placeholder={placeholder}
              value={socialMedia[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
