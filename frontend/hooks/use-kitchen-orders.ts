import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  fetchKitchenOrders,
  updateOrderStatus,
  cancelOrder,
  getKitchenStats,
  type KitchenOrdersParams,
} from "@/lib/api/kitchen";
import type { Order, OrderStatus } from "@/lib/api/admin/orders";
import { toast } from "sonner";

const KITCHEN_ORDERS_QUERY_KEY = ["kitchen-orders"];
const KITCHEN_STATS_QUERY_KEY = ["kitchen-stats"];
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds (changed from 15 seconds)

/**
 * Custom hook for kitchen order management
 *
 * Integrates with IntelliDine API endpoints:
 * - GET /api/orders - Fetch orders by tenant_id
 * - PATCH /api/orders/{id}/status - Update order status
 * - PATCH /api/orders/{id}/cancel - Cancel order
 *
 * Features:
 * - Auto-refresh with configurable interval (15s default)
 * - Optimistic cache updates
 * - Real-time error handling
 * - Toast notifications for user feedback
 */
export function useKitchenOrders(tenantId: string, enabled = true) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const params: KitchenOrdersParams = {
    tenant_id: tenantId,
    limit: 50,
    offset: 0,
  };

  // Fetch orders from Order Service: GET /api/orders
  const ordersQuery = useQuery({
    queryKey: [...KITCHEN_ORDERS_QUERY_KEY, tenantId],
    queryFn: () => fetchKitchenOrders(params),
    enabled,
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL : false,
    staleTime: 5000, // 5 seconds
  });

  // Update order status mutation: PATCH /api/orders/{id}/status
  const updateStatusMutation = useMutation({
    mutationFn: async (variables: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(variables.orderId, variables.status),
    onSuccess: () => {
      // Refetch orders after update
      ordersQuery.refetch();
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
      toast.error(message);
    },
  });

  // Cancel order mutation: PATCH /api/orders/{id}/cancel
  const cancelOrderMutation = useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => cancelOrder(orderId, reason),
    onSuccess: () => {
      // Refetch orders after cancellation
      ordersQuery.refetch();
      toast.success("Order cancelled");
    },
    onError: (error: Error) => {
      const message =
        error instanceof Error ? error.message : "Failed to cancel order";
      toast.error(message);
    },
  });

  // Fetch kitchen statistics
  const statsQuery = useQuery({
    queryKey: [...KITCHEN_STATS_QUERY_KEY, tenantId],
    queryFn: () => getKitchenStats(tenantId),
    enabled,
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL : false,
    staleTime: 5000,
  });

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  // Manual refresh
  const manualRefresh = useCallback(() => {
    ordersQuery.refetch();
    statsQuery.refetch();
  }, [ordersQuery, statsQuery]);

  // Lazy refresh with delay (useful for cart updates, etc.)
  // Triggers refresh after specified delay in milliseconds
  const lazyRefresh = useCallback(
    (delayMs: number = 2000) => {
      const timeoutId = setTimeout(() => {
        ordersQuery.refetch();
        statsQuery.refetch();
      }, delayMs);

      // Return function to cancel the lazy refresh if needed
      return () => clearTimeout(timeoutId);
    },
    [ordersQuery, statsQuery]
  );

  return {
    // Order data
    orders: ordersQuery.data?.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,

    // Status update
    updateOrderStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,

    // Order cancellation
    cancelOrder: cancelOrderMutation.mutate,
    isCancelling: cancelOrderMutation.isPending,

    // Kitchen statistics
    stats: statsQuery.data?.data,
    statsLoading: statsQuery.isLoading,

    // Refresh control
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
    lazyRefresh,
  };
}

/**
 * Group orders by status for display
 * Used to organize orders into three columns: Pending, Preparing, Ready
 */
export function groupOrdersByStatus(orders: Order[] | undefined) {
  if (!orders || !Array.isArray(orders)) {
    return {
      pending: [],
      preparing: [],
      ready: [],
    };
  }
  return {
    pending: orders.filter((o) => o.status === "pending"),
    preparing: orders.filter((o) => o.status === "in_preparation"),
    ready: orders.filter((o) => o.status === "ready"),
  };
}

/**
 * Calculate time elapsed since order creation
 * Displays as: "Now", "5m", "2h", etc.
 */
export function getTimeElapsed(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  return `${hours}h`;
}

/**
 * Extract table number from table_id string
 * Handles various ID formats (e.g., "table_5" → "5", "T5" → "5")
 */
export function getTableNumber(tableId: string): string {
  const match = tableId.match(/\d+$/);
  return match ? match[0] : tableId;
}
