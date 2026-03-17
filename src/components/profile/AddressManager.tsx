"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Loader2,
  Star,
  Trash2,
  Plus,
  Edit,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  useFirebaseAddresses,
  type AddressInput,
  type FirestoreAddress,
} from "@/hooks/useFirebaseAddresses";
import {
  AddressPicker,
  type SelectedAddress,
} from "@/components/checkout/AddressPicker";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface AddressManagerProps {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The user ID (required for Firestore operations) */
  userId?: string;
}

// ============================================================================
// Component
// ============================================================================

export function AddressManager({
  isAuthenticated,
  userId,
}: AddressManagerProps) {
  const {
    addresses: savedAddresses,
    loading: addressesLoading,
    addAddress,
    deleteAddress,
    setAsDefault,
    updateAddress,
    mutating: addressMutating,
  } = useFirebaseAddresses();

  // Address picker dialog state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [landmark, setLandmark] = useState("");
  const [editingAddress, setEditingAddress] = useState<FirestoreAddress | null>(
    null,
  );

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    addressId?: string;
    action: "delete" | "setDefault" | null;
  }>({
    open: false,
    title: "",
    description: "",
    action: null,
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAddressSelect = async (selectedAddress: SelectedAddress) => {
    if (!isAuthenticated || !userId) {
      toast.error("Please sign in to save addresses");
      return;
    }

    try {
      const addressData: AddressInput = {
        label: addressLabel || "Home",
        street:
          selectedAddress.components.street ||
          selectedAddress.formattedAddress.split(",")[0] ||
          "",
        addressLine2: "",
        city: selectedAddress.components.city || "",
        stateProvince: selectedAddress.components.state || "",
        zipPostal: selectedAddress.components.zipCode || "",
        landmark: landmark || "",
        coordinates: {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
        },
        formattedAddress: selectedAddress.formattedAddress,
        isDefault: savedAddresses.length === 0,
      };

      if (editingAddress) {
        const success = await updateAddress(editingAddress.id, addressData);
        if (success) {
          toast.success("Address updated successfully!");
          setShowMapPicker(false);
          setEditingAddress(null);
          setAddressLabel("Home");
          setLandmark("");
        } else {
          toast.error("Failed to update address");
        }
      } else {
        const newAddressId = await addAddress(addressData);
        if (newAddressId) {
          toast.success("Address saved to your profile!");
          setShowMapPicker(false);
          setAddressLabel("Home");
          setLandmark("");
        } else {
          toast.error("Failed to save address");
        }
      }
    } catch (error) {
      console.error("[AddressManager] Error saving address:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save address",
      );
    }
  };

  const handleEditAddress = (address: FirestoreAddress) => {
    setEditingAddress(address);
    setAddressLabel(address.label);
    setLandmark(address.landmark || "");
    setShowMapPicker(true);
  };

  const handleDeleteAddressClick = (addressId: string) => {
    const address = savedAddresses.find((a) => a.id === addressId);
    setConfirmDialog({
      open: true,
      title: "Delete Address",
      description: `Are you sure you want to delete "${address?.label}"? This action cannot be undone.`,
      addressId,
      action: "delete",
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.addressId) {
      const success = await deleteAddress(confirmDialog.addressId);
      if (success) {
        toast.success("Address deleted successfully");
      } else {
        toast.error("Failed to delete address");
      }
    }
    setConfirmDialog({ open: false, title: "", description: "", action: null });
  };

  const handleSetDefaultClick = (addressId: string) => {
    const address = savedAddresses.find((a) => a.id === addressId);
    setConfirmDialog({
      open: true,
      title: "Change Default Address",
      description: `Set "${address?.label}" as your default delivery address?`,
      addressId,
      action: "setDefault",
    });
  };

  const handleConfirmSetDefault = async () => {
    if (confirmDialog.addressId) {
      const success = await setAsDefault(confirmDialog.addressId);
      if (success) {
        toast.success("Default address updated");
      } else {
        toast.error("Failed to update default address");
      }
    }
    setConfirmDialog({ open: false, title: "", description: "", action: null });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Addresses Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <CardTitle className="text-lg">Delivery Addresses</CardTitle>
            </div>
            <Button
              onClick={() => {
                setEditingAddress(null);
                setAddressLabel("Home");
                setLandmark("");
                setShowMapPicker(true);
              }}
              className="bg-[#1E392A] hover:bg-[#2d5a42] text-white"
              disabled={addressMutating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {addressesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading addresses...</p>
              </div>
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No saved addresses yet
              </p>
              <Button
                onClick={() => {
                  setEditingAddress(null);
                  setAddressLabel("Home");
                  setLandmark("");
                  setShowMapPicker(true);
                }}
                variant="outline"
                className="border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    addr.isDefault
                      ? "border-[#1E392A] dark:border-emerald-600 bg-[#1E392A]/5 dark:bg-emerald-950/20"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {/* Default badge */}
                  {addr.isDefault && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#1E392A] text-white text-xs font-medium">
                        <Star className="h-3 w-3 fill-white" />
                        Default
                      </span>
                    </div>
                  )}

                  <div className="pr-32">
                    {/* Label */}
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {addr.label}
                    </h3>

                    {/* Address */}
                    <p className="text-muted-foreground mb-1">
                      {addr.formattedAddress}
                    </p>

                    {/* Landmark */}
                    {addr.landmark && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                          Delivery Instructions:
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          {addr.landmark}
                        </p>
                      </div>
                    )}

                    {/* Coordinates */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Coordinates: {addr.coordinates.lat.toFixed(6)},{" "}
                      {addr.coordinates.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAddress(addr)}
                      disabled={addressMutating}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-600/10"
                      title="Edit address location and instructions"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultClick(addr.id)}
                        disabled={addressMutating}
                        className="text-[#1E392A] hover:bg-[#1E392A]/10"
                        title="Set as default delivery address"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddressClick(addr.id)}
                      disabled={addressMutating}
                      className="text-red-600 dark:text-red-400 hover:bg-red-600/10"
                      title="Delete this address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Delivery Instructions Help Riders Find You
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Add landmarks like &ldquo;in front of 7/11&rdquo; or
                &ldquo;beside the church&rdquo; to help Lalamove riders deliver
                your mushrooms quickly and accurately. Click &ldquo;Edit&rdquo;
                to update the map location and instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Picker Dialog */}
      <Dialog
        open={showMapPicker}
        onOpenChange={(open) => {
          setShowMapPicker(open);
          if (!open) {
            setEditingAddress(null);
            setAddressLabel("Home");
            setLandmark("");
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress
                ? `Edit Address: ${editingAddress.label}`
                : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update the address details and use the map to select the exact location"
                : "Search for your address or click on the map to select your location"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-4">
            <div>
              <Label htmlFor="address-label">Address Label *</Label>
              <Input
                id="address-label"
                placeholder="e.g., Home, Office, Mom's House"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="landmark">
                Delivery Instructions (Landmark) *
              </Label>
              <Input
                id="landmark"
                placeholder="e.g., in front of 7/11, beside the church, blue gate"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Help Lalamove riders find your location easily
              </p>
            </div>

            {editingAddress && (
              <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-900 dark:text-amber-100">
                  <p className="text-sm">
                    Current location: {editingAddress.formattedAddress}. You can
                    search for a new address or drag the marker to update the
                    exact location.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="h-[500px]">
            <AddressPicker
              onAddressSelect={handleAddressSelect}
              defaultValue={editingAddress?.formattedAddress}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setConfirmDialog({
              open: false,
              title: "",
              description: "",
              action: null,
            });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  title: "",
                  description: "",
                  action: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={
                confirmDialog.action === "delete"
                  ? handleConfirmDelete
                  : handleConfirmSetDefault
              }
              className={
                confirmDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#1E392A] hover:bg-[#2d5a42]"
              }
            >
              {confirmDialog.action === "delete"
                ? "Delete Address"
                : "Set as Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddressManager;
