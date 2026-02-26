"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { Mail } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");

/**
 * Newsletter signup section for the homepage.
 * Stores subscriber email in Firestore via API route.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      // Store in Firestore via dynamic import to keep bundle lean
      const { getFirestore, collection, addDoc, query, where, getDocs } = await import("firebase/firestore");
      const { app } = await import("@/lib/firebase/config");
      const db = getFirestore(app);

      // Check for duplicate
      const q = query(
        collection(db, "newsletter_subscribers"),
        where("email", "==", email.toLowerCase())
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        toast.success("You are already subscribed!");
        setEmail("");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email.toLowerCase(),
        subscribedAt: new Date().toISOString(),
        source: "homepage",
      });

      toast.success("Thanks for subscribing!");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground py-16 sm:py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          Get Fresh Deals Delivered to Your Inbox
        </h2>
        <p className="text-primary-foreground/75 mb-8 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Join our newsletter for exclusive offers, growing tips, and first access to new products.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all backdrop-blur-sm"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-primary hover:bg-white/90 px-8 py-3.5 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <p className="mt-5 text-xs text-primary-foreground/50">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
