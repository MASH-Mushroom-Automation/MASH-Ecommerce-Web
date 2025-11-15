"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { backendAPI, type OAuthStatusResponse } from "@/lib/backend-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link as LinkIcon, Unlink, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  const [oauthStatus, setOAuthStatus] = useState<OAuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);

  useEffect(() => {
    async function fetchOAuthStatus() {
      if (!clerkUser) return;

      try {
        const token = await getToken();
        if (!token) return;

        const status = await backendAPI.getOAuthStatus(token);
        setOAuthStatus(status);
      } catch (error) {
        console.error("Error fetching OAuth status:", error);
      } finally {
        setLoading(false);
      }
    }

    if (clerkLoaded) {
      fetchOAuthStatus();
    }
  }, [clerkUser, clerkLoaded, getToken]);

  const googleAccount = clerkUser?.externalAccounts.find((acc) => acc.provider === "google");
  const hasGoogleLinked = !!googleAccount;
  const canUnlinkGoogle = oauthStatus?.data.canUnlinkProvider ?? false;

  async function handleLinkGoogle() {
    if (!clerkUser) return;

    setActionLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not available");
        return;
      }

      // Create Google external account via Clerk
      await clerkUser.createExternalAccount({
        strategy: "oauth_google",
        redirectUrl: window.location.href,
      });

      // Get Google access token from Clerk
      const googleAccessToken = googleAccount?.accessToken;
      if (!googleAccessToken) {
        toast.error("Failed to get Google access token");
        return;
      }

      // Link to backend
      const result = await backendAPI.linkGoogleAccount(token, googleAccessToken);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh OAuth status
        const status = await backendAPI.getOAuthStatus(token);
        setOAuthStatus(status);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error linking Google:", error);
      toast.error("Failed to link Google account");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnlinkGoogle() {
    if (!clerkUser || !canUnlinkGoogle) return;

    setActionLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not available");
        return;
      }

      // Unlink from Clerk
      if (googleAccount) {
        await clerkUser.externalAccounts.find((acc) => acc.id === googleAccount.id)?.destroy();
      }

      // Unlink from backend
      const result = await backendAPI.unlinkSocialAccount(token, "google");
      
      if (result.success) {
        toast.success(result.message);
        // Refresh OAuth status
        const status = await backendAPI.getOAuthStatus(token);
        setOAuthStatus(status);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error unlinking Google:", error);
      toast.error("Failed to unlink Google account");
    } finally {
      setActionLoading(false);
      setShowUnlinkDialog(false);
    }
  }

  if (!clerkLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-medium" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">Account Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your connected accounts and authentication methods
          </p>
        </div>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Link or unlink social accounts to sign in to MASH
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Account */}
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google</p>
                  <div className="flex items-center gap-2 mt-1">
                    {hasGoogleLinked ? (
                      <>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </Badge>
                        {googleAccount?.emailAddress && (
                          <span className="text-sm text-muted-foreground">
                            {googleAccount.emailAddress}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">Not connected</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {hasGoogleLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnlinkDialog(true)}
                    disabled={!canUnlinkGoogle || actionLoading}
                    className="gap-2"
                  >
                    <Unlink className="h-4 w-4" />
                    Unlink
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleLinkGoogle}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Warning if can't unlink */}
            {hasGoogleLinked && !canUnlinkGoogle && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Cannot unlink Google account
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    You must have at least one sign-in method. Add an email/password before unlinking Google.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unlink Confirmation Dialog */}
        <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unlink Google Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unlink your Google account? You will no longer be able to sign in using Google unless you link it again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlinkGoogle}
                disabled={actionLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Unlinking...
                  </>
                ) : (
                  "Unlink"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
