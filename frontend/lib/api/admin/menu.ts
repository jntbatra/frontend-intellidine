import { apiClient } from "@/lib/api/client";

export interface MenuItem {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_vegetarian: boolean;
  is_available: boolean;
  preparation_time_minutes: number;
  allergens?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  icon_url?: string;
  item_count: number;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  is_required: boolean;
  options: {
    name: string;
    price_modifier: number;
  }[];
}

export interface CreateMenuItemPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  is_vegetarian: boolean;
  preparation_time_minutes: number;
  image_url?: string;
  variants?: MenuItemVariant[];
  allergens?: string[];
  tags?: string[];
  tenant_id: string;
}

export interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  is_vegetarian?: boolean;
  preparation_time_minutes?: number;
  image_url?: string;
  variants?: MenuItemVariant[];
  allergens?: string[];
  tags?: string[];
}

// Get all categories
export async function getMenuCategories(tenantId: string) {
  const response = await apiClient.get(
    `/api/menu/categories?tenant_id=${tenantId}`
  );
  return response;
}

// Get all menu items
export async function getMenuItems(tenantId: string, category?: string) {
  let url = `/api/menu/items?tenant_id=${tenantId}`;
  if (category) {
    url += `&category=${category}`;
  }
  const response = await apiClient.get(url);
  return response;
}

// Get single menu item
export async function getMenuItem(itemId: string, tenantId: string) {
  const response = await apiClient.get(
    `/api/menu/items/${itemId}?tenant_id=${tenantId}`
  );
  return response;
}

// Create menu item
export async function createMenuItem(payload: CreateMenuItemPayload) {
  const response = await apiClient.post("/api/menu/items", payload);
  return response;
}

// Update menu item
export async function updateMenuItem(
  itemId: string,
  payload: UpdateMenuItemPayload,
  tenantId: string
) {
  const response = await apiClient.put(`/api/menu/items/${itemId}`, {
    ...payload,
    tenant_id: tenantId,
  });
  return response;
}

// Update item availability
export async function updateMenuItemAvailability(
  itemId: string,
  isAvailable: boolean,
  tenantId: string
) {
  const response = await apiClient.patch(
    `/api/menu/items/${itemId}/availability`,
    {
      is_available: isAvailable,
      tenant_id: tenantId,
    }
  );
  return response;
}

// Delete menu item
export async function deleteMenuItem(itemId: string, tenantId: string) {
  const response = await apiClient.delete(
    `/api/menu/items/${itemId}?tenant_id=${tenantId}`
  );
  return response;
}
