"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { useRouter } from "next/navigation";

export default function SellerSettings() {
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [initialSellerData, setInitialSellerData] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [stagedLogoFile, setStagedLogoFile] = useState<File | null>(null);
  const [stagedBannerFile, setStagedBannerFile] = useState<File | null>(null);
  const [stagedLogoPreview, setStagedLogoPreview] = useState<string | null>(null);
  const [stagedBannerPreview, setStagedBannerPreview] = useState<string | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  // Fetch seller data on mount
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [profileRes, paymentRes, notifRes] = await Promise.all([
          fetch("/api/seller/profile"),
          fetch("/api/seller/payment-info"),
          fetch("/api/seller/notification-preferences")
        ]);

        // Merge fetched parts into a single baseline object, then set both current and initial
        let merged = { ...sellerData };

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            merged = { ...merged, ...profileData.data };
          }
        }

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.success) {
            merged = { ...merged, ...paymentData.data };
          }
        }

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.success) {
            merged = { ...merged, ...notifData.data };
          }
        }

        setSellerData(merged);
        setInitialSellerData(merged);
      } catch (error) {
        console.error("Error fetching seller data:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use saveProfile which will upload staged files (if any) then send profile PUT
    await saveProfile();
  };

  const handleProfileCancel = () => {
    if (initialSellerData) {
      setSellerData(initialSellerData);
    }
    // clear any staged previews
    if (stagedLogoPreview) { try { URL.revokeObjectURL(stagedLogoPreview); } catch {} }
    if (stagedBannerPreview) { try { URL.revokeObjectURL(stagedBannerPreview); } catch {} }
    setStagedLogoFile(null);
    setStagedBannerFile(null);
    setStagedLogoPreview(null);
    setStagedBannerPreview(null);
    setIsEditingProfile(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Basic validation
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/seller/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        setPasswordError(data.error?.message || "Failed to update password");
        toast.error(data.error?.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password");
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Stage logo file locally (preview only). Actual upload occurs on Save.
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }
    // revoke previous preview if any
    if (stagedLogoPreview) {
      try { URL.revokeObjectURL(stagedLogoPreview); } catch {}
    }
    const preview = URL.createObjectURL(file);
    setStagedLogoFile(file);
    setStagedLogoPreview(preview);
    // make sure we're in edit mode
    setIsEditingProfile(true);
  };

  // Stage banner file locally (preview only). Actual upload occurs on Save.
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner must be less than 5MB");
      return;
    }
    if (stagedBannerPreview) {
      try { URL.revokeObjectURL(stagedBannerPreview); } catch {}
    }
    const preview = URL.createObjectURL(file);
    setStagedBannerFile(file);
    setStagedBannerPreview(preview);
    setIsEditingProfile(true);
  };

  // Determine if any profile field or staged files differ from the baseline
  const profileKeys = [
    "name",
    "email",
    "phone",
    "description",
    "website",
    "location",
    "logo",
    "banner",
  ];

  const isProfileDirty = (() => {
    if (!initialSellerData) return false;
    const fieldDiff = profileKeys.some((k) => (initialSellerData as any)[k] !== (sellerData as any)[k]);
    const stagedDiff = Boolean(stagedLogoFile || stagedBannerFile);
    return fieldDiff || stagedDiff;
  })();

  // Save profile helper: upload staged files (if any), then PUT profile
  const saveProfile = async () => {
    setSaving(true);
    try {
      let logoUrl = sellerData.logo;
      let bannerUrl = sellerData.banner;

      // Upload staged logo if present
      if (stagedLogoFile) {
        const formData = new FormData();
        formData.append("file", stagedLogoFile);
        const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data?.success) {
          logoUrl = data.data.url;
        } else {
          toast.error(data?.error || "Failed to upload logo");
          setSaving(false);
          return;
        }
      }

      // Upload staged banner if present
      if (stagedBannerFile) {
        const formData = new FormData();
        formData.append("file", stagedBannerFile);
        const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data?.success) {
          bannerUrl = data.data.url;
        } else {
          toast.error(data?.error || "Failed to upload banner");
          setSaving(false);
          return;
        }
      }

      // Send profile update
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone,
          description: sellerData.description,
          website: sellerData.website,
          location: sellerData.location,
          logo: logoUrl,
          banner: bannerUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updated = { ...sellerData, ...data.data };
        setSellerData(updated);
        setInitialSellerData(updated);
        // clear staged previews
        if (stagedLogoPreview) { try { URL.revokeObjectURL(stagedLogoPreview); } catch {} }
        if (stagedBannerPreview) { try { URL.revokeObjectURL(stagedBannerPreview); } catch {} }
        setStagedLogoFile(null);
        setStagedBannerFile(null);
        setStagedLogoPreview(null);
        setStagedBannerPreview(null);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  

  const handleDeleteAccount = async () => {
    setSaving(true);

    try {
      // In production, this would call DELETE /api/seller/account
      // For now, just show a warning
      toast.error("Account deletion is not yet implemented. Please contact support.");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/seller/payment-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxId: sellerData.taxId,
          bankName: sellerData.bankName,
          bankAccountName: sellerData.bankAccountName,
          bankAccountNumber: sellerData.bankAccountNumber
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Payment information updated successfully!");
        setSellerData(prev => ({ ...prev, ...data.data }));
      } else {
        toast.error(data.error?.message || "Failed to update payment information");
      }
    } catch (error) {
      console.error("Error updating payment info:", error);
      toast.error("Failed to update payment information");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/seller/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifyNewOrders: sellerData.notifyNewOrders,
          notifyMessages: sellerData.notifyMessages,
          notifyUpdates: sellerData.notifyUpdates
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Notification preferences updated successfully!");
        setSellerData(prev => ({ ...prev, ...data.data }));
      } else {
        toast.error(data.error?.message || "Failed to update notification preferences");
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <header>
        <h1 className="sm:text-2xl text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store profile, payment information, notification preferences, and security settings.</p>
        </header>
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
              <CardHeader className="flex justify-between gap-4">
                <div className="flex justify-between">
                <div>
                    <CardTitle>Store Profile</CardTitle>
                    <CardDescription>
                      Manage your store information and public profile.
                    </CardDescription>
                 </div>
                    {!isEditingProfile ? (
                      <Button size="sm" onClick={() => setIsEditingProfile(true)} disabled={loading}>
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleProfileCancel} disabled={saving}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveProfile} disabled={saving || !isProfileDirty}>
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
              <CardContent className="-mt-5">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="store-logo">Store Logo</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={stagedLogoPreview || sellerData.logo}
                          alt="Store logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="logo-upload"
                          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground ${!isEditingProfile ? "opacity-50 pointer-events-none" : "hover:bg-accent"}`}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={!isEditingProfile}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 500x500px, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="store-banner">Store Banner</Label>
                    <div className="mt-2">
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-border mb-2">
                        <Image
                          src={stagedBannerPreview || sellerData.banner}
                          alt="Store banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="banner-upload"
                          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground ${!isEditingProfile ? "opacity-50 pointer-events-none" : "hover:bg-accent"}`}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadingBanner ? "Uploading..." : "Upload Banner"}
                        </Label>
                        <Input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                          disabled={!isEditingProfile}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 1200x300px, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <div className="relative">
                        <Input
                          id="store-name"
                          placeholder="Your store name"
                          value={sellerData.name}
                          className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                          readOnly={!isEditingProfile}
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

                    <div className="space-y-2">
                      <Label htmlFor="store-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="store-email"
                          type="email"
                          placeholder="contact@yourstore.com"
                          className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                          value={sellerData.email}
                          readOnly={!isEditingProfile}
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
                    <div className="space-y-2">
                      <Label htmlFor="store-phone">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="store-phone"
                          placeholder="e.g., 09123456789"
                          className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                          value={sellerData.phone}
                          readOnly={!isEditingProfile}
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

                    <div className="space-y-2">
                      <Label htmlFor="store-website">Website (Optional)</Label>
                      <div className="relative">
                        <Input
                          id="store-website"
                          placeholder="https://yourwebsite.com"
                          className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                          value={sellerData.website}
                          readOnly={!isEditingProfile}
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

                    <div className="space-y-2">
                    <Label htmlFor="store-location">Location</Label>
                    <Input
                      id="store-location"
                      placeholder="City, Province"
                      value={sellerData.location}
                      className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                      readOnly={!isEditingProfile}
                      onChange={(e) =>
                        setSellerData({
                          ...sellerData,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                    <div className="space-y-2">
                    <Label htmlFor="store-description">Store Description</Label>
                    <Textarea
                      id="store-description"
                      placeholder="Tell customers about your store..."
                      rows={4}
                      value={sellerData.description}
                      className={`text-sm ${!isEditingProfile ? "pointer-events-none opacity-60" : ""}`}
                      readOnly={!isEditingProfile}

                      onChange={(e) =>
                        setSellerData({
                          ...sellerData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This description will appear on your store profile page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Payment gateway integration coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="-mt-3">
              <div className="space-y-4">
                  <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax Identification Number</Label>
                  <Input
                    id="tax-id"
                    placeholder="e.g., 123-456-789-000"
                    value={sellerData.taxId}
                    onChange={(e) =>
                      setSellerData({ ...sellerData, taxId: e.target.value })
                    }
                  />
                </div>

                <div className="bg-muted border border-border rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Payment Gateway Integration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We're integrating secure payment gateways to process your transactions. 
                      You'll be able to connect your payment method once available.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Supported Gateways (Coming Soon):</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        PayMongo
                      </span>
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        GCash
                      </span>
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        Maya
                      </span>
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        Bank Transfer
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md text-sm text-blue-700 dark:text-blue-400">
                    <p className="font-medium">📌 Payment Processing Timeline</p>
                    <p className="mt-1">
                      Once integrated, payments will be processed every 15th and 30th of the month directly to your connected account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <form onSubmit={handleNotificationUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications from MASH.
                </CardDescription>
              </CardHeader>
              <CardContent className="-mt-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        New Order Notifications
                      </h4>
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">
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
              {/* <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter> */}
            </Card>
          </form>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Your password must be at least 6 characters and should include a combination of numbers, letters and special characters (!$@%).</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4 -mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        className="text-sm"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="text-sm"
                         value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="text-sm"
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
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Password"}
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
                          className="bg-red-600 hover:bg-red-700 text-white"
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
