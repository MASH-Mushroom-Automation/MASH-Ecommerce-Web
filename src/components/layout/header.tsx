import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  UserCircle,
  Package,
  ChevronDown,
  Menu,
  Facebook,
  Instagram,
  Store,
} from "lucide-react";
import { CartDropdown } from "@/components/layout/cart-dropdown";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated, logout as authLogout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUser";
import { toast } from "sonner";

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
  const { wishlistCount, clearWishlist } = useWishlist();
  const { clearCart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { profile } = useUserProfile();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showSellerDashboardLink = isMounted && profile?.isSeller;

  const handleLogout = () => {
    authLogout();
    // Immediately clear in-memory state so UI updates without reload
    try {
      clearWishlist();
      clearCart();
    } catch {}
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
    toast.success("Signed out");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar: Seller/Info Links - Dark Green Background */}
      <div className="bg-[#1E392A] text-white text-xs sm:text-sm py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {showSellerDashboardLink ? (
              <Link href="/seller/dashboard" className="hover:underline">
                Seller Center
              </Link>
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

      {/* 2. Main Bar: Logo, Search, Cart, Login */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16 py-2">
        <Link href="/">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </Link>

        {/* Actions (Cart, Wishlist, Login) */}
        <div className="hidden lg:flex items-center space-x-6">
          <CartDropdown />

          {isLoggedIn && (
            <Link
              href="/wishlist"
              className="relative flex items-center hover:text-[#6A994E] transition-colors group"
            >
              <Heart size={24} className="group-hover:text-[#6A994E]" />
              <span className="text-sm ml-1 hidden sm:block">Wishlist</span>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#6A994E] text-white text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-gray-50 p-1 sm:p-2"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    {profile?.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#6A994E]/10 flex items-center justify-center">
                        <User size={20} className="text-[#6A994E]" />
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">
                    {profile?.firstName || "User"}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => router.push("/profile/my-information")}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/profile/order-history")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                rounded="lg"
                className="flex items-center space-x-2"
              >
                <User size={20} />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
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
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/"
                    className="text-lg font-medium text-gray-600 hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
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
                </nav>
                <div className="border-t pt-4">
                  <Link
                    href="/checkout"
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                  </Link>
                  {isLoggedIn && (
                    <Link
                      href="/wishlist"
                      className="mt-2 flex items-center space-x-2 text-gray-600 hover:text-primary"
                    >
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </Link>
                  )}
                  <Link
                    href="/seller/dashboard"
                    className="mt-2 flex items-center space-x-2 text-gray-600 hover:text-primary"
                  >
                    <Store className="h-5 w-5" />
                    <span>Seller Dashboard</span>
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile/my-information"
                        className="mt-2 flex items-center space-x-2 text-gray-600 hover:text-primary"
                      >
                        <UserCircle className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      <Button
                        variant="outline"
                        className="mt-4 w-full text-red-600 border-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button variant="primary" className="mt-4 w-full">
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 3. Main Navigation Bar - Centered Links */}
      <nav className="border-t border-gray-200 shadow-inner hidden lg:block">
        <div className="max-w-7xl mx-auto flex justify-center space-x-8 px-4 sm:px-6 lg:px-12 xl:px-16 h-14 items-center">
          <NavLink label="Home" path="/" />
          <NavLink label="Products" path="/shop" />
          <NavLink label="Growers" path="/grower" />
        </div>
      </nav>
    </header>
  );
}
