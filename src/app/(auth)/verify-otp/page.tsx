"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    console.log("Verifying OTP:", otpCode);
    // Redirect to reset password page
    window.location.href = "/reset-password";
  };

  const handleResend = () => {
    console.log("Resending OTP");
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleCancel = () => {
    window.location.href = "/forgot-password";
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
            Enter verification code
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            Enter One-Time Password sent to <br />
            jos*****@gmail.com
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-4 mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-2xl font-semibold"
              />
            ))}
          </div>

          {/* Resend Code */}
          <p className="text-center text-sm text-gray-600 mb-8">
            Didn&apos;t receive any OTP code?{" "}
            <button
              onClick={handleResend}
              className="text-[#6A994E] hover:underline font-medium"
            >
              Resend Code
            </button>
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleVerify}
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white py-6 rounded-lg font-semibold"
            >
              Verify
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full py-6 border-[#6A994E] text-[#6A994E] hover:bg-[#6A994E]/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
