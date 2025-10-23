"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

export function SellerHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
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
    </header>
  );
}
