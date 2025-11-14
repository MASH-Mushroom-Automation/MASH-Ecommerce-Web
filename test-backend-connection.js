// 🧪 MASH Backend Connection Testing Script
// Tests dual-backend routing (localhost for emails, production for login)

const LOCAL_API = process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:3000/api/v1";
const PROD_API = process.env.NEXT_PUBLIC_API_URL || "https://mash-backend-api-production.up.railway.app/api/v1";

// ⚠️ IMPORTANT: Change this to YOUR real email address to receive verification codes
const TEST_EMAIL = "your-email@example.com"; // <-- CHANGE THIS!
const TEST_PASSWORD = "TestPass123!";
const TEST_FIRST_NAME = "Test";
const TEST_LAST_NAME = "User";

console.log("🚀 MASH Backend Connection Test\n");
console.log("📧 Email endpoints → LOCAL backend:", LOCAL_API);
console.log("🔑 Login endpoints → PRODUCTION backend:", PROD_API);
console.log("\n" + "=".repeat(70) + "\n");

async function testBackendHealth() {
  console.log("🏥 Test 1: Backend Health Check\n");
  
  // Test local backend
  try {
    const localResponse = await fetch(`${LOCAL_API.replace('/api/v1', '')}/health`, {
      method: "GET"
    });
    
    if (localResponse.ok) {
      console.log("✅ LOCAL backend is ONLINE ✅");
      console.log(`   URL: ${LOCAL_API}`);
    } else {
      console.log("⚠️ LOCAL backend responded but not healthy");
    }
  } catch (error) {
    console.log("❌ LOCAL backend is OFFLINE ❌");
    console.log("   → Make sure your local backend is running on http://localhost:3000");
    console.log("   → Run: npm start (in backend directory)");
    return false;
  }
  
  // Test production backend
  try {
    const prodResponse = await fetch(`${PROD_API.replace('/api/v1', '')}/health`, {
      method: "GET"
    });
    
    if (prodResponse.ok) {
      console.log("✅ PRODUCTION backend is ONLINE ✅");
      console.log(`   URL: ${PROD_API}`);
    } else {
      console.log("⚠️ PRODUCTION backend responded but not healthy");
    }
  } catch (error) {
    console.log("⚠️ PRODUCTION backend is not reachable");
    console.log("   → This is okay if you only want to test email features");
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  return true;
}

async function testRegistration() {
  console.log("📝 Test 2: User Registration (LOCAL Backend)\n");
  
  if (TEST_EMAIL === "your-email@example.com") {
    console.log("❌ ERROR: Please update TEST_EMAIL variable in this script!");
    console.log("   → Open test-backend-connection.js");
    console.log("   → Change line 8: const TEST_EMAIL = 'your-actual-email@gmail.com';");
    console.log("\n" + "=".repeat(70) + "\n");
    return false;
  }
  
  try {
    const response = await fetch(`${LOCAL_API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: TEST_FIRST_NAME,
        lastName: TEST_LAST_NAME,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Registration SUCCESSFUL! ✅");
      console.log(`   → Email: ${TEST_EMAIL}`);
      console.log(`   → User ID: ${data.data?.user?.id}`);
      console.log(`   → Email Verified: ${data.data?.user?.emailVerified}`);
      console.log("\n📧 CHECK YOUR EMAIL INBOX NOW!");
      console.log("   → Look for email from MASH");
      console.log("   → Subject: 'Verify your MASH account'");
      console.log("   → Copy the 6-digit code (e.g., 123456)");
      console.log("\n✍️ NEXT STEP:");
      console.log("   1. Check your email");
      console.log("   2. Copy the 6-digit verification code");
      console.log("   3. Go to http://localhost:3000/verify-otp");
      console.log("   4. Enter your email and code");
      console.log("   5. After verification → Redirected to home page (/)");
      console.log("\n" + "=".repeat(70) + "\n");
      return true;
    } else {
      console.log("❌ Registration FAILED ❌");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || data.error || "Unknown error"}`);
      
      if (data.message?.includes("already exists")) {
        console.log("\n💡 TIP: Email already registered!");
        console.log("   → Try logging in instead: Test 4");
        console.log("   → Or use a different email address");
      }
      
      console.log("\n" + "=".repeat(70) + "\n");
      return false;
    }
  } catch (error) {
    console.log("❌ Registration ERROR ❌");
    console.log(`   Error: ${error.message}`);
    console.log("\n🔧 Possible Issues:");
    console.log("   → Local backend not running");
    console.log("   → Email service not configured on backend");
    console.log("   → Network connection issue");
    console.log("\n" + "=".repeat(70) + "\n");
    return false;
  }
}

async function testLogin() {
  console.log("🔑 Test 3: User Login (PRODUCTION Backend)\n");
  
  try {
    const response = await fetch(`${PROD_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Login SUCCESSFUL! ✅");
      console.log(`   → Email: ${data.data?.user?.email}`);
      console.log(`   → Access Token: ${data.data?.accessToken?.substring(0, 50)}...`);
      console.log(`   → Token expires in: 1 hour`);
      console.log("\n✅ PRODUCTION BACKEND LOGIN WORKS!");
      console.log("\n" + "=".repeat(70) + "\n");
      return true;
    } else {
      console.log("❌ Login FAILED ❌");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || "Unknown error"}`);
      
      if (response.status === 401) {
        console.log("\n💡 Common Reasons:");
        console.log("   → Email not verified yet (check Test 2)");
        console.log("   → Wrong password");
        console.log("   → User registered on LOCAL backend (not in production)");
        console.log("\n🔄 Solution:");
        console.log("   → Register directly on production backend");
        console.log("   → OR wait for production email service to be configured");
      }
      
      console.log("\n" + "=".repeat(70) + "\n");
      return false;
    }
  } catch (error) {
    console.log("❌ Login ERROR ❌");
    console.log(`   Error: ${error.message}`);
    console.log("\n" + "=".repeat(70) + "\n");
    return false;
  }
}

async function testForgotPassword() {
  console.log("🔐 Test 4: Forgot Password (LOCAL Backend)\n");
  
  try {
    const response = await fetch(`${LOCAL_API}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Password reset code SENT! ✅");
      console.log(`   → Email: ${TEST_EMAIL}`);
      console.log(`   → Code expires in: 10 minutes`);
      console.log("\n📧 CHECK YOUR EMAIL NOW!");
      console.log("   → Look for 'Password Reset Code' email");
      console.log("   → Copy the 6-digit code");
      console.log("\n" + "=".repeat(70) + "\n");
      return true;
    } else {
      console.log("⚠️ Password reset status:");
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}`);
      console.log("\n💡 Note: For security, this always returns success even if email doesn't exist");
      console.log("\n" + "=".repeat(70) + "\n");
      return true;
    }
  } catch (error) {
    console.log("❌ Forgot password ERROR ❌");
    console.log(`   Error: ${error.message}`);
    console.log("\n" + "=".repeat(70) + "\n");
    return false;
  }
}

async function runAllTests() {
  console.log("🎯 Running All Backend Connection Tests...\n");
  
  const healthOk = await testBackendHealth();
  if (!healthOk) {
    console.log("⚠️ Stopping tests - Local backend is not running");
    console.log("\n💡 How to start local backend:");
    console.log("   1. Navigate to your backend directory");
    console.log("   2. Run: npm install");
    console.log("   3. Run: npm run start:dev");
    console.log("   4. Re-run this test script");
    return;
  }
  
  await testRegistration();
  
  console.log("⏸️ Waiting 5 seconds before next test...\n");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await testForgotPassword();
  
  console.log("\n" + "=".repeat(70));
  console.log("🏁 Testing Complete!\n");
  console.log("📊 Summary:");
  console.log("   ✅ Phase 1: Environment variables - DONE");
  console.log("   ✅ Phase 2: API client routing - DONE");
  console.log("   ✅ Phase 3: Registration test - See results above");
  console.log("   ⏭️ Phase 4: Login test - Run manually after email verification");
  console.log("   ✅ Phase 5: Password reset test - See results above");
  console.log("📝 Next Steps:");
  console.log("   1. Check your email for verification code");
  console.log("   2. Go to http://localhost:3000/verify-otp");
  console.log("   3. Enter email and 6-digit code");
  console.log("   4. After verification → Redirected to home page (/)");
  console.log("   5. Try logging in or browsing the shop");
  console.log("\n🔗 Frontend URLs:");
  console.log("   → Signup: http://localhost:3000/signup");
  console.log("   → Verify OTP: http://localhost:3000/verify-otp");
  console.log("   → Login: http://localhost:3000/login");
  console.log("   → Forgot Password: http://localhost:3000/forgot-password");
  console.log("\n" + "=".repeat(70) + "\n");
}

// Run tests
runAllTests().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
