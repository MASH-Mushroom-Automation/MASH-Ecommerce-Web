/**
 * Step 4: Terms & Conditions
 * 
 * Display and collect agreement to terms, policies, and data accuracy
 */

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Shield, Lock, CheckCircle2 } from "lucide-react";
import { SellerRegistrationFormData } from "@/lib/validations/seller-registration";

interface TermsConditionsStepProps {
  form: UseFormReturn<SellerRegistrationFormData>;
}

export function TermsConditionsStep({ form }: TermsConditionsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Terms & Conditions
        </h2>
        <p className="text-sm text-muted-foreground">
          Please review and accept our terms and policies to complete your registration.
        </p>
      </div>

      {/* Terms Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Terms of Service</h3>
              <p className="text-xs text-muted-foreground">
                General platform usage terms and seller obligations
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Seller Policy</h3>
              <p className="text-xs text-muted-foreground">
                Guidelines for listing products, pricing, and fulfillment
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Privacy Policy</h3>
              <p className="text-xs text-muted-foreground">
                How we collect, use, and protect your information
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Data Accuracy</h3>
              <p className="text-xs text-muted-foreground">
                Commitment to provide truthful and accurate information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Checkboxes */}
      <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
        {/* Terms of Service */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I agree to the{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Seller Policy */}
        <FormField
          control={form.control}
          name="agreeToSellerPolicy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I agree to the{" "}
                  <a
                    href="/seller-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Seller Policy
                  </a>{" "}
                  and understand my responsibilities as a seller{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Privacy Policy */}
        <FormField
          control={form.control}
          name="agreeToPrivacyPolicy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I agree to the{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Data Accuracy */}
        <FormField
          control={form.control}
          name="acknowledgeDataAccuracy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I confirm that all information provided is accurate and truthful{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Important:</strong> By submitting this application, you agree to
          comply with all MASH Marketplace policies and local laws. Providing false
          information may result in account suspension or termination.
        </AlertDescription>
      </Alert>
    </div>
  );
}
