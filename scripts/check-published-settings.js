/**
 * Check Published vs Draft Site Settings
 * Run with: node scripts/check-published-settings.js
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

async function checkPublishedSettings() {
  console.log('\n🔍 Comparing Published vs Draft Site Settings...\n');
  
  try {
    // Get the PUBLISHED document specifically
    console.log('📋 PUBLISHED siteSettings (what frontend sees):');
    const published = await client.fetch(`*[_id == "siteSettingsDoc"][0] {
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
    
    console.log(JSON.stringify(published, null, 2));
    
    // Check if there are unpublished changes
    console.log('\n\n📋 DRAFT siteSettings (unpublished changes):');
    const draft = await client.fetch(`*[_id == "drafts.siteSettingsDoc"][0] {
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
    
    if (draft) {
      console.log(JSON.stringify(draft, null, 2));
      console.log('\n⚠️  There are UNPUBLISHED changes in the draft!');
      console.log('👉 Go to Sanity Studio and click PUBLISH to make changes live.');
    } else {
      console.log('No draft document found - all changes are published.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkPublishedSettings();
