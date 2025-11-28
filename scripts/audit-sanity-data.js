/**
 * Sanity CMS Data Audit Script
 * Run: node scripts/audit-sanity-data.js
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'xyq5fhxs',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function auditSanityData() {
  console.log('🔍 SANITY CMS DATA AUDIT');
  console.log('========================\n');

  // Document counts
  const counts = await Promise.all([
    client.fetch('count(*[_type == "product"])'),
    client.fetch('count(*[_type == "category"])'),
    client.fetch('count(*[_type == "grower"])'),
    client.fetch('count(*[_type == "store"])'),
    client.fetch('count(*[_type == "review"])'),
    client.fetch('count(*[_type == "productVariant"])'),
    client.fetch('count(*[_type == "productBundle"])'),
    client.fetch('count(*[_type == "post"])'),
    client.fetch('count(*[_type == "faqItem"])'),
    client.fetch('count(*[_type == "faqCategory"])'),
    client.fetch('count(*[_type == "testimonial"])'),
    client.fetch('count(*[_type == "banner"])'),
    client.fetch('count(*[_type == "person"])'),
    client.fetch('count(*[_type == "featureSection"])'),
    client.fetch('count(*[_type == "navigation"])'),
    client.fetch('count(*[_type == "coupon"])'),
    client.fetch('count(*[_type == "promotion"])'),
    client.fetch('count(*[_type == "order"])'),
    client.fetch('count(*[_type == "blogCategory"])'),
    client.fetch('count(*[_type == "page"])'),
  ]);

  console.log('📊 DOCUMENT COUNTS:');
  console.log('-------------------');
  console.log(`Products:        ${counts[0]}`);
  console.log(`Categories:      ${counts[1]}`);
  console.log(`Growers:         ${counts[2]}`);
  console.log(`Stores:          ${counts[3]}`);
  console.log(`Reviews:         ${counts[4]}`);
  console.log(`Variants:        ${counts[5]}`);
  console.log(`Bundles:         ${counts[6]}`);
  console.log(`Blog Posts:      ${counts[7]}`);
  console.log(`FAQ Items:       ${counts[8]}`);
  console.log(`FAQ Categories:  ${counts[9]}`);
  console.log(`Testimonials:    ${counts[10]}`);
  console.log(`Banners:         ${counts[11]}`);
  console.log(`Team Members:    ${counts[12]}`);
  console.log(`Feature Sections:${counts[13]}`);
  console.log(`Navigation:      ${counts[14]}`);
  console.log(`Coupons:         ${counts[15]}`);
  console.log(`Promotions:      ${counts[16]}`);
  console.log(`Orders:          ${counts[17]}`);
  console.log(`Blog Categories: ${counts[18]}`);
  console.log(`Pages:           ${counts[19]}`);

  // Check singletons
  console.log('\n📦 SINGLETONS:');
  console.log('--------------');
  const singletons = await Promise.all([
    client.fetch('*[_type == "siteSettings"][0]'),
    client.fetch('*[_type == "heroCarousel"][0]'),
    client.fetch('*[_type == "featuredProducts"][0]'),
    client.fetch('*[_type == "aboutPage"][0]'),
    client.fetch('*[_type == "contactPage"][0]'),
  ]);

  console.log(`Site Settings:     ${singletons[0] ? '✅ Exists' : '❌ Missing'}`);
  console.log(`Hero Carousel:     ${singletons[1] ? '✅ Exists' : '❌ Missing'}`);
  console.log(`Featured Products: ${singletons[2] ? '✅ Exists' : '❌ Missing'}`);
  console.log(`About Page:        ${singletons[3] ? '✅ Exists' : '❌ Missing'}`);
  console.log(`Contact Page:      ${singletons[4] ? '✅ Exists' : '❌ Missing'}`);

  // Check data quality
  console.log('\n🔎 DATA QUALITY CHECK:');
  console.log('----------------------');
  
  // Products with images
  const productsWithImages = await client.fetch('count(*[_type == "product" && defined(image)])');
  console.log(`Products with images: ${productsWithImages}/${counts[0]}`);
  
  // Products with categories
  const productsWithCategories = await client.fetch('count(*[_type == "product" && defined(category)])');
  console.log(`Products with categories: ${productsWithCategories}/${counts[0]}`);
  
  // Products with tags
  const productsWithTags = await client.fetch('count(*[_type == "product" && defined(productTags) && length(productTags) > 0])');
  console.log(`Products with tags: ${productsWithTags}/${counts[0]}`);
  
  // Growers with stores
  const growersWithStores = await client.fetch('count(*[_type == "grower" && defined(availableAtStores) && length(availableAtStores) > 0])');
  console.log(`Growers with stores: ${growersWithStores}/${counts[2]}`);
  
  // Stores with growers
  const storesWithGrowers = await client.fetch('count(*[_type == "store" && defined(growers) && length(growers) > 0])');
  console.log(`Stores with growers: ${storesWithGrowers}/${counts[3]}`);

  // Check relationships
  console.log('\n🔗 RELATIONSHIPS:');
  console.log('-----------------');
  
  const growerStoreLinks = await client.fetch(`
    *[_type == "grower" && defined(availableAtStores)] {
      name,
      "stores": availableAtStores[]->name
    }
  `);
  
  console.log('Grower → Store Links:');
  growerStoreLinks.forEach(g => {
    if (g.stores && g.stores.length > 0) {
      console.log(`  ${g.name} → ${g.stores.join(', ')}`);
    }
  });

  // Check products with suggested products
  const productsWithSuggestions = await client.fetch('count(*[_type == "product" && defined(suggestedProducts) && length(suggestedProducts) > 0])');
  console.log(`\nProducts with suggestions: ${productsWithSuggestions}/${counts[0]}`);
  
  const productsWithComplements = await client.fetch('count(*[_type == "product" && defined(complementaryProducts) && length(complementaryProducts) > 0])');
  console.log(`Products with complements: ${productsWithComplements}/${counts[0]}`);

  // Check categories
  console.log('\n📁 CATEGORIES:');
  console.log('--------------');
  const categories = await client.fetch('*[_type == "category"] { name, "productCount": count(*[_type == "product" && references(^._id)]) }');
  categories.forEach(cat => {
    console.log(`  ${cat.name}: ${cat.productCount} products`);
  });

  console.log('\n✅ Audit Complete!');
}

auditSanityData().catch(console.error);
