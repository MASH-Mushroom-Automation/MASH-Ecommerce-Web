// Ensure all 6 categories exist and are properly configured
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local', quiet: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

const requiredCategories = [
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
  },
  {
    name: 'Mushroom Bundles',
    slug: 'bundles',
    description: 'Value bundles and variety packs. Save more when you buy together. Perfect for trying different mushroom varieties or stocking up on your favorites.',
    sortOrder: 6,
    isActive: true,
    isFeatured: false
  }
];

async function ensureCategories() {
  console.log('\n🔍 CHECKING ALL REQUIRED CATEGORIES\n');

  for (const cat of requiredCategories) {
    // Check if exists (not draft)
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug && !(_id in path("drafts.**"))][0]`,
      { slug: cat.slug }
    );

    if (existing) {
      console.log(`✅ ${cat.name} exists (${existing._id})`);
    } else {
      console.log(`➕ Creating ${cat.name}...`);
      const result = await client.create({
        _type: 'category',
        name: cat.name,
        slug: { _type: 'slug', current: cat.slug },
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        isFeatured: cat.isFeatured
      });
      console.log(`   ✅ Created: ${result._id}`);
    }
  }

  // Final verification
  console.log('\n\n📋 FINAL VERIFICATION\n');
  console.log('=====================\n');

  const all = await client.fetch(`*[_type == "category" && !(_id in path("drafts.**"))] | order(sortOrder asc) {
    name,
    "slug": slug.current,
    sortOrder,
    isActive,
    isFeatured,
    description
  }`);

  all.forEach((cat, i) => {
    const status = cat.isActive ? '✅' : '❌';
    const featured = cat.isFeatured ? '⭐' : '  ';
    console.log(`${i + 1}. ${status} ${featured} ${cat.name} (/${cat.slug})`);
    console.log(`      Order: ${cat.sortOrder} | ${cat.description.substring(0, 50)}...`);
  });

  console.log('\n=====================');
  console.log(`✅ TOTAL: ${all.length} categories`);
  console.log(`✅ ACTIVE: ${all.filter(c => c.isActive).length}`);
  console.log(`✅ FEATURED: ${all.filter(c => c.isFeatured).length}`);
  
  if (all.length >= 4) {
    console.log('\n🎉 SUCCESS! You have at least 4 categories for your e-commerce!\n');
  }
}

ensureCategories();
