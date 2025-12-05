/**
 * Phase C - Check Store and Grower Data
 * Run: node scripts/check-phase-c-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'xyq5fhxs',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
});

async function checkData() {
  console.log('='.repeat(60));
  console.log('PHASE C: Store & Grower Data Analysis');
  console.log('='.repeat(60));
  
  // 1. Check Stores
  console.log('\n🏪 STORES ANALYSIS');
  const stores = await client.fetch(`
    *[_type == "store"] {
      name,
      "slug": slug.current,
      storeType,
      isActive,
      "hasHours": defined(operatingHours),
      "hasCoords": defined(coordinates),
      "growerCount": count(growers),
      "hasServices": defined(services),
      "hasImage": defined(image),
      "hasDirections": defined(directionsUrl),
      description,
      phone,
      email
    }
  `);
  
  stores.forEach(s => {
    console.log(`\n   📍 ${s.name} (${s.storeType})`);
    console.log(`      Active: ${s.isActive ? '✅' : '❌'}`);
    console.log(`      Hours: ${s.hasHours ? '✅' : '❌ MISSING'}`);
    console.log(`      Coordinates: ${s.hasCoords ? '✅' : '❌ MISSING'}`);
    console.log(`      Growers: ${s.growerCount > 0 ? `✅ ${s.growerCount} linked` : '⚠️ None linked'}`);
    console.log(`      Services: ${s.hasServices ? '✅' : '❌ MISSING'}`);
    console.log(`      Image: ${s.hasImage ? '✅' : '❌ MISSING'}`);
    console.log(`      Directions URL: ${s.hasDirections ? '✅' : '⚠️ Can auto-generate'}`);
  });
  
  // 2. Check Growers
  console.log('\n\n👨‍🌾 GROWERS ANALYSIS');
  const growers = await client.fetch(`
    *[_type == "grower"] {
      name,
      "slug": slug.current,
      isActive,
      "hasProducts": defined(products) && count(products) > 0,
      "productCount": count(products),
      "hasCerts": defined(certifications) && count(certifications) > 0,
      "certCount": count(certifications),
      "hasStory": defined(story),
      "hasSpecialties": defined(specialties) && count(specialties) > 0,
      "specialtyCount": count(specialties),
      "storeCount": count(availableAtStores),
      "hasImage": defined(logo),
      "hasCover": defined(coverImage),
      tagline,
      location
    }
  `);
  
  growers.forEach(g => {
    console.log(`\n   🌱 ${g.name}`);
    console.log(`      Active: ${g.isActive ? '✅' : '❌'}`);
    console.log(`      Products: ${g.hasProducts ? `✅ ${g.productCount} linked` : '❌ NONE - NEEDS LINKING'}`);
    console.log(`      Certifications: ${g.hasCerts ? `✅ ${g.certCount}` : '⚠️ None (optional)'}`);
    console.log(`      Story: ${g.hasStory ? '✅' : '⚠️ Missing (optional)'}`);
    console.log(`      Specialties: ${g.hasSpecialties ? `✅ ${g.specialtyCount}` : '⚠️ None (optional)'}`);
    console.log(`      Stores: ${g.storeCount > 0 ? `✅ ${g.storeCount} linked` : '⚠️ None linked'}`);
    console.log(`      Logo: ${g.hasImage ? '✅' : '❌ MISSING'}`);
    console.log(`      Cover Image: ${g.hasCover ? '✅' : '⚠️ Missing (optional)'}`);
  });
  
  // 3. Check Products linked to growers
  console.log('\n\n📦 PRODUCTS -> GROWER LINKS');
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "growerName": grower->name,
      "hasGrower": defined(grower)
    }
  `);
  
  const withGrower = products.filter(p => p.hasGrower);
  const withoutGrower = products.filter(p => !p.hasGrower);
  
  console.log(`   ✅ Products with grower: ${withGrower.length}`);
  console.log(`   ❌ Products without grower: ${withoutGrower.length}`);
  
  if (withoutGrower.length > 0) {
    console.log('\n   Products needing grower assignment:');
    withoutGrower.forEach(p => console.log(`      - ${p.name}`));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('PHASE C REQUIREMENTS SUMMARY');
  console.log('='.repeat(60));
  
  const storeIssues = [];
  const growerIssues = [];
  
  stores.forEach(s => {
    if (!s.hasHours) storeIssues.push(`${s.name}: Missing operating hours`);
    if (!s.hasCoords) storeIssues.push(`${s.name}: Missing coordinates`);
    if (!s.hasServices) storeIssues.push(`${s.name}: Missing services list`);
    if (s.growerCount === 0) storeIssues.push(`${s.name}: No growers linked`);
  });
  
  growers.forEach(g => {
    if (!g.hasProducts) growerIssues.push(`${g.name}: No products linked`);
    if (!g.hasImage) growerIssues.push(`${g.name}: Missing logo`);
    if (g.storeCount === 0) growerIssues.push(`${g.name}: Not linked to any stores`);
  });
  
  console.log('\n🏪 STORE ISSUES:');
  if (storeIssues.length === 0) {
    console.log('   ✅ No critical issues found!');
  } else {
    storeIssues.forEach(i => console.log(`   ❌ ${i}`));
  }
  
  console.log('\n👨‍🌾 GROWER ISSUES:');
  if (growerIssues.length === 0) {
    console.log('   ✅ No critical issues found!');
  } else {
    growerIssues.forEach(i => console.log(`   ❌ ${i}`));
  }
  
  console.log('\n' + '='.repeat(60));
}

checkData().catch(console.error);
