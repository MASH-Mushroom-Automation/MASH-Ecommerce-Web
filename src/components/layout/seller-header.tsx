"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Facebook, Instagram } from "lucide-react";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

export function SellerHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Consistent with main header */}
      <div className="bg-[#1E392A] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link href="/seller/dashboard" className="hover:underline">
              Seller Center
            </Link>
            <Link href="#" className="hover:underline">
              Download App
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/blog" className="hover:underline">
              BLOG
            </Link>
            <Link href="/faq" className="hover:underline">
              FAQ
            </Link>
            <Link href="/contact" className="hover:underline">
              CONTACT US
            </Link>
            <a href="#" aria-label="Facebook" className="hover:text-gray-300">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-gray-300">
              <Instagram size={20} />
            </a>
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
