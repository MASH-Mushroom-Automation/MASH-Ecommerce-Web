/**
 * AddressSelector Component
 *
 * Displays saved addresses with selection for checkout.
 * Allows users to select from their saved addresses or add a new one.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Star, Map, Loader2 } from "lucide-react";
import { useFirebaseAddresses, type FirestoreAddress, type AddressInput } from "@/hooks/useFirebaseAddresses";
import { AddressPicker, type SelectedAddress } from "./AddressPicker";
import { cn } from "@/lib/utils";

export interface AddressSelectorProps {
  /** Called when an address is selected */
  onAddressSelect: (address: FirestoreAddress) => void;
  /** Currently selected address ID */
  selectedAddressId?: string;
  /** Class name for the container */
  className?: string;
}

export function AddressSelector({
  onAddressSelect,
  selectedAddressId,
  className,
}: AddressSelectorProps) {
  const {
    addresses,
    defaultAddress,
    loading,
    addAddress,
    mutating,
  } = useFirebaseAddresses();

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");

  // Auto-select default address if no selection and we have addresses
  const effectiveSelectedId = selectedAddressId || defaultAddress?.id;

  /**
   * Handle address selected from Google Maps picker
   */
  const handleMapAddressSelect = async (selectedAddress: SelectedAddress) => {
    const addressData: AddressInput = {
      label: addressLabel || "Home",
      isDefault: addresses.length === 0, // First address is default
      street: selectedAddress.components.street || selectedAddress.formattedAddress.split(',')[0] || '',
      city: selectedAddress.components.city || '',
      stateProvince: selectedAddress.components.state || '',
      zipPostal: selectedAddress.components.zipCode || '',
      coordinates: {
        lat: selectedAddress.lat,
        lng: selectedAddress.lng,
      },
      formattedAddress: selectedAddress.formattedAddress,
    };

    const newAddressId = await addAddress(addressData);
    
    if (newAddressId) {
      // Find the newly added address and select it
      // The subscription will update the addresses list
      setShowMapPicker(false);
      setAddressLabel("Home");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-6", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading saved addresses...</span>
      </div>
    );
  }

  // Show empty state with add button
  if (addresses.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-3">No saved delivery addresses</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMapPicker(true)}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Add Delivery Address
          </Button>
        </div>

        {/* Map Picker Dialog */}
        <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Add Delivery Address
            </DialogTitle>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="checkoutAddressLabel" className="text-sm font-medium text-gray-700">
                  Address Label
                </Label>
                <Input
                  id="checkoutAddressLabel"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="e.g., Home, Office"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Location
                </Label>
                <AddressPicker
                  onAddressSelect={handleMapAddressSelect}
                  placeholder="Search for your address..."
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show address list with selection
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">
          Select Delivery Address
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMapPicker(true)}
          className="gap-1 text-primary hover:text-primary/80"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="space-y-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            onClick={() => onAddressSelect(addr)}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors",
              effectiveSelectedId === addr.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                effectiveSelectedId === addr.id
                  ? "border-primary"
                  : "border-muted-foreground/30"
              )}>
                {effectiveSelectedId === addr.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Star className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {addr.formattedAddress}
                </p>
                {addr.landmark && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Landmark: {addr.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Picker Dialog */}
      <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Add Delivery Address
          </DialogTitle>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="checkoutAddressLabel2" className="text-sm font-medium text-gray-700">
                Address Label
              </Label>
              <Input
                id="checkoutAddressLabel2"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                placeholder="e.g., Home, Office"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Location
              </Label>
              <AddressPicker
                onAddressSelect={handleMapAddressSelect}
                placeholder="Search for your address..."
              />
            </div>
            {mutating && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Saving address...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddressSelector;
