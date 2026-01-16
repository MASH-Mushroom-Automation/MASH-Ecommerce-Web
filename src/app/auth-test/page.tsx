"use client";

/**
 * Google Auth Test Page
 * 
 * Use this page to test and verify Google authentication is working properly.
 * Access at: /auth-test
 */

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AuthTestPage() {
  const { user, firebaseUser, isAuthenticated, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Google Auth Test Page</h1>
        <p className="text-muted-foreground">
          This page helps verify that Google authentication is working correctly.
        </p>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {isAuthenticated ? "Authenticated ✓" : "Not Authenticated"}
              </span>
            </div>

            {!isAuthenticated && (
              <div className="pt-4">
                <GoogleSignInButton fullWidth />
              </div>
            )}

            {isAuthenticated && (
              <Button onClick={signOut} variant="destructive">
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Firebase User Data */}
        {firebaseUser && (
          <Card>
            <CardHeader>
              <CardTitle>Firebase User Data</CardTitle>
              <CardDescription>Data from Firebase Auth</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">UID</dt>
                  <dd className="mt-1 font-mono text-sm">{firebaseUser.uid}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Email</dt>
                  <dd className="mt-1">{firebaseUser.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Display Name</dt>
                  <dd className="mt-1">{firebaseUser.displayName || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Photo URL</dt>
                  <dd className="mt-1">
                    {firebaseUser.photoURL ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={firebaseUser.photoURL}
                          alt="Profile"
                          className="h-10 w-10 rounded-full"
                        />
                        <span className="text-sm font-mono break-all">
                          {firebaseUser.photoURL}
                        </span>
                      </div>
                    ) : (
                      "Not set"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Email Verified</dt>
                  <dd className="mt-1">
                    {firebaseUser.emailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">Not verified</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* AuthContext User Data */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>AuthContext User Profile</CardTitle>
              <CardDescription>User data from Firestore via AuthContext</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">ID</dt>
                  <dd className="mt-1 font-mono text-sm">{user.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Email</dt>
                  <dd className="mt-1">{user.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">First Name</dt>
                  <dd className="mt-1">{user.firstName || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Last Name</dt>
                  <dd className="mt-1">{user.lastName || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Display Name</dt>
                  <dd className="mt-1">{user.displayName || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Phone</dt>
                  <dd className="mt-1">{user.phone || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Provider</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {user.provider}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Photo URL</dt>
                  <dd className="mt-1">
                    {user.photoURL ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="h-10 w-10 rounded-full"
                        />
                        <span className="text-sm font-mono break-all">
                          {user.photoURL}
                        </span>
                      </div>
                    ) : (
                      "Not set"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Avatar</dt>
                  <dd className="mt-1">
                    {user.avatar ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="h-10 w-10 rounded-full"
                        />
                        <span className="text-sm font-mono break-all">
                          {user.avatar}
                        </span>
                      </div>
                    ) : (
                      "Not set"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Onboarding Completed</dt>
                  <dd className="mt-1">
                    {user.onboardingCompleted ? (
                      <span className="text-green-600">✓ Completed</span>
                    ) : (
                      <span className="text-yellow-600">Not completed</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Raw Data */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Raw User Object</CardTitle>
              <CardDescription>Complete user data as JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Browser Storage */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Storage</CardTitle>
            <CardDescription>Data stored in localStorage and sessionStorage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="font-medium text-sm text-muted-foreground mb-2">localStorage - user</dt>
              <dd className="bg-muted p-4 rounded-lg overflow-auto">
                <pre className="text-xs">
                  {typeof window !== "undefined" && localStorage.getItem("user")
                    ? JSON.stringify(JSON.parse(localStorage.getItem("user")!), null, 2)
                    : "Not set"}
                </pre>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-sm text-muted-foreground mb-2">
                sessionStorage - firebase-token
              </dt>
              <dd className="bg-muted p-4 rounded-lg overflow-auto">
                <pre className="text-xs">
                  {typeof window !== "undefined" && sessionStorage.getItem("firebase-token")
                    ? sessionStorage.getItem("firebase-token")
                    : "Not set"}
                </pre>
              </dd>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
