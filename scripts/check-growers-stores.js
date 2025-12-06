const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
});

async function checkData() {
  console.log('🔍 Checking Sanity CMS data...\n');

  // Check growers
  const growers = await client.fetch(`*[_type == "grower"] {
    _id,
    name,
    "slug": slug.current,
    isFeatured,
    isActive,
    location
  }`);
  
  console.log(`👨‍🌾 Growers: ${growers.length} found`);
  growers.forEach(g => {
    console.log(`   - ${g.name} ${g.isFeatured ? '⭐' : ''} ${g.isActive ? '✅' : '❌'}`);
  });

  console.log('');

  // Check stores
  const stores = await client.fetch(`*[_type == "store"] {
    _id,
    name,
    "slug": slug.current,
    storeType,
    isActive,
    "city": address.city
  }`);
  
  console.log(`🏪 Stores: ${stores.length} found`);
  stores.forEach(s => {
    console.log(`   - ${s.name} (${s.storeType}) - ${s.city || 'No city'} ${s.isActive ? '✅' : '❌'}`);
  });

  console.log('');

  // Check product tags
  const productTags = await client.fetch(`*[_type == "product" && defined(productTags)] {
    name,
    productTags
  }[0...5]`);
  
  console.log(`🏷️ Products with Tags: ${productTags.length} found`);
  productTags.forEach(p => {
    console.log(`   - ${p.name}: ${p.productTags?.join(', ') || 'No tags'}`);
  });

  console.log('\n✅ Check complete!');
}

checkData().catch(err => console.error('Error:', err.message));
