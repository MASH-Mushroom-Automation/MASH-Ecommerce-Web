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
  Eye,
  EyeOff,
} from "lucide-react";
import OperatingHoursModal from "@/components/OperatingHoursModal";
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
    operatingHours: "9AM - 5PM Mon-Fri; Closed Sat-Sun",
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

  // Helper: format structured hours map into a human friendly summary
  const formatTime = (t: string) => {
    // expect HH:MM
    const [hh, mm] = t.split(":" ).map(Number);
    if (Number.isNaN(hh)) return t;
    const period = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
  };

  const formatHoursSummary = (hoursMap: Record<string, any>) => {
    const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const abbr: Record<string,string> = {Monday:"Mon",Tuesday:"Tue",Wednesday:"Wed",Thursday:"Thu",Friday:"Fri",Saturday:"Sat",Sunday:"Sun"};
    const entries = DAYS.map((d) => {
      const v = hoursMap[d];
      if (!v || v.closed) return { day: d, val: "Closed" };
      return { day: d, val: `${formatTime(v.open)} - ${formatTime(v.close)}` };
    });

    // compress consecutive days with same val
    const parts: string[] = [];
    let i = 0;
    while (i < entries.length) {
      let j = i;
      while (j + 1 < entries.length && entries[j+1].val === entries[i].val) j++;
      const dayLabel = i === j ? abbr[entries[i].day] : `${abbr[entries[i].day]}-${abbr[entries[j].day]}`;
      parts.push(`${dayLabel} ${entries[i].val}`);
      i = j + 1;
    }
    return parts.join("; ");
  };
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    // Basic validation (enforced client-side)
    const isMatch = newPassword === confirmPassword;
    const lengthOk = newPassword.length >= 6;
    const hasLetter = /[A-Za-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);

    if (!isMatch) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (!lengthOk || !hasLetter || !hasNumber || !hasSpecial) {
      setPasswordError(
        "Password must be at least 6 characters and include letters, numbers, and one of these special characters: !$@%"
      );
      toast.error(
        "Password must be at least 6 characters and include letters, numbers, and one of these special characters: !$@%"
      );
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

  // Client-side password rules helper
  const isPasswordValid = (pwd: string) => {
    const lengthOk = pwd.length >= 6;
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd);
    return lengthOk && hasLetter && hasNumber && hasSpecial;
  };

  const isPasswordFormValid =
    currentPassword.trim().length > 0 && isPasswordValid(newPassword) && newPassword === confirmPassword;

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
    "operatingHours",
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
          operatingHours: sellerData.operatingHours,
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
    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  {/* Title & description */}
  <div>
    <CardTitle>Store Profile</CardTitle>
    <CardDescription>
      Manage your store information and public profile.
    </CardDescription>
  </div>

  {/* Actions */}
  <div className="flex flex-wrap gap-2 sm:justify-end">
    {!isEditingProfile ? (
      <Button
        size="sm"
        onClick={() => setIsEditingProfile(true)}
        disabled={loading}
      >
        Edit
      </Button>
    ) : (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={handleProfileCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={saveProfile}
          disabled={saving || !isProfileDirty}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </>
    )}
  </div>
</CardHeader>

              <CardContent className="sm:-mt-5">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="store-logo">Store Logo</Label>
                  <div className="flex flex-row items-center gap-4 mt-2">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={stagedLogoPreview || sellerData.logo}
                          alt="Store logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <Label
                          htmlFor="logo-upload"
                          className={`cursor-pointer inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2 px-4 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground ${!isEditingProfile ? "opacity-50 pointer-events-none" : "hover:bg-accent"}`}
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
                        <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
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
                      <div className="w-full sm:w-auto">
                        <Label
                          htmlFor="banner-upload"
                          className={`cursor-pointer inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2 px-4 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground ${!isEditingProfile ? "opacity-50 pointer-events-none" : "hover:bg-accent"}`}
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
                        <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
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

                      <div className="space-y-2">
                      <Label htmlFor="store-hours">Operating Hours</Label>
                      <div className={`flex items-center gap-3 p-3 rounded-md border flex-wrap sm:flex-nowrap ${!isEditingProfile ? "opacity-60" : ""}`}>
                        <div className="flex-1 text-sm text-foreground min-w-0">
                          {sellerData.operatingHours ? (
                            <span className="block truncate">{sellerData.operatingHours}</span>
                          ) : (
                            <span className="text-muted-foreground">No operating hours set</span>
                          )}
                        </div>
                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                          <OperatingHoursModal
                            triggerLabel={isEditingProfile ? "Edit Hours" : "View Hours"}
                            initialHours={(() => {
                              try {
                                // Try parse JSON stored in operatingHours if present
                                const parsed = JSON.parse(String(sellerData.operatingHours || "{}"));
                                return parsed;
                              } catch {
                                return undefined;
                              }
                            })()}
                            onSave={(hours) => {
                              // Generate a human-friendly summary and store in sellerData.operatingHours
                              const fmt = formatHoursSummary(hours);
                              setSellerData((prev) => ({ ...prev, operatingHours: fmt }));
                            }}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Public store operating hours shown on your profile.
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
                <CardContent className="space-y-4 sm:-mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className="text-sm pr-10"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="text-sm pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="text-sm pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {newPassword && !isPasswordValid(newPassword) && (
                    <p className="text-sm text-red-600">
                      Password must be at least 6 characters and include letters, numbers, and one of: <span className="font-mono">! $ @ %</span>
                    </p>
                  )}

                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}

                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving || !isPasswordFormValid}
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
                    Deactivate your seller account and all associated
                    data.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Deactivate Account
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
