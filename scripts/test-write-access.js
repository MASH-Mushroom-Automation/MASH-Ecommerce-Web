/**
 * Test Sanity Write Access
 * Verifies that API tokens can write to Sanity
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function testWriteAccess() {
  console.log('🔐 Testing Sanity Write Access...\n');
  
  try {
    // 1. Fetch a product
    const product = await client.fetch('*[_type == "product"][0]{_id, name, quantity}');
    
    if (!product) {
      console.log('❌ No products found');
      return;
    }
    
    console.log('📦 Found product:', product.name);
    console.log('   ID:', product._id);
    console.log('   Current quantity:', product.quantity);
    
    // 2. Try to update (just touch it)
    const updated = await client
      .patch(product._id)
      .set({ quantity: product.quantity || 100 })
      .commit();
    
    console.log('\n✅ Write SUCCESS!');
    console.log('   Updated:', updated.name);
    console.log('   Token has write access.\n');
    
    // 3. Check CORS origins
    console.log('📋 CORS Note:');
    console.log('   If Sanity Studio shows "read-only" error,');
    console.log('   ensure you are LOGGED IN to Sanity in the browser.');
    console.log('   Visit: https://www.sanity.io/manage/project/gerattrr/api#cors');
    console.log('   Add: http://localhost:3333 (with credentials allowed)');
    
  } catch (error) {
    console.log('❌ Write FAILED:', error.message);
    console.log('\nPossible fixes:');
    console.log('1. Check SANITY_API_WRITE_TOKEN in .env.local');
    console.log('2. Token may need "Editor" or "Admin" permissions');
    console.log('3. Regenerate token at: https://www.sanity.io/manage/project/gerattrr/api#tokens');
  }
}

testWriteAccess();
