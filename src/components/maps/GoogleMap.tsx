'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

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

/**
 * Google Maps Component for Grower Location
 * Uses the Google Maps JavaScript API to display grower locations
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });

    loader
      .importLibrary('maps')
      .then(async ({ Map }) => {
        const position = { lat: coordinates.lat, lng: coordinates.lng };

        const map = new Map(mapRef.current!, {
          center: position,
          zoom,
          mapId: 'MASH_GROWER_MAP', // Required for Advanced Markers
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

        // Try to use Advanced Marker if available
        try {
          const { AdvancedMarkerElement } = await loader.importLibrary('marker');
          
          // Create custom marker content
          const markerContent = document.createElement('div');
          markerContent.innerHTML = `
            <div style="
              background-color: #1E392A;
              padding: 8px 12px;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              color: white;
              font-weight: 600;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span>🍄</span>
              <span>${growerName || 'MASH Grower'}</span>
            </div>
          `;

          new AdvancedMarkerElement({
            map,
            position,
            content: markerContent,
            title: growerName || 'MASH Grower Location',
          });
        } catch {
          // Fallback to standard marker
          const { Marker, InfoWindow } = await loader.importLibrary('maps') as any;
          
          const marker = new Marker({
            map,
            position,
            title: growerName || 'MASH Grower Location',
            animation: google.maps.Animation.DROP,
          });

          // Info window with grower details
          if (address || growerName) {
            const infoWindow = new InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
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
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      });
  }, [coordinates, address, growerName, zoom]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p className="mb-2">📍 Map unavailable</p>
          <p className="text-sm">{error}</p>
          {coordinates?.lat && coordinates?.lng && (
            <a
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline text-sm mt-2 inline-block"
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
