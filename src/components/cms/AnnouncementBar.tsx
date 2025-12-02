"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity/client';

interface AnnouncementBarData {
  enabled: boolean;
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * AnnouncementBar Component
 * 
 * Fetches announcement bar settings from Sanity CMS siteSettings
 * and displays a dismissible banner at the top of the page.
 * 
 * Features:
 * - Fetches from Sanity siteSettings.announcementBar
 * - Dismissible (saves to sessionStorage)
 * - Customizable colors from CMS
 * - Optional link with custom text
 * - Responsive design
 */
export function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementBarData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already dismissed in this session
    const isDismissed = sessionStorage.getItem('mash-announcement-dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
      setIsLoading(false);
      return;
    }

    // Fetch announcement bar data from Sanity siteSettings
    const query = `*[_type == "siteSettings"][0].announcementBar`;
    
    sanityClient
      .fetch<AnnouncementBarData | null>(query)
      .then((result) => {
        if (result?.enabled && result?.message) {
          setData(result);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch announcement bar:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('mash-announcement-dismissed', 'true');
    setDismissed(true);
  };

  // Don't render if loading, dismissed, or no data
  if (isLoading || dismissed || !data || !data.enabled) {
    return null;
  }

  // Default colors if not set in CMS
  const bgColor = data.backgroundColor || '#1E392A'; // Primary Dark
  const textColor = data.textColor || '#FFFFFF';

  return (
    <div
      className="relative py-2.5 px-4 text-center text-sm font-medium animate-in slide-in-from-top duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
      role="banner"
      aria-label="Announcement"
    >
      <div className="container mx-auto flex items-center justify-center gap-2 pr-8">
        <span className="inline-flex items-center gap-2">
          {data.message}
          {data.link && data.linkText && (
            <Link
              href={data.link}
              className="underline hover:no-underline font-semibold ml-1 transition-opacity hover:opacity-80"
              style={{ color: textColor }}
            >
              {data.linkText} →
            </Link>
          )}
        </span>
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
        style={{ color: textColor }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * AnnouncementBarFallback
 * 
 * A static fallback version that doesn't require CMS data.
 * Use this for testing or as a hardcoded banner.
 */
export function AnnouncementBarStatic({
  message = "🍄 FREE SHIPPING on orders over ₱1,500!",
  link = "/shop",
  linkText = "Shop Now",
  backgroundColor = "#1E392A",
  textColor = "#FFFFFF",
}: {
  message?: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('mash-announcement-dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('mash-announcement-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="relative py-2.5 px-4 text-center text-sm font-medium"
      style={{ backgroundColor, color: textColor }}
      role="banner"
      aria-label="Announcement"
    >
      <div className="container mx-auto flex items-center justify-center gap-2 pr-8">
        <span className="inline-flex items-center gap-2">
          {message}
          {link && linkText && (
            <Link
              href={link}
              className="underline hover:no-underline font-semibold ml-1"
              style={{ color: textColor }}
            >
              {linkText} →
            </Link>
          )}
        </span>
      </div>
      
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
        style={{ color: textColor }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
