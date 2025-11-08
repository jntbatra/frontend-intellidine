"use client";

import { useEffect } from "react";
import { MOCK_AUTH_DATA } from "@/lib/constants/mockAuth";

export function AuthInitializer() {
  useEffect(() => {
    // Initialize mock auth data on mount
    const { access_token, user } = MOCK_AUTH_DATA.data;

    // Set token in localStorage
    if (access_token) {
      localStorage.setItem("auth_token", access_token);
    }

    // Set user data
    if (user) {
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("staff_role", user.role);
      localStorage.setItem("current_tenant_id", user.tenant_id);
      localStorage.setItem("tenant_id", user.tenant_id);
    }

    // Set expiration time
    if (MOCK_AUTH_DATA.data.expires_at) {
      localStorage.setItem("auth_expires_at", MOCK_AUTH_DATA.data.expires_at);
    }

    console.log("✅ Mock auth data initialized");
    console.log("🔑 Token:", access_token.substring(0, 50) + "...");
    console.log("👤 User:", user.username, `(${user.role})`);
    console.log("🏢 Tenant ID:", user.tenant_id);
  }, []);

  return null;
}
