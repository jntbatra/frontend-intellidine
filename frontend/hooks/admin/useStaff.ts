"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
} from "@/lib/api/admin/staff";

export function useStaffList(tenantId: string) {
  return useQuery({
    queryKey: ["staff", tenantId],
    queryFn: async () => {
      const response = await getStaffList(tenantId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch staff");
      }
      return response.data as StaffMember[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["staff", variables.tenant_id],
        });
      }
    },
  });
}

export function useUpdateStaff(tenantId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      staffId,
      payload,
    }: {
      staffId: string;
      payload: UpdateStaffPayload;
    }) => updateStaff(staffId, payload, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff", tenantId],
      });
    },
  });
}

export function useDeleteStaff(tenantId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (staffId: string) => deleteStaff(staffId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff", tenantId],
      });
    },
  });
}
