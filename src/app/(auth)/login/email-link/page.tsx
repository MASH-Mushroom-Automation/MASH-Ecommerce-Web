"use client";

/**
 * Email Link Sign-In Callback Page
 * 
 * This page handles the redirect from Firebase email link authentication.
 * When a user clicks the sign-in link in their email, they land here.
 * 
 * For new users (no displayName), redirects to profile page to complete setup.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle, AlertCircle, User } from "lucide-react";
import { toast } from "sonner";

export default function EmailLinkSignInPage() {
  const router = useRouter();
  const { 
    checkForEmailLink, 
    completeEmailLinkSignIn, 
    getStoredEmail, 
    isAuthenticated,
    user,
    updateUserProfile 
  } = useAuth();
  
  const [status, setStatus] = useState<"checking" | "need-email" | "signing-in" | "need-name" | "success" | "error">("checking");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated && status !== "need-name") {
      // Check if user needs to complete their profile (no displayName)
      if (user && !user.displayName && !user.firstName) {
        setStatus("need-name");
        return;
      }
      
      const redirectUrl = sessionStorage.getItem("auth-redirect-url") || "/";
      sessionStorage.removeItem("auth-redirect-url");
      router.replace(redirectUrl);
      return;
    }

    const handleEmailLink = async () => {
      // Check if this is an email sign-in link
      if (!checkForEmailLink()) {
        setStatus("error");
        setErrorMessage("Invalid sign-in link. Please request a new one.");
        return;
      }

      // Try to get stored email
      const storedEmail = getStoredEmail();
      
      if (storedEmail) {
        // We have the email, complete sign-in automatically
        try {
          setStatus("signing-in");
          await completeEmailLinkSignIn(storedEmail, window.location.href);
          // Success will be handled by the useEffect above
          setStatus("success");
        } catch (error) {
          console.error("Email link sign-in failed:", error);
          setStatus("error");
          setErrorMessage("Sign-in failed. The link may have expired.");
        }
      } else {
        // Need user to enter email
        setStatus("need-email");
      }
    };

    if (status === "checking") {
      handleEmailLink();
    }
  }, [checkForEmailLink, getStoredEmail, completeEmailLinkSignIn, isAuthenticated, router, status, user]);

  const handleManualSignIn = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setStatus("signing-in");
      await completeEmailLinkSignIn(email, window.location.href);
      setStatus("success");
    } catch (error) {
      console.error("Email link sign-in failed:", error);
      setStatus("error");
      setErrorMessage("Sign-in failed. Make sure you're using the same email that requested the link.");
    }
  };

  const handleSaveName = async () => {
    if (!firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });
      
      toast.success(`Welcome, ${firstName}!`);
      
      // Redirect after success
      const redirectUrl = sessionStorage.getItem("auth-redirect-url") || "/";
      sessionStorage.removeItem("auth-redirect-url");
      router.replace(redirectUrl);
    } catch (error) {
      console.error("Failed to save name:", error);
      toast.error("Failed to save your name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSkipName = () => {
    const redirectUrl = sessionStorage.getItem("auth-redirect-url") || "/";
    sessionStorage.removeItem("auth-redirect-url");
    router.replace(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg shadow-md p-8 text-center">
          
          {/* Checking Status */}
          {status === "checking" && (
            <>
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Verifying link...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we verify your sign-in link.
              </p>
            </>
          )}

          {/* Signing In Status */}
          {status === "signing-in" && (
            <>
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Signing you in...
              </h2>
              <p className="text-muted-foreground">
                Just a moment, we&apos;re logging you in.
              </p>
            </>
          )}

          {/* Need Email Input */}
          {status === "need-email" && (
            <>
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Confirm your email
              </h2>
              <p className="text-muted-foreground mb-6">
                Please enter the email address you used to request this sign-in link.
              </p>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleManualSignIn}
                >
                  Complete Sign In
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}

          {/* Need Name Input (for new users) */}
          {status === "need-name" && (
            <>
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome! What&apos;s your name?
              </h2>
              <p className="text-muted-foreground mb-6">
                Let us know what to call you.
              </p>
              <div className="space-y-4 text-left">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name (optional)</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSaveName}
                  disabled={isSavingName || !firstName.trim()}
                >
                  {isSavingName ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleSkipName}
                >
                  Skip for now
                </Button>
              </div>
            </>
          )}

          {/* Success Status */}
          {status === "success" && (
            <>
              <div className="bg-green-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Success!
              </h2>
              <p className="text-muted-foreground">
                You&apos;re now signed in. Redirecting...
              </p>
            </>
          )}

          {/* Error Status */}
          {status === "error" && (
            <>
              <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Sign-in failed
              </h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Request New Link
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
