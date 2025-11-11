import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Users,
  Package,
  ChevronRight,
} from "lucide-react";

interface HeroSectionProps {
  onContinue: () => void;
}

export function HeroSection({ onContinue }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                Start Your Mushroom Business Today
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/80 mb-8">
                Join hundreds of successful growers on MASH Market. Reach more
                customers, grow your business, and be part of the sustainable
                food movement.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base">No listing fees for your first month</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base">Access to thousands of customers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base">Marketing and business support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base">Secure payment processing</span>
                </div>
              </div>
              <Button
                onClick={onContinue}
                className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0"></div>
                <Image
                  src="/Logo  v6 - Market.png"
                  alt="MASH Market - Start Selling"
                  width={600}
                  height={400}
                  className="rounded-2xl object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started as a seller on MASH Market is easy. Follow these
              simple steps to begin your journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                Apply Online
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fill out our simple application form with your business details
                and product information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                Get Verified
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Our team will review your application and verify your business
                within 2-3 business days.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                Start Selling
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Once approved, list your products and start receiving orders
                from customers nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Sell on MASH Market?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Grow Your Sales</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Reach thousands of customers looking for fresh, quality mushrooms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Secure Payments</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Get paid on time with our secure payment processing system.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Marketing Support</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                We help promote your products through our marketing channels.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Easy Management</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Manage your inventory and orders with our user-friendly dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-accent-foreground/90 mb-8">
            Join the MASH Market community today and take your mushroom business
            to the next level.
          </p>
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-background text-primary hover:bg-background/90 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold shadow-xl"
          >
            Start Application
            <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
