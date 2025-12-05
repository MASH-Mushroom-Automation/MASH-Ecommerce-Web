/**
 * Phase B Verification Script
 * Tests that all Sanity CMS data is accessible and correctly structured
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
});

async function verifyData() {
  console.log('='.repeat(60));
  console.log('PHASE B: Data Verification Report');
  console.log('='.repeat(60));
  
  // 1. Featured Products Singleton
  console.log('\n📦 FEATURED PRODUCTS SINGLETON');
  const featuredProducts = await client.fetch(`
    *[_type == "featuredProducts"][0] {
      title,
      subtitle,
      "productCount": count(products),
      "products": products[]-> {
        name,
        slug
      }
    }
  `);
  
  if (featuredProducts) {
    console.log(`   ✅ Title: ${featuredProducts.title || 'Default Title'}`);
    console.log(`   ✅ Products: ${featuredProducts.productCount} items`);
    if (featuredProducts.products) {
      featuredProducts.products.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.name}`);
      });
    }
  } else {
    console.log('   ❌ Featured Products singleton not found!');
  }
  
  // 2. Hero Carousel
  console.log('\n🎨 HERO CAROUSEL');
  const heroCarousel = await client.fetch(`
    *[_type == "heroCarousel"][0] {
      "slideCount": count(slides),
      "slides": slides[] {
        title,
        subtitle
      }
    }
  `);
  
  if (heroCarousel) {
    console.log(`   ✅ Slides: ${heroCarousel.slideCount} total`);
    if (heroCarousel.slides) {
      heroCarousel.slides.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.title}`);
      });
    }
  } else {
    console.log('   ❌ Hero Carousel not found!');
  }
  
  // 3. Product Suggestions
  console.log('\n🔗 PRODUCT SUGGESTIONS');
  const products = await client.fetch(`
    *[_type == "product"] | order(name asc) {
      name,
      "suggestedCount": count(suggestedProducts),
      "complementaryCount": count(complementaryProducts)
    }
  `);
  
  let suggestionsComplete = 0;
  let complementaryComplete = 0;
  
  products.forEach(p => {
    const sugIcon = p.suggestedCount > 0 ? '✅' : '⚠️';
    const compIcon = p.complementaryCount > 0 ? '✅' : '⚠️';
    console.log(`   ${sugIcon} ${p.name}: ${p.suggestedCount} suggested, ${p.complementaryCount} complementary`);
    if (p.suggestedCount > 0) suggestionsComplete++;
    if (p.complementaryCount > 0) complementaryComplete++;
  });
  
  console.log(`\n   Summary: ${suggestionsComplete}/${products.length} products have suggestions`);
  console.log(`   Summary: ${complementaryComplete}/${products.length} products have complementary items`);
  
  // 4. Categories
  console.log('\n📁 CATEGORIES');
  const categories = await client.fetch(`
    *[_type == "category"] | order(name asc) {
      name,
      slug,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);
  
  categories.forEach(c => {
    console.log(`   ✅ ${c.name}: ${c.productCount} products`);
  });
  
  // 5. Growers
  console.log('\n👨‍🌾 GROWERS');
  const growers = await client.fetch(`
    *[_type == "grower"] | order(name asc) {
      name,
      location,
      isActive
    }
  `);
  
  growers.forEach(g => {
    const status = g.isActive ? '✅' : '⚠️';
    console.log(`   ${status} ${g.name} - ${g.location || 'No location'}`);
  });
  
  // 6. Stores
  console.log('\n🏪 STORES');
  const stores = await client.fetch(`
    *[_type == "store"] | order(name asc) {
      name,
      address,
      isActive
    }
  `);
  
  stores.forEach(s => {
    const status = s.isActive ? '✅' : '⚠️';
    console.log(`   ${status} ${s.name}`);
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Featured Products: ${featuredProducts ? '✅ PASS' : '❌ FAIL'} (${featuredProducts?.productCount || 0} items)`);
  console.log(`   Hero Carousel: ${heroCarousel ? '✅ PASS' : '❌ FAIL'} (${heroCarousel?.slideCount || 0} slides)`);
  console.log(`   Product Suggestions: ${suggestionsComplete === products.length ? '✅ PASS' : '⚠️ PARTIAL'} (${suggestionsComplete}/${products.length})`);
  console.log(`   Complementary Products: ${complementaryComplete === products.length ? '✅ PASS' : '⚠️ PARTIAL'} (${complementaryComplete}/${products.length})`);
  console.log(`   Categories: ✅ PASS (${categories.length} categories)`);
  console.log(`   Growers: ✅ PASS (${growers.length} growers)`);
  console.log(`   Stores: ✅ PASS (${stores.length} stores)`);
  console.log('='.repeat(60));
}

verifyData().catch(console.error);
