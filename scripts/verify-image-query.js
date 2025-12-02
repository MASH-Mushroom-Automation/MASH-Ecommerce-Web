#!/usr/bin/env node
/**
 * Verify Image Query Fix
 * Tests that coalesce query returns image URLs correctly
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN
});

async function verifyImageQuery() {
  console.log('Testing coalesce query for product images...\n');
  
  // Query using the coalesce pattern (same as useSanityGrowers.ts)
  const query = `*[_type == "product"][0...5]{
    name,
    "mainImage": coalesce(mainImage.asset->url, image.asset->url)
  }`;
  
  try {
    const products = await client.fetch(query);
    
    console.log('Results with coalesce query:');
    console.log('============================================================\n');
    
    let withImage = 0;
    let withoutImage = 0;
    
    products.forEach(p => {
      const hasImage = p.mainImage !== null;
      if (hasImage) withImage++;
      else withoutImage++;
      
      console.log(`📦 ${p.name}`);
      console.log(`   mainImage: ${p.mainImage ? '✅ ' + p.mainImage.substring(0, 60) + '...' : '❌ null'}`);
      console.log('');
    });
    
    console.log('============================================================');
    console.log(`✅ Products WITH image URL: ${withImage}`);
    console.log(`❌ Products WITHOUT image URL: ${withoutImage}`);
    
    if (withImage > 0) {
      console.log('\n🎉 SUCCESS! coalesce query is returning image URLs correctly!');
    } else {
      console.log('\n⚠️ WARNING: No images returned. Check Sanity data.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyImageQuery();
