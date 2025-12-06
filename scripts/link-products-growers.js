/**
 * Phase C - Link Products to Growers and Growers to Stores
 * Run: node scripts/link-products-growers.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Product -> Grower assignments (distributing products across growers)
const PRODUCT_GROWER_MAP = {
  // Fungi Fresh Farms - Specializes in fresh mushrooms
  'Fungi Fresh Farms': [
    'Fresh Oyster Mushrooms',
    'Fresh King Oyster Mushrooms',
    'Fresh Button Mushrooms',
    'Oyster Mushroom Growing Kit',
  ],
  // Kabutehan ni Aling Nena - Traditional farm, fresh + dried
  'Kabutehan ni Aling Nena': [
    'Fresh Shiitake Mushrooms',
    'Dried Shiitake Mushrooms',
    'Dried Mixed Mushrooms',
    'Shiitake Mushroom Growing Kit',
  ],
  // Shroomz - Urban grower, specialty mushrooms
  'Shroomz': [
    'Fresh Lion\'s Mane Mushrooms',
    'Fresh Portobello Mushrooms',
    'Lion\'s Mane Mushroom Growing Kit',
    'Mushroom Extract Tincture',
  ],
  // The Mushroom Patch Bukidnon - Organic farm, dried + specialty
  'The Mushroom Patch Bukidnon': [
    'Dried Oyster Mushrooms',
    'Mushroom Powder',
    'Beginner Mushroom Combo Kit',
  ],
};

// Grower -> Store assignments
const GROWER_STORE_MAP = {
  'Fungi Fresh Farms': ['MASH Main Store - Novaliches', 'Caloocan Pickup Point'],
  'Kabutehan ni Aling Nena': ['MASH Main Store - Novaliches', 'Organic Market QC'],
  'Shroomz': ['MASH Main Store - Novaliches', 'Commonwealth Pickup Point'],
  'The Mushroom Patch Bukidnon': ['MASH Main Store - Novaliches', 'Organic Market QC'],
};

async function linkProductsAndGrowers() {
  console.log('='.repeat(60));
  console.log('PHASE C: Linking Products to Growers');
  console.log('='.repeat(60));

  // 1. Get all growers
  const growers = await client.fetch(`*[_type == "grower"] { _id, name }`);
  const growerMap = {};
  growers.forEach(g => { growerMap[g.name] = g._id; });
  console.log(`\n📋 Found ${growers.length} growers`);

  // 2. Get all products
  const products = await client.fetch(`*[_type == "product"] { _id, name }`);
  const productMap = {};
  products.forEach(p => { productMap[p.name] = p._id; });
  console.log(`📋 Found ${products.length} products`);

  // 3. Get all stores
  const stores = await client.fetch(`*[_type == "store"] { _id, name }`);
  const storeMap = {};
  stores.forEach(s => { storeMap[s.name] = s._id; });
  console.log(`📋 Found ${stores.length} stores`);

  // 4. Link products to growers
  console.log('\n🔗 LINKING PRODUCTS TO GROWERS...\n');
  
  for (const [growerName, productNames] of Object.entries(PRODUCT_GROWER_MAP)) {
    const growerId = growerMap[growerName];
    if (!growerId) {
      console.log(`   ❌ Grower not found: ${growerName}`);
      continue;
    }
    
    console.log(`   👨‍🌾 ${growerName}:`);
    
    for (const productName of productNames) {
      const productId = productMap[productName];
      if (!productId) {
        console.log(`      ❌ Product not found: ${productName}`);
        continue;
      }
      
      try {
        await client.patch(productId)
          .set({
            grower: { _type: 'reference', _ref: growerId }
          })
          .commit();
        console.log(`      ✅ Linked: ${productName}`);
      } catch (err) {
        console.log(`      ❌ Error linking ${productName}: ${err.message}`);
      }
    }
  }

  // 5. Link growers to stores (availableAtStores)
  console.log('\n🔗 LINKING GROWERS TO STORES...\n');
  
  for (const [growerName, storeNames] of Object.entries(GROWER_STORE_MAP)) {
    const growerId = growerMap[growerName];
    if (!growerId) {
      console.log(`   ❌ Grower not found: ${growerName}`);
      continue;
    }
    
    const storeRefs = storeNames
      .map(storeName => {
        const storeId = storeMap[storeName];
        if (!storeId) {
          console.log(`   ⚠️ Store not found: ${storeName}`);
          return null;
        }
        return { _type: 'reference', _ref: storeId, _key: storeId.replace('drafts.', '') };
      })
      .filter(Boolean);
    
    if (storeRefs.length === 0) continue;
    
    try {
      await client.patch(growerId)
        .set({ availableAtStores: storeRefs })
        .commit();
      console.log(`   ✅ ${growerName} → ${storeNames.join(', ')}`);
    } catch (err) {
      console.log(`   ❌ Error linking ${growerName}: ${err.message}`);
    }
  }

  // 6. Update grower products array (reverse link from products)
  console.log('\n🔗 UPDATING GROWER PRODUCT LISTS...\n');
  
  for (const [growerName, productNames] of Object.entries(PRODUCT_GROWER_MAP)) {
    const growerId = growerMap[growerName];
    if (!growerId) continue;
    
    const productRefs = productNames
      .map(productName => {
        const productId = productMap[productName];
        if (!productId) return null;
        return { _type: 'reference', _ref: productId, _key: productId.replace('drafts.', '') };
      })
      .filter(Boolean);
    
    if (productRefs.length === 0) continue;
    
    try {
      await client.patch(growerId)
        .set({ products: productRefs })
        .commit();
      console.log(`   ✅ ${growerName}: ${productRefs.length} products`);
    } catch (err) {
      console.log(`   ❌ Error updating ${growerName}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ PHASE C LINKING COMPLETE!');
  console.log('='.repeat(60));
}

linkProductsAndGrowers().catch(console.error);
