"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Edit, Trash, Star, Loader2 } from "lucide-react";
import { useFirebaseAddresses, type AddressInput } from "@/hooks/useFirebaseAddresses";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AddressModal } from "@/components/seller/AddressModal";


export default function AddressManagement() {
  const { user, isAuthenticated } = useAuth();
  const {
    addresses: firebaseAddresses,
    loading,
    error,
    mutating,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
  } = useFirebaseAddresses();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressData, setEditingAddressData] = useState<any>(null);


  // Dialog handlers
  const handleAddAddress = () => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to add addresses");
      return;
    }
    setEditingAddressId(null);
    setEditingAddressData(null);
    setIsAddDialogOpen(true);
  };

  const handleEditAddress = (addressId: string) => {
    const address = firebaseAddresses.find((a) => a.id === addressId);
    if (!address) return;

    // Map Firebase address to form data
    const formData = {
      label: address.label,
      street: address.street,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      stateProvince: address.stateProvince,
      zipPostal: address.zipPostal,
      landmark: address.landmark || "",
      barangay: "",
      barangayCode: "",
      cityCode: "",
      region: "",
      regionCode: "",
      isDefault: address.isDefault,
      lat: address.coordinates.lat,
      lng: address.coordinates.lng,
    };

    setEditingAddressData(formData);
    setEditingAddressId(addressId);
    setIsEditDialogOpen(true);
  };

  const handleSaveNewAddress = async (addressInput: AddressInput): Promise<boolean> => {
    const newId = await addAddress(addressInput);
    if (newId) {
      toast.success("Address added successfully");
      return true;
    } else {
      toast.error("Failed to add address");
      return false;
    }
  };

  const handleUpdateAddress = async (addressInput: AddressInput): Promise<boolean> => {
    if (!editingAddressId) return false;
    
    const success = await updateAddress(editingAddressId, addressInput);
    if (success) {
      toast.success("Address updated successfully");
      return true;
    } else {
      toast.error("Failed to update address");
      return false;
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      toast.success("Address deleted successfully");
    } else {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const success = await setAsDefault(id);
    if (success) {
      toast.success("Default address updated");
    } else {
      toast.error("Failed to set default address");
    }
  };


  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Address Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your store and warehouse addresses
          </p>
        </div>
        <Button
          onClick={handleAddAddress}
          disabled={!isAuthenticated || loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {!isAuthenticated ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please sign in to manage addresses</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      ) : firebaseAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No addresses yet. Add your first address!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {firebaseAddresses.map((address) => (
            <Card
              key={address.id}
              className={address.isDefault ? "border-2 border-[#6A994E]" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {address.label}
                      {address.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditAddress(address.id)}
                      disabled={mutating}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={mutating}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{address.formattedAddress}</span>
                  </p>
                  {address.landmark && (
                    <p className="text-muted-foreground ml-6">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-6">
                    Coordinates: {address.coordinates.lat.toFixed(4)}, {address.coordinates.lng.toFixed(4)}
                  </p>
                </div>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-primary border-primary hover:bg-primary/5"
                    onClick={() => handleSetDefaultAddress(address.id)}
                    disabled={mutating}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <AddressModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveNewAddress}
        isEdit={false}
        isSaving={mutating}
      />

      {/* Edit Address Modal */}
      <AddressModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleUpdateAddress}
        initialData={editingAddressData}
        isEdit={true}
        isSaving={mutating}
      />
    </div>
  );
}
