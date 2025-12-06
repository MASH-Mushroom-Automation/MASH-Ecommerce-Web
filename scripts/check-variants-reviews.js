const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
});

async function check() {
  console.log('🔍 Checking Sanity CMS for variants and reviews...\n');

  // Check variants
  const variants = await client.fetch(`*[_type == "productVariant"][0...10] {
    _id,
    variantName,
    size,
    weight,
    price,
    stockQuantity,
    "product": product->name
  }`);
  
  console.log(`📦 Product Variants: ${variants.length} found`);
  if (variants.length > 0) {
    variants.forEach(v => {
      console.log(`   - ${v.variantName || 'Unnamed'} (${v.size || v.weight || 'N/A'}) - ₱${v.price} - Product: ${v.product || 'Unknown'}`);
    });
  } else {
    console.log('   ⚠️ No variants found. Need to create some in Sanity Studio.');
  }

  console.log('');

  // Check reviews
  const reviews = await client.fetch(`*[_type == "review"][0...10] {
    _id,
    customerName,
    rating,
    title,
    verifiedPurchase,
    status,
    "product": product->name
  }`);
  
  console.log(`⭐ Product Reviews: ${reviews.length} found`);
  if (reviews.length > 0) {
    reviews.forEach(r => {
      console.log(`   - ${r.customerName}: ${r.rating}★ "${r.title || 'No title'}" (${r.verifiedPurchase ? 'Verified' : 'Not Verified'}) - ${r.product || 'Unknown product'}`);
    });
  } else {
    console.log('   ⚠️ No reviews found. Need to create some in Sanity Studio.');
  }

  console.log('\n✅ Check complete!');
}

check().catch(err => console.error('Error:', err.message));
