import { MetadataRoute } from 'next';
import { sanityClient } from '@/lib/sanity/client';

const BASE_URL = 'https://www.mashmarket.app';

interface SanitySlugDoc {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic content from Sanity in parallel
  const [products, categories, growers, posts] = await Promise.all([
    sanityClient.fetch<SanitySlugDoc[]>(
      `*[_type == "product" && defined(slug.current) && !(_id in path("drafts.**"))] { "slug": slug.current, _updatedAt }`
    ),
    sanityClient.fetch<SanitySlugDoc[]>(
      `*[_type == "category" && defined(slug.current) && !(_id in path("drafts.**"))] { "slug": slug.current, _updatedAt }`
    ),
    sanityClient.fetch<SanitySlugDoc[]>(
      `*[_type == "grower" && defined(slug.current) && !(_id in path("drafts.**"))] { "slug": slug.current, _updatedAt }`
    ),
    sanityClient.fetch<SanitySlugDoc[]>(
      `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] { "slug": slug.current, _updatedAt }`
    ),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/grower`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/shipping-info`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/returns-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/start-selling`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Product routes
  const productRoutes: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: new Date(p._updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: new Date(c._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Grower routes
  const growerRoutes: MetadataRoute.Sitemap = (growers || []).map((g) => ({
    url: `${BASE_URL}/grower/${g.slug}`,
    lastModified: new Date(g._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Blog post routes
  const postRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...growerRoutes,
    ...postRoutes,
  ];
}
