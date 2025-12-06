/**
 * Check Products in Sanity
 * Run: node scripts/check-products.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkProducts() {
  console.log('🔍 Checking Products in Sanity CMS...\n');
  
  // Check all products
  const allProducts = await client.fetch(`*[_type == "product"] {
    _id,
    name,
    isAvailable,
    isFeatured,
    price,
    "quantity": quantity,
    "hasImage": defined(image.asset),
    "imageUrl": image.asset->url,
    "categoryName": category->name,
    "categorySlug": category->slug.current
  }`);
  
  console.log(`📦 Total Products: ${allProducts.length}\n`);
  
  // Check availability
  const available = allProducts.filter(p => p.isAvailable === true);
  const notAvailable = allProducts.filter(p => p.isAvailable !== true);
  
  console.log(`✅ Available (isAvailable=true): ${available.length}`);
  console.log(`❌ Not Available: ${notAvailable.length}\n`);
  
  if (notAvailable.length > 0) {
    console.log('⚠️  Products NOT available:');
    notAvailable.forEach(p => {
      console.log(`   - ${p.name} (isAvailable: ${p.isAvailable})`);
    });
    console.log('');
  }
  
  // Check images
  const withImages = allProducts.filter(p => p.hasImage);
  const withoutImages = allProducts.filter(p => !p.hasImage);
  
  console.log(`🖼️  With Images: ${withImages.length}`);
  console.log(`❌ Without Images: ${withoutImages.length}\n`);
  
  if (withoutImages.length > 0) {
    console.log('⚠️  Products WITHOUT images:');
    withoutImages.forEach(p => {
      console.log(`   - ${p.name}`);
    });
    console.log('');
  }
  
  // Check categories
  const withCategory = allProducts.filter(p => p.categoryName);
  const withoutCategory = allProducts.filter(p => !p.categoryName);
  
  console.log(`🏷️  With Category: ${withCategory.length}`);
  console.log(`❌ Without Category: ${withoutCategory.length}\n`);
  
  // List all products
  console.log('📋 All Products:\n');
  console.log('| # | Name | Available | Featured | Price | Qty | Image | Category |');
  console.log('|---|------|-----------|----------|-------|-----|-------|----------|');
  
  allProducts.forEach((p, i) => {
    console.log(`| ${i+1} | ${p.name?.substring(0,25)} | ${p.isAvailable ? '✅' : '❌'} | ${p.isFeatured ? '⭐' : '-'} | ₱${p.price || 0} | ${p.quantity || 0} | ${p.hasImage ? '✅' : '❌'} | ${p.categoryName || 'None'} |`);
  });
  
  // Check categories
  console.log('\n\n🏷️  Categories in Sanity:\n');
  const categories = await client.fetch(`*[_type == "category"] {
    _id,
    name,
    "slug": slug.current,
    description,
    "productCount": count(*[_type == "product" && references(^._id)])
  }`);
  
  console.log('| Name | Slug | Products |');
  console.log('|------|------|----------|');
  categories.forEach(c => {
    console.log(`| ${c.name} | ${c.slug} | ${c.productCount} |`);
  });
  
  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log('═══════════════════════════════════════');
  console.log(`Total Products: ${allProducts.length}`);
  console.log(`Available: ${available.length} (${(available.length/allProducts.length*100).toFixed(0)}%)`);
  console.log(`With Images: ${withImages.length} (${(withImages.length/allProducts.length*100).toFixed(0)}%)`);
  console.log(`With Category: ${withCategory.length} (${(withCategory.length/allProducts.length*100).toFixed(0)}%)`);
  console.log('═══════════════════════════════════════\n');
  
  if (notAvailable.length > 0) {
    console.log('\n🚨 ISSUE FOUND: Some products have isAvailable != true');
    console.log('   FIX: Run the fix-products.js script to set isAvailable=true');
  }
  
  if (available.length === 0) {
    console.log('\n🚨 CRITICAL: NO products are available!');
    console.log('   This is why the shop page shows "No Products Found"');
    console.log('   FIX: Set isAvailable=true for all products in Sanity');
  }
}

checkProducts().catch(console.error);
