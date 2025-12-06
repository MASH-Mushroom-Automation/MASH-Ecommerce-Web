/**
 * Fix Missing _key Properties in Sanity Arrays
 * 
 * This script adds missing _key properties to array items in:
 * - grower.products[]
 * - grower.availableAtStores[]
 * - Any other arrays with references
 * 
 * Run: node scripts/fix-array-keys.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Simple unique key generator (Sanity just needs unique strings)
function generateKey() {
  return Math.random().toString(36).substring(2, 14);
}

async function fixGrowerArrays() {
  console.log('🔧 Fixing missing _key properties in grower arrays...\n');
  
  // Fetch all growers with their array fields
  const growers = await client.fetch(`
    *[_type == "grower"] {
      _id,
      name,
      products,
      featuredProducts,
      availableAtStores,
      suppliesTo,
      deliveryAreas
    }
  `);
  
  console.log(`📋 Found ${growers.length} growers to check\n`);
  
  let fixedCount = 0;
  
  for (const grower of growers) {
    const patches = {};
    let needsUpdate = false;
    
    // Check and fix products array
    if (grower.products && Array.isArray(grower.products)) {
      const fixedProducts = grower.products.map(item => {
        if (!item._key) {
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (needsUpdate) {
        patches.products = fixedProducts;
      }
    }
    
    // Check and fix featuredProducts array
    if (grower.featuredProducts && Array.isArray(grower.featuredProducts)) {
      let arrayNeedsUpdate = false;
      const fixedFeaturedProducts = grower.featuredProducts.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.featuredProducts = fixedFeaturedProducts;
      }
    }
    
    // Check and fix availableAtStores array
    if (grower.availableAtStores && Array.isArray(grower.availableAtStores)) {
      let arrayNeedsUpdate = false;
      const fixedStores = grower.availableAtStores.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.availableAtStores = fixedStores;
      }
    }
    
    // Check and fix suppliesTo array
    if (grower.suppliesTo && Array.isArray(grower.suppliesTo)) {
      let arrayNeedsUpdate = false;
      const fixedSuppliesTo = grower.suppliesTo.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.suppliesTo = fixedSuppliesTo;
      }
    }
    
    // Check and fix deliveryAreas array (string array)
    if (grower.deliveryAreas && Array.isArray(grower.deliveryAreas)) {
      // String arrays don't need _key, skip
    }
    
    // Apply patches if needed
    if (needsUpdate && Object.keys(patches).length > 0) {
      try {
        await client.patch(grower._id).set(patches).commit();
        console.log(`✅ Fixed: ${grower.name}`);
        Object.keys(patches).forEach(field => {
          console.log(`   - Fixed ${patches[field].length} items in ${field}`);
        });
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing ${grower.name}:`, error.message);
      }
    } else {
      console.log(`⏭️  Skipped: ${grower.name} (no fixes needed)`);
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${fixedCount} growers`);
}

async function fixProductArrays() {
  console.log('\n🔧 Fixing missing _key properties in product arrays...\n');
  
  // Fetch all products with their array fields
  const products = await client.fetch(`
    *[_type == "product"] {
      _id,
      name,
      suggestedProducts,
      relatedProducts,
      complementaryProducts
    }
  `);
  
  console.log(`📋 Found ${products.length} products to check\n`);
  
  let fixedCount = 0;
  
  for (const product of products) {
    const patches = {};
    let needsUpdate = false;
    
    // Check and fix suggestedProducts array
    if (product.suggestedProducts && Array.isArray(product.suggestedProducts)) {
      let arrayNeedsUpdate = false;
      const fixedArray = product.suggestedProducts.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.suggestedProducts = fixedArray;
      }
    }
    
    // Check and fix relatedProducts array
    if (product.relatedProducts && Array.isArray(product.relatedProducts)) {
      let arrayNeedsUpdate = false;
      const fixedArray = product.relatedProducts.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.relatedProducts = fixedArray;
      }
    }
    
    // Check and fix complementaryProducts array
    if (product.complementaryProducts && Array.isArray(product.complementaryProducts)) {
      let arrayNeedsUpdate = false;
      const fixedArray = product.complementaryProducts.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.complementaryProducts = fixedArray;
      }
    }
    
    // Apply patches if needed
    if (needsUpdate && Object.keys(patches).length > 0) {
      try {
        await client.patch(product._id).set(patches).commit();
        console.log(`✅ Fixed: ${product.name}`);
        Object.keys(patches).forEach(field => {
          console.log(`   - Fixed ${patches[field].length} items in ${field}`);
        });
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing ${product.name}:`, error.message);
      }
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${fixedCount} products`);
}

async function fixStoreArrays() {
  console.log('\n🔧 Fixing missing _key properties in store arrays...\n');
  
  // Fetch all stores with their array fields
  const stores = await client.fetch(`
    *[_type == "store"] {
      _id,
      name,
      growers,
      featuredProducts
    }
  `);
  
  console.log(`📋 Found ${stores.length} stores to check\n`);
  
  let fixedCount = 0;
  
  for (const store of stores) {
    const patches = {};
    let needsUpdate = false;
    
    // Check and fix growers array
    if (store.growers && Array.isArray(store.growers)) {
      let arrayNeedsUpdate = false;
      const fixedArray = store.growers.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.growers = fixedArray;
      }
    }
    
    // Check and fix featuredProducts array
    if (store.featuredProducts && Array.isArray(store.featuredProducts)) {
      let arrayNeedsUpdate = false;
      const fixedArray = store.featuredProducts.map(item => {
        if (!item._key) {
          arrayNeedsUpdate = true;
          needsUpdate = true;
          return { ...item, _key: generateKey() };
        }
        return item;
      });
      if (arrayNeedsUpdate) {
        patches.featuredProducts = fixedArray;
      }
    }
    
    // Apply patches if needed
    if (needsUpdate && Object.keys(patches).length > 0) {
      try {
        await client.patch(store._id).set(patches).commit();
        console.log(`✅ Fixed: ${store.name}`);
        Object.keys(patches).forEach(field => {
          console.log(`   - Fixed ${patches[field].length} items in ${field}`);
        });
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing ${store.name}:`, error.message);
      }
    } else {
      console.log(`⏭️  Skipped: ${store.name} (no fixes needed)`);
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${fixedCount} stores`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   SANITY ARRAY _KEY FIX SCRIPT');
  console.log('   Adds missing _key properties to array items');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  try {
    await fixGrowerArrays();
    await fixProductArrays();
    await fixStoreArrays();
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅ ALL FIXES COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
