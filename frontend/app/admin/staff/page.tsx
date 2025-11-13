"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { StaffTable } from "@/components/admin/tables/StaffTable";
import { StaffRole, getStaffList, deleteStaff as deleteStaffApi, StaffMember } from "@/lib/api/admin/staff";

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tenantId, setTenantId] = useState<string>("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load tenant ID from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
    setTenantId(stored);
  }, []);

  // Fetch staff list
  useEffect(() => {
    if (!tenantId) return;

    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getStaffList(
          tenantId,
          roleFilter !== "all" ? (roleFilter as StaffRole) : undefined,
          searchQuery || undefined
        );
        // Handle nested response: response.data.data.staff
        const responseData = response.data as unknown as Record<string, unknown>;
        const innerData = responseData?.data as Record<string, unknown> | undefined;
        const staffList = (innerData?.staff as StaffMember[]) || [];
        console.log("✅ Staff loaded:", staffList.length, staffList);
        setStaff(staffList);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError(err instanceof Error ? err.message : "Failed to load staff");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [tenantId, roleFilter, searchQuery]);

  // Handle delete staff
  const handleDeleteStaff = async (staffId: string) => {
    try {
      setIsDeleting(true);
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      await deleteStaffApi(staffId, tenantId);
      // Remove from local state
      setStaff(staff.filter((s) => s.id !== staffId));
    } catch (err) {
      console.error("Failed to delete staff:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter staff based on search and role
  const filteredStaff = staff;

  // Calculate stats
  const activeStaff = filteredStaff.filter((s) => s.is_active).length;
  const roles = [...new Set(filteredStaff.map((s) => s.role))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage all staff members and their roles
          </p>
        </div>
        <Link href="/admin/staff/add">
          <Button className="gap-2">
            <Plus size={18} />
            Add Staff Member
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {filteredStaff.length}
                </div>
                <p className="text-sm text-slate-600">Total Staff</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {activeStaff}
                </div>
                <p className="text-sm text-slate-600">Active</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {roles.length}
                </div>
                <p className="text-sm text-slate-600">Roles</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {filteredStaff.filter((s) => !s.is_active).length}
                </div>
                <p className="text-sm text-slate-600">Inactive</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="KITCHEN_STAFF">Kitchen Staff</SelectItem>
                <SelectItem value="WAITER">Waiter</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Staff Members
            <span className="text-sm font-normal text-slate-600 ml-2">
              {isLoading ? "..." : `(${filteredStaff.length})`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3"></div>
                  </div>
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : !error ? (
            <StaffTable
              staff={filteredStaff}
              onDelete={handleDeleteStaff}
              isDeleting={isDeleting}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
