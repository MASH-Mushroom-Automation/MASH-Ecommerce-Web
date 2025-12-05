/**
 * Link Product Relationships in Sanity
 * Updates products with suggestedProducts, complementaryProducts, and relatedBundles references
 */

const fs = require('fs');
const path = require('path');
const {fetchDocuments, updateDocument} = require('./lib/sanity-client');

async function linkRelationships() {
  console.log('🔗 Linking Product Relationships in Sanity...\n');

  try {
    // Fetch all products to get slug-to-ID mapping
    console.log('1️⃣  Fetching products...');
    const products = await fetchDocuments('*[_type == "product"]{ _id, slug }');
    console.log(`   Found ${products.length} products in Sanity`);

    // Create product slug to ID map
    const productMap = products.reduce((map, product) => {
      map[product.slug.current] = product._id;
      return map;
    }, {});

    // Load relationship mappings
    const dataPath = path.join(__dirname, '../../data/sanity/relationships.json');
    const relationships = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`   Loaded relationships for ${Object.keys(relationships).length} products\n`);

    // Process each product and update relationships
    console.log('2️⃣  Linking relationships...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const [slug, relations] of Object.entries(relationships)) {
      const productId = productMap[slug];
      
      if (!productId) {
        console.warn(`   ⚠️  Product not found for slug: ${slug}`);
        errorCount++;
        errors.push({ slug, error: 'Product not found' });
        continue;
      }

      try {
        // Convert slug arrays to Sanity references
        const updates = {};

        // Suggested Products (You May Also Like)
        if (relations.suggestedProducts && relations.suggestedProducts.length > 0) {
          updates.suggestedProducts = relations.suggestedProducts
            .map(relSlug => {
              const relId = productMap[relSlug];
              if (!relId) {
                console.warn(`      ⚠️  Suggested product not found: ${relSlug}`);
                return null;
              }
              return { _type: 'reference', _ref: relId, _key: relId };
            })
            .filter(ref => ref !== null);
        }

        // Complementary Products (Frequently Bought Together)
        if (relations.complementaryProducts && relations.complementaryProducts.length > 0) {
          updates.complementaryProducts = relations.complementaryProducts
            .map(relSlug => {
              const relId = productMap[relSlug];
              if (!relId) {
                console.warn(`      ⚠️  Complementary product not found: ${relSlug}`);
                return null;
              }
              return { _type: 'reference', _ref: relId, _key: relId };
            })
            .filter(ref => ref !== null);
        }

        // Related Bundles (if any in future)
        if (relations.relatedBundles && relations.relatedBundles.length > 0) {
          updates.relatedBundles = relations.relatedBundles
            .map(relSlug => {
              const relId = productMap[relSlug];
              if (!relId) {
                console.warn(`      ⚠️  Related bundle not found: ${relSlug}`);
                return null;
              }
              return { _type: 'reference', _ref: relId, _key: relId };
            })
            .filter(ref => ref !== null);
        }

        // Update product with relationships
        await updateDocument(productId, updates);
        
        console.log(`   ✅ ${slug}:`);
        console.log(`      ├─ Suggested: ${updates.suggestedProducts?.length || 0}`);
        console.log(`      ├─ Complementary: ${updates.complementaryProducts?.length || 0}`);
        console.log(`      └─ Bundles: ${updates.relatedBundles?.length || 0}`);
        
        successCount++;
      } catch (error) {
        console.error(`   ❌ ${slug}: ${error.message}`);
        errorCount++;
        errors.push({ slug, error: error.message });
      }
    }

    // Summary
    console.log(`\n📊 Linking Summary:`);
    console.log(`   ✅ Successfully linked: ${successCount} products`);
    console.log(`   ❌ Failed: ${errorCount} products`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach(err => {
        console.log(`   - ${err.slug}: ${err.error}`);
      });
    }

    // Verify relationships
    console.log(`\n3️⃣  Verifying relationships...\n`);
    const verifiedProducts = await fetchDocuments(`
      *[_type == "product"] {
        _id,
        name,
        slug,
        "suggestedCount": count(suggestedProducts),
        "complementaryCount": count(complementaryProducts),
        "bundlesCount": count(relatedBundles)
      }
    `);

    const withSuggested = verifiedProducts.filter(p => p.suggestedCount > 0).length;
    const withComplementary = verifiedProducts.filter(p => p.complementaryCount > 0).length;
    
    console.log(`   Products with suggested products: ${withSuggested}/${products.length}`);
    console.log(`   Products with complementary products: ${withComplementary}/${products.length}`);

    // Display top 5 products with their relationships
    console.log(`\n   Sample relationship links:\n`);
    verifiedProducts.slice(0, 5).forEach(p => {
      console.log(`   📦 ${p.name}:`);
      console.log(`      ├─ Suggested: ${p.suggestedCount}`);
      console.log(`      ├─ Complementary: ${p.complementaryCount}`);
      console.log(`      └─ Bundles: ${p.bundlesCount}`);
    });

    if (successCount === products.length && errorCount === 0) {
      console.log('\n🎉 All product relationships linked successfully!');
      console.log('   Verify in Studio: http://localhost:3333 → Products → Select product → Scroll to relationships');
      console.log('🚀 Ready for Phase 7: Bundles & Reviews!\n');
    } else {
      console.log('\n⚠️  Some products failed to link. Check errors above.');
    }

  } catch (error) {
    console.error('❌ Linking failed:', error.message);
    process.exit(1);
  }
}

// Run linking
if (require.main === module) {
  linkRelationships()
    .then(() => {
      console.log('✅ Process complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {linkRelationships};
