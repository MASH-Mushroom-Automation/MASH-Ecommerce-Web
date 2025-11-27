/**
 * Fix Category Field Names
 * Updates old field names to match current schema
 * 
 * OLD FIELDS → NEW FIELDS:
 * - categoryName → name
 * - featuredCategory → featured
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function fixCategoryFields() {
  console.log('🔧 Fixing Category Field Names...\n');
  
  try {
    // 1. Fetch all categories (including drafts)
    const categories = await client.fetch(`*[_type == "category"]`);
    
    console.log(`📦 Found ${categories.length} categories\n`);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Run import-categories.js first.\n');
      return;
    }
    
    let fixedCount = 0;
    
    for (const category of categories) {
      let needsUpdate = false;
      const updates = {};
      
      // Check for old field: categoryName
      if (category.categoryName && !category.name) {
        updates.name = category.categoryName;
        needsUpdate = true;
        console.log(`   📝 "${category.categoryName}" → Moving to "name" field`);
      }
      
      // Check for old field: featuredCategory
      if (typeof category.featuredCategory === 'boolean' && typeof category.featured === 'undefined') {
        updates.featured = category.featuredCategory;
        needsUpdate = true;
        console.log(`   ⭐ Setting "featured" = ${category.featuredCategory}`);
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await client
          .patch(category._id)
          .set(updates)
          .commit();
        
        // Remove old fields
        await client
          .patch(category._id)
          .unset(['categoryName', 'featuredCategory'])
          .commit();
        
        fixedCount++;
        console.log(`   ✅ Fixed: ${updates.name || category.name}\n`);
      }
    }
    
    if (fixedCount === 0) {
      console.log('✅ All categories already have correct field names!\n');
    } else {
      console.log(`✅ Fixed ${fixedCount} categor${fixedCount === 1 ? 'y' : 'ies'}!\n`);
      console.log('🎉 Categories now match schema:');
      console.log('   - name ✅');
      console.log('   - featured ✅');
      console.log('   - All unknown fields removed ✅\n');
    }
    
    // 3. Verify fix
    console.log('🔍 Verifying categories...');
    const verifyQuery = `*[_type == "category"]{
      _id,
      name,
      slug,
      featured,
      isActive,
      "hasUnknownFields": defined(categoryName) || defined(featuredCategory)
    }`;
    
    const verifiedCategories = await client.fetch(verifyQuery);
    
    verifiedCategories.forEach(cat => {
      const status = cat.hasUnknownFields ? '⚠️' : '✅';
      console.log(`   ${status} ${cat.name || 'Unnamed'} (featured: ${cat.featured || false})`);
    });
    
    const hasIssues = verifiedCategories.some(cat => cat.hasUnknownFields);
    
    if (hasIssues) {
      console.log('\n⚠️  Some categories still have unknown fields!');
      console.log('   Run this script again or check Sanity Studio.');
    } else {
      console.log('\n✅ All categories verified - no unknown fields!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error.message);
    process.exit(1);
  }
}

// Run fix
fixCategoryFields()
  .then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('   1. Refresh Sanity Studio (F5)');
    console.log('   2. Open "Fresh Mushrooms" category');
    console.log('   3. Verify no "Unknown fields" warning');
    console.log('   4. Restart Next.js: npm run dev\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
