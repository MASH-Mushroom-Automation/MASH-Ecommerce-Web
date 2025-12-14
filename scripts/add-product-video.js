/**
 * Add YouTube Video to Product Media Gallery
 * Adds a YouTube video to Fresh King Oyster Mushrooms
 * 
 * Run: node scripts/add-product-video.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Helper to generate unique keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15);
}

async function addVideoToProduct() {
  console.log('\n🎬 ADDING VIDEO TO PRODUCT');
  console.log('===========================\n');

  try {
    // 1. Find Fresh King Oyster Mushrooms product
    console.log('🔍 Finding Fresh King Oyster Mushrooms...');
    
    const product = await client.fetch(`
      *[_type == "product" && name match "King Oyster"][0] {
        _id,
        name,
        images,
        media
      }
    `);

    if (!product) {
      console.log('❌ Product not found!');
      return;
    }

    console.log(`✅ Found: ${product.name} (${product._id})`);
    console.log(`   Current images: ${product.images?.length || 0}`);
    console.log(`   Current media items: ${product.media?.length || 0}`);

    // 2. Create new media item with YouTube video
    const youtubeVideoItem = {
      _key: generateKey(),
      _type: 'mediaItem',
      mediaType: 'video',
      videoUrl: 'https://www.youtube.com/shorts/AeecFHZxSP4',
      title: 'Fresh King Oyster Mushrooms - Product Video',
      caption: 'Watch how fresh and premium our King Oyster mushrooms are! Perfect for stir-fry, grilling, and gourmet dishes.',
      isPrimary: false,
      sortOrder: 1,
    };

    // 3. Update product with the new media item
    console.log('\n📤 Adding YouTube video to media gallery...');
    
    const existingMedia = product.media || [];
    
    const result = await client
      .patch(product._id)
      .set({
        media: [...existingMedia, youtubeVideoItem]
      })
      .commit();

    console.log(`\n✅ SUCCESS! Video added to ${result.name}`);
    console.log(`   Media gallery now has ${result.media?.length || 0} items`);

    // 4. Verify the update
    console.log('\n🔍 Verifying update...');
    
    const updatedProduct = await client.fetch(`
      *[_type == "product" && _id == "${product._id}"][0] {
        _id,
        name,
        media[] {
          _key,
          mediaType,
          title,
          videoUrl,
          isPrimary,
          sortOrder
        }
      }
    `);

    console.log('\n📋 UPDATED MEDIA GALLERY:');
    console.log('========================');
    
    if (updatedProduct.media && updatedProduct.media.length > 0) {
      updatedProduct.media.forEach((item, i) => {
        const icon = item.mediaType === 'video' ? '🎬' : '🖼️';
        const primary = item.isPrimary ? ' ⭐' : '';
        console.log(`   ${i + 1}. ${icon} ${item.title || item.mediaType}${primary}`);
        if (item.videoUrl) {
          console.log(`      URL: ${item.videoUrl}`);
        }
      });
    } else {
      console.log('   No media items found');
    }

    console.log('\n🎉 DONE! The YouTube video has been added.');
    console.log('\n📝 TO VIEW:');
    console.log('   1. Open Sanity Studio: http://localhost:3333');
    console.log('   2. Go to Products → Fresh King Oyster Mushrooms');
    console.log('   3. Scroll down to "Product Media Gallery"');
    console.log('   4. You should see the YouTube video listed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
  }
}

addVideoToProduct();
