/**
 * Link Suggested Products Script (FIXED)
 * Links suggestedProducts and complementaryProducts for all products in Sanity
 * 
 * Run: node scripts/link-products-fixed.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Product linking strategy based on category
const productLinkingStrategy = {
  'fresh-mushrooms': {
    suggestFromCategories: ['fresh-mushrooms', 'growing-kits'],
    complementFromCategories: ['dried-mushrooms', 'growing-kits'],
  },
  'dried-mushrooms': {
    suggestFromCategories: ['dried-mushrooms', 'fresh-mushrooms'],
    complementFromCategories: ['fresh-mushrooms', 'growing-kits'],
  },
  'growing-kits': {
    suggestFromCategories: ['growing-kits', 'fresh-mushrooms'],
    complementFromCategories: ['fresh-mushrooms', 'dried-mushrooms'],
  },
};

async function linkProducts() {
  console.log('🔗 Starting product linking (FIXED VERSION)...\n');

  try {
    // Fetch all products with their categories
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        "categorySlug": category->slug.current
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

    for (const product of products) {
      const strategy = productLinkingStrategy[product.categorySlug] || productLinkingStrategy['fresh-mushrooms'];
      
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

      // Create update data
      const updateData = {
        suggestedProducts: selectedSuggested.map((p, index) => ({
          _type: 'reference',
          _ref: p._id,
          _key: `suggested-${index}-${Date.now()}`,
        })),
        complementaryProducts: selectedComplementary.map((p, index) => ({
          _type: 'reference',
          _ref: p._id,
          _key: `complementary-${index}-${Date.now()}`,
        })),
      };

      // Use a single patch.set with all data
      await client
        .patch(product._id)
        .set(updateData)
        .commit();
      
      console.log(`✅ Updated "${product.name}"`);
      console.log(`   → ${selectedSuggested.length} suggested: ${selectedSuggested.map(p => p.name.split(' ')[1]).join(', ')}`);
      console.log(`   → ${selectedComplementary.length} complementary: ${selectedComplementary.map(p => p.name.split(' ')[1]).join(', ')}`);
      
      updatedCount++;
    }

    console.log('\n🎉 Product linking complete!');
    console.log(`   Updated: ${updatedCount} products`);

    // Verify
    console.log('\n🔍 Verifying...');
    const verifyProducts = await client.fetch(`
      *[_type == "product"][0...3] {
        name,
        "suggestedCount": count(suggestedProducts),
        "complementaryCount": count(complementaryProducts)
      }
    `);
    
    console.log('Sample verification:');
    verifyProducts.forEach(p => {
      console.log(`   ${p.name}: ${p.suggestedCount || 0} suggested, ${p.complementaryCount || 0} complementary`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
linkProducts();
