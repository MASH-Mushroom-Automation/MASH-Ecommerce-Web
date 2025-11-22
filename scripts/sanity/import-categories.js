/**
 * Import Categories to Sanity
 * Creates 3 main product categories
 */

const fs = require('fs');
const path = require('path');
const {createDocuments, countDocuments} = require('./lib/sanity-client');

async function importCategories() {
  console.log('📦 Importing Categories to Sanity...\n');

  try {
    // Check existing categories
    const existingCount = await countDocuments('category');
    console.log(`   Current categories in Sanity: ${existingCount}`);

    // Load category data
    const dataPath = path.join(__dirname, '../../data/sanity/categories.json');
    const categories = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`   Categories to import: ${categories.length}\n`);

    // Create categories
    console.log('   Creating categories...');
    const result = await createDocuments(categories);
    
    console.log(`\n✅ Successfully imported ${result.results.length} categories:`);
    result.results.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${categories[index].categoryName} (${cat._id})`);
    });

    // Verify
    const newCount = await countDocuments('category');
    console.log(`\n📊 Total categories in Sanity: ${newCount}`);

    return result;

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    throw error;
  }
}

// Run import
if (require.main === module) {
  importCategories()
    .then(() => {
      console.log('\n✅ Category import complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = {importCategories};
