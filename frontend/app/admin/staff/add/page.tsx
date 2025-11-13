"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffForm, StaffFormData } from "@/components/admin/forms/StaffForm";
import { useState } from "react";
import { createStaff, StaffRole } from "@/lib/api/admin/staff";

export default function AddStaffPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: StaffFormData) => {
    try {
      setIsLoading(true);
      
      // Get tenant_id from localStorage
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      
      // Prepare create payload
      const createPayload = {
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password || "",
        role: data.role as StaffRole,
        tenant_id: tenantId,
      };
      
      // Call real API
      const response = await createStaff(createPayload, tenantId);
      
      if (response) {
        console.log("✅ Staff member added successfully");
        // Show success feedback and redirect
        router.push("/admin/staff");
      }
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
