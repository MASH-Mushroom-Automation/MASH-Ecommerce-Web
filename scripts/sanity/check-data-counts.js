/**
 * Check Document Counts in Sanity
 * Quick check to see if data has been imported
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkCounts() {
  console.log('📊 Checking Document Counts in Sanity...\n');
  
  try {
    const categoryCount = await client.fetch('count(*[_type == "category"])');
    const productCount = await client.fetch('count(*[_type == "product"])');
    const variantCount = await client.fetch('count(*[_type == "productVariant"])');
    const bundleCount = await client.fetch('count(*[_type == "productBundle"])');
    const reviewCount = await client.fetch('count(*[_type == "review"])');
    const settingsCount = await client.fetch('count(*[_type == "settings"])');
    
    console.log('Document Counts:');
    console.log(`   Categories: ${categoryCount} ${categoryCount === 3 ? '✅' : '⚠️  (Expected 3)'}`);
    console.log(`   Products: ${productCount} ${productCount === 15 ? '✅' : '⚠️  (Expected 15)'}`);
    console.log(`   Variants: ${variantCount} ${variantCount === 15 ? '✅' : '⚠️  (Expected 15)'}`);
    console.log(`   Bundles: ${bundleCount} ${bundleCount === 6 ? '✅' : '⚠️  (Expected 6)'}`);
    console.log(`   Reviews: ${reviewCount} ${reviewCount === 45 ? '✅' : '⚠️  (Expected 45)'}`);
    console.log(`   Settings: ${settingsCount} ${settingsCount >= 1 ? '✅' : '⚠️  (Expected 1)'}`);
    
    const total = categoryCount + productCount + variantCount + bundleCount + reviewCount + settingsCount;
    console.log(`\n   Total Documents: ${total}`);
    console.log(`   Expected Total: 85 (3+15+15+6+45+1)\n`);
    
    if (total === 85) {
      console.log('✅ All data imported successfully!\n');
    } else if (total > 0) {
      console.log('⚠️  Some data is missing. Run import scripts:\n');
      if (categoryCount < 3) console.log('   → node scripts/sanity/import-categories.js');
      if (productCount < 15) console.log('   → node scripts/sanity/import-products.js');
      if (variantCount < 15) console.log('   → node scripts/sanity/import-variants.js');
      if (bundleCount < 6) console.log('   → node scripts/sanity/import-bundles.js');
      if (reviewCount < 45) console.log('   → node scripts/sanity/import-reviews.js');
      console.log('');
    } else {
      console.log('❌ No data found! Run import scripts:\n');
      console.log('   1. node scripts/sanity/import-categories.js');
      console.log('   2. node scripts/sanity/import-products.js');
      console.log('   3. node scripts/sanity/import-variants.js');
      console.log('   4. node scripts/sanity/import-bundles.js');
      console.log('   5. node scripts/sanity/import-reviews.js');
      console.log('   6. node scripts/sanity/link-relationships.js\n');
    }
    
  } catch (error) {
    console.error('❌ Error checking counts:', error.message);
    console.error('\nPossible causes:');
    console.error('  - Invalid API token');
    console.error('  - Wrong project ID');
    console.error('  - Network connection issue\n');
  }
}

checkCounts();
