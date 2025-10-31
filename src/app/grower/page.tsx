"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Phone, Clock, Send } from "lucide-react";
import { useGrowers } from "@/hooks/useMain";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";

// --- TYPE DEFINITIONS ---
type Grower = {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coords: {
    lat: number;
    lng: number;
  };
};

// This will be replaced with dynamic data from the hook

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
  <div className="flex items-center text-sm text-gray-600">
    <Icon className="w-4 h-4 mr-3 text-gray-500" />
    <span>{text}</span>
  </div>
);

// --- MAIN GROWERS PAGE COMPONENT ---
export default function GrowersPage() {
  const { growers, loading, error } = useGrowers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrower, setSelectedGrower] = useState<Grower | null>(null);
  const [showNearMe, setShowNearMe] = useState(false);

  // Set the first grower as selected when data loads
  React.useEffect(() => {
    if (growers.length > 0 && !selectedGrower) {
      setSelectedGrower(growers[0]);
    }
  }, [growers, selectedGrower]);

  // Filter growers by search term
  const filteredGrowers = growers.filter(
    (grower) =>
      grower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grower.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading growers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-white font-['Roboto']">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">No growers found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Roboto']">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Browse Growers
            </h1>
            <p className="text-gray-600">
              Discover local mushroom growers and explore their fresh produce
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by grower name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6A994E] focus:border-transparent"
              />
            </div>
          </div>

          {/* Growers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGrowers.map((grower) => (
              <Link
                key={grower.id}
                href={`/grower/${grower.id}`}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-[#6A994E]">
                  {/* Grower Logo */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {grower.logo ? (
                        <Image
                          src={grower.logo}
                          alt={grower.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          {grower.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-gray-900 group-hover:text-[#6A994E] transition-colors">
                        {grower.name}
                      </h2>
                      {grower.tagline && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {grower.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grower Info */}
                  <div className="space-y-2 text-sm">
                    <GrowerInfoRow
                      icon={MapPin}
                      text={grower.location || grower.address}
                    />
                    <GrowerInfoRow icon={Phone} text={grower.phone} />
                    <GrowerInfoRow icon={Clock} text={grower.hours} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-[#6A994E] font-medium group-hover:underline">
                      Visit Store →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredGrowers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No growers found matching &quot;{searchTerm}&quot;
              </p>
            </div>
          )}

          {/* Near Me Section */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Growers Near Me
                </h2>
                <p className="text-sm text-gray-600">
                  Find growers closest to your location with our interactive map
                </p>
              </div>
              <button
                onClick={() => setShowNearMe(!showNearMe)}
                className="px-4 py-2 bg-[#6A994E] text-white rounded-lg hover:bg-[#5a8441] transition-colors"
              >
                {showNearMe ? "Hide Map" : "Show Map"}
              </button>
            </div>

            {showNearMe && selectedGrower && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growers List for Map */}
                <div className="lg:col-span-1 space-y-3">
                  {growers.map((grower) => (
                    <Card
                      key={grower.id}
                      onClick={() => setSelectedGrower(grower)}
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200 border-2",
                        selectedGrower.id === grower.id
                          ? "bg-gray-100 border-[#6A994E]"
                          : "bg-white hover:bg-gray-50 border-transparent"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">
                            {grower.name}
                          </h3>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {grower.location || grower.address}
                          </p>
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coords.lat},${grower.coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center text-xs text-gray-600 hover:text-gray-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-[#1E392A] text-white rounded-full p-2">
                            <Send className="w-3 h-3" />
                          </div>
                          <span className="mt-1 text-[10px]">Go</span>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Map */}
                <div className="lg:col-span-2">
                  <div className="w-full h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-md">
                    <iframe
                      src={`https://maps.google.com/maps?q=${selectedGrower.coords.lat},${selectedGrower.coords.lng}&hl=en&z=14&output=embed`}
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
        </main>
      </div>
    </div>
  );
}
