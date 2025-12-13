/**
 * Step 3: Tax & Legal Information Form
 * 
 * Collects tax ID, business registration, and bank details
 */

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { SellerRegistrationFormData } from "@/lib/validations/seller-registration";

interface TaxLegalInfoStepProps {
  form: UseFormReturn<SellerRegistrationFormData>;
}

export function TaxLegalInfoStep({ form }: TaxLegalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Tax & Legal Information
        </h2>
        <p className="text-sm text-muted-foreground">
          This information helps us verify your business and process payments.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          All fields in this step are optional but highly recommended. Providing this
          information will speed up your verification process and enable faster payouts.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Tax Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground border-b pb-2">
            Tax Information
          </h3>

          {/* Tax ID Number */}
          <FormField
            control={form.control}
            name="taxIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Identification Number (TIN)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123-456-789-000"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Format: XXX-XXX-XXX-XXX
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Registration Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground border-b pb-2">
            Business Registration
          </h3>

          {/* DTI Registration */}
          <FormField
            control={form.control}
            name="dtiRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DTI Registration Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="For sole proprietors"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Required if you&apos;re a sole proprietor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SEC Registration */}
          <FormField
            control={form.control}
            name="secRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEC Registration Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="For corporations and partnerships"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Required if you&apos;re a corporation or partnership
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Permit */}
          <FormField
            control={form.control}
            name="businessPermitNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mayor&apos;s/Business Permit Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your local business permit number"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bank Account Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground border-b pb-2">
            Bank Account for Payouts
          </h3>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This information is required for receiving payments from your sales.
              Ensure the account name matches your registered business name.
            </AlertDescription>
          </Alert>

          {/* Account Name */}
          <FormField
            control={form.control}
            name="bankAccountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Name as shown on bank account"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Name */}
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., BDO, BPI, Metrobank"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567890"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
