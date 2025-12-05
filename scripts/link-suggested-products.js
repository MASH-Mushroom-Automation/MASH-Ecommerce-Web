/**
 * Link Suggested Products Script
 * Links suggestedProducts and complementaryProducts for all products in Sanity
 * 
 * Run: node scripts/link-suggested-products.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Product linking strategy based on category
const productLinkingStrategy = {
  // Fresh mushrooms suggest other fresh + kits
  'fresh-mushrooms': {
    suggestFromCategories: ['fresh-mushrooms', 'growing-kits'],
    complementFromCategories: ['dried-mushrooms', 'growing-kits'],
  },
  // Dried mushrooms suggest other dried + fresh
  'dried-mushrooms': {
    suggestFromCategories: ['dried-mushrooms', 'fresh-mushrooms'],
    complementFromCategories: ['fresh-mushrooms', 'growing-kits'],
  },
  // Growing kits suggest fresh + other kits
  'growing-kits': {
    suggestFromCategories: ['growing-kits', 'fresh-mushrooms'],
    complementFromCategories: ['fresh-mushrooms', 'dried-mushrooms'],
  },
};

async function linkProducts() {
  console.log('🔗 Starting product linking...\n');

  try {
    // Fetch all products with their categories
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        "categorySlug": category->slug.current,
        "currentSuggested": count(suggestedProducts),
        "currentComplementary": count(complementaryProducts)
      }
    `);

    console.log(`📦 Found ${products.length} products\n`);

    // Group products by category
    const productsByCategory = {};
    for (const product of products) {
      const cat = product.categorySlug || 'other';
      if (!productsByCategory[cat]) {
        productsByCategory[cat] = [];
      }
      productsByCategory[cat].push(product);
    }

    console.log('📊 Products by category:');
    Object.entries(productsByCategory).forEach(([cat, prods]) => {
      console.log(`   ${cat}: ${prods.length} products`);
    });
    console.log('');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const strategy = productLinkingStrategy[product.categorySlug] || productLinkingStrategy['fresh-mushrooms'];
      
      // Skip if already has links
      if (product.currentSuggested > 0 && product.currentComplementary > 0) {
        console.log(`⏭️  Skipping "${product.name}" - already has links`);
        skippedCount++;
        continue;
      }

      // Get suggested products (from same category + related categories, exclude self)
      const suggestedCandidates = [];
      for (const cat of strategy.suggestFromCategories) {
        if (productsByCategory[cat]) {
          suggestedCandidates.push(
            ...productsByCategory[cat].filter(p => p._id !== product._id)
          );
        }
      }

      // Get complementary products (from different categories)
      const complementaryCandidates = [];
      for (const cat of strategy.complementFromCategories) {
        if (productsByCategory[cat]) {
          complementaryCandidates.push(
            ...productsByCategory[cat].filter(p => p._id !== product._id)
          );
        }
      }

      // Randomly select 4-6 suggested products
      const shuffledSuggested = suggestedCandidates.sort(() => Math.random() - 0.5);
      const selectedSuggested = shuffledSuggested.slice(0, Math.min(6, shuffledSuggested.length));

      // Randomly select 2-3 complementary products
      const shuffledComplementary = complementaryCandidates.sort(() => Math.random() - 0.5);
      const selectedComplementary = shuffledComplementary.slice(0, Math.min(3, shuffledComplementary.length));

      if (selectedSuggested.length === 0 && selectedComplementary.length === 0) {
        console.log(`⚠️  No candidates for "${product.name}"`);
        continue;
      }

      // Build the patch
      const patch = client.patch(product._id);

      if (selectedSuggested.length > 0 && product.currentSuggested === 0) {
        patch.set({
          suggestedProducts: selectedSuggested.map(p => ({
            _type: 'reference',
            _ref: p._id,
            _key: p._id.slice(-8),
          })),
        });
      }

      if (selectedComplementary.length > 0 && product.currentComplementary === 0) {
        patch.set({
          complementaryProducts: selectedComplementary.map(p => ({
            _type: 'reference',
            _ref: p._id,
            _key: p._id.slice(-8),
          })),
        });
      }

      await patch.commit();
      
      console.log(`✅ Updated "${product.name}"`);
      console.log(`   → ${selectedSuggested.length} suggested products`);
      console.log(`   → ${selectedComplementary.length} complementary products`);
      
      updatedCount++;
    }

    console.log('\n🎉 Product linking complete!');
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Skipped: ${skippedCount} products (already linked)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
linkProducts();
