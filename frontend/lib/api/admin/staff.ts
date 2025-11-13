/* eslint-disable @typescript-eslint/no-unused-vars */

import { apiClient } from "@/lib/api/client";

export interface StaffMember {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: "MANAGER" | "KITCHEN_STAFF" | "WAITER" | "STAFF";
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffPayload {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  tenant_id: string;
}

export interface UpdateStaffPayload {
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}

// Get all staff members
export async function getStaffList(tenantId: string) {
  const response = await apiClient.get(`/api/users?tenant_id=${tenantId}`);
  return response;
}

// Get single staff member
export async function getStaffMember(staffId: string, tenantId: string) {
  const response = await apiClient.get(
    `/api/users/${staffId}?tenant_id=${tenantId}`
  );
  return response;
}

// Create staff member
export async function createStaff(payload: CreateStaffPayload) {
  const response = await apiClient.post("/api/users", payload);
  return response;
}

// Update staff member
export async function updateStaff(
  staffId: string,
  payload: UpdateStaffPayload,
  tenantId: string
) {
  const response = await apiClient.put(`/api/users/${staffId}`, {
    ...payload,
    tenant_id: tenantId,
  });
  return response;
}

// Delete staff member
export async function deleteStaff(staffId: string, tenantId: string) {
  const response = await apiClient.delete(`/api/users/${staffId}`);
  return response;
}
