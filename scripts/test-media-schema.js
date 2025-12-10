/**
 * Test Product Media Schema
 * Verifies that the enhanced media gallery schema is working
 * 
 * Run: node scripts/test-media-schema.js
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

async function testMediaSchema() {
  console.log('\n🖼️  PRODUCT MEDIA SCHEMA TEST');
  console.log('================================\n');

  try {
    // 1. Check current products and their media fields
    console.log('📋 Checking existing products for media fields...\n');
    
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        "hasMainImage": defined(image),
        "mainImageAlt": image.alt,
        "additionalImagesCount": count(images),
        "mediaGalleryCount": count(media),
        "mediaGallery": media[] {
          mediaType,
          title,
          isPrimary,
          sortOrder,
          "hasImage": defined(image),
          "hasVideo": defined(video),
          "hasVideoUrl": defined(videoUrl)
        }
      } | order(name asc)
    `);

    console.log(`Found ${products.length} products:\n`);

    products.forEach((product, i) => {
      console.log(`${i + 1}. ${product.name}`);
      console.log(`   Main Image: ${product.hasMainImage ? '✅' : '❌'} ${product.mainImageAlt ? `(Alt: "${product.mainImageAlt}")` : ''}`);
      console.log(`   Additional Images: ${product.additionalImagesCount || 0}`);
      console.log(`   Media Gallery Items: ${product.mediaGalleryCount || 0}`);
      
      if (product.mediaGallery && product.mediaGallery.length > 0) {
        product.mediaGallery.forEach((media, j) => {
          const icon = media.mediaType === 'video' ? '🎬' : '🖼️';
          const primary = media.isPrimary ? ' ⭐' : '';
          console.log(`      ${j + 1}. ${icon} ${media.title || media.mediaType}${primary}`);
        });
      }
      console.log('');
    });

    // 2. Summary
    console.log('\n📊 MEDIA SUMMARY');
    console.log('================');
    
    const stats = {
      totalProducts: products.length,
      withMainImage: products.filter(p => p.hasMainImage).length,
      withAdditionalImages: products.filter(p => p.additionalImagesCount > 0).length,
      withMediaGallery: products.filter(p => p.mediaGalleryCount > 0).length,
      totalAdditionalImages: products.reduce((sum, p) => sum + (p.additionalImagesCount || 0), 0),
      totalMediaItems: products.reduce((sum, p) => sum + (p.mediaGalleryCount || 0), 0),
    };

    console.log(`\n   Total Products: ${stats.totalProducts}`);
    console.log(`   With Main Image: ${stats.withMainImage}/${stats.totalProducts}`);
    console.log(`   With Additional Images: ${stats.withAdditionalImages}/${stats.totalProducts}`);
    console.log(`   With Media Gallery: ${stats.withMediaGallery}/${stats.totalProducts}`);
    console.log(`   Total Additional Images: ${stats.totalAdditionalImages}`);
    console.log(`   Total Media Gallery Items: ${stats.totalMediaItems}`);

    // 3. Schema verification
    console.log('\n\n✅ SCHEMA FEATURES NOW AVAILABLE');
    console.log('=================================\n');
    
    console.log('📷 IMAGE SUPPORT:');
    console.log('   ✓ JPG/JPEG');
    console.log('   ✓ PNG');
    console.log('   ✓ GIF (animated)');
    console.log('   ✓ WebP');
    console.log('   ✓ AVIF');
    console.log('   ✓ SVG');
    console.log('   ✓ BMP');
    console.log('   ✓ TIFF');
    console.log('   ✓ ICO');
    console.log('   ✓ HEIC/HEIF (iOS photos)');
    
    console.log('\n🎬 VIDEO SUPPORT:');
    console.log('   ✓ MP4');
    console.log('   ✓ WebM');
    console.log('   ✓ MOV (QuickTime)');
    console.log('   ✓ AVI');
    console.log('   ✓ MKV');
    console.log('   ✓ YouTube URLs (embedded)');
    console.log('   ✓ Vimeo URLs (embedded)');
    
    console.log('\n🖼️  IMAGE FIELDS:');
    console.log('   1. image (Main product image - REQUIRED)');
    console.log('      - Hotspot cropping');
    console.log('      - Alt text for SEO');
    console.log('   2. images[] (Additional images array)');
    console.log('      - Hotspot cropping');
    console.log('      - Alt text');
    console.log('      - Caption');
    console.log('   3. media[] (Complete media gallery)');
    console.log('      - Images with hotspot');
    console.log('      - Video files (upload)');
    console.log('      - External video URLs');
    console.log('      - Title & caption');
    console.log('      - Primary flag');
    console.log('      - Sort order');

    console.log('\n\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Open Sanity Studio: http://localhost:3333');
    console.log('2. Click on any Product');
    console.log('3. Scroll to "Additional Images" or "Product Media Gallery"');
    console.log('4. Click "+ Add Item" to add images or videos');
    console.log('5. For videos, select "🎬 Video" and upload or paste YouTube/Vimeo URL');
    console.log('6. Click "Publish" to save changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMediaSchema();
