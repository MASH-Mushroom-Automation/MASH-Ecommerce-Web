/**
 * SanityHeroCarousel Component
 * 
 * Hero carousel component connected to Sanity CMS.
 * Features:
 * - Real-time updates from Sanity
 * - Auto-rotating slides (5 seconds)
 * - Navigation dots
 * - CTA buttons
 * - Optional background images
 * - Gradient overlay
 */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useSanityHero } from "@/hooks/useSanityHero";
import Autoplay from "embla-carousel-autoplay";

export const SanityHeroCarousel: React.FC = () => {
  const { slides, loading, error } = useSanityHero();
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto-play plugin
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) return;

    // Track carousel changes
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  // Loading state
  if (loading) {
    return (
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-primary/30 mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground animate-pulse">
                Loading hero carousel...
              </p>
              <p className="text-sm text-muted-foreground">
                Just a moment
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading hero carousel</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  // No slides - show default message
  if (!slides || slides.length === 0) {
    return (
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-medium to-primary-light flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Welcome to MASH
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Premium mushrooms from local organic farms
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-primary-dark hover:bg-gray-100">
                  Shop Now
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm opacity-80">
                ℹ️ To customize this hero section, add slides in{" "}
                <a 
                  href="https://mash-ecommerce.sanity.studio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  Sanity Studio
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get button variant for shadcn/ui
  const getButtonVariant = (style?: string) => {
    switch (style) {
      case 'secondary':
        return 'secondary';
      case 'ghost':
        return 'ghost';
      case 'primary':
      default:
        return 'default';
    }
  };

  // Single slide - no carousel
  if (slides.length === 1) {
    const slide = slides[0];
    return (
      <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Background Image */}
        {slide.image ? (
          <>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-medium to-primary-light" />
        )}

        {/* Content - Centered */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                  {slide.subtitle}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={slide.buttonLink}>
                  <Button
                    size="lg"
                    variant={getButtonVariant(slide.buttonStyle)}
                    className="px-8 py-6 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple slides - show carousel
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        plugins={[plugin.current]}
        setApi={setApi}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full -ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={`slide-${index}`} className="pl-0 basis-full">
              <div className="relative w-full h-full">
                {/* Background Image or Gradient */}
                {slide.image ? (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-10" />
                  </>
                ) : (
                  <div 
                    className="absolute inset-0 bg-gradient-to-br"
                    style={{
                      backgroundImage: `linear-gradient(135deg, 
                        rgba(30, 57, 42, 0.95) 0%, 
                        rgba(106, 153, 78, 0.9) 50%, 
                        rgba(167, 201, 87, 0.85) 100%
                      )`
                    }}
                  />
                )}

                {/* Content - Centered */}
                <div className="relative z-20 h-full flex items-center justify-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <Link href={slide.buttonLink}>
                          <Button
                            size="lg"
                            variant={getButtonVariant(slide.buttonStyle)}
                            className="px-8 py-6 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          >
                            {slide.buttonText}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows (desktop only) */}
        <CarouselPrevious className="hidden md:flex left-4 bg-white/80 text-foreground hover:bg-white" />
        <CarouselNext className="hidden md:flex right-4 bg-white/80 text-foreground hover:bg-white" />
      </Carousel>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/30 backdrop-blur-sm px-4 py-3 rounded-full">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white w-10 shadow-lg"
                : "bg-white/50 w-3 hover:bg-white/80 hover:w-6"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={currentSlide === index}
          />
        ))}
      </div>
    </section>
  );
};
