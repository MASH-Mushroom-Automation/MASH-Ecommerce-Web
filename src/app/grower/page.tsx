"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Phone, Clock, Send, Store, X } from "lucide-react";
import { useSanityGrowers } from "@/hooks/useSanityGrowers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { isAuthenticated } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TransformedGrower } from "@/types/sanity";
import { GrowerListSkeleton } from "@/components/ui/skeleton-loaders";

// --- HELPER & UI COMPONENTS ---

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
);

const GrowerInfoRow = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-center text-sm text-muted-foreground">
    <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
    <span>{text}</span>
  </div>
);

// --- MAIN GROWERS PAGE COMPONENT ---
export default function GrowersPage() {
  const { growers, loading, error } = useSanityGrowers({ isActive: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedGrower, setSelectedGrower] =
    useState<TransformedGrower | null>(null);
  const [showNearMe, setShowNearMe] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [displayCount, setDisplayCount] = useState(8);

  // Extract unique regions from growers
  const regions = useMemo(() => {
    if (!growers || growers.length === 0) return [];
    const regionSet = new Set(
      growers
        .map((g) => g.region || g.location?.split(",").pop()?.trim() || "Other")
        .filter(Boolean)
    );
    return Array.from(regionSet).sort();
  }, [growers]);

  // Check authentication status
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Set the first grower as selected when data loads
  React.useEffect(() => {
    if (growers.length > 0 && !selectedGrower) {
      setSelectedGrower(growers[0]);
    }
  }, [growers, selectedGrower]);

  // Filter growers by search term and region
  const filteredGrowers = growers.filter((grower) => {
    const matchesSearch =
      grower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grower.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const growerRegion =
      grower.region || grower.location?.split(",").pop()?.trim() || "Other";
    const matchesRegion = !selectedRegion || growerRegion === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-['Roboto']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
          {/* Header skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-muted rounded w-96 animate-pulse"></div>
          </div>

          {/* Search bar skeleton */}
          <div className="mb-6">
            <div className="h-[50px] bg-muted rounded-lg w-full max-w-xl animate-pulse"></div>
          </div>

          {/* Grower cards skeleton */}
          <GrowerListSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background font-['Roboto']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedGrower) {
    return (
      <div className="min-h-screen bg-background font-['Roboto']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No growers found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Roboto']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <main>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Browse Growers
            </h1>
            <p className="text-muted-foreground">
              Discover local mushroom growers and explore their fresh produce
            </p>
          </div>

          {/* Search Bar and Region Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search bar */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by grower name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Region filter */}
              {regions.length > 0 && (
                <div className="w-full sm:w-64">
                  <Select
                    value={selectedRegion || "all"}
                    onValueChange={(value) => {
                      setSelectedRegion(value === "all" ? null : value);
                      setDisplayCount(itemsPerPage); // Reset display count on filter change
                    }}
                  >
                    <SelectTrigger className="w-full h-[50px]">
                      <SelectValue placeholder="Filter by region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Active filter badge */}
            {selectedRegion && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Filtering by:
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedRegion}
                  <button
                    onClick={() => {
                      setSelectedRegion(null);
                      setDisplayCount(itemsPerPage);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>

          {/* Count and Items Per Page Control */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground">
              Showing {Math.min(displayCount, filteredGrowers.length)} of{" "}
              {filteredGrowers.length} growers
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setItemsPerPage(newValue);
                  setDisplayCount(newValue);
                }}
                className="bg-background text-foreground border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={8}>8 per page</option>
                <option value={16}>16 per page</option>
                <option value={24}>24 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Growers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGrowers.slice(0, displayCount).map((grower) => (
              <Link
                key={grower.id}
                href={`/grower/${grower.slug}`}
                className="group flex"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary flex flex-col w-full">
                  {/* Grower Logo */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {grower.image ? (
                        <Image
                          src={grower.image}
                          alt={grower.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {grower.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {grower.name}
                      </h2>
                      {grower.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {grower.bio.slice(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grower Info */}
                  <div className="space-y-2 text-sm flex-grow">
                    {grower.location && (
                      <GrowerInfoRow icon={MapPin} text={grower.location} />
                    )}
                    {grower.contactPhone && (
                      <GrowerInfoRow icon={Phone} text={grower.contactPhone} />
                    )}
                    {grower.specialties && grower.specialties.length > 0 && (
                      <GrowerInfoRow
                        icon={Store}
                        text={grower.specialties.slice(0, 2).join(", ")}
                      />
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      Visit Store →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < filteredGrowers.length && (
            <div className="flex justify-center mb-12">
              <button
                onClick={() => setDisplayCount((prev) => prev + itemsPerPage)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium shadow-sm hover:shadow-md transition-all"
              >
                Load More Growers
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredGrowers.length === 0 && (
            <EmptyState
              icon={Store}
              title="No Growers Found"
              description={
                searchTerm
                  ? `No growers found matching "${searchTerm}". Try a different search term.`
                  : "No growers available at the moment. Please check back later."
              }
              actionLabel={searchTerm ? "Clear Search" : undefined}
              onAction={searchTerm ? () => setSearchTerm("") : undefined}
            />
          )}

          {/* Near Me Section - Only show when logged in */}
          {isLoggedIn && (
            <div className="mt-12 pt-12 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Growers Near Me
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Find growers closest to your location with our interactive
                    map
                  </p>
                </div>
                <button
                  onClick={() => setShowNearMe(!showNearMe)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {showNearMe ? "Hide Map" : "Show Map"}
                </button>
              </div>

              {showNearMe && selectedGrower && selectedGrower.coordinates && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Growers List for Map */}
                  <div className="lg:col-span-1 space-y-3">
                    {growers
                      .filter((g) => g.coordinates)
                      .map((grower) => (
                        <Card
                          key={grower.id}
                          onClick={() => setSelectedGrower(grower)}
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200 border-2",
                            selectedGrower.id === grower.id
                              ? "bg-muted border-primary"
                              : "bg-card hover:bg-muted/50 border-transparent"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-foreground mb-2">
                                {grower.name}
                              </h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {grower.location || "Location not specified"}
                              </p>
                            </div>
                            {grower.coordinates && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coordinates.lat},${grower.coordinates.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="bg-primary text-primary-foreground rounded-full p-2">
                                  <Send className="w-3 h-3" />
                                </div>
                                <span className="mt-1 text-[10px]">Go</span>
                              </a>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>

                  {/* Map */}
                  <div className="lg:col-span-2">
                    <div className="w-full h-[500px] bg-muted rounded-lg overflow-hidden shadow-md">
                      <iframe
                        src={`https://maps.google.com/maps?q=${selectedGrower.coordinates.lat},${selectedGrower.coordinates.lng}&hl=en&z=14&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Grower Location Map"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
