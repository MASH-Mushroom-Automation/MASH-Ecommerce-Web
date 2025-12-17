"use client";

/**
 * Email Link Sign-In Callback Page
 * 
 * This page handles the redirect from Firebase email link authentication.
 * When a user clicks the sign-in link in their email, they land here.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EmailLinkSignInPage() {
  const router = useRouter();
  const { checkForEmailLink, completeEmailLinkSignIn, getStoredEmail, isAuthenticated } = useAuth();
  
  const [status, setStatus] = useState<"checking" | "need-email" | "signing-in" | "success" | "error">("checking");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
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
          setStatus("success");
          
          // Redirect after success
          setTimeout(() => {
            const redirectUrl = sessionStorage.getItem("auth-redirect-url") || "/";
            sessionStorage.removeItem("auth-redirect-url");
            router.replace(redirectUrl);
          }, 1500);
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

    handleEmailLink();
  }, [checkForEmailLink, getStoredEmail, completeEmailLinkSignIn, isAuthenticated, router]);

  const handleManualSignIn = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setStatus("signing-in");
      await completeEmailLinkSignIn(email, window.location.href);
      setStatus("success");
      
      // Redirect after success
      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem("auth-redirect-url") || "/";
        sessionStorage.removeItem("auth-redirect-url");
        router.replace(redirectUrl);
      }, 1500);
    } catch (error) {
      console.error("Email link sign-in failed:", error);
      setStatus("error");
      setErrorMessage("Sign-in failed. Make sure you're using the same email that requested the link.");
    }
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
