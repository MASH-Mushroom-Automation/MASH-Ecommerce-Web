/**
 * Enable Calendly Appointments for All Growers
 * 
 * This script automatically configures all growers in Sanity with:
 * - Calendly username: mash-mushroom-automation
 * - Default event: 30min
 * - Standard appointment types
 * 
 * Live Calendly URL: https://calendly.com/mash-mushroom-automation/30min
 * 
 * Usage: node scripts/enable-growers-calendly.js
 * 
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md (Task CAL-007)
 */

import 'dotenv/config';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // Ensure fresh data
});

// Standard appointment types for all growers
const STANDARD_APPOINTMENT_TYPES = [
  {
    _key: 'consultation-30min',
    name: 'Product Consultation',
    eventSlug: '30min',
    duration: 30,
    meetingType: 'online',
    description: 'Discuss our mushroom products, bulk orders, pricing, and delivery options.',
    isDefault: true,
  },
  {
    _key: 'store-visit',
    name: 'Farm/Store Visit',
    eventSlug: '30min', // Use same 30min event
    duration: 30,
    meetingType: 'in-person',
    description: 'Schedule an in-person visit to see our farm and products.',
    isDefault: false,
  },
  {
    _key: 'bulk-order',
    name: 'Bulk Order Discussion',
    eventSlug: '30min', // Use same 30min event
    duration: 30,
    meetingType: 'online',
    description: 'Discuss large quantity orders, custom packaging, and wholesale pricing.',
    isDefault: false,
  },
];

const APPOINTMENT_NOTES = `
📅 **Before your appointment:**
- Have your questions ready about our products
- Note any specific mushroom varieties you're interested in
- Prepare details about order quantities if discussing bulk orders

💻 **For online meetings:**
- You'll receive a Google Meet link via email
- Ensure stable internet connection
- Have your camera and microphone ready

🏪 **For farm/store visits:**
- Arrive 5 minutes early
- Bring a face mask (if required)
- Feel free to ask our staff any questions

We look forward to connecting with you!
`.trim();

async function enableCalendlyForAllGrowers() {
  console.log('🚀 Starting Calendly enablement for all growers...\n');

  try {
    // Step 1: Fetch all growers
    const query = `*[_type == "grower" && !(_id in path("drafts.**"))] {
      _id,
      name,
      slug,
      calendlyEnabled,
      calendlyUsername
    }`;

    console.log('📦 Fetching growers from Sanity...');
    const growers = await client.fetch(query);
    console.log(`✅ Found ${growers.length} growers\n`);

    if (growers.length === 0) {
      console.log('⚠️  No growers found. Please create growers first.');
      return;
    }

    // Step 2: Update each grower with Calendly configuration
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const grower of growers) {
      try {
        // Skip if already enabled with correct username
        if (
          grower.calendlyEnabled &&
          grower.calendlyUsername === 'mash-mushroom-automation'
        ) {
          console.log(`⏭️  ${grower.name} - Already configured, skipping`);
          skipCount++;
          continue;
        }

        // Update grower with Calendly settings
        const update = {
          calendlyEnabled: true,
          calendlyUsername: 'mash-mushroom-automation',
          calendlyDefaultEvent: '30min',
          appointmentTypes: STANDARD_APPOINTMENT_TYPES,
          appointmentNotes: APPOINTMENT_NOTES,
        };

        await client
          .patch(grower._id)
          .set(update)
          .commit();

        console.log(`✅ ${grower.name} - Calendly enabled`);
        console.log(`   📍 Booking URL: /grower/${grower.slug.current}/book`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${grower.name} - Failed to update:`, error.message);
        errorCount++;
      }
    }

    // Step 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} growers`);
    console.log(`⏭️  Skipped (already enabled): ${skipCount} growers`);
    console.log(`❌ Errors: ${errorCount} growers`);
    console.log(`📦 Total growers: ${growers.length}`);
    console.log('='.repeat(60));

    // Step 4: List all booking URLs
    console.log('\n📍 BOOKING URLS:');
    console.log('='.repeat(60));
    for (const grower of growers) {
      const localUrl = `http://localhost:3000/grower/${grower.slug.current}/book`;
      const prodUrl = `https://mash-ecommerce-web-production.up.railway.app/grower/${grower.slug.current}/book`;
      console.log(`\n${grower.name}:`);
      console.log(`  Local:      ${localUrl}`);
      console.log(`  Production: ${prodUrl}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Script completed successfully!');
    console.log('='.repeat(60));

    // Step 5: Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Visit Sanity Studio to verify: https://ppnamias.sanity.studio');
    console.log('2. Check any grower: Growers → [Grower Name] → Appointments tab');
    console.log('3. Test booking flow: npm run dev');
    console.log('4. Visit: http://localhost:3000/grower/shroomarket/book');
    console.log('5. Complete CAL-009: Test end-to-end booking\n');
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run the script
enableCalendlyForAllGrowers();
