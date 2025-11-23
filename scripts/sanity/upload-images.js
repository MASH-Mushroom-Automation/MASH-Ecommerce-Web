/**
 * Upload Product Images to Sanity
 * Uploads images from data/sanity/images/ and links them to products
 * 
 * IMPORTANT: You need to manually collect images first!
 * See: data/sanity/images/README.md for instructions
 */

const fs = require('fs');
const path = require('path');
const {uploadImage, updateDocument, fetchDocuments} = require('./lib/sanity-client');

async function uploadProductImages() {
  console.log('📷 Uploading Product Images to Sanity...\n');

  try {
    // 1. Fetch all products
    const products = await fetchDocuments('*[_type == "product"]{ _id, slug, name }');
    console.log(`   Found ${products.length} products in Sanity\n`);

    if (products.length === 0) {
      console.log('   ⚠️  No products found. Import products first!\n');
      return;
    }

    // 2. Check images directory exists
    const imagesDir = path.join(__dirname, '../../data/sanity/images');
    if (!fs.existsSync(imagesDir)) {
      console.log('   ⚠️  Images directory not found!');
      console.log('   📁 Please create: data/sanity/images/');
      console.log('   📖 See: data/sanity/images/README.md for instructions\n');
      return;
    }

    // 3. Get all image files
    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`   Found ${imageFiles.length} image files in data/sanity/images/\n`);

    if (imageFiles.length === 0) {
      console.log('   ⚠️  No images found!');
      console.log('   📖 See: data/sanity/images/README.md for collection guide\n');
      return;
    }

    // 4. Upload images and link to products
    let uploadCount = 0;
    let skippedCount = 0;
    const errors = [];

    console.log('   Uploading images...\n');

    for (const product of products) {
      const productSlug = product.slug.current;
      
      // Find matching image file
      const imageFile = imageFiles.find(file => {
        const fileSlug = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        return fileSlug === productSlug;
      });

      if (!imageFile) {
        console.log(`   ⚠️  No image for: ${product.name} (${productSlug})`);
        skippedCount++;
        continue;
      }

      try {
        // Read image file
        const imagePath = path.join(imagesDir, imageFile);
        const imageBuffer = fs.readFileSync(imagePath);

        // Upload to Sanity Assets
        console.log(`   📤 Uploading: ${imageFile}...`);
        const imageAsset = await uploadImage(imageBuffer, `${product.name}.${imageFile.split('.').pop()}`);

        // Update product with image reference
        await updateDocument(product._id, {
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id,
            },
          },
        });

        console.log(`   ✅ Linked image to: ${product.name}\n`);
        uploadCount++;

      } catch (error) {
        console.error(`   ❌ Failed for ${product.name}: ${error.message}\n`);
        errors.push({product: product.name, error: error.message});
      }
    }

    // 5. Summary
    console.log('\n📊 Upload Summary:');
    console.log(`   ✅ Successfully uploaded: ${uploadCount} images`);
    console.log(`   ⚠️  Skipped (no file): ${skippedCount} products`);
    console.log(`   ❌ Failed: ${errors.length} uploads\n`);

    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach(e => console.log(`   - ${e.product}: ${e.error}`));
      console.log();
    }

    if (uploadCount > 0) {
      console.log('✅ Image upload complete!');
      console.log('   Verify in Studio: http://localhost:3333 → Products\n');
    }

    return {uploadCount, skippedCount, errors};

  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    throw error;
  }
}

// Run upload
if (require.main === module) {
  uploadProductImages()
    .then((result) => {
      if (result && result.uploadCount > 0) {
        console.log('🎉 Ready for Phase 5: Variants!\n');
        process.exit(0);
      } else {
        console.log('⚠️  No images uploaded. Check instructions above.\n');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Upload failed:', error);
      process.exit(1);
    });
}

module.exports = {uploadProductImages};
