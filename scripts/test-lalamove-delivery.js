/**
 * Lalamove API Test Script
 * Tests quotation and order placement with actual delivery addresses
 * 
 * PICKUP: 266 Quirino Hwy, Novaliches, Quezon City (Paulo)
 * DROPOFF: Phone Craft Cellphone Repair, Caloocan (Mary Jane)
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const https = require('https');

// Test configuration
const TEST_CONFIG = {
  // Parsed from Google Maps iframes
  pickup: {
    name: 'Paulo tongco',
    phone: '+639327677205',
    address: '266 Quirino Hwy, Novaliches, Quezon City, Metro Manila, Philippines',
    coordinates: {
      lat: '14.72176748577907',
      lng: '121.03832287637948'
    },
    instructions: 'Novaliches bayan katabi Ng mcdo sa susano china town cellphone city shop name Paulo'
  },
  dropoff: {
    name: 'Mary Jane Bahay',
    phone: '+639272533969',
    address: '936 Llano rd. Tapat ng INFINITY WASH malapit sa 7/11 llano',
    coordinates: {
      lat: '14.74071710025935',
      lng: '121.00675881440075'
    },
    instructions: '936 Llano rd. Tapat ng INFINITY WASH malapit sa 7/11 llano'
  }
};

// Environment validation
function validateEnv() {
  const required = [
    'LALAMOVE_API_KEY',
    'LALAMOVE_API_SECRET',
    'LALAMOVE_HOST',
    'LALAMOVE_MARKET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Make sure .env.local has Lalamove credentials');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded\n');
  console.log(`   API Host: ${process.env.LALAMOVE_HOST}`);
  console.log(`   Market: ${process.env.LALAMOVE_MARKET}`);
  console.log(`   API Key: ${process.env.LALAMOVE_API_KEY.substring(0, 20)}...\n`);
}

// Generate HMAC signature
function generateSignature(timestamp, method, path, body) {
  const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;
  
  return crypto
    .createHmac('sha256', process.env.LALAMOVE_API_SECRET)
    .update(rawSignature)
    .digest('hex');
}

// Make API request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    
    // ✅ FIX: Use full path with query string for signature
    const url = new URL(process.env.LALAMOVE_HOST + path);
    const pathForSignature = url.pathname + url.search;
    
    // ✅ For GET requests, always use empty string for body
    const bodyForSignature = (method === 'GET') ? '' : bodyString;
    const signature = generateSignature(timestamp, method, pathForSignature, bodyForSignature);
    
    const options = {
      hostname: url.hostname,
      path: pathForSignature,  // ✅ FIX: Use full path with query params
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `hmac ${process.env.LALAMOVE_API_KEY}:${timestamp}:${signature}`,
        'Market': process.env.LALAMOVE_MARKET,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (bodyString) {
      req.write(bodyString);
    }

    req.end();
  });
}

// Test 1: Get Quotation
async function testQuotation() {
  console.log('📋 TEST 1: Get Quotation\n');
  console.log('Pickup:', TEST_CONFIG.pickup.address);
  console.log('Dropoff:', TEST_CONFIG.dropoff.address);
  console.log(`Distance: ~${calculateDistance()}km\n`);

  const requestBody = {
    data: {
      language: 'en_PH',  // ✅ REQUIRED: Locale for PH market
      serviceType: 'MOTORCYCLE',  // ✅ MUST be specific vehicle type, not 'COURIER'
      stops: [
        {
          coordinates: {  // ✅ Use 'coordinates' not 'location'
            lat: TEST_CONFIG.pickup.coordinates.lat,
            lng: TEST_CONFIG.pickup.coordinates.lng
          },
          address: TEST_CONFIG.pickup.address
        },
        {
          coordinates: {  // ✅ Use 'coordinates' not 'location'
            lat: TEST_CONFIG.dropoff.coordinates.lat,
            lng: TEST_CONFIG.dropoff.coordinates.lng
          },
          address: TEST_CONFIG.dropoff.address
        }
      ],
      // ✅ Remove 'deliveries' and 'market' from data object
      item: {
        quantity: '1',
        weight: 'LESS_THAN_3KG',
        categories: ['FOOD_DELIVERY'],
        handlingInstructions: ['KEEP_UPRIGHT']
      }
    }
  };

  console.log('📤 Sending quotation request...\n');
  
  try {
    const response = await makeRequest('POST', '/v3/quotations', requestBody);
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Quotation SUCCESS\n');
      console.log('Response:');
      console.log(JSON.stringify(response.body, null, 2));
      
      if (response.body.data) {
        const quote = response.body.data;
        console.log('\n💰 PRICING BREAKDOWN:');
        console.log(`   Quotation ID: ${quote.quotationId}`);
        console.log(`   Total Price: ₱${quote.priceBreakdown?.total || 'N/A'}`);
        console.log(`   Currency: ${quote.priceBreakdown?.currency || 'PHP'}`);
        console.log(`   Distance: ${quote.distance?.value || 'N/A'}${quote.distance?.unit || ''}`);
        
        return quote.quotationId;
      }
    } else {
      console.log('❌ Quotation FAILED\n');
      console.log('Error Response:');
      console.log(JSON.stringify(response.body, null, 2));
      
      // Document error
      documentError('QUOTATION', response.statusCode, response.body);
    }
  } catch (error) {
    console.error('❌ Request Error:', error.message);
    documentError('QUOTATION', 'NETWORK_ERROR', { message: error.message });
  }
  
  return null;
}

// Test 2: Place Order (DISABLED by default for safety)
async function testOrderPlacement(quotationId) {
  console.log('\n📦 TEST 2: Place Order\n');
  console.log('⚠️  ORDER PLACEMENT DISABLED FOR SAFETY');
  console.log('⚠️  This would charge real money in production!\n');
  
  console.log('To enable, set ENABLE_ORDER_TEST=true in environment\n');
  
  if (process.env.ENABLE_ORDER_TEST !== 'true') {
    console.log('Skipping order placement test...');
    return;
  }

  if (!quotationId) {
    console.log('❌ Cannot place order without valid quotation ID');
    return;
  }

  const requestBody = {
    data: {
      quotationId: quotationId,
      sender: {
        stopId: 'stop_0',
        name: TEST_CONFIG.pickup.name,
        phone: TEST_CONFIG.pickup.phone
      },
      recipients: [
        {
          stopId: 'stop_1',
          name: TEST_CONFIG.dropoff.name,
          phone: TEST_CONFIG.dropoff.phone,
          remarks: TEST_CONFIG.dropoff.instructions
        }
      ],
      isPODEnabled: true,
      metadata: {
        testOrder: true,
        source: 'MASH-Test-Script',
        testDate: new Date().toISOString()
      }
    }
  };

  console.log('📤 Sending order request...\n');
  
  try {
    const response = await makeRequest('POST', '/v3/orders', requestBody);
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 201) {
      console.log('✅ Order Placed SUCCESS\n');
      console.log('Response:');
      console.log(JSON.stringify(response.body, null, 2));
      
      if (response.body.data) {
        const order = response.body.data;
        console.log('\n📋 ORDER DETAILS:');
        console.log(`   Order ID: ${order.orderId}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Share Link: ${order.shareLink}`);
      }
    } else {
      console.log('❌ Order Placement FAILED\n');
      console.log('Error Response:');
      console.log(JSON.stringify(response.body, null, 2));
      
      documentError('ORDER_PLACEMENT', response.statusCode, response.body);
    }
  } catch (error) {
    console.error('❌ Request Error:', error.message);
    documentError('ORDER_PLACEMENT', 'NETWORK_ERROR', { message: error.message });
  }
}

// Test 3: Get Cities
async function testGetCities() {
  console.log('\n🌆 TEST 3: Get Available Cities\n');
  
  try {
    const response = await makeRequest('GET', '/v3/cities');
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Get Cities SUCCESS\n');
      
      if (response.body.data) {
        const cities = response.body.data;
        console.log(`Found ${cities.length} cities:\n`);
        
        // Check if our cities are supported
        const supportedCities = cities.map(c => c.name);
        console.log('Supported Cities:', supportedCities.join(', '));
        
        const quezoneCity = cities.find(c => c.name.toLowerCase().includes('quezon'));
        const caloocan = cities.find(c => c.name.toLowerCase().includes('caloocan'));
        
        console.log('\n🔍 Our Test Locations:');
        console.log(`   Quezon City (Pickup): ${quezoneCity ? '✅ Supported' : '❌ Not Found'}`);
        console.log(`   Caloocan (Dropoff): ${caloocan ? '✅ Supported' : '❌ Not Found'}`);
      }
    } else {
      console.log('❌ Get Cities FAILED\n');
      console.log(JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Request Error:', error.message);
  }
}

// Test 4: Get Vehicle Types
async function testGetVehicleTypes() {
  console.log('\n🚗 TEST 4: Get Vehicle Types\n');
  
  try {
    const response = await makeRequest('GET', `/v3/vehicle-types?market=${process.env.LALAMOVE_MARKET}`);
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Get Vehicle Types SUCCESS\n');
      
      if (response.body.data) {
        const vehicles = response.body.data;
        console.log(`Available Vehicles:\n`);
        vehicles.forEach(v => {
          console.log(`   - ${v.key}: ${v.name}`);
        });
      }
    } else {
      console.log('❌ Get Vehicle Types FAILED\n');
      console.log(JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Request Error:', error.message);
  }
}

// Helper: Calculate distance between coordinates
function calculateDistance() {
  const lat1 = parseFloat(TEST_CONFIG.pickup.coordinates.lat);
  const lon1 = parseFloat(TEST_CONFIG.pickup.coordinates.lng);
  const lat2 = parseFloat(TEST_CONFIG.dropoff.coordinates.lat);
  const lon2 = parseFloat(TEST_CONFIG.dropoff.coordinates.lng);

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance.toFixed(2);
}

// Document errors for analysis
const errors = [];

function documentError(testName, statusCode, body) {
  errors.push({
    test: testName,
    statusCode,
    error: body,
    timestamp: new Date().toISOString()
  });
}

// Generate test report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST REPORT SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  console.log('Test Configuration:');
  console.log(`   Environment: ${process.env.LALAMOVE_HOST.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION'}`);
  console.log(`   Market: ${process.env.LALAMOVE_MARKET}`);
  console.log(`   Pickup: ${TEST_CONFIG.pickup.address}`);
  console.log(`   Dropoff: ${TEST_CONFIG.dropoff.address}`);
  console.log(`   Distance: ~${calculateDistance()}km\n`);
  
  if (errors.length === 0) {
    console.log('✅ ALL TESTS PASSED - No errors encountered!\n');
  } else {
    console.log(`❌ ERRORS ENCOUNTERED: ${errors.length}\n`);
    
    errors.forEach((error, index) => {
      console.log(`Error ${index + 1}: ${error.test}`);
      console.log(`   Status: ${error.statusCode}`);
      console.log(`   Message: ${error.error.message || JSON.stringify(error.error)}`);
      console.log('');
    });
  }
  
  console.log('Next Steps:');
  console.log('   1. Review errors above');
  console.log('   2. Check LALAMOVE_INTEGRATION_COMPLETE.md for updates');
  console.log('   3. Fix issues before production deployment');
  console.log('   4. Run test again after fixes\n');
}

// Main test execution
async function runTests() {
  console.log('🚚 LALAMOVE API TEST - ACTUAL DELIVERY ADDRESSES\n');
  console.log('='.repeat(80) + '\n');
  
  // Validate environment
  validateEnv();
  
  // Run tests
  const quotationId = await testQuotation();
  
  await testGetCities();
  
  await testGetVehicleTypes();
  
  if (quotationId) {
    await testOrderPlacement(quotationId);
  }
  
  // Generate report
  generateReport();
  
  // Save errors to file for analysis
  if (errors.length > 0) {
    const fs = require('fs');
    const errorLog = {
      testDate: new Date().toISOString(),
      environment: process.env.LALAMOVE_HOST,
      errors: errors
    };
    
    fs.writeFileSync(
      'lalamove-test-errors.json',
      JSON.stringify(errorLog, null, 2)
    );
    
    console.log('💾 Errors saved to: lalamove-test-errors.json\n');
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
