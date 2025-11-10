// CMS-based Hero Section Component
// src/components/cms/HeroSection.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { HeroSection as HeroSectionType } from "@/hooks/useCMS";

interface CMSHeroSectionProps {
  data: HeroSectionType;
}

export const CMSHeroSection: React.FC<CMSHeroSectionProps> = ({ data }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    // Track carousel changes
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'ghost';
      default:
        return 'default';
    }
  };

  const getButtonClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-primary-foreground';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/90 text-secondary-foreground';
      case 'outline':
        return 'border-2 border-primary-foreground text-foreground hover:bg-primary-foreground hover:text-primary';
      case 'ghost':
        return 'text-primary-foreground hover:bg-primary-foreground/10';
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground';
    }
  };

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        className="absolute inset-0 w-full h-full"
      >
        <CarouselContent className="h-full -ml-0">
          {data.backgroundImages.map((image, index) => (
            <CarouselItem key={index} className="pl-0 basis-full">
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
                <Image
                  src={image}
                  alt={`Hero Background ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 pointer-events-none z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            {data.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={data.primaryButton.url}>
              <Button
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${getButtonClasses(data.primaryButton.variant)}`}
                variant={getButtonVariant(data.primaryButton.variant)}
              >
                {data.primaryButton.text}
              </Button>
            </Link>
            <Link href={data.secondaryButton.url}>
              <Button
                variant={getButtonVariant(data.secondaryButton.variant)}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 h-auto text-base sm:text-lg rounded-lg border-2 border-white font-semibold transition-all duration-200 transform hover:scale-105 ${getButtonClasses(data.secondaryButton.variant)}`}
              >
                {data.secondaryButton.text}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
