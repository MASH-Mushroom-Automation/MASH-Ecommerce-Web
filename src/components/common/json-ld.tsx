/**
 * JSON-LD Structured Data Component
 * 
 * Renders schema.org structured data as a <script type="application/ld+json"> tag.
 * Used by server components to embed SEO-friendly structured data in page <head>.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Generic JSON-LD component that renders structured data script tag.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generate Product JSON-LD structured data.
 */
export function productJsonLd(product: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  comparePrice?: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  rating?: number;
  reviewCount?: number;
  sku?: string;
  brand?: string;
  url?: string;
}): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "PHP",
      availability: `https://schema.org/${product.availability || "InStock"}`,
    },
  };

  if (product.description) data.description = product.description;
  if (product.image) data.image = product.image;
  if (product.sku) data.sku = product.sku;
  if (product.url) data.url = product.url;

  if (product.brand) {
    data.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  if (product.rating && product.reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return data;
}

/**
 * Generate BreadcrumbList JSON-LD structured data.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization JSON-LD structured data for MASH Marketplace.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MASH Marketplace",
    url: "https://www.mashmarket.app",
    logo: "https://www.mashmarket.app/mash-logo.png",
    sameAs: [
      "https://www.facebook.com/MASHMarketplace",
      "https://www.instagram.com/mashmarketplace",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Filipino"],
    },
  };
}
