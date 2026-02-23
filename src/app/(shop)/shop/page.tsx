import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop All Products | MASH Marketplace",
  description:
    "Browse fresh produce, organic goods, and locally-sourced products from Filipino growers. Shop vegetables, fruits, herbs, and more at MASH Marketplace.",
  openGraph: {
    title: "Shop All Products | MASH Marketplace",
    description:
      "Browse fresh produce, organic goods, and locally-sourced products from Filipino growers.",
    type: "website",
    url: "https://www.mashmarket.app/shop",
    siteName: "MASH Marketplace",
  },
  alternates: {
    canonical: "https://www.mashmarket.app/shop",
  },
};

export default function ShopPage() {
  return (
    <Suspense>
      <ShopClient />
    </Suspense>
  );
}
