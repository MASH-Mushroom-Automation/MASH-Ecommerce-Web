/**
 * Migrate availableAtStores to suppliesTo
 * 
 * This script migrates grower data from the legacy 'availableAtStores' field
 * to the canonical 'suppliesTo' field, then clears the legacy field.
 * 
 * Run: node scripts/migrate-grower-stores.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load from .env.local explicitly
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function migrateGrowerStores() {
  console.log('🔄 Starting grower store migration...\n');

  // Fetch all growers that have availableAtStores but not suppliesTo
  const growers = await client.fetch(`
    *[_type == "grower" && defined(availableAtStores) && count(availableAtStores) > 0] {
      _id,
      name,
      availableAtStores,
      suppliesTo
    }
  `);

  console.log(`📦 Found ${growers.length} growers with availableAtStores data\n`);

  if (growers.length === 0) {
    console.log('✅ No growers need migration');
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;

  for (const grower of growers) {
    console.log(`\n📋 Processing: ${grower.name} (${grower._id})`);
    
    // Check if suppliesTo already has data
    if (grower.suppliesTo && grower.suppliesTo.length > 0) {
      console.log(`   ⚠️ Skipping - suppliesTo already has ${grower.suppliesTo.length} entries`);
      skippedCount++;
      continue;
    }

    // Migrate availableAtStores to suppliesTo
    try {
      await client
        .patch(grower._id)
        .set({ suppliesTo: grower.availableAtStores })
        .unset(['availableAtStores'])
        .commit();

      console.log(`   ✅ Migrated ${grower.availableAtStores.length} store references`);
      migratedCount++;
    } catch (error) {
      console.error(`   ❌ Error migrating ${grower.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount} growers`);
  console.log(`   ⚠️ Skipped: ${skippedCount} growers (already had suppliesTo data)`);
  console.log('='.repeat(50));
}

// Run the migration
migrateGrowerStores()
  .then(() => {
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
