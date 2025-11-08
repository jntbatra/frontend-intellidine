export type OrderStatus = "pending" | "in_preparation" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  table_id: string;
  customer_name: string;
  order_number: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: "cash" | "card" | "upi" | "wallet";
  notes?: string;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
  tenant_id?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}
