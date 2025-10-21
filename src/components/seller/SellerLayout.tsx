"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Settings,
  Package,
  ShoppingBag,
  Truck,
  FileText,
  XCircle,
  User,
} from "lucide-react";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/Logo  v6 - Market.png"
              alt="MASH Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-60 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-24">
          <nav className="space-y-1">
            {/* Orders Section */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                Orders
              </p>
              <Link
                href="/seller/orders"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/seller/mass-ship"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Package className="h-5 w-5" />
                <span>Mass Ship</span>
              </Link>
              <Link
                href="/seller/handover"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 bg-green-50 border-l-4 border-[#1E392A]"
              >
                <Truck className="h-5 w-5" />
                <span>Handover Center</span>
              </Link>
              <Link
                href="/seller/returns"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <XCircle className="h-5 w-5" />
                <span>Return/Refund/Cancel</span>
              </Link>
              <Link
                href="/seller/shipping-settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <FileText className="h-5 w-5" />
                <span>Shipping Settings</span>
              </Link>
            </div>

            {/* Product Section */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                Product
              </p>
              <Link
                href="/seller/products"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Package className="h-5 w-5" />
                <span>My Products</span>
              </Link>
              <Link
                href="/seller/products/new"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Package className="h-5 w-5" />
                <span>Add New Product</span>
              </Link>
            </div>
          </nav>

          {/* Seller Info Footer */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Fungi Fresh Farms</p>
                <p className="text-xs text-gray-600">Juan Dela Cruz</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
