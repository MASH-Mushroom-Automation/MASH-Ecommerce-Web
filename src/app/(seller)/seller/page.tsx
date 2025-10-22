"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard page
    router.push("/seller/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          Redirecting to Seller Dashboard...
        </h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
