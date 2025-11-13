/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test API Connection
 * Run this in browser console to debug API connectivity
 */

export async function testKitchenAPI() {
  const API_URL = "https://intellidine-api.aahil-khan.tech";
  const TENANT_ID = "11111111-1111-1111-1111-111111111111";
  const DEV_TOKEN = "dev-token-kitchen-display";

  console.log("🧪 Starting Kitchen API Tests...");
  console.log("━".repeat(60));

  // Test 1: Check API connectivity
  console.log("\n1️⃣ Testing API Connectivity...");
  try {
    const healthResponse = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("   Status:", healthResponse.status);
    console.log("   OK:", healthResponse.ok);
    const healthData = await healthResponse.json();
    console.log("   Response:", healthData);
  } catch (error) {
    console.error("   ❌ Failed:", error);
  }

  // Test 2: GET /api/orders without auth
  console.log("\n2️⃣ Testing GET /api/orders WITHOUT Authentication...");
  try {
    const ordersResponse = await fetch(
      `${API_URL}/api/orders?tenant_id=${TENANT_ID}&limit=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("   Status:", ordersResponse.status);
    console.log("   OK:", ordersResponse.ok);
    const ordersData = await ordersResponse.json();
    console.log("   Response:", ordersData);
  } catch (error) {
    console.error("   ❌ Failed:", error);
  }

  // Test 3: GET /api/orders WITH auth token
  console.log("\n3️⃣ Testing GET /api/orders WITH Authentication...");
  try {
    const ordersResponse = await fetch(
      `${API_URL}/api/orders?tenant_id=${TENANT_ID}&limit=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEV_TOKEN}`,
          "X-Tenant-ID": TENANT_ID,
        },
      }
    );
    console.log("   Status:", ordersResponse.status);
    console.log("   OK:", ordersResponse.ok);
    const ordersData = await ordersResponse.json();
    console.log("   Response:", ordersData);
    if (
      ordersResponse.ok &&
      ordersData.data &&
      Array.isArray(ordersData.data)
    ) {
      console.log(`   ✅ Success! Got ${ordersData.data.length} orders`);
    }
  } catch (error) {
    console.error("   ❌ Failed:", error);
  }

  // Test 4: Check localStorage
  console.log("\n4️⃣ Checking localStorage...");
  console.log("   auth_token:", localStorage.getItem("auth_token"));
  console.log(
    "   current_tenant_id:",
    localStorage.getItem("current_tenant_id")
  );

  console.log("\n" + "━".repeat(60));
  console.log("✅ Test complete! Check results above.\n");
}

// Auto-run on import in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).testKitchenAPI = testKitchenAPI;
  console.log("💡 Run testKitchenAPI() in console to test API connection");
}
