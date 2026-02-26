"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Lock,
  Key,
  Shield,
  Info,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface PasswordManagerProps {
  /** The auth provider type: google, email, or unknown */
  authProvider: "google" | "email" | "unknown";
  /** Whether a password is linked to the account */
  hasPassword: boolean;
  /** Callback when password link state changes */
  onPasswordLinked?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function PasswordManager({
  authProvider,
  hasPassword,
  onPasswordLinked,
}: PasswordManagerProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLinkPasswordDialog, setShowLinkPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [linkPasswordForm, setLinkPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
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
        passwordForm.currentPassword,
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordForm.newPassword);

      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error("[PasswordManager] Password change error:", error);

      if (firebaseError.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else if (firebaseError.code === "auth/requires-recent-login") {
        toast.error(
          "Please sign out and sign in again before changing password",
        );
      } else {
        toast.error(firebaseError.message || "Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

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
        linkPasswordForm.newPassword,
      );

      await linkWithCredential(currentUser, credential);
      onPasswordLinked?.();

      toast.success(
        "Password added successfully! You can now sign in with email/password.",
      );
      setShowLinkPasswordDialog(false);
      setLinkPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error("[PasswordManager] Link password error:", error);

      if (firebaseError.code === "auth/email-already-in-use") {
        toast.error(
          "This email already has a password. Try signing in with email/password instead.",
        );
      } else if (firebaseError.code === "auth/provider-already-linked") {
        toast.error("A password is already linked to this account");
        onPasswordLinked?.();
      } else if (firebaseError.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else {
        toast.error(firebaseError.message || "Failed to link password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderPasswordSection = () => {
    if (authProvider === "email") {
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

    if (authProvider === "google" && !hasPassword) {
      return (
        <Alert className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">
                  Enhance Your Account Security
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Add a password to your Google account so you can also sign in
                  with email/password
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

    if (authProvider === "google" && hasPassword) {
      return (
        <div className="space-y-3">
          <Alert className="bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              <p className="text-sm">
                Your account is secured with both Google Sign-In and
                email/password authentication. You can sign in using either
                method.
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {renderPasswordSection()}

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }
        }}
      >
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
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Re-enter new password"
                className="mt-1"
                required
              />
            </div>

            {passwordForm.newPassword &&
              passwordForm.confirmPassword &&
              passwordForm.newPassword !== passwordForm.confirmPassword && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Passwords do not match</AlertDescription>
                </Alert>
              )}

            {passwordForm.newPassword &&
              passwordForm.newPassword.length > 0 &&
              passwordForm.newPassword.length < 6 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Password must be at least 6 characters
                  </AlertDescription>
                </Alert>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
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
      <Dialog
        open={showLinkPasswordDialog}
        onOpenChange={(open) => {
          setShowLinkPasswordDialog(open);
          if (!open) {
            setLinkPasswordForm({ newPassword: "", confirmPassword: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Add Password to Your Account
            </DialogTitle>
            <DialogDescription>
              Create a password so you can also sign in with email/password in
              addition to Google
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <p className="text-sm font-medium mb-1">Why add a password?</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-blue-800 dark:text-blue-200">
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
                onChange={(e) =>
                  setLinkPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setLinkPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Re-enter password"
                className="mt-1"
                required
              />
            </div>

            {linkPasswordForm.newPassword &&
              linkPasswordForm.confirmPassword &&
              linkPasswordForm.newPassword !==
                linkPasswordForm.confirmPassword && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Passwords do not match</AlertDescription>
                </Alert>
              )}

            {linkPasswordForm.newPassword &&
              linkPasswordForm.newPassword.length > 0 &&
              linkPasswordForm.newPassword.length < 6 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Password must be at least 6 characters
                  </AlertDescription>
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
    </>
  );
}

export default PasswordManager;
