// CMS-based Contact Page Component
// src/components/cms/ContactSection.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Facebook, MessageCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ContactInfo, BusinessHours, SocialLink } from "@/hooks/useCMS";

interface CMSContactSectionProps {
  contactInfo: ContactInfo[];
  businessHours: BusinessHours[];
  socialLinks: SocialLink[];
  loading?: boolean;
  error?: string | null;
}

const ContactSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  subject: z.enum([
    "order",
    "delivery",
    "product",
    "refund",
    "partnership",
    "other",
  ]),
  message: z
    .string()
    .min(10, "Please provide more details (min 10 characters)"),
});

type ContactForm = z.infer<typeof ContactSchema>;

export const CMSContactSection: React.FC<CMSContactSectionProps> = ({
  contactInfo,
  businessHours,
  socialLinks,
  loading,
  error
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: ContactForm) => {
    void values;
    try {
      // TODO: Implement actual form submission
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Message sent", {
        description: "We'll get back to you within 24 hours.",
      });
      reset();
    } catch {
      toast.error("Failed to send message", {
        description: "Please try again later.",
      });
    }
  };

  // Icon mapping for contact info
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-8 w-8" />;
      case 'email':
        return <Mail className="h-8 w-8" />;
      case 'address':
        return <MapPin className="h-8 w-8" />;
      default:
        return <Mail className="h-8 w-8" />;
    }
  };

  // Icon mapping for social links
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'twitter':
        return <MessageCircle className="h-5 w-5" />;
      case 'instagram':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>

          {/* Contact Cards Skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>

          {/* Form Skeleton */}
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you. Send
            us a message and we&apos;ll respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Contact Info Cards */}
          {contactInfo
            .filter(info => info.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((info) => (
              <Card key={info.id}>
                <CardContent className="p-6 text-center">
                  <div className="bg-[#6A994E] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {getContactIcon(info.type)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">{info.description}</p>
                  <p className="text-[#1E392A] font-semibold">{info.value}</p>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#1E392A]">
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Juan Dela Cruz"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order Inquiry</SelectItem>
                          <SelectItem value="delivery">
                            Delivery Issue
                          </SelectItem>
                          <SelectItem value="product">
                            Product Question
                          </SelectItem>
                          <SelectItem value="refund">Refund Request</SelectItem>
                          <SelectItem value="partnership">
                            Partnership/Grower
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6A994E] hover:bg-[#5A8A3E]"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E392A]">
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessHours
                  .filter(hours => hours.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((hours) => (
                    <div key={hours.id} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">
                        {hours.dayOfWeek}
                      </span>
                      <span className={`font-semibold ${hours.isClosed ? 'text-red-600' : 'text-gray-900'}`}>
                        {hours.isClosed ? 'Closed' : `${hours.openTime} - ${hours.closeTime}`}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E392A]">
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Stay updated with our latest products, recipes, and growing
                  tips on social media.
                </p>
                <div className="flex gap-4">
                  {socialLinks
                    .filter(link => link.isActive)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((link) => (
                      <Button
                        key={link.id}
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        {getSocialIcon(link.platform)}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Partnership CTA */}
            <Card className="bg-[#1E392A] text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Interested in Becoming a Grower?
                </h3>
                <p className="text-gray-200 text-sm mb-4">
                  Join our network of mushroom growers and reach more customers
                  through MASH.
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-white text-[#1E392A] hover:bg-gray-100"
                >
                  Learn About Partnership
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
