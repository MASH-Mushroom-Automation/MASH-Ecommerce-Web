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
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  ChevronRight,
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { SellerApplicationForm } from "../page";

interface ApplicationFormProps {
  form: UseFormReturn<SellerApplicationForm>;
  onSubmit: (data: SellerApplicationForm) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
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

export function ApplicationForm({
  form,
  onSubmit,
  onBack,
  isSubmitting = false,
}: ApplicationFormProps) {
  // Use external isSubmitting if provided, otherwise fall back to form state
  const isFormSubmitting = isSubmitting || form.formState.isSubmitting;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Seller Application Form
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Please fill in all required fields to complete your application.
              We'll review your information and get back to you within 2-3
              business days.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Business Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Business Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-12"
                            placeholder="Enter your business name"
                          />
                        </FormControl>
                        <FormMessage />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-12">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">
                              Individual/Sole Proprietor
                            </SelectItem>
                            <SelectItem value="company">
                              Company/Corporation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Tax ID Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-12"
                            placeholder="Enter your tax ID (if applicable)"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Providing a tax ID can speed up the verification
                          process
                        </FormDescription>
                        <FormMessage />
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
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-12"
                            placeholder="Juan Dela Cruz"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            className="h-10 sm:h-12"
                            placeholder="juan@example.com"
                            inputMode="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="h-10 sm:h-12"
                            placeholder="+63 956 955 2608"
                            inputMode="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          Region <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-12">
                              <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          Complete Address{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="resize-none"
                            placeholder="House/Unit number, Street, Barangay..."
                          />
                        </FormControl>
                        <FormMessage />
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
                          Types of Mushrooms You Grow{" "}
                          <span className="text-red-500">*</span>
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
                                            ? field.onChange([
                                                ...field.value,
                                                type,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== type
                                                )
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productionCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Monthly Production Capacity{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-12"
                            placeholder="e.g., 500kg per month"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Approximate monthly production in kilograms
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Document Upload Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 pb-2 border-b">
                  Required Documents
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Please upload clear copies of the following documents.
                  Accepted formats: JPG, PNG, WebP, or PDF (max 5MB each).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Valid ID Upload */}
                  <FormField
                    control={form.control}
                    name="validIdFile"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="border rounded-lg p-4 bg-background">
                        <FormLabel className="font-semibold text-foreground">
                          Valid ID of Business Owner
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="hidden"
                              id="validIdFile"
                              {...field}
                            />
                            <label
                              htmlFor="validIdFile"
                              className="flex flex-col items-center justify-center w-full h-28 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            >
                              {value ? (
                                <>
                                  {(value as File).type.startsWith("image/") ? (
                                    <img
                                      src={URL.createObjectURL(value as File)}
                                      alt="Preview"
                                      className="h-20 w-auto rounded object-contain"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <FileText className="w-8 h-8 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        PDF
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <FileText className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Document
                                  </span>
                                </div>
                              )}
                            </label>
                            {value && (
                              <button
                                type="button"
                                onClick={() => onChange(undefined)}
                                className="mt-2 text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* BIR Certificate Upload */}
                  <FormField
                    control={form.control}
                    name="birCertificateFile"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="border rounded-lg p-4 bg-background">
                        <FormLabel className="font-semibold text-foreground">
                          BIR Certificate
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="hidden"
                              id="birCertificateFile"
                              {...field}
                            />
                            <label
                              htmlFor="birCertificateFile"
                              className="flex flex-col items-center justify-center w-full h-28 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            >
                              {value ? (
                                <>
                                  {(value as File).type.startsWith("image/") ? (
                                    <img
                                      src={URL.createObjectURL(value as File)}
                                      alt="Preview"
                                      className="h-20 w-auto rounded object-contain"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <FileText className="w-8 h-8 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        PDF
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <FileText className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    PDF
                                  </span>
                                </div>
                              )}
                            </label>
                            {value && (
                              <button
                                type="button"
                                onClick={() => onChange(undefined)}
                                className="mt-2 text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Certificate Upload */}
                  <FormField
                    control={form.control}
                    name="businessCertificateFile"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="border rounded-lg p-4 bg-background">
                        <FormLabel className="font-semibold text-foreground">
                          Business Certificate
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="hidden"
                              id="businessCertificateFile"
                              {...field}
                            />
                            <label
                              htmlFor="businessCertificateFile"
                              className="flex flex-col items-center justify-center w-full h-28 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            >
                              {value ? (
                                <>
                                  {(value as File).type.startsWith("image/") ? (
                                    <img
                                      src={URL.createObjectURL(value as File)}
                                      alt="Preview"
                                      className="h-20 w-auto rounded object-contain"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <FileText className="w-8 h-8 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        PDF
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <FileText className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    PDF
                                  </span>
                                </div>
                              )}
                            </label>
                            {value && (
                              <button
                                type="button"
                                onClick={() => onChange(undefined)}
                                className="mt-2 text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Information - Coming Soon */}
              <div className="bg-muted/50 border border-border rounded-lg p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                  Payment Information
                </h2>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Payment processing will be set up after your seller
                    application is approved.
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-foreground">
                      Coming Soon:
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      PayMongo
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      GCash
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      Maya
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    💡 You&apos;ll be able to connect your preferred payment
                    method once approved.
                  </p>
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
                          <Link
                            href="/terms"
                            className="text-accent hover:underline"
                          >
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-accent hover:underline"
                          >
                            Privacy Policy
                          </Link>{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormMessage />
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
                  disabled={isFormSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 h-10 sm:h-12 px-6 sm:px-8 text-base font-semibold"
                  disabled={isFormSubmitting}
                >
                  {isFormSubmitting ? (
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
