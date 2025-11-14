/**
 * Backend Email Service Diagnostic Script
 *
 * This script tests the MASH backend email functionality to identify
 * why verification emails are not being sent during registration.
 *
 * Run with: node test-backend-email.js
 */

const https = require("https");

const API_BASE_URL = "http://localhost:3000/api/v1";

// Test email address (use a real email you can check)
const TEST_EMAIL = "your-test-email@example.com"; // <-- CHANGE THIS TO YOUR REAL EMAIL

console.log("🔍 MASH Backend Email Service Diagnostic Tool\n");
console.log("================================================\n");

/**
 * Make HTTPS request helper
 */
function makeRequest(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const req = https.request(url, options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test 1: Backend Health Check
 */
async function testBackendHealth() {
  console.log("📡 Test 1: Backend Health Check");
  console.log("-----------------------------------");

  try {
    const response = await makeRequest("/health", "GET");

    if (response.status === 200 || response.status === 404) {
      console.log("✅ Backend is reachable");
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    } else {
      console.log("⚠️  Backend responded but may have issues");
      console.log(`   Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.log("❌ Backend is NOT reachable");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Test Registration Endpoint
 */
async function testRegistration() {
  console.log("\n📝 Test 2: Registration Endpoint");
  console.log("-----------------------------------");

  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: TEST_EMAIL,
    password: "TestPassword123!",
  };

  console.log(`Attempting to register: ${testUser.email}`);

  try {
    const response = await makeRequest("/auth/register", "POST", testUser);

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.body, null, 2));

    if (response.status === 200 || response.status === 201) {
      console.log("\n✅ Registration endpoint responded successfully");
      console.log("   Check your email inbox for verification code!");
      console.log(`   Email should be sent to: ${testUser.email}`);
      return true;
    } else if (response.status === 500) {
      console.log("\n❌ INTERNAL SERVER ERROR (500)");
      console.log("   This indicates backend email service is NOT configured");
      console.log("\n🔧 Possible Causes:");
      console.log("   - Email service credentials missing in backend env vars");
      console.log("   - SendGrid/AWS SES/Nodemailer not configured");
      console.log("   - Email templates not found");
      console.log("   - SMTP connection failing");
      return false;
    } else if (response.status === 409) {
      console.log("\n⚠️  Email already registered");
      console.log("   Try with a different email address");
      return false;
    } else {
      console.log("\n❌ Unexpected response");
      return false;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Test Resend Code Endpoint
 */
async function testResendCode() {
  console.log("\n🔄 Test 3: Resend Verification Code");
  console.log("-----------------------------------");

  try {
    const response = await makeRequest(
      "/auth/resend-verification-code",
      "POST",
      {
        email: TEST_EMAIL,
      }
    );

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.body, null, 2));

    if (response.status === 200) {
      console.log("\n✅ Resend endpoint works");
      console.log("   Check email for new verification code");
      return true;
    } else if (response.status === 500) {
      console.log("\n❌ Resend endpoint also failing with 500");
      console.log("   Confirms email service configuration issue");
      return false;
    } else {
      console.log("\n⚠️  Unexpected response from resend endpoint");
      return false;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

/**
 * Main diagnostic flow
 */
async function runDiagnostics() {
  console.log(`🧪 Testing backend at: ${API_BASE_URL}`);
  console.log(`📧 Test email: ${TEST_EMAIL}\n`);

  if (TEST_EMAIL === "your-test-email@example.com") {
    console.log(
      "⚠️  WARNING: Please update TEST_EMAIL with your actual email address!\n"
    );
  }

  // Test 1: Health check
  const backendHealthy = await testBackendHealth();

  if (!backendHealthy) {
    console.log("\n❌ Backend is not reachable. Cannot continue tests.");
    process.exit(1);
  }

  // Test 2: Registration
  const registrationWorks = await testRegistration();

  // Test 3: Resend (only if registration failed)
  if (!registrationWorks) {
    await testResendCode();
  }

  // Final summary
  console.log("\n\n📊 DIAGNOSTIC SUMMARY");
  console.log("================================================");

  if (registrationWorks) {
    console.log("✅ Email service appears to be working!");
    console.log("   Check your email inbox (and spam folder)");
    console.log(`   Email: ${TEST_EMAIL}`);
  } else {
    console.log("❌ Email service is NOT working");
    console.log("\n🔧 ACTION REQUIRED (Backend Team):");
    console.log("\n1. Check Backend Environment Variables:");
    console.log('   - EMAIL_SERVICE (e.g., "sendgrid", "ses", "smtp")');
    console.log("   - SENDGRID_API_KEY (if using SendGrid)");
    console.log(
      "   - AWS_SES_ACCESS_KEY / AWS_SES_SECRET_KEY (if using AWS SES)"
    );
    console.log(
      "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (if using SMTP)"
    );
    console.log("   - EMAIL_FROM (sender email address)");
    console.log("\n2. Check Backend Email Service Configuration:");
    console.log("   - Email module properly initialized in NestJS");
    console.log("   - Email templates exist (e.g., verify-email.hbs)");
    console.log("   - Email service credentials are valid");
    console.log("\n3. Check Backend Logs on Railway:");
    console.log("   - Look for email service errors");
    console.log("   - Check for SMTP connection failures");
    console.log("   - Verify API key authentication errors");
    console.log("\n4. Test Email Service Separately:");
    console.log("   - Create a simple test endpoint to send email");
    console.log("   - Verify email service works outside of auth flow");
    console.log("   - Check email service rate limits");
  }

  console.log("\n================================================\n");
}

// Run diagnostics
runDiagnostics().catch((error) => {
  console.error("❌ Diagnostic script failed:", error);
  process.exit(1);
});
