/**
 * Link Products to Growers (Bidirectional)
 * 
 * This script ensures products are linked to growers via the product.grower reference field.
 * It reads from grower.products[] array and sets product.grower for each.
 * 
 * Run: node scripts/link-products-to-growers.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false
});

async function linkProductsToGrowers() {
  console.log('🔗 Starting product-grower bidirectional linking...\n');

  try {
    // Fetch all growers with their products
    const growers = await client.fetch(`
      *[_type == "grower"] {
        _id,
        name,
        "productIds": products[]._ref
      }
    `);

    console.log(`📊 Found ${growers.length} growers\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const grower of growers) {
      console.log(`\n👨‍🌾 Processing: ${grower.name}`);
      
      if (!grower.productIds || grower.productIds.length === 0) {
        console.log('   ⚠️  No products linked to this grower');
        continue;
      }

      console.log(`   📦 Found ${grower.productIds.length} products`);

      for (const productId of grower.productIds) {
        try {
          // Check if product already has this grower linked
          const product = await client.fetch(`
            *[_id == $productId][0] {
              _id,
              name,
              "growerId": grower._ref
            }
          `, { productId });

          if (!product) {
            console.log(`   ❌ Product ${productId} not found`);
            errors++;
            continue;
          }

          if (product.growerId === grower._id) {
            console.log(`   ✓ ${product.name} - Already linked`);
            skipped++;
            continue;
          }

          // Update product with grower reference
          await client
            .patch(productId)
            .set({
              grower: {
                _type: 'reference',
                _ref: grower._id
              }
            })
            .commit();

          console.log(`   ✅ ${product.name} - Linked to ${grower.name}`);
          updated++;

        } catch (err) {
          console.log(`   ❌ Error updating ${productId}: ${err.message}`);
          errors++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Updated: ${updated} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products (already linked)`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    // Verify: Check products without grower reference
    const orphanProducts = await client.fetch(`
      *[_type == "product" && !defined(grower)] {
        _id,
        name
      }
    `);

    if (orphanProducts.length > 0) {
      console.log(`\n⚠️  WARNING: ${orphanProducts.length} products have no grower:`);
      orphanProducts.forEach(p => console.log(`   - ${p.name}`));
    } else {
      console.log('\n✅ All products have grower references!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

linkProductsToGrowers();
