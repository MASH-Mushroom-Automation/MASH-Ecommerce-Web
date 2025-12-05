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
async function importReviews() {
  console.log('⭐ Importing Product Reviews to Sanity...\n');

  try {
    // Step 1: Load reviews data
    const reviewsPath = join(__dirname, '../../data/sanity/reviews.json');
    const reviewsData = JSON.parse(readFileSync(reviewsPath, 'utf-8'));
    console.log(`📝 Loaded ${reviewsData.length} reviews from reviews.json\n`);

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

    // Step 3: Check existing reviews for deduplication
    console.log('2️⃣  Checking existing reviews...');
    const existingReviews = await fetchDocuments(`
      *[_type == "review"]{ 
        customerEmail, 
        "productSlug": product->slug.current 
      }
    `);
    
    // Create unique key for deduplication (email + product slug)
    const existingKeys = existingReviews.map(r => 
      `${r.customerEmail}__${r.productSlug}`
    ).filter(Boolean);
    
    console.log(`   Current reviews in Sanity: ${existingReviews.length}`);
    if (existingKeys.length > 0) {
      console.log(`   Found ${existingKeys.length} unique review keys\n`);
    }

    // Step 4: Transform reviews with product references
    console.log('3️⃣  Transforming reviews with product references...');
    const transformedReviews = reviewsData.map(review => {
      const productId = productMap[review.productSlug];
      
      if (!productId) {
        console.warn(`   ⚠️  Warning: Product not found for slug "${review.productSlug}"`);
        return null;
      }

      // Remove productSlug and add product reference
      const { productSlug, ...reviewWithoutSlug } = review;

      return {
        ...reviewWithoutSlug,
        product: {
          _type: 'reference',
          _ref: productId,
        },
      };
    }).filter(review => review !== null);

    console.log(`   Transformed ${transformedReviews.length} reviews\n`);

    // Step 5: Filter out existing reviews (deduplication)
    const newReviews = transformedReviews.filter(review => {
      const productSlug = Object.keys(productMap).find(slug => 
        productMap[slug] === review.product._ref
      );
      const key = `${review.customerEmail}__${productSlug}`;
      return !existingKeys.includes(key);
    });

    console.log('4️⃣  Reviews to import:');
    console.log(`   Total: ${reviewsData.length}`);
    console.log(`   Already exist: ${reviewsData.length - newReviews.length}`);
    console.log(`   New: ${newReviews.length}\n`);

    if (newReviews.length === 0) {
      console.log('✅ All reviews already exist. No import needed.');
      return;
    }

    // Step 6: Group reviews by product for display
    const reviewsByProduct = newReviews.reduce((groups, review) => {
      const productSlug = Object.keys(productMap).find(slug => 
        productMap[slug] === review.product._ref
      );
      if (!groups[productSlug]) {
        groups[productSlug] = [];
      }
      groups[productSlug].push(review);
      return groups;
    }, {});

    console.log('   New reviews grouped by product:');
    Object.entries(reviewsByProduct).forEach(([slug, reviews]) => {
      const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      console.log(`   📦 ${slug}: ${reviews.length} reviews (avg ${avgRating}⭐)`);
    });
    console.log();

    // Step 7: Import new reviews
    console.log('5️⃣  Creating reviews in Sanity...');
    
    const results = [];
    let importedCount = 0;
    
    for (let i = 0; i < newReviews.length; i++) {
      const review = newReviews[i];
      try {
        await createDocument(review);
        results.push({ success: true, review });
        importedCount++;
        
        // Log progress every 10 reviews
        if ((i + 1) % 10 === 0 || i === newReviews.length - 1) {
          console.log(`   Progress: ${i + 1}/${newReviews.length} reviews...`);
        }
      } catch (error) {
        results.push({ success: false, review, error: error.message });
        console.log(`   ❌ Failed: ${review.customerName} - ${error.message}`);
      }
    }

    console.log();

    // Step 8: Display summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('📊 Import Summary:');
    console.log(`   ✅ Successfully created: ${successCount} reviews`);
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount} reviews`);
    }
    console.log();

    // Step 9: Verify reviews with statistics
    console.log('6️⃣  Verifying reviews in Sanity...');
    const allReviews = await fetchDocuments(`
      *[_type == "review"] {
        _id,
        rating,
        customerName,
        "productSlug": product->slug.current,
        verifiedPurchase,
        status
      }
    `);
    
    console.log(`   Total reviews: ${allReviews.length}`);
    console.log(`   Verified purchases: ${allReviews.filter(r => r.verifiedPurchase).length}`);
    console.log(`   Approved reviews: ${allReviews.filter(r => r.status === 'approved').length}`);
    
    // Calculate rating distribution
    const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allReviews.filter(r => r.rating === rating).length,
    }));
    
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2);
    
    console.log(`   Average rating: ${avgRating}⭐`);
    console.log();
    console.log('   Rating distribution:');
    ratingDist.reverse().forEach(({ rating, count }) => {
      const percentage = ((count / allReviews.length) * 100).toFixed(1);
      const stars = '⭐'.repeat(rating);
      const bar = '█'.repeat(Math.round(percentage / 2));
      console.log(`   ${stars} ${rating}: ${bar} ${count} (${percentage}%)`);
    });
    
    // Group reviews by product
    const reviewsByProductFinal = allReviews.reduce((groups, review) => {
      if (!groups[review.productSlug]) {
        groups[review.productSlug] = [];
      }
      groups[review.productSlug].push(review);
      return groups;
    }, {});
    
    console.log();
    console.log('   Reviews per product:');
    Object.entries(reviewsByProductFinal)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .forEach(([slug, reviews]) => {
        const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        console.log(`   📦 ${slug}: ${reviews.length} reviews (${avg}⭐)`);
      });

    console.log();
    console.log('🎉 Review import complete!');
    console.log('✅ Phase 7 Complete: Bundles & Reviews!');
    console.log('🚀 Ready for Phase 8: Validation!');
    
  } catch (error) {
    console.error('\n❌ Review import failed:', error);
    process.exit(1);
  }
}

// Run import
importReviews();
