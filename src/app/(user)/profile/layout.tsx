"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircleUser, Package, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-[#212121] mb-6">
                  Account
                </h1>

                {/* Navigation */}
                <div className="space-y-2 mb-8">
                  <Link
                    href="/profile/my-information"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      pathname === "/profile/my-information"
                        ? "bg-[#E8E8E8] text-[#212121]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CircleUser className="h-5 w-5" />
                    <span className="font-medium">My Information</span>
                  </Link>
                  <Link
                    href="/profile/order-history"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      pathname === "/profile/order-history"
                        ? "bg-[#E8E8E8] text-[#212121]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Order History</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
