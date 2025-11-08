export interface InventoryItem {
  id: string;
  tenant_id: string;
  menu_item_id: string;
  menu_item_name: string;
  current_stock: number;
  minimum_threshold: number;
  maximum_capacity: number;
  unit: string;
  last_restocked: string;
  reorder_quantity: number;
  supplier?: string;
  cost_per_unit: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockAdjustment {
  id: string;
  inventory_item_id: string;
  adjustment_type: "in" | "out" | "damage" | "adjustment";
  quantity: number;
  reason: string;
  notes?: string;
  adjusted_by: string;
  created_at: string;
}

export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  menu_item_id: string;
  menu_item_name: string;
  current_stock: number;
  minimum_threshold: number;
  alert_type: "low_stock" | "overstock" | "expired_soon";
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
  resolved_at?: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_count: number;
  overstock_count: number;
  total_inventory_value: number;
  alert_count: number;
}
