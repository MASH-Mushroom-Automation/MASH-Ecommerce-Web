/**
 * Check FAQs in Sanity
 * Run: node scripts/check-faqs.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkFAQs() {
  console.log('📊 Checking FAQs in Sanity CMS...\n');

  // Check categories
  const categories = await client.fetch(`*[_type == "faqCategory"] | order(displayOrder asc) {
    _id, name, displayOrder, isActive
  }`);
  
  console.log('📁 FAQ Categories:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  categories.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.name} (Order: ${cat.displayOrder}, Active: ${cat.isActive ? '✅' : '❌'})`);
  });
  console.log(`\n📊 Total Categories: ${categories.length}\n`);

  // Check FAQ items
  const faqItems = await client.fetch(`*[_type == "faqItem"] | order(displayOrder asc) {
    _id,
    question,
    "categoryName": category->name,
    displayOrder,
    isActive,
    isFeatured
  }`);

  console.log('❓ FAQ Items:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  faqItems.forEach((faq, i) => {
    const badges = [];
    if (faq.isFeatured) badges.push('⭐');
    if (!faq.isActive) badges.push('❌');
    console.log(`${i + 1}. [${faq.categoryName}] ${faq.question.substring(0, 50)}... ${badges.join(' ')}`);
  });
  console.log(`\n📊 Total FAQ Items: ${faqItems.length}`);

  // Check grouped data (as used by the hook)
  console.log('\n\n📋 Grouped FAQs (as displayed on website):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const groupedFAQs = await client.fetch(`
    *[_type == "faqCategory" && isActive == true] | order(displayOrder asc) {
      _id,
      name,
      displayOrder,
      "questions": *[_type == "faqItem" && isActive == true && references(^._id)] | order(displayOrder asc) {
        _id,
        question,
        answer
      }
    }
  `);

  groupedFAQs.forEach(category => {
    console.log(`\n📁 ${category.name} (${category.questions?.length || 0} questions)`);
    (category.questions || []).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.question.substring(0, 60)}...`);
    });
  });

  console.log('\n\n✅ FAQ check complete!');
  console.log('🔗 View FAQ page: http://localhost:3001/faq');
}

checkFAQs().catch(console.error);
