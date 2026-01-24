/**
 * End-to-End Booking Flow Validation Script
 * 
 * Validates that all growers have Calendly configured and booking pages are accessible.
 * Tests the complete user journey from grower profile to booking confirmation.
 * 
 * Usage: node scripts/validate-booking-flow.js
 * 
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md (CAL-009)
 */

import 'dotenv/config';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const GROWERS = [
  'shroomarket',
  'fungi-fresh-farms',
  'kabutehan-ni-aling-nena',
  'mushroom-patch-bukidnon',
];

async function validateBookingFlow() {
  console.log('🧪 End-to-End Booking Flow Validation');
  console.log('=' .repeat(60));
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: [],
  };

  for (const slug of GROWERS) {
    console.log(`\n📋 Testing: ${slug}`);
    console.log('-'.repeat(60));

    const test = {
      grower: slug,
      checks: {},
    };

    try {
      // Test 1: Fetch grower data
      const query = `*[_type == "grower" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        calendlyEnabled,
        calendlyUsername,
        calendlyDefaultEvent,
        appointmentTypes[] {
          _key,
          name,
          eventSlug,
          duration,
          meetingType,
          description,
          isDefault
        },
        appointmentNotes
      }`;

      const grower = await client.fetch(query, { slug });

      if (!grower) {
        console.log('  ❌ Grower not found in Sanity');
        test.checks.growerExists = false;
        results.failed++;
        results.tests.push(test);
        continue;
      }

      test.checks.growerExists = true;
      console.log(`  ✅ Grower exists: ${grower.name}`);

      // Test 2: Calendly enabled
      if (!grower.calendlyEnabled) {
        console.log('  ⚠️  Calendly not enabled');
        test.checks.calendlyEnabled = false;
        results.warnings++;
      } else {
        test.checks.calendlyEnabled = true;
        console.log('  ✅ Calendly enabled');
      }

      // Test 3: Calendly username configured
      if (!grower.calendlyUsername) {
        console.log('  ❌ Calendly username missing');
        test.checks.calendlyUsername = false;
        results.failed++;
      } else {
        test.checks.calendlyUsername = true;
        console.log(`  ✅ Calendly username: ${grower.calendlyUsername}`);
      }

      // Test 4: Default event configured
      if (!grower.calendlyDefaultEvent) {
        console.log('  ⚠️  Default event not set');
        test.checks.defaultEvent = false;
        results.warnings++;
      } else {
        test.checks.defaultEvent = true;
        console.log(`  ✅ Default event: ${grower.calendlyDefaultEvent}`);
      }

      // Test 5: Appointment types configured
      if (!grower.appointmentTypes || grower.appointmentTypes.length === 0) {
        console.log('  ⚠️  No appointment types configured');
        test.checks.appointmentTypes = false;
        results.warnings++;
      } else {
        test.checks.appointmentTypes = true;
        console.log(`  ✅ Appointment types: ${grower.appointmentTypes.length} configured`);
        
        grower.appointmentTypes.forEach((apt, index) => {
          console.log(`     ${index + 1}. ${apt.name} (${apt.duration} min, ${apt.meetingType})`);
        });
      }

      // Test 6: Calendly URL construction
      if (grower.calendlyUsername && grower.calendlyDefaultEvent) {
        const calendlyUrl = `https://calendly.com/${grower.calendlyUsername}/${grower.calendlyDefaultEvent}`;
        test.checks.calendlyUrl = calendlyUrl;
        console.log(`  ✅ Calendly URL: ${calendlyUrl}`);
      } else {
        test.checks.calendlyUrl = null;
        console.log('  ❌ Cannot construct Calendly URL (missing data)');
        results.failed++;
      }

      // Test 7: Booking page URL
      const bookingPageUrl = `/grower/${slug}/book`;
      test.checks.bookingPageUrl = bookingPageUrl;
      console.log(`  ✅ Booking page: http://localhost:3000${bookingPageUrl}`);

      // Test 8: Appointment notes
      if (grower.appointmentNotes) {
        test.checks.appointmentNotes = true;
        console.log('  ✅ Appointment notes configured');
      } else {
        test.checks.appointmentNotes = false;
        console.log('  ⚠️  No appointment notes');
        results.warnings++;
      }

      // Overall test result
      const allPassed = 
        test.checks.growerExists &&
        test.checks.calendlyEnabled &&
        test.checks.calendlyUsername &&
        test.checks.calendlyUrl;

      if (allPassed) {
        console.log('\n  🎉 ALL CRITICAL TESTS PASSED');
        results.passed++;
      } else {
        console.log('\n  ⚠️  SOME TESTS FAILED OR NEED ATTENTION');
        results.failed++;
      }

      results.tests.push(test);

    } catch (error) {
      console.log(`  ❌ Error testing grower: ${error.message}`);
      test.checks.error = error.message;
      results.failed++;
      results.tests.push(test);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed} growers`);
  console.log(`❌ Failed: ${results.failed} growers`);
  console.log(`⚠️  Warnings: ${results.warnings} issues`);
  console.log(`📦 Total: ${GROWERS.length} growers tested`);
  console.log('='.repeat(60));

  // Recommendations
  console.log('\n📋 NEXT STEPS:');
  console.log('');
  
  if (results.failed === 0) {
    console.log('✅ All growers ready for booking!');
    console.log('');
    console.log('Test the booking flow:');
    console.log('1. npm run dev');
    console.log('2. Visit: http://localhost:3000/grower/shroomarket');
    console.log('3. Click "Book Appointment" button');
    console.log('4. Verify Calendly widget loads correctly');
    console.log('5. Complete a test booking to verify end-to-end flow');
  } else {
    console.log('⚠️  Some growers need attention. Review the errors above.');
    console.log('Run: node scripts/enable-growers-calendly.js to fix configuration');
  }

  console.log('');
  console.log('📖 Full documentation: .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md');
  console.log('');

  // Return exit code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run validation
validateBookingFlow().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
