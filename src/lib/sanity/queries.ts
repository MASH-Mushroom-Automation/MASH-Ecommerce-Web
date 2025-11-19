/**
 * Sanity GROQ Queries
 * 
 * This file contains all GROQ queries for fetching content from Sanity CMS.
 * GROQ (Graph-Relational Object Queries) is Sanity's query language.
 * 
 * Learn more: https://www.sanity.io/docs/groq
 */

/**
 * Product Queries
 */

// Fetch all products with complete details
export const productsQuery = `*[_type == "product" && !(_id in path("drafts.**"))] | order(name asc) {
  _id,
  _createdAt,
  _updatedAt,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  stock,
  sku,
  weight,
  unit,
  isAvailable,
  isFeatured,
  isPromo,
  promoEndDate,
  "mainImage": mainImage.asset->url,
  "images": images[].asset->url,
  category->{
    _id,
    name,
    slug,
    description
  },
  subcategory->{
    _id,
    name,
    slug,
    description
  }
}`;

// Fetch single product by slug
export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  stock,
  sku,
  weight,
  unit,
  isAvailable,
  isFeatured,
  isPromo,
  promoEndDate,
  "mainImage": mainImage.asset->url,
  "images": images[].asset->url,
  category->{
    _id,
    name,
    slug,
    description
  },
  subcategory->{
    _id,
    name,
    slug,
    description
  }
}`;

// Fetch featured products
export const featuredProductsQuery = `*[_type == "product" && isFeatured == true && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...8] {
  _id,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  isPromo,
  promoEndDate,
  "mainImage": mainImage.asset->url,
  category->{
    name,
    slug
  }
}`;

// Fetch products on promo
export const promoProductsQuery = `*[_type == "product" && isPromo == true && !(_id in path("drafts.**"))] | order(promoEndDate asc) {
  _id,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  promoEndDate,
  "mainImage": mainImage.asset->url,
  category->{
    name,
    slug
  }
}`;

// Fetch products by category slug
export const productsByCategoryQuery = `*[_type == "product" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))] | order(name asc) {
  _id,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  stock,
  isAvailable,
  isFeatured,
  isPromo,
  promoEndDate,
  "mainImage": mainImage.asset->url,
  category->{
    name,
    slug
  }
}`;

/**
 * Category Queries
 */

// Fetch all categories with product count
export const categoriesQuery = `*[_type == "category" && !(_id in path("drafts.**"))] | order(name asc) {
  _id,
  name,
  slug,
  description,
  "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
}`;

// Fetch single category by slug with products
export const categoryBySlugQuery = `*[_type == "category" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  "products": *[_type == "product" && references(^._id) && !(_id in path("drafts.**"))] | order(name asc) {
    _id,
    name,
    slug,
    description,
    price,
    compareAtPrice,
    "mainImage": mainImage.asset->url
  }
}`;

/**
 * Hero Carousel Queries
 */

// Fetch hero carousel slides
export const heroCarouselQuery = `*[_type == "heroCarousel"][0] {
  slides[] {
    title,
    subtitle,
    buttonText,
    buttonLink,
    buttonStyle,
    "image": image.asset->url,
    order,
    isActive
  }
}`;

/**
 * Featured Products Singleton Query
 */

// Fetch featured products from singleton
export const featuredProductsSingletonQuery = `*[_type == "featuredProducts"][0] {
  title,
  subtitle,
  products[]-> {
    _id,
    name,
    slug,
    description,
    price,
    compareAtPrice,
    "mainImage": mainImage.asset->url
  }
}`;

/**
 * Site Settings Query
 */

// Fetch site settings
export const settingsQuery = `*[_type == "settings"][0] {
  title,
  description,
  keywords,
  "ogImage": ogImage.asset->url
}`;

/**
 * Blog Post Queries
 */

// Fetch all blog posts
export const postsQuery = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  "mainImage": mainImage.asset->url,
  author->{
    name,
    "image": image.asset->url
  }
}`;

// Fetch single blog post by slug
export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  body,
  publishedAt,
  "mainImage": mainImage.asset->url,
  author->{
    name,
    bio,
    "image": image.asset->url
  }
}`;
