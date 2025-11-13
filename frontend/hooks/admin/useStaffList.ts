import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStaffList, deleteStaff, StaffRole, StaffMember } from "@/lib/api/admin/staff";

interface UseStaffListOptions {
  tenantId: string;
  role?: StaffRole;
  search?: string;
  limit?: number;
  offset?: number;
}

interface StaffListData {
  staff: StaffMember[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Hook to fetch staff list with React Query
 * Handles data extraction from nested API response
 */
export function useStaffList({
  tenantId,
  role,
  search,
  limit = 20,
  offset = 0,
}: UseStaffListOptions) {
  const queryClient = useQueryClient();

  // Query for fetching staff list
  const query = useQuery({
    queryKey: ["staff", tenantId, role, search, limit, offset],
    queryFn: async () => {
      const response = await getStaffList(tenantId, role, search, limit, offset);

      // Handle nested response structure: response.data.data
      const responseData = response.data as unknown as Record<string, unknown>;
      const innerData = responseData?.data as Record<string, unknown>;

      const staffData = Array.isArray((innerData as Record<string, unknown>).staff)
        ? (innerData as Record<string, unknown>).staff as StaffMember[]
        : [];

      return {
        staff: staffData,
        total: Number((innerData as Record<string, unknown>).total) || 0,
        limit: Number((innerData as Record<string, unknown>).limit) || limit,
        offset: Number((innerData as Record<string, unknown>).offset) || offset,
      } as StaffListData;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for deleting staff
  const deleteMutation = useMutation({
    mutationFn: async (staffId: string) => {
      return deleteStaff(staffId);
    },
    onSuccess: () => {
      // Invalidate the staff list query to refetch
      queryClient.invalidateQueries({
        queryKey: ["staff", tenantId],
      });
    },
  });

  return {
    ...query,
    data: query.data || { staff: [], total: 0, limit, offset },
    deleteStaff: async (staffId: string) => {
      await deleteMutation.mutateAsync(staffId);
    },
    isDeletingStaff: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
