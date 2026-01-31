/**
 * Update Sanity Product Stock Data
 * 
 * Sets all products to inStock: true with correct stock quantities.
 * Uses the stock values provided by the user.
 * 
 * Usage: node scripts/update-product-stock.js
 */

const sanityClient = require('@sanity/client');
require('dotenv').config();

// Initialize Sanity client with write token
const client = sanityClient.default({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Product stock data from user's list
const productStockData = {
  'turkey-tail-mushroom-extract': 80,
  'cordyceps-mushroom-capsules': 70,
  'black-truffle-slices': 25,
  'morel-mushrooms-dried': 30,
  'fresh-cremini-mushrooms': 100,
  'dried-porcini-mushrooms': 60,
  'reishi-mushroom-growing-kit': 35,
  'chaga-mushroom-powder': 55,
  'frozen-matsutake-mushrooms': 20,
  'lions-mane-mushroom-powder': 65,
  'mushroom-coffee-blend': 75,
  'white-beech-mushrooms': 90,
  'golden-oyster-mushroom-kit': 45,
  'mushroom-jerky-snack': 100,
  'lions-mane-mushroom-growing-kit': 15,
  'fresh-portobello-mushrooms': 90,
  'fresh-lions-mane-mushrooms': 80,
  'fresh-king-oyster-mushrooms': 100,
  'oyster-mushroom-growing-kit': 25,
  'mushroom-powder': 30,
  'dried-shiitake-mushrooms': 50,
  'fresh-shiitake-mushrooms': 120,
  'fresh-oyster-mushrooms': 150,
  'beginner-mushroom-combo-kit': 10,
  'shiitake-mushroom-growing-kit': 20,
  'dried-mixed-mushrooms': 40,
  'dried-oyster-mushrooms': 60,
  'fresh-button-mushrooms': 200,
};

async function updateProductStock() {
  console.log('🔄 Starting product stock update...\n');

  try {
    // Fetch all products
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        "slug": slug.current,
        stock,
        inStock
      }
    `);

    console.log(`📦 Found ${products.length} products in Sanity\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Update each product
    for (const product of products) {
      const stockQuantity = productStockData[product.slug];

      if (stockQuantity !== undefined) {
        try {
          await client
            .patch(product._id)
            .set({
              stock: stockQuantity,
              inStock: true,
            })
            .commit();

          console.log(`✅ Updated: ${product.name}`);
          console.log(`   - Stock: ${stockQuantity}`);
          console.log(`   - In Stock: true\n`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error updating ${product.name}:`, error.message);
          errors.push({ product: product.name, error: error.message });
        }
      } else {
        // No stock data found - set to default (50 units, in stock)
        try {
          await client
            .patch(product._id)
            .set({
              stock: 50,
              inStock: true,
            })
            .commit();

          console.log(`⚠️ Updated (default): ${product.name}`);
          console.log(`   - Stock: 50 (default)`);
          console.log(`   - In Stock: true\n`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error updating ${product.name}:`, error.message);
          errors.push({ product: product.name, error: error.message });
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Update Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ product, error }) => {
        console.log(`   - ${product}: ${error}`);
      });
    }

    console.log('\n✅ Stock update complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Test chatbot: "show me mushrooms"');
    console.log('   3. Verify products show "In Stock"');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the update
updateProductStock();
