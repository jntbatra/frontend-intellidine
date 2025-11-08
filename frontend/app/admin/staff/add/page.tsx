"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffForm, StaffFormData } from "@/components/admin/forms/StaffForm";
import { useEffect, useState } from "react";

export default function AddStaffPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get tenant_id from localStorage
    const stored = localStorage.getItem("current_tenant_id") || localStorage.getItem("tenant_id");
    if (stored) {
      setTenantId(stored);
    }
  }, []);

  const handleSubmit = async (data: StaffFormData) => {
    if (!tenantId) {
      throw new Error("Tenant ID not found");
    }

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Generate mock staff ID
      const newStaffId = `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the submission (for demo purposes)
      console.log("✅ Staff member added successfully:", {
        id: newStaffId,
        ...data,
        tenant_id: tenantId,
      });
      
      // Show success feedback and redirect
      router.push("/admin/staff");
    } catch (error) {
      console.error("Failed to add staff:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Staff Member</h1>
        <p className="text-slate-600 mt-2">Create a new staff member account for your restaurant</p>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Staff Information</CardTitle>
          <CardDescription>
            Enter the staff member details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="add"
          />
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Username:</strong> Used for login - should be unique and memorable</p>
          <p>• <strong>Role:</strong> Determines access level and permissions within the system</p>
          <p>• <strong>Password:</strong> Must contain uppercase letters and numbers for security</p>
          <p>• <strong>Email:</strong> Used for notifications and recovery</p>
        </CardContent>
      </Card>
    </div>
  );
}
