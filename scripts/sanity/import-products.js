/**
 * Import Products to Sanity
 * Creates 15 products with full schema and category references
 */

const fs = require('fs');
const path = require('path');
const {createDocuments, countDocuments, fetchDocuments} = require('./lib/sanity-client');

async function importProducts() {
  console.log('📦 Importing Products to Sanity...\n');

  try {
    // Check existing products
    const existingCount = await countDocuments('product');
    console.log(`   Current products in Sanity: ${existingCount}`);

    // Fetch categories to get IDs for references
    console.log('   Fetching categories...');
    const categories = await fetchDocuments('*[_type == "category"]{ _id, "slug": slug.current }');
    
    if (categories.length === 0) {
      throw new Error('No categories found. Please run import-categories.js first.');
    }

    // Create category slug to ID map
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.slug] = { _type: 'reference', _ref: cat._id };
      return map;
    }, {});
    
    console.log(`   Found ${categories.length} categories:`, Object.keys(categoryMap).join(', '));

    // Fetch existing product slugs to prevent duplicates
    const existingProducts = await fetchDocuments('*[_type == "product"]{ "slug": slug.current }');
    const existingSlugs = existingProducts.map(p => p.slug);
    console.log(`   Existing product slugs: ${existingSlugs.join(', ') || 'none'}`);

    // Load product data
    const dataPath = path.join(__dirname, '../../data/sanity/products.json');
    const allProducts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Map category slugs to references and validate
    allProducts.forEach((product, index) => {
      const categoryRef = categoryMap[product.categorySlug];
      if (!categoryRef) {
        throw new Error(`Category not found for slug "${product.categorySlug}" in product: ${product.name}`);
      }
      product.category = categoryRef;
      delete product.categorySlug; // Remove temporary field
    });
    
    // Filter out products that already exist (deduplication)
    const products = allProducts.filter(p => !existingSlugs.includes(p.slug.current));
    console.log(`   Products to import: ${products.length} (${allProducts.length - products.length} skipped - already exist)\n`);

    // Skip if no new products to import
    if (products.length === 0) {
      console.log('✅ All products already exist. No import needed.');
      const finalCount = await countDocuments('product');
      console.log(`\n📊 Total products in Sanity: ${finalCount}`);
      return { results: [] };
    }

    // Create products
    console.log('   Creating products...');
    const result = await createDocuments(products);
    
    console.log(`\n✅ Successfully imported ${result.results.length} products:`);
    result.results.forEach((prod, index) => {
      const productName = products[index].name;
      const productSku = products[index].sku;
      console.log(`   ${index + 1}. ${productName} (SKU: ${productSku})`);
    });

    // Verify
    const newCount = await countDocuments('product');
    console.log(`\n📊 Total products in Sanity: ${newCount}`);

    // Show category distribution
    console.log('\n📊 Products by Category:');
    const categoryCounts = {};
    allProducts.forEach(p => {
      const catSlug = Object.keys(categoryMap).find(slug => 
        categoryMap[slug]._ref === p.category._ref
      );
      categoryCounts[catSlug] = (categoryCounts[catSlug] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([slug, count]) => {
      console.log(`   ${slug}: ${count} products`);
    });

    return result;

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    throw error;
  }
}

// Run import
if (require.main === module) {
  importProducts()
    .then(() => {
      console.log('\n✅ Product import complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = {importProducts};
