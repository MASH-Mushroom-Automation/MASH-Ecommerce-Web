/**
 * Import Product Variants to Sanity
 * Creates 15 variants for 5 products with size/weight options
 */

const fs = require('fs');
const path = require('path');
const {createDocuments, countDocuments, fetchDocuments} = require('./lib/sanity-client');

async function importVariants() {
  console.log('🎨 Importing Product Variants to Sanity...\n');

  try {
    // Check existing variants
    const existingCount = await countDocuments('productVariant');
    console.log(`   Current variants in Sanity: ${existingCount}`);

    // Fetch existing variant SKUs to prevent duplicates
    const existingVariants = await fetchDocuments('*[_type == "productVariant"]{ sku }');
    const existingSKUs = existingVariants.map(variant => variant.sku);
    console.log(`   Existing SKUs: ${existingSKUs.join(', ') || 'none'}`);

    // Fetch all products to get IDs for reference mapping
    console.log('   Fetching products...');
    const products = await fetchDocuments('*[_type == "product"]{ _id, slug }');
    console.log(`   Found ${products.length} products in Sanity`);

    // Create product slug to ID map
    const productMap = products.reduce((map, product) => {
      map[product.slug.current] = product._id;
      return map;
    }, {});

    // Load variant data
    const dataPath = path.join(__dirname, '../../data/sanity/variants.json');
    const allVariants = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Transform variants: Add product references
    const transformedVariants = allVariants.map(variant => {
      const productId = productMap[variant.productSlug];
      
      if (!productId) {
        console.warn(`   ⚠️  Product not found for slug: ${variant.productSlug}`);
        return null;
      }

      // Create transformed variant with product reference
      const transformed = {
        ...variant,
        product: {
          _type: 'reference',
          _ref: productId
        }
      };

      // Remove productSlug (we've converted it to a reference)
      delete transformed.productSlug;

      return transformed;
    }).filter(v => v !== null); // Remove null entries (missing products)

    // Filter out variants that already exist (deduplication by SKU)
    const variants = transformedVariants.filter(variant => !existingSKUs.includes(variant.sku));
    console.log(`   Variants to import: ${variants.length} (${transformedVariants.length - variants.length} skipped - already exist)\n`);

    // Skip if no new variants to import
    if (variants.length === 0) {
      console.log('✅ All variants already exist. No import needed.\n');
      return;
    }

    // Group variants by product for better logging
    const variantsByProduct = variants.reduce((groups, variant) => {
      const productSlug = Object.keys(productMap).find(slug => productMap[slug] === variant.product._ref);
      if (!groups[productSlug]) {
        groups[productSlug] = [];
      }
      groups[productSlug].push(variant);
      return groups;
    }, {});

    console.log('   Variants grouped by product:');
    Object.entries(variantsByProduct).forEach(([slug, vars]) => {
      console.log(`      ${slug}: ${vars.length} variants`);
    });

    // Create variants
    console.log('\n   Creating variants...');
    const result = await createDocuments(variants);
    
    console.log(`\n✅ Successfully imported ${result.results.length} variants:`);
    
    // Display results by variant name (simpler logging)
    result.results.forEach((variant, index) => {
      console.log(`   ${index + 1}. ${variant.name} - ₱${variant.price} (${variant.sku})`);
    });

    // Verify final count
    const finalCount = await countDocuments('productVariant');
    console.log(`\n📊 Total variants in Sanity: ${finalCount}`);
    console.log('   Expected: 15 variants across 5 products');

    // Verify product references are valid
    console.log('\n🔍 Verifying product references...');
    const variantsWithProducts = await fetchDocuments(`
      *[_type == "productVariant"] {
        _id,
        name,
        product->{
          _id,
          name
        }
      }
    `);

    const withValidRefs = variantsWithProducts.filter(v => v.product).length;
    const withInvalidRefs = variantsWithProducts.filter(v => !v.product).length;

    console.log(`   ✅ Valid references: ${withValidRefs}`);
    if (withInvalidRefs > 0) {
      console.log(`   ❌ Invalid references: ${withInvalidRefs}`);
    }

    console.log('\n✅ Variant import complete!');
    console.log('   Verify in Studio: http://localhost:3333 → Product Variants');
    console.log('🎉 Ready for Phase 6: Relationship Linking!\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run import
if (require.main === module) {
  importVariants()
    .then(() => {
      console.log('✅ Process complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {importVariants};
