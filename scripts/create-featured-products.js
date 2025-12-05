/**
 * Create Featured Products Singleton
 * Creates the featuredProducts singleton document with selected products
 * 
 * Run: node scripts/create-featured-products.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load from .env.local explicitly
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function createFeaturedProducts() {
  console.log('🌟 Creating Featured Products singleton...\n');

  // Get all products to select featured ones
  const products = await client.fetch(`
    *[_type == "product" && isAvailable == true] | order(isFeatured desc, _createdAt desc) {
      _id,
      name,
      isFeatured,
      "categorySlug": category->slug.current
    }
  `);

  console.log(`📦 Found ${products.length} available products`);

  // Select featured products - prioritize those already marked as featured
  // Then pick a mix from different categories
  const featuredProducts = products.filter(p => p.isFeatured);
  const nonFeatured = products.filter(p => !p.isFeatured);

  // Get one from each category if possible
  const categories = [...new Set(products.map(p => p.categorySlug))];
  console.log(`📁 Categories: ${categories.join(', ')}`);

  let selectedProducts = [...featuredProducts];

  // Fill up to 8 products from different categories
  for (const category of categories) {
    if (selectedProducts.length >= 8) break;
    const categoryProducts = nonFeatured.filter(p => 
      p.categorySlug === category && 
      !selectedProducts.find(s => s._id === p._id)
    );
    if (categoryProducts.length > 0 && selectedProducts.length < 8) {
      selectedProducts.push(categoryProducts[0]);
    }
  }

  // If still not enough, add more from any category
  while (selectedProducts.length < 6 && nonFeatured.length > 0) {
    const remaining = nonFeatured.filter(p => !selectedProducts.find(s => s._id === p._id));
    if (remaining.length > 0) {
      selectedProducts.push(remaining[0]);
    } else {
      break;
    }
  }

  // Limit to 8 products
  selectedProducts = selectedProducts.slice(0, 8);

  console.log(`\n✨ Selected ${selectedProducts.length} featured products:`);
  selectedProducts.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.categorySlug})`);
  });

  // Check if document already exists
  const existing = await client.fetch(`*[_type == "featuredProducts"][0]`);

  const featuredProductsDoc = {
    _type: 'featuredProducts',
    title: 'Our Bestsellers',
    subtitle: 'Discover our most popular fresh mushrooms, dried varieties, and growing kits',
    products: selectedProducts.map(p => ({
      _type: 'reference',
      _ref: p._id,
      _key: p._id.replace('drafts.', ''),
    })),
  };

  if (existing) {
    console.log('\n📝 Updating existing Featured Products document...');
    await client.patch(existing._id)
      .set(featuredProductsDoc)
      .commit();
    console.log(`✅ Updated document: ${existing._id}`);
  } else {
    console.log('\n📝 Creating new Featured Products document...');
    // Use createOrReplace for singleton documents
    const result = await client.createOrReplace({
      _id: 'featuredProducts', // Singleton ID
      ...featuredProductsDoc,
    });
    console.log(`✅ Created document: ${result._id}`);
  }

  console.log('\n🎉 Featured Products singleton created successfully!');
}

createFeaturedProducts().catch(console.error);
