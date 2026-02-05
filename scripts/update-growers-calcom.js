/**
 * Update Growers with Cal.com Settings
 * 
 * This script updates all growers in Sanity CMS with proper Cal.com appointment settings.
 * 
 * Cal.com Profile: https://cal.com/mash-mushroom
 * Event Types:
 * - 1-hour-meeting (60 minutes)
 * - 30min (30 minutes)  
 * - 15min (15 minutes)
 * - secret (15 minutes)
 * 
 * Usage: node scripts/update-growers-calcom.js
 */

const { createClient } = require("@sanity/client");
require("dotenv").config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gerattrr",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-26",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Cal.com appointment types based on actual Cal.com profile
const CALCOM_APPOINTMENT_TYPES = [
  {
    _key: "appt-30min",
    _type: "appointmentType",
    name: "30 Min Meeting",
    eventSlug: "30min",
    duration: 30,
    meetingType: "online",
    description: "Quick consultation to discuss mushroom products, farm visits, or bulk orders.",
    isDefault: true,
  },
  {
    _key: "appt-15min",
    _type: "appointmentType",
    name: "15 Min Quick Chat",
    eventSlug: "15min",
    duration: 15,
    meetingType: "phone",
    description: "Brief call for quick questions or order inquiries.",
    isDefault: false,
  },
  {
    _key: "appt-1hour",
    _type: "appointmentType",
    name: "1 Hour Meeting",
    eventSlug: "1-hour-meeting",
    duration: 60,
    meetingType: "in-person",
    description: "In-depth consultation or farm tour. Perfect for bulk buyers or partners.",
    isDefault: false,
  },
];

async function updateGrowersWithCalcom() {
  console.log("🍄 MASH Grower Cal.com Update Script");
  console.log("====================================");
  console.log("");

  try {
    // Fetch all growers
    const growers = await client.fetch(`*[_type == "grower"]{
      _id,
      name,
      slug,
      calendlyEnabled,
      calendlyUsername,
      calendlyDefaultEvent,
      calcomTheme,
      appointmentTypes
    }`);

    console.log(`Found ${growers.length} growers in Sanity CMS\n`);

    let updated = 0;
    let skipped = 0;

    for (const grower of growers) {
      const slug = grower.slug?.current || grower.name?.toLowerCase().replace(/\s+/g, "-");
      
      // Skip if already properly configured
      if (
        grower.calendlyEnabled === true &&
        grower.calendlyUsername === "mash-mushroom" &&
        grower.calendlyDefaultEvent === "30min" &&
        grower.appointmentTypes?.length >= 3
      ) {
        console.log(`✓ ${grower.name} - Already configured, skipping`);
        skipped++;
        continue;
      }

      console.log(`→ Updating ${grower.name}...`);

      // Update grower with Cal.com settings
      await client
        .patch(grower._id)
        .set({
          calendlyEnabled: true,
          calendlyUsername: "mash-mushroom",
          calcomUsername: "mash-mushroom", // Alias field
          calendlyDefaultEvent: "30min",
          defaultEventSlug: "30min", // Alias field
          calcomTheme: "auto",
          calcomButtonText: "Book Appointment",
          appointmentTypes: CALCOM_APPOINTMENT_TYPES,
          appointmentNotes: `Book a meeting with our grower to discuss your mushroom needs. We offer various meeting types:\n\n• 15 Min Quick Chat - Phone call for quick questions\n• 30 Min Meeting - Online consultation (recommended)\n• 1 Hour Meeting - In-person farm tour or detailed consultation\n\nAll appointments are confirmed via email with Google Meet links or location details.`,
        })
        .commit();

      console.log(`  ✓ Updated ${grower.name} with Cal.com settings`);
      updated++;
    }

    console.log("\n====================================");
    console.log("📊 Summary:");
    console.log(`   Updated: ${updated} growers`);
    console.log(`   Skipped: ${skipped} growers (already configured)`);
    console.log(`   Total:   ${growers.length} growers`);
    console.log("");
    console.log("🎉 Cal.com integration configured for all growers!");
    console.log("");
    console.log("📝 Cal.com Details:");
    console.log("   Username: mash-mushroom");
    console.log("   Profile:  https://cal.com/mash-mushroom");
    console.log("   Events:");
    console.log("     - 15min: https://cal.com/mash-mushroom/15min");
    console.log("     - 30min: https://cal.com/mash-mushroom/30min (default)");
    console.log("     - 1-hour-meeting: https://cal.com/mash-mushroom/1-hour-meeting");

  } catch (error) {
    console.error("❌ Error updating growers:", error.message);
    process.exit(1);
  }
}

// Run the script
updateGrowersWithCalcom();
