// Simple category list
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local', quiet: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

client.fetch(`*[_type == "category"] | order(name asc) {
  name,
  "slug": slug.current,
  description
}`).then(categories => {
  console.log('\n=== MASH E-COMMERCE CATEGORIES ===\n');
  console.log('Total categories:', categories.length);
  console.log('');
  categories.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.name || '(no name)'}`);
    console.log(`   Slug: /${cat.slug}`);
    if (cat.description) {
      console.log(`   Desc: ${cat.description.substring(0, 50)}...`);
    }
    console.log('');
  });
  
  // Check if we have at least 4
  const validCategories = categories.filter(c => c.name);
  if (validCategories.length >= 4) {
    console.log('✅ SUCCESS: You have', validCategories.length, 'valid categories (minimum 4 required)');
  } else {
    console.log('❌ WARNING: Only', validCategories.length, 'valid categories found. Need at least 4.');
  }
}).catch(err => {
  console.error('Error:', err.message);
});
