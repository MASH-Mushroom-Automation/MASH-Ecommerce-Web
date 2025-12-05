/**
 * Store Migration Script - Phase 6
 * 
 * Migrates store location data to Sanity CMS.
 * Includes MASH main store and pickup points with complete details.
 * 
 * Usage:
 *   node scripts/migrate-stores-to-sanity.js
 * 
 * Environment Variables Required:
 *   SANITY_API_TOKEN - Write token for Sanity
 *   NEXT_PUBLIC_SANITY_PROJECT_ID - Sanity project ID
 *   NEXT_PUBLIC_SANITY_DATASET - Sanity dataset (usually 'production')
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// Store data for MASH
const stores = [
  {
    _id: 'store-mash-novaliches-main',
    _type: 'store',
    name: 'MASH Main Store - Novaliches',
    slug: { current: 'mash-novaliches-main' },
    storeType: 'main',
    description: 'Our flagship store in Novaliches featuring the full range of MASH products, growing kits, and fresh mushrooms harvested daily from our farm. Expert staff available for growing advice and workshops.',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    address: {
      street: '1019 Quirino Highway, Brgy Sta. Monica',
      city: 'Novaliches, Quezon City',
      state: 'Metro Manila',
      zipCode: '1116',
      country: 'Philippines',
      landmark: 'In front of BDO Novaliches Branch',
    },
    coordinates: {
      lat: 14.724177785776938,
      lng: 121.03866187637956,
    },
    directionsUrl: 'https://www.google.com/maps/dir//1019+Quirino+Highway,+Novaliches,+Quezon+City',
    operatingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: '9:00 AM - 3:00 PM',
    },
    timezone: 'Asia/Manila',
    hoursNote: 'Extended hours during holiday season. Closed on major holidays.',
    isOpen24Hours: false,
    phone: '+63 966 169 2000',
    email: 'store.novaliches@mashph.com',
    whatsapp: '+639661692000',
    messenger: 'https://m.me/mashmushroomph',
    services: [
      'shopping',
      'pickup',
      'same-day-delivery',
      'demo',
      'workshops',
      'farm-tour',
      'card-payment',
      'cod',
      'e-wallet',
    ],
    deliveryZones: [
      'Novaliches',
      'Caloocan North',
      'Fairview',
      'Commonwealth',
      'Quezon City North',
      'Valenzuela',
    ],
    pickupInstructions: 'Park at the BDO parking area and proceed to the store entrance. Show your order confirmation for pickup. Orders ready within 15 minutes of arrival notification.',
  },
  {
    _id: 'store-caloocan-pickup',
    _type: 'store',
    name: 'Caloocan Pickup Point',
    slug: { current: 'caloocan-pickup' },
    storeType: 'pickup',
    description: 'Convenient pickup location in Caloocan for your online orders. Reserve online and pick up same day!',
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
    address: {
      street: '936 Llano Road',
      city: 'Caloocan',
      state: 'Metro Manila',
      zipCode: '1400',
      country: 'Philippines',
      landmark: 'Near Llano Road intersection',
    },
    coordinates: {
      lat: 14.741238399110145,
      lng: 121.00588596965112,
    },
    directionsUrl: 'https://www.google.com/maps/dir//936+Llano+Road,+Caloocan,+Metro+Manila',
    operatingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 3:00 PM',
      sunday: 'Closed',
    },
    timezone: 'Asia/Manila',
    hoursNote: 'For pickup orders only. Please place your order at least 2 hours before pickup.',
    isOpen24Hours: false,
    phone: '+63 966 169 2001',
    email: 'pickup.caloocan@mashph.com',
    services: [
      'pickup',
      'cod',
      'e-wallet',
    ],
    deliveryZones: [],
    pickupInstructions: 'Please call or message when you arrive. Have your order number ready. We will bring your order to you within 5 minutes.',
  },
  {
    _id: 'store-qc-commonwealth-pickup',
    _type: 'store',
    name: 'Commonwealth Pickup Point',
    slug: { current: 'commonwealth-pickup' },
    storeType: 'pickup',
    description: 'Quick pickup location along Commonwealth Avenue. Perfect for customers in the Fairview and Commonwealth areas.',
    isActive: true,
    isFeatured: false,
    sortOrder: 11,
    address: {
      street: '456 Commonwealth Avenue',
      city: 'Fairview, Quezon City',
      state: 'Metro Manila',
      zipCode: '1118',
      country: 'Philippines',
      landmark: 'Near Ever Gotesco Commonwealth',
    },
    coordinates: {
      lat: 14.6978,
      lng: 121.0851,
    },
    operatingHours: {
      monday: '10:00 AM - 6:00 PM',
      tuesday: '10:00 AM - 6:00 PM',
      wednesday: '10:00 AM - 6:00 PM',
      thursday: '10:00 AM - 6:00 PM',
      friday: '10:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
    timezone: 'Asia/Manila',
    hoursNote: 'Orders must be placed by 2 PM for same-day pickup.',
    isOpen24Hours: false,
    phone: '+63 966 169 2002',
    services: [
      'pickup',
      'cod',
      'e-wallet',
    ],
    deliveryZones: [],
    pickupInstructions: 'Located inside the small commercial building. Look for the MASH signage. Call when you arrive for assistance.',
  },
  {
    _id: 'store-partner-organic-market',
    _type: 'store',
    name: 'Organic Market QC',
    slug: { current: 'organic-market-qc' },
    storeType: 'partner',
    description: 'Find a selection of MASH fresh mushrooms and growing kits at Organic Market QC. Partner location with limited stock.',
    isActive: true,
    isFeatured: false,
    sortOrder: 20,
    address: {
      street: 'Maginhawa Street',
      city: 'Teachers Village, Quezon City',
      state: 'Metro Manila',
      zipCode: '1101',
      country: 'Philippines',
      landmark: 'Along Maginhawa Food Strip',
    },
    coordinates: {
      lat: 14.6488,
      lng: 121.0659,
    },
    operatingHours: {
      monday: '7:00 AM - 8:00 PM',
      tuesday: '7:00 AM - 8:00 PM',
      wednesday: '7:00 AM - 8:00 PM',
      thursday: '7:00 AM - 8:00 PM',
      friday: '7:00 AM - 9:00 PM',
      saturday: '7:00 AM - 9:00 PM',
      sunday: '8:00 AM - 6:00 PM',
    },
    timezone: 'Asia/Manila',
    hoursNote: 'MASH products available in the fresh produce section. Stock varies - call ahead for specific products.',
    isOpen24Hours: false,
    phone: '+63 917 555 1234',
    services: [
      'shopping',
      'card-payment',
      'e-wallet',
    ],
    deliveryZones: [],
    pickupInstructions: 'Ask the staff for MASH products in the fresh produce refrigerated section.',
  },
];

async function migrateStores() {
  console.log('🏪 Starting Store Migration to Sanity CMS...\n');
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
  console.log(`   Stores to migrate: ${stores.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const store of stores) {
    try {
      // Check if store already exists
      const existing = await client.fetch(
        `*[_type == "store" && _id == $id][0]`,
        { id: store._id }
      );

      if (existing) {
        // Update existing store
        await client.patch(store._id).set(store).commit();
        console.log(`✅ Updated: ${store.name}`);
      } else {
        // Create new store
        await client.create(store);
        console.log(`✅ Created: ${store.name}`);
      }
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating ${store.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);
  console.log('='.repeat(50));

  if (successCount > 0) {
    console.log('\n🎉 Stores are now available in Sanity Studio!');
    console.log('   Open http://localhost:3333 → 📍 Store Locations');
    console.log('\n📱 Frontend pages ready:');
    console.log('   - /stores (list all stores)');
    console.log('   - /stores/mash-novaliches-main (main store detail)');
    console.log('   - /stores/caloocan-pickup (pickup point detail)');
  }
}

// Run migration
migrateStores().catch(console.error);
