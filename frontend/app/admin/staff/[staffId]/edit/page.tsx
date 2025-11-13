"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaffForm, StaffFormData } from "@/components/admin/forms/StaffForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StaffMember, getStaffMember, updateStaff, StaffRole } from "@/lib/api/admin/staff";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.staffId as string;

  const [staffData, setStaffData] = useState<StaffFormData | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff member details
  useEffect(() => {
    if (!staffId) return;

    const fetchStaffData = async () => {
      try {
        setIsLoadingStaff(true);
        
        // Call real API
        const response = await getStaffMember(staffId as string);
        
        // Handle nested response: response.data.data contains the staff member
        const responseData = response.data as unknown as Record<string, unknown>;
        const staff = responseData?.data as StaffMember | undefined;
        
        if (staff) {
          setStaffData({
            username: staff.username,
            email: staff.email,
            phone: staff.phone,
            role: (staff.role || "STAFF") as StaffRole,
            is_active: staff.is_active,
          });
        } else {
          setError("Staff member not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load staff member");
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchStaffData();
  }, [staffId]);

  const handleSubmit = async (data: StaffFormData) => {
    try {
      setIsUpdating(true);
      
      // Get tenant_id from localStorage
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      
      // Prepare update payload - only send updatable fields (NOT tenant_id, it goes in query)
      const updatePayload = {
        email: data.email,
        phone: data.phone,
        role: data.role as StaffRole,
      };
      
      // Call real API - tenant_id passed as parameter
      const response = await updateStaff(staffId as string, updatePayload, tenantId);
      
      if (response) {
        console.log("✅ Staff member updated successfully");
        router.push("/admin/staff");
      }
    } catch (error) {
      console.error("Failed to update staff:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Staff Member</h1>
          <p className="text-slate-600 mt-2">Update staff member details and permissions</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingStaff ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center gap-2 text-slate-600 py-12">
            <Loader2 className="animate-spin" size={20} />
            Loading staff member details...
          </CardContent>
        </Card>
      ) : staffData ? (
        <>
          {/* Form Card */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Staff Information</CardTitle>
              <CardDescription>
                Update the staff member details below. Email and password cannot be changed here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffForm 
                onSubmit={handleSubmit}
                isLoading={isUpdating}
                initialData={staffData}
                mode="edit"
              />
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p>• <strong>ID:</strong> {staffId}</p>
              <p>• To change password or email, please contact system administrator</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
