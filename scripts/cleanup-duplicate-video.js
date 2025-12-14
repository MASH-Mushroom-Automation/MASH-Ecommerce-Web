/**
 * Remove duplicate video from product media gallery
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN
});

async function cleanupDuplicates() {
  const product = await client.fetch(`
    *[_type == "product" && name match "King Oyster"][0] { 
      _id,
      name, 
      media[] { 
        _key, 
        mediaType, 
        videoUrl 
      } 
    }
  `);
  
  console.log('Product:', product.name);
  console.log('Current media items:', product.media?.length || 0);
  
  if (product.media && product.media.length > 1) {
    // Keep only the first video entry
    const uniqueMedia = [product.media[0]];
    
    console.log('\nRemoving duplicate...');
    
    await client
      .patch(product._id)
      .set({ media: uniqueMedia })
      .commit();
    
    console.log('✅ Cleaned up! Now has 1 video entry.');
  } else {
    console.log('No duplicates to remove.');
  }
}

cleanupDuplicates();
