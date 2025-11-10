"use client";

import { ServerOrderBoard } from "@/components/server/ServerOrderBoard";
import { useEffect, useState } from "react";

// Default tenant ID for development/testing
const DEFAULT_TENANT_ID = "11111111-1111-1111-1111-111111111111";

export default function ServerPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get tenant ID from localStorage, or use default for development
    const storedTenantId =
      localStorage.getItem("current_tenant_id") ||
      process.env.NEXT_PUBLIC_TENANT_ID ||
      DEFAULT_TENANT_ID;

    // Set it in localStorage if not already there
    if (!localStorage.getItem("current_tenant_id")) {
      localStorage.setItem("current_tenant_id", storedTenantId);
    }

    // Set a dummy auth token for development if not present
    if (!localStorage.getItem("auth_token")) {
      localStorage.setItem("auth_token", "dev-token-server-display");
    }

    setTenantId(storedTenantId);
    setIsReady(true);
  }, []);

  if (!isReady || !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Server Display System
          </h1>
          <p className="text-gray-600">Initializing...</p>
          <p className="text-sm text-gray-500 mt-2">
            Tenant ID: {tenantId || "loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <ServerOrderBoard tenantId={tenantId} />;
}
