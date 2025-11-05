"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Facebook, Instagram } from "lucide-react";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useUserProfile } from "@/hooks/useUser";

export function SellerHeader() {
  const { profile } = useUserProfile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Three-state seller status logic
  const sellerStatus = isMounted ? (profile?.sellerStatus || 'none') : 'none';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar: Seller/Info Links - Dark Green Background */}
      <div className="bg-[#1E392A] text-white text-xs sm:text-sm py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {sellerStatus === 'approved' ? (
              <Link href="/seller/dashboard" className="hover:underline">
                Seller Center
              </Link>
            ) : sellerStatus === 'pending' ? (
              <span className="text-yellow-300 cursor-not-allowed" title="Your seller application is awaiting admin approval">
                Application Pending ⏳
              </span>
            ) : (
              <Link href="/start-selling" className="hover:underline">
                Start Selling
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/90">
            <Link href="/blog" className="hover:underline whitespace-nowrap">
              BLOG
            </Link>
            <span className="hidden sm:inline text-white/30">•</span>
            <Link href="/faq" className="hidden sm:inline hover:underline whitespace-nowrap">
              FAQ
            </Link>
            <span className="hidden sm:inline text-white/30">•</span>
            <Link href="/contact" className="hidden sm:inline hover:underline whitespace-nowrap">
              CONTACT US
            </Link>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="hidden sm:flex items-center gap-2">
              <a href="#" aria-label="Facebook" className="hover:text-gray-300">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-gray-300">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Logo  v6 - Market.png"
              alt="MASH Logo"
              width={150}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Icons on the right */}
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <Link
              href="/seller/settings"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
