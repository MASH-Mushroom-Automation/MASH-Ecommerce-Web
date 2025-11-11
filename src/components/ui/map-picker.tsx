"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapPickerProps {
  onLocationSelect: (location: {
    address: string;
    coordinates: { lat: number; lng: number };
    barangay: string;
    city: string;
    province: string;
  }) => void;
  initialLocation?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
}

// Sample address suggestions (in a real app, this would come from a geocoding API)
const ADDRESS_SUGGESTIONS = [
  {
    address: "123 Main Street, Barangay San Lorenzo, Makati City, Metro Manila",
    coordinates: { lat: 14.5547, lng: 121.0244 },
    barangay: "San Lorenzo",
    city: "Makati City",
    province: "Metro Manila",
  },
  {
    address:
      "456 Business District, Barangay Poblacion, Taguig City, Metro Manila",
    coordinates: { lat: 14.5176, lng: 121.0509 },
    barangay: "Poblacion",
    city: "Taguig City",
    province: "Metro Manila",
  },
  {
    address:
      "789 Commercial Center, Barangay Kapitolyo, Pasig City, Metro Manila",
    coordinates: { lat: 14.5764, lng: 121.0851 },
    barangay: "Kapitolyo",
    city: "Pasig City",
    province: "Metro Manila",
  },
];

export function MapPicker({
  onLocationSelect,
  initialLocation,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 14.5995,
    lng: 120.9842,
  });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter(initialLocation.coordinates);
    }
  }, [initialLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // Filter suggestions based on search query
      const filtered = ADDRESS_SUGGESTIONS.filter((suggestion) =>
        suggestion.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSelectedLocation(suggestion);
    setMapCenter(suggestion.coordinates);
    setSearchQuery(suggestion.address);
    setSuggestions([]);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // In a real implementation, you would reverse geocode the coordinates
    // For now, we'll simulate a location selection
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to approximate lat/lng
    const lat = mapCenter.lat + (0.5 - y / rect.height) * 0.01;
    const lng = mapCenter.lng + (x / rect.width - 0.5) * 0.01;

    const mockLocation = {
      address: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      coordinates: { lat, lng },
      barangay: "Selected Barangay",
      city: "Selected City",
      province: "Selected Province",
    };

    setSelectedLocation(mockLocation);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Label htmlFor="address-search">Search Address</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="address-search"
            type="text"
            placeholder="Type address or location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-muted border-b border-border last:border-b-0"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {suggestion.barangay}, {suggestion.city}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {suggestion.address}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Layout: Map and Info Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map Container */}
        <div className="space-y-2">
          <Label className="text-sm">Select Location</Label>
          <div
            ref={mapRef}
            className="w-full h-48 bg-muted border border-border rounded-lg relative cursor-crosshair overflow-hidden"
            onClick={handleMapClick}
          >
            {/* Mock Map */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-accent mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Click to select location
                </p>
              </div>
            </div>

            {/* Selected Location Marker */}
            {selectedLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-accent rounded-full border-2 border-background shadow-lg flex items-center justify-center">
                  <MapPin className="h-2 w-2 text-accent-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Location Info */}
        <div className="space-y-2">
          <Label className="text-sm">Selected Location</Label>
          {selectedLocation ? (
            <div className="p-3 bg-muted border border-border rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedLocation.barangay}, {selectedLocation.city}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedLocation.address}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {selectedLocation.coordinates.lat.toFixed(4)},{" "}
                    {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted border border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground">No location selected</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click on the map or search for an address
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLocation(null);
            setSearchQuery("");
          }}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
        <Button
          size="sm"
          onClick={handleConfirmLocation}
          disabled={!selectedLocation}
          className=""
        >
          <MapPin className="h-3 w-3 mr-1" />
          Use Location
        </Button>
      </div>
    </div>
  );
}
