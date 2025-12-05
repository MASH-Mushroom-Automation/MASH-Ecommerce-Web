require('dotenv').config({ path: '.env.local' });
const { readFileSync } = require('fs');
const { join } = require('path');
const { createClient } = require('@sanity/client');

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// Helper function to fetch documents
async function fetchDocuments(query) {
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

// Helper function to create document
async function createDocument(doc) {
  try {
    return await client.create(doc);
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

// Main import function
async function importBundles() {
  console.log('🎁 Importing Product Bundles to Sanity...\n');

  try {
    // Step 1: Load bundles data
    const bundlesPath = join(__dirname, '../../data/sanity/bundles.json');
    const bundlesData = JSON.parse(readFileSync(bundlesPath, 'utf-8'));
    console.log(`📦 Loaded ${bundlesData.length} bundles from bundles.json\n`);

    // Step 2: Fetch existing products to create slug → ID map
    console.log('1️⃣  Fetching products for reference mapping...');
    const products = await fetchDocuments('*[_type == "product"]{ _id, slug }');
    console.log(`   Found ${products.length} products in Sanity\n`);

    // Create product slug → ID map
    const productMap = products.reduce((map, product) => {
      if (product.slug?.current) {
        map[product.slug.current] = product._id;
      }
      return map;
    }, {});

    // Step 3: Check existing bundles for deduplication
    console.log('2️⃣  Checking existing bundles...');
    const existingBundles = await fetchDocuments('*[_type == "productBundle"]{ slug }');
    const existingSlugs = existingBundles.map(b => b.slug?.current).filter(Boolean);
    console.log(`   Current bundles in Sanity: ${existingBundles.length}`);
    
    if (existingSlugs.length > 0) {
      console.log(`   Existing slugs: ${existingSlugs.join(', ')}\n`);
    }

    // Step 4: Transform bundles with product references
    console.log('3️⃣  Transforming bundles with product references...');
    const transformedBundles = bundlesData.map(bundle => {
      // Convert product slugs to proper products array structure
      const products = bundle.productSlugs
        .map((slug, index) => {
          const productId = productMap[slug];
          if (!productId) {
            console.warn(`   ⚠️  Warning: Product not found for slug "${slug}"`);
            return null;
          }
          return {
            _type: 'object',
            _key: `${productId}-${index}`,
            product: {
              _type: 'reference',
              _ref: productId,
            },
            quantity: 1,
          };
        })
        .filter(ref => ref !== null);

      // Remove productSlugs array and add products
      const { productSlugs, ...bundleWithoutSlugs } = bundle;

      return {
        ...bundleWithoutSlugs,
        products,
      };
    });

    console.log(`   Transformed ${transformedBundles.length} bundles\n`);

    // Step 5: Filter out existing bundles (deduplication)
    const newBundles = transformedBundles.filter(bundle => 
      !existingSlugs.includes(bundle.slug?.current)
    );

    console.log('4️⃣  Bundles to import:');
    console.log(`   Total: ${bundlesData.length}`);
    console.log(`   Already exist: ${bundlesData.length - newBundles.length}`);
    console.log(`   New: ${newBundles.length}\n`);

    if (newBundles.length === 0) {
      console.log('✅ All bundles already exist. No import needed.');
      return;
    }

    // Step 6: Display bundle details
    console.log('   New bundles to create:');
    newBundles.forEach((bundle, index) => {
      const originalPrice = Math.round(bundle.bundlePrice / (1 - bundle.discountPercentage / 100));
      console.log(`   ${index + 1}. ${bundle.bundleName}`);
      console.log(`      ├─ Products: ${bundle.products.length} items`);
      console.log(`      ├─ Price: ₱${bundle.bundlePrice} (was ₱${originalPrice})`);
      console.log(`      └─ Save: ${bundle.discountPercentage}% (₱${bundle.savingsAmount})`);
    });
    console.log();

    // Step 7: Import new bundles
    console.log('5️⃣  Creating bundles in Sanity...');
    
    const results = [];
    for (let i = 0; i < newBundles.length; i++) {
      const bundle = newBundles[i];
      try {
        const result = await createDocument(bundle);
        results.push({ success: true, bundle });
        console.log(`   ✅ Created: ${bundle.bundleName}`);
      } catch (error) {
        results.push({ success: false, bundle, error: error.message });
        console.log(`   ❌ Failed: ${bundle.bundleName} - ${error.message}`);
      }
    }

    console.log();

    // Step 8: Display summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('📊 Import Summary:');
    console.log(`   ✅ Successfully created: ${successCount} bundles`);
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount} bundles`);
    }
    console.log();

    // Step 9: Verify bundles
    console.log('6️⃣  Verifying bundles in Sanity...');
    const allBundles = await fetchDocuments(`
      *[_type == "productBundle"] | order(sortOrder asc) {
        _id,
        bundleName,
        slug,
        bundlePrice,
        discountPercentage,
        "productCount": count(bundleProducts)
      }
    `);
    
    console.log(`   Total bundles: ${allBundles.length}`);
    console.log(`   Featured bundles: ${allBundles.filter(b => b.featuredBundle).length}`);
    console.log(`   Average savings: ${Math.round(allBundles.reduce((sum, b) => sum + b.discountPercentage, 0) / allBundles.length)}%`);
    console.log();

    console.log('   Bundle details:');
    allBundles.forEach((bundle, index) => {
      console.log(`   ${index + 1}. ${bundle.bundleName}`);
      console.log(`      ├─ Products: ${bundle.productCount}`);
      console.log(`      ├─ Price: ₱${bundle.bundlePrice}`);
      console.log(`      └─ Discount: ${bundle.discountPercentage}%`);
    });

    console.log();
    console.log('🎉 Bundle import complete!');
    console.log('🚀 Ready for Phase 7.2: Reviews Import!');
    
  } catch (error) {
    console.error('\n❌ Bundle import failed:', error);
    process.exit(1);
  }
}

// Run import
importBundles();
