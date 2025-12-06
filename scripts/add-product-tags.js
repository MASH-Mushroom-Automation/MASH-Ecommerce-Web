/**
 * Add Product Tags Script
 * Adds relevant tags to all products in Sanity
 * 
 * Run: node scripts/add-product-tags.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
});

// Tag mapping based on product characteristics
const tagMappings = {
  // Fresh mushrooms
  'fresh': ['fresh', 'perishable', 'refrigerate', 'farm-direct'],
  'oyster': ['oyster', 'mild-flavor', 'versatile', 'beginner-friendly', 'stir-fry'],
  'shiitake': ['shiitake', 'umami', 'asian-cuisine', 'immune-boost', 'savory'],
  'king': ['king-oyster', 'meaty-texture', 'grilling', 'premium'],
  'lion': ['lions-mane', 'brain-health', 'cognitive', 'medicinal', 'gourmet'],
  'button': ['button', 'classic', 'everyday', 'affordable', 'kid-friendly'],
  'portobello': ['portobello', 'burger', 'grilling', 'meat-substitute', 'large'],
  'enoki': ['enoki', 'delicate', 'asian', 'soup', 'salad'],
  'maitake': ['maitake', 'hen-of-woods', 'immune', 'medicinal', 'gourmet'],
  
  // Dried mushrooms
  'dried': ['dried', 'long-shelf-life', 'rehydrate', 'intense-flavor', 'pantry-staple'],
  'powder': ['powder', 'seasoning', 'umami-boost', 'easy-use', 'cooking'],
  
  // Growing kits
  'kit': ['growing-kit', 'diy', 'educational', 'gift', 'home-grown'],
  'grow': ['home-growing', 'sustainable', 'beginner', 'fresh-harvest'],
  
  // General tags
  'organic': ['organic', 'pesticide-free', 'natural'],
  'local': ['local', 'philippine-grown', 'farm-fresh'],
  'vegan': ['vegan', 'plant-based', 'vegetarian'],
  'healthy': ['healthy', 'low-calorie', 'nutritious', 'high-fiber'],
  'bundle': ['bundle', 'value-pack', 'savings', 'variety'],
};

// Determine tags for a product based on its name
function getTagsForProduct(productName) {
  const name = productName.toLowerCase();
  const tags = new Set();
  
  // Add base tags
  tags.add('mushroom');
  tags.add('local');
  tags.add('healthy');
  
  // Check for matches
  for (const [keyword, associatedTags] of Object.entries(tagMappings)) {
    if (name.includes(keyword)) {
      associatedTags.forEach(tag => tags.add(tag));
    }
  }
  
  // Add vegan tag (all mushrooms are vegan)
  tags.add('vegan');
  tags.add('plant-based');
  
  return Array.from(tags).slice(0, 10); // Max 10 tags
}

async function addProductTags() {
  console.log('🏷️ Adding tags to products...\n');
  
  // Fetch all products
  const products = await client.fetch(`*[_type == "product"] { _id, name, productTags }`);
  
  console.log(`📦 Found ${products.length} products\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const product of products) {
    const newTags = getTagsForProduct(product.name);
    
    // Skip if product already has tags
    if (product.productTags && product.productTags.length > 0) {
      console.log(`⏭️ Skipping "${product.name}" (already has ${product.productTags.length} tags)`);
      skipped++;
      continue;
    }
    
    try {
      await client.patch(product._id)
        .set({ productTags: newTags })
        .commit();
      
      console.log(`✅ Updated "${product.name}" → ${newTags.length} tags`);
      console.log(`   Tags: ${newTags.join(', ')}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed to update "${product.name}":`, err.message);
    }
  }
  
  console.log(`\n🎉 Done! Updated: ${updated}, Skipped: ${skipped}`);
}

addProductTags().catch(err => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
