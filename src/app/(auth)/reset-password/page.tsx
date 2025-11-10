"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof ResetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (_values: ResetForm) => {
    void _values;
    try {
      // TODO: call API to reset password
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      reset();
      router.push("/reset-success");
    } catch {
      toast.error("Failed to reset password", {
        description: "Please try again.",
      });
    }
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
            Create New Password
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            You&apos;re setting a new password for your account. <br />
            You&apos;ll use it next time you sign in.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="w-full"
                placeholder="Create a new password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Reset Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg font-semibold"
            >
              {isSubmitting ? "Saving..." : "Reset Password"}
            </Button>
          </form>
        </div>
    </>
  );
}
