"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import type { AuthUser } from "@/contexts/AuthContext";

interface ProfileInfoCardProps {
  user: AuthUser | null;
  authProvider: "google" | "email" | "unknown";
  hasPassword: boolean;
  profileLoading: boolean;
  backendProfile: {
    phoneNumber?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  updateUserProfile?: (data: Record<string, string>) => Promise<void>;
  /** Slot for the phone verification section */
  phoneSection: React.ReactNode;
  /** Slot for the password management section */
  passwordSection: React.ReactNode;
}

export function ProfileInfoCard({
  user,
  authProvider,
  hasPassword,
  profileLoading,
  backendProfile,
  updateUserProfile,
  phoneSection,
  passwordSection,
}: ProfileInfoCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Profile Picture with Upload */}
          <ProfilePictureUpload
            user={user}
            onUploadComplete={async (photoURL: string) => {
              if (updateUserProfile) {
                await updateUserProfile({ photoURL, avatar: photoURL });
              }
            }}
          />

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {/* Auth Provider Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {authProvider === "google" && (
                <Badge className="bg-blue-500 text-white flex items-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google Account
                </Badge>
              )}
              {authProvider === "email" && (
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email/Password
                </Badge>
              )}
              {hasPassword && authProvider === "google" && (
                <Badge className="bg-purple-500 text-white flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Password Linked
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    {profileLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      <>
                        {backendProfile?.firstName ||
                          user?.firstName ||
                          "N/A"}{" "}
                        {backendProfile?.lastName || user?.lastName || ""}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">
                    {profileLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      backendProfile?.email || user?.email || "N/A"
                    )}
                  </span>
                </div>
              </div>

              {/* Phone Number Section (passed as slot) */}
              <div className="md:col-span-2">{phoneSection}</div>
            </div>

            {/* Password Management Section (passed as slot) */}
            <div className="pt-2 border-t border-border">{passwordSection}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
