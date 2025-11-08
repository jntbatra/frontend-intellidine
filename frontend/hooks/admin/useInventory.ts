"use client";

import { useState, useCallback } from "react";

export function useInventory(initialItems: any[]) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [filteredItems, setFilteredItems] = useState<any[]>(initialItems);

  const filterItems = useCallback(
    (searchTerm?: string, stockStatus?: string) => {
      let filtered = [...items];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.menu_item_name.toLowerCase().includes(term) ||
            item.id.toLowerCase().includes(term) ||
            item.supplier?.toLowerCase().includes(term)
        );
      }

      if (stockStatus && stockStatus !== "all") {
        if (stockStatus === "low_stock") {
          filtered = filtered.filter((item) => item.is_low_stock);
        } else if (stockStatus === "normal") {
          filtered = filtered.filter((item) => !item.is_low_stock);
        }
      }

      setFilteredItems(filtered);
    },
    [items]
  );

  const updateStock = useCallback((id: string, newStock: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              current_stock: newStock,
              is_low_stock: newStock < item.minimum_threshold,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
    setFilteredItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              current_stock: newStock,
              is_low_stock: newStock < item.minimum_threshold,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const adjustStock = useCallback(
    (id: string, quantity: number, adjustmentType: "in" | "out") => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newStock =
        adjustmentType === "in"
          ? item.current_stock + quantity
          : item.current_stock - quantity;

      if (newStock < 0) {
        console.warn("Cannot reduce stock below 0");
        return;
      }

      updateStock(id, newStock);
    },
    [items, updateStock]
  );

  const updateThreshold = useCallback((id: string, newThreshold: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              minimum_threshold: newThreshold,
              is_low_stock: item.current_stock < newThreshold,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
    setFilteredItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              minimum_threshold: newThreshold,
              is_low_stock: item.current_stock < newThreshold,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  return {
    items,
    filteredItems,
    filterItems,
    updateStock,
    adjustStock,
    updateThreshold,
  };
}
