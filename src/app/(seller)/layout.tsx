"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  ShoppingBag,
  MapPin,
  Truck,
  Store,
  RotateCcw,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? "bg-[#1E392A] text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {isActive && <ChevronRight className="ml-auto h-5 w-5" />}
    </Link>
  );
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarLinks = [
    {
      href: "/seller/dashboard",
      icon: <LayoutGrid size={20} />,
      label: "Dashboard",
    },
    {
      href: "/seller/products",
      icon: <Package size={20} />,
      label: "Products",
    },
    {
      href: "/seller/orders",
      icon: <ShoppingBag size={20} />,
      label: "Orders",
    },
    {
      href: "/seller/address",
      icon: <MapPin size={20} />,
      label: "Address Management",
    },
    // {
    //   href: "/seller/shipping",
    //   icon: <Truck size={20} />,
    //   label: "Shipping Channel",
    // },
    {
      href: "/seller/handover",
      icon: <Store size={20} />,
      label: "Handover Center Pickup",
    },
    {
      href: "/seller/refund",
      icon: <RotateCcw size={20} />,
      label: "Refund",
    },
    {
      href: "/seller/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1E392A] rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Seller Name</h3>
              <p className="text-xs text-gray-500">seller@example.com</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-600"
            >
              <Store size={18} className="mr-2" />
              Back to Store
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header and menu */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <div className="p-4 border-b border-gray-200">
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/Logo  v6 - Market.png"
                      alt="MASH Logo"
                      width={120}
                      height={40}
                      className="h-10 w-auto"
                    />
                  </Link>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#1E392A] rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Seller Name
                      </h3>
                      <p className="text-xs text-gray-500">
                        seller@example.com
                      </p>
                    </div>
                  </div>

                  <nav className="space-y-1">
                    {sidebarLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.label}
                      />
                    ))}
                  </nav>
                </div>

                <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-gray-600"
                    >
                      <Store size={18} className="mr-2" />
                      Back to Store
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
