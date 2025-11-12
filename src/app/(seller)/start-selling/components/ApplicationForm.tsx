import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { ChevronRight, Loader2, AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { SellerApplicationForm } from "../page";

interface ApplicationFormProps {
  form: UseFormReturn<SellerApplicationForm>;
  onSubmit: (data: SellerApplicationForm) => Promise<void>;
  onBack: () => void;
}

const mushroomOptions = [
  "Oyster Mushroom",
  "Shiitake",
  "Button Mushroom",
  "Enoki",
  "King Oyster",
  "Lion's Mane",
  "Reishi",
  "Maitake",
  "Other",
];

const regions = [
  "Metro Manila",
  "Luzon",
  "Visayas",
  "Mindanao",
  "Calabarzon",
  "Central Luzon",
  "Ilocos Region",
  "Cagayan Valley",
  "Bicol Region",
  "Western Visayas",
  "Central Visayas",
  "Eastern Visayas",
  "Northern Mindanao",
  "Davao Region",
  "SOCCSKSARGEN",
];

export function ApplicationForm({ form, onSubmit, onBack }: ApplicationFormProps) {
  const mushroomTypesValue = form.watch("mushroomTypes");
  const touched = form.formState.touchedFields as Record<string, any>;
  const errors = form.formState.errors as Record<string, any>;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground flex items-center"
        >
          <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
          Back
        </button>

        <div className="bg-background rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold">Seller Application Form</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Please fill in all required fields to complete your application.
              We'll review your information and get back to you within 2-3 business days.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Business Information
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Business Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={24}
                            className="h-10 sm:h-12"
                            placeholder="Enter your business name"
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.businessName && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.businessName && field.value && !errors.businessName && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Business Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-12">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent 
                            position="popper"
                            sideOffset={4}
                            align="start"
                          >
                            <SelectItem value="individual">Individual/Sole Proprietor</SelectItem>
                            <SelectItem value="company">Company/Corporation</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID Number (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            inputMode="numeric"
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            rows={3}
                            className="resize-none"
                            placeholder="Enter your tax ID (if applicable)"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Providing a tax ID can speed up the verification process
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Contact Details
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={24}
                            className="h-10 sm:h-12"
                            placeholder="Juan Dela Cruz"
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.fullName && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.fullName && field.value && !errors.fullName && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      const emailValue = field.value || "";
                      const isEmpty = emailValue.length === 0;
                      const isTouched = touched.email;
                      const hasError = errors.email;
                      
                      // Simple email validation regex
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      const isValidEmail = emailValue.length > 0 && emailRegex.test(emailValue);
                      const hasInvalidFormat = !isEmpty && !isValidEmail;
                      
                      return (
                        <FormItem className="relative">
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="h-10 sm:h-12"
                              placeholder="juan@example.com"
                            />
                          </FormControl>
                          <div className="h-5">
                            {isTouched && isEmpty && (
                              <div className="text-xs text-yellow-600">
                                <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                              </div>
                            )}
                            {!isEmpty && hasInvalidFormat && (
                              <div className="text-xs text-yellow-600">
                                <AlertCircle className="inline mr-1 h-4 w-4" />Please enter a valid email address
                              </div>
                            )}
                            {!isEmpty && isValidEmail && !hasError && (
                              <div className="text-xs text-green-600">
                                <Check className="inline mr-1 h-4 w-4" />Looks good
                              </div>
                            )}
                          </div>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => {
                      const phoneValue = field.value || "";
                      const phoneLength = phoneValue.length;
                      const isValidLength = phoneLength === 11;
                      const isEmpty = phoneLength === 0;
                      const isTouched = touched.phone;
                      const hasError = errors.phone;
                      
                      return (
                        <FormItem className="relative">
                          <FormLabel>
                            Phone Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              inputMode="numeric"
                              maxLength={11}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 11) {
                                  field.onChange(value);
                                }
                              }}
                              className="h-10 sm:h-12"
                              placeholder="09569552608"
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Must be exactly 11 digits (e.g., 09569552608)
                          </FormDescription>
                          <div className="h-5">
                            {isTouched && isEmpty && (
                              <div className="text-xs text-yellow-600">
                                <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                              </div>
                            )}
                            {isTouched && !isEmpty && !isValidLength && !hasError && (
                              <div className="text-xs text-yellow-600">
                                <AlertCircle className="inline mr-1 h-4 w-4" />
                                {phoneLength < 11 
                                  ? `Please enter ${11 - phoneLength} more digit${11 - phoneLength > 1 ? 's' : ''}`
                                  : "Phone number must be exactly 11 digits"}
                              </div>
                            )}
                            {isTouched && !isEmpty && isValidLength && !hasError && (
                              <div className="text-xs text-green-600">
                                <Check className="inline mr-1 h-4 w-4" />Looks good
                              </div>
                            )}
                            {!isTouched && !isEmpty && !isValidLength && (
                              <div className="text-xs text-yellow-600">
                                <AlertCircle className="inline mr-1 h-4 w-4" />
                                {phoneLength < 11 
                                  ? `Please enter ${11 - phoneLength} more digit${11 - phoneLength > 1 ? 's' : ''}`
                                  : "Phone number must be exactly 11 digits"}
                              </div>
                            )}
                          </div>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-12"
                            placeholder="Enter your city"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Region <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-12">
                              <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent 
                            position="popper"
                            sideOffset={4}
                            align="start"
                            className="max-h-[300px]"
                          >
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Complete Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={64}
                            className="h-10 sm:h-12"
                            placeholder="House/Unit number, Street, Barangay..."
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.address && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.address && field.value && !errors.address && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Product Information
                </h2>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mushroomTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Types of Mushrooms You Grow <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Select all that apply
                        </FormDescription>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-2">
                          {mushroomOptions.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="mushroomTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type}
                                    className="flex flex-row items-start space-x-2 sm:space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== type)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer text-sm">
                                      {type}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>

                        {/* If 'Other' selected, reveal an input */}
                        {mushroomTypesValue?.includes("Other") && (
                          <div className="mt-3">
                            <FormField
                              control={form.control}
                              name="mushroomOther"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Other - please specify</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Specify other mushroom type" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productionCapacity"
                    render={({ field }) => {
                      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        // Only allow numeric input
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      };

                      const handleBlur = () => {
                        // Append " kg" if there's a value and it doesn't already end with " kg"
                        const value = field.value || "";
                        const numericValue = value.replace(/\D/g, "");
                        if (numericValue && !value.endsWith(" kg")) {
                          field.onChange(numericValue + " kg");
                        }
                        field.onBlur();
                      };

                      const handleFocus = () => {
                        // Remove " kg" when focusing so user can edit the number
                        const value = field.value || "";
                        const numericValue = value.replace(/\s*kg\s*$/i, "").replace(/\D/g, "");
                        field.onChange(numericValue);
                      };

                      return (
                        <FormItem>
                          <FormLabel>
                            Monthly Production Capacity <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              onFocus={handleFocus}
                              inputMode="numeric"
                              className="h-10 sm:h-12"
                              placeholder="e.g., 500"
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Approximate monthly production in kilograms
                          </FormDescription>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="resize-none"
                            placeholder="List any certifications (e.g., Organic, GAP, HACCP)"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Banking Details */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Banking Details
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Bank Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={24}
                            className="h-10 sm:h-12"
                            placeholder="e.g., BDO, BPI, Metrobank"
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.bankName && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.bankName && field.value && !errors.bankName && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Account Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="numeric"
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            className="h-10 sm:h-12"
                            placeholder="Enter your account number"
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.accountNumber && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.accountNumber && field.value && !errors.accountNumber && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>
                          Account Holder Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={24}
                            className="h-10 sm:h-12"
                            placeholder="Name as it appears on your bank account"
                          />
                        </FormControl>
                        <div className="h-5">
                          {touched.accountName && !field.value && (
                            <div className="text-xs text-yellow-600">
                              <AlertCircle className="inline mr-1 h-4 w-4" />This field is required
                            </div>
                          )}
                          {touched.accountName && field.value && !errors.accountName && (
                            <div className="text-xs text-green-600">
                              <Check className="inline mr-1 h-4 w-4" />Looks good
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-6">
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
                        <FormLabel className="text-sm sm:text-base">
                          I agree to the{" "}
                          <Link href="/terms" className="text-accent hover:underline">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-accent hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 h-10 sm:h-12 px-6 sm:px-8 text-base font-semibold"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

