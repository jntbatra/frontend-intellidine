"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenuWithCategories,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  MenuItem,
  MenuCategory,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
} from "@/lib/api/admin/menu";
import { ApiResponse } from "@/lib/api/client";

export function useMenuCategories(tenantId: string) {
  return useQuery({
    queryKey: ["menu-categories", tenantId],
    queryFn: async () => {
      const response = await getMenuWithCategories(tenantId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch categories");
      }
      const data = response.data as { categories?: MenuCategory[] };
      return (data.categories || []) as MenuCategory[];
    },
    enabled: !!tenantId,
  });
}

export function useMenuItems(tenantId: string, category?: string) {
  return useQuery({
    queryKey: ["menu-items", tenantId, category],
    queryFn: async () => {
      const response = await getMenuWithCategories(tenantId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch menu items");
      }
      const data = response.data as { items?: MenuItem[]; data?: MenuItem[] };
      return (data.items || data.data || []) as MenuItem[];
    },
    enabled: !!tenantId,
  });
}

export function useMenuItemDetail(itemId: string, tenantId: string) {
  return useQuery({
    queryKey: ["menu-item", itemId, tenantId],
    queryFn: async () => {
      const response = await getMenuItem(itemId, tenantId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch menu item");
      }
      return response.data as MenuItem;
    },
    enabled: !!itemId && !!tenantId,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => createMenuItem(payload),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["menu-items", variables.tenant_id],
        });
      }
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
      tenantId,
    }: {
      itemId: string;
      payload: UpdateMenuItemPayload;
      tenantId: string;
    }) => updateMenuItem(itemId, payload, tenantId),
    onSuccess: (response: ApiResponse<MenuItem>, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["menu-items", variables.tenantId],
        });
        queryClient.invalidateQueries({
          queryKey: ["menu-item", variables.itemId],
        });
      }
    },
  });
}

export function useUpdateMenuItemAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      isAvailable,
      tenantId,
    }: {
      itemId: string;
      isAvailable: boolean;
      tenantId: string;
    }) => updateMenuItem(itemId, { is_available: isAvailable }, tenantId),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["menu-items", variables.tenantId],
        });
      }
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, tenantId }: { itemId: string; tenantId: string }) =>
      deleteMenuItem(itemId, tenantId),
    onSuccess: (response: ApiResponse<{ message: string }>, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["menu-items", variables.tenantId],
        });
      }
    },
  });
}
