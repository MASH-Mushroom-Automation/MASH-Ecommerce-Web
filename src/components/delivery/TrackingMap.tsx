'use client';

/**
 * Google Maps Tracking Component
 * Shows pickup, dropoff, and live driver location
 * 
 * Requirements:
 * - Add Google Maps API key to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * - Install package: npm install @googlemaps/js-api-loader
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface TrackingMapProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  status: string;
}

export default function TrackingMap({ pickup, dropoff, driverLocation, status }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{
    pickup?: google.maps.Marker;
    dropoff?: google.maps.Marker;
    driver?: google.maps.Marker;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          createMap();
          return;
        }

        // Load Google Maps API
        // Note: You'll need to add this to your HTML or use @googlemaps/js-api-loader
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = createMap;
        script.onerror = () => setError('Failed to load Google Maps');
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to initialize map');
      }
    };

    initMap();
  }, []);

  const createMap = () => {
    if (!mapRef.current) return;

    // Calculate center point between pickup and dropoff
    const centerLat = (pickup.lat + dropoff.lat) / 2;
    const centerLng = (pickup.lng + dropoff.lng) / 2;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMap(newMap);

    // Create markers
    createMarkers(newMap);
  };

  const createMarkers = (mapInstance: google.maps.Map) => {
    // Pickup marker (green)
    const pickupMarker = new google.maps.Marker({
      position: { lat: pickup.lat, lng: pickup.lng },
      map: mapInstance,
      title: 'Pickup Location',
      label: {
        text: 'A',
        color: 'white',
        fontWeight: 'bold',
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#6A994E',
        fillOpacity: 1,
        strokeColor: '#1E392A',
        strokeWeight: 2,
      },
    });

    // Pickup info window
    const pickupInfo = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">Pickup Location</h3>
          <p style="font-size: 14px; color: #666;">${pickup.address || 'MASH E-Commerce Store'}</p>
        </div>
      `,
    });

    pickupMarker.addListener('click', () => {
      pickupInfo.open(mapInstance, pickupMarker);
    });

    // Dropoff marker (red)
    const dropoffMarker = new google.maps.Marker({
      position: { lat: dropoff.lat, lng: dropoff.lng },
      map: mapInstance,
      title: 'Delivery Location',
      label: {
        text: 'B',
        color: 'white',
        fontWeight: 'bold',
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#DC2626',
        fillOpacity: 1,
        strokeColor: '#7F1D1D',
        strokeWeight: 2,
      },
    });

    // Dropoff info window
    const dropoffInfo = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">Delivery Location</h3>
          <p style="font-size: 14px; color: #666;">${dropoff.address || 'Customer Address'}</p>
        </div>
      `,
    });

    dropoffMarker.addListener('click', () => {
      dropoffInfo.open(mapInstance, dropoffMarker);
    });

    // Draw route line
    const routePath = new google.maps.Polyline({
      path: [
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng },
      ],
      geodesic: true,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.6,
      strokeWeight: 3,
      map: mapInstance,
    });

    setMarkers({ pickup: pickupMarker, dropoff: dropoffMarker });

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
    mapInstance.fitBounds(bounds);
  };

  // Update driver marker when driver location changes
  useEffect(() => {
    if (!map || !driverLocation) return;

    // Remove old driver marker
    if (markers.driver) {
      markers.driver.setMap(null);
    }

    // Create new driver marker (blue, animated)
    const driverMarker = new google.maps.Marker({
      position: { lat: driverLocation.lat, lng: driverLocation.lng },
      map: map,
      title: 'Driver Location',
      animation: google.maps.Animation.BOUNCE,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#1E40AF',
        strokeWeight: 2,
        rotation: 0, // TODO: Calculate bearing based on previous location
      },
    });

    // Driver info window
    const driverInfo = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">Driver Location</h3>
          <p style="font-size: 14px; color: #666;">Last updated: ${new Date().toLocaleTimeString()}</p>
        </div>
      `,
    });

    driverMarker.addListener('click', () => {
      driverInfo.open(map, driverMarker);
    });

    setMarkers((prev) => ({ ...prev, driver: driverMarker }));

    // Pan to driver location if delivered status
    if (status === 'PICKED_UP' || status === 'ON_GOING') {
      map.panTo({ lat: driverLocation.lat, lng: driverLocation.lng });
    }
  }, [driverLocation, map, status]);

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[400px] w-full rounded-b-lg" />

      {!map && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#6A994E]" />
          <span className="text-xs font-medium">Pickup (A)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#DC2626]" />
          <span className="text-xs font-medium">Delivery (B)</span>
        </div>
        {driverLocation && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-medium">Driver</span>
          </div>
        )}
      </div>
    </div>
  );
}
