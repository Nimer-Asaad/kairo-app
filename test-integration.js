// Test script for Kairo AI Assistant API endpoints
// Run with: node test-integration.js

import fetch from "node-fetch";

const API_URL = "http://localhost:5000";
let authToken = null;

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, path, body = null) {
  log(`\n🧪 Testing: ${name}`, "blue");
  
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (authToken) {
    options.headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      log(`✅ ${name} - SUCCESS`, "green");
      log(`   Status: ${response.status}`);
      log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      return { success: true, data };
    } else {
      log(`❌ ${name} - FAILED`, "red");
      log(`   Status: ${response.status}`);
      log(`   Error: ${data.message || "Unknown error"}`);
      return { success: false, data };
    }
  } catch (error) {
    log(`❌ ${name} - ERROR`, "red");
    log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("═══════════════════════════════════════════", "yellow");
  log("  KAIRO AI ASSISTANT - INTEGRATION TESTS  ", "yellow");
  log("═══════════════════════════════════════════", "yellow");

  // Test 1: Server health check
  await testEndpoint("Server Health", "GET", "/");

  // Test 2: Login (you need valid credentials)
  log("\n⚠️  Note: Update credentials in this script for actual testing", "yellow");
  const loginResult = await testEndpoint("Login", "POST", "/auth/login", {
    email: "admin@kairo.com", // Update with valid credentials
    password: "password123",
  });

  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    log("   🔑 Token received and stored", "green");
  } else {
    log("\n⚠️  Cannot proceed without authentication token", "yellow");
    log("   Please update login credentials in the test script", "yellow");
    return;
  }

  // Test 3: Get local emails (should work even if empty)
  await testEndpoint(
    "Local Email Search",
    "GET",
    "/gmail/local/search?limit=5"
  );

  // Test 4: Sync emails (requires Gmail connection)
  await testEndpoint("Gmail Sync", "POST", "/gmail/sync-local", {
    maxResults: 10,
  });

  // Test 5: AI Chat - General query
  await testEndpoint("AI Chat - General", "POST", "/ai/chat", {
    message: "show me all emails",
  });

  // Test 6: AI Chat - CV search
  await testEndpoint("AI Chat - CV Search", "POST", "/ai/chat", {
    message: "show me CVs for software engineer",
    jobRequirements: "Python, React, 3+ years experience",
  });

  // Test 7: Filtered search
  await testEndpoint(
    "Filtered Search",
    "GET",
    "/gmail/local/search?hasAttachments=true&limit=5"
  );

  // Summary
  log("\n═══════════════════════════════════════════", "yellow");
  log("           TESTS COMPLETED                  ", "yellow");
  log("═══════════════════════════════════════════", "yellow");
  log("\n📝 Notes:", "blue");
  log("   - Update login credentials for full testing");
  log("   - Ensure Gmail is connected for sync tests");
  log("   - Some tests may fail if no data exists yet");
  log("   - Check backend logs for detailed errors\n");
}

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Test suite crashed: ${error.message}`, "red");
  process.exit(1);
});
