/**
 * Check Current Sanity Data
 * Lists all products, categories, and growers
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkData() {
  console.log('='.repeat(60));
  console.log('SANITY CMS DATA CHECK');
  console.log('='.repeat(60));

  // Check products
  const products = await client.fetch(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      price,
      "category": category->name,
      "categoryId": category->_id,
      "grower": grower->name
    }
  `);
  
  console.log('\nPRODUCTS (' + products.length + '):');
  console.log('-'.repeat(40));
  products.forEach((p, i) => {
    console.log((i + 1) + '. ' + p.name);
    console.log('   Price: P' + p.price);
    console.log('   Category: ' + (p.category || 'None'));
    console.log('   Grower: ' + (p.grower || 'None'));
  });

  // Check categories
  const categories = await client.fetch(`
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }
  `);
  
  console.log('\n' + '='.repeat(60));
  console.log('CATEGORIES (' + categories.length + '):');
  console.log('-'.repeat(40));
  categories.forEach((c, i) => {
    console.log((i + 1) + '. ' + c.name + ' (' + c.slug + ')');
    console.log('   ID: ' + c._id);
  });

  // Check growers
  const growers = await client.fetch(`
    *[_type == "grower"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      location,
      specialty
    }
  `);
  
  console.log('\n' + '='.repeat(60));
  console.log('GROWERS (' + growers.length + '):');
  console.log('-'.repeat(40));
  growers.forEach((g, i) => {
    console.log((i + 1) + '. ' + g.name);
    console.log('   ID: ' + g._id);
    console.log('   Location: ' + (g.location || 'Not set'));
    console.log('   Specialty: ' + (g.specialty || 'Not set'));
  });

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY:');
  console.log('  Products: ' + products.length);
  console.log('  Categories: ' + categories.length);
  console.log('  Growers: ' + growers.length);
  console.log('='.repeat(60));

  return { products, categories, growers };
}

checkData().catch(console.error);
