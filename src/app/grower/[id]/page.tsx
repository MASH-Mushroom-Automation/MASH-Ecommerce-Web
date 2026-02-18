"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin, Phone, Clock, ArrowLeft, Mail, Award, ExternalLink,
  Store, ChevronRight, Globe, Facebook, Instagram, Calendar,
  Star, Leaf, ShieldCheck, Package, Users, ImageIcon,
} from "lucide-react";
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

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white dark:bg-card backdrop-blur-sm px-4 py-4 shadow-sm border border-border/60 hover:shadow-md transition-shadow">
      <div className="p-1.5 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground leading-none font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Farm Gallery                                                       */
/* ------------------------------------------------------------------ */
function FarmGallery({ images, growerName }: { images: string[]; growerName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] bg-muted">
        <Image
          src={images[selectedIndex]}
          alt={`${growerName} farm photo ${selectedIndex + 1}`}
          fill
          className="object-cover"
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === selectedIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function GrowerDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id;
  const { grower, loading, error } = useSanityGrower(slug);
  const { products, loading: loadingProducts } = useSanityGrowerProducts(grower?.id || "", 12);

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

  // Compute how long ago the grower joined
  const memberSince = useMemo(() => {
    if (!grower?.joinedDate && !grower?.createdAt) return null;
    const d = new Date(grower.joinedDate || grower.createdAt);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [grower?.joinedDate, grower?.createdAt]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading grower profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error / Not Found ---------- */
  if (error || !grower) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <Link href="/grower" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Growers
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Grower not found</h1>
            <p className="text-muted-foreground">We couldn&apos;t find the grower you&apos;re looking for.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Helpers ---------- */
  const hasSocialLinks =
    grower.socialLinks &&
    (grower.socialLinks.facebook || grower.socialLinks.instagram || grower.socialLinks.tiktok || grower.socialLinks.website);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative w-full">
        {/* Cover image or gradient fallback */}
        <div className="absolute inset-0 h-full">
          {grower.coverImage ? (
            <>
              <Image
                src={grower.coverImage}
                alt={`${grower.name} cover`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="h-full bg-gradient-to-br from-primary via-primary/90 to-emerald-600" />
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          {/* Back link */}
          <div className="pt-6 pb-4">
            <Link
              href="/grower"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Growers
            </Link>
          </div>

          {/* Profile row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 sm:pb-10">
            {/* Left: Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-xl flex-shrink-0">
                <Image
                  src={grower.image || "/placeholder.png"}
                  alt={grower.name}
                  fill
                  className="object-cover"
                  priority
                />
                {grower.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
                    {grower.name}
                  </h1>
                  {grower.isVerified && (
                    <Badge className="bg-primary/90 text-white border-0 text-[10px] uppercase tracking-wider">
                      Verified
                    </Badge>
                  )}
                </div>
                {grower.tagline && (
                  <p className="text-white/90 mt-1 text-sm sm:text-base max-w-lg">{grower.tagline}</p>
                )}
                {grower.location && (
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {grower.location}
                  </p>
                )}
              </div>
            </div>

            {/* Right: CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {hasSocialLinks && (
                <div className="flex items-center gap-2">
                  {grower.socialLinks?.facebook && (
                    <a href={grower.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm" title="Facebook">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {grower.socialLinks?.instagram && (
                    <a href={grower.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm" title="Instagram">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {grower.socialLinks?.tiktok && (
                    <a href={grower.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm" title="TikTok">
                      <TikTokIcon size={16} />
                    </a>
                  )}
                  {grower.socialLinks?.website && (
                    <a href={grower.socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm" title="Website">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS BAR                                                    */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 -mt-5 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {grower.productCount !== undefined && (
            <StatCard icon={Package} value={grower.productCount} label="Products" />
          )}
          {grower.rating !== undefined && grower.rating > 0 && (
            <StatCard icon={Star} value={grower.rating.toFixed(1)} label="Rating" />
          )}
          {grower.totalReviews !== undefined && grower.totalReviews > 0 && (
            <StatCard icon={Users} value={grower.totalReviews} label="Reviews" />
          )}
          {memberSince && (
            <StatCard icon={Leaf} value={memberSince} label="Member Since" />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* ------- LEFT COLUMN (2/3) ------- */}
          <div className="lg:col-span-2 space-y-10">
            {/* ---- About Section ---- */}
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b bg-muted/30">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  About {grower.name}
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <p className="text-muted-foreground leading-relaxed">
                  {grower.bio || `${grower.name} proudly cultivates high-quality mushrooms in ${grower.location || "the Philippines"}.`}
                </p>

                {/* Specialties */}
                {grower.specialties && grower.specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {grower.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {grower.certifications && grower.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {grower.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ---- Farm Gallery ---- */}
            {grower.farmImages && grower.farmImages.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Farm Photos
                </h2>
                <FarmGallery images={grower.farmImages} growerName={grower.name} />
              </section>
            )}

            {/* ---- Products Section ---- */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Current Harvest
                  {products.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{products.length}</Badge>
                  )}
                </h2>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner />
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
                  <Package className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No products available right now</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Please check back soon for fresh harvest updates.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      slug={p.slug?.current}
                      name={p.name}
                      farm={grower.name}
                      price={p.price}
                      unit={p.unit || "pc"}
                      image={p.mainImage || "/placeholder.png"}
                      inStock={p.inStock}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ---- Reviews Section ---- */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Customer Reviews
              </h2>
              <FirebaseReviewSection
                targetType="grower"
                targetId={grower.id || slug || ""}
                targetName={grower.name}
              />
            </section>
          </div>

          {/* ------- RIGHT SIDEBAR (1/3) ------- */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-5">
              {/* ---- Contact Card ---- */}
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-muted/30">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Contact Information
                  </h3>
                </div>
                <div className="p-5 space-y-3.5 text-sm">
                  {grower.location && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-muted-foreground">{grower.location}</span>
                    </div>
                  )}
                  {grower.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <a href={`tel:${grower.contactPhone}`} className="text-foreground font-medium hover:text-primary transition-colors">
                        {grower.contactPhone}
                      </a>
                    </div>
                  )}
                  {grower.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <a href={`mailto:${grower.contactEmail}`} className="text-foreground font-medium hover:text-primary transition-colors truncate">
                        {grower.contactEmail}
                      </a>
                    </div>
                  )}
                  {grower.operatingHours && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-muted-foreground">{grower.operatingHours}</span>
                    </div>
                  )}
                  {grower.region && (
                    <div className="pt-1">
                      <Badge variant="secondary" className="text-xs">{grower.region}</Badge>
                    </div>
                  )}
                </div>
                {(grower.contactEmail || grower.contactPhone) && (
                  <div className="px-5 pb-4 flex gap-2">
                    {grower.contactEmail && (
                      <a href={`mailto:${grower.contactEmail}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {grower.contactPhone && (
                      <a href={`tel:${grower.contactPhone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* ---- Map ---- */}
              {grower.coordinates && (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Location
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coordinates.lat},${grower.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <GoogleMap
                    coordinates={grower.coordinates}
                    growerName={grower.name}
                    address={grower.location}
                    height="200px"
                    zoom={15}
                    className="w-full"
                  />
                </div>
              )}

              {/* ---- Book Appointment Card ---- */}
              {calendlyData?.calendlyEnabled && (
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-emerald-50/80 to-primary/10 dark:from-primary/10 dark:via-emerald-900/20 dark:to-primary/5 shadow-md overflow-hidden">
                  <div className="p-5 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-primary text-white shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Book an Appointment</h3>
                        <p className="text-xs text-muted-foreground">Schedule a visit with {grower.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Interested in our products? Schedule a consultation for bulk orders, custom growing requests, or a farm tour.
                    </p>
                  </div>
                  {calendlyData.appointmentTypes && calendlyData.appointmentTypes.length > 0 && (
                    <div className="px-5 pb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {calendlyData.appointmentTypes.slice(0, 3).map((apt, i) => (
                          <Badge key={i} variant="secondary" className="text-[11px] bg-white/70 dark:bg-white/10">
                            {apt.name}
                            {apt.duration && <span className="text-muted-foreground ml-1">({apt.duration}min)</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-5 pt-3">
                    <CalendlyButton
                      growerSlug={slug || ""}
                      growerName={grower.name}
                      calendlyEnabled={calendlyData.calendlyEnabled}
                      appointmentTypes={calendlyData.appointmentTypes}
                      buttonText={calendlyData?.calcomButtonText || "Book Appointment"}
                      variant="default"
                      size="lg"
                      className="w-full font-semibold shadow-sm"
                    />
                    {calendlyData.appointmentNotes && (
                      <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                        {calendlyData.appointmentNotes}
                      </p>
                    )}
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
