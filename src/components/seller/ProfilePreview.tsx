/**
 * Profile Preview Component
 * Shows real-time preview of seller profile as customers will see it
 */

'use client';

import React, { useState } from 'react';
import { Eye, Monitor, Smartphone, Clock, MapPin, Mail, Phone, Globe, Facebook, Instagram, Twitter, Youtube, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SellerProfile, BusinessHours } from '@/lib/types/seller-profile';
import { DAY_LABELS } from '@/lib/types/seller-profile';

interface ProfilePreviewProps {
  profile: Partial<SellerProfile>;
  isVisible: boolean;
  onToggle: () => void;
}

export function ProfilePreview({ profile, isVisible, onToggle }: ProfilePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isVisible) {
    return (
      <Button variant="outline" onClick={onToggle} className="w-full">
        <Eye className="mr-2 h-4 w-4" />
        Show Preview
      </Button>
    );
  }

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  };

  const getTodayHours = (): BusinessHours | undefined => {
    if (!profile.businessHours) return undefined;
    const today = new Date().getDay();
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return profile.businessHours.find(h => h.day === dayMap[today]);
  };

  const todayHours = getTodayHours();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <h3 className="font-semibold">Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="desktop">
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile">
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            Hide
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={`mx-auto border border-border rounded-lg overflow-hidden bg-background ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-4xl'}`}>
        {/* Banner */}
        {profile.images?.banner?.url && (
          <div className="relative h-48 bg-muted">
            <img
              src={profile.images.banner.url}
              alt={profile.images.banner.alt || 'Store banner'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            {profile.images?.logo?.url && (
              <div className="flex-shrink-0">
                <img
                  src={profile.images.logo.url}
                  alt={profile.images.logo.alt || 'Store logo'}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile.storeName || 'Store Name'}</h1>
                {profile.isVerified && (
                  <Badge variant="default" className="bg-blue-500">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              {profile.tagline && (
                <p className="text-muted-foreground mb-2">{profile.tagline}</p>
              )}
              {profile.stats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{profile.stats.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({profile.stats.totalReviews})</span>
                  </div>
                  <span className="text-muted-foreground">
                    {profile.stats.totalProducts} products
                  </span>
                  <span className="text-muted-foreground">
                    {profile.stats.totalOrders} orders
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Today's Hours */}
          {todayHours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {todayHours.isOpen ? (
                  <>
                    Open today: {formatTime(todayHours.openTime)} - {formatTime(todayHours.closeTime)}
                  </>
                ) : (
                  <span className="text-red-500">Closed today</span>
                )}
              </span>
            </div>
          )}

          {/* Description */}
          {profile.description && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-line">{profile.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2">
              {profile.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {profile.address.street}, {profile.address.barangay}, {profile.address.city}, {profile.address.province}
                  </span>
                </div>
              )}
              {profile.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">
                    {profile.contactEmail}
                  </a>
                </div>
              )}
              {profile.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${profile.contactPhone}`} className="text-primary hover:underline">
                    {profile.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          {profile.businessHours && profile.businessHours.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Business Hours</h3>
              <div className="space-y-1 text-sm">
                {profile.businessHours.map((hours) => (
                  <div key={hours.day} className="flex justify-between">
                    <span className="text-muted-foreground">{DAY_LABELS[hours.day]}</span>
                    <span className={hours.isOpen ? '' : 'text-red-500'}>
                      {hours.isOpen
                        ? `${formatTime(hours.openTime)} - ${formatTime(hours.closeTime)}`
                        : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {profile.socialMedia && Object.values(profile.socialMedia).some(v => v) && (
            <div>
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex flex-wrap gap-2">
                {profile.socialMedia.facebook && (
                  <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg hover:bg-accent">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {profile.socialMedia.instagram && (
                  <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg hover:bg-accent">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {profile.socialMedia.twitter && (
                  <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg hover:bg-accent">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.socialMedia.youtube && (
                  <a href={profile.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg hover:bg-accent">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {profile.socialMedia.whatsapp && (
                  <a href={`https://wa.me/${profile.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg hover:bg-accent">
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
