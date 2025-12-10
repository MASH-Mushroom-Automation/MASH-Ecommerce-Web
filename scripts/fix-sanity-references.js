/**
 * Fix Sanity Reference Issues
 * 
 * This script helps identify and fix document reference conflicts
 * that prevent publishing changes in Sanity.
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

// The problematic document IDs from the error
const PROBLEM_DOC_ID = 'SzUxrrzdcuBDmahbHivEK4';
const REFERENCING_DOC_ID = 'j9gFvjMkmqPMCjk1F5G0r6';

async function investigateReferences() {
  console.log('🔍 Investigating Sanity reference issues...\n');

  try {
    // 1. Find the problematic document
    console.log(`📄 Looking for document: ${PROBLEM_DOC_ID}`);
    const problemDoc = await client.fetch(
      `*[_id == $id || _id == "drafts." + $id][0]`,
      { id: PROBLEM_DOC_ID }
    );
    
    if (problemDoc) {
      console.log(`   Type: ${problemDoc._type}`);
      console.log(`   Title/Name: ${problemDoc.title || problemDoc.name || 'N/A'}`);
      console.log(`   ID: ${problemDoc._id}`);
    } else {
      console.log('   ⚠️ Document not found (may have been deleted)');
    }

    // 2. Find the referencing document
    console.log(`\n📄 Looking for referencing document: ${REFERENCING_DOC_ID}`);
    const referencingDoc = await client.fetch(
      `*[_id == $id || _id == "drafts." + $id][0]`,
      { id: REFERENCING_DOC_ID }
    );
    
    if (referencingDoc) {
      console.log(`   Type: ${referencingDoc._type}`);
      console.log(`   Title/Name: ${referencingDoc.title || referencingDoc.name || 'N/A'}`);
      console.log(`   ID: ${referencingDoc._id}`);
    } else {
      console.log('   ⚠️ Document not found');
    }

    // 3. Find ALL documents that reference the problematic document
    console.log(`\n🔗 Finding all documents that reference ${PROBLEM_DOC_ID}...`);
    const allReferences = await client.fetch(
      `*[references($id) || references("drafts." + $id)] {
        _id,
        _type,
        title,
        name
      }`,
      { id: PROBLEM_DOC_ID }
    );

    if (allReferences.length > 0) {
      console.log(`   Found ${allReferences.length} document(s) with references:`);
      allReferences.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc._type}: ${doc.title || doc.name || doc._id}`);
      });
    } else {
      console.log('   No references found');
    }

    // 4. Check for orphaned drafts
    console.log('\n🔍 Checking for orphaned draft documents...');
    const orphanedDrafts = await client.fetch(
      `*[_id in path("drafts.**")] {
        _id,
        _type,
        title,
        name
      }[0...20]`
    );
    
    console.log(`   Found ${orphanedDrafts.length} draft documents (showing first 20)`);

    return { problemDoc, referencingDoc, allReferences, orphanedDrafts };
  } catch (error) {
    console.error('❌ Error investigating references:', error.message);
    throw error;
  }
}

async function fixReferences() {
  console.log('\n🔧 Attempting to fix reference issues...\n');

  try {
    // Option 1: Publish the draft that's being referenced
    console.log('Option 1: Publishing the draft document...');
    
    const draftId = `drafts.${PROBLEM_DOC_ID}`;
    const draft = await client.fetch(`*[_id == $id][0]`, { id: draftId });
    
    if (draft) {
      // Create a transaction to publish
      const publishedId = PROBLEM_DOC_ID;
      
      await client
        .transaction()
        .createOrReplace({
          ...draft,
          _id: publishedId,
        })
        .delete(draftId)
        .commit();
      
      console.log('✅ Successfully published the draft document!');
      return true;
    }

    // Option 2: Remove the reference from the referencing document
    console.log('\nOption 2: Checking referencing document for stale references...');
    
    const refDoc = await client.fetch(
      `*[_id == $id || _id == "drafts." + $id][0]`,
      { id: REFERENCING_DOC_ID }
    );

    if (refDoc) {
      console.log(`   Found: ${refDoc._type} - ${refDoc.title || refDoc.name}`);
      
      // Check if it's a product with image references
      if (refDoc._type === 'product') {
        console.log('   This is a product document. Checking image references...');
        
        // Check main image
        if (refDoc.image?.asset?._ref?.includes(PROBLEM_DOC_ID)) {
          console.log('   ⚠️ Main image references the problematic document');
        }
        
        // Check additional images
        if (refDoc.images) {
          refDoc.images.forEach((img, i) => {
            if (img?.asset?._ref?.includes(PROBLEM_DOC_ID)) {
              console.log(`   ⚠️ Image ${i + 1} references the problematic document`);
            }
          });
        }
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error fixing references:', error.message);
    return false;
  }
}

async function cleanupOrphanedAssets() {
  console.log('\n🧹 Cleaning up orphaned assets...\n');

  try {
    // Find unused assets
    const unusedAssets = await client.fetch(`
      *[_type in ["sanity.imageAsset", "sanity.fileAsset"]] {
        _id,
        _type,
        originalFilename,
        "isReferenced": count(*[references(^._id)]) > 0
      }[!isReferenced][0...10]
    `);

    console.log(`Found ${unusedAssets.length} unreferenced assets (showing first 10)`);
    
    if (unusedAssets.length > 0) {
      console.log('\nUnreferenced assets:');
      unusedAssets.forEach((asset, i) => {
        console.log(`   ${i + 1}. ${asset.originalFilename || asset._id}`);
      });
      
      console.log('\n⚠️ To delete these, uncomment the deletion code below and run again.');
      
      // Uncomment to delete orphaned assets:
      // for (const asset of unusedAssets) {
      //   await client.delete(asset._id);
      //   console.log(`   Deleted: ${asset._id}`);
      // }
    }
  } catch (error) {
    console.error('❌ Error cleaning up assets:', error.message);
  }
}

async function discardDraft() {
  console.log('\n🗑️ Discarding problematic draft...\n');

  try {
    const draftId = `drafts.${PROBLEM_DOC_ID}`;
    
    // First check if the published version exists
    const publishedDoc = await client.fetch(`*[_id == $id][0]`, { id: PROBLEM_DOC_ID });
    
    if (publishedDoc) {
      console.log('✅ Published version exists. Safe to discard draft.');
      
      // Delete just the draft
      await client.delete(draftId);
      console.log('✅ Draft discarded successfully!');
    } else {
      console.log('⚠️ No published version exists. Discarding would delete the document entirely.');
      console.log('   Skipping to prevent data loss.');
    }
  } catch (error) {
    console.error('❌ Error discarding draft:', error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           Sanity Reference Conflict Resolver');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Investigate
  await investigateReferences();

  // Step 2: Try to fix
  const fixed = await fixReferences();

  if (!fixed) {
    // Step 3: Cleanup orphaned assets
    await cleanupOrphanedAssets();
    
    // Step 4: Option to discard draft
    // await discardDraft();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                       Done!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📝 If the issue persists, try these manual steps in Sanity Studio:');
  console.log('   1. Go to the product that has the issue');
  console.log('   2. Remove the image and save');
  console.log('   3. Re-upload a new image');
  console.log('   4. Publish the changes');
  console.log('\n   Or use "Discard changes" to revert to the last published version.');
}

main().catch(console.error);
