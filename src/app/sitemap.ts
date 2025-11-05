import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mash.market'; // Update with your actual domain
  
  // Static routes
  const staticRoutes = [
    '',
    '/catalog',
    '/grower',
    '/about',
    '/contact',
    '/faq',
    '/blog',
    '/privacy',
    '/terms',
    '/shipping-info',
    '/returns-policy',
    '/start-selling',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Auth routes (lower priority)
  const authRoutes = [
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // TODO: Add dynamic routes when you have product/grower data
  // Example:
  // const products = await fetchProducts();
  // const productRoutes = products.map((product) => ({
  //   url: `${baseUrl}/product/${product.id}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: 'daily' as const,
  //   priority: 0.9,
  // }));

  return [
    ...staticRoutes,
    ...authRoutes,
    // ...productRoutes,
    // ...growerRoutes,
  ];
}
