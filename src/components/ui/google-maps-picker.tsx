"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, MapPin, Search, X, Check } from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  barangay: string;
  city: string;
  province: string;
}

interface GoogleMapsPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export function GoogleMapsPicker({
  onLocationSelect,
  initialLocation,
}: GoogleMapsPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(true);

  // Handle location selection
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setError(null);
    onLocationSelect(location);
  };

  // Get user's current location
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Create location data based on coordinates
      const location: LocationData = {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        barangay: "Unknown Barangay",
        city: "Unknown City",
        province: "Unknown Province",
      };

      handleLocationSelect(location);
    } catch (err: unknown) {
      console.error("Geolocation error:", err);
      let errorMessage = "Could not get your location. ";

      const error = err as GeolocationPositionError;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage +=
            "Location access was denied. Please allow location access and try again.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out.";
          break;
        default:
          errorMessage += "Please try again or enter your address manually.";
          break;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selected location
  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchTerm("");
    setError(null);
  };

  // Handle manual address entry
  const handleManualAddress = () => {
    if (!searchTerm.trim()) {
      setError("Please enter an address.");
      return;
    }

    // Create location data from search term
    const location: LocationData = {
      lat: 14.7327342, // Default coordinates (JMP Mushroom location)
      lng: 120.96958207431636,
      address: searchTerm.trim(),
      barangay: "Unknown Barangay",
      city: "Unknown City",
      province: "Unknown Province",
    };

    handleLocationSelect(location);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="address-search">Search Address</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="address-search"
            type="text"
            placeholder="Enter your address manually..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleManualAddress()}
            className="pl-10 pr-20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualAddress}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isLoading ? "Getting Location..." : "Use My Location"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMap(!showMap)}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {showMap ? "Hide Map" : "Show Map"}
        </Button>

        {selectedLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSelection}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Google Maps Iframe */}
      {showMap ? (
        <Card className="border-2 border-[#6A994E]">
          <CardContent className="p-0">
            <div className="w-full h-80 rounded-md overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30869.148315904276!2d120.96958207431636!3d14.732734200000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b19e4dcad96f%3A0x607e9f791424ed10!2sJMP%20Mushroom!5e0!3m2!1sen!2sph!4v1761151347811!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
            <div className="p-4 bg-[#6A994E]/10 border-t">
              <p className="text-sm text-[#6A994E] font-medium">
                <strong>📍 Interactive Map:</strong> This map shows JMP Mushroom
                as a reference point. Use the dropdowns below to select your
                exact location.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-2">Map Hidden</p>
            <p className="text-sm text-gray-500">
              Click &quot;Show Map&quot; to view the interactive location map
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 flex items-center space-x-2">
                  <MapPin size={16} className="text-green-600" />
                  <span>Selected Location:</span>
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {selectedLocation.lat.toFixed(4)},{" "}
                  {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#6A994E]"></div>
          <p className="text-sm text-gray-500 mt-2">Getting your location...</p>
        </div>
      )}
    </div>
  );
}
