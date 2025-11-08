"use client";

import { useState, useCallback } from "react";

export function useOrders(initialOrders: any[]) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<any[]>(initialOrders);

  const filterOrders = useCallback(
    (
      status?: string,
      searchTerm?: string,
      paymentMethod?: string
    ) => {
      let filtered = [...orders];

      if (status && status !== "all") {
        filtered = filtered.filter((order) => order.status === status);
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            order.customer_name.toLowerCase().includes(term) ||
            order.order_number.toString().includes(term) ||
            order.id.toLowerCase().includes(term)
        );
      }

      if (paymentMethod && paymentMethod !== "all") {
        filtered = filtered.filter(
          (order) => order.payment_method === paymentMethod
        );
      }

      setFilteredOrders(filtered);
    },
    [orders]
  );

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    setFilteredOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const updateOrderStatus = useCallback((id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
    setFilteredOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  return {
    orders,
    filteredOrders,
    filterOrders,
    deleteOrder,
    updateOrderStatus,
  };
}
