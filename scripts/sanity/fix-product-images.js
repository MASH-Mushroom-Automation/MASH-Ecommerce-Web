/**
 * Fix Product Image References in Sanity
 * Re-uploads images and ensures proper asset references
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const {createClient} = require('@sanity/client');

// Sanity client configuration
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'gerattrr',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function fixProductImages() {
  console.log('🔧 Fixing Product Image References...\n');

  try {
    // 1. Fetch all products
    console.log('1️⃣  Fetching products...');
    const products = await client.fetch('*[_type == "product"]{ _id, slug, name, image }');
    console.log(`   Found ${products.length} products\n`);

    // 2. Check which products have missing/invalid images
    const productsWithoutImages = products.filter(p => !p.image || !p.image.asset);
    const productsWithImages = products.filter(p => p.image && p.image.asset);

    console.log('2️⃣  Image Status:');
    console.log(`   ✅ Products with images: ${productsWithImages.length}`);
    console.log(`   ❌ Products without images: ${productsWithoutImages.length}\n`);

    if (productsWithoutImages.length > 0) {
      console.log('   Products missing images:');
      productsWithoutImages.forEach(p => {
        console.log(`      - ${p.name} (${p.slug.current})`);
      });
      console.log();
    }

    // 3. Check images directory
    const imagesDir = path.join(__dirname, '../../data/sanity/images');
    if (!fs.existsSync(imagesDir)) {
      console.log('   ❌ Images directory not found: data/sanity/images/\n');
      return;
    }

    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`3️⃣  Found ${imageFiles.length} image files in directory\n`);

    // 4. Upload missing images
    if (productsWithoutImages.length > 0 && imageFiles.length > 0) {
      console.log('4️⃣  Uploading missing images...');
      
      for (const product of productsWithoutImages) {
        const slug = product.slug.current;
        
        // Find matching image file
        const imageFile = imageFiles.find(file => {
          const baseName = path.basename(file, path.extname(file));
          return baseName === slug;
        });

        if (imageFile) {
          try {
            const imagePath = path.join(imagesDir, imageFile);
            const imageBuffer = fs.readFileSync(imagePath);
            
            // Upload to Sanity Assets
            console.log(`   📤 Uploading: ${imageFile}...`);
            const asset = await client.assets.upload('image', imageBuffer, {
              filename: imageFile,
            });

            // Update product with image reference
            await client.patch(product._id)
              .set({
                image: {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: asset._id,
                  },
                },
              })
              .commit();

            console.log(`   ✅ Linked to: ${product.name}`);
          } catch (error) {
            console.log(`   ❌ Failed: ${product.name} - ${error.message}`);
          }
        } else {
          console.log(`   ⚠️  No image file found for: ${slug}`);
        }
      }
      console.log();
    }

    // 5. Verify final state
    console.log('5️⃣  Verifying...');
    const updatedProducts = await client.fetch('*[_type == "product"]{ _id, name, image }');
    const finalWithImages = updatedProducts.filter(p => p.image && p.image.asset);
    const finalWithoutImages = updatedProducts.filter(p => !p.image || !p.image.asset);

    console.log(`   ✅ Products with valid images: ${finalWithImages.length}/${updatedProducts.length}`);
    if (finalWithoutImages.length > 0) {
      console.log(`   ⚠️  Still missing images: ${finalWithoutImages.length}`);
      finalWithoutImages.forEach(p => {
        console.log(`      - ${p.name}`);
      });
    }

    console.log();
    console.log('🎉 Image fix complete!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run fix
fixProductImages();
