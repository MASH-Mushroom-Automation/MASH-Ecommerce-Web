/**
 * FAQ Migration Script
 * Phase 2: Migrate FAQ content to Sanity CMS
 * 
 * Run: node scripts/migrate-faq-to-sanity.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false,
});

// FAQ Categories
const categories = [
  {
    _id: 'faq-category-ordering',
    _type: 'faqCategory',
    name: 'Ordering & Payment',
    slug: { _type: 'slug', current: 'ordering-payment' },
    description: 'Questions about placing orders, payment methods, and order management',
    icon: 'ShoppingCart',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: 'faq-category-shipping',
    _type: 'faqCategory',
    name: 'Shipping & Delivery',
    slug: { _type: 'slug', current: 'shipping-delivery' },
    description: 'Questions about delivery times, shipping options, and tracking',
    icon: 'Truck',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: 'faq-category-products',
    _type: 'faqCategory',
    name: 'Products & Quality',
    slug: { _type: 'slug', current: 'products-quality' },
    description: 'Questions about our mushroom products, freshness, and storage',
    icon: 'Leaf',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: 'faq-category-returns',
    _type: 'faqCategory',
    name: 'Returns & Refunds',
    slug: { _type: 'slug', current: 'returns-refunds' },
    description: 'Questions about our return policy and refund process',
    icon: 'Undo',
    displayOrder: 4,
    isActive: true,
  },
  {
    _id: 'faq-category-account',
    _type: 'faqCategory',
    name: 'Account & Support',
    slug: { _type: 'slug', current: 'account-support' },
    description: 'Questions about your account, login issues, and getting help',
    icon: 'User',
    displayOrder: 5,
    isActive: true,
  },
];

// FAQ Items
const faqItems = [
  // Ordering & Payment
  {
    _id: 'faq-ordering-1',
    _type: 'faqItem',
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including GCash, Maya, credit/debit cards (Visa, Mastercard), bank transfers, and Cash on Delivery (COD) for select areas within Metro Manila.',
    category: { _type: 'reference', _ref: 'faq-category-ordering' },
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    tags: ['payment', 'gcash', 'maya', 'cod'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-ordering-2',
    _type: 'faqItem',
    question: 'What is the minimum order amount?',
    answer: 'There is no minimum order amount for our regular products. However, for same-day delivery via Lalamove, a minimum order of ₱500 is required to qualify for the service.',
    category: { _type: 'reference', _ref: 'faq-category-ordering' },
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
    tags: ['minimum order', 'delivery'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-ordering-3',
    _type: 'faqItem',
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'You can modify or cancel your order within 30 minutes of placing it, provided it hasn\'t been processed yet. To make changes, go to your Order History in your account or contact our customer support immediately.',
    category: { _type: 'reference', _ref: 'faq-category-ordering' },
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    tags: ['cancel', 'modify', 'order'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-ordering-4',
    _type: 'faqItem',
    question: 'Do you offer bulk or wholesale pricing?',
    answer: 'Yes! We offer special pricing for bulk orders of 5kg or more. For wholesale inquiries, please contact us at wholesale@mashmarketplace.ph or call our business line. We provide customized quotes for restaurants, hotels, and retail partners.',
    category: { _type: 'reference', _ref: 'faq-category-ordering' },
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    tags: ['wholesale', 'bulk', 'business'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },

  // Shipping & Delivery
  {
    _id: 'faq-shipping-1',
    _type: 'faqItem',
    question: 'How long does delivery take?',
    answer: 'Standard delivery within Metro Manila takes 1-2 business days. For provincial areas, delivery takes 3-5 business days. Same-day delivery via Lalamove is available for orders placed before 2 PM within our serviceable areas.',
    category: { _type: 'reference', _ref: 'faq-category-shipping' },
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    tags: ['delivery time', 'same day', 'lalamove'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-shipping-2',
    _type: 'faqItem',
    question: 'How is same-day delivery handled?',
    answer: 'Same-day delivery is powered by Lalamove. Once your order is confirmed, a delivery partner will be assigned to pick up your order from our facility and deliver directly to your address. You\'ll receive real-time tracking updates and can contact the driver if needed.',
    category: { _type: 'reference', _ref: 'faq-category-shipping' },
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    tags: ['same day', 'lalamove', 'tracking'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-shipping-3',
    _type: 'faqItem',
    question: 'What areas do you deliver to?',
    answer: 'We deliver nationwide! Same-day delivery is available in Metro Manila, Bulacan, Cavite, Laguna, and Rizal. Standard shipping is available to all provinces via our logistics partners.',
    category: { _type: 'reference', _ref: 'faq-category-shipping' },
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    tags: ['delivery areas', 'metro manila', 'provincial'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-shipping-4',
    _type: 'faqItem',
    question: 'How are the mushrooms packaged for delivery?',
    answer: 'Our mushrooms are carefully packed in insulated packaging with ice packs to maintain freshness. Each package is sealed to prevent moisture loss and bruising. For delicate varieties like Enoki, we use special cushioning materials.',
    category: { _type: 'reference', _ref: 'faq-category-shipping' },
    displayOrder: 4,
    isActive: true,
    isFeatured: false,
    tags: ['packaging', 'freshness', 'cold chain'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },

  // Products & Quality
  {
    _id: 'faq-products-1',
    _type: 'faqItem',
    question: 'How fresh are your mushrooms?',
    answer: 'All our mushrooms are harvested within 24-48 hours of delivery. We work directly with local growers to ensure peak freshness. Each product shows the expected shelf life and proper storage instructions.',
    category: { _type: 'reference', _ref: 'faq-category-products' },
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    tags: ['freshness', 'harvest', 'quality'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-products-2',
    _type: 'faqItem',
    question: 'How should I store fresh mushrooms?',
    answer: 'Store fresh mushrooms in a paper bag or breathable container in your refrigerator. Avoid plastic bags as they trap moisture and accelerate spoilage. Most fresh mushrooms last 5-7 days when stored properly. Dried mushrooms should be kept in an airtight container in a cool, dry place.',
    category: { _type: 'reference', _ref: 'faq-category-products' },
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
    tags: ['storage', 'refrigerator', 'shelf life'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-products-3',
    _type: 'faqItem',
    question: 'Are your mushrooms organic?',
    answer: 'Many of our growers practice organic farming methods, and some products are certified organic. Look for the "Certified Organic" badge on product listings. We also carry conventionally grown mushrooms at lower price points.',
    category: { _type: 'reference', _ref: 'faq-category-products' },
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    tags: ['organic', 'certified', 'natural'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-products-4',
    _type: 'faqItem',
    question: 'What types of mushrooms do you sell?',
    answer: 'We offer a wide variety including Oyster (Gray, Pink, Yellow), Shiitake, King Oyster, Enoki, Lion\'s Mane, Reishi, and seasonal specialties. We also carry dried mushrooms, grow-at-home kits, and specialty bundles.',
    category: { _type: 'reference', _ref: 'faq-category-products' },
    displayOrder: 4,
    isActive: true,
    isFeatured: false,
    tags: ['varieties', 'oyster', 'shiitake', 'medicinal'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },

  // Returns & Refunds
  {
    _id: 'faq-returns-1',
    _type: 'faqItem',
    question: 'What is your return policy?',
    answer: 'Due to the perishable nature of our products, we don\'t accept returns for quality issues reported after 24 hours of delivery. However, if your order arrives damaged or spoiled, please contact us immediately with photos and we\'ll arrange a replacement or full refund.',
    category: { _type: 'reference', _ref: 'faq-category-returns' },
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    tags: ['return policy', 'damaged', 'spoiled'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-returns-2',
    _type: 'faqItem',
    question: 'How do I report a problem with my order?',
    answer: 'Go to your Order History, select the order, and click "Report Issue". Upload photos of the problem and describe the issue. Our team will respond within 2 hours during business hours. You can also contact us via chat or call our support hotline.',
    category: { _type: 'reference', _ref: 'faq-category-returns' },
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
    tags: ['report', 'issue', 'support'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-returns-3',
    _type: 'faqItem',
    question: 'How long do refunds take?',
    answer: 'Once approved, refunds are processed within 3-5 business days. GCash and Maya refunds appear instantly after processing. Credit card refunds may take 7-14 days to reflect on your statement depending on your bank.',
    category: { _type: 'reference', _ref: 'faq-category-returns' },
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    tags: ['refund', 'processing time', 'gcash'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },

  // Account & Support
  {
    _id: 'faq-account-1',
    _type: 'faqItem',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" at the top of the page, enter your email address, and we\'ll send you a 6-digit verification code. Enter the code to complete registration. You can also sign up with your Google or Facebook account.',
    category: { _type: 'reference', _ref: 'faq-category-account' },
    displayOrder: 1,
    isActive: true,
    isFeatured: false,
    tags: ['signup', 'registration', 'account'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-account-2',
    _type: 'faqItem',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click "Login", then "Forgot Password". Enter your email address and we\'ll send you a password reset link. The link expires in 1 hour for security. If you don\'t see the email, check your spam folder.',
    category: { _type: 'reference', _ref: 'faq-category-account' },
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
    tags: ['password', 'reset', 'forgot'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-account-3',
    _type: 'faqItem',
    question: 'How can I contact customer support?',
    answer: 'You can reach us through: (1) Live Chat on our website (fastest, available 8AM-10PM), (2) Email at support@mashmarketplace.ph (response within 24 hours), (3) Phone at +63 2 8XXX XXXX (Mon-Sat 9AM-6PM), or (4) Facebook Messenger @MASHMarketplace.',
    category: { _type: 'reference', _ref: 'faq-category-account' },
    displayOrder: 3,
    isActive: true,
    isFeatured: true,
    tags: ['contact', 'support', 'help', 'chat'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    _id: 'faq-account-4',
    _type: 'faqItem',
    question: 'Can I track my order?',
    answer: 'Yes! Go to "My Orders" in your account to see real-time status updates. For same-day Lalamove deliveries, you\'ll get a tracking link via SMS/email with live driver location. Standard deliveries include courier tracking numbers.',
    category: { _type: 'reference', _ref: 'faq-category-account' },
    displayOrder: 4,
    isActive: true,
    isFeatured: false,
    tags: ['tracking', 'order status', 'delivery'],
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
];

async function migrateFAQs() {
  console.log('🚀 Starting FAQ Migration to Sanity CMS...\n');
  console.log(`📦 Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`📊 Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}\n`);

  try {
    // Step 1: Create FAQ Categories
    console.log('📁 Creating FAQ Categories...');
    for (const category of categories) {
      try {
        const result = await client.createOrReplace(category);
        console.log(`   ✅ Created category: ${category.name}`);
      } catch (error) {
        console.error(`   ❌ Error creating category ${category.name}:`, error.message);
      }
    }
    console.log(`   📊 Created ${categories.length} categories\n`);

    // Step 2: Create FAQ Items
    console.log('❓ Creating FAQ Items...');
    for (const item of faqItems) {
      try {
        const result = await client.createOrReplace(item);
        console.log(`   ✅ Created FAQ: ${item.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`   ❌ Error creating FAQ "${item.question.substring(0, 30)}...":`, error.message);
      }
    }
    console.log(`   📊 Created ${faqItems.length} FAQ items\n`);

    // Summary
    console.log('✅ FAQ Migration Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 Categories: ${categories.length}`);
    console.log(`❓ FAQ Items: ${faqItems.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 View in Sanity Studio: http://localhost:3333');
    console.log('📄 View on FAQ page: http://localhost:3001/faq\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateFAQs();
