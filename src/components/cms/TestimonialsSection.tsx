/**
 * TestimonialsSection Component
 * Phase 7: Displays customer testimonials from Sanity CMS
 * 
 * Renders testimonials in a carousel or grid format with ratings,
 * customer info, and optional product references.
 * 
 * @file src/components/cms/TestimonialsSection.tsx
 * @created November 27, 2025
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useHomepageTestimonials, 
  TransformedTestimonial,
  formatTestimonialDate,
} from '@/hooks/useSanityTestimonials';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, MapPin } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// STAR RATING COMPONENT
// ═══════════════════════════════════════════════════════════════

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TESTIMONIAL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

interface TestimonialCardProps {
  testimonial: TransformedTestimonial;
  variant?: 'default' | 'featured' | 'compact';
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  variant = 'default' 
}) => {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';
  
  return (
    <Card className={`
      h-full overflow-hidden transition-all duration-300 
      ${isFeatured ? 'border-primary shadow-lg' : 'hover:shadow-md'}
      ${isCompact ? 'p-4' : ''}
    `}>
      <CardContent className={`${isCompact ? 'p-0' : 'p-6'} flex flex-col h-full`}>
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote className={`
            ${isCompact ? 'w-6 h-6' : 'w-8 h-8'} 
            text-primary/20 rotate-180
          `} />
        </div>
        
        {/* Headline */}
        {testimonial.headline && (
          <h4 className={`
            font-semibold text-foreground mb-2
            ${isCompact ? 'text-sm' : 'text-lg'}
          `}>
            &ldquo;{testimonial.headline}&rdquo;
          </h4>
        )}
        
        {/* Quote */}
        <p className={`
          text-muted-foreground flex-grow
          ${isCompact ? 'text-sm line-clamp-3' : 'text-base line-clamp-4'}
        `}>
          {testimonial.quote}
        </p>
        
        {/* Rating */}
        <div className="my-4">
          <StarRating rating={testimonial.rating} size={isCompact ? 'sm' : 'md'} />
        </div>
        
        {/* Customer Info */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
          {/* Customer Image */}
          <div className="flex-shrink-0">
            {testimonial.customerImage ? (
              <Image
                src={testimonial.customerImage}
                alt={testimonial.customerName}
                width={isCompact ? 40 : 48}
                height={isCompact ? 40 : 48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className={`
                ${isCompact ? 'w-10 h-10' : 'w-12 h-12'} 
                rounded-full bg-primary/10 flex items-center justify-center
              `}>
                <span className="text-primary font-semibold text-lg">
                  {testimonial.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Customer Details */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <span className={`
                font-medium text-foreground truncate
                ${isCompact ? 'text-sm' : 'text-base'}
              `}>
                {testimonial.customerName}
              </span>
              {testimonial.isVerified && (
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
            {testimonial.customerTitle && (
              <p className="text-xs text-muted-foreground truncate">
                {testimonial.customerTitle}
              </p>
            )}
            {testimonial.location && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {testimonial.location}
              </p>
            )}
          </div>
        </div>
        
        {/* Product Reference */}
        {testimonial.product && (
          <Link 
            href={`/product/${testimonial.product.slug}`}
            className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            {testimonial.product.image && (
              <Image
                src={testimonial.product.image}
                alt={testimonial.product.name}
                width={32}
                height={32}
                className="rounded object-cover"
              />
            )}
            <span className="text-xs text-muted-foreground truncate">
              Purchased: {testimonial.product.name}
            </span>
          </Link>
        )}
        
        {/* Date */}
        {testimonial.date && (
          <p className="text-xs text-muted-foreground mt-2">
            {formatTestimonialDate(testimonial.date)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS CAROUSEL
// ═══════════════════════════════════════════════════════════════

interface TestimonialsCarouselProps {
  testimonials: TransformedTestimonial[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );
  
  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-md hidden md:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-md hidden md:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTestimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            variant={testimonial.isFeatured ? 'featured' : 'default'}
          />
        ))}
      </div>
      
      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonials page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN TESTIMONIALS SECTION
// ═══════════════════════════════════════════════════════════════

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  layout?: 'carousel' | 'grid';
  showAllLink?: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title = 'What Our Customers Say',
  subtitle = 'Real reviews from our happy mushroom lovers',
  limit = 6,
  layout = 'carousel',
  showAllLink = true,
}) => {
  const { testimonials, loading, error } = useHomepageTestimonials(limit);
  
  // Loading State
  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center justify-center min-h-[250px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }
  
  // Error State - Silently hide section
  if (error || !testimonials || testimonials.length === 0) {
    return null;
  }
  
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border border-primary/15 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="mt-5 mx-auto w-10 h-0.5 rounded-full bg-primary/30" />
        </div>
        
        {/* Testimonials */}
        {layout === 'carousel' ? (
          <TestimonialsCarousel testimonials={testimonials} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                variant={testimonial.isFeatured ? 'featured' : 'default'}
              />
            ))}
          </div>
        )}
        
        {/* View All Link */}
        {showAllLink && (
          <div className="text-center mt-10 sm:mt-14">
            <Link href="/testimonials">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 h-auto text-base font-semibold rounded-lg border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
              >
                View All Reviews
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPACT TESTIMONIALS (for sidebars, product pages)
// ═══════════════════════════════════════════════════════════════

interface CompactTestimonialsProps {
  testimonials: TransformedTestimonial[];
  title?: string;
}

export const CompactTestimonials: React.FC<CompactTestimonialsProps> = ({
  testimonials,
  title = 'Customer Reviews',
}) => {
  if (!testimonials || testimonials.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">
        {testimonials.slice(0, 3).map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
