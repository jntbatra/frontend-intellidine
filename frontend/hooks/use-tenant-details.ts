import { useQuery } from "@tanstack/react-query";
import {
  getTenantDetails,
  getCurrentTenantId,
  TenantData,
} from "@/lib/api/tenant";
import { useCallback } from "react";

/**
 * Hook to fetch and manage tenant details
 * @param tenantId - Optional tenant ID (uses current tenant if not provided)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Object with tenant data, loading state, and utility functions
 */
export function useTenantDetails(tenantId?: string, enabled: boolean = true) {
  const finalTenantId = tenantId || getCurrentTenantId();

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["tenant", finalTenantId],
    queryFn: async () => {
      if (!finalTenantId) {
        throw new Error("No tenant ID available");
      }
      return getTenantDetails(finalTenantId);
    },
    enabled: !!finalTenantId && enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Extract tenant data from the nested response structure
  const tenantData: TenantData | undefined = response?.data;

  const manualRefresh = useCallback(async () => {
    return refetch();
  }, [refetch]);

  return {
    tenantData,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : "Unknown error",
    refetch: manualRefresh,
    isRefetching,
    tenantId: finalTenantId,
  };
}

/**
 * Hook to get only the current tenant's details
 * @returns Object with tenant data and loading state
 */
export function useCurrentTenant() {
  return useTenantDetails();
}
