const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function verifyImages() {
  console.log('🔍 Verifying Product Images...\n');

  try {
    const products = await client.fetch(`
      *[_type == "product"] | order(name asc) {
        _id,
        name,
        slug,
        "hasImage": defined(image.asset),
        "imageRef": image.asset._ref,
        "imageUrl": image.asset->url
      }
    `);

    console.log(`📦 Total products: ${products.length}\n`);

    let validImages = 0;
    let missingImages = 0;

    products.forEach((product, index) => {
      const status = product.hasImage ? '✅' : '❌';
      const refPreview = product.imageRef ? product.imageRef.slice(0, 20) + '...' : 'NULL';
      
      console.log(`${index + 1}. ${status} ${product.name}`);
      console.log(`   Slug: ${product.slug.current}`);
      console.log(`   Image Ref: ${refPreview}`);
      console.log(`   Has URL: ${product.imageUrl ? 'YES' : 'NO'}`);
      console.log('');

      if (product.hasImage) validImages++;
      else missingImages++;
    });

    console.log('\n📊 Summary:');
    console.log(`   ✅ Valid images: ${validImages}/${products.length}`);
    console.log(`   ❌ Missing images: ${missingImages}/${products.length}`);
    console.log(`   📈 Success rate: ${((validImages / products.length) * 100).toFixed(1)}%`);

    if (missingImages === 0) {
      console.log('\n🎉 All products have valid images!');
    } else {
      console.log('\n⚠️  Some products need images uploaded');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyImages();
