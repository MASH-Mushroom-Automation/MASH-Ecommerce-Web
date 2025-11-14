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
import { apiRequest } from "@/lib/api-client";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

// API Response Type
interface ForgotPasswordResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
  };
}

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
      // Call backend API
      const response = await apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
        }),
      });

      // Store email for reset page
      sessionStorage.setItem("resetPasswordEmail", values.email);

      // Show success message
      toast.success("Password reset email sent!", {
        description: response.data.message || "Check your email for instructions to reset your password.",
      });

      // Redirect to reset password page
      router.push("/reset-password");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Request failed", {
        description: err instanceof Error ? err.message : "Unable to process request. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  return (
    <>
      {/* Card */}
      <div className="bg-card rounded-lg shadow-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-4">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Reset your Password
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Enter your email address and we&apos;ll send you a reset code.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-2"
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
                <p className="mt-1 text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="w-full py-6 border-primary text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
          </form>
        </div>
    </>
  );
}
