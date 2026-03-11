"use client";

import { MapPin, Navigation, Truck } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface StaticTrackingMapProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  status: string;
}

/**
 * CSS-based tracking map fallback when Google Maps API key is unavailable.
 * Shows pickup (A), dropoff (B), and optional driver marker positioned
 * proportionally within a styled container.
 */
export default function StaticTrackingMap({
  pickup,
  dropoff,
  driverLocation,
  status,
}: StaticTrackingMapProps) {
  // Compute bounding box for all points
  const allLats = [pickup.lat, dropoff.lat, ...(driverLocation ? [driverLocation.lat] : [])];
  const allLngs = [pickup.lng, dropoff.lng, ...(driverLocation ? [driverLocation.lng] : [])];
  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLng = Math.min(...allLngs);
  const maxLng = Math.max(...allLngs);

  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;
  const padding = 0.15; // 15% padding on each side

  function toPercent(lat: number, lng: number) {
    const x = padding + ((lng - minLng) / lngRange) * (1 - 2 * padding);
    const y = padding + ((maxLat - lat) / latRange) * (1 - 2 * padding);
    return { left: `${(x * 100).toFixed(1)}%`, top: `${(y * 100).toFixed(1)}%` };
  }

  const pickupPos = toPercent(pickup.lat, pickup.lng);
  const dropoffPos = toPercent(dropoff.lat, dropoff.lng);
  const driverPos = driverLocation ? toPercent(driverLocation.lat, driverLocation.lng) : null;

  const isActive = ["ON_GOING", "PICKED_UP", "DRIVER_ASSIGNED", "ASSIGNING_DRIVER"].includes(status);

  return (
    <div className="relative h-[400px] w-full rounded-b-lg bg-emerald-50 overflow-hidden border border-emerald-200">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6b7280 1px, transparent 1px), linear-gradient(to bottom, #6b7280 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Route line between pickup and dropoff */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <line
          x1={pickupPos.left}
          y1={pickupPos.top}
          x2={dropoffPos.left}
          y2={dropoffPos.top}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.6"
        />
      </svg>

      {/* Pickup marker (A) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: pickupPos.left, top: pickupPos.top }}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-sm">
          A
        </div>
        <span className="mt-1 text-xs font-medium text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[120px] truncate">
          {pickup.address || "Pickup"}
        </span>
      </div>

      {/* Dropoff marker (B) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: dropoffPos.left, top: dropoffPos.top }}
      >
        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md font-bold text-sm">
          B
        </div>
        <span className="mt-1 text-xs font-medium text-red-700 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[120px] truncate">
          {dropoff.address || "Delivery"}
        </span>
      </div>

      {/* Driver marker */}
      {driverPos && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: driverPos.left, top: driverPos.top }}
        >
          <div
            className={`w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ${
              isActive ? "animate-pulse" : ""
            }`}
          >
            <Truck className="h-5 w-5" />
          </div>
          <span className="mt-1 text-xs font-medium text-blue-700 bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
            Driver
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2.5 shadow-lg space-y-1.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-medium">Pickup (A)</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-red-600" />
          <span className="text-xs font-medium">Delivery (B)</span>
        </div>
        {driverPos && (
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium">Driver</span>
          </div>
        )}
      </div>

      {/* "No Maps API" note */}
      <div className="absolute top-3 right-3 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 shadow-sm">
        <p className="text-xs text-amber-700 font-medium">Simplified Map View</p>
      </div>
    </div>
  );
}
