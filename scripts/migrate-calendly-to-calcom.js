/**
 * Sanity Migration Script: Calendly → Cal.com
 * 
 * Purpose:
 * - Updates all growers with Calendly appointments to use Cal.com
 * - Creates default appointment types (15min, 30min, 1 hour)
 * - Updates calendlyUsername to Cal.com format
 * - Preserves existing appointment configurations
 * 
 * Usage:
 *   node scripts/migrate-calendly-to-calcom.js [--dry-run] [--grower-id=<id>]
 * 
 * Options:
 *   --dry-run     Preview changes without writing to Sanity
 *   --grower-id   Migrate specific grower only (default: all)
 * 
 * Cal.com Event Types:
 *   - 1 hour meeting  → /mash-mushroom/1-hour-meeting (60min)
 *   - 30 min meeting  → /mash-mushroom/30min (30min)
 *   - 15 min meeting  → /mash-mushroom/15min (15min)
 *   - Secret meeting  → /mash-mushroom/secret (15min)
 * 
 * Created: 2026-01-24
 * Related Stories: STORY-TEST-017, STORY-TEST-018, STORY-TEST-019
 */

import { createClient } from "@sanity/client";

// ============================================================================
// Configuration
// ============================================================================

const SANITY_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gerattrr",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-26",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
};

const CAL_COM_PROFILE = "mash-mushroom"; // Your Cal.com username

// Default Cal.com event types
const DEFAULT_EVENT_TYPES = [
  {
    _key: "15min-consultation",
    name: "15 Min Consultation",
    eventSlug: "15min",
    duration: 15,
    meetingType: "online",
    description: "Quick consultation for urgent questions or product inquiries",
    isDefault: false,
  },
  {
    _key: "30min-meeting",
    name: "30 Min Meeting",
    eventSlug: "30min",
    duration: 30,
    meetingType: "online",
    description: "Standard meeting for product consultation and order discussions",
    isDefault: true, // Set as default recommended option
  },
  {
    _key: "1hour-meeting",
    name: "1 Hour Meeting",
    eventSlug: "1-hour-meeting",
    duration: 60,
    meetingType: "online",
    description: "Comprehensive session for farm tours, bulk orders, or partnerships",
    isDefault: false,
  },
  {
    _key: "secret-meeting",
    name: "Secret Meeting",
    eventSlug: "secret",
    duration: 15,
    meetingType: "online",
    description: "Private consultation for special requests",
    isDefault: false,
  },
];

// ============================================================================
// Parse CLI Arguments
// ============================================================================

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const growerIdArg = args.find((arg) => arg.startsWith("--grower-id="));
const targetGrowerId = growerIdArg ? growerIdArg.split("=")[1] : null;

// ============================================================================
// Initialize Sanity Client
// ============================================================================

// Only require a write token when performing a LIVE run. Dry-run does not need a token.
if (!isDryRun && !SANITY_CONFIG.token) {
  console.error("❌ Error: SANITY_API_WRITE_TOKEN environment variable not set.");
  console.error("   Set it in your .env file or export it:");
  console.error('   export SANITY_API_WRITE_TOKEN="sk..."');
  process.exit(1);
}

const client = createClient(SANITY_CONFIG);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log with color formatting
 */
function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",    // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m",   // Red
    reset: "\x1b[0m",
  };

  const color = colors[type] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Convert Calendly username to Cal.com format
 * Example: mash-mushroom-automation → mash-mushroom
 */
function convertToCalComUsername(calendlyUsername) {
  // If already in Cal.com format, return as-is
  if (calendlyUsername === CAL_COM_PROFILE) {
    return calendlyUsername;
  }

  // Use configured Cal.com profile
  return CAL_COM_PROFILE;
}

/**
 * Map Calendly event slug to Cal.com event slug
 */
function mapCalendlyToCalComSlug(calendlySlug) {
  const slugMap = {
    "30min": "30min",
    "30-min": "30min",
    "15min": "15min",
    "15-min": "15min",
    "1hour": "1-hour-meeting",
    "1-hour": "1-hour-meeting",
    "secret": "secret",
  };

  return slugMap[calendlySlug] || calendlySlug;
}

/**
 * Migrate single grower to Cal.com
 */
async function migrateGrower(grower) {
  log(`\n📊 Migrating Grower: ${grower.name} (${grower._id})`, "info");

  // Convert username to Cal.com format
  const calComUsername = convertToCalComUsername(grower.calendlyUsername);
  const calComDefaultEvent = mapCalendlyToCalComSlug(grower.calendlyDefaultEvent || "30min");

  // Migrate existing appointment types if present
  let appointmentTypes = DEFAULT_EVENT_TYPES;

  if (grower.appointmentTypes && grower.appointmentTypes.length > 0) {
    log(`   Found ${grower.appointmentTypes.length} existing appointment types`, "info");

    // Map existing Calendly event slugs to Cal.com
    appointmentTypes = grower.appointmentTypes.map((apt, index) => ({
      _key: apt._key || `event-${index}`,
      name: apt.name,
      eventSlug: mapCalendlyToCalComSlug(apt.eventSlug),
      duration: apt.duration,
      meetingType: apt.meetingType || "online",
      description: apt.description,
      isDefault: apt.isDefault || false,
    }));
  } else {
    log("   No existing appointment types - using defaults", "warning");
  }

  // Ensure unique _key values (prevent React duplicate key errors)
  appointmentTypes = appointmentTypes.map((apt, index) => ({
    ...apt,
    _key: `${apt.eventSlug}-${index}`,
  }));

  // Create patch document
  const patch = {
    calendlyUsername: calComUsername,
    calendlyDefaultEvent: calComDefaultEvent,
    appointmentTypes,
  };

  log("   Changes to apply:", "info");
  log(`     calendlyUsername: ${grower.calendlyUsername} → ${calComUsername}`, "info");
  log(`     calendlyDefaultEvent: ${grower.calendlyDefaultEvent || "N/A"} → ${calComDefaultEvent}`, "info");
  log(`     appointmentTypes: ${appointmentTypes.length} event(s)`, "info");

  appointmentTypes.forEach((apt) => {
    const defaultTag = apt.isDefault ? " [DEFAULT]" : "";
    log(`       - ${apt.name} (${apt.duration}min) → /${calComUsername}/${apt.eventSlug}${defaultTag}`, "success");
  });

  // Apply patch to Sanity
  if (!isDryRun) {
    try {
      await client.patch(grower._id).set(patch).commit();
      log(`   ✅ Successfully migrated ${grower.name}`, "success");
      return { success: true, growerId: grower._id, name: grower.name };
    } catch (error) {
      log(`   ❌ Error migrating ${grower.name}: ${error.message}`, "error");
      return { success: false, growerId: grower._id, name: grower.name, error: error.message };
    }
  } else {
    log("   🔍 DRY RUN - No changes written to Sanity", "warning");
    return { success: true, growerId: grower._id, name: grower.name, dryRun: true };
  }
}

// ============================================================================
// Main Migration Logic
// ============================================================================

async function main() {
  log("═══════════════════════════════════════════════════════════════", "info");
  log("  Sanity Migration: Calendly → Cal.com", "info");
  log("═══════════════════════════════════════════════════════════════", "info");
  log(`  Mode: ${isDryRun ? "DRY RUN (Preview Only)" : "LIVE MIGRATION"}`, isDryRun ? "warning" : "success");
  log(`  Cal.com Profile: https://cal.com/${CAL_COM_PROFILE}`, "info");
  log("═══════════════════════════════════════════════════════════════\n", "info");

  // Build Sanity query
  let query = `*[_type == "grower" && calendlyEnabled == true`;
  if (targetGrowerId) {
    query += ` && _id == "${targetGrowerId}"`;
  }
  query += `] {
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
    }
  }`;

  try {
    log("🔍 Fetching growers with Calendly appointments enabled...\n", "info");
    const growers = await client.fetch(query);

    if (growers.length === 0) {
      log("⚠️  No growers found with Calendly appointments enabled.", "warning");
      log("   Ensure growers have calendlyEnabled: true in Sanity.", "warning");
      process.exit(0);
    }

    log(`✅ Found ${growers.length} grower(s) to migrate\n`, "success");

    // Migrate each grower
    const results = [];
    for (const grower of growers) {
      const result = await migrateGrower(grower);
      results.push(result);
    }

    // Summary
    log("\n═══════════════════════════════════════════════════════════════", "info");
    log("  Migration Summary", "info");
    log("═══════════════════════════════════════════════════════════════", "info");

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    if (isDryRun) {
      log(`  ${successCount} grower(s) would be migrated (DRY RUN)`, "warning");
    } else {
      log(`  ✅ ${successCount} grower(s) migrated successfully`, "success");
      if (failureCount > 0) {
        log(`  ❌ ${failureCount} grower(s) failed to migrate`, "error");
      }
    }

    // List failures
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      log("\n  Failed Migrations:", "error");
      failures.forEach((f) => {
        log(`    - ${f.name} (${f.growerId}): ${f.error}`, "error");
      });
    }

    log("═══════════════════════════════════════════════════════════════\n", "info");

    // Next steps
    if (isDryRun) {
      log("💡 Next Steps:", "info");
      log("   1. Review the preview above", "info");
      log("   2. Run without --dry-run to apply changes:", "info");
      log("      node scripts/migrate-calendly-to-calcom.js", "info");
    } else {
      log("✨ Migration Complete!", "success");
      log("   1. Verify changes in Sanity Studio: https://ppnamias.sanity.studio", "success");
      log("   2. Test booking pages in production", "success");
      log("   3. Verify Cal.com event types: https://cal.com/mash-mushroom", "success");
    }
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, "error");
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// Run Migration
// ============================================================================

main();
