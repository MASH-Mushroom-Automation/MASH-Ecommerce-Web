/**
 * Check Grower Products
 * Run: node scripts/check-grower-products.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false
});

async function main() {
  console.log('🔍 Checking Grower Products...\n');
  
  try {
    const growers = await client.fetch(`
      *[_type == "grower"] {
        name,
        "productCount": count(products),
        "products": products[0...3]-> {
          _id,
          name,
          "slug": slug.current,
          price,
          "mainImage": coalesce(mainImage.asset->url, image.asset->url)
        }
      }
    `);
    
    console.log('📋 Growers with Products:');
    console.log('=' .repeat(50));
    
    growers.forEach((grower, idx) => {
      console.log(`\n${idx + 1}. ${grower.name}`);
      console.log(`   Products: ${grower.productCount || 0}`);
      
      if (grower.products && grower.products.length > 0) {
        console.log('   Top Products:');
        grower.products.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.name} - ₱${p.price}`);
          console.log(`        Slug: ${p.slug || 'MISSING!'}`);
          console.log(`        Image: ${p.mainImage ? '✅' : '❌ Missing'}`);
        });
      } else {
        console.log('   ⚠️  No products linked!');
      }
    });
    
    // Check stores with growers
    console.log('\n\n🏪 Stores with Growers & Their Products:');
    console.log('=' .repeat(50));
    
    const stores = await client.fetch(`
      *[_type == "store"] {
        name,
        "slug": slug.current,
        "growerCount": count(growers),
        "growers": growers[]-> {
          name,
          "slug": slug.current,
          "topProducts": products[0...3]-> {
            name,
            "slug": slug.current,
            price,
            "mainImage": coalesce(mainImage.asset->url, image.asset->url)
          }
        }
      }
    `);
    
    stores.forEach((store, idx) => {
      console.log(`\n${idx + 1}. ${store.name} (${store.slug})`);
      console.log(`   Growers: ${store.growerCount || 0}`);
      
      if (store.growers && store.growers.length > 0) {
        store.growers.forEach((g, i) => {
          console.log(`\n   Grower ${i + 1}: ${g.name}`);
          if (g.topProducts && g.topProducts.length > 0) {
            g.topProducts.forEach((p, j) => {
              console.log(`     - ${p.name} (₱${p.price}) ${p.mainImage ? '✅' : '❌'}`);
            });
          } else {
            console.log('     ⚠️  No products!');
          }
        });
      } else {
        console.log('   ⚠️  No growers linked!');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
