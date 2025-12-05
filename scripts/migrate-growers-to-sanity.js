/**
 * Sanity CMS - Growers Data Migration Script
 * 
 * This script migrates the hardcoded MOCK_GROWERS from src/lib/api/main.ts
 * into Sanity CMS as grower documents.
 * 
 * Run this script ONCE after deploying the grower schema:
 * 
 * ```bash
 * cd studio
 * npm run dev  # Start Sanity Studio first to deploy schema
 * 
 * # Then run migration:
 * cd ..
 * node scripts/migrate-growers-to-sanity.js
 * ```
 * 
 * Phase 1 of SANITY_CMS_MASTER_PLAN.md
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Growers data to migrate (from MOCK_GROWERS in main.ts)
const GROWERS_DATA = [
  {
    _type: 'grower',
    name: 'Fungi Fresh Farms',
    slug: { _type: 'slug', current: 'fungi-fresh-farms' },
    tagline: 'Urban-grown gourmet mushrooms for the modern kitchen.',
    description: 'Located in the heart of Caloocan City, Fungi Fresh Farms specializes in urban mushroom cultivation using sustainable methods. Our climate-controlled facilities produce the freshest oyster and shiitake mushrooms year-round.',
    location: 'Caloocan City, Metro Manila',
    address: 'Caloocan City, Metro Manila, Philippines',
    phone: '+63 956 955 2808',
    operatingHours: '7AM to 9PM, MON-FRI',
    coordinates: { lat: 14.7583, lng: 121.0453 },
    specialties: ['oyster', 'shiitake', 'king-trumpet'],
    certifications: ['fda', 'gap'],
    isFeatured: true,
    isActive: true,
    isVerified: true,
    sortOrder: 1,
    joinedDate: '2023-01-15',
  },
  {
    _type: 'grower',
    name: 'The Mushroom Patch Bukidnon',
    slug: { _type: 'slug', current: 'mushroom-patch-bukidnon' },
    tagline: 'From the cool highlands of Bukidnon, delivered to your door.',
    description: 'Nestled in the cool highlands of Lantapan, Bukidnon, The Mushroom Patch takes advantage of the perfect climate for growing premium quality mushrooms. Our farm-to-table approach ensures maximum freshness.',
    location: 'Lantapan, Bukidnon',
    address: 'Lantapan, Bukidnon, Mindanao, Philippines',
    phone: '+63 922 524 1234',
    operatingHours: '7AM to 9PM, MON-FRI',
    coordinates: { lat: 8.0811, lng: 125.0119 },
    specialties: ['shiitake', 'lions-mane', 'maitake'],
    certifications: ['organic', 'gap'],
    isFeatured: true,
    isActive: true,
    isVerified: true,
    sortOrder: 2,
    joinedDate: '2023-03-20',
  },
  {
    _type: 'grower',
    name: 'Kabutehan ni Aling Nena',
    slug: { _type: 'slug', current: 'kabutehan-ni-aling-nena' },
    tagline: "Traditional mushroom growing with a mother's touch.",
    description: 'A family-owned mushroom farm in Antipolo, Rizal. Aling Nena has been growing mushrooms for over 20 years, passing down traditional cultivation methods to the next generation while embracing modern food safety standards.',
    location: 'Antipolo, Rizal',
    address: 'Antipolo City, Rizal, Philippines',
    phone: '+63 966 552 3612',
    operatingHours: '7AM to 9PM, MON-FRI',
    coordinates: { lat: 14.5864, lng: 121.1754 },
    specialties: ['oyster', 'white-button', 'portobello'],
    certifications: ['fda'],
    isFeatured: true,
    isActive: true,
    isVerified: false,
    sortOrder: 3,
    joinedDate: '2022-11-08',
  },
  {
    _type: 'grower',
    name: 'Shroomarket',
    slug: { _type: 'slug', current: 'shroomarket' },
    tagline: 'Premium mushrooms from the heart of Manila.',
    description: 'Shroomarket is a modern mushroom supplier based in Malate, Manila. We source from multiple certified farms to bring you the widest variety of fresh and dried mushrooms in the metro.',
    location: 'Malate, Manila',
    address: 'Malate, Manila, Philippines',
    phone: '+63 917 252 7378',
    operatingHours: '7AM to 9PM, MON-FRI',
    coordinates: { lat: 14.5699, lng: 120.9929 },
    specialties: ['oyster', 'shiitake', 'enoki', 'king-trumpet'],
    certifications: ['fda', 'haccp'],
    isFeatured: false,
    isActive: true,
    isVerified: true,
    sortOrder: 4,
    joinedDate: '2024-02-01',
  },
];

async function migrateGrowers() {
  console.log('\n🍄 MASH Growers Migration Script');
  console.log('================================\n');

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Error: SANITY_API_WRITE_TOKEN is not set in .env.local');
    console.log('   Please add your Sanity write token to .env.local');
    process.exit(1);
  }

  console.log(`📦 Project ID: ${client.config().projectId}`);
  console.log(`📦 Dataset: ${client.config().dataset}`);
  console.log(`📦 Growers to migrate: ${GROWERS_DATA.length}\n`);

  // Check for existing growers
  const existingGrowers = await client.fetch(`*[_type == "grower"] { name, slug }`);
  console.log(`📋 Existing growers in Sanity: ${existingGrowers.length}\n`);

  if (existingGrowers.length > 0) {
    console.log('⚠️  Warning: Growers already exist in Sanity:');
    existingGrowers.forEach((g) => console.log(`   - ${g.name}`));
    console.log('\n   This script will skip existing growers (matched by slug).\n');
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const grower of GROWERS_DATA) {
    const existingSlug = existingGrowers.find(
      (g) => g.slug?.current === grower.slug.current
    );

    if (existingSlug) {
      console.log(`⏭️  Skipping "${grower.name}" (already exists)`);
      skipped++;
      continue;
    }

    try {
      console.log(`📝 Creating "${grower.name}"...`);
      await client.create(grower);
      console.log(`   ✅ Created successfully!`);
      created++;
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errors++;
    }
  }

  console.log('\n================================');
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('================================\n');

  if (created > 0) {
    console.log('🎉 Migration complete!');
    console.log('   Open Sanity Studio to view the growers:');
    console.log('   http://localhost:3333\n');
  }
}

// Run migration
migrateGrowers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
