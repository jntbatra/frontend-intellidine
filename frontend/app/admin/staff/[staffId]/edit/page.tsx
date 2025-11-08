"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaffForm, StaffFormData } from "@/components/admin/forms/StaffForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StaffMember } from "@/lib/api/admin/staff";

// Mock data inline
const MOCK_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    username: "raj_kitchen",
    email: "raj@spiceroute.com",
    phone: "9876543210",
    role: "KITCHEN_STAFF",
    is_active: true,
    tenant_id: "11111111-1111-1111-1111-111111111111",
    created_at: "2024-10-15T10:30:00Z",
    updated_at: "2024-11-01T08:00:00Z",
  },
  {
    id: "staff-2",
    username: "priya_manager",
    email: "priya@spiceroute.com",
    phone: "9876543211",
    role: "MANAGER",
    is_active: true,
    tenant_id: "11111111-1111-1111-1111-111111111111",
    created_at: "2024-09-20T14:15:00Z",
    updated_at: "2024-11-05T09:45:00Z",
  },
  {
    id: "staff-3",
    username: "amit_waiter",
    email: "amit@spiceroute.com",
    phone: "9876543212",
    role: "WAITER",
    is_active: true,
    tenant_id: "11111111-1111-1111-1111-111111111111",
    created_at: "2024-10-01T11:20:00Z",
    updated_at: "2024-11-03T07:30:00Z",
  },
  {
    id: "staff-4",
    username: "deepak_staff",
    email: "deepak@spiceroute.com",
    phone: "9876543213",
    role: "STAFF",
    is_active: false,
    tenant_id: "11111111-1111-1111-1111-111111111111",
    created_at: "2024-08-10T09:00:00Z",
    updated_at: "2024-10-28T16:20:00Z",
  },
  {
    id: "staff-5",
    username: "neha_kitchen",
    email: "neha@spiceroute.com",
    phone: "9876543214",
    role: "KITCHEN_STAFF",
    is_active: true,
    tenant_id: "11111111-1111-1111-1111-111111111111",
    created_at: "2024-10-22T13:45:00Z",
    updated_at: "2024-11-02T10:15:00Z",
  },
];

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.staffId as string;

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<StaffFormData | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant_id from localStorage
  useEffect(() => {
    const stored =
      localStorage.getItem("current_tenant_id") ||
      localStorage.getItem("tenant_id");
    if (stored) {
      setTenantId(stored);
    }
  }, []);

  // Fetch staff member details
  useEffect(() => {
    if (!staffId) return;

    const fetchStaffData = async () => {
      try {
        setIsLoadingStaff(true);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Find staff from mock data
        const staff = MOCK_STAFF.find((s) => s.id === staffId);
        
        if (staff) {
          setStaffData({
            username: staff.username,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
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
    if (!tenantId) {
      throw new Error("Tenant ID not found");
    }

    try {
      setIsUpdating(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Log the submission (for demo purposes)
      console.log("✅ Staff member updated successfully:", {
        id: staffId,
        ...data,
        tenant_id: tenantId,
      });

      router.push("/admin/staff");
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
