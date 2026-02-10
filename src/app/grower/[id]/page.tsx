"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, Clock, ArrowLeft, Mail, Award, ExternalLink, Store, ChevronRight, Globe, Facebook, Instagram, Calendar, Star } from "lucide-react";
import { useSanityGrower, useSanityGrowerProducts } from "@/hooks/useSanityGrowers";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { GoogleMap } from "@/components/maps/GoogleMap";
import { TikTokIcon } from "@/components/ui/tiktok-icon";
import { CalendlyButton } from "@/components/appointments";
import type { GrowerCalendlyData } from "@/components/appointments";
import { sanityClient } from "@/lib/sanity/client";
import { FirebaseReviewSection } from "@/components/reviews/FirebaseReviewSection";

export default function GrowerDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id; // Now expecting slug instead of ID
  const { grower, loading, error } = useSanityGrower(slug);
  const { products, loading: loadingProducts } = useSanityGrowerProducts(grower?.id || '', 12);
  
  // Calendly data for booking button
  const [calendlyData, setCalendlyData] = useState<GrowerCalendlyData | null>(null);
  
  // Fetch Calendly settings
  useEffect(() => {
    async function fetchCalendlyData() {
      if (!slug) return;
      try {
        const query = `*[_type == "grower" && slug.current == $slug][0] {
          calendlyEnabled,
          calendlyUsername,
          calendlyDefaultEvent,
          calcomButtonText,
          appointmentTypes[] {
            name,
            eventSlug,
            duration,
            meetingType,
            description,
            isDefault
          },
          appointmentNotes
        }`;
        const data = await sanityClient.fetch<GrowerCalendlyData>(query, { slug });
        setCalendlyData(data);
      } catch (err) {
        console.error("Error fetching Calendly data:", err);
      }
    }
    fetchCalendlyData();
  }, [slug]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            
            {/* Book Appointment Button */}
            {calendlyData?.calendlyEnabled && (
              <div className="flex items-center gap-3">
                <CalendlyButton
                  growerSlug={slug || ""}
                  growerName={grower.name}
                  calendlyEnabled={calendlyData.calendlyEnabled}
                  appointmentTypes={calendlyData.appointmentTypes}
                  buttonText={calendlyData?.calcomButtonText || grower.calcomButtonText}
                  variant="secondary"
                  size="lg"
                  className="shadow-lg"
                />
              </div>
            )}
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
                      slug={p.slug?.current}
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

            {/* Grower Reviews Section - Firebase-backed */}
            <section className="mt-10 border-t pt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Reviews for {grower.name}
              </h2>
              <FirebaseReviewSection
                targetType="grower"
                targetId={grower.id || slug || ""}
                targetName={grower.name}
              />
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
                {grower.operatingHours && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span>{grower.operatingHours}</span>
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">📍 Location</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coordinates.lat},${grower.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <GoogleMap
                    coordinates={grower.coordinates}
                    growerName={grower.name}
                    address={grower.location}
                    height="200px"
                    zoom={15}
                    className="rounded-lg overflow-hidden"
                  />
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
              
              {/* Social Media Links */}
              {grower.socialLinks && (grower.socialLinks.facebook || grower.socialLinks.instagram || grower.socialLinks.tiktok || grower.socialLinks.website) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3 text-center">Follow Us</h4>
                  <div className="flex justify-center gap-3">
                    {grower.socialLinks.facebook && (
                      <a
                        href={grower.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {grower.socialLinks.instagram && (
                      <a
                        href={grower.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {grower.socialLinks.tiktok && (
                      <a
                        href={grower.socialLinks.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="TikTok"
                      >
                        <TikTokIcon size={20} />
                      </a>
                    )}
                    {grower.socialLinks.website && (
                      <a
                        href={grower.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Website"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Book Appointment Card */}
            {calendlyData?.calendlyEnabled && (
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Book an Appointment
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Schedule a meeting with {grower.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Interested in our products? Book a consultation to discuss bulk orders, 
                  custom requests, or schedule a farm visit.
                </p>
                <CalendlyButton
                  growerSlug={slug || ""}
                  growerName={grower.name}
                  calendlyEnabled={calendlyData.calendlyEnabled}
                  appointmentTypes={calendlyData.appointmentTypes}
                  buttonText={calendlyData?.calcomButtonText || grower.calcomButtonText}
                  variant="default"
                  size="default"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Find At Stores Section */}
            {grower.availableAtStores && grower.availableAtStores.length > 0 && (
              <div className="rounded-lg border bg-card p-5 shadow-sm mt-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Find Our Products At
                </h3>
                <div className="space-y-3">
                  {grower.availableAtStores.map((store) => (
                    <Link
                      key={store.id}
                      href={`/stores/${store.slug}`}
                      className="group flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Store Image */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {store.imageUrl ? (
                            <Image
                              src={store.imageUrl}
                              alt={store.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Store Info */}
                        <div>
                          <div className="font-medium text-sm group-hover:text-primary transition-colors">
                            {store.name}
                          </div>
                          {(store.city || store.state) && (
                            <div className="text-xs text-muted-foreground">
                              {[store.city, store.state].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
                
                <Link
                  href="/stores"
                  className="mt-4 block text-center text-sm text-primary hover:underline"
                >
                  View All Store Locations
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
