/**
 * Quick test to verify Sanity products are accessible
 * Run: node scripts/test-sanity-products.js
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-11-26',
});

async function testProducts() {
  try {
    console.log('Fetching products from Sanity...');
    
    const query = `*[_type == "product" && !(_id in path("drafts.**"))] {
      _id,
      name,
      "slug": slug.current,
      price,
      inStock
    }`;
    
    const products = await client.fetch(query);
    
    console.log(`✅ SUCCESS: Fetched ${products.length} products`);
    console.log('\nFirst 3 products:');
    products.slice(0, 3).forEach(p => {
      console.log(`  - ${p.name} (₱${p.price}) - ${p.inStock ? 'In Stock' : 'Out of Stock'}`);
    });
    
    const inStock = products.filter(p => p.inStock).length;
    console.log(`\n📊 Summary:`);
    console.log(`  Total products: ${products.length}`);
    console.log(`  In stock: ${inStock}`);
    console.log(`  Out of stock: ${products.length - inStock}`);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testProducts();
