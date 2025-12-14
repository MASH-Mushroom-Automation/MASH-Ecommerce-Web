/**
 * Check if product has video in media gallery
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false
});

async function checkVideo() {
  const product = await client.fetch(`
    *[_type == "product" && name match "King Oyster"][0] { 
      name, 
      slug,
      media[] { 
        _key, 
        mediaType, 
        videoUrl, 
        title 
      } 
    }
  `);
  
  console.log('Product:', product.name);
  console.log('Slug:', product.slug?.current);
  console.log('Media Gallery:', JSON.stringify(product.media, null, 2));
  
  if (product.media && product.media.length > 0) {
    console.log('\n✅ Video found in media gallery!');
    console.log('Total media items:', product.media.length);
  } else {
    console.log('\n❌ No media items found');
  }
}

checkVideo();
