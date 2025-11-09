import { apiClient, ApiResponse } from "./client";
import type { Order, OrderStatus } from "./admin/orders";
import { MOCK_ORDERS } from "@/lib/constants/mockOrders";

// Raw API response structure from backend - order items
interface RawOrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  special_requests: string | null;
}

// Raw API response structure from backend
interface RawOrderResponse {
  id: string;
  order_number: number;
  table_id: string;
  customer_id: string;
  tenant_id: string;
  status: string; // API returns uppercase: READY, PENDING, PREPARING, COMPLETED
  subtotal: number;
  discount_amount: number;
  discount_reason: string;
  tax_amount: number;
  total: number;
  created_at: string;
  estimated_ready_at: string;
  items: RawOrderItem[];
}

/**
 * Map backend API status to frontend status
 * Backend uses: PENDING, PREPARING, READY, SERVED, COMPLETED, CANCELLED
 * Frontend uses: pending, in_preparation, ready, served, completed, cancelled
 */
function mapBackendStatusToFrontend(backendStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    PENDING: "pending",
    PREPARING: "in_preparation",
    READY: "ready",
    SERVED: "served",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  return statusMap[backendStatus.toUpperCase()] || "pending";
}

/**
 * Map frontend status to backend API status
 * Frontend uses: pending, in_preparation, ready, served, completed, cancelled
 * Backend uses: PENDING, PREPARING, READY, SERVED, COMPLETED, CANCELLED
 */
function mapFrontendStatusToBackend(frontendStatus: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: "PENDING",
    in_preparation: "PREPARING",
    ready: "READY",
    served: "SERVED",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return statusMap[frontendStatus];
}

export interface KitchenOrdersParams {
  tenant_id: string;
  limit?: number;
  offset?: number;
  include_items?: boolean;
  status?: string; // Filter by status: pending, in_preparation, ready, completed, cancelled
}

/**
 * Fetch orders for kitchen display
 * API Endpoint: GET /api/orders
 * Base URL: https://intellidine-api.aahil-khan.tech
 *
 * This uses the Order Service endpoint to retrieve orders filtered by tenant_id.
 * The endpoint supports pagination and filtering by status.
 *
 * @param params - Query parameters for order retrieval
 * @returns Promise with array of orders
 */
export async function fetchKitchenOrders(
  params: KitchenOrdersParams
): Promise<ApiResponse<Order[]>> {
  const { tenant_id, limit = 50, offset = 0, status } = params;

  // Build query parameters based on api.json specification
  const queryParams = new URLSearchParams({
    tenant_id,
    limit: String(limit),
    offset: String(offset),
    include_items: "true", // Ensure API returns items with each order
  });

  // Optional status filter for specific order statuses
  if (status) {
    queryParams.append("status", status);
  }

  try {
    // Call Order Service endpoint: GET /api/orders
    console.log(
      "📡 Fetching orders from API:",
      `/api/orders?${queryParams.toString()}`
    );
    const response = await apiClient.get<Order[]>(
      `/api/orders?${queryParams.toString()}`
    );

    console.log("✅ API Response received:", response);

    let orders: Order[] = [];

    // The API returns: { data: [...], total: 43, page: 1, limit: 100 }
    // response itself is the ApiResponse wrapper, so response.data contains the actual response
    const responseData = response.data as unknown as Record<string, unknown>;

    if (!responseData) {
      throw new Error(`Invalid API response: no data returned from server`);
    }

    // Log raw response structure for debugging
    console.log(
      "📋 Raw response data structure:",
      JSON.stringify(responseData, null, 2)
    );

    // Helper function to map API response to Order type
    const mapRawOrderToOrder = (rawOrder: RawOrderResponse): Order => {
      console.log(`🔍 Mapping order #${rawOrder.order_number}`);
      console.log(`   Raw items field type: ${typeof rawOrder.items}`);
      console.log(`   Raw items:`, rawOrder.items);

      // Map raw order items to OrderItem format
      const items = (
        rawOrder.items && Array.isArray(rawOrder.items) ? rawOrder.items : []
      ).map((rawItem: RawOrderItem) => {
        const mappedItem = {
          id: rawItem.id,
          name: rawItem.menu_item_name,
          quantity: rawItem.quantity,
          price: parseFloat(String(rawItem.unit_price)),
          total: parseFloat(String(rawItem.subtotal)),
          special_instructions: rawItem.special_requests || undefined,
        };
        console.log(
          `   ✓ Mapped item: ${mappedItem.name} x${mappedItem.quantity} @ ₹${mappedItem.price}`
        );
        return mappedItem;
      });

      console.log(
        `📦 Order #${rawOrder.order_number} has ${items.length} items total`
      );
      if (items.length === 0) {
        console.warn(
          `⚠️  Warning: Order #${rawOrder.order_number} has no items!`
        );
      }

      return {
        id: rawOrder.id,
        tenant_id: rawOrder.tenant_id,
        table_id: rawOrder.table_id,
        customer_name: `Table ${rawOrder.table_id}`,
        order_number: rawOrder.order_number,
        items,
        subtotal: rawOrder.subtotal,
        tax: rawOrder.tax_amount,
        total_amount: rawOrder.total,
        status: mapBackendStatusToFrontend(rawOrder.status),
        payment_method: "cash",
        notes: undefined,
        created_at: rawOrder.created_at,
        completed_at: null,
        updated_at: rawOrder.created_at,
      };
    };

    // Handle response with data array at top level: { data: [...], total, page, limit }
    if (
      responseData &&
      typeof responseData === "object" &&
      responseData.data &&
      Array.isArray(responseData.data)
    ) {
      // Map API response to Order type, normalizing status to lowercase
      const rawOrders = responseData.data as RawOrderResponse[];
      console.log(`📋 Found ${rawOrders.length} raw orders in .data array`);
      console.log("   First raw order:", JSON.stringify(rawOrders[0], null, 2));

      orders = rawOrders.map(mapRawOrderToOrder);
      console.log(
        `📦 Received ${orders.length} orders from API (paginated structure)`
      );
      console.log("📋 Sample order after mapping:", orders[0]);
      return { success: true, data: orders };
    }

    // Handle direct array response
    if (Array.isArray(responseData)) {
      const rawOrders = responseData as RawOrderResponse[];
      console.log(`📋 Found ${rawOrders.length} raw orders in direct array`);
      console.log("   First raw order:", JSON.stringify(rawOrders[0], null, 2));

      orders = rawOrders.map(mapRawOrderToOrder);
      console.log(
        `📦 Received ${orders.length} orders from API (direct array)`
      );
      return { success: true, data: orders };
    }

    // Handle orders property
    if (responseData.orders && Array.isArray(responseData.orders)) {
      const rawOrders = responseData.orders as RawOrderResponse[];
      console.log(
        `📋 Found ${rawOrders.length} raw orders in .orders property`
      );
      console.log("   First raw order:", JSON.stringify(rawOrders[0], null, 2));

      orders = rawOrders.map(mapRawOrderToOrder);
      console.log(
        `📦 Received ${orders.length} orders from API (orders property)`
      );
      return { success: true, data: orders };
    }

    // If we got here but have data, something's wrong with structure
    console.warn(
      "⚠️ API returned data but couldn't extract orders array:",
      responseData
    );
    throw new Error(
      `Invalid API response format. Could not extract orders array from: ${JSON.stringify(
        responseData
      ).substring(0, 200)}`
    );
  } catch (error) {
    console.error("❌ Error fetching kitchen orders from API:", error);

    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
    }

    // Fallback to mock data
    console.warn("🔄 Falling back to mock orders for testing...");
    return {
      success: true,
      data: MOCK_ORDERS.filter(
        (o) =>
          o.status === "pending" ||
          o.status === "in_preparation" ||
          o.status === "ready"
      ),
    };
  }
}

/**
 * Fetch specific order details
 * API Endpoint: GET /api/orders/{id}
 *
 * @param orderId - The order ID to fetch
 * @param tenantId - The tenant ID (for header)
 * @returns Promise with order details
 */
export async function fetchOrderDetails(
  orderId: string,
  tenantId: string
): Promise<ApiResponse<Order>> {
  try {
    const response = await apiClient.get<Order>(
      `/api/orders/${orderId}?tenant_id=${tenantId}`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Update order status
 * API Endpoint: PATCH /api/orders/{id}/status
 *
 * This endpoint updates the order status and is used for transitioning
 * orders through the kitchen workflow: pending → in_preparation → ready → completed
 *
 * Backend expects: PENDING, PREPARING, READY, COMPLETED, CANCELLED
 * Frontend uses: pending, in_preparation, ready, completed, cancelled
 *
 * @param orderId - The order ID to update
 * @param status - The new status for the order (frontend format)
 * @returns Promise with updated order
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  try {
    // Convert frontend status to backend status
    const backendStatus = mapFrontendStatusToBackend(status);

    console.log(`📝 Updating order ${orderId}: ${status} → ${backendStatus}`);

    // Call Order Service endpoint: PATCH /api/orders/{id}/status
    const response = await apiClient.patch<Order>(
      `/api/orders/${orderId}/status`,
      { status: backendStatus }
    );
    return response;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
}

/**
 * Mark order as in preparation
 * Transitions order from "pending" to "in_preparation"
 *
 * @param orderId - The order ID
 * @returns Promise with updated order
 */
export async function prepareOrder(
  orderId: string
): Promise<ApiResponse<Order>> {
  return updateOrderStatus(orderId, "in_preparation");
}

/**
 * Mark order as ready
 * Transitions order from "in_preparation" to "ready"
 *
 * @param orderId - The order ID
 * @returns Promise with updated order
 */
export async function readyOrder(orderId: string): Promise<ApiResponse<Order>> {
  return updateOrderStatus(orderId, "ready");
}

/**
 * Mark order as completed
 * Transitions order from "ready" to "completed"
 *
 * @param orderId - The order ID
 * @returns Promise with updated order
 */
export async function completeOrder(
  orderId: string
): Promise<ApiResponse<Order>> {
  return updateOrderStatus(orderId, "completed");
}

/**
 * Cancel order
 * API Endpoint: PATCH /api/orders/{id}/cancel
 *
 * @param orderId - The order ID to cancel
 * @param reason - Reason for cancellation
 * @returns Promise with cancelled order
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<ApiResponse<Order>> {
  try {
    console.log(`🗑️ Cancelling order ${orderId}`);
    console.log(`📝 Reason: ${reason}`);

    const response = await apiClient.patch<Order>(
      `/api/orders/${orderId}/cancel`,
      { reason }
    );

    console.log(`✅ Order cancelled successfully:`, response);
    return response;
  } catch (error) {
    console.error(`❌ Error cancelling order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Get kitchen statistics
 * Useful for kitchen staff dashboard
 *
 * @param tenantId - The tenant ID
 * @returns Summary of kitchen order metrics
 */
export interface KitchenStats {
  total_pending: number;
  total_preparing: number;
  total_ready: number;
  average_prep_time: number;
  oldest_order_age: number;
}

export async function getKitchenStats(
  tenantId: string
): Promise<ApiResponse<KitchenStats>> {
  try {
    const response = await fetchKitchenOrders({
      tenant_id: tenantId,
      limit: 1000,
      offset: 0,
    });

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch orders for stats");
    }

    const orders = response.data;
    const now = new Date();

    // Calculate statistics from orders
    const stats: KitchenStats = {
      total_pending: orders.filter((o) => o.status === "pending").length,
      total_preparing: orders.filter((o) => o.status === "in_preparation")
        .length,
      total_ready: orders.filter((o) => o.status === "ready").length,
      average_prep_time:
        orders.length > 0
          ? Math.round(
              orders.reduce((sum, o) => {
                const createdAt = new Date(o.created_at);
                return sum + (now.getTime() - createdAt.getTime());
              }, 0) /
                orders.length /
                1000 /
                60
            )
          : 0,
      oldest_order_age:
        orders.length > 0
          ? Math.round(
              (now.getTime() -
                new Date(orders[orders.length - 1].created_at).getTime()) /
                1000 /
                60
            )
          : 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error calculating kitchen stats:", error);
    throw error;
  }
}
