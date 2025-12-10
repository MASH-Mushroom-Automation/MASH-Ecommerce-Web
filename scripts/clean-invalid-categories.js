// Clean up invalid categories (those with null names)
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

async function cleanInvalidCategories() {
  try {
    // Find categories with null names
    const invalidCategories = await client.fetch(`*[_type == "category" && name == null]{
      _id,
      "slug": slug.current
    }`);

    console.log('\n🔍 Found invalid categories:', invalidCategories.length);
    
    if (invalidCategories.length === 0) {
      console.log('✅ No invalid categories to clean up!');
      return;
    }

    console.log('\n🗑️  Deleting invalid categories:');
    for (const cat of invalidCategories) {
      console.log(`   - Deleting: /${cat.slug} (${cat._id})`);
      await client.delete(cat._id);
    }

    console.log('\n✅ Cleanup complete!');

    // Show final list
    const finalCategories = await client.fetch(`*[_type == "category"] | order(order asc, name asc) {
      _id,
      name,
      "slug": slug.current
    }`);

    console.log('\n📦 FINAL CATEGORIES:');
    console.log('====================');
    finalCategories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (/${cat.slug})`);
    });
    console.log(`\n✅ Total: ${finalCategories.length} valid categories`);

  } catch (error) {
    console.error('Error:', error);
  }
}

cleanInvalidCategories();
