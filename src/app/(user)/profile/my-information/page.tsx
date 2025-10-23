"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, MapPin, Check, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
}

export default function MyInformationPage() {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Initialize from API data when profile loads
  useEffect(() => {
    if (profile) {
      const initialUserInfo: UserInfoForm = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        newPassword: "",
        confirmPassword: "",
      };

      // TODO: Address data should come from profile.address when backend supports it
      const initialAddress: AddressForm = {
        street: "",
        addressLine2: "",
        city: "",
        stateProvince: "",
        zipPostal: "",
        landmark: "",
      };

      setOriginalUserInfo(initialUserInfo);
      setUserInfo(initialUserInfo);
      setOriginalAddress(initialAddress);
      setAddress(initialAddress);
    }
  }, [profile]);

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
      // Prepare update data
      const updateData: Partial<typeof profile> = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
      };

      // TODO: Add password update when backend supports it
      // TODO: Add address update when backend supports it

      await updateProfile(updateData);

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
      toast.success("Your profile has been updated.");
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

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#1E392A]" />
            <p className="text-gray-600">Loading your information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show error if we have no profile data at all
  if (error && !profile) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 sm:p-8">
          <Alert variant="destructive">
            <AlertDescription>Failed to load profile: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Account Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-5 w-5 text-[#1E392A]" />
              <h2 className="text-xl font-bold text-[#212121]">
                Account Information
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              You can change your information here seamlessly
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
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
                    className="text-sm font-medium text-gray-700"
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
                    className="text-sm font-medium text-gray-700"
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
                    className="text-sm font-medium text-gray-700"
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
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-[#1E392A]" />
              <h2 className="text-xl font-bold text-[#212121]">My Address</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              We&apos;ll ship your orders to this address.
            </p>

            <div className="space-y-4">
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
            <div className="flex items-center justify-between bg-[#1E392A] px-6 py-4 rounded-lg -mx-8 -mb-8 mt-8">
              <p className="text-white text-sm">You have unsaved changes.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="bg-white text-[#1E392A] hover:bg-gray-100"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#6A994E] hover:bg-[#6A994E]/90 text-white"
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
            <DialogTitle className="text-2xl font-bold text-[#212121] mb-2">
              Successful
            </DialogTitle>
            <p className="text-gray-600 mb-6">
              Changes in the account details has been updated
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white"
            >
              Great!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
