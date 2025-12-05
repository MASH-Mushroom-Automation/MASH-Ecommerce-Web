/**
 * Test Sanity Connection
 * Verifies environment variables and API access
 */

const {
  testConnection,
  countDocuments,
  fetchDocuments,
} = require('./lib/sanity-client');

async function runTests() {
  console.log('🧪 Testing Sanity Connection...\n');

  // Test 1: Connection
  console.log('Test 1: Connection');
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Connection test failed');
    process.exit(1);
  }

  // Test 2: Count documents
  console.log('\nTest 2: Document Counts');
  try {
    const types = ['product', 'category', 'productVariant', 'productBundle', 'review'];
    
    for (const type of types) {
      const count = await countDocuments(type);
      console.log(`   ${type}: ${count} documents`);
    }
  } catch (error) {
    console.error('   ❌ Failed:', error.message);
  }

  // Test 3: Sample query
  console.log('\nTest 3: Sample Query');
  try {
    const products = await fetchDocuments('*[_type == "product"][0...3]{ name, price }');
    if (products.length > 0) {
      console.log(`   ✅ Found ${products.length} products:`);
      products.forEach(p => console.log(`      - ${p.name} (₱${p.price})`));
    } else {
      console.log('   ℹ️  No products found (expected for new setup)');
    }
  } catch (error) {
    console.error('   ❌ Failed:', error.message);
  }

  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
