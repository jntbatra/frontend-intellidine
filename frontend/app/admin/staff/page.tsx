"use client";

import { useState } from "react";
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
import { StaffMember } from "@/lib/api/admin/staff";
import { MOCK_STAFF } from "@/lib/constants/mockStaff";

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter staff based on search and role
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || staff.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (staffId: string) => {
    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Remove from local state
      setStaffList(staffList.filter((s) => s.id !== staffId));
      console.log("Staff member deleted successfully");
    } catch (error) {
      console.error("Failed to delete staff:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
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
              ({filteredStaff.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaffTable
            staff={filteredStaff}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
