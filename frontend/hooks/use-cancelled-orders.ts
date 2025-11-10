import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api/client";

/**
 * Order Item structure
 */
interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name?: string;
  item_name?: string;
  quantity: number;
  price_at_order?: number;
  unit_price?: string;
  subtotal?: number;
  special_instructions?: string;
  special_requests?: string;
  created_at: string;
}

/**
 * Order structure with support for both uppercase and lowercase status
 */
export interface CancelledOrder {
  id: string;
  order_number: string;
  table_id: string;
  tenant_id: string;
  items?: OrderItem[];
  status: "cancelled" | "CANCELLED";
  total_amount?: number;
  total?: number;
  subtotal?: number;
  tax_amount?: number;
  created_at: string;
  updated_at: string;
  special_instructions?: string;
}

/**
 * API Response structure
 */
interface ApiResponse {
  data: unknown;
  success?: boolean;
}

/**
 * Custom hook for managing cancelled orders with auto-refresh
 *
 * Features:
 * - Auto-refresh every 15 seconds (configurable)
 * - Manual refresh capability
 * - Toggle auto-refresh on/off
 * - Automatic status case handling (lowercase/uppercase)
 * - Error handling with fallback
 * - TanStack React Query integration
 *
 * @param tenantId - The tenant ID to fetch orders for
 * @param enabled - Whether the hook is enabled (default: true)
 * @returns Object with orders, loading states, and control functions
 */
export function useCancelledOrders(tenantId: string, enabled = true) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const AUTO_REFRESH_INTERVAL = 15000; // 15 seconds
  const QUERY_KEY = ["cancelled-orders", tenantId];

  /**
   * Fetch cancelled orders from API
   */
  const fetchCancelledOrders = useCallback(async (): Promise<
    CancelledOrder[]
  > => {
    try {
      console.log("📥 Fetching cancelled orders...");

      const response = (await apiClient.get(`/api/orders`, {
        limit: "100",
        offset: "0",
        tenant_id: tenantId,
        status: "CANCELLED",
        include_items: "true",
      })) as ApiResponse;

      let allOrders: CancelledOrder[] = [];

      // Handle direct array response
      if (response?.data && Array.isArray(response.data)) {
        allOrders = response.data as CancelledOrder[];
      }
      // Handle wrapped response (data.data)
      else if (response?.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (Array.isArray(data.data)) {
          allOrders = data.data as CancelledOrder[];
        }
      }

      // Filter for cancelled status (handle both cases)
      const cancelledOrders = allOrders.filter(
        (o) => o.status === "cancelled" || o.status === "CANCELLED"
      );

      console.log(`📦 Fetched ${allOrders.length} total orders`);
      console.log(`🗑️ Found ${cancelledOrders.length} cancelled orders`);

      return cancelledOrders;
    } catch (error) {
      console.error("❌ Error fetching cancelled orders:", error);
      throw error;
    }
  }, [tenantId]);

  /**
   * Query hook using TanStack React Query
   */
  const ordersQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCancelledOrders,
    enabled,
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL : false,
    staleTime: 5000, // 5 seconds
    retry: 2,
    retryDelay: 1000,
  });

  /**
   * Toggle auto-refresh on/off
   */
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => {
      const newState = !prev;
      console.log(`${newState ? "▶️ Resuming" : "⏸️ Pausing"} auto-refresh`);
      return newState;
    });
  }, []);

  /**
   * Manual refresh
   */
  const manualRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    ordersQuery.refetch();
  }, [ordersQuery]);

  return {
    // Data
    orders: ordersQuery.data || [],

    // Loading states
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,

    // Refresh control
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,

    // Query object for advanced usage
    query: ordersQuery,
  };
}
