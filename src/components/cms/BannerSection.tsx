/**
 * BannerSection Component
 * Phase 7: Displays promotional banners from Sanity CMS
 * 
 * Renders banners with responsive images, CTA buttons,
 * and supports scheduling/positioning.
 * 
 * @file src/components/cms/BannerSection.tsx
 * @created November 27, 2025
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  useBannersByPosition,
  TransformedBanner,
  getBannerHeightClass,
  getTextColorClass,
  getTextAlignmentClass,
  getButtonVariant,
  getTimeRemaining,
  BannerPosition,
} from '@/hooks/useSanityBanners';
import { Copy, Check } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PROMO CODE COPY COMPONENT
// ═══════════════════════════════════════════════════════════════

interface PromoCodeProps {
  code: string;
  textColor?: string;
}

const PromoCode: React.FC<PromoCodeProps> = ({ code, textColor = 'white' }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg 
        bg-white/20 backdrop-blur-sm border border-white/30
        hover:bg-white/30 transition-all
        ${textColor === 'black' ? 'bg-black/10 border-black/20 hover:bg-black/20' : ''}
      `}
    >
      <span className="font-mono font-bold tracking-wider">{code}</span>
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// SINGLE BANNER COMPONENT
// ═══════════════════════════════════════════════════════════════

interface SingleBannerProps {
  banner: TransformedBanner;
}

export const SingleBanner: React.FC<SingleBannerProps> = ({ banner }) => {
  const heightClass = getBannerHeightClass(banner.bannerHeight);
  const textColorClass = getTextColorClass(banner.textColor);
  const alignmentClass = getTextAlignmentClass(banner.textAlignment);
  const timeRemaining = getTimeRemaining(banner.endDate);
  
  return (
    <div 
      className={`
        relative w-full overflow-hidden rounded-xl
        ${heightClass}
      `}
      style={{ 
        backgroundColor: banner.backgroundColor || '#1E392A' 
      }}
    >
      {/* Background Image */}
      {banner.desktopImage && (
        <>
          {/* Desktop Image */}
          <Image
            src={banner.desktopImage}
            alt={banner.desktopImageAlt || banner.headline || banner.title}
            fill
            className="object-cover hidden md:block"
            priority
          />
          {/* Mobile Image (fallback to desktop) */}
          <Image
            src={banner.mobileImage || banner.desktopImage}
            alt={banner.mobileImageAlt || banner.desktopImageAlt || banner.headline || banner.title}
            fill
            className="object-cover md:hidden"
            priority
          />
        </>
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: banner.overlayOpacity }}
      />
      
      {/* Content */}
      <div className={`
        relative z-10 h-full flex flex-col justify-center
        px-6 md:px-12 lg:px-16 py-8
        ${textColorClass}
        ${alignmentClass}
      `}>
        {/* Time Remaining Badge */}
        {timeRemaining && (
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium self-center md:self-auto">
            ⏰ {timeRemaining}
          </span>
        )}
        
        {/* Headline */}
        {banner.headline && (
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 max-w-2xl">
            {banner.headline}
          </h2>
        )}
        
        {/* Subheadline */}
        {banner.subheadline && (
          <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-4 max-w-xl">
            {banner.subheadline}
          </p>
        )}
        
        {/* Description */}
        {banner.description && (
          <p className="text-sm md:text-base opacity-80 mb-6 max-w-lg">
            {banner.description}
          </p>
        )}
        
        {/* Promo Code */}
        {banner.promoCode && (
          <div className="mb-6">
            <p className="text-sm opacity-75 mb-2">Use code:</p>
            <PromoCode code={banner.promoCode} textColor={banner.textColor} />
          </div>
        )}
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          {banner.buttonText && banner.buttonLink && (
            <Link href={banner.buttonLink}>
              <Button 
                variant={getButtonVariant(banner.buttonStyle)}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                {banner.buttonText}
              </Button>
            </Link>
          )}
          
          {banner.secondaryButtonText && banner.secondaryButtonLink && (
            <Link href={banner.secondaryButtonLink}>
              <Button 
                variant="outline"
                size="lg"
                className={`
                  px-8 py-3 text-lg font-semibold
                  ${banner.textColor === 'white' 
                    ? 'border-white text-white hover:bg-white/20' 
                    : 'border-foreground text-foreground hover:bg-foreground/10'
                  }
                `}
              >
                {banner.secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BANNER SECTION (Multiple Banners)
// ═══════════════════════════════════════════════════════════════

interface BannerSectionProps {
  position: BannerPosition;
  className?: string;
  maxBanners?: number;
}

export const BannerSection: React.FC<BannerSectionProps> = ({
  position,
  className = '',
  maxBanners = 1,
}) => {
  const { banners, loading, error } = useBannersByPosition(position);
  
  // Don't render anything while loading or if no banners
  if (loading || error || !banners || banners.length === 0) {
    return null;
  }
  
  // Take only the requested number of banners
  const displayBanners = banners.slice(0, maxBanners);
  
  return (
    <section className={`py-6 md:py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {displayBanners.length === 1 ? (
          <SingleBanner banner={displayBanners[0]} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayBanners.map((banner) => (
              <SingleBanner key={banner.id} banner={banner} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// HOMEPAGE BANNERS (Position-Specific Exports)
// ═══════════════════════════════════════════════════════════════

export const HomepageTopBanner: React.FC = () => (
  <BannerSection position="homepage-top" />
);

export const HomepageMiddleBanner: React.FC = () => (
  <BannerSection position="homepage-middle" />
);

export const HomepageBottomBanner: React.FC = () => (
  <BannerSection position="homepage-bottom" />
);

export const ShopTopBanner: React.FC = () => (
  <BannerSection position="shop-top" />
);

export const ShopSidebarBanner: React.FC = () => (
  <BannerSection position="shop-sidebar" className="py-0" />
);

export const ProductBottomBanner: React.FC = () => (
  <BannerSection position="product-bottom" />
);

export const CartTopBanner: React.FC = () => (
  <BannerSection position="cart-top" />
);

export const CheckoutBottomBanner: React.FC = () => (
  <BannerSection position="checkout-bottom" />
);

// ═══════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR
// ═══════════════════════════════════════════════════════════════

export const AnnouncementBar: React.FC = () => {
  const { banners, loading } = useBannersByPosition('announcement');
  const [dismissed, setDismissed] = React.useState(false);
  
  if (loading || !banners || banners.length === 0 || dismissed) {
    return null;
  }
  
  const banner = banners[0];
  
  return (
    <div 
      className="relative w-full py-2 px-4 text-center"
      style={{ 
        backgroundColor: banner.backgroundColor || '#1E392A',
        color: banner.textColor === 'black' ? '#1a1a1a' : '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
        {banner.headline && (
          <span className="font-medium">{banner.headline}</span>
        )}
        
        {banner.promoCode && (
          <span className="font-mono font-bold px-2 py-0.5 bg-white/20 rounded">
            {banner.promoCode}
          </span>
        )}
        
        {banner.buttonText && banner.buttonLink && (
          <Link 
            href={banner.buttonLink}
            className="underline hover:no-underline font-semibold"
          >
            {banner.buttonText}
          </Link>
        )}
      </div>
      
      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
        aria-label="Dismiss announcement"
      >
        ✕
      </button>
    </div>
  );
};

export default BannerSection;
