import { apiClient, ApiResponse } from "@/lib/api/client";

export interface InventoryItem {
  id: string;
  tenant_id: string;
  item_name: string;
  category?: string;
  quantity?: number;
  current_stock?: number;
  unit?: string;
  reorder_level?: number;
  minimum_threshold?: number;
  maximum_capacity?: number;
  cost_price?: number;
  cost_per_unit?: number;
  supplier?: string;
  expiry_date?: string;
  is_low_stock?: boolean;
  last_restocked?: string;
  last_checked?: string;
  created_at: string;
  updated_at: string;
}

export interface StockAdjustment {
  id: string;
  inventory_item_id: string;
  item_id?: string;
  adjustment_type: "in" | "out" | "damage" | "adjustment";
  type?: "in" | "out";
  quantity: number;
  reason: string;
  notes?: string;
  adjusted_by?: string;
  created_at: string;
}

export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  inventory_id?: string;
  menu_item_id?: string;
  menu_item_name?: string;
  current_quantity?: number;
  current_stock?: number;
  minimum_threshold?: number;
  reorder_level?: number;
  alert_type?: "low_stock" | "overstock" | "expired_soon" | "warning" | "critical";
  alert_status?: "WARNING" | "CRITICAL";
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
  resolved_at?: string;
  updated_at?: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  low_stock_count?: number;
  out_of_stock_items?: number;
  overstock_count?: number;
  total_inventory_value?: number;
  total_value?: number;
  warning_alerts: number;
  critical_alerts: number;
  alert_count?: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  data?: InventoryItem[];
  total: number;
  limit: number;
  offset?: number;
}

// Get all inventory items
export async function getInventoryItems(
  tenantId: string,
  category?: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<InventoryListResponse>> {
  let url = `/api/inventory/items?tenant_id=${tenantId}&limit=${limit}&offset=${offset}`;
  if (category) url += `&category=${category}`;
  return apiClient.get<InventoryListResponse>(url);
}

// Get single inventory item
export async function getInventoryItem(
  itemId: string
): Promise<ApiResponse<InventoryItem>> {
  return apiClient.get<InventoryItem>(`/api/inventory/items/${itemId}`);
}

// Create inventory item
export async function createInventoryItem(
  payload: Partial<InventoryItem>,
  tenantId: string
): Promise<ApiResponse<InventoryItem>> {
  return apiClient.post<InventoryItem>(
    `/api/inventory/items?tenant_id=${tenantId}`,
    payload
  );
}

// Update inventory item
export async function updateInventoryItem(
  itemId: string,
  payload: Partial<InventoryItem>,
  tenantId: string
): Promise<ApiResponse<InventoryItem>> {
  return apiClient.patch<InventoryItem>(
    `/api/inventory/items/${itemId}?tenant_id=${tenantId}`,
    payload
  );
}

// Deduct inventory (for orders)
export async function deductInventory(
  inventoryId: string,
  quantity: number,
  tenantId: string
): Promise<ApiResponse<InventoryItem>> {
  return apiClient.patch(
    `/api/inventory/deduct?tenant_id=${tenantId}`,
    { inventory_id: inventoryId, quantity }
  );
}

// Adjust stock (in/out)
export async function adjustInventoryStock(
  inventoryId: string,
  adjustment: StockAdjustment,
  tenantId: string
): Promise<ApiResponse<InventoryItem>> {
  return apiClient.patch(
    `/api/inventory/adjust?tenant_id=${tenantId}`,
    { inventory_id: inventoryId, ...adjustment }
  );
}

// Get low stock alerts
export async function getLowStockAlerts(
  tenantId: string
): Promise<ApiResponse<{ alerts: InventoryAlert[]; total_alerts: number; critical: number }>> {
  return apiClient.get(`/api/inventory/alerts?tenant_id=${tenantId}`);
}

// Get inventory statistics
export async function getInventoryStats(
  tenantId: string
): Promise<ApiResponse<{ data: InventoryStats }>> {
  return apiClient.get(`/api/inventory/stats?tenant_id=${tenantId}`);
}
