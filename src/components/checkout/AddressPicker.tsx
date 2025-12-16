"use client";

/**
 * Address Picker Component
 *
 * Google Maps-based address picker with autocomplete and map selection.
 * Allows users to search for addresses or click on the map to set delivery location.
 * 
 * Updated to use the new Google Maps API functional approach (setOptions/importLibrary)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectedAddress {
  formattedAddress: string;
  lat: number;
  lng: number;
  components: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface AddressPickerProps {
  onAddressSelect: (address: SelectedAddress) => void;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}

// Metro Manila default center
const METRO_MANILA_CENTER = { lat: 14.5995, lng: 120.9842 };

// Google Maps script loading state
let googleMapsPromise: Promise<void> | null = null;

/**
 * Load Google Maps script dynamically
 * Uses a singleton pattern to prevent multiple script loads
 */
async function loadGoogleMapsScript(apiKey: string): Promise<void> {
  // Return existing promise if script is already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded
  if (window.google?.maps) {
    return Promise.resolve();
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps"))
      );
      return;
    }

    // Create and append script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function AddressPicker({
  onAddressSelect,
  defaultValue,
  className,
  placeholder = "Enter your delivery address...",
}: AddressPickerProps) {
  const [address, setAddress] = useState(defaultValue || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  /**
   * Extract address components from Google Places result
   */
  const extractAddressComponents = useCallback(
    (components?: google.maps.GeocoderAddressComponent[]) => {
      if (!components) return {};

      const getComponent = (type: string) =>
        components.find((c) => c.types.includes(type))?.long_name;

      return {
        street: getComponent("route") || getComponent("street_address"),
        city:
          getComponent("locality") ||
          getComponent("administrative_area_level_2"),
        state: getComponent("administrative_area_level_1"),
        zipCode: getComponent("postal_code"),
      };
    },
    []
  );

  /**
   * Reverse geocode coordinates to address
   */
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoderRef.current) return;

      setIsLoading(true);
      try {
        const response = await geocoderRef.current.geocode({
          location: { lat, lng },
        });

        if (response.results[0]) {
          const place = response.results[0];
          setAddress(place.formatted_address);
          onAddressSelect({
            formattedAddress: place.formatted_address,
            lat,
            lng,
            components: extractAddressComponents(place.address_components),
          });
        }
      } catch (err) {
        console.error("Reverse geocode error:", err);
        setError("Could not get address for this location");
      } finally {
        setIsLoading(false);
      }
    },
    [onAddressSelect, extractAddressComponents]
  );

  /**
   * Initialize Google Maps using the new functional API
   */
  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setError("Google Maps API key not configured");
        setIsLoading(false);
        return;
      }

      try {
        // Load Google Maps script dynamically if not already loaded
        if (!window.google?.maps) {
          await loadGoogleMapsScript(apiKey);
        }

        // Wait for google.maps to be available
        const google = window.google;
        if (!google?.maps) {
          throw new Error("Google Maps failed to load");
        }

        geocoderRef.current = new google.maps.Geocoder();

        // Initialize map centered on Metro Manila
        if (mapRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: METRO_MANILA_CENTER,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          // Add draggable marker
          markerRef.current = new google.maps.Marker({
            map: mapInstanceRef.current,
            draggable: true,
            animation: google.maps.Animation.DROP,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            },
          });

          // Handle marker drag
          markerRef.current.addListener("dragend", async () => {
            const position = markerRef.current?.getPosition();
            if (position) {
              await reverseGeocode(position.lat(), position.lng());
            }
          });

          // Handle map click
          mapInstanceRef.current.addListener(
            "click",
            async (e: google.maps.MapMouseEvent) => {
              if (e.latLng) {
                markerRef.current?.setPosition(e.latLng);
                await reverseGeocode(e.latLng.lat(), e.latLng.lng());
              }
            }
          );
        }

        // Initialize autocomplete
        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              componentRestrictions: { country: "ph" },
              fields: ["formatted_address", "geometry", "address_components"],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place?.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();

              mapInstanceRef.current?.setCenter({ lat, lng });
              mapInstanceRef.current?.setZoom(16);
              markerRef.current?.setPosition({ lat, lng });

              setAddress(place.formatted_address || "");

              onAddressSelect({
                formattedAddress: place.formatted_address || "",
                lat,
                lng,
                components: extractAddressComponents(place.address_components),
              });
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
        setError("Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    initMap();
  }, [onAddressSelect, reverseGeocode, extractAddressComponents]);

  /**
   * Get user's current location
   */
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        mapInstanceRef.current?.setCenter({ lat: latitude, lng: longitude });
        mapInstanceRef.current?.setZoom(16);
        markerRef.current?.setPosition({ lat: latitude, lng: longitude });

        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(
          err.code === 1
            ? "Location access denied. Please enable location services."
            : "Could not get your location. Please enter address manually."
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [reverseGeocode]);

  if (error && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Google Maps is not configured. Please enter your address
            manually.
          </p>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              // For manual entry, we'll need coordinates later from Lalamove
            }}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Address input with autocomplete */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-24"
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          onClick={getCurrentLocation}
          disabled={isLoading || isLocating}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LocateFixed className="h-4 w-4 mr-1" />
              <span className="text-xs">Use GPS</span>
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Map container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={mapRef}
          className="h-[300px] w-full rounded-lg border bg-muted"
        />
      </div>

      {/* Help text */}
      <p className="text-sm text-muted-foreground">
        💡 Tip: Click on the map or drag the marker to set your exact delivery
        location
      </p>
    </div>
  );
}
