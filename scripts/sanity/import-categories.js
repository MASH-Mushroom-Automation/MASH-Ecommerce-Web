/**
 * Import Categories to Sanity
 * Creates 3 main product categories
 */

const fs = require('fs');
const path = require('path');
const {createDocuments, countDocuments, fetchDocuments} = require('./lib/sanity-client');

async function importCategories() {
  console.log('📦 Importing Categories to Sanity...\n');

  try {
    // Check existing categories
    const existingCount = await countDocuments('category');
    console.log(`   Current categories in Sanity: ${existingCount}`);

    // Fetch existing category slugs to prevent duplicates
    const existingCategories = await fetchDocuments('*[_type == "category"]{ slug }');
    const existingSlugs = existingCategories.map(cat => cat.slug.current);
    console.log(`   Existing slugs: ${existingSlugs.join(', ') || 'none'}`);

    // Load category data
    const dataPath = path.join(__dirname, '../../data/sanity/categories.json');
    const allCategories = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Filter out categories that already exist (deduplication)
    const categories = allCategories.filter(cat => !existingSlugs.includes(cat.slug.current));
    console.log(`   Categories to import: ${categories.length} (${allCategories.length - categories.length} skipped - already exist)\n`);

    // Skip if no new categories to import
    if (categories.length === 0) {
      console.log('✅ All categories already exist. No import needed.');
      return { results: [] };
    }

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
