/**
 * Fix Published Hero Carousel Script
 * 
 * This script fixes the published version of the hero carousel.
 * Run: node scripts/fix-published-hero.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function fixPublishedHero() {
  console.log('🔧 Fixing Published Hero Carousel...\n');

  const docs = await client.fetch('*[_type == "heroCarousel"]');
  console.log('Found documents:', docs.map(d => d._id));

  const published = docs.find(d => !d._id.startsWith('drafts.'));
  if (published) {
    console.log('Updating published version:', published._id);
    const slides = published.slides?.map((s, i) => ({
      ...s,
      _key: s._key || `slide-${i + 1}`,
      buttonText: s.buttonText || s.ctaText || 'Shop Now',
      buttonLink: s.buttonLink || s.ctaLink || '/shop',
      backgroundColor: s.backgroundColor || '#6A994E',
      textColor: s.textColor || '#FFFFFF',
      order: s.order || (i + 1),
      isActive: s.isActive !== false,
    })) || [];

    await client.patch(published._id).set({
      title: published.title || 'Homepage Hero',
      slides: slides
    }).commit();
    console.log('✅ Published version updated!');
  } else {
    console.log('No published version found, only draft exists.');
  }
}

fixPublishedHero()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
