import { apiClient, ApiResponse } from "@/lib/api/client";

export interface MenuItem {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  category_id?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_available: boolean;
  stock_level?: number;
  stock_status?: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  preparation_time: number;
  preparation_time_minutes?: number;
  dietary_tags?: string[];
  discount_percentage?: number;
  reorder_level?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  icon_url?: string;
  items: MenuItem[];
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
  cost_price?: number;
  category: string;
  is_vegetarian?: boolean;
  preparation_time?: number;
  image_url?: string;
  available?: boolean;
  reorder_level?: number;
  dietary_tags?: string[];
  tenant_id: string;
}

export interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  category?: string;
  is_vegetarian?: boolean;
  preparation_time?: number;
  image_url?: string;
  is_available?: boolean;
  stock_status?: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  reorder_level?: number;
  dietary_tags?: string[];
  tenant_id?: string;
}

export interface MenuResponse {
  categories: MenuCategory[];
  items?: MenuItem[];
  data?: MenuItem[];
  total?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

/**
 * Get menu with categories and items
 * GET /api/menu?tenant_id={{tenant_id}}&limit=20&offset=0
 */
export async function getMenuWithCategories(
  tenantId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<MenuResponse>> {
  const url = `/api/menu?tenant_id=${tenantId}&limit=${limit}&offset=${offset}`;
  return apiClient.get<MenuResponse>(url);
}

/**
 * Delete menu item
 * DELETE /api/menu/items/{itemId}
 */
export async function deleteMenuItem(
  itemId: string,
  tenantId?: string
): Promise<ApiResponse<{ message: string }>> {
  let url = `/api/menu/items/${itemId}`;
  if (tenantId) {
    url += `?tenant_id=${tenantId}`;
  }
  return apiClient.delete(url);
}

/**
 * Update menu item (toggle availability or full edit)
 * PATCH /api/menu/items/{itemId}
 */
export async function updateMenuItem(
  itemId: string,
  payload: UpdateMenuItemPayload,
  tenantId?: string
): Promise<ApiResponse<MenuItem>> {
  let url = `/api/menu/items/${itemId}`;
  if (tenantId) {
    url += `?tenant_id=${tenantId}`;
  }
  return apiClient.patch<MenuItem>(url, payload);
}

/**
 * Get single menu item
 * GET /api/menu/items/{itemId}?tenant_id={{tenant_id}}
 */
export async function getMenuItem(
  itemId: string,
  tenantId: string
): Promise<ApiResponse<MenuItem>> {
  return apiClient.get<MenuItem>(`/api/menu/items/${itemId}?tenant_id=${tenantId}`);
}

/**
 * Create menu item
 * POST /api/menu/items
 */
export async function createMenuItem(
  payload: CreateMenuItemPayload
): Promise<ApiResponse<MenuItem>> {
  return apiClient.post<MenuItem>(`/api/menu/items`, payload);
}