"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  User,
  Mail,
  Phone,
  Globe,
  Bell,
  Lock,
  Upload,
  Save,
} from "lucide-react";
import Image from "next/image";

export default function SellerSettings() {
  // Sample seller data - would come from API in production
  const [sellerData, setSellerData] = useState({
    name: "Fungi Fresh Farms",
    email: "contact@fungifreshfarms.com",
    phone: "09123456789",
    description: "Urban-grown gourmet mushrooms for the modern kitchen.",
    website: "https://fungifreshfarms.com",
    location: "Caloocan City, Metro Manila",
    logo: "/placeholder.png",
    banner: "/placeholder.png",
    taxId: "123-456-789-000",
    bankName: "BDO Unibank",
    bankAccountName: "Fungi Fresh Farms Inc.",
    bankAccountNumber: "1234567890",
    notifyNewOrders: true,
    notifyMessages: true,
    notifyUpdates: false,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your API
    console.log("Updating profile with:", sellerData);

    // Mock success message
    alert("Profile updated successfully!");
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    // In a real application, you would send this data to your API
    console.log("Updating password");

    // Reset form and show success message
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    alert("Password updated successfully!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // and get back a URL. Here we're just creating a local URL.
      const imageUrl = URL.createObjectURL(file);
      setSellerData({ ...sellerData, logo: imageUrl });
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // and get back a URL. Here we're just creating a local URL.
      const imageUrl = URL.createObjectURL(file);
      setSellerData({ ...sellerData, banner: imageUrl });
    }
  };

  const handleDeleteAccount = () => {
    // In a real application, you would send a delete request to your API
    console.log("Deleting account");

    // Mock success message
    alert("Account deleted successfully! (This is a mock implementation)");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <form onSubmit={handleProfileUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>
                  Manage your store information and public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="store-logo">Store Logo</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={sellerData.logo}
                          alt="Store logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 500x500px, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="store-banner">Store Banner</Label>
                    <div className="mt-2">
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 mb-2">
                        <Image
                          src={sellerData.banner}
                          alt="Store banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="banner-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Banner
                        </Label>
                        <Input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 1200x300px, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="store-name">Store Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="store-name"
                          placeholder="Your store name"
                          className="pl-9"
                          value={sellerData.name}
                          onChange={(e) =>
                            setSellerData({
                              ...sellerData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="store-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="store-email"
                          type="email"
                          placeholder="contact@yourstore.com"
                          className="pl-9"
                          value={sellerData.email}
                          onChange={(e) =>
                            setSellerData({
                              ...sellerData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="store-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="store-phone"
                          placeholder="e.g., 09123456789"
                          className="pl-9"
                          value={sellerData.phone}
                          onChange={(e) =>
                            setSellerData({
                              ...sellerData,
                              phone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="store-website">Website (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="store-website"
                          placeholder="https://yourwebsite.com"
                          className="pl-9"
                          value={sellerData.website}
                          onChange={(e) =>
                            setSellerData({
                              ...sellerData,
                              website: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="store-location">Location</Label>
                    <Input
                      id="store-location"
                      placeholder="City, Province"
                      value={sellerData.location}
                      onChange={(e) =>
                        setSellerData({
                          ...sellerData,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="store-description">Store Description</Label>
                    <Textarea
                      id="store-description"
                      placeholder="Tell customers about your store..."
                      rows={4}
                      value={sellerData.description}
                      onChange={(e) =>
                        setSellerData({
                          ...sellerData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This description will appear on your store profile page.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <form onSubmit={handleProfileUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Manage your payment and tax information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tax-id">Tax Identification Number</Label>
                    <Input
                      id="tax-id"
                      placeholder="e.g., 123-456-789-000"
                      value={sellerData.taxId}
                      onChange={(e) =>
                        setSellerData({ ...sellerData, taxId: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Select
                        value={sellerData.bankName}
                        onValueChange={(value) =>
                          setSellerData({ ...sellerData, bankName: value })
                        }
                      >
                        <SelectTrigger id="bank-name">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BDO Unibank">
                            BDO Unibank
                          </SelectItem>
                          <SelectItem value="Bank of the Philippine Islands">
                            Bank of the Philippine Islands
                          </SelectItem>
                          <SelectItem value="Metrobank">Metrobank</SelectItem>
                          <SelectItem value="Landbank">Landbank</SelectItem>
                          <SelectItem value="Security Bank">
                            Security Bank
                          </SelectItem>
                          <SelectItem value="UnionBank">UnionBank</SelectItem>
                          <SelectItem value="PNB">PNB</SelectItem>
                          <SelectItem value="Eastwest Bank">
                            Eastwest Bank
                          </SelectItem>
                          <SelectItem value="RCBC">RCBC</SelectItem>
                          <SelectItem value="Chinabank">Chinabank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input
                        id="account-name"
                        placeholder="Name on your bank account"
                        value={sellerData.bankAccountName}
                        onChange={(e) =>
                          setSellerData({
                            ...sellerData,
                            bankAccountName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Your bank account number"
                      value={sellerData.bankAccountNumber}
                      onChange={(e) =>
                        setSellerData({
                          ...sellerData,
                          bankAccountNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                    <p className="font-medium">
                      Payment Processing Information
                    </p>
                    <p className="mt-1">
                      Payments are processed every 15th and 30th of the month.
                      Ensure your banking details are correct to avoid delays.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <form onSubmit={handleProfileUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications from MASH.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        New Order Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive notifications when a new order is placed.
                      </p>
                    </div>
                    <Switch
                      checked={sellerData.notifyNewOrders}
                      onCheckedChange={(checked) =>
                        setSellerData({
                          ...sellerData,
                          notifyNewOrders: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        Message Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive notifications when you get new messages from
                        customers.
                      </p>
                    </div>
                    <Switch
                      checked={sellerData.notifyMessages}
                      onCheckedChange={(checked) =>
                        setSellerData({
                          ...sellerData,
                          notifyMessages: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Platform Updates</h4>
                      <p className="text-sm text-gray-500">
                        Receive notifications about MASH platform updates and
                        new features.
                      </p>
                    </div>
                    <Switch
                      checked={sellerData.notifyUpdates}
                      onCheckedChange={(checked) =>
                        setSellerData({ ...sellerData, notifyUpdates: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        className="pl-9"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-9"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                  >
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your seller account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Add an extra layer of security to your account by enabling
                    two-factor authentication.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-red-600 mb-2">
                    Danger Zone
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Permanently delete your seller account and all associated
                    data.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Seller Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch seller profile data:
           - GET /api/seller/profile
        2. Update seller profile:
           - PUT /api/seller/profile with updated data
        3. Update password:
           - PUT /api/seller/security/password with old and new password
        4. Upload logo/banner:
           - POST /api/seller/media/upload with multipart form data
        5. Update notification preferences:
           - PUT /api/seller/notifications/preferences
        6. Update payment information:
           - PUT /api/seller/payment-info
        7. Delete account:
           - DELETE /api/seller/account
      */}
    </div>
  );
}
