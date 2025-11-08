"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenuItems,
  getMenuItem,
  getMenuCategories,
  createMenuItem,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem,
  MenuItem,
  MenuCategory,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
} from "@/lib/api/admin/menu";

export function useMenuCategories(tenantId: string) {
  return useQuery({
    queryKey: ["menu-categories", tenantId],
    queryFn: async () => {
      const response = await getMenuCategories(tenantId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch categories");
      }
      return response.data as MenuCategory[];
    },
    enabled: !!tenantId,
  });
}

export function useMenuItems(tenantId: string, category?: string) {
  return useQuery({
    queryKey: ["menu-items", tenantId, category],
    queryFn: async () => {
      const response = await getMenuItems(tenantId, category);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch menu items");
      }
      return response.data as MenuItem[];
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
    onSuccess: (response, variables) => {
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
    }) => updateMenuItemAvailability(itemId, isAvailable, tenantId),
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
    mutationFn: ({
      itemId,
      tenantId,
    }: {
      itemId: string;
      tenantId: string;
    }) => deleteMenuItem(itemId, tenantId),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["menu-items", variables.tenantId],
        });
      }
    },
  });
}
