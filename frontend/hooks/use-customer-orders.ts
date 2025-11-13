"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  fetchCustomerOrders,
  type MyOrdersParams,
} from "@/lib/api/customer/orders";

const CUSTOMER_ORDERS_QUERY_KEY = ["customer-orders"];

export interface UseCustomerOrdersOptions {
  enabled?: boolean;
  limit?: number;
}

/**
 * Custom hook for managing customer's past orders
 *
 * Integrates with IntelliDine API endpoint:
 * - GET /api/customers/my-orders - Fetch customer's order history
 *
 * Features:
 * - Pagination support
 * - Status filtering
 * - Automatic refetch on demand
 * - Real-time error handling
 */
export function useCustomerOrders(
  tenantId: string,
  options: UseCustomerOrdersOptions = {}
) {
  const { enabled = true, limit = 20 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const params: MyOrdersParams = {
    tenant_id: tenantId,
    limit,
    offset: (currentPage - 1) * limit,
  };

  // Fetch customer orders
  const ordersQuery = useQuery({
    queryKey: [...CUSTOMER_ORDERS_QUERY_KEY, tenantId, currentPage, limit],
    queryFn: () => fetchCustomerOrders(params),
    enabled: enabled && !!tenantId,
    staleTime: 30000, // 30 seconds
  });

  console.log("Orders Query Data:", ordersQuery.data); // Debug logging
  console.log("Orders:", ordersQuery.data?.data); // Debug logging

  // Manual refetch
  const refetch = useCallback(() => {
    ordersQuery.refetch();
  }, [ordersQuery]);

  // Go to next page
  const goToNextPage = useCallback(() => {
    if (ordersQuery.data && currentPage * limit < ordersQuery.data.total) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [ordersQuery.data, currentPage, limit]);

  // Go to previous page
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Reset to first page
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    orders: ordersQuery.data?.data || [],
    total: ordersQuery.data?.total || 0,
    page: currentPage,
    limit,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage * limit < (ordersQuery.data?.total || 0),
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Get status badge color
 */
export function getOrderStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status.toLowerCase()) {
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
      };
    case "in_preparation":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
      };
    case "ready":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
      };
    case "served":
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-300",
      };
    case "completed":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
      };
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
      };
  }
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    in_preparation: "Preparing",
    ready: "Ready",
    served: "Served",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[status.toLowerCase()] || status;
}
