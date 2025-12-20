"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, Star, Trash2, Plus, User, Mail, Camera, Lock, Edit, AlertTriangle, Shield, Key, CheckCircle2, Info, Phone } from "lucide-react";
import { useFirebaseAddresses, type AddressInput, type FirestoreAddress } from "@/hooks/useFirebaseAddresses";
import { toast } from "sonner";
import { AddressPicker, type SelectedAddress } from "@/components/checkout/AddressPicker";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { getProfileAvatar, isDiceBearAvatar } from "@/lib/avatar";
import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { FirebaseUserService } from "@/lib/firebase";

export default function MyInformationPage() {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const {
    addresses: savedAddresses,
    loading: addressesLoading,
    addAddress,
    deleteAddress,
    setAsDefault,
    updateAddress,
    mutating: addressMutating,
  } = useFirebaseAddresses();
  
  // Auth provider detection
  const [authProvider, setAuthProvider] = useState<'google' | 'email' | 'unknown'>('unknown');
  const [hasPassword, setHasPassword] = useState(false);
  
  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  
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
  const [showLinkPasswordDialog, setShowLinkPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [linkPasswordForm, setLinkPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  /**
   * Initialize phone number from user profile
   */
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone]);

  /**
   * Detect authentication provider on mount
   */
  useEffect(() => {
    const detectAuthProvider = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setAuthProvider('unknown');
        return;
      }

      try {
        const providerData = currentUser.providerData;
        
        if (providerData.length === 0) {
          setAuthProvider('unknown');
          return;
        }

        const hasGoogleProvider = providerData.some(
          (provider) => provider.providerId === 'google.com'
        );

        const hasEmailProvider = providerData.some(
          (provider) => provider.providerId === 'password'
        );

        if (hasGoogleProvider && !hasEmailProvider) {
          setAuthProvider('google');
          setHasPassword(false);
        } else if (hasEmailProvider) {
          setAuthProvider('email');
          setHasPassword(true);
        } else if (hasGoogleProvider && hasEmailProvider) {
          setAuthProvider('google');
          setHasPassword(true);
        } else {
          setAuthProvider('unknown');
        }

        console.log('[Profile] Auth provider:', { 
          detected: hasGoogleProvider ? 'google' : 'email',
          hasPassword: hasEmailProvider,
          providerData 
        });
      } catch (error) {
        console.error('[Profile] Error detecting auth provider:', error);
      }
    };

    if (isAuthenticated) {
      detectAuthProvider();
    }
  }, [isAuthenticated, user]);

  /**
   * Handle phone number change - only allow numbers
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 11 digits (Philippine format: 09XXXXXXXXX)
    if (value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  /**
   * Validate Philippine phone number format
   */
  const validatePhilippinePhone = (phone: string): boolean => {
    // Must be exactly 11 digits and start with 09
    if (phone.length !== 11) {
      return false;
    }
    
    if (!phone.startsWith('09')) {
      return false;
    }
    
    return true;
  };

  /**
   * Handle phone number update
   */
  const handleSavePhone = async () => {
    if (!user?.id) {
      toast.error("No user signed in");
      return;
    }

    // Trim whitespace
    const cleanPhone = phoneNumber.trim();

    // Validate Philippine phone number format
    if (!cleanPhone) {
      toast.error("Phone number is required");
      return;
    }

    if (!validatePhilippinePhone(cleanPhone)) {
      toast.error("Please enter a valid Philippine phone number (e.g., 09171234567)");
      return;
    }

    setPhoneLoading(true);

    try {
      // Update Firestore profile
      await FirebaseUserService.updateProfile(user.id, {
        phone: cleanPhone,
      });

      // Update local auth context
      await updateUserProfile({ phone: cleanPhone });

      toast.success("Phone number updated successfully!");
      setIsEditingPhone(false);
    } catch (error) {
      console.error('[Profile] Error updating phone:', error);
      toast.error("Failed to update phone number");
    } finally {
      setPhoneLoading(false);
    }
  };

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
   * Handle password change for email/password users
   */
  const handleChangePassword = async () => {
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

      if (!currentUser?.email) {
        toast.error("No user is currently signed in");
        return;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
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

  /**
   * Handle linking password to Google Auth account
   */
  const handleLinkPassword = async () => {
    if (!linkPasswordForm.newPassword || !linkPasswordForm.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (linkPasswordForm.newPassword !== linkPasswordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (linkPasswordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        toast.error("No user is currently signed in");
        return;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        linkPasswordForm.newPassword
      );

      await linkWithCredential(currentUser, credential);

      setHasPassword(true);
      setAuthProvider('google');

      toast.success("Password added successfully! You can now sign in with email/password.");
      setShowLinkPasswordDialog(false);
      setLinkPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error('[Profile] Link password error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email already has a password. Try signing in with email/password instead.");
      } else if (error.code === 'auth/provider-already-linked') {
        toast.error("A password is already linked to this account");
        setHasPassword(true);
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak. Please use a stronger password.");
      } else {
        toast.error(error.message || "Failed to link password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderPasswordSection = () => {
    if (authProvider === 'email') {
      return (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowPasswordDialog(true)}
            variant="outline"
            className="border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      );
    }

    if (authProvider === 'google' && !hasPassword) {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Enhance Your Account Security</p>
                <p className="text-sm text-blue-800">
                  Add a password to your Google account so you can also sign in with email/password
                </p>
              </div>
              <Button
                onClick={() => setShowLinkPasswordDialog(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white ml-4 flex-shrink-0"
              >
                <Key className="h-4 w-4 mr-2" />
                Add Password
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (authProvider === 'google' && hasPassword) {
      return (
        <div className="space-y-3">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <p className="text-sm">
                Your account is secured with both Google Sign-In and email/password authentication.
                You can sign in using either method.
              </p>
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => setShowPasswordDialog(true)}
            variant="outline"
            className="border-[#1E392A] text-[#1E392A] hover:bg-[#1E392A] hover:text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      );
    }

    return null;
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
            <div className="relative flex-shrink-0">
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
              {/* Auth Provider Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {authProvider === 'google' && (
                  <Badge className="bg-blue-500 text-white flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Account
                  </Badge>
                )}
                {authProvider === 'email' && (
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email/Password
                  </Badge>
                )}
                {hasPassword && authProvider === 'google' && (
                  <Badge className="bg-purple-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Password Linked
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-900">
                      {user?.firstName || 'N/A'} {user?.lastName || ''}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{user?.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Phone Number 
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Required for delivery)</span>
                  </Label>
                  {isEditingPhone ? (
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 p-2 bg-white rounded-lg border-2 border-[#1E392A]">
                          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="09171234567"
                            className="border-0 p-0 h-auto focus-visible:ring-0"
                            maxLength={11}
                          />
                        </div>
                        <Button
                          onClick={handleSavePhone}
                          disabled={phoneLoading}
                          size="sm"
                          className="bg-[#1E392A] hover:bg-[#2d5a42]"
                        >
                          {phoneLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingPhone(false);
                            setPhoneNumber(user?.phone || "");
                          }}
                          disabled={phoneLoading}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      {/* Real-time validation feedback */}
                      {phoneNumber && (
                        <div className="text-xs">
                          {phoneNumber.length === 11 && phoneNumber.startsWith('09') ? (
                            <p className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid Philippine phone number
                            </p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Must be 11 digits starting with 09
                              </p>
                              <p className="text-gray-500">
                                Format: 09XXXXXXXXX ({phoneNumber.length}/11 digits)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-900">
                          {phoneNumber || 'No phone number set'}
                        </span>
                      </div>
                      <Button
                        onClick={() => setIsEditingPhone(true)}
                        size="sm"
                        variant="ghost"
                        className="text-[#1E392A] hover:bg-[#1E392A]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!phoneNumber && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Phone number is required for Lalamove delivery coordination
                    </p>
                  )}
                </div>
              </div>

              {/* Password Management Section */}
              <div className="pt-2 border-t border-gray-100">
                {renderPasswordSection()}
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
                      className="text-red-600 hover:bg-red-50"
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Delivery Instructions Help Riders Find You
              </h4>
              <p className="text-sm text-blue-800">
                Add landmarks like "in front of 7/11" or "beside the church" to help Lalamove riders 
                deliver your mushrooms quickly and accurately. Click "Edit" to update the map location and instructions.
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
              {editingAddress ? `Edit Address: ${editingAddress.label}` : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Update the address details and use the map to select the exact location"
                : "Search for your address or click on the map to select your location"
              }
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
              <p className="text-xs text-gray-500 mt-1">
                Help Lalamove riders find your location easily
              </p>
            </div>

            {editingAddress && (
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <p className="text-sm">
                    Current location: {editingAddress.formattedAddress}. 
                    You can search for a new address or drag the marker to update the exact location.
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
              {confirmDialog.action === "delete" ? "Delete Address" : "Set as Default"}
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
              <Label htmlFor="current-password">Current Password *</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 characters)"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className="mt-1"
                required
              />
            </div>

            {passwordForm.newPassword && passwordForm.confirmPassword && 
             passwordForm.newPassword !== passwordForm.confirmPassword && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Passwords do not match</AlertDescription>
              </Alert>
            )}

            {passwordForm.newPassword && passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Password must be at least 6 characters</AlertDescription>
              </Alert>
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

      {/* Link Password Dialog */}
      <Dialog open={showLinkPasswordDialog} onOpenChange={(open) => {
        setShowLinkPasswordDialog(open);
        if (!open) {
          setLinkPasswordForm({ newPassword: "", confirmPassword: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Add Password to Your Account
            </DialogTitle>
            <DialogDescription>
              Create a password so you can also sign in with email/password in addition to Google
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="text-sm font-medium mb-1">Why add a password?</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-blue-800">
                <li>Sign in with email/password when Google is unavailable</li>
                <li>Access your account from any device</li>
                <li>Enhanced account security with multiple login methods</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="link-new-password">New Password *</Label>
              <Input
                id="link-new-password"
                type="password"
                value={linkPasswordForm.newPassword}
                onChange={(e) => setLinkPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter password (min 6 characters)"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="link-confirm-password">Confirm Password *</Label>
              <Input
                id="link-confirm-password"
                type="password"
                value={linkPasswordForm.confirmPassword}
                onChange={(e) => setLinkPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter password"
                className="mt-1"
                required
              />
            </div>

            {linkPasswordForm.newPassword && linkPasswordForm.confirmPassword && 
             linkPasswordForm.newPassword !== linkPasswordForm.confirmPassword && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Passwords do not match</AlertDescription>
              </Alert>
            )}

            {linkPasswordForm.newPassword && linkPasswordForm.newPassword.length > 0 && linkPasswordForm.newPassword.length < 6 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Password must be at least 6 characters</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkPasswordDialog(false);
                setLinkPasswordForm({ newPassword: "", confirmPassword: "" });
              }}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkPassword}
              disabled={passwordLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Password...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Add Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
