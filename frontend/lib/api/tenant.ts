import { apiClient, ApiResponse } from "./client";

/**
 * Tenant data structure - matches backend response
 */
export interface TenantData {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  owner_email?: string;
  operating_hours?: {
    mon_fri?: string;
    sat_sun?: string;
    [key: string]: string | undefined;
  };
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | Record<string, unknown>;
}

/**
 * Tenant API Response wrapper
 */
export interface TenantApiResponse {
  success: boolean;
  data: TenantData;
}

/**
 * Extended API Response for tenant details
 */
export interface TenantResponse extends ApiResponse<TenantApiResponse> {
  data?: TenantApiResponse;
}

/**
 * Get tenant details by ID
 * @param tenantId - The tenant ID
 * @returns Promise with tenant details
 */
export async function getTenantDetails(
  tenantId: string
): Promise<TenantApiResponse> {
  try {
    console.log(`📋 Fetching tenant details for: ${tenantId}`);

    // The apiClient returns: { success, data, message, error }
    // And the data contains: { success, data: TenantData }
    const response = await apiClient.get<TenantApiResponse>(
      `/tenants/${tenantId}`
    );

    console.log("✅ API Response:", response);
    console.log("✅ Response data:", response.data);

    // Handle nested response structure
    if (response.data) {
      // If response.data is already a TenantApiResponse with success and data fields
      if ("success" in response.data && "data" in response.data) {
        console.log("✅ Returning nested data structure:", response.data);
        return response.data as TenantApiResponse;
      }
      // If response.data is the TenantData directly
      if ("id" in response.data && "name" in response.data) {
        console.log("✅ Returning as TenantApiResponse wrapper");
        return {
          success: true,
          data: response.data as TenantData,
        };
      }
    }

    console.error("⚠️ Unexpected response structure:", response);
    throw new Error("Invalid response structure");
  } catch (error) {
    console.error("❌ Error fetching tenant details:", error);
    throw error;
  }
}

/**
 * Get current tenant details from localStorage
 * @returns Tenant ID from localStorage or null
 */
export function getCurrentTenantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("current_tenant_id");
}

/**
 * Get current tenant details
 * @returns Promise with current tenant details
 */
export async function getCurrentTenantDetails(): Promise<TenantApiResponse> {
  const tenantId = getCurrentTenantId();

  if (!tenantId) {
    throw new Error("No tenant ID found in localStorage");
  }

  return getTenantDetails(tenantId);
}

/**
 * Set current tenant ID in localStorage
 * @param tenantId - The tenant ID to set
 */
export function setCurrentTenantId(tenantId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("current_tenant_id", tenantId);
  }
}

/**
 * Cache tenant details in localStorage
 * @param tenantId - The tenant ID
 * @param tenantDetails - The tenant details to cache
 */
export function cacheTenantDetails(
  tenantId: string,
  tenantDetails: TenantData
): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      `tenant_details_${tenantId}`,
      JSON.stringify(tenantDetails)
    );
  }
}

/**
 * Get cached tenant details from localStorage
 * @param tenantId - The tenant ID
 * @returns Cached tenant details or null
 */
export function getCachedTenantDetails(tenantId: string): TenantData | null {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem(`tenant_details_${tenantId}`);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

/**
 * Get tenant details with caching
 * @param tenantId - The tenant ID
 * @param useCache - Whether to use cached data (default: true)
 * @returns Promise with tenant details
 */
export async function getTenantDetailsWithCache(
  tenantId: string,
  useCache: boolean = true
): Promise<TenantData> {
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedTenantDetails(tenantId);
    if (cached) {
      console.log("📦 Using cached tenant details");
      return cached;
    }
  }

  // Fetch from API
  const response = await getTenantDetails(tenantId);

  if (response.data) {
    // Cache the result
    cacheTenantDetails(tenantId, response.data);
    return response.data;
  }

  throw new Error("Failed to fetch tenant details");
}

/**
 * Clear cached tenant details
 * @param tenantId - The tenant ID (if not provided, clears all tenant caches)
 */
export function clearTenantCache(tenantId?: string): void {
  if (typeof window === "undefined") return;

  if (tenantId) {
    localStorage.removeItem(`tenant_details_${tenantId}`);
  } else {
    // Clear all tenant caches
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("tenant_details_")) {
        localStorage.removeItem(key);
      }
    });
  }
}
