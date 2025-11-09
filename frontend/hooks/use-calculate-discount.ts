import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";

export interface DiscountCalculationRequest {
  items: Array<{
    menu_item_id: string;
    quantity: number;
  }>;
  payment_method: "CASH" | "RAZORPAY" | "CARD" | "UPI" | "WALLET";
}

export interface DiscountCalculationResponse {
  subtotal: number;
  discount_amount: number;
  discount_reason: string;
  discount_percent: number;
  tax_amount: number;
  total: number;
  items_count: number;
}

/**
 * Custom hook to calculate discounts for orders
 * Integrates with IntelliDine API endpoint:
 * - POST /api/orders/calculate-discount - Calculate discount based on cart items
 *
 * Features:
 * - Calculate discounts based on items and payment method
 * - Handles loading and error states
 * - Toast notifications for user feedback
 */
export function useCalculateDiscount(tenantId: string) {
  const [discountData, setDiscountData] =
    useState<DiscountCalculationResponse | null>(null);

  const calculateDiscountMutation = useMutation({
    mutationFn: async (
      request: DiscountCalculationRequest
    ): Promise<DiscountCalculationResponse> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
      };

      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/calculate-discount?tenant_id=${tenantId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to calculate discount: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || data;
    },
    onSuccess: (data) => {
      setDiscountData(data);
    },
    onError: (error: Error) => {
      console.error("Failed to calculate discount:", error);
      // Don't show toast on error - it's optional functionality
      setDiscountData(null);
    },
  });

  // Calculate discount whenever cart items change
  const calculateDiscount = useCallback(
    (
      items: DiscountCalculationRequest["items"],
      paymentMethod: "CASH" | "RAZORPAY" | "CARD" | "UPI" | "WALLET"
    ) => {
      if (items.length === 0) {
        setDiscountData(null);
        return;
      }

      calculateDiscountMutation.mutate({
        items,
        payment_method: paymentMethod,
      });
    },
    [calculateDiscountMutation]
  );

  return {
    discountData,
    isCalculating: calculateDiscountMutation.isPending,
    isError: calculateDiscountMutation.isError,
    error: calculateDiscountMutation.error,
    calculateDiscount,
  };
}
