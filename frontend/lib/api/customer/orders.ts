import type { OrderStatus } from "@/lib/api/admin/orders";

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price_at_order: number;
  subtotal: number;
  special_instructions?: string | null;
  created_at: string;
}

export interface CustomerOrder {
  id: string;
  order_number: number;
  tenant_id: string;
  table_id: string;
  customer_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount_amount?: number;
  discount_reason?: string;
  discount_percent?: number;
  tax_amount: number;
  delivery_charge?: number;
  total: number;
  payment_method: "cash" | "card" | "upi" | "wallet";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  special_instructions?: string;
  created_at: string;
  estimated_prep_time?: number;
  estimated_ready_at?: string;
  notes?: string;
}

export interface MyOrdersResponse {
  data: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface MyOrdersParams {
  tenant_id: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch customer's past orders
 * GET /api/customers/my-orders
 */
export async function fetchCustomerOrders(
  params: MyOrdersParams
): Promise<MyOrdersResponse> {
  const queryParams = new URLSearchParams({
    tenant_id: params.tenant_id,
    limit: String(params.limit || 20),
    offset: String(params.offset || 0),
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/customers/my-orders?${queryParams.toString()}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch customer orders: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data;
}
