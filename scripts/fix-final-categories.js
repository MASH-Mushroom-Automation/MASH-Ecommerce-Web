// Final Categories Fix - Keep only 5 categories, remove Mushroom Bundles
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local', quiet: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

// The 5 categories you want to KEEP
const finalCategories = [
  {
    name: 'Fresh Mushrooms',
    slug: 'fresh-mushrooms',
    description: 'Farm-fresh mushrooms harvested daily for maximum flavor and nutrition. Our fresh mushrooms are grown in controlled environments using sustainable practices, ensuring premium quality and consistent supply year-round.',
    sortOrder: 1,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Dried Mushrooms',
    slug: 'dried-mushrooms',
    description: 'Premium dried mushrooms with intensified flavors and extended shelf life. Perfect for soups, broths, and rehydrating for various recipes. Our drying process preserves nutritional value while concentrating the umami taste.',
    sortOrder: 2,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Growing Kits',
    slug: 'growing-kits',
    description: 'Everything you need to grow your own mushrooms at home. Our beginner-friendly kits include substrate, spawn, and detailed instructions. Experience the joy of harvesting fresh mushrooms from your own kitchen!',
    sortOrder: 3,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Specialty Mushrooms',
    slug: 'specialty-mushrooms',
    description: 'Rare and exotic mushroom varieties for gourmet cooking and medicinal use. Discover unique flavors and health benefits from our carefully sourced specialty collection.',
    sortOrder: 4,
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Medicinal Mushrooms',
    slug: 'medicinal-mushrooms',
    description: 'Health-boosting mushrooms known for their therapeutic and wellness benefits. Includes Lion\'s Mane, Reishi, Chaga, and other functional mushrooms for immune support and cognitive health.',
    sortOrder: 5,
    isActive: true,
    isFeatured: false
  }
];

// Slugs to remove (Mushroom Bundles)
const slugsToRemove = ['bundles', 'mushroom-bundles'];

async function fixCategories() {
  console.log('\n🔧 FIXING CATEGORIES - FINAL CLEANUP\n');
  console.log('=====================================\n');

  try {
    // Step 1: Delete Mushroom Bundles category
    console.log('🗑️  STEP 1: Removing Mushroom Bundles category...\n');
    
    const bundlesToDelete = await client.fetch(
      `*[_type == "category" && slug.current in $slugs]{ _id, name, "slug": slug.current }`,
      { slugs: slugsToRemove }
    );

    for (const cat of bundlesToDelete) {
      console.log(`   Deleting: ${cat.name} (/${cat.slug})`);
      await client.delete(cat._id);
      console.log(`   ✅ Deleted: ${cat._id}`);
    }

    if (bundlesToDelete.length === 0) {
      console.log('   No Mushroom Bundles category found to delete.');
    }

    // Step 2: Fix or create the 5 required categories
    console.log('\n🔄 STEP 2: Ensuring 5 correct categories exist...\n');

    for (const cat of finalCategories) {
      // Check if exists
      const existing = await client.fetch(
        `*[_type == "category" && slug.current == $slug][0]{ _id, name }`,
        { slug: cat.slug }
      );

      if (existing) {
        console.log(`   Updating: ${cat.name}`);
        
        // Fix the category - remove invalid fields, set correct values
        await client.patch(existing._id)
          .set({
            name: cat.name,
            slug: { _type: 'slug', current: cat.slug },
            description: cat.description,
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
            isFeatured: cat.isFeatured
          })
          .unset(['order', 'image']) // Remove invalid fields
          .commit();
        
        console.log(`   ✅ Updated: ${cat.name}`);
      } else {
        console.log(`   Creating: ${cat.name}`);
        
        await client.create({
          _type: 'category',
          name: cat.name,
          slug: { _type: 'slug', current: cat.slug },
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          isFeatured: cat.isFeatured
        });
        
        console.log(`   ✅ Created: ${cat.name}`);
      }
    }

    // Step 3: Delete any other categories not in our list
    console.log('\n🧹 STEP 3: Cleaning up extra categories...\n');
    
    const validSlugs = finalCategories.map(c => c.slug);
    const extraCategories = await client.fetch(
      `*[_type == "category" && !(slug.current in $validSlugs)]{ _id, name, "slug": slug.current }`,
      { validSlugs }
    );

    for (const cat of extraCategories) {
      console.log(`   Deleting extra: ${cat.name || '(no name)'} (/${cat.slug})`);
      await client.delete(cat._id);
      console.log(`   ✅ Deleted: ${cat._id}`);
    }

    if (extraCategories.length === 0) {
      console.log('   No extra categories to remove.');
    }

    // Step 4: Final verification
    console.log('\n\n📋 FINAL VERIFICATION\n');
    console.log('=====================\n');

    const finalList = await client.fetch(`*[_type == "category"] | order(sortOrder asc) {
      name,
      "slug": slug.current,
      description,
      sortOrder,
      isActive,
      isFeatured
    }`);

    finalList.forEach((cat, i) => {
      const status = cat.isActive ? '✅ Active' : '❌ Inactive';
      const featured = cat.isFeatured ? '⭐ Featured' : '';
      console.log(`${i + 1}. ${cat.name}`);
      console.log(`   Slug: /${cat.slug}`);
      console.log(`   Order: ${cat.sortOrder}`);
      console.log(`   Status: ${status} ${featured}`);
      console.log(`   Description: ${cat.description.substring(0, 60)}...`);
      console.log('');
    });

    console.log('=====================');
    console.log(`✅ TOTAL: ${finalList.length} categories`);
    console.log(`✅ ACTIVE: ${finalList.filter(c => c.isActive).length}`);
    console.log(`✅ FEATURED: ${finalList.filter(c => c.isFeatured).length}`);

    if (finalList.length >= 4) {
      console.log('\n🎉 SUCCESS! You have 5 categories for your e-commerce (minimum 4 required)!\n');
    }

    console.log('\n📝 CATEGORIES SUMMARY:');
    console.log('1. Fresh Mushrooms - Farm-fresh daily harvest');
    console.log('2. Dried Mushrooms - Premium dried with extended shelf life');
    console.log('3. Growing Kits - Beginner-friendly home growing kits');
    console.log('4. Specialty Mushrooms - Rare and exotic varieties');
    console.log('5. Medicinal Mushrooms - Health and wellness mushrooms\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixCategories();
