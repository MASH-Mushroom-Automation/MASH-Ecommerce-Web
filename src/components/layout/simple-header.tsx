"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";
import { useUserProfile } from "@/hooks/useUser";

export function SimpleHeader() {
  const { profile } = useUserProfile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Three-state seller status logic
  const sellerStatus = isMounted ? (profile?.sellerStatus || 'none') : 'none';

  return (
    <header className="bg-white shadow-sm">
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

      {/* Main Bar: Logo Only */}
      <div className="max-w-7xl mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
