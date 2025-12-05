'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface GoogleMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  growerName?: string;
  className?: string;
  height?: string;
  zoom?: number;
}

// Global state to track if the Google Maps script has been loaded
let googleMapsPromise: Promise<void> | null = null;

/**
 * Load Google Maps API using direct script injection (new approach)
 * The Loader class from @googlemaps/js-api-loader is deprecated
 */
function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve();
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Define callback
    (window as any).initGoogleMaps = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
      googleMapsPromise = null;
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Google Maps Component for Grower Location
 * Uses the Google Maps JavaScript API to display grower locations
 * Updated to use direct script loading instead of deprecated Loader class
 * 
 * @param coordinates - { lat, lng } coordinates
 * @param address - Full address string for marker info
 * @param growerName - Name of the grower for marker title
 * @param className - Additional CSS classes
 * @param height - Height of the map container (default: "300px")
 * @param zoom - Zoom level (default: 15)
 */
export function GoogleMap({
  coordinates,
  address,
  growerName,
  className = '',
  height = '300px',
  zoom = 15,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;
    if (!coordinates?.lat || !coordinates?.lng) {
      setError('Invalid coordinates');
      setIsLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    try {
      await loadGoogleMapsApi(apiKey);

      const position = { lat: coordinates.lat, lng: coordinates.lng };

      // Create the map
      const map = new google.maps.Map(mapRef.current!, {
        center: position,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Create marker with custom icon
      const marker = new google.maps.Marker({
        map,
        position,
        title: growerName || 'MASH Grower Location',
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#1E392A',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // Info window with grower details
      if (address || growerName) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1E392A;">
                🍄 ${growerName || 'MASH Grower'}
              </h3>
              ${address ? `<p style="margin: 0; font-size: 14px; color: #666;">${address}</p>` : ''}
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}" 
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  margin-top: 8px;
                  padding: 6px 12px;
                  background-color: #1E392A;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 13px;
                "
              >
                Get Directions
              </a>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Open info window by default
        infoWindow.open(map, marker);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps');
      setIsLoading(false);
    }
  }, [coordinates, address, growerName, zoom]);

  useEffect(() => {
    initializeMap();

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground p-4">
          <p className="mb-2 text-lg">📍 Map unavailable</p>
          <p className="text-sm mb-3">{error}</p>
          {coordinates?.lat && coordinates?.lng && (
            <a
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Open in Google Maps →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ height }}
      />
    </div>
  );
}

/**
 * Static Map Image (fallback when API key isn't available)
 * Uses Google Static Maps API for a simple map image
 */
export function StaticGoogleMap({
  coordinates,
  growerName,
  className = '',
  height = '300px',
  zoom = 15,
}: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || !coordinates?.lat || !coordinates?.lng) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p className="mb-2">📍 Location</p>
          <a
            href={`https://www.google.com/maps?q=${coordinates?.lat || 0},${coordinates?.lng || 0}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-sm"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    );
  }

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:green%7Clabel:M%7C${coordinates.lat},${coordinates.lng}&key=${apiKey}`;

  return (
    <a
      href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`block relative ${className}`}
      style={{ height }}
    >
      <img
        src={staticMapUrl}
        alt={`Map showing location of ${growerName || 'grower'}`}
        className="w-full h-full object-cover rounded-lg"
      />
      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-muted-foreground">
        Click to open in Google Maps
      </div>
    </a>
  );
}

export default GoogleMap;
