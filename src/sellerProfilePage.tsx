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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const schema = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  tagline: z.string().max(100, "Tagline must be under 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(4, "Location is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
});

type FormValues = z.infer<typeof schema>;

export default function SellerProfilePage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopName: "Manila Mushroom Farm",
      tagline: "Premium oyster mushrooms since 2018",
      description:
        "Family-owned farm specializing in cultivating premium oyster mushrooms using sustainable practices. Our climate-controlled facilities ensure year-round fresh harvests.",
      location: "Quezon City, Metro Manila",
      phone: "+63 917 123 4567",
      email: "contact@manilamushrooms.ph",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    alert("Profile updated successfully!");
  };

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Shop Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your public-facing shop information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop branding</CardTitle>
          <CardDescription>Logo and banner images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="size-24">
              <AvatarFallback className="text-2xl">MM</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm font-medium">Shop logo</p>
              <Button variant="outline" size="sm">
                Upload new logo
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Cover banner</p>
            <div className="h-32 rounded-lg bg-muted flex items-center justify-center">
              <Button variant="outline">Upload banner</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shop information</CardTitle>
          <CardDescription>Details visible to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="A short catchy phrase" {...field} />
                    </FormControl>
                    <FormDescription>
                      Brief description shown under your shop name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About your farm</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your farm, practices, and specialty..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
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
                      <FormLabel>Contact email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
