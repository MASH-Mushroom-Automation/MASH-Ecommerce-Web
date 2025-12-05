/**
 * Check Product Images in Sanity
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'xyq5fhxs',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkProductImages() {
  console.log('Checking product images - ALL fields...\n');
  
  // Query products with ALL image-related fields
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "slug": slug.current,
      mainImage,
      image,
      images,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "imagesUrls": images[].asset->url
    } | order(name asc) [0...3]
  `);
  
  console.log('First 3 Products - Full Image Data:');
  console.log('='.repeat(60));
  
  products.forEach(p => {
    console.log(`\n📦 ${p.name}`);
    console.log(`   mainImage field:`, JSON.stringify(p.mainImage, null, 2));
    console.log(`   image field:`, JSON.stringify(p.image, null, 2));
    console.log(`   images field:`, JSON.stringify(p.images, null, 2));
    console.log(`   mainImageUrl:`, p.mainImageUrl);
    console.log(`   imageUrl:`, p.imageUrl);
    console.log(`   imagesUrls:`, p.imagesUrls);
  });
}

checkProductImages().catch(console.error);
