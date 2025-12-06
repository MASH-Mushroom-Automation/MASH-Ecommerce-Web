/**
 * Feature Section Migration Script
 * Phase 4: Migrate feature sections from JSON to Sanity CMS
 * 
 * Run: node scripts/migrate-features-to-sanity.js
 */

import { createClient } from '@sanity/client';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Feature sections to migrate
const featureSections = [
  {
    _type: 'featureSection',
    title: 'Why Choose MASH Mushrooms?',
    slug: { current: 'why-choose-mash-mushrooms', _type: 'slug' },
    subtitle: 'Quality, Freshness, and Sustainability',
    features: [
      {
        _key: 'feature-1',
        icon: 'Leaf',
        headline: '100% Organic',
        subheadline: 'Grown without pesticides or chemicals. Our mushrooms are cultivated using natural methods.',
        isActive: true,
        displayOrder: 1,
      },
      {
        _key: 'feature-2',
        icon: 'Truck',
        headline: 'Fresh Delivery',
        subheadline: 'Delivered within 24 hours of harvest. Same-day delivery available in Metro Manila.',
        isActive: true,
        displayOrder: 2,
      },
      {
        _key: 'feature-3',
        icon: 'Sprout',
        headline: 'Sustainable Farming',
        subheadline: 'Eco-friendly cultivation methods. We use recycled substrates and minimal water.',
        isActive: true,
        displayOrder: 3,
      },
      {
        _key: 'feature-4',
        icon: 'Shield',
        headline: 'Quality Guaranteed',
        subheadline: '100% satisfaction or money back. Every mushroom meets our strict quality standards.',
        isActive: true,
        displayOrder: 4,
      },
    ],
    backgroundColor: 'light',
    columns: 4,
    showOnHomepage: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    _type: 'featureSection',
    title: 'Our Commitment to You',
    slug: { current: 'our-commitment', _type: 'slug' },
    subtitle: 'Supporting local farmers while bringing you the freshest produce',
    features: [
      {
        _key: 'commitment-1',
        icon: 'Users',
        headline: 'Supporting Local Growers',
        subheadline: 'We partner with small-scale Filipino farmers to bring you the freshest mushrooms.',
        isActive: true,
        displayOrder: 1,
      },
      {
        _key: 'commitment-2',
        icon: 'Award',
        headline: 'Premium Quality',
        subheadline: 'Hand-picked and inspected to ensure only the best mushrooms reach your table.',
        isActive: true,
        displayOrder: 2,
      },
      {
        _key: 'commitment-3',
        icon: 'MessageCircle',
        headline: 'Expert Support',
        subheadline: 'Our team is always ready to help with cooking tips and storage advice.',
        isActive: true,
        displayOrder: 3,
      },
    ],
    backgroundColor: 'muted',
    columns: 3,
    showOnHomepage: false, // Available for About page
    displayOrder: 2,
    isActive: true,
  },
];

async function migrateFeatures() {
  console.log('🚀 Starting Feature Section Migration to Sanity...\n');

  // Check for existing feature sections
  const existing = await client.fetch('*[_type == "featureSection"]{ _id, title }');
  console.log(`📊 Found ${existing.length} existing feature section(s) in Sanity\n`);

  if (existing.length > 0) {
    console.log('Existing feature sections:');
    existing.forEach((section) => {
      console.log(`  - ${section.title} (${section._id})`);
    });
    console.log('\n⚠️  To avoid duplicates, existing sections will be skipped.\n');
  }

  const existingTitles = existing.map((s) => s.title);

  let created = 0;
  let skipped = 0;

  for (const section of featureSections) {
    // Skip if already exists
    if (existingTitles.includes(section.title)) {
      console.log(`⏭️  Skipping "${section.title}" (already exists)`);
      skipped++;
      continue;
    }

    try {
      const result = await client.create(section);
      console.log(`✅ Created: "${section.title}" (ID: ${result._id})`);
      console.log(`   - ${section.features.length} features`);
      console.log(`   - Show on Homepage: ${section.showOnHomepage ? 'Yes' : 'No'}`);
      console.log(`   - Columns: ${section.columns}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating "${section.title}":`, error.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📝 Total Features: ${featureSections.reduce((acc, s) => acc + s.features.length, 0)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify migration
  console.log('🔍 Verifying migration...');
  const final = await client.fetch('*[_type == "featureSection"]{ _id, title, "featuresCount": count(features) }');
  console.log(`\n📦 Feature Sections in Sanity: ${final.length}`);
  final.forEach((section) => {
    console.log(`   - ${section.title}: ${section.featuresCount} features`);
  });

  console.log('\n✨ Migration complete!');
  console.log('📝 Next Steps:');
  console.log('   1. Open Sanity Studio: cd studio && npm run dev');
  console.log('   2. Navigate to "Feature Section" in the sidebar');
  console.log('   3. Edit sections and add custom icons/content');
  console.log('   4. The homepage will automatically show the updated content\n');
}

// Run migration
migrateFeatures().catch(console.error);
