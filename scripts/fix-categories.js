// Fix and verify all categories in Sanity CMS
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local', quiet: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

// Correct category data for MASH Mushroom E-Commerce
const correctCategories = [
  {
    name: 'Fresh Mushrooms',
    slug: 'fresh-mushrooms',
    description: 'Farm-fresh mushrooms harvested daily for maximum flavor and nutrition. Our fresh mushrooms are grown in controlled environments using sustainable practices, ensuring premium quality and consistent supply year-round.',
    sortOrder: 1,
    isActive: true,
    isFeatured: true,
    seoTitle: 'Fresh Mushrooms - Farm Fresh Daily | MASH',
    seoDescription: 'Shop farm-fresh mushrooms harvested daily. Premium quality mushrooms grown sustainably for maximum flavor and nutrition.',
  },
  {
    name: 'Dried Mushrooms',
    slug: 'dried-mushrooms',
    description: 'Premium dried mushrooms with intensified flavors and extended shelf life. Perfect for soups, broths, and rehydrating for various recipes. Our drying process preserves nutritional value while concentrating the umami taste.',
    sortOrder: 2,
    isActive: true,
    isFeatured: true,
    seoTitle: 'Dried Mushrooms - Premium Quality | MASH',
    seoDescription: 'Shop premium dried mushrooms with intensified flavors. Perfect for soups, broths, and gourmet cooking.',
  },
  {
    name: 'Growing Kits',
    slug: 'growing-kits',
    description: 'Everything you need to grow your own mushrooms at home. Our beginner-friendly kits include substrate, spawn, and detailed instructions. Experience the joy of harvesting fresh mushrooms from your own kitchen!',
    sortOrder: 3,
    isActive: true,
    isFeatured: true,
    seoTitle: 'Mushroom Growing Kits - Grow at Home | MASH',
    seoDescription: 'Beginner-friendly mushroom growing kits. Includes substrate, spawn, and instructions. Grow fresh mushrooms at home!',
  },
  {
    name: 'Specialty Mushrooms',
    slug: 'specialty-mushrooms',
    description: 'Rare and exotic mushroom varieties for gourmet cooking and medicinal use. Discover unique flavors and health benefits from our carefully sourced specialty collection.',
    sortOrder: 4,
    isActive: true,
    isFeatured: false,
    seoTitle: 'Specialty Mushrooms - Rare & Exotic | MASH',
    seoDescription: 'Discover rare and exotic mushroom varieties for gourmet cooking and medicinal use.',
  },
  {
    name: 'Medicinal Mushrooms',
    slug: 'medicinal-mushrooms',
    description: 'Health-boosting mushrooms known for their therapeutic and wellness benefits. Includes Lion\'s Mane, Reishi, Chaga, and other functional mushrooms for immune support and cognitive health.',
    sortOrder: 5,
    isActive: true,
    isFeatured: false,
    seoTitle: 'Medicinal Mushrooms - Health & Wellness | MASH',
    seoDescription: 'Shop medicinal mushrooms for health and wellness. Lion\'s Mane, Reishi, Chaga and more for immune support.',
  },
  {
    name: 'Mushroom Bundles',
    slug: 'bundles',
    description: 'Value bundles and variety packs. Save more when you buy together. Perfect for trying different mushroom varieties or stocking up on your favorites.',
    sortOrder: 6,
    isActive: true,
    isFeatured: false,
    seoTitle: 'Mushroom Bundles - Value Packs | MASH',
    seoDescription: 'Save more with mushroom bundles and variety packs. Try different varieties or stock up on favorites.',
  }
];

async function fixCategories() {
  console.log('\n🔧 FIXING MASH E-COMMERCE CATEGORIES\n');
  console.log('=====================================\n');

  try {
    // Get all existing categories
    const existingCategories = await client.fetch(`*[_type == "category"] {
      _id,
      name,
      "slug": slug.current,
      description,
      sortOrder,
      order,
      isActive,
      isFeatured,
      image
    }`);

    console.log(`📦 Found ${existingCategories.length} existing categories\n`);

    // Fix each category
    for (const correctCat of correctCategories) {
      const existing = existingCategories.find(
        c => c.slug === correctCat.slug || 
             (c.name && c.name.toLowerCase() === correctCat.name.toLowerCase())
      );

      if (existing) {
        console.log(`🔄 Updating: ${correctCat.name}`);
        
        // Build patch to fix issues
        const patch = client.patch(existing._id);
        
        // Set correct values
        patch.set({
          name: correctCat.name,
          slug: { _type: 'slug', current: correctCat.slug },
          description: correctCat.description,
          sortOrder: correctCat.sortOrder,
          isActive: correctCat.isActive,
          isFeatured: correctCat.isFeatured,
          seoTitle: correctCat.seoTitle,
          seoDescription: correctCat.seoDescription,
        });

        // Remove invalid fields
        if (existing.order !== undefined) {
          patch.unset(['order']);
        }
        
        // Remove invalid null image (only if it's null, not if it's a valid image)
        if (existing.image === null) {
          patch.unset(['image']);
        }

        await patch.commit();
        console.log(`   ✅ Fixed: ${correctCat.name} (/${correctCat.slug})`);
      } else {
        console.log(`➕ Creating: ${correctCat.name}`);
        
        await client.create({
          _type: 'category',
          name: correctCat.name,
          slug: { _type: 'slug', current: correctCat.slug },
          description: correctCat.description,
          sortOrder: correctCat.sortOrder,
          isActive: correctCat.isActive,
          isFeatured: correctCat.isFeatured,
          seoTitle: correctCat.seoTitle,
          seoDescription: correctCat.seoDescription,
        });
        console.log(`   ✅ Created: ${correctCat.name} (/${correctCat.slug})`);
      }
    }

    // Verify final state
    console.log('\n\n📋 VERIFICATION - FINAL CATEGORY LIST\n');
    console.log('======================================\n');

    const finalCategories = await client.fetch(`*[_type == "category"] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      sortOrder,
      isActive,
      isFeatured,
      "hasImage": defined(image.asset)
    }`);

    finalCategories.forEach((cat, i) => {
      const status = cat.isActive ? '✅' : '❌';
      const featured = cat.isFeatured ? '⭐' : '  ';
      const image = cat.hasImage ? '🖼️' : '  ';
      console.log(`${i + 1}. ${status} ${featured} ${image} ${cat.name}`);
      console.log(`      Slug: /${cat.slug}`);
      console.log(`      Order: ${cat.sortOrder || 'N/A'}`);
      console.log(`      Desc: ${cat.description ? cat.description.substring(0, 50) + '...' : 'No description'}`);
      console.log('');
    });

    const activeCount = finalCategories.filter(c => c.isActive).length;
    const featuredCount = finalCategories.filter(c => c.isFeatured).length;

    console.log('=====================================');
    console.log(`📊 SUMMARY:`);
    console.log(`   Total Categories: ${finalCategories.length}`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Featured: ${featuredCount}`);
    console.log('');

    if (activeCount >= 4) {
      console.log('✅ SUCCESS: You have', activeCount, 'active categories (minimum 4 required)');
    } else {
      console.log('❌ WARNING: Only', activeCount, 'active categories. Need at least 4.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixCategories();
