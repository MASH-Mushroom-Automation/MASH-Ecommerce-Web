/**
 * Test Site Settings from Sanity CMS
 * Run with: node scripts/test-site-settings.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function testSiteSettings() {
  console.log('\n🔍 Testing Sanity CMS Site Settings...\n');
  console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr');
  console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'production');
  
  try {
    // Test 0: Check ALL siteSettings documents (drafts and published)
    console.log('\n📋 Test 0: Checking ALL siteSettings documents (drafts + published)...');
    const allSettings = await client.fetch(`*[_type == "siteSettings"] { _id, companyName }`);
    console.log('All siteSettings documents:', JSON.stringify(allSettings, null, 2));
    
    // Test 1: Check for siteSettings document
    console.log('\n📋 Test 1: Checking siteSettings document...');
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _type,
      companyName,
      tagline,
      description,
      "logo": logo.asset->url,
      "favicon": favicon.asset->url,
      contactEmail,
      contactPhone,
      address,
      socialMedia,
      announcementBar,
      footer,
      seo,
      businessHours,
      features
    }`);
    
    if (siteSettings) {
      console.log('✅ Site Settings found!');
      console.log('\n📄 Site Settings Data:');
      console.log(JSON.stringify(siteSettings, null, 2));
    } else {
      console.log('⚠️  No siteSettings document found');
      
      // Check for legacy settings
      console.log('\n📋 Test 2: Checking legacy settings document...');
      const legacySettings = await client.fetch(`*[_type == "settings"][0]`);
      
      if (legacySettings) {
        console.log('✅ Legacy settings found:');
        console.log(JSON.stringify(legacySettings, null, 2));
      } else {
        console.log('⚠️  No legacy settings document found either');
      }
    }
    
    // Test 3: List all document types in the dataset
    console.log('\n📋 Test 3: Listing all document types...');
    const docTypes = await client.fetch(`array::unique(*[]._type)`);
    console.log('Document types in dataset:', docTypes);
    
    // Test 4: Count documents per type
    console.log('\n📋 Test 4: Document counts...');
    for (const type of docTypes.slice(0, 10)) { // First 10 types
      const count = await client.fetch(`count(*[_type == "${type}"])`);
      console.log(`  ${type}: ${count}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode === 401) {
      console.log('💡 Tip: Check your SANITY_API_READ_TOKEN in .env.local');
    }
  }
}

testSiteSettings();
