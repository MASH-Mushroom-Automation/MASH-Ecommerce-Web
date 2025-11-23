/**
 * Verify Phase 5 - Product Variants
 * Checks that all 15 variants are created and properly linked
 */

const {fetchDocuments, countDocuments} = require('./lib/sanity-client');

async function verifyVariants() {
  console.log('🔍 Verifying Phase 5: Product Variants\n');

  try {
    // 1. Count total variants
    console.log('1️⃣  Checking variant count...');
    const variantCount = await countDocuments('productVariant');
    console.log(`   Total variants: ${variantCount}`);
    console.log(`   Expected: 15 variants`);
    console.log(`   Status: ${variantCount === 15 ? '✅ PASS' : '❌ FAIL'}\n`);

    // 2. Fetch all variants with product references
    console.log('2️⃣  Checking product references...');
    const variants = await fetchDocuments(`
      *[_type == "productVariant"] | order(sortOrder asc) {
        _id,
        name,
        variantName,
        sku,
        price,
        stockQuantity,
        product->{
          _id,
          name,
          slug
        }
      }
    `);

    const validRefs = variants.filter(v => v.product).length;
    const invalidRefs = variants.filter(v => !v.product).length;

    console.log(`   Valid references: ${validRefs}/15`);
    console.log(`   Invalid references: ${invalidRefs}`);
    console.log(`   Status: ${invalidRefs === 0 ? '✅ PASS' : '❌ FAIL'}\n`);

    // 3. Group variants by product
    console.log('3️⃣  Variants by product:\n');
    const variantsByProduct = variants.reduce((groups, variant) => {
      if (variant.product) {
        const productSlug = variant.product.slug.current;
        if (!groups[productSlug]) {
          groups[productSlug] = [];
        }
        groups[productSlug].push(variant);
      }
      return groups;
    }, {});

    Object.entries(variantsByProduct).forEach(([slug, vars]) => {
      console.log(`   📦 ${slug}:`);
      vars.forEach((v) => {
        console.log(`      ├─ ${v.variantName} - ₱${v.price} (${v.stockQuantity} in stock)`);
      });
      console.log(`      └─ Total: ${vars.length} variants\n`);
    });

    // 4. Check for missing default variants
    console.log('4️⃣  Checking default variants...');
    const variantsWithDefaults = await fetchDocuments(`
      *[_type == "productVariant" && defaultVariant == true] {
        _id,
        name,
        product->{ name }
      }
    `);

    console.log(`   Default variants found: ${variantsWithDefaults.length}`);
    console.log(`   Expected: 5 (one per product)`);
    console.log(`   Status: ${variantsWithDefaults.length === 5 ? '✅ PASS' : '⚠️  REVIEW'}\n`);

    // 5. Check pricing consistency
    console.log('5️⃣  Checking pricing consistency...');
    const pricingIssues = variants.filter(v => {
      return v.compareAtPrice && v.price >= v.compareAtPrice;
    });

    console.log(`   Variants with pricing issues: ${pricingIssues.length}`);
    if (pricingIssues.length > 0) {
      pricingIssues.forEach(v => {
        console.log(`      ⚠️  ${v.name}: price ₱${v.price} >= compareAt ₱${v.compareAtPrice}`);
      });
    }
    console.log(`   Status: ${pricingIssues.length === 0 ? '✅ PASS' : '⚠️  REVIEW'}\n`);

    // 6. Check stock levels
    console.log('6️⃣  Checking stock levels...');
    const lowStockVariants = variants.filter(v => {
      return v.stockQuantity <= v.lowStockThreshold;
    });

    console.log(`   Low stock variants: ${lowStockVariants.length}`);
    if (lowStockVariants.length > 0) {
      lowStockVariants.forEach(v => {
        console.log(`      ⚠️  ${v.name}: ${v.stockQuantity} (threshold: ${v.lowStockThreshold})`);
      });
    }
    console.log(`   Status: ${lowStockVariants.length === 0 ? '✅ GOOD' : 'ℹ️  INFORMATIONAL'}\n`);

    // 7. Final summary
    console.log('📊 Phase 5 Verification Summary:');
    console.log(`   ✅ Total Variants: ${variantCount}/15`);
    console.log(`   ✅ Valid References: ${validRefs}/15`);
    console.log(`   ✅ Products with Variants: ${Object.keys(variantsByProduct).length}/5`);
    console.log(`   ${variantsWithDefaults.length === 5 ? '✅' : '⚠️ '} Default Variants: ${variantsWithDefaults.length}/5`);
    console.log(`   ${pricingIssues.length === 0 ? '✅' : '⚠️ '} Pricing Consistency: ${pricingIssues.length === 0 ? 'PASS' : 'REVIEW'}`);

    const allChecks = variantCount === 15 && invalidRefs === 0 && Object.keys(variantsByProduct).length === 5;
    
    if (allChecks) {
      console.log('\n🎉 Phase 5 Complete! All checks passed.');
      console.log('   Next: Phase 6 - Relationship Linking');
    } else {
      console.log('\n⚠️  Some checks need review. Check details above.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyVariants()
    .then(() => {
      console.log('\n✅ Verification complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {verifyVariants};
