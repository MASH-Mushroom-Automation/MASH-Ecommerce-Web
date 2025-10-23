"use client";

import React from "react";
import { SimpleHeader } from "./simple-header";

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export function AuthLayout({ children, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SimpleHeader />
      
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} MASH Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
