"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  address: z.string().min(4, "Address is required"),
  city: z.string().min(2),
  postal: z.string().min(4),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postal: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // For demo only
    alert(`Order placed for ${values.name}`);
  };

  const subtotal: number = 79 + 39;
  const shipping: number = 0;
  const total: number = subtotal + shipping;

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping details</CardTitle>
            <CardDescription>We use this to deliver your order</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alex Doe" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="alex@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Market St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal code</FormLabel>
                        <FormControl>
                          <Input placeholder="94103" {...field} />
                        </FormControl>
                        <FormDescription>ZIP or postal code</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="min-w-40">
                    Place order
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>Review your cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Backpack</div>
              <div className="font-medium">$79.00</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Ceramic Mug</div>
              <div className="font-medium">$39.00</div>
            </div>
            <div className="border-t pt-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Checkout</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
