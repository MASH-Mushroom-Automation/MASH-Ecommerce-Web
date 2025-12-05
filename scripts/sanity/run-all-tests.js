/**
 * Run All Sanity CMS Tests
 * Comprehensive validation of entire CMS setup
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-22',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function runAllTests() {
  console.log('🧪 Running Comprehensive Sanity CMS Tests...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Document Count Verification', fn: verifyDocumentCounts },
    { name: 'Image Verification', fn: verifyImages },
    { name: 'Category-Product Links', fn: verifyCategoryLinks },
    { name: 'Product Variant Links', fn: verifyVariantLinks },
    { name: 'Product Relationships', fn: verifyRelationships },
    { name: 'Bundle Product Links', fn: verifyBundleLinks },
    { name: 'Review Product Links', fn: verifyReviewLinks },
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      console.log(`▶️  Running: ${test.name}...`);
      const result = await test.fn();
      console.log(`   ✅ ${test.name} PASSED`);
      if (result) console.log(`   ${result}`);
      console.log('');
      passed++;
      results.push({ name: test.name, status: 'PASSED', details: result });
    } catch (error) {
      console.error(`   ❌ ${test.name} FAILED`);
      console.error(`   Error: ${error.message}`);
      console.log('');
      failed++;
      results.push({ name: test.name, status: 'FAILED', error: error.message });
    }
  }

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  results.forEach((result, index) => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.name}: ${result.status}`);
    if (result.details) console.log(`   ${result.details}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! Your Sanity CMS is ready for production.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review errors above and fix issues.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Test 1: Connection Test
async function testConnection() {
  const result = await client.fetch('*[_type == "product"][0...1]{ _id, name }');
  return `Connected to Sanity (Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID})`;
}

// Test 2: Document Count Verification
async function verifyDocumentCounts() {
  const counts = {
    categories: await client.fetch('count(*[_type == "category"])'),
    products: await client.fetch('count(*[_type == "product"])'),
    variants: await client.fetch('count(*[_type == "productVariant"])'),
    bundles: await client.fetch('count(*[_type == "productBundle"])'),
    reviews: await client.fetch('count(*[_type == "review"])'),
  };

  const expected = {
    categories: 3,
    products: 15,
    variants: 15,
    bundles: 6,
    reviews: 45,
  };

  const errors = [];
  Object.keys(expected).forEach(type => {
    if (counts[type] !== expected[type]) {
      errors.push(`${type}: expected ${expected[type]}, got ${counts[type]}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return `Total documents: ${total} (3 categories, 15 products, 15 variants, 6 bundles, 45 reviews)`;
}

// Test 3: Image Verification
async function verifyImages() {
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "hasImage": defined(image.asset),
      "imageRef": image.asset._ref
    }
  `);

  const productsWithoutImages = products.filter(p => !p.hasImage);

  if (productsWithoutImages.length > 0) {
    const names = productsWithoutImages.map(p => p.name).join(', ');
    throw new Error(`${productsWithoutImages.length} products missing images: ${names}`);
  }

  return `All ${products.length} products have valid images`;
}

// Test 4: Category-Product Links
async function verifyCategoryLinks() {
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "hasCategory": defined(category._ref),
      "categoryName": category->name
    }
  `);

  const productsWithoutCategory = products.filter(p => !p.hasCategory);

  if (productsWithoutCategory.length > 0) {
    const names = productsWithoutCategory.map(p => p.name).join(', ');
    throw new Error(`${productsWithoutCategory.length} products missing category: ${names}`);
  }

  return `All ${products.length} products linked to categories`;
}

// Test 5: Product Variant Links
async function verifyVariantLinks() {
  const products = await client.fetch(`
    *[_type == "product" && hasVariants == true] {
      name,
      "variantCount": count(variants)
    }
  `);

  if (products.length === 0) {
    throw new Error('No products with variants found (expected 5)');
  }

  const errors = [];
  products.forEach(product => {
    if (product.variantCount < 3) {
      errors.push(`${product.name}: only ${product.variantCount} variants (expected 3)`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return `${products.length} products with variants (3 variants each)`;
}

// Test 6: Product Relationships
async function verifyRelationships() {
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "suggestedCount": count(suggestedProducts),
      "complementaryCount": count(complementaryProducts)
    }
  `);

  const errors = [];
  let totalSuggested = 0;
  let totalComplementary = 0;

  products.forEach(product => {
    totalSuggested += product.suggestedCount;
    totalComplementary += product.complementaryCount;

    if (product.suggestedCount < 3) {
      errors.push(`${product.name}: only ${product.suggestedCount} suggested products (expected 3+)`);
    }
    if (product.complementaryCount < 2) {
      errors.push(`${product.name}: only ${product.complementaryCount} complementary products (expected 2+)`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return `All products have relationships (Suggested: ${totalSuggested}, Complementary: ${totalComplementary})`;
}

// Test 7: Bundle Product Links
async function verifyBundleLinks() {
  const bundles = await client.fetch(`
    *[_type == "productBundle"] {
      bundleName,
      "productCount": count(products)
    }
  `);

  if (bundles.length === 0) {
    throw new Error('No bundles found (expected 6)');
  }

  const errors = [];
  bundles.forEach(bundle => {
    if (bundle.productCount < 2) {
      errors.push(`${bundle.bundleName}: only ${bundle.productCount} products (expected 2+)`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return `All ${bundles.length} bundles have products (2-6 products each)`;
}

// Test 8: Review Product Links
async function verifyReviewLinks() {
  const reviews = await client.fetch(`
    *[_type == "review"] {
      "productName": product->name,
      "hasProduct": defined(product._ref)
    }
  `);

  const reviewsWithoutProduct = reviews.filter(r => !r.hasProduct);

  if (reviewsWithoutProduct.length > 0) {
    throw new Error(`${reviewsWithoutProduct.length} reviews missing product reference`);
  }

  // Check distribution
  const products = await client.fetch(`
    *[_type == "product"] {
      name,
      "reviewCount": count(*[_type == "review" && references(^._id)])
    }
  `);

  const errors = [];
  products.forEach(product => {
    if (product.reviewCount !== 3) {
      errors.push(`${product.name}: ${product.reviewCount} reviews (expected 3)`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return `All ${reviews.length} reviews linked to products (3 reviews per product)`;
}

// Run tests
runAllTests();
