/**
 * Delete All Products from Sanity
 * Use this to clean up before re-importing fixed products
 */

const {deleteDocuments, countDocuments} = require('./lib/sanity-client');

async function deleteAllProducts() {
  console.log('🗑️  Deleting all products from Sanity...\n');

  try {
    // Count before
    const beforeCount = await countDocuments('product');
    console.log(`   Products before deletion: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log('\n   No products to delete.\n');
      return;
    }

    // Delete all products
    const deletedCount = await deleteDocuments('*[_type == "product"]');
    
    // Count after
    const afterCount = await countDocuments('product');
    console.log(`   Products after deletion: ${afterCount}`);
    console.log(`\n✅ Deleted ${deletedCount} products\n`);

    return deletedCount;

  } catch (error) {
    console.error('\n❌ Deletion failed:', error.message);
    throw error;
  }
}

// Run deletion
if (require.main === module) {
  deleteAllProducts()
    .then(() => {
      console.log('✅ All products deleted! You can now run:');
      console.log('   node scripts/sanity/import-products.js\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deletion failed:', error);
      process.exit(1);
    });
}

module.exports = {deleteAllProducts};
