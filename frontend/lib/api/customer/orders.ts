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

  console.log("Query params:", queryParams.toString()); // Debug logging
  console.log(
    "Request URL:",
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/customers/my-orders?${queryParams.toString()}`
  ); // Debug logging

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("auth_token");
  console.log("Auth token exists:", !!token); // Debug logging
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

  console.log("[fetchCustomerOrders] URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/customers/my-orders?${queryParams.toString()}`);
  console.log("[fetchCustomerOrders] Headers:", headers);
  console.log("[fetchCustomerOrders] Response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log("[fetchCustomerOrders] Error response:", errorText);
    throw new Error(
      `Failed to fetch customer orders: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log("Raw API Response:", data); // Debug logging

  // Handle different possible response structures
  let result: MyOrdersResponse;

  if (
    data.data &&
    typeof data.data === "object" &&
    "data" in data.data &&
    Array.isArray(data.data.data)
  ) {
    // Structure: { data: { data: [...], total: 1, ... }, meta: {...} }
    result = data.data;
    console.log("Using nested structure:", result);
  } else if (data.data && Array.isArray(data.data)) {
    // Structure: { data: [...], total: 1, ... }
    result = data;
    console.log("Using direct structure:", result);
  } else if (Array.isArray(data)) {
    // Structure: [...] (just the orders array)
    result = {
      data: data,
      total: data.length,
      page: 1,
      limit: data.length,
    };
    console.log("Using array structure:", result);
  } else {
    console.error("Unexpected API response structure:", data);
    throw new Error(
      `Unexpected API response structure: ${JSON.stringify(data)}`
    );
  }

  console.log("Final parsed result:", result);

  // Normalize the data to match the interface
  const normalizedResult: MyOrdersResponse = {
    ...result,
    data: result.data.map((order) => ({
      ...order,
      status: order.status.toLowerCase() as OrderStatus,
      payment_method: order.payment_method.toLowerCase() as
        | "cash"
        | "card"
        | "upi"
        | "wallet",
      payment_status: order.payment_status?.toLowerCase() as
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | undefined,
    })),
  };

  console.log("Normalized result:", normalizedResult);
  return normalizedResult;
}
