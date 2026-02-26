/**
 * User Profile Phone Fields Migration Script
 *
 * Adds phone verification and 2FA fields to existing user profiles.
 * 
 * New fields added:
 * - phoneNumber: string (optional)
 * - phoneVerified: boolean (default: false)
 * - phoneVerifiedAt: Timestamp (optional)
 * - twoFactorEnabled: boolean (default: false)
 * - twoFactorMethod: "SMS" (optional)
 *
 * Usage:
 *   npx ts-node scripts/migrate-user-profiles-phone.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Preview changes without applying them
 */

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as path from "path";
import * as fs from "fs";

// ============================================================================
// Configuration
// ============================================================================

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 500; // Firestore batch write limit

// ============================================================================
// Firebase Admin Setup
// ============================================================================

// Load service account key
const serviceAccountPath = path.join(
  process.cwd(),
  "firebase-service-account.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: firebase-service-account.json not found");
  console.error("Please download your service account key from Firebase Console:");
  console.error("  1. Go to Project Settings > Service Accounts");
  console.error("  2. Click 'Generate New Private Key'");
  console.error("  3. Save as firebase-service-account.json in project root");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
) as ServiceAccount;

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

// ============================================================================
// Migration Logic
// ============================================================================

interface UserProfile {
  id: string;
  email: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: FirebaseFirestore.Timestamp;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: "SMS";
}

async function migrateUserProfiles() {
  console.log("========================================");
  console.log("User Profile Phone Fields Migration");
  console.log("========================================");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE MIGRATION"}`);
  console.log("");

  try {
    // Fetch all users
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    console.log(`Found ${snapshot.size} user profiles`);
    console.log("");

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process users in batches
    const batches: FirebaseFirestore.WriteBatch[] = [];
    let currentBatch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data() as UserProfile;
      const userId = doc.id;

      // Check if user already has phone fields
      const hasPhoneFields =
        data.phoneNumber !== undefined ||
        data.phoneVerified !== undefined ||
        data.phoneVerifiedAt !== undefined ||
        data.twoFactorEnabled !== undefined ||
        data.twoFactorMethod !== undefined;

      if (hasPhoneFields) {
        console.log(`[SKIP] User ${userId} already has phone fields`);
        skippedCount++;
        continue;
      }

      // Prepare update data with default values
      const updateData: Partial<UserProfile> & { updatedAt: FirebaseFirestore.FieldValue } = {
        phoneNumber: null as unknown as string, // Will be set when user verifies phone
        phoneVerified: false,
        phoneVerifiedAt: null as unknown as FirebaseFirestore.Timestamp,
        twoFactorEnabled: false,
        twoFactorMethod: null as unknown as "SMS",
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (DRY_RUN) {
        console.log(`[DRY RUN] Would update user ${userId}:`, updateData);
      } else {
        currentBatch.update(doc.ref, updateData);
        batchCount++;

        // Commit batch if it reaches size limit
        if (batchCount >= BATCH_SIZE) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          batchCount = 0;
        }

        console.log(`[UPDATE] User ${userId} - Added phone fields`);
      }

      updatedCount++;
    }

    // Add remaining batch
    if (batchCount > 0 && !DRY_RUN) {
      batches.push(currentBatch);
    }

    // Commit all batches
    if (!DRY_RUN && batches.length > 0) {
      console.log("");
      console.log(`Committing ${batches.length} batches...`);
      
      for (let i = 0; i < batches.length; i++) {
        try {
          await batches[i].commit();
          console.log(`[COMMIT] Batch ${i + 1}/${batches.length} completed`);
        } catch (error) {
          console.error(`[ERROR] Batch ${i + 1} failed:`, error);
          errorCount++;
        }
      }
    }

    // Summary
    console.log("");
    console.log("========================================");
    console.log("Migration Summary");
    console.log("========================================");
    console.log(`Total users: ${snapshot.size}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("");

    if (DRY_RUN) {
      console.log("DRY RUN - No changes were made");
      console.log("Run without --dry-run to apply changes");
    } else {
      console.log("Migration completed successfully!");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// ============================================================================
// Run Migration
// ============================================================================

migrateUserProfiles()
  .then(() => {
    console.log("");
    console.log("Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
