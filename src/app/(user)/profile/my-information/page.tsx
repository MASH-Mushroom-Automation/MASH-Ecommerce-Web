"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, MapPin, Check, Loader2, Camera, Map, Star, Trash2, Plus } from "lucide-react";
import { useFirebaseAddresses, type AddressInput } from "@/hooks/useFirebaseAddresses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Image from "next/image";
import { AddressPicker, type SelectedAddress } from "@/components/checkout/AddressPicker";
import { useAuth } from "@/contexts/AuthContext";

interface UserInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
}

interface AddressForm {
  street: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  zipPostal: string;
  landmark: string;
  lat?: number;
  lng?: number;
}

// Hardcoded fallback data for development/demo
const FALLBACK_DATA = {
  firstName: "Guest",
  lastName: "User",
  email: "",
  username: "guest-user",
  avatar: "/profile_placeholder.png",
  address: {
    street: "Llano Rd",
    addressLine2: "Deparo",
    city: "Caloocan City",
    stateProvince: "Metro Manila",
    zipPostal: "1420",
    landmark: "in front of 7/11 Llano",
    lat: 14.7566,
    lng: 120.9822
  }
};

export default function MyInformationPage() {
  // Use AuthContext for profile - Firebase is primary source
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const {
    addresses: savedAddresses,
    defaultAddress,
    loading: addressesLoading,
    addAddress,
    deleteAddress,
    setAsDefault,
    mutating: addressMutating,
  } = useFirebaseAddresses();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState("Home");

  // Original values to track changes
  const [originalUserInfo, setOriginalUserInfo] = useState<UserInfoForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [originalAddress, setOriginalAddress] = useState<AddressForm>({
    street: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    zipPostal: "",
    landmark: "",
  });

  // User info state
  const [userInfo, setUserInfo] = useState<UserInfoForm>(originalUserInfo);

  // Address state
  const [address, setAddress] = useState<AddressForm>(originalAddress);

  // Initialize from AuthContext user (Firebase profile)
  useEffect(() => {
    const initialUserInfo: UserInfoForm = {
      firstName: user?.firstName || FALLBACK_DATA.firstName,
      lastName: user?.lastName || FALLBACK_DATA.lastName,
      email: user?.email || FALLBACK_DATA.email,
      phone: user?.phone || "",
      newPassword: "",
      confirmPassword: "",
    };

    // Use default address from Firebase if available, otherwise fallback
    const defaultAddr = defaultAddress;
    const initialAddress: AddressForm = defaultAddr ? {
      street: defaultAddr.street || "",
      addressLine2: "",
      city: defaultAddr.city || "",
      stateProvince: defaultAddr.stateProvince || "",
      zipPostal: defaultAddr.zipPostal || "",
      landmark: defaultAddr.landmark || "",
      lat: defaultAddr.coordinates?.lat,
      lng: defaultAddr.coordinates?.lng,
    } : {
      street: FALLBACK_DATA.address.street,
      addressLine2: FALLBACK_DATA.address.addressLine2,
      city: FALLBACK_DATA.address.city,
      stateProvince: FALLBACK_DATA.address.stateProvince,
      zipPostal: FALLBACK_DATA.address.zipPostal,
      landmark: FALLBACK_DATA.address.landmark,
      lat: FALLBACK_DATA.address.lat,
      lng: FALLBACK_DATA.address.lng,
    };

    setOriginalUserInfo(initialUserInfo);
    setUserInfo(initialUserInfo);
    setOriginalAddress(initialAddress);
    setAddress(initialAddress);
  }, [user, defaultAddress]);

  // Check if there are any changes
  const hasChanges =
    JSON.stringify(userInfo) !== JSON.stringify(originalUserInfo) ||
    JSON.stringify(address) !== JSON.stringify(originalAddress);

  const handleSave = async () => {
    setSaveError(null);

    // Validate password match
    if (userInfo.newPassword || userInfo.confirmPassword) {
      if (userInfo.newPassword !== userInfo.confirmPassword) {
        setSaveError("Passwords do not match");
        return;
      }
    }

    setIsSaving(true);

    try {
      // Update profile in Firebase using AuthContext
      await updateUserProfile({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
        phone: userInfo.phone,
      });

      // Update original values to new values
      setOriginalUserInfo({
        ...userInfo,
        newPassword: "",
        confirmPassword: "",
      });
      setOriginalAddress(address);

      // Clear password fields
      setUserInfo((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      setShowSuccessModal(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to save changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    // Reset to original values
    setUserInfo(originalUserInfo);
    setAddress(originalAddress);
    setSaveError(null);
    toast("Changes discarded.");
  };

  /**
   * Handle address selected from Google Maps picker
   * Saves the address to Firebase for authenticated users
   */
  const handleAddressSelect = async (selectedAddress: SelectedAddress) => {
    // Update local form state
    setAddress({
      street: selectedAddress.components.street || selectedAddress.formattedAddress.split(',')[0] || '',
      addressLine2: '',
      city: selectedAddress.components.city || '',
      stateProvince: selectedAddress.components.state || '',
      zipPostal: selectedAddress.components.zipCode || '',
      landmark: address.landmark, // Keep existing landmark
      lat: selectedAddress.lat,
      lng: selectedAddress.lng,
    });
    
    // Save to Firebase if authenticated
    if (isAuthenticated) {
      const addressData: AddressInput = {
        label: addressLabel || "Home",
        isDefault: savedAddresses.length === 0, // First address is default
        street: selectedAddress.components.street || selectedAddress.formattedAddress.split(',')[0] || '',
        city: selectedAddress.components.city || '',
        stateProvince: selectedAddress.components.state || '',
        zipPostal: selectedAddress.components.zipCode || '',
        landmark: address.landmark,
        coordinates: {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
        },
        formattedAddress: selectedAddress.formattedAddress,
      };
      
      const newAddressId = await addAddress(addressData);
      if (newAddressId) {
        toast.success("Address saved to your profile!");
      } else {
        toast.error("Failed to save address. Please try again.");
      }
    }
    
    setShowMapPicker(false);
    setAddressLabel("Home"); // Reset label for next time
  };

  /**
   * Handle deleting a saved address
   */
  const handleDeleteAddress = async (addressId: string) => {
    const success = await deleteAddress(addressId);
    if (success) {
      toast.success("Address deleted");
    } else {
      toast.error("Failed to delete address");
    }
  };

  /**
   * Handle setting an address as default
   */
  const handleSetDefaultAddress = async (addressId: string) => {
    const success = await setAsDefault(addressId);
    if (success) {
      toast.success("Default address updated");
    } else {
      toast.error("Failed to update default address");
    }
  };

  // Don't show loading or error states - always show the form with fallback data
  // if (loading) {
  //   return (
  //     <Card className="bg-white">
  //       <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
  //         <div className="flex flex-col items-center gap-3">
  //           <Loader2 className="h-8 w-8 animate-spin text-[#1E392A]" />
  //           <p className="text-gray-600">Loading your information...</p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // Don't block the UI on error - fallback data will be shown instead
  // if (error && !profile) {
  //   return (
  //     <Card className="bg-white">
  //       <CardContent className="p-6 sm:p-8">
  //         <Alert variant="destructive">
  //           <AlertDescription>Failed to load profile: {error}</AlertDescription>
  //         </Alert>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <>
      <Card className="bg-card">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Account Information Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Account Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    You can change your information here seamlessly
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center w-full py-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted/30 relative">
                  <Image
                    src={user?.photoURL || FALLBACK_DATA.avatar}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                  >
                    <Camera className="w-6 h-6 text-white" />
                    <span className="sr-only">Change profile picture</span>
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Implement avatar upload to Firebase Storage
                        toast.info("Avatar upload coming soon!");
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Click photo to update profile picture
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={userInfo.firstName}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        firstName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={userInfo.lastName}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        lastName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={userInfo.newPassword}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        newPassword: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={userInfo.confirmPassword}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* My Address Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">My Addresses</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMapPicker(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your delivery addresses. These will be available at checkout.
            </p>

            {/* Saved Addresses List (Firebase) */}
            {isAuthenticated && (
              <div className="mb-6">
                {addressesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading saved addresses...</span>
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Saved Addresses</h3>
                    {savedAddresses.map((savedAddr) => (
                      <div
                        key={savedAddr.id}
                        className={`p-4 rounded-lg border ${
                          savedAddr.isDefault 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {savedAddr.label}
                              </span>
                              {savedAddr.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                                  <Star className="h-3 w-3" />
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {savedAddr.formattedAddress}
                            </p>
                            {savedAddr.landmark && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Landmark: {savedAddr.landmark}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!savedAddr.isDefault && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(savedAddr.id)}
                                disabled={addressMutating}
                                className="text-primary hover:text-primary/80"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(savedAddr.id)}
                              disabled={addressMutating}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                    <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-3">No saved addresses yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMapPicker(true)}
                      className="gap-2"
                    >
                      <Map className="h-4 w-4" />
                      Add Your First Address
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Address Form (for non-authenticated or editing) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {isAuthenticated ? 'Quick Add (Manual Entry)' : 'Enter Address'}
              </h3>
              <div>
                <Label
                  htmlFor="street"
                  className="text-sm font-medium text-gray-700"
                >
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="addressLine2"
                  className="text-sm font-medium text-gray-700"
                >
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  value={address.addressLine2}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      addressLine2: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700"
                >
                  City
                </Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="stateProvince"
                  className="text-sm font-medium text-gray-700"
                >
                  State/Province/Region
                </Label>
                <Input
                  id="stateProvince"
                  value={address.stateProvince}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      stateProvince: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter state or province"
                />
              </div>

              <div>
                <Label
                  htmlFor="zipPostal"
                  className="text-sm font-medium text-gray-700"
                >
                  ZIP/Postal Code
                </Label>
                <Input
                  id="zipPostal"
                  value={address.zipPostal}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      zipPostal: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="landmark"
                  className="text-sm font-medium text-gray-700"
                >
                  Landmark
                </Label>
                <Input
                  id="landmark"
                  value={address.landmark}
                  onChange={(e) =>
                    setAddress({ ...address, landmark: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter nearby landmark (optional)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show when there are changes */}
          {hasChanges && (
            <div className="flex items-center justify-between bg-primary px-6 py-4 rounded-lg -mx-8 -mb-8 mt-8">
              <p className="text-primary-foreground text-sm">You have unsaved changes.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="bg-card text-primary hover:bg-muted/30"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              Successful
            </DialogTitle>
            <p className="text-muted-foreground mb-6">
              Changes in the account details has been updated
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Great!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker Dialog */}
      <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Add New Address
          </DialogTitle>
          <div className="py-4 space-y-4">
            {isAuthenticated && (
              <div>
                <Label htmlFor="addressLabel" className="text-sm font-medium text-gray-700">
                  Address Label
                </Label>
                <Input
                  id="addressLabel"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="e.g., Home, Office, Mom's House"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Give this address a name to easily identify it later
                </p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Location
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Search for an address or click on the map to set your delivery location.
              </p>
              <AddressPicker
                onAddressSelect={handleAddressSelect}
                defaultValue={address.street ? `${address.street}, ${address.city}, ${address.stateProvince}` : ''}
                placeholder="Search for your address..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMapPicker(false);
                setAddressLabel("Home");
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
