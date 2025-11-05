"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import { useGrower } from "@/hooks/useMain";
import { ProductsApi } from "@/lib/api/products";
import type { ProductApiResponse } from "@/types/api";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function normalizeGrowerKey(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

export default function GrowerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { grower, loading, error } = useGrower(id);
  const [products, setProducts] = React.useState<ProductApiResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      if (!grower) return;
      setLoadingProducts(true);
      try {
        const key = normalizeGrowerKey(grower.name);
        const res = await ProductsApi.getProducts({ grower: key, limit: 12 });
        if (!active) return;
        setProducts(res.data || []);
      } catch {
        if (!active) return;
        setProducts([]);
      } finally {
        if (!active) return;
        setLoadingProducts(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [grower]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading grower…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !grower) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <Link
              href="/grower"
              className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Grower not found
            </h1>
            <p className="text-gray-600">
              We couldn&apos;t find the grower you&apos;re looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full bg-gradient-to-r from-[#1E392A] to-[#6A994E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12">
          <Link
            href="/grower"
            className="inline-flex items-center text-white/90 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/20">
              <Image
                src={grower.logo || "/placeholder.png"}
                alt={grower.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {grower.name}
              </h1>
              {grower.tagline && (
                <p className="text-white/90 mt-1">{grower.tagline}</p>
              )}
              {grower.location && (
                <p className="text-white/80 text-sm mt-1">{grower.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Story
              </h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <p>
                  {grower.name} proudly cultivates high-quality mushrooms in{" "}
                  {grower.location || "the Philippines"}.{" "}
                  {grower.tagline ||
                    "We’re passionate about freshness, sustainability, and supporting local communities."}
                </p>
                <p>
                  We harvest at peak freshness and work closely with MASH to
                  bring our produce straight to your kitchen.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Our Current Harvest
                </h2>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner />
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-600">
                  No products available right now. Please check back soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      farm={p.grower}
                      price={p.price}
                      unit={p.weight}
                      image={p.image}
                      inStock={p.inStock}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Contact & Hours
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                  <span>{grower.address}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-500" />
                  <span>{grower.phone}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-3 text-gray-500" />
                  <span>{grower.hours}</span>
                </div>
              </div>
              {grower.coords && (
                <div className="mt-5">
                  <div className="text-right mb-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coords.lat},${grower.coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Get directions
                    </a>
                  </div>
                  <div className="w-full h-48 bg-gray-200 rounded overflow-hidden">
                    <iframe
                      src={`https://maps.google.com/maps?q=${grower.coords.lat},${grower.coords.lng}&hl=en&z=14&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Grower Location Map"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
