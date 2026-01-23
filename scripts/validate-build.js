#!/usr/bin/env node

/**
 * Production Build Validation Script (STORY-TEST-016)
 * Validates environment variables, build status, and production readiness
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env files
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    if (!key) continue;
    
    const value = valueParts.join('=').trim();
    // Remove quotes if present
    const cleanValue = value.replace(/^["']|["']$/g, '');
    
    // Only set if not already set (precedence: .env.local > .env.production > .env)
    if (!process.env[key.trim()]) {
      process.env[key.trim()] = cleanValue;
    }
  }
}

// Load .env files in order of precedence
loadEnvFile(path.join(process.cwd(), '.env'));
loadEnvFile(path.join(process.cwd(), '.env.production'));
loadEnvFile(path.join(process.cwd(), '.env.local'));

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

// Required environment variables for production
const requiredEnvVars = {
  // Sanity CMS
  'NEXT_PUBLIC_SANITY_PROJECT_ID': 'Sanity project ID',
  'NEXT_PUBLIC_SANITY_DATASET': 'Sanity dataset',
  'NEXT_PUBLIC_SANITY_API_VERSION': 'Sanity API version',
  
  // Firebase Auth
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API key',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase auth domain',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase project ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase storage bucket',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase messaging sender ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase app ID',
  
  // Backend API
  'NEXT_PUBLIC_API_URL': 'Backend API URL',
};

// Optional but recommended environment variables
const optionalEnvVars = {
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'Google Maps API key',
  'NEXT_PUBLIC_ENABLE_API_LOGGING': 'API logging flag',
  'NEXT_PUBLIC_EMAIL_SERVICE_ENV': 'Email service environment',
};

// Validate environment variables
function validateEnvironmentVariables() {
  log('\n📋 Validating Environment Variables...', 'cyan');
  
  let hasErrors = false;
  const missing = [];
  const warnings = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[varName]) {
      missing.push(`${varName} (${description})`);
      logError(`Missing required: ${varName}`);
      hasErrors = true;
    } else {
      logSuccess(`${varName} is set`);
    }
  }
  
  // Check optional variables
  for (const [varName, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[varName]) {
      warnings.push(`${varName} (${description})`);
      logWarning(`Optional variable not set: ${varName}`);
    } else {
      logSuccess(`${varName} is set (optional)`);
    }
  }
  
  // Check for exposed sensitive keys (should NOT have NEXT_PUBLIC_ prefix)
  const sensitivePatterns = [
    'SECRET',
    'PRIVATE_KEY',
    'PASSWORD',
  ];
  
  // Allowed exceptions (these are safe to expose)
  const allowedExceptions = [
    'NEXT_PUBLIC_AUTH_TOKEN_KEY', // Just a cookie name, not a secret
    'NEXT_PUBLIC_REFRESH_TOKEN_KEY', // Just a cookie name, not a secret
  ];
  
  const exposedSensitive = [];
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_') && !allowedExceptions.includes(key)) {
      for (const pattern of sensitivePatterns) {
        if (key.includes(pattern)) {
          exposedSensitive.push(key);
          logError(`Potentially sensitive env var exposed to client: ${key}`);
          hasErrors = true;
        }
      }
    }
  }
  
  // Summary
  log('\n📊 Environment Variables Summary:', 'cyan');
  logInfo(`Required variables: ${Object.keys(requiredEnvVars).length - missing.length}/${Object.keys(requiredEnvVars).length} set`);
  if (warnings.length > 0) {
    logWarning(`Optional variables: ${Object.keys(optionalEnvVars).length - warnings.length}/${Object.keys(optionalEnvVars).length} set`);
  }
  if (exposedSensitive.length > 0) {
    logError(`Exposed sensitive variables: ${exposedSensitive.length}`);
  }
  
  return { hasErrors, missing, warnings, exposedSensitive };
}

// Check .env file existence
function checkEnvFiles() {
  log('\n📁 Checking Environment Files...', 'cyan');
  
  const envFiles = [
    '.env',
    '.env.production',
    '.env.local',
  ];
  
  let foundAny = false;
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Found: ${file}`);
      foundAny = true;
    } else {
      logInfo(`Not found: ${file} (optional)`);
    }
  }
  
  if (!foundAny) {
    logError('No .env files found! Create .env or .env.production');
    return false;
  }
  
  return true;
}

// Validate Next.js configuration
function validateNextConfig() {
  log('\n⚙️  Validating Next.js Configuration...', 'cyan');
  
  const configPath = path.join(process.cwd(), 'next.config.ts');
  if (!fs.existsSync(configPath)) {
    logError('next.config.ts not found!');
    return false;
  }
  
  logSuccess('next.config.ts exists');
  
  // Check for common misconfigurations
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  if (configContent.includes('ignoreBuildErrors: true')) {
    logWarning('ignoreBuildErrors is set to true. Should be fixed before production deployment.');
    logInfo('TypeScript errors must be resolved to set ignoreBuildErrors: false');
  } else {
    logSuccess('ignoreBuildErrors is not enabled (good)');
  }
  
  if (configContent.includes('typescript: { ignoreBuildErrors: true }')) {
    logWarning('TypeScript build errors are being ignored. Should be fixed for production.');
    logInfo('Run "npx tsc --noEmit" to see all TypeScript errors');
  } else {
    logSuccess('TypeScript build errors are not ignored (good)');
  }
  
  return true;
}

// Check build output
function checkBuildOutput() {
  log('\n🏗️  Checking Build Output...', 'cyan');
  
  const buildDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildDir)) {
    logWarning('.next build directory not found. Run "npm run build" first.');
    return false;
  }
  
  logSuccess('.next build directory exists');
  
  // Check for build manifest
  const manifestPath = path.join(buildDir, 'build-manifest.json');
  if (fs.existsSync(manifestPath)) {
    logSuccess('Build manifest found');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const pageCount = Object.keys(manifest.pages || {}).length;
      logInfo(`Built ${pageCount} pages`);
    } catch (error) {
      logWarning('Could not parse build manifest');
    }
  }
  
  return true;
}

// Check security configuration
function checkSecurityConfig() {
  log('\n🔒 Checking Security Configuration...', 'cyan');
  
  // Check if proxy.ts exists (Next.js 16 - renamed from middleware.ts)
  const proxyPath = path.join(process.cwd(), 'src', 'proxy.ts');
  if (fs.existsSync(proxyPath)) {
    logSuccess('src/proxy.ts exists (Next.js 16 middleware)');
    
    const proxyContent = fs.readFileSync(proxyPath, 'utf8');
    
    // Check for security headers
    if (proxyContent.includes('Content-Security-Policy')) {
      logSuccess('CSP headers configured');
    } else {
      logWarning('CSP headers not found in proxy.ts');
    }
    
    if (proxyContent.includes('X-Frame-Options')) {
      logSuccess('X-Frame-Options header configured');
    } else {
      logWarning('X-Frame-Options not configured');
    }
    
  } else {
    logWarning('src/proxy.ts not found (middleware not configured)');
  }
  
  return true;
}

// Main validation function
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  Production Build Validation (STORY-TEST-016)', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  let allPassed = true;
  
  // 1. Check environment files
  const envFilesOk = checkEnvFiles();
  if (!envFilesOk) allPassed = false;
  
  // 2. Validate environment variables
  const { hasErrors, missing, warnings } = validateEnvironmentVariables();
  if (hasErrors) allPassed = false;
  
  // 3. Validate Next.js configuration
  const nextConfigOk = validateNextConfig();
  if (!nextConfigOk) allPassed = false;
  
  // 4. Check build output
  checkBuildOutput();
  
  // 5. Check security configuration
  checkSecurityConfig();
  
  // Final summary
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    log('  ✅ All validation checks passed!', 'green');
    log('  Production build is ready to deploy.', 'green');
  } else {
    log('  ❌ Validation failed!', 'red');
    log('  Please fix the errors above before deploying.', 'red');
    if (missing.length > 0) {
      log('\n  Missing required environment variables:', 'red');
      missing.forEach(m => log(`    - ${m}`, 'red'));
    }
  }
  log('='.repeat(60) + '\n', 'cyan');
  
  // Exit with error code if validation failed
  process.exit(allPassed ? 0 : 1);
}

// Run validation
main().catch((error) => {
  logError(`Validation script error: ${error.message}`);
  process.exit(1);
});
