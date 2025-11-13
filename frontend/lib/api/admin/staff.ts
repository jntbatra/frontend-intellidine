import { apiClient, ApiResponse } from "@/lib/api/client";

export type StaffRole = "MANAGER" | "KITCHEN_STAFF" | "WAITER" | "ACCOUNTANT" | "STAFF";
export type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface StaffMember {
  id: string;
  tenant_id?: string;
  username: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status?: StaffStatus;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffPayload {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: StaffRole;
  tenant_id?: string;
}

export interface UpdateStaffPayload {
  email?: string;
  phone?: string;
  role?: StaffRole;
  status?: StaffStatus;
  tenant_id?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  tenant_id?: string;
}

export interface StaffListResponse {
  status?: string;
  staff: StaffMember[];
  data?: StaffMember[];
  total: number;
  limit: number;
  offset?: number;
  [key: string]: unknown;
}

/**
 * Get all staff members with pagination and filters
 * Backend: GET /api/auth/staff?limit=20&offset=0&tenant_id=...&role=MANAGER&search=john
 */
export async function getStaffList(
  tenantId: string,
  role?: StaffRole,
  search?: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<StaffListResponse>> {
  let url = `/api/auth/staff?limit=${limit}&offset=${offset}&tenant_id=${tenantId}`;
  if (role) url += `&role=${role}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiClient.get<StaffListResponse>(url);
}

/**
 * Get single staff member by ID
 * Backend: GET /api/auth/staff/{staff_id}
 */
export async function getStaffMember(
  staffId: string
): Promise<ApiResponse<StaffMember>> {
  return apiClient.get<StaffMember>(`/api/auth/staff/${staffId}`);
}

/**
 * Create new staff member
 * Backend: POST /api/auth/staff
 */
export async function createStaff(
  payload: CreateStaffPayload,
  tenantId?: string
): Promise<ApiResponse<StaffMember>> {
  const body = { ...payload };
  if (tenantId) {
    body.tenant_id = tenantId;
  }
  return apiClient.post<StaffMember>(`/api/auth/staff`, body);
}

/**
 * Update staff member details
 * Backend: PATCH /api/auth/staff/{staff_id}?tenant_id=...
 */
export async function updateStaff(
  staffId: string,
  payload: UpdateStaffPayload,
  tenantId?: string
): Promise<ApiResponse<StaffMember>> {
  // Don't send tenant_id in body - only in query params
  const cleanPayload = {
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    status: payload.status,
  };
  
  let url = `/api/auth/staff/${staffId}`;
  if (tenantId) {
    url += `?tenant_id=${tenantId}`;
  }
  return apiClient.patch<StaffMember>(url, cleanPayload);
}

/**
 * Delete (soft delete) staff member
 * Backend: DELETE /api/auth/staff/{staff_id}
 */
export async function deleteStaff(
  staffId: string,
  tenantId?: string
): Promise<ApiResponse<{ message: string }>> {
  let url = `/api/auth/staff/${staffId}`;
  if (tenantId) {
    url += `?tenant_id=${tenantId}`;
  }
  return apiClient.delete(url);
}

/**
 * Change staff member password
 * Backend: POST /api/auth/staff/{staff_id}/change-password
 */
export async function changeStaffPassword(
  staffId: string,
  payload: ChangePasswordPayload,
  tenantId?: string
): Promise<ApiResponse<{ message: string }>> {
  const body = { ...payload };
  if (tenantId) {
    body.tenant_id = tenantId;
  }
  return apiClient.post(
    `/api/auth/staff/${staffId}/change-password`,
    body
  );
}
