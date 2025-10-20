"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, Users, TrendingUp, CheckCircle2 } from "lucide-react";

const schema = z.object({
  farmName: z.string().min(2, "Farm name is required"),
  ownerName: z.string().min(2, "Your name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().min(4, "Location is required"),
  experience: z.string(),
  production: z.string(),
  agree: z
    .boolean()
    .refine((val) => val === true, "You must agree to continue"),
});

type FormValues = z.infer<typeof schema>;

export default function SellWithUsPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      farmName: "",
      ownerName: "",
      email: "",
      phone: "",
      location: "",
      experience: "",
      production: "",
      agree: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    alert("Application submitted! We'll be in touch soon.");
  };

  return (
    <div className="flex flex-col gap-12 px-4 py-10 md:px-8 lg:px-16">
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Become a MASH Grower
        </h1>
        <p className="text-lg text-muted-foreground">
          Join our network of trusted mushroom growers and reach customers
          across the Philippines
        </p>
      </section>

      {/* Benefits */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Store className="size-8 text-primary mb-2" />
            <CardTitle>Direct market access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sell directly to customers without middlemen. Set your own prices
            and manage your inventory.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="size-8 text-primary mb-2" />
            <CardTitle>Growing customer base</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Access thousands of customers who value fresh, locally-grown
            produce.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="size-8 text-primary mb-2" />
            <CardTitle>Support & tools</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Get logistics support, payment processing, and tools to manage your
            sales efficiently.
          </CardContent>
        </Card>
      </section>

      {/* Requirements */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Requirements to join</CardTitle>
          <CardDescription>What we look for in partner growers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Registered business or individual grower with valid documentation",
            "Consistent production capacity for regular supply",
            "Quality control and food safety practices",
            "Ability to fulfill orders within 24-48 hours",
            "Located within delivery zones (Metro Manila and nearby provinces)",
          ].map((req, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{req}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Application form</CardTitle>
          <CardDescription>
            Tell us about your farm and production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="farmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm / Business name</FormLabel>
                    <FormControl>
                      <Input placeholder="Manila Mushroom Farm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Dela Cruz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+63 917 123 4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Quezon City, Metro Manila"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>City and province</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Growing experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience with mushroom cultivation..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="production"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production capacity</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your current production volume and varieties..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agree"
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
                        I confirm that all information provided is accurate and
                        I agree to MASH&apos;s seller terms
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg">
                Submit application
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
