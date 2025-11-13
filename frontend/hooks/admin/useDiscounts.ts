"use client";

import { useState, useCallback } from "react";
import { Discount, DiscountStats } from "@/lib/api/admin/discounts";
import { MOCK_DISCOUNTS, generateDiscountStats } from "@/lib/constants/mockDiscounts";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    string | null
  >(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter discounts based on criteria
  const filteredDiscounts = useCallback(() => {
    return discounts.filter((discount) => {
      const matchesStatus =
        !selectedStatusFilter || discount.status === selectedStatusFilter;
      const matchesType =
        !selectedTypeFilter || discount.type === selectedTypeFilter;
      const matchesSearch =
        searchQuery === "" ||
        discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (discount.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [discounts, selectedStatusFilter, selectedTypeFilter, searchQuery]);

  // Get discount statistics
  const stats = useCallback((): DiscountStats => {
    return generateDiscountStats(discounts);
  }, [discounts]);

  // Create new discount
  const createDiscount = useCallback(
    async (data: Partial<Discount>) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newDiscount: Discount = {
        id: `disc-${Date.now()}`,
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
        type: data.type || "percentage",
        value: data.value || 10,
        max_discount: data.max_discount,
        status: data.status || "active",
        conditions: data.conditions,
        valid_from: data.valid_from || new Date().toISOString(),
        valid_until: data.valid_until || new Date().toISOString(),
        is_stackable: data.is_stackable || false,
        usage_limit: data.usage_limit,
        usage_count: 0,
        active_users: 0,
        total_savings: 0,
        created_at: new Date().toISOString(),
        created_by: "admin@intellidine.com",
      };

      setDiscounts((prev) => [newDiscount, ...prev]);
      console.log("✅ Discount created:", newDiscount);

      return newDiscount;
    },
    []
  );

  // Update discount
  const updateDiscount = useCallback(
    async (id: string, data: Partial<Discount>) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      setDiscounts((prev) =>
        prev.map((discount) =>
          discount.id === id ? { ...discount, ...data } : discount
        )
      );

      console.log("✅ Discount updated:", id, data);
    },
    []
  );

  // Delete discount
  const deleteDiscount = useCallback(async (id: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setDiscounts((prev) => prev.filter((discount) => discount.id !== id));
    console.log("✅ Discount deleted:", id);
  }, []);

  // Get single discount
  const getDiscountById = useCallback(
    (id: string): Discount | undefined => {
      return discounts.find((discount) => discount.id === id);
    },
    [discounts]
  );

  // Update discount usage
  const recordUsage = useCallback(
    async (id: string, savingsAmount: number) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setDiscounts((prev) =>
        prev.map((discount) =>
          discount.id === id
            ? {
                ...discount,
                usage_count: (discount.usage_count ?? 0) + 1,
                total_savings: (discount.total_savings ?? 0) + savingsAmount,
                last_used_at: new Date().toISOString(),
              }
            : discount
        )
      );

      console.log("✅ Discount usage recorded:", id, savingsAmount);
    },
    []
  );

  // Get discount statistics by type
  const getStatsByType = useCallback(() => {
    return discounts.reduce(
      (acc, discount) => {
        const existing = acc.find((t) => t.type === discount.type);
        if (existing) {
          existing.count++;
          existing.totalUsage += discount.usage_count;
          existing.totalSavings += discount.total_savings;
        } else {
          acc.push({
            type: discount.type,
            count: 1,
            totalUsage: discount.usage_count,
            totalSavings: discount.total_savings,
          });
        }
        return acc;
      },
      [] as any[]
    );
  }, [discounts]);

  return {
    discounts,
    filteredDiscounts: filteredDiscounts(),
    stats: stats(),
    selectedStatusFilter,
    setSelectedStatusFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    searchQuery,
    setSearchQuery,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getDiscountById,
    recordUsage,
    getStatsByType,
  };
}
