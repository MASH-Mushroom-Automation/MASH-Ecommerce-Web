/**
 * Check if Settings document exists in Sanity
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkSettings() {
  console.log('🔍 Checking Settings document...\n');
  
  try {
    // Check for published settings
    const settings = await client.fetch('*[_type == "settings"]');
    
    console.log(`Found ${settings.length} settings documents:\n`);
    
    if (settings.length === 0) {
      console.log('❌ NO SETTINGS DOCUMENT FOUND!');
      console.log('\n📝 Action Required:');
      console.log('1. Open http://localhost:3333');
      console.log('2. Click "Settings" in left sidebar');
      console.log('3. Fill in Title and Description');
      console.log('4. Click "PUBLISH" button (top right) ← CRITICAL STEP!');
      console.log('\nNote: Just saving is NOT enough - you MUST click Publish!\n');
      process.exit(1);
    }
    
    settings.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`);
      console.log(`  _id: ${doc._id}`);
      console.log(`  Title: ${doc.title || '(empty)'}`);
      console.log(`  Description: ${doc.description || '(empty)'}`);
      console.log(`  Status: ${doc._id.startsWith('drafts.') ? '⚠️  DRAFT (not published!)' : '✅ Published'}`);
      console.log('');
    });
    
    // Check if there's a draft version
    const hasDraft = settings.some(s => s._id.startsWith('drafts.'));
    const hasPublished = settings.some(s => !s._id.startsWith('drafts.'));
    
    if (hasDraft && !hasPublished) {
      console.log('⚠️  WARNING: Settings document exists but is NOT PUBLISHED!');
      console.log('\n📝 Action Required:');
      console.log('1. Open http://localhost:3333');
      console.log('2. Click "Settings" in left sidebar');
      console.log('3. Click "PUBLISH" button (top right) ← DO THIS NOW!');
      console.log('\nYour website will NOT work until you publish!\n');
      process.exit(1);
    }
    
    if (hasPublished) {
      console.log('✅ Settings document is published and ready!');
      console.log('\nYour website should work now. Refresh http://localhost:3000\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSettings();
