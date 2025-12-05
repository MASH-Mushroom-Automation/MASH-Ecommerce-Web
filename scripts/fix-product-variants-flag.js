/**
 * Fix Product Variant Flags
 * Sets hasVariants = true for products that should have variants
 * 
 * Run: node scripts/fix-product-variants-flag.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function fixVariantFlags() {
  console.log('🔧 Fixing product variant flags...\n');

  // Get all products
  const products = await client.fetch(`
    *[_type == "product"] {
      _id,
      name,
      hasVariants
    }
  `);

  console.log(`📦 Found ${products.length} products\n`);

  // Get products that have variants
  const productsWithVariants = await client.fetch(`
    *[_type == "product" && count(*[_type == "productVariant" && references(^._id)]) > 0] {
      _id,
      name,
      hasVariants,
      "variantCount": count(*[_type == "productVariant" && references(^._id)])
    }
  `);

  console.log(`📊 ${productsWithVariants.length} products have variant documents\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of productsWithVariants) {
    console.log(`📋 ${product.name}: ${product.variantCount} variants`);
    
    if (!product.hasVariants) {
      try {
        await client.patch(product._id)
          .set({ hasVariants: true })
          .commit();
        console.log(`   ✅ Set hasVariants = true`);
        updated++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    } else {
      console.log(`   ⏭️ Already has hasVariants = true`);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Updated: ${updated} products`);
  console.log(`   Skipped: ${skipped} products (already correct)`);
  console.log('='.repeat(50));
}

fixVariantFlags().catch(console.error);
