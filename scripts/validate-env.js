/**
 * Environment Validation Script
 * 
 * This script checks if all required environment variables are set
 * before starting the application. Run this during build or startup.
 * 
 * Usage: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'NEXT_PUBLIC_SANITY_API_VERSION',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
];

// Define optional but recommended variables
const RECOMMENDED_VARS = [
  'SANITY_API_READ_TOKEN',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
];

// Check for .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');
const hasEnvLocal = fs.existsSync(envLocalPath);

console.log('🔍 Validating environment configuration...\n');

// Check required variables
const missingRequired = [];
const missingRecommended = [];

REQUIRED_VARS.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
  } else {
    console.log(`✅ ${varName}`);
  }
});

console.log('');

RECOMMENDED_VARS.forEach(varName => {
  if (!process.env[varName]) {
    missingRecommended.push(varName);
  } else {
    console.log(`✅ ${varName}`);
  }
});

console.log('\n---\n');

// Report results
if (missingRequired.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:');
  missingRequired.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n⚠️  Application may fail to start!');
  console.error('📝 See .github/RAILWAY_DEPLOYMENT_GUIDE.md for setup instructions\n');
  
  // Exit with error code in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (missingRecommended.length > 0) {
  console.warn('⚠️  Missing recommended environment variables:');
  missingRecommended.forEach(varName => {
    console.warn(`   - ${varName}`);
  });
  console.warn('\n💡 Some features may not work correctly\n');
}

if (missingRequired.length === 0 && missingRecommended.length === 0) {
  console.log('✅ All environment variables are set!\n');
}

// Check for .env.local in production
if (process.env.NODE_ENV === 'production' && hasEnvLocal) {
  console.warn('⚠️  WARNING: .env.local file detected in production build');
  console.warn('   Make sure to set environment variables in Railway dashboard\n');
}

// Display current environment
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 API URL: ${process.env.NEXT_PUBLIC_API_URL || 'Not set'}`);
console.log(`🗄️  Sanity Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'Not set'}\n`);
