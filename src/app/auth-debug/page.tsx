"use client";

/**
 * Firebase Auth Debug Page
 * Test page to diagnose Google Sign-In redirect issues
 */

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  getRedirectResult,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";

export default function AuthDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    const checkAuth = async () => {
      addLog("🔍 Starting auth check...");
      addLog(`Current URL: ${window.location.href}`);
      addLog(`Referrer: ${document.referrer || "none"}`);
      addLog(
        `Firebase Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`
      );

      // Check current auth state
      addLog(
        `Current user before redirect check: ${auth.currentUser?.email || "null"}`
      );

      // Check for redirect result
      try {
        addLog("📥 Calling getRedirectResult...");
        const result = await getRedirectResult(auth);

        if (result) {
          addLog(`✅ REDIRECT RESULT FOUND!`);
          addLog(`User: ${result.user.email}`);
          addLog(`UID: ${result.user.uid}`);
          addLog(`Display Name: ${result.user.displayName}`);
          setCurrentUser(result.user);
        } else {
          addLog("ℹ️ No redirect result (normal page load)");

          // But check if user is already signed in
          if (auth.currentUser) {
            addLog(`⚠️ User already signed in: ${auth.currentUser.email}`);
            setCurrentUser(auth.currentUser);
          }
        }
      } catch (error: any) {
        addLog(`❌ Error getting redirect result: ${error.message}`);
        console.error("Full error:", error);
      }

      // Check localStorage for any Firebase persistence
      const keys = Object.keys(localStorage).filter(
        (k) => k.includes("firebase") || k.includes("auth")
      );
      addLog(`LocalStorage keys with firebase/auth: ${keys.length} found`);
      keys.forEach((key) => {
        addLog(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
      });
    };

    checkAuth();
  }, []);

  const handleTestSignIn = async () => {
    addLog("🚀 Starting test sign-in...");
    addLog(`Starting from: ${window.location.href}`);

    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      await signInWithRedirect(auth, provider);
      addLog("✅ Redirect initiated");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Firebase Auth Debug Console</h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold mb-2">Current User:</h2>
          {currentUser ? (
            <pre className="text-sm">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">No user signed in</p>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={handleTestSignIn}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Test Google Sign-In
          </button>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Debug Logs:</h2>
          <div className="space-y-1 text-sm font-mono max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-700">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2">💡 What to check:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Google Sign-In" button</li>
            <li>Sign in with your Google account</li>
            <li>You'll be redirected back to this page</li>
            <li>Check if "REDIRECT RESULT FOUND" appears in logs</li>
            <li>If not, check the localStorage keys shown</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold mb-2">🔧 Common Issues:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Authorized domains not configured in Firebase Console</li>
            <li>localStorage is disabled or being cleared</li>
            <li>Browser is in incognito mode</li>
            <li>Third-party cookies are blocked</li>
            <li>Firebase config is incorrect</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
