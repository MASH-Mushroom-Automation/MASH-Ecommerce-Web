/**
 * Step 2: Contact Information Form
 * 
 * Collects contact person details and business address
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SellerRegistrationFormData,
  PHILIPPINE_REGIONS,
} from "@/lib/validations/seller-registration";

interface ContactInfoStepProps {
  form: UseFormReturn<SellerRegistrationFormData>;
}

export function ContactInfoStep({ form }: ContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Contact Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide your contact details so we can reach you regarding your seller account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Person Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground border-b pb-2">
            Contact Person
          </h3>

          {/* Contact Person Name */}
          <FormField
            control={form.control}
            name="contactPersonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Juan Dela Cruz"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      placeholder="juan@example.com"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mobile Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      placeholder="09123456789"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Alternative Phone */}
          <FormField
            control={form.control}
            name="alternativePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Contact Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="tel"
                    placeholder="09987654321"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Provide an alternate number for urgent matters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Address Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground border-b pb-2">
            Business Address
          </h3>

          {/* Street Address */}
          <FormField
            control={form.control}
            name="businessAddress.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Street Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., 123 Main Street, Block 5 Lot 10"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Barangay */}
            <FormField
              control={form.control}
              name="businessAddress.barangay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Barangay <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Barangay San Jose"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="businessAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City/Municipality <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Quezon City"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Province */}
            <FormField
              control={form.control}
              name="businessAddress.province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Province <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Metro Manila"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Postal Code */}
            <FormField
              control={form.control}
              name="businessAddress.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      placeholder="1100"
                      maxLength={4}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Region */}
          <FormField
            control={form.control}
            name="businessAddress.region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Region <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PHILIPPINE_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
