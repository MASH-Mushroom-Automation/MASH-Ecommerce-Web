/**
 * Link Growers to Stores Script
 * 
 * This script establishes bidirectional relationships between growers and stores in Sanity.
 * 
 * Run: node scripts/link-growers-stores.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Define which growers supply to which stores
// Based on realistic local farm-to-store relationships
const GROWER_STORE_LINKS = [
  {
    growerName: 'The Mushroom Patch Bukidnon',
    stores: ['MASH Main Store - Novaliches', 'Organic Market QC'], // Premium grower - main locations
  },
  {
    growerName: 'Fungi Fresh Farms',
    stores: ['MASH Main Store - Novaliches', 'Caloocan Pickup Point', 'Commonwealth Pickup Point'], // Wide distribution
  },
  {
    growerName: 'Kabutehan ni Aling Nena',
    stores: ['MASH Main Store - Novaliches', 'Caloocan Pickup Point'], // Local grower - nearby stores
  },
  {
    growerName: 'Shroomz',
    stores: ['MASH Main Store - Novaliches', 'Organic Market QC', 'Commonwealth Pickup Point'], // Urban farms - multiple outlets
  },
];

async function linkGrowersAndStores() {
  console.log('🔗 Starting Grower-Store Linking...\n');

  try {
    // 1. Fetch all growers
    const growers = await client.fetch(`
      *[_type == "grower"] {
        _id,
        name
      }
    `);
    console.log(`👨‍🌾 Found ${growers.length} growers`);

    // 2. Fetch all stores
    const stores = await client.fetch(`
      *[_type == "store"] {
        _id,
        name
      }
    `);
    console.log(`🏪 Found ${stores.length} stores\n`);

    // Create lookup maps
    const growerMap = new Map(growers.map(g => [g.name, g._id]));
    const storeMap = new Map(stores.map(s => [s.name, s._id]));

    // 3. Process each grower-store link
    let linksCreated = 0;
    
    for (const link of GROWER_STORE_LINKS) {
      const growerId = growerMap.get(link.growerName);
      
      if (!growerId) {
        console.log(`⚠️ Grower "${link.growerName}" not found, skipping...`);
        continue;
      }

      const storeRefs = link.stores
        .map(storeName => {
          const storeId = storeMap.get(storeName);
          if (!storeId) {
            console.log(`⚠️ Store "${storeName}" not found`);
            return null;
          }
          return { _type: 'reference', _ref: storeId };
        })
        .filter(Boolean);

      if (storeRefs.length === 0) {
        console.log(`⚠️ No valid stores for "${link.growerName}"`);
        continue;
      }

      // Update grower with store references
      await client
        .patch(growerId)
        .set({ availableAtStores: storeRefs })
        .commit();
      
      console.log(`✅ ${link.growerName} → ${link.stores.join(', ')}`);
      linksCreated++;
    }

    console.log(`\n✅ Linked ${linksCreated} growers to stores (grower → stores)`);

    // 4. Now do the reverse - link stores to growers
    console.log('\n🔄 Creating reverse links (stores → growers)...\n');

    // Build reverse mapping: store → growers
    const storeToGrowers = new Map();
    
    for (const link of GROWER_STORE_LINKS) {
      const growerId = growerMap.get(link.growerName);
      if (!growerId) continue;

      for (const storeName of link.stores) {
        const storeId = storeMap.get(storeName);
        if (!storeId) continue;

        if (!storeToGrowers.has(storeId)) {
          storeToGrowers.set(storeId, []);
        }
        storeToGrowers.get(storeId).push({ 
          _type: 'reference', 
          _ref: growerId,
          _key: growerId.replace('drafts.', '') // Ensure unique key
        });
      }
    }

    // Update each store with grower references
    let storeLinksCreated = 0;
    
    for (const [storeId, growerRefs] of storeToGrowers) {
      const storeName = [...storeMap.entries()].find(([_, id]) => id === storeId)?.[0];
      
      await client
        .patch(storeId)
        .set({ growers: growerRefs })
        .commit();
      
      const growerNames = growerRefs.map(ref => {
        return [...growerMap.entries()].find(([_, id]) => id === ref._ref)?.[0] || 'Unknown';
      });
      
      console.log(`✅ ${storeName} ← ${growerNames.join(', ')}`);
      storeLinksCreated++;
    }

    console.log(`\n✅ Linked ${storeLinksCreated} stores to growers (store → growers)`);
    console.log('\n🎉 All grower-store relationships created successfully!');

    // 5. Verify the links
    console.log('\n📊 Verification:');
    
    const verifyGrowers = await client.fetch(`
      *[_type == "grower" && defined(availableAtStores)] {
        name,
        "stores": availableAtStores[]->name
      }
    `);
    
    const verifyStores = await client.fetch(`
      *[_type == "store" && defined(growers)] {
        name,
        "growers": growers[]->name
      }
    `);

    console.log('\n👨‍🌾 Growers with store links:');
    for (const g of verifyGrowers) {
      console.log(`   ${g.name} → ${g.stores?.join(', ') || 'none'}`);
    }

    console.log('\n🏪 Stores with grower links:');
    for (const s of verifyStores) {
      console.log(`   ${s.name} ← ${s.growers?.join(', ') || 'none'}`);
    }

  } catch (error) {
    console.error('❌ Error linking growers and stores:', error);
    throw error;
  }
}

// Run the script
linkGrowersAndStores();
