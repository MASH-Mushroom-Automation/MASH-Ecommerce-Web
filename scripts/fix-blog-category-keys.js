#!/usr/bin/env node

/**
 * Fix Blog Category Keys Script
 * 
 * This script adds missing `_key` properties to category references in blog posts.
 * Sanity requires array items to have unique `_key` properties for editing.
 * 
 * Error fixed: "Missing keys - Some items in the list are missing their keys"
 * 
 * Run: node scripts/fix-blog-category-keys.js
 */

import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../studio/.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SANITY_PROJECT_ID:', projectId ? '✅' : '❌');
  console.error('   SANITY_API_WRITE_TOKEN:', token ? '✅' : '❌');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function fixBlogCategoryKeys() {
  console.log('🔧 Fixing Blog Category Keys');
  console.log('========================================');
  console.log(`📦 Project: ${projectId}`);
  console.log(`📊 Dataset: ${dataset}`);
  console.log('');

  try {
    // Fetch all blog posts with categories
    const posts = await client.fetch(`
      *[_type == "post" && defined(categories)] {
        _id,
        title,
        categories
      }
    `);

    console.log(`📝 Found ${posts.length} blog posts with categories`);
    console.log('');

    let fixedCount = 0;
    let alreadyFixedCount = 0;

    for (const post of posts) {
      const categories = post.categories || [];
      let needsFix = false;
      
      // Check if any category is missing _key
      const fixedCategories = categories.map((cat, index) => {
        if (!cat._key) {
          needsFix = true;
          return {
            ...cat,
            _key: uuidv4().slice(0, 8), // Generate short unique key
          };
        }
        return cat;
      });

      if (needsFix) {
        console.log(`🔧 Fixing: "${post.title}"`);
        console.log(`   Categories: ${categories.length} items`);
        
        await client
          .patch(post._id)
          .set({ categories: fixedCategories })
          .commit();
        
        console.log(`   ✅ Fixed with keys: ${fixedCategories.map(c => c._key).join(', ')}`);
        fixedCount++;
      } else {
        console.log(`✅ Already OK: "${post.title}"`);
        alreadyFixedCount++;
      }
    }

    console.log('');
    console.log('========================================');
    console.log('📊 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} posts`);
    console.log(`   ✅ Already OK: ${alreadyFixedCount} posts`);
    console.log('');
    console.log('🎉 Blog category keys fix complete!');

  } catch (error) {
    console.error('❌ Error fixing blog category keys:', error.message);
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Also fix related posts and tags if they have the same issue
async function fixAllArrayKeys() {
  console.log('');
  console.log('🔧 Checking Related Posts Keys...');
  console.log('========================================');

  try {
    const postsWithRelated = await client.fetch(`
      *[_type == "post" && defined(relatedPosts)] {
        _id,
        title,
        relatedPosts
      }
    `);

    let fixedCount = 0;

    for (const post of postsWithRelated) {
      const relatedPosts = post.relatedPosts || [];
      let needsFix = false;
      
      const fixedRelated = relatedPosts.map((rel) => {
        if (!rel._key) {
          needsFix = true;
          return {
            ...rel,
            _key: uuidv4().slice(0, 8),
          };
        }
        return rel;
      });

      if (needsFix) {
        console.log(`🔧 Fixing related posts: "${post.title}"`);
        
        await client
          .patch(post._id)
          .set({ relatedPosts: fixedRelated })
          .commit();
        
        fixedCount++;
      }
    }

    console.log(`✅ Fixed ${fixedCount} posts with missing relatedPosts keys`);

  } catch (error) {
    console.error('⚠️ Error fixing related posts:', error.message);
  }
}

// Run the fixes
async function main() {
  await fixBlogCategoryKeys();
  await fixAllArrayKeys();
}

main().catch(console.error);
