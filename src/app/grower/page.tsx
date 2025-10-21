"use client";

import React, { useState } from "react";
import { Home, MapPin, Phone, Clock, Send } from "lucide-react";

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

// --- MOCK DATA ---
const growers: Grower[] = [
  {
    id: 1,
    name: "Fungi Fresh Farms",
    address: "Caloocan City, Metro Manila",
    phone: "+63 956 955 2808",
    hours: "7AM to 9PM, MON-FRI",
    coords: { lat: 14.7583, lng: 121.0453 }, // Approx. coordinates for Caloocan
  },
  {
    id: 2,
    name: "The Mushroom Patch Bukidnon",
    address: "Lantapan, Bukidnon",
    phone: "+63 922 524 1234",
    hours: "7AM to 9PM, MON-FRI",
    coords: { lat: 8.0811, lng: 125.0119 }, // Approx. coordinates for Lantapan
  },
  {
    id: 3,
    name: "Kabutehan ni Aling Nena",
    address: "Antipolo, Rizal",
    phone: "+63 966 552 3612",
    hours: "7AM to 9PM, MON-FRI",
    coords: { lat: 14.5864, lng: 121.1754 }, // Approx. coordinates for Antipolo
  },
  {
    id: 4,
    name: "Shroomarket",
    address: "Malate, Manila",
    phone: "+63 917 252 7378",
    hours: "7AM to 9PM, MON-FRI",
    coords: { lat: 14.5699, lng: 120.9929 }, // Approx. coordinates for Malate
  },
];

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
  const [selectedGrower, setSelectedGrower] = useState<Grower>(growers[0]);

  const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedGrower.coords.lat},${selectedGrower.coords.lng}&hl=en&z=14&output=embed`;

  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Left Panel: Growers List */}
            <div className="w-full md:w-1/3 lg:w-2/5">
              <div className="flex items-center mb-6">
                <Home className="w-8 h-8 text-gray-700" />
                <h1 className="ml-4 text-2xl font-bold text-gray-800">
                  Grower&apos;s Near Me!
                </h1>
              </div>
              <div className="space-y-4">
                {growers.map((grower) => (
                  <Card
                    key={grower.id}
                    onClick={() => setSelectedGrower(grower)}
                    className={cn(
                      "p-5 cursor-pointer transition-all duration-200 border-2",
                      selectedGrower.id === grower.id
                        ? "bg-gray-100 border-gray-300"
                        : "bg-white hover:bg-gray-50 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-lg text-gray-900">
                          {grower.name}
                        </h2>
                        <div className="mt-3 space-y-2">
                          <GrowerInfoRow icon={MapPin} text={grower.address} />
                          <GrowerInfoRow icon={Phone} text={grower.phone} />
                          <GrowerInfoRow icon={Clock} text={grower.hours} />
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${grower.coords.lat},${grower.coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-xs text-gray-600 hover:text-gray-900"
                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking the link
                      >
                        <div className="bg-gray-800 text-white rounded-full p-2.5">
                          <Send className="w-4 h-4" />
                        </div>
                        <span className="mt-1">Directions</span>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel: Map */}
            <div className="w-full md:w-2/3 lg:w-3/5 mt-8 md:mt-0">
              <div className="sticky top-8">
                <div className="text-right mb-2">
                  <a
                    href={mapEmbedUrl.replace("embed", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View larger map
                  </a>
                </div>
                <div className="w-full h-[600px] bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={mapEmbedUrl}
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
          </div>
        </main>
      </div>
    </div>
  );
}
