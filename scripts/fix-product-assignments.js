/**
 * Fix Remaining Products - Assign Growers and Fix Categories
 * 
 * Run: node scripts/fix-product-assignments.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Products that need fixing
const fixes = [
  // Products without growers
  { 
    slug: "fresh-portobello-mushrooms", 
    growerName: "Kabutehan ni Aling Nena",
    categorySlug: null // Keep current
  },
  { 
    slug: "lions-mane-mushroom-growing-kit", 
    growerName: "The Mushroom Patch Bukidnon",
    categorySlug: null
  },
  { 
    slug: "mushroom-extract-tincture", 
    growerName: "Shroomarket",
    categorySlug: "medicinal-mushrooms" // Move to correct category
  }
];

async function fixProducts() {
  console.log('='.repeat(60));
  console.log('FIXING PRODUCT ASSIGNMENTS');
  console.log('='.repeat(60));

  try {
    // Fetch all products
    const products = await client.fetch('*[_type == "product"]{ _id, name, "slug": slug.current }');
    const productMap = {};
    products.forEach(p => productMap[p.slug] = { _id: p._id, name: p.name });

    // Fetch growers
    const growers = await client.fetch('*[_type == "grower"]{ _id, name }');
    const growerMap = {};
    growers.forEach(g => growerMap[g.name] = g._id);

    // Fetch categories
    const categories = await client.fetch('*[_type == "category"]{ _id, "slug": slug.current }');
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c._id);

    console.log('\nProducts: ' + products.length);
    console.log('Growers: ' + growers.length);
    console.log('Categories: ' + categories.length);

    console.log('\n' + '-'.repeat(40));
    console.log('APPLYING FIXES');
    console.log('-'.repeat(40));

    for (const fix of fixes) {
      const product = productMap[fix.slug];
      if (!product) {
        console.log('  Skipped: ' + fix.slug + ' (product not found)');
        continue;
      }

      const patch = {};
      let changes = [];

      // Add grower if specified
      if (fix.growerName) {
        const growerId = growerMap[fix.growerName];
        if (growerId) {
          patch.grower = { _type: 'reference', _ref: growerId };
          changes.push('grower=' + fix.growerName);
        } else {
          console.log('  Warning: Grower not found - ' + fix.growerName);
        }
      }

      // Update category if specified
      if (fix.categorySlug) {
        const categoryId = categoryMap[fix.categorySlug];
        if (categoryId) {
          patch.category = { _type: 'reference', _ref: categoryId };
          changes.push('category=' + fix.categorySlug);
        } else {
          console.log('  Warning: Category not found - ' + fix.categorySlug);
        }
      }

      if (Object.keys(patch).length > 0) {
        await client.patch(product._id).set(patch).commit();
        console.log('  Fixed: ' + product.name + ' [' + changes.join(', ') + ']');
      }
    }

    // Verify no products without growers
    console.log('\n' + '-'.repeat(40));
    console.log('VERIFICATION');
    console.log('-'.repeat(40));

    const noGrower = await client.fetch('*[_type == "product" && !defined(grower)]{ name, "slug": slug.current }');
    if (noGrower.length > 0) {
      console.log('\nProducts still without growers (' + noGrower.length + '):');
      noGrower.forEach(p => console.log('  - ' + p.name + ' (' + p.slug + ')'));
    } else {
      console.log('\nAll products have growers assigned.');
    }

    // Show final distribution
    console.log('\n' + '='.repeat(60));
    console.log('FINAL DISTRIBUTION');
    console.log('='.repeat(60));

    console.log('\nProducts by Category:');
    for (const [slug, id] of Object.entries(categoryMap)) {
      const count = await client.fetch('count(*[_type == "product" && category._ref == $id])', { id });
      console.log('  ' + slug + ': ' + count);
    }

    console.log('\nProducts by Grower:');
    for (const [name, id] of Object.entries(growerMap)) {
      const count = await client.fetch('count(*[_type == "product" && grower._ref == $id])', { id });
      console.log('  ' + name + ': ' + count);
    }

    const total = await client.fetch('count(*[_type == "product"])');
    console.log('\nTotal Products: ' + total);

  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  }
}

fixProducts().catch(console.error);
