import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { ProductDetailClient } from "./ProductDetailClient";
import { JsonLd, productJsonLd, breadcrumbJsonLd } from "@/components/common/json-ld";

type Props = { params: Promise<{ slug: string }> };

// Lightweight query for metadata only (no heavy fields)
const metadataQuery = `*[_type == "product" && slug.current == $slug][0] {
  name,
  description,
  price,
  compareAtPrice,
  stock,
  unit,
  "mainImage": coalesce(mainImage.asset->url, image.asset->url),
  "growerName": grower->name,
  "categoryName": category->name
}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await sanityClient.fetch(metadataQuery, { slug });

    if (!product) {
      return {
        title: "Product Not Found | MASH Marketplace",
        description: "The product you are looking for could not be found.",
      };
    }

    const title = `${product.name} | MASH Marketplace`;
    const description =
      product.description?.slice(0, 160) ||
      `Buy ${product.name} from ${product.growerName || "MASH Marketplace"}. Fresh, locally-sourced produce delivered to your door.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://www.mashmarket.app/product/${slug}`,
        siteName: "MASH Marketplace",
        ...(product.mainImage && { images: [{ url: product.mainImage }] }),
      },
      alternates: {
        canonical: `https://www.mashmarket.app/product/${slug}`,
      },
    };
  } catch {
    return {
      title: "MASH Marketplace",
      description: "Browse fresh produce and organic goods at MASH Marketplace.",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch minimal product data for JSON-LD (server-side)
  let jsonLdData: Record<string, unknown> | null = null;
  let breadcrumbData: Record<string, unknown> | null = null;

  try {
    const product = await sanityClient.fetch(metadataQuery, { slug });

    if (product) {
      jsonLdData = productJsonLd({
        name: product.name,
        description: product.description,
        image: product.mainImage,
        price: product.price,
        currency: "PHP",
        availability: product.stock > 0 ? "InStock" : "OutOfStock",
        brand: product.growerName,
        url: `https://www.mashmarket.app/product/${slug}`,
      });

      breadcrumbData = breadcrumbJsonLd([
        { name: "Home", url: "https://www.mashmarket.app" },
        { name: "Shop", url: "https://www.mashmarket.app/shop" },
        ...(product.categoryName
          ? [
              {
                name: product.categoryName,
                url: `https://www.mashmarket.app/shop?category=${encodeURIComponent(product.categoryName)}`,
              },
            ]
          : []),
        {
          name: product.name,
          url: `https://www.mashmarket.app/product/${slug}`,
        },
      ]);
    }
  } catch {
    // Silently fail - page still renders via client component
  }

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      {breadcrumbData && <JsonLd data={breadcrumbData} />}
      <ProductDetailClient slug={slug} />
    </>
  );
}
