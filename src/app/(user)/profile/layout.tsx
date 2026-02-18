"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircleUser, Package, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useUserProfile } from "@/hooks/useUser";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearWishlist } = useWishlist();
  const { clearCart } = useCart();
  const { clearProfile } = useUserProfile();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Clear localStorage and cookies
    logout();
    
    // Clear in-memory state
    try {
      clearWishlist();
      clearCart();
      clearProfile();
    } catch {}
    
    toast.success("Signed out");
    router.push("/");
    router.refresh();
    setLogoutDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card">
              <CardContent className="p-6">
                <h1 className="text-xl font-bold text-foreground mb-6">
                  Account
                </h1>

                {/* Navigation */}
                <div className="space-y-2 mb-8">
                  <Link
                    href="/profile/my-information"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      pathname === "/profile/my-information"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <CircleUser className="h-5 w-5" />
                    <span className="font-medium">My Information</span>
                  </Link>
                  <Link
                    href="/profile/order-history"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      pathname === "/profile/order-history"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Order History</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>

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
    </div>
  );
}
