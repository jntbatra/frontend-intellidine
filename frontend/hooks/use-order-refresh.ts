"use client";

import { useEffect, useCallback } from "react";

interface UseOrderRefreshOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export function useOrderRefresh(
  fetchFunction: () => Promise<void> | void,
  options: UseOrderRefreshOptions = {}
) {
  const { refreshInterval = 12000, enabled = true } = options;

  const refreshOrders = useCallback(async () => {
    if (enabled) {
      try {
        await fetchFunction();
      } catch (error) {
        console.error("Failed to refresh orders:", error);
      }
    }
  }, [fetchFunction, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial load
    refreshOrders();

    // Set up periodic refresh
    const interval = setInterval(refreshOrders, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshOrders, refreshInterval, enabled]);

  // Return the refresh function for manual refreshes
  return refreshOrders;
}
