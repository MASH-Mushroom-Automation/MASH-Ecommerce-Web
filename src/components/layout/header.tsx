"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Settings,
} from "lucide-react";
import { CartDropdown } from "@/components/layout/cart-dropdown";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated, logout as authLogout } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useNavigation } from "@/hooks/useNavigation";

type SellerStatus = "approved" | "pending" | "none";

const SellerInfoBar: React.FC<{ sellerStatus: SellerStatus }> = ({ sellerStatus }) => (
  <div className="bg-primary text-primary-foreground text-xs sm:text-sm py-2">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {sellerStatus === "approved" ? (
          <Link href="/seller/dashboard" className="hover:underline">
            Seller Center
          </Link>
        ) : sellerStatus === "pending" ? (
          <span
            className="text-accent-foreground/80 cursor-not-allowed"
            title="Your seller application is awaiting admin approval"
          >
            Application Pending ⏳
          </span>
        ) : (
          <Link href="/start-selling" className="hover:underline">
            Start Selling
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-primary-foreground/90">
        <Link href="/blog" className="hover:underline whitespace-nowrap">
          BLOG
        </Link>
        <span className="hidden sm:inline opacity-50">•</span>
        <Link href="/faq" className="hidden sm:inline hover:underline whitespace-nowrap">
          FAQ
        </Link>
        <span className="hidden sm:inline opacity-50">•</span>
        <Link href="/contact" className="hidden sm:inline hover:underline whitespace-nowrap">
          CONTACT US
        </Link>
        <span className="hidden sm:inline opacity-50">•</span>
        <div className="hidden sm:flex items-center gap-2">
          <a href="#" aria-label="Facebook" className="hover:text-primary-foreground">
            <Facebook size={18} />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-primary-foreground">
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

interface NavLinkProps {
  label: string;
  path: string;
}

export function SellerHeader() {
  const { profile } = useUserProfile();
  const [isMounted, setIsMounted] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const element = headerRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--seller-header-height", `${height}px`);
    };

    updateHeight();

    let observer: ResizeObserver | undefined;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateHeight());
      observer.observe(element);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (observer) {
        observer.disconnect();
      }
      document.documentElement.style.removeProperty("--seller-header-height");
    };
  }, []);

  const sellerStatus: SellerStatus = isMounted
    ? ((profile?.sellerStatus as SellerStatus) || "none")
    : "none";

  return (
    <header
      ref={headerRef}
      className="bg-background shadow-sm sticky top-0 z-50 border-b border-border"
    >
      <SellerInfoBar sellerStatus={sellerStatus} />
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export function SimpleHeader() {
  const { profile } = useUserProfile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sellerStatus: SellerStatus = isMounted
    ? ((profile?.sellerStatus as SellerStatus) || "none")
    : "none";

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <SellerInfoBar sellerStatus={sellerStatus} />
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <span className="w-9" aria-hidden="true" />
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}

const NavLink: React.FC<NavLinkProps> = ({ label, path }) => {
  const pathname = usePathname();
  const active = pathname === path;

  return (
    <Link
      href={path}
      className={`relative text-base font-semibold ${
        active ? "text-primary" : "text-muted-foreground"
      } hover:text-primary transition-colors h-full flex items-center`}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 h-1 w-full bg-primary rounded-t-lg"></div>
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

  // Three-state seller status logic
  const sellerStatus: SellerStatus = isMounted
    ? ((profile?.sellerStatus as SellerStatus) || "none")
    : "none";

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    authLogout();
    // Immediately clear in-memory state so UI updates without reload
    try {
      clearWishlist();
      clearCart();
    } catch {}
    router.push("/");
    router.refresh();
    toast.success("Signed out");
    setLogoutDialogOpen(false);
  };

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 border-b border-border">
      <SellerInfoBar sellerStatus={sellerStatus} />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-12 xl:px-16 py-2">
        <Link href="/">
          <Image
            src="/Logo  v6 - Market.png"
            alt="MASH Logo"
            width={150}
            height={50}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center space-x-6">
          <ThemeSwitcher />
          <CartDropdown />

          {isLoggedIn && (
            <Link
              href="/wishlist"
              className="relative flex items-center hover:text-primary transition-colors group"
            >
              <Heart size={24} className="group-hover:text-primary" />
              <span className="text-sm ml-1 hidden sm:block">Wishlist</span>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
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
                  className="flex items-center space-x-2 hover:bg-muted/40 border-border"
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 text-primary">
                    {profile?.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User size={20} className="absolute inset-0 m-auto" />
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
                  onClick={handleLogoutClick}
                  className="text-destructive"
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

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="border border-border lg:hidden"
            onClick={() => router.push("/cart")}
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-border">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card text-foreground">
              <div className="flex flex-col space-y-4 p-4">
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/"
                    className="text-lg font-medium text-muted-foreground hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className="text-lg font-medium text-muted-foreground hover:text-primary"
                  >
                    Products
                  </Link>
                  <Link
                    href="/grower"
                    className="text-lg font-medium text-muted-foreground hover:text-primary"
                  >
                    Growers
                  </Link>
                </nav>
                <div className="border-t border-border pt-4 space-y-2">
                  <Link
                    href="/checkout"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                  </Link>
                  {isLoggedIn && (
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                    >
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </Link>
                  )}
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                  >
                    <Store className="h-5 w-5" />
                    <span>Seller Dashboard</span>
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile/my-information"
                        className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                      >
                        <UserCircle className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive/10"
                        onClick={handleLogoutClick}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button variant="primary" className="w-full">
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

      <nav className="border-t border-border hidden lg:block bg-card/60 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-center space-x-8 px-4 sm:px-6 lg:px-12 xl:px-16 h-14 items-center">
          <NavLink label="Home" path="/" />
          <NavLink label="Products" path="/shop" />
          <NavLink label="Growers" path="/grower" />
          {sellerStatus === "approved" && (
            <NavLink label="Dashboard" path="/seller/dashboard" />
          )}
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
