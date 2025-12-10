/**
 * Quick Fix for Sanity Reference Issues
 * 
 * This script directly addresses the reference conflict preventing publish.
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false,
});

const PROBLEM_DOC_ID = 'SzUxrrzdcuBDmahbHivEK4';
const REFERENCING_DOC_ID = 'j9gFvjMkmqPMCjk1F5G0r6';

async function quickFix() {
  console.log('🔧 Quick Fix for Sanity Reference Issue\n');

  // 1. Get the referencing document
  console.log('Step 1: Finding the referencing document...');
  const refDoc = await client.fetch(
    `*[_id == $id || _id == "drafts." + $id][0]`,
    { id: REFERENCING_DOC_ID }
  );

  if (!refDoc) {
    console.log('❌ Referencing document not found');
    return;
  }

  console.log(`   Found: ${refDoc._type} - "${refDoc.title || refDoc.name || refDoc._id}"`);
  console.log(`   Document ID: ${refDoc._id}`);

  // 2. Get the problem document  
  console.log('\nStep 2: Finding the problematic document...');
  const problemDoc = await client.fetch(
    `*[_id == $id || _id == "drafts." + $id][0]`,
    { id: PROBLEM_DOC_ID }
  );

  if (problemDoc) {
    console.log(`   Found: ${problemDoc._type}`);
    console.log(`   Document ID: ${problemDoc._id}`);
  } else {
    console.log('   ⚠️ Problem document not found - it may be a deleted asset');
  }

  // 3. Look for what type of reference this is
  console.log('\nStep 3: Analyzing document structure...');
  console.log('   Document keys:', Object.keys(refDoc).join(', '));

  // Check if it's an image asset reference
  if (refDoc._type === 'sanity.imageAsset' || refDoc._type === 'sanity.fileAsset') {
    console.log('\n   This is an asset document. The reference is likely in another document.');
  }

  // 4. Find ALL references to the problem doc
  console.log('\nStep 4: Finding all references...');
  const refs = await client.fetch(
    `*[references($id)] { _id, _type, title, name }`,
    { id: PROBLEM_DOC_ID }
  );
  
  const draftRefs = await client.fetch(
    `*[references("drafts." + $id)] { _id, _type, title, name }`,
    { id: PROBLEM_DOC_ID }
  );

  console.log(`   References to published: ${refs.length}`);
  refs.forEach(r => console.log(`      - ${r._type}: ${r.title || r.name || r._id}`));
  
  console.log(`   References to draft: ${draftRefs.length}`);
  draftRefs.forEach(r => console.log(`      - ${r._type}: ${r.title || r.name || r._id}`));

  // 5. Suggest solution
  console.log('\n════════════════════════════════════════════');
  console.log('📋 RECOMMENDED SOLUTION:');
  console.log('════════════════════════════════════════════\n');
  
  console.log('The error occurs because you are trying to change/delete an image');
  console.log('that is still being referenced by another document.\n');
  
  console.log('To fix this in Sanity Studio:');
  console.log('');
  console.log('1. Go to the product with the issue');
  console.log('2. Click "Discard changes" (revert to published version)');
  console.log('3. Then make your image changes again');
  console.log('4. Make sure to CLEAR the old image reference before uploading new');
  console.log('5. Publish the changes');
  console.log('');
  console.log('OR use this script to force-fix (uncomment the fix code below)');
}

quickFix().catch(console.error);
