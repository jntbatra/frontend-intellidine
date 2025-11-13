import { apiClient, ApiResponse } from "@/lib/api/client";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "RAZORPAY";

export interface OrderItem {
  id: string;
  order_id?: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price?: string | number;
  price_at_order?: number;
  subtotal: string | number;
  special_requests?: string | null;
  special_instructions?: string | null;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: number;
  tenant_id?: string;
  table_id: string;
  customer_id?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status?: string;
  subtotal: number;
  discount_amount: number;
  discount_reason?: string;
  tax_amount: number;
  delivery_charge?: number;
  total: number;
  items: OrderItem[];
  special_instructions?: string;
  estimated_prep_time?: number;
  estimated_ready_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderListResponse {
  data: Order[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface OrderDetailResponse {
  id: string;
  order_number: number;
  tenant_id: string;
  table_id: string;
  customer_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_reason?: string;
  tax_amount: number;
  delivery_charge: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: string;
  special_instructions: string;
  created_at: string;
  estimated_prep_time: number;
  estimated_ready_at: string;
  notes: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface CancelOrderPayload {
  reason: string;
}

/**
 * Get all orders with pagination and filters
 * GET /api/orders?tenant_id={{tenant_id}}&limit=10&offset=0&include_items=true
 * Note: Only status works as query param, client-side filter for rest
 */
export async function getOrders(
  tenantId: string,
  limit: number = 10,
  offset: number = 0,
  status?: OrderStatus
): Promise<ApiResponse<OrderListResponse>> {
  let url = `/api/orders?tenant_id=${tenantId}&limit=${limit}&offset=${offset}&include_items=true`;
  if (status) url += `&status=${status}`;
  return apiClient.get<OrderListResponse>(url);
}

/**
 * Get single order by ID
 * GET /api/orders/{orderId}
 */
export async function getOrder(
  orderId: string
): Promise<ApiResponse<OrderDetailResponse>> {
  return apiClient.get<OrderDetailResponse>(`/api/orders/${orderId}`);
}

/**
 * Update order status
 * PATCH /api/orders/{orderId}/status
 */
export async function updateOrderStatus(
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<ApiResponse<Order>> {
  return apiClient.patch<Order>(`/api/orders/${orderId}/status`, payload);
}

/**
 * Cancel order
 * PATCH /api/orders/{orderId}/cancel
 */
export async function cancelOrder(
  orderId: string,
  payload: CancelOrderPayload
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch(`/api/orders/${orderId}/cancel`, payload);
}

