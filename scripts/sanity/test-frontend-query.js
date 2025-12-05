/**
 * Test Sanity Category Query
 * This tests the EXACT query that's failing in your frontend
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN, // Use read token for queries
});

async function testCategoryQuery() {
  console.log('🧪 Testing Category Query (Frontend Exact Match)...\n');
  
  try {
    // This is the EXACT query from your error message
    const query = `*[_type == "category" && !(_id in path("drafts.**"))] | order(name asc) {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "image": image.asset->url,
        "parentId": parent->_id,
        "productCount": count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
      }`;
    
    console.log('📡 Querying Sanity API...');
    console.log(`   Project: ${client.config().projectId}`);
    console.log(`   Dataset: ${client.config().dataset}`);
    console.log(`   API Version: ${client.config().apiVersion}\n`);
    
    const categories = await client.fetch(query);
    
    console.log(`✅ Query successful! Found ${categories.length} categories:\n`);
    
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name}`);
      console.log(`      Slug: ${cat.slug?.current || 'N/A'}`);
      console.log(`      Products: ${cat.productCount || 0}`);
      console.log(`      Has Image: ${cat.image ? '✅' : '❌'}`);
      console.log('');
    });
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found!');
      console.log('\nPossible causes:');
      console.log('  1. Categories not imported yet');
      console.log('  2. All categories are drafts (unpublished)');
      console.log('  3. Wrong dataset selected\n');
      console.log('Run this to import categories:');
      console.log('  node scripts/sanity/import-categories.js\n');
    }
    
    // Test if we can fetch categories without the complex projection
    console.log('\n📡 Testing simple category query...');
    const simpleQuery = `*[_type == "category"]`;
    const simpleResult = await client.fetch(simpleQuery);
    console.log(`   Total categories (including drafts): ${simpleResult.length}`);
    
    if (simpleResult.length > 0 && categories.length === 0) {
      console.log('\n⚠️  All categories are DRAFTS!');
      console.log('   Go to Sanity Studio and publish them:\n');
      console.log('   1. Open http://localhost:3333');
      console.log('   2. Click "Categories"');
      console.log('   3. Click each category');
      console.log('   4. Click "Publish" button (green, top right)\n');
    }
    
    return categories;
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('\nError details:', error);
    console.error('\nPossible causes:');
    console.error('  1. Invalid API token');
    console.error('  2. CORS not configured');
    console.error('  3. Network issue');
    console.error('  4. Sanity project ID mismatch\n');
    console.error('Check your .env.local file:');
    console.error(`  NEXT_PUBLIC_SANITY_PROJECT_ID=${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.error(`  SANITY_API_READ_TOKEN=${process.env.SANITY_API_READ_TOKEN ? '✅ Set' : '❌ Missing'}\n');
    throw error;
  }
}

// Run test
testCategoryQuery()
  .then(() => {
    console.log('\n✅ Test complete - Frontend query should work!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed - Frontend will have same error\n');
    process.exit(1);
  });
