"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, Clock, ArrowLeft, Mail, Award } from "lucide-react";
import { useSanityGrower, useSanityGrowerProducts } from "@/hooks/useSanityGrowers";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";

export default function GrowerDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id; // Now expecting slug instead of ID
  const { grower, loading, error } = useSanityGrower(slug);
  const { products, loading: loadingProducts } = useSanityGrowerProducts(grower?.id || '', 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading grower…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !grower) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <Link
              href="/grower"
              className="inline-flex items-center text-sm text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Grower not found
            </h1>
            <p className="text-muted-foreground">
              We couldn&apos;t find the grower you&apos;re looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full bg-gradient-to-r from-primary to-primary/80">
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
                src={grower.image || "/placeholder.png"}
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
              <h2 className="text-xl font-semibold text-foreground mb-3">
                About {grower.name}
              </h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                <p>
                  {grower.bio || `${grower.name} proudly cultivates high-quality mushrooms in ${grower.location || "the Philippines"}.`}
                </p>
                
                {/* Specialties */}
                {grower.specialties && grower.specialties.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {grower.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Certifications */}
                {grower.certifications && grower.certifications.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {grower.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="border-primary text-primary">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Our Current Harvest
                </h2>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner />
                </div>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground">
                  No products available right now. Please check back soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      farm={grower.name}
                      price={p.price}
                      unit={p.unit || 'pc'}
                      image={p.mainImage || '/placeholder.png'}
                      inStock={p.inStock}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {grower.location && (
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground mt-0.5" />
                    <span>{grower.location}</span>
                  </div>
                )}
                {grower.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span>{grower.contactPhone}</span>
                  </div>
                )}
                {grower.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`mailto:${grower.contactEmail}`} className="hover:text-primary">
                      {grower.contactEmail}
                    </a>
                  </div>
                )}
                {grower.region && (
                  <div className="flex items-center">
                    <Badge variant="secondary">{grower.region}</Badge>
                  </div>
                )}
              </div>
              {grower.coordinates && (
                <div className="mt-5">
                  <div className="text-right mb-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coordinates.lat},${grower.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Get directions
                    </a>
                  </div>
                  <div className="w-full h-48 bg-muted rounded overflow-hidden">
                    <iframe
                      src={`https://maps.google.com/maps?q=${grower.coordinates.lat},${grower.coordinates.lng}&hl=en&z=14&output=embed`}
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
              
              {/* Product Count Badge */}
              {grower.productCount !== undefined && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{grower.productCount}</div>
                    <div className="text-xs text-muted-foreground">Products Available</div>
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
