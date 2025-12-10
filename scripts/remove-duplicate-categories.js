// Remove duplicate categories
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local', quiet: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

async function removeDuplicates() {
  console.log('\n🧹 REMOVING DUPLICATE CATEGORIES\n');

  try {
    // Get all categories
    const categories = await client.fetch(`*[_type == "category"] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      sortOrder,
      isActive
    }`);

    // Find duplicates by slug
    const slugCounts = {};
    categories.forEach(cat => {
      if (!slugCounts[cat.slug]) {
        slugCounts[cat.slug] = [];
      }
      slugCounts[cat.slug].push(cat);
    });

    // Remove duplicates (keep the one with sortOrder, remove others)
    for (const [slug, cats] of Object.entries(slugCounts)) {
      if (cats.length > 1) {
        console.log(`Found ${cats.length} duplicates for /${slug}:`);
        
        // Sort by: has sortOrder first, then by isActive
        cats.sort((a, b) => {
          if (a.sortOrder && !b.sortOrder) return -1;
          if (!a.sortOrder && b.sortOrder) return 1;
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return 0;
        });

        // Keep first, delete rest
        const keep = cats[0];
        const remove = cats.slice(1);

        console.log(`  ✅ Keeping: ${keep.name} (${keep._id}) - Order: ${keep.sortOrder}`);
        
        for (const dup of remove) {
          console.log(`  🗑️  Deleting: ${dup.name} (${dup._id}) - Order: ${dup.sortOrder || 'N/A'}`);
          await client.delete(dup._id);
        }
      }
    }

    // Also remove any categories with null names
    const nullNames = await client.fetch(`*[_type == "category" && name == null]{ _id, "slug": slug.current }`);
    for (const cat of nullNames) {
      console.log(`🗑️  Deleting category with null name: /${cat.slug}`);
      await client.delete(cat._id);
    }

    // Final list
    console.log('\n\n📋 FINAL CATEGORY LIST\n');
    console.log('======================\n');

    const finalCategories = await client.fetch(`*[_type == "category"] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      sortOrder,
      isActive,
      isFeatured
    }`);

    finalCategories.forEach((cat, i) => {
      const status = cat.isActive ? '✅ Active' : '❌ Inactive';
      const featured = cat.isFeatured ? '⭐ Featured' : '';
      console.log(`${i + 1}. ${cat.name}`);
      console.log(`   Slug: /${cat.slug}`);
      console.log(`   Order: ${cat.sortOrder}`);
      console.log(`   Status: ${status} ${featured}`);
      console.log(`   Description: ${cat.description ? cat.description.substring(0, 60) + '...' : 'N/A'}`);
      console.log('');
    });

    console.log('======================');
    console.log(`✅ Total: ${finalCategories.length} categories`);
    console.log(`✅ Active: ${finalCategories.filter(c => c.isActive).length}`);
    console.log(`✅ Featured: ${finalCategories.filter(c => c.isFeatured).length}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

removeDuplicates();
