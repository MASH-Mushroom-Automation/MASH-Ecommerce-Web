"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
// import { GoogleMapsPicker } from "@/components/ui/google-maps-picker";
import {
  fetchRegions,
  fetchCitiesMunicipalities,
  fetchBarangays,
  filterCitiesByRegion,
  filterBarangaysByCity,
  type PSGCRegion,
  type PSGCCity,
  type PSGCBarangay,
} from "@/lib/api/psgc";
import type { AddressInput } from "@/hooks/useFirebaseAddresses";

interface AddressFormData {
  label: string;
  street: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  zipPostal: string;
  landmark?: string;
  barangay: string;
  barangayCode: string;
  cityCode: string;
  region: string;
  regionCode: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressInput) => Promise<boolean>;
  initialData?: Partial<AddressFormData>;
  isEdit?: boolean;
  isSaving?: boolean;
}

const EMPTY_ADDRESS: AddressFormData = {
  label: "",
  street: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  zipPostal: "",
  landmark: "",
  barangay: "",
  barangayCode: "",
  cityCode: "",
  region: "",
  regionCode: "",
  isDefault: false,
  lat: 14.7327342,
  lng: 120.96958207431636,
};

export function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEdit = false,
  isSaving = false,
}: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_ADDRESS);
  
  // PSGC API data states
  const [regions, setRegions] = useState<PSGCRegion[]>([]);
  const [allCities, setAllCities] = useState<PSGCCity[]>([]);
  const [allBarangays, setAllBarangays] = useState<PSGCBarangay[]>([]);
  
  // Cascading dropdown states
  const [availableCities, setAvailableCities] = useState<PSGCCity[]>([]);
  const [availableBarangays, setAvailableBarangays] = useState<PSGCBarangay[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch PSGC data on component mount
  useEffect(() => {
    const loadPSGCData = async () => {
      console.log("[AddressModal] Starting to load PSGC data...");
      setIsLoadingData(true);
      try {
        const [regionsData, citiesData, barangaysData] = await Promise.all([
          fetchRegions(),
          fetchCitiesMunicipalities(),
          fetchBarangays(),
        ]);
        
        console.log("[AddressModal] PSGC data loaded:", {
          regions: regionsData.length,
          cities: citiesData.length,
          barangays: barangaysData.length,
        });
        
        setRegions(regionsData);
        setAllCities(citiesData);
        setAllBarangays(barangaysData);
      } catch (error) {
        console.error("[AddressModal] Error loading PSGC data:", error);
      } finally {
        setIsLoadingData(false);
        console.log("[AddressModal] Loading complete");
      }
    };
    
    loadPSGCData();
  }, []);

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...EMPTY_ADDRESS, ...initialData });
        
        // Initialize cascading dropdowns if editing
        if (initialData.regionCode && allCities.length > 0) {
          const cities = filterCitiesByRegion(allCities, initialData.regionCode);
          setAvailableCities(cities);
          
          if (initialData.cityCode && allBarangays.length > 0) {
            const barangays = filterBarangaysByCity(allBarangays, initialData.cityCode);
            setAvailableBarangays(barangays);
          }
        }
      } else {
        setFormData(EMPTY_ADDRESS);
        setAvailableCities([]);
        setAvailableBarangays([]);
      }
    }
  }, [isOpen, initialData, allCities, allBarangays]);

  // Handle region change
  const handleRegionChange = useCallback((regionCode: string) => {
    const selectedRegionData = regions.find((r) => r.code === regionCode);
    const cities = filterCitiesByRegion(allCities, regionCode);
    
    setAvailableCities(cities);
    setAvailableBarangays([]);
    
    setFormData((prev) => ({
      ...prev,
      region: selectedRegionData?.name || selectedRegionData?.regionName || "",
      regionCode: regionCode,
      city: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
      stateProvince: "",
      zipPostal: "",
    }));
  }, [regions, allCities]);

  // Handle city change
  const handleCityChange = useCallback((cityCode: string) => {
    const selectedCityData = availableCities.find((c) => c.code === cityCode);
    const barangays = filterBarangaysByCity(allBarangays, cityCode);
    
    setAvailableBarangays(barangays);
    
    setFormData((prev) => ({
      ...prev,
      city: selectedCityData?.name || "",
      cityCode: cityCode,
      stateProvince: prev.region,
      zipPostal: prev.zipPostal,
      barangay: "",
      barangayCode: "",
    }));
  }, [availableCities, allBarangays]);

  // Handle barangay change
  const handleBarangayChange = useCallback((barangayCode: string) => {
    const selectedBarangayData = availableBarangays.find(
      (b) => b.code === barangayCode
    );
    
    setFormData((prev) => ({
      ...prev,
      barangay: selectedBarangayData?.name || "",
      barangayCode: barangayCode,
    }));
  }, [availableBarangays]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.label || !formData.street || !formData.city) {
      return;
    }

    // Build formatted address
    const formattedAddress = [
      formData.street,
      formData.addressLine2,
      formData.barangay,
      formData.city,
      formData.stateProvince,
      formData.zipPostal,
    ]
      .filter(Boolean)
      .join(", ");

    const addressInput: AddressInput = {
      label: formData.label,
      street: formData.street,
      addressLine2: formData.addressLine2,
      city: formData.city,
      stateProvince: formData.stateProvince || formData.region,
      zipPostal: formData.zipPostal,
      landmark: formData.landmark,
      coordinates: {
        lat: formData.lat,
        lng: formData.lng,
      },
      formattedAddress,
      isDefault: formData.isDefault,
    };

    const success = await onSave(addressInput);
    if (success) {
      onClose();
    }
  };

  // Update form field helper
  const updateField = useCallback((field: keyof AddressFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your address information."
              : "Add a new address for your store or warehouse."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Address Label */}
            <div>
              <Label htmlFor="label">Address Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Main Store, Warehouse, Home"
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                required
              />
            </div>

            {/* Google Maps Picker - Commented out for now */}
            {/* 
            {!isEdit && (
              <div>
                <Label>Location on Map</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the map to select your exact location or enter manually below
                </p>
                <GoogleMapsPicker
                  onLocationSelect={(location) => {
                    setFormData((prev) => ({
                      ...prev,
                      street: location.address,
                      barangay: location.barangay,
                      city: location.city,
                      stateProvince: location.province,
                      lat: location.lat,
                      lng: location.lng,
                    }));
                  }}
                />
              </div>
            )}
            */}

            {/* Street Address */}
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Textarea
                id="street"
                placeholder="House/Unit number, street name"
                value={formData.street}
                onChange={(e) => updateField("street", e.target.value)}
                required
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                placeholder="Apartment, suite, etc."
                value={formData.addressLine2}
                onChange={(e) => updateField("addressLine2", e.target.value)}
              />
            </div>

            {/* Landmark */}
            <div>
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Nearby landmark for easier delivery"
                value={formData.landmark}
                onChange={(e) => updateField("landmark", e.target.value)}
              />
            </div>

            {/* Cascading Location Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region */}
              <div>
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.regionCode}
                  onValueChange={handleRegionChange}
                  disabled={isLoadingData}
                  required
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder={isLoadingData ? "Loading regions..." : "Select region"} />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" className="max-h-[300px]">
                    {regions.length === 0 && !isLoadingData && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No regions available
                      </div>
                    )}
                    {regions.map((region) => (
                      <SelectItem key={region.code} value={region.code}>
                        {region.name || region.regionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isLoadingData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {regions.length} regions loaded
                  </p>
                )}
              </div>

              {/* City/Municipality */}
              <div>
                <Label htmlFor="city">City/Municipality *</Label>
                <Select
                  value={formData.cityCode}
                  onValueChange={handleCityChange}
                  disabled={!formData.regionCode || isLoadingData}
                  required
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city/municipality" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" className="max-h-[300px]">
                    {availableCities.length === 0 && formData.regionCode && !isLoadingData && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No cities available for this region
                      </div>
                    )}
                    {availableCities.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Barangay */}
              <div>
                <Label htmlFor="barangay">Barangay *</Label>
                <Select
                  value={formData.barangayCode}
                  onValueChange={handleBarangayChange}
                  disabled={!formData.cityCode || isLoadingData}
                  required
                >
                  <SelectTrigger id="barangay">
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" className="max-h-[300px]">
                    {availableBarangays.length === 0 && formData.cityCode && !isLoadingData && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No barangays available for this city
                      </div>
                    )}
                    {availableBarangays.map((barangay) => (
                      <SelectItem key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Postal Code */}
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="e.g., 1234"
                  value={formData.zipPostal}
                  onChange={(e) => updateField("zipPostal", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Province/State (Auto-filled from city selection) */}
            <div>
              <Label htmlFor="stateProvince">Province/State *</Label>
              <Input
                id="stateProvince"
                placeholder="Province or State"
                value={formData.stateProvince || formData.region}
                onChange={(e) => updateField("stateProvince", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>{isEdit ? "Update Address" : "Save Address"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
