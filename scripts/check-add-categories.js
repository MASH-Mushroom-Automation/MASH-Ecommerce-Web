// Check and add categories for MASH e-commerce
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

// Categories for mushroom e-commerce
const requiredCategories = [
  {
    _type: 'category',
    name: 'Fresh Mushrooms',
    slug: { _type: 'slug', current: 'fresh-mushrooms' },
    description: 'Farm-fresh mushrooms harvested daily. Perfect for cooking and culinary use.',
    image: null,
    order: 1
  },
  {
    _type: 'category',
    name: 'Dried Mushrooms',
    slug: { _type: 'slug', current: 'dried-mushrooms' },
    description: 'Long-lasting dried mushrooms with concentrated flavors. Ideal for soups, sauces, and seasonings.',
    image: null,
    order: 2
  },
  {
    _type: 'category',
    name: 'Growing Kits',
    slug: { _type: 'slug', current: 'growing-kits' },
    description: 'Grow your own mushrooms at home with our easy-to-use cultivation kits.',
    image: null,
    order: 3
  },
  {
    _type: 'category',
    name: 'Specialty Mushrooms',
    slug: { _type: 'slug', current: 'specialty-mushrooms' },
    description: 'Rare and exotic mushroom varieties for gourmet cooking and medicinal use.',
    image: null,
    order: 4
  },
  {
    _type: 'category',
    name: 'Mushroom Bundles',
    slug: { _type: 'slug', current: 'bundles' },
    description: 'Value bundles and variety packs. Save more when you buy together.',
    image: null,
    order: 5
  },
  {
    _type: 'category',
    name: 'Medicinal Mushrooms',
    slug: { _type: 'slug', current: 'medicinal-mushrooms' },
    description: 'Health-boosting mushrooms known for their therapeutic and wellness benefits.',
    image: null,
    order: 6
  }
];

async function checkAndAddCategories() {
  try {
    // Fetch existing categories
    const existingCategories = await client.fetch(`*[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      order
    }`);

    console.log('\n📦 CURRENT CATEGORIES IN SANITY:');
    console.log('================================');
    
    if (existingCategories.length === 0) {
      console.log('❌ No categories found!');
    } else {
      existingCategories.forEach((cat, i) => {
        console.log(`${i + 1}. ${cat.name} (/${cat.slug})`);
        if (cat.description) {
          console.log(`   📝 ${cat.description.substring(0, 60)}...`);
        }
      });
    }

    console.log(`\n📊 Total: ${existingCategories.length} categories`);
    
    // Check which categories are missing
    const existingSlugs = existingCategories.map(c => c.slug);
    const missingCategories = requiredCategories.filter(
      cat => !existingSlugs.includes(cat.slug.current)
    );

    if (missingCategories.length === 0 && existingCategories.length >= 4) {
      console.log('\n✅ You have at least 4 categories. No action needed!');
      return;
    }

    if (missingCategories.length > 0) {
      console.log('\n🔄 ADDING MISSING CATEGORIES:');
      console.log('==============================');
      
      for (const category of missingCategories) {
        try {
          const result = await client.create(category);
          console.log(`✅ Created: ${category.name} (${result._id})`);
        } catch (err) {
          console.error(`❌ Failed to create ${category.name}:`, err.message);
        }
      }
    }

    // Verify final count
    const finalCategories = await client.fetch(`*[_type == "category"] | order(order asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }`);

    console.log('\n📦 FINAL CATEGORIES:');
    console.log('====================');
    finalCategories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (/${cat.slug})`);
    });
    console.log(`\n✅ Total: ${finalCategories.length} categories`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndAddCategories();
