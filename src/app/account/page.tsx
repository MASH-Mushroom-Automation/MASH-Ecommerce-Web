"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { backendAPI, type BackendUser } from "@/lib/backend-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ProfileSkeleton, AccountInfoSkeleton } from "@/components/ui/loading-skeleton";

export default function AccountPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBackendUser() {
      if (!clerkUser) return;

      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token available");
          return;
        }

        const user = await backendAPI.getUser(token);
        if (user) {
          setBackendUser(user);
        } else {
          // Try to sync Clerk user with backend
          const syncedUser = await backendAPI.syncClerkUser(token, {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            googleId: clerkUser.externalAccounts.find((acc) => acc.provider === "google")?.providerUserId,
          });
          setBackendUser(syncedUser);
        }
      } catch (err) {
        console.error("Error fetching backend user:", err);
        setError("Failed to load user data from backend");
      } finally {
        setLoading(false);
      }
    }

    if (clerkLoaded) {
      fetchBackendUser();
    }
  }, [clerkUser, clerkLoaded, getToken]);

  if (!clerkLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 w-48 bg-gray-200 rounded"></div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile card skeleton */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <ProfileSkeleton />
            </div>

            {/* Account info skeleton */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <AccountInfoSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>Please sign in to view your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const googleAccount = clerkUser.externalAccounts.find((acc) => acc.provider === "google");
  const hasGoogleLinked = !!googleAccount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">My Account</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {clerkUser.firstName}!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Clerk User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authentication Account
              </CardTitle>
              <CardDescription>Your Clerk authentication information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {clerkUser.emailAddresses[0]?.emailAddress}
                    </p>
                    {clerkUser.emailAddresses[0]?.verification?.status === "verified" && (
                      <Badge variant="default" className="gap-1 text-xs bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {clerkUser.firstName} {clerkUser.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(clerkUser.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Linked Accounts</p>
                <div className="flex gap-2">
                  {hasGoogleLinked ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Google
                    </Badge>
                  ) : (
                    <Badge variant="outline">No external accounts</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backend User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                MASH Profile
              </CardTitle>
              <CardDescription>Your backend profile data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {backendUser ? (
                <>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {backendUser.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <Badge variant="secondary">{backendUser.role}</Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(backendUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Authentication Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {backendUser.hasPassword && (
                        <Badge variant="default">Email/Password</Badge>
                      )}
                      {backendUser.linkedProviders.map((provider) => (
                        <Badge key={provider} variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Backend user data not available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/settings">
              <Button variant="default">Account Settings</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Browse Products</Button>
            </Link>
            <Link href="/profile/order-history">
              <Button variant="outline">Order History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
