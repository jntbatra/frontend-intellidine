"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiClient, setAuthToken } from "@/lib/api/client";

export default function StaffLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/kitchen";

  const [username, setUsername] = useState(
    process.env.NEXT_PUBLIC_STAFF_USERNAME || ""
  );
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_STAFF_PASSWORD || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      type StaffLoginResp = {
        access_token?: string;
        token?: string;
        role?: string;
        tenant_id?: string;
        user?: { role?: string; tenant_id?: string };
      };

      const resp = await apiClient.post("/api/auth/staff/login", {
        username: username.trim(),
        password,
      });

      // Handle different response formats
      let data: StaffLoginResp;
      if (resp.success && resp.data) {
        // Standard API response format
        data = resp.data as StaffLoginResp;
      } else if (resp.data && typeof resp.data === "object") {
        // Direct data response format
        data = resp.data as StaffLoginResp;
      } else {
        throw new Error("Invalid response format");
      }

      const token = data?.access_token || data?.token;
      const role = data?.role || data?.user?.role || "STAFF";
      const tenantId = data?.tenant_id || data?.user?.tenant_id;

      if (token) {
        setAuthToken(token);
        // Save role and tenant context
        if (role) localStorage.setItem("staff_role", role);
        if (tenantId) localStorage.setItem("current_tenant_id", tenantId);

        // Redirect based on role
        if (role && role.toLowerCase().includes("manager")) {
          router.push("/admin");
        } else {
          router.push(redirectTo || "/kitchen");
        }
      } else {
        throw new Error("No access token returned");
      }
    } catch (err: unknown) {
      console.error("Staff login failed:", err);
      let message = "Login failed";
      if (err && typeof err === "object" && err !== null && "message" in err) {
        const e = err as { message?: unknown };
        if (typeof e.message === "string") message = e.message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Staff Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
