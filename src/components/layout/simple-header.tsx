"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

export function SimpleHeader() {
  return (
    <header className="bg-white shadow-sm">
      {/* Top Bar: Seller/Info Links - Dark Green Background */}
      <div className="bg-[#1E392A] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link href="/seller/dashboard" className="hover:underline">
              Seller Center
            </Link>
            <Link href="/seller/dashboard" className="hover:underline">
              Start Selling
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
