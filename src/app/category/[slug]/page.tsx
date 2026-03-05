import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity/client";
import { categoryBySlugQuery } from "@/lib/sanity/queries";
import CategoryPageClient from "./CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const category = await sanityClient.fetch(categoryBySlugQuery, { slug });
  return category;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    return {
      title: "Category Not Found | MASH Market",
    };
  }

  const title = `${category.name} | MASH Market`;
  const description = category.description
    || `Browse ${category.name} products at MASH Market. Fresh mushrooms and growing supplies delivered to your door.`;
  const productCount = category.products?.length || 0;

  return {
    title,
    description: `${description} ${productCount} products available.`,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.mashmarket.app/category/${slug}`,
      siteName: "MASH Market",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://www.mashmarket.app/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  const categoryData = {
    name: category.name,
    slug: category.slug?.current || slug,
    description: category.description || undefined,
    image: category.products?.[0]?.mainImage || undefined,
    productCount: category.products?.length || 0,
  };

  return <CategoryPageClient category={categoryData} slug={slug} />;
}
