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
    <section className="bg-primary text-primary-foreground py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Get Fresh Deals Delivered to Your Inbox
        </h2>
        <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">
          Join our newsletter for exclusive offers and mushroom tips
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-all"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-6 py-3 font-semibold rounded-lg"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-primary-foreground/60">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
