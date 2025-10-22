"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Facebook,
  Instagram,
} from "lucide-react";

interface NavLinkProps {
  label: string;
  path: string;
}

const NavLink: React.FC<NavLinkProps> = ({ label, path }) => {
  const pathname = usePathname();
  const active = pathname === path;

  return (
    <Link
      href={path}
      className={`relative text-base font-semibold ${
        active ? "text-[#1E392A]" : "text-gray-600"
      } hover:text-[#6A994E] transition-colors h-full flex items-center`}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 h-1 w-full bg-[#6A994E] rounded-t-lg"></div>
      )}
    </Link>
  );
};

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => console.log("Searching for:", searchTerm);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* 1. Top Bar: Seller/Info Links - Dark Green Background */}
      <div className="bg-[#1E392A] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link href="#" className="hover:underline">
              Seller Center
            </Link>
            <Link href="#" className="hover:underline">
              Start Selling
            </Link>
            <Link href="#" className="hover:underline">
              Download App
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="#" className="hover:underline">
              BLOG
            </Link>
            <Link href="#" className="hover:underline">
              FAQ
            </Link>
            <Link href="#" className="hover:underline">
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

      {/* 2. Main Bar: Logo, Search, Cart, Login */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <Link href="/">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </Link>

        {/* Search Bar (Centered) */}
        <div className="flex-1 max-w-xl mx-8 hidden lg:block">
          <div className="relative flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#6A994E]/50">
            <input
              type="text"
              placeholder="Oyster Mushroom."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-4 text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="bg-gray-50 hover:bg-gray-200 p-3 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Actions (Cart, Wishlist, Login) */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link
            href="/checkout"
            className="flex items-center hover:text-[#6A994E] transition-colors group"
          >
            <ShoppingCart size={24} className="group-hover:text-[#6A994E]" />
            <span className="text-sm ml-1 hidden sm:block">Cart</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center hover:text-[#6A994E] transition-colors group"
          >
            <Heart size={24} className="group-hover:text-[#6A994E]" />
            <span className="text-sm ml-1 hidden sm:block">Wishlist</span>
          </Link>

          <Link href="/login">
            <Button variant="primary" size="lg" rounded="lg" className="flex items-center space-x-2">
              <User size={20} />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Oyster Mushroom.."
                    className="w-full rounded-md border border-gray-300 bg-gray-100 py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/"
                    className="text-lg font-medium text-gray-600 hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    href="/catalog"
                    className="text-lg font-medium text-gray-600 hover:text-primary"
                  >
                    Products
                  </Link>
                  <Link
                    href="/grower"
                    className="text-lg font-medium text-gray-600 hover:text-primary"
                  >
                    Growers
                  </Link>
                  <Link
                    href="/about"
                    className="text-lg font-medium text-gray-600 hover:text-primary"
                  >
                    About Us
                  </Link>
                </nav>
                <div className="border-t pt-4">
                  <Link
                    href="/checkout"
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                  </Link>
                  <Link
                    href="#"
                    className="mt-2 flex items-center space-x-2 text-gray-600 hover:text-primary"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Button variant="primary" className="mt-4 w-full">
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 3. Main Navigation Bar - Centered Links */}
      <nav className="border-t border-gray-200 shadow-inner hidden lg:block">
        <div className="max-w-7xl mx-auto flex justify-center space-x-8 px-4 sm:px-6 lg:px-8 h-14 items-center">
          <NavLink label="Home" path="/" />
          <NavLink label="Products" path="/catalog" />
          <NavLink label="Growers" path="/grower" />
          <NavLink label="About Us" path="/about" />
        </div>
      </nav>
    </header>
  );
}
