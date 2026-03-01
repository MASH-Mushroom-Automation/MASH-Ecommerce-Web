/**
 * Lalamove Production Environment Validation Script
 *
 * Validates that all Lalamove environment variables are correctly
 * configured for production use. Run before deploying to production:
 *
 *   node scripts/validate-lalamove-env.js
 *
 * Exit codes:
 *   0 = All checks passed (production ready)
 *   1 = One or more checks failed
 */

const path = require("path");
const fs = require("fs");

// Load .env file manually (no dotenv dependency required)
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.error("[ERROR] .env file not found at:", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function validate() {
  console.log("=== Lalamove Production Environment Validation ===\n");

  const env = loadEnv();
  let passed = 0;
  let failed = 0;

  function check(name, condition, successMsg, failMsg) {
    if (condition) {
      console.log(`  [PASS] ${name}: ${successMsg}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${name}: ${failMsg}`);
      failed++;
    }
  }

  // 1. LALAMOVE_API_KEY
  const apiKey = env.LALAMOVE_API_KEY || "";
  check(
    "LALAMOVE_API_KEY exists",
    apiKey.length > 0,
    `Set (${apiKey.slice(0, 12)}...)`,
    "Missing or empty"
  );
  check(
    "LALAMOVE_API_KEY is production",
    apiKey.startsWith("pk_live_"),
    "Has pk_live_ prefix",
    `Has "${apiKey.slice(0, 8)}" prefix (expected pk_live_). Currently using ${apiKey.startsWith("pk_test_") ? "SANDBOX" : "UNKNOWN"} key.`
  );
  check(
    "LALAMOVE_API_KEY is not placeholder",
    !apiKey.includes("YOUR_") && !apiKey.includes("XXXX"),
    "Not a placeholder value",
    "Contains placeholder text (YOUR_ or XXXX)"
  );

  // 2. LALAMOVE_API_SECRET
  const apiSecret = env.LALAMOVE_API_SECRET || "";
  check(
    "LALAMOVE_API_SECRET exists",
    apiSecret.length > 0,
    `Set (${apiSecret.slice(0, 12)}...)`,
    "Missing or empty"
  );
  check(
    "LALAMOVE_API_SECRET is production",
    apiSecret.startsWith("sk_live_"),
    "Has sk_live_ prefix",
    `Has "${apiSecret.slice(0, 8)}" prefix (expected sk_live_). Currently using ${apiSecret.startsWith("sk_test_") ? "SANDBOX" : "UNKNOWN"} secret.`
  );
  check(
    "LALAMOVE_API_SECRET is not placeholder",
    !apiSecret.includes("YOUR_") && !apiSecret.includes("XXXX"),
    "Not a placeholder value",
    "Contains placeholder text (YOUR_ or XXXX)"
  );

  // 3. LALAMOVE_HOST
  const host = env.LALAMOVE_HOST || "";
  check(
    "LALAMOVE_HOST exists",
    host.length > 0,
    host,
    "Missing or empty"
  );
  check(
    "LALAMOVE_HOST is production",
    host === "https://rest.lalamove.com",
    "Points to production (rest.lalamove.com)",
    `Points to "${host}" (expected https://rest.lalamove.com). ${host.includes("sandbox") ? "Currently using SANDBOX." : ""}`
  );

  // 4. LALAMOVE_MARKET
  const market = env.LALAMOVE_MARKET || "";
  check(
    "LALAMOVE_MARKET exists",
    market.length > 0,
    market,
    "Missing or empty"
  );
  check(
    "LALAMOVE_MARKET is PH",
    market === "PH",
    "Set to PH (Philippines)",
    `Set to "${market}" (expected PH)`
  );

  // Summary
  console.log("\n=== Results ===");
  console.log(`  Passed: ${passed}/${passed + failed}`);
  console.log(`  Failed: ${failed}/${passed + failed}`);

  if (failed > 0) {
    console.log("\n[WARNING] Lalamove is NOT configured for production.");
    console.log("Follow .github/LALAMOVE_PRODUCTION_GUIDE.md to obtain production credentials.");
    console.log("\nTo switch to production:");
    console.log("  1. Get pk_live_ and sk_live_ credentials from Lalamove");
    console.log("  2. Update .env with production values");
    console.log("  3. Set LALAMOVE_HOST=https://rest.lalamove.com");
    console.log("  4. Add same variables to Railway dashboard");
    console.log("  5. Re-run this script to verify");
    process.exit(1);
  } else {
    console.log("\n[SUCCESS] Lalamove is configured for production!");
    console.log("Ensure Railway dashboard has the same environment variables.");
    process.exit(0);
  }
}

validate();
