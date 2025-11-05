"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
    try {
      // TODO: integrate API to send OTP
      await new Promise((r) => setTimeout(r, 500));
      toast.success("OTP sent", {
        description: `We sent a code to ${values.email}`,
      });
      router.push("/verify-otp");
    } catch {
      toast.error("Failed to send OTP", {
        description: "Please try again in a moment.",
      });
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  return (
    <>
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
            Reset your Password
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8">
            Enter your registered email or phone number to receive a One-Time
            Password (OTP).
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="w-full"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Send OTP Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 text-white py-6 rounded-lg font-semibold"
            >
              {isSubmitting ? "Sending..." : "Send OTP"}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="w-full py-6 border-[#6A994E] text-[#6A994E] hover:bg-[#6A994E]/10"
            >
              Cancel
            </Button>
          </form>
        </div>
    </>
  );
}
