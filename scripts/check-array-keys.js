// Check for documents with missing keys in arrays
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

async function checkArrayKeys() {
  console.log('Checking all documents for array items missing _key...\n');
  
  // Check promotions
  const promotions = await client.fetch('*[_type == "promotion" && defined(categories)]{ _type, _id, title, categories }');
  console.log('Promotions with categories:', promotions.length);
  promotions.forEach(p => {
    const missingKeys = (p.categories || []).filter(c => !c._key);
    if (missingKeys.length > 0) {
      console.log(`  ❌ "${p.title}" - ${missingKeys.length} items missing _key`);
    }
  });
  
  // Check coupons
  const coupons = await client.fetch('*[_type == "coupon" && defined(categories)]{ _type, _id, code, categories }');
  console.log('\nCoupons with categories:', coupons.length);
  coupons.forEach(c => {
    const missingKeys = (c.categories || []).filter(cat => !cat._key);
    if (missingKeys.length > 0) {
      console.log(`  ❌ "${c.code}" - ${missingKeys.length} items missing _key`);
    }
  });
  
  // Check blog posts again (verbose)
  const posts = await client.fetch('*[_type == "post" && defined(categories)]{ _type, _id, title, categories }');
  console.log('\nBlog posts with categories:', posts.length);
  posts.forEach(p => {
    console.log(`  Post: "${p.title}"`);
    console.log(`    Categories:`, JSON.stringify(p.categories, null, 2));
  });
  
  // Check for DRAFT documents with missing keys
  console.log('\n========================================');
  console.log('Checking DRAFT documents...');
  console.log('========================================\n');
  
  const draftPosts = await client.fetch('*[_id match "drafts.*" && _type == "post"]{ _id, title, categories }');
  console.log('Draft blog posts:', draftPosts.length);
  draftPosts.forEach(p => {
    console.log(`  Draft: "${p.title || 'Untitled'}"`);
    if (p.categories) {
      const missingKeys = p.categories.filter(c => !c._key);
      if (missingKeys.length > 0) {
        console.log(`    ❌ ${missingKeys.length} categories missing _key`);
      } else {
        console.log(`    ✅ All ${p.categories.length} categories have keys`);
      }
    }
  });
  
  // Check all documents for any arrays missing keys
  console.log('\n========================================');
  console.log('Checking ALL document types for arrays...');
  console.log('========================================\n');
  
  const allDocs = await client.fetch(`*[defined(categories) || defined(tags) || defined(relatedPosts) || defined(teamMembers)] {
    _id,
    _type,
    "title": coalesce(title, name, code, "Untitled"),
    categories,
    tags,
    relatedPosts,
    teamMembers
  }`);
  
  console.log(`Found ${allDocs.length} documents with array fields`);
  
  allDocs.forEach(doc => {
    const issues = [];
    
    ['categories', 'tags', 'relatedPosts', 'teamMembers'].forEach(field => {
      if (doc[field] && Array.isArray(doc[field])) {
        const missing = doc[field].filter(item => typeof item === 'object' && !item._key);
        if (missing.length > 0) {
          issues.push(`${field}: ${missing.length} missing keys`);
        }
      }
    });
    
    if (issues.length > 0) {
      console.log(`\n❌ [${doc._type}] "${doc.title}"`);
      console.log(`   ID: ${doc._id}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
  
  console.log('\n✅ Check complete!');
}

checkArrayKeys().catch(console.error);
