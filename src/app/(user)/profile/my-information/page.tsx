"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Loader2, Star, Trash2, Plus, User, Mail, Camera, Lock, Edit, AlertTriangle } from "lucide-react";
import { useFirebaseAddresses, type AddressInput, type FirestoreAddress } from "@/hooks/useFirebaseAddresses";
import { toast } from "sonner";
import { AddressPicker, type SelectedAddress } from "@/components/checkout/AddressPicker";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { getProfileAvatar, isDiceBearAvatar } from "@/lib/avatar";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function MyInformationPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    addresses: savedAddresses,
    loading: addressesLoading,
    addAddress,
    deleteAddress,
    setAsDefault,
    updateAddress,
    mutating: addressMutating,
  } = useFirebaseAddresses();
  
  // Address states
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [landmark, setLandmark] = useState("");
  const [editingAddress, setEditingAddress] = useState<FirestoreAddress | null>(null);
  
  // Confirmation dialogs
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

  // Password change states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  /**
   * Handle address selected from Google Maps picker
   */
  const handleAddressSelect = async (selectedAddress: SelectedAddress) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please sign in to save addresses");
      return;
    }

    try {
      const addressData: AddressInput = {
        label: addressLabel || "Home",
        street: selectedAddress.components.street || selectedAddress.formattedAddress.split(',')[0] || '',
        addressLine2: '',
        city: selectedAddress.components.city || '',
        stateProvince: selectedAddress.components.state || '',
        zipPostal: selectedAddress.components.zipCode || '',
        landmark: landmark || '',
        coordinates: {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
        },
        formattedAddress: selectedAddress.formattedAddress,
        isDefault: savedAddresses.length === 0,
      };

      if (editingAddress) {
        // Update existing address
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
        // Add new address
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
      console.error('[Profile] Error saving address:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save address");
    }
  };

  /**
   * Open edit dialog for an address
   */
  const handleEditAddress = (address: FirestoreAddress) => {
    setEditingAddress(address);
    setAddressLabel(address.label);
    setLandmark(address.landmark || "");
    setShowMapPicker(true);
  };

  /**
   * Handle delete address with confirmation
   */
  const handleDeleteAddressClick = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
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

  /**
   * Handle set default with confirmation
   */
  const handleSetDefaultClick = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
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

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        toast.error("No user is currently signed in");
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordForm.newPassword);

      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error('[Profile] Password change error:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect");
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Please sign out and sign in again before changing password");
      } else {
        toast.error(error.message || "Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E392A]">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and delivery addresses
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-[#1E392A]" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                <Image
                  src={getProfileAvatar(user)}
                  alt={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
                  width={96}
                  height={96}
                  className="object-cover"
                  unoptimized={isDiceBearAvatar(getProfileAvatar(user))}
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#1E392A] rounded-full text-white hover:bg-[#2d5a42] transition-colors shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">
                      {user?.firstName || 'N/A'} {user?.lastName || ''}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">{user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Change Password Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  variant="outline"
                  className="border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#1E392A]" />
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
                <Loader2 className="h-8 w-8 animate-spin text-[#1E392A]" />
                <p className="text-gray-600">Loading addresses...</p>
              </div>
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No saved addresses yet</p>
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
                      ? "border-[#1E392A] bg-[#1E392A]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
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
                    <h3 className="font-semibold text-[#1E392A] mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {addr.label}
                    </h3>

                    {/* Address */}
                    <p className="text-gray-700 mb-1">{addr.formattedAddress}</p>
                    
                    {/* Landmark */}
                    {addr.landmark && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm font-medium text-amber-900">
                          📍 Delivery Instructions:
                        </p>
                        <p className="text-sm text-amber-800">{addr.landmark}</p>
                      </div>
                    )}

                    {/* Coordinates */}
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {addr.coordinates.lat.toFixed(6)}, {addr.coordinates.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAddress(addr)}
                      disabled={addressMutating}
                      className="text-blue-600 hover:bg-blue-50"
                      title="Edit address"
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
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddressClick(addr.id)}
                      disabled={addressMutating}
                      className="text-red-600 hover:bg-red-50"
                      title="Delete address"
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Delivery Instructions Help Riders Find You
              </h4>
              <p className="text-sm text-blue-800">
                Add landmarks like "in front of 7/11" or "beside the church" to help Lalamove riders 
                deliver your mushrooms quickly and accurately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Picker Dialog */}
      <Dialog open={showMapPicker} onOpenChange={(open) => {
        setShowMapPicker(open);
        if (!open) {
          setEditingAddress(null);
          setAddressLabel("Home");
          setLandmark("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              Search for your address or click on the map to select your location
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-4">
            <div>
              <Label htmlFor="address-label">Address Label</Label>
              <Input
                id="address-label"
                placeholder="e.g., Home, Office, Mom's House"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                className="mt-1"
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
              />
              <p className="text-xs text-gray-500 mt-1">
                Help Lalamove riders find your location easily
              </p>
            </div>
          </div>

          <div className="h-[500px]">
            <AddressPicker
              onAddressSelect={handleAddressSelect}
              defaultLocation={editingAddress ? {
                lat: editingAddress.coordinates.lat,
                lng: editingAddress.coordinates.lng,
              } : {
                lat: 14.7566,
                lng: 120.9822,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) setConfirmDialog({ open: false, title: "", description: "", action: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, title: "", description: "", action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.action === "delete" ? handleConfirmDelete : handleConfirmSetDefault}
              className={confirmDialog.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-[#1E392A] hover:bg-[#2d5a42]"}
            >
              {confirmDialog.action === "delete" ? "Delete" : "Set as Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#1E392A]" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 characters)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className="mt-1"
              />
            </div>

            {passwordForm.newPassword && passwordForm.confirmPassword && 
             passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="bg-[#1E392A] hover:bg-[#2d5a42]"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
