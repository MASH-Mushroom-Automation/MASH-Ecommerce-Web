/**
 * Quick Sanity Data Audit
 * Run: node scripts/quick-audit.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

async function audit() {
  console.log('📊 SANITY CMS DATA AUDIT\n');
  console.log('='.repeat(50));
  
  // Document counts
  const counts = await client.fetch(`{
    "products": count(*[_type == "product"]),
    "categories": count(*[_type == "category"]),
    "growers": count(*[_type == "grower"]),
    "stores": count(*[_type == "store"]),
    "reviews": count(*[_type == "review"]),
    "variants": count(*[_type == "productVariant"]),
    "bundles": count(*[_type == "productBundle"]),
    "faqs": count(*[_type == "faqItem"]),
    "faqCategories": count(*[_type == "faqCategory"]),
    "testimonials": count(*[_type == "testimonial"]),
    "banners": count(*[_type == "banner"]),
    "blogPosts": count(*[_type == "post"]),
    "blogCategories": count(*[_type == "blogCategory"]),
    "teamMembers": count(*[_type == "person"]),
    "features": count(*[_type == "featureSection"]),
    "navigation": count(*[_type == "navigation"])
  }`);
  
  console.log('\n📦 DOCUMENT COUNTS:');
  console.log('-'.repeat(40));
  console.log(`Products:       ${counts.products}`);
  console.log(`Categories:     ${counts.categories}`);
  console.log(`Growers:        ${counts.growers}`);
  console.log(`Stores:         ${counts.stores}`);
  console.log(`Reviews:        ${counts.reviews}`);
  console.log(`Variants:       ${counts.variants}`);
  console.log(`Bundles:        ${counts.bundles}`);
  console.log(`FAQs:           ${counts.faqs} (${counts.faqCategories} categories)`);
  console.log(`Testimonials:   ${counts.testimonials}`);
  console.log(`Banners:        ${counts.banners}`);
  console.log(`Blog Posts:     ${counts.blogPosts} (${counts.blogCategories} categories)`);
  console.log(`Team Members:   ${counts.teamMembers}`);
  console.log(`Features:       ${counts.features}`);
  console.log(`Navigation:     ${counts.navigation}`);
  
  // Check singletons
  console.log('\n📌 SINGLETONS:');
  console.log('-'.repeat(40));
  
  const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]{ _id, siteName }`);
  const heroCarousel = await client.fetch(`*[_type == "heroCarousel"][0]{ _id, "slidesCount": count(slides) }`);
  const featuredProducts = await client.fetch(`*[_type == "featuredProducts"][0]{ _id, title, "productsCount": count(products) }`);
  const aboutPage = await client.fetch(`*[_type == "aboutPage"][0]{ _id, title }`);
  const contactPage = await client.fetch(`*[_type == "contactPage"][0]{ _id, title }`);
  
  console.log(`siteSettings:     ${siteSettings ? '✅ ' + (siteSettings.siteName || 'exists') : '❌ MISSING'}`);
  console.log(`heroCarousel:     ${heroCarousel ? '✅ ' + heroCarousel.slidesCount + ' slides' : '❌ MISSING'}`);
  console.log(`featuredProducts: ${featuredProducts ? '✅ ' + featuredProducts.productsCount + ' products' : '❌ MISSING (needs creation)'}`);
  console.log(`aboutPage:        ${aboutPage ? '✅ ' + (aboutPage.title || 'exists') : '❌ MISSING'}`);
  console.log(`contactPage:      ${contactPage ? '✅ ' + (contactPage.title || 'exists') : '❌ MISSING'}`);
  
  // Check grower-store relationships
  console.log('\n🔗 RELATIONSHIPS:');
  console.log('-'.repeat(40));
  
  const growerStoreLinks = await client.fetch(`{
    "growersWithStores": count(*[_type == "grower" && count(suppliesTo) > 0]),
    "storesWithGrowers": count(*[_type == "store" && count(growers) > 0]),
    "productsWithSuggested": count(*[_type == "product" && count(suggestedProducts) > 0]),
    "productsWithComplementary": count(*[_type == "product" && count(complementaryProducts) > 0])
  }`);
  
  console.log(`Growers → Stores: ${growerStoreLinks.growersWithStores}/${counts.growers} linked`);
  console.log(`Stores → Growers: ${growerStoreLinks.storesWithGrowers}/${counts.stores} linked`);
  console.log(`Products → Suggested: ${growerStoreLinks.productsWithSuggested}/${counts.products} linked`);
  console.log(`Products → Complementary: ${growerStoreLinks.productsWithComplementary}/${counts.products} linked`);
  
  // Check data quality
  console.log('\n✅ DATA QUALITY:');
  console.log('-'.repeat(40));
  
  const quality = await client.fetch(`{
    "productsWithImages": count(*[_type == "product" && defined(image)]),
    "productsWithCategories": count(*[_type == "product" && defined(category)]),
    "productsWithTags": count(*[_type == "product" && count(productTags) > 0]),
    "productsWithVariants": count(*[_type == "product" && hasVariants == true]),
    "growersWithImages": count(*[_type == "grower" && defined(logo)]),
    "storesWithAddresses": count(*[_type == "store" && defined(address)])
  }`);
  
  console.log(`Products with images:     ${quality.productsWithImages}/${counts.products}`);
  console.log(`Products with categories: ${quality.productsWithCategories}/${counts.products}`);
  console.log(`Products with tags:       ${quality.productsWithTags}/${counts.products}`);
  console.log(`Products with variants:   ${quality.productsWithVariants}/${counts.products}`);
  console.log(`Growers with images:      ${quality.growersWithImages}/${counts.growers}`);
  console.log(`Stores with addresses:    ${quality.storesWithAddresses}/${counts.stores}`);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 AUDIT COMPLETE\n');
}

audit().catch(console.error);
