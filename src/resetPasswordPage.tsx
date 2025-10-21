"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Password reset submitted");
    // Redirect to success page
    window.location.href = "/reset-success";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/Logo  v6 - Market.png"
              alt="MASH Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#6A994E] rounded-full p-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create New Password
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            You&apos;re setting a new password for your account. <br />
            You&apos;ll use it next time you sign in.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Create a new password"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                placeholder="Confirm your new password"
                required
              />
            </div>

            {/* Reset Button */}
            <Button
              type="submit"
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white py-6 rounded-lg font-semibold"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
