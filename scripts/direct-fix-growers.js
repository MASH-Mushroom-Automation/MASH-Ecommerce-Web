/**
 * Direct Fix - Assign Growers to Products Without Them
 * 
 * Run: node scripts/direct-fix-growers.js
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

async function directFix() {
  console.log('='.repeat(60));
  console.log('DIRECT FIX: ASSIGN GROWERS TO ALL PRODUCTS');
  console.log('='.repeat(60));

  try {
    // Get products without growers
    const noGrower = await client.fetch(`
      *[_type == "product" && !defined(grower)] {
        _id,
        name,
        "slug": slug.current
      }
    `);
    
    console.log('\nProducts without growers: ' + noGrower.length);
    noGrower.forEach(p => console.log('  - ' + p.name + ' (' + p.slug + ')'));

    if (noGrower.length === 0) {
      console.log('\nAll products already have growers assigned.');
      return;
    }

    // Get growers
    const growers = await client.fetch('*[_type == "grower"]{ _id, name }');
    console.log('\nAvailable Growers:');
    growers.forEach(g => console.log('  - ' + g.name + ' (ID: ' + g._id + ')'));

    // Create grower map by name
    const growerMap = {};
    growers.forEach(g => growerMap[g.name] = g._id);

    // Define assignments
    const assignments = {
      'fresh-portobello-mushrooms': 'Kabutehan ni Aling Nena',
      'lions-mane-growing-kit': 'The Mushroom Patch Bukidnon',
      'mushroom-extract-tincture': 'Shroomarket',
      // Fallback for any other products
      'default': 'Fungi Fresh Farms'
    };

    console.log('\n' + '-'.repeat(40));
    console.log('APPLYING FIXES');
    console.log('-'.repeat(40));

    for (const product of noGrower) {
      // Find the grower assignment
      let growerName = assignments[product.slug] || assignments['default'];
      let growerId = growerMap[growerName];

      if (!growerId) {
        console.log('  Error: Grower not found - ' + growerName);
        continue;
      }

      try {
        await client
          .patch(product._id)
          .set({
            grower: {
              _type: 'reference',
              _ref: growerId
            }
          })
          .commit();
        
        console.log('  Fixed: ' + product.name + ' -> ' + growerName);
      } catch (err) {
        console.log('  Error fixing ' + product.name + ': ' + err.message);
      }
    }

    // Verify
    console.log('\n' + '-'.repeat(40));
    console.log('VERIFICATION');
    console.log('-'.repeat(40));

    const stillNoGrower = await client.fetch('count(*[_type == "product" && !defined(grower)])');
    console.log('Products still without growers: ' + stillNoGrower);

    if (stillNoGrower === 0) {
      console.log('All products now have growers assigned.');
    }

    // Final counts
    const total = await client.fetch('count(*[_type == "product"])');
    console.log('\nTotal Products: ' + total);

  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  }
}

directFix().catch(console.error);
