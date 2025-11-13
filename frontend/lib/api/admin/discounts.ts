import { apiClient, ApiResponse } from "@/lib/api/client";

// Discount Management API Types

export type DiscountType =
  | "percentage"
  | "fixed_amount"
  | "bogo"
  | "quantity_based"
  | "seasonal"
  | "loyalty"
  | "bundle";

export type DiscountStatus = "active" | "inactive" | "expired" | "scheduled";

export interface DiscountCondition {
  min_order_value?: number;
  applicable_items?: string[]; // Item IDs
  applicable_categories?: string[];
  max_uses_per_customer?: number;
  minimum_quantity?: number;
}

export interface Discount {
  id: string;
  tenant_id?: string;
  code: string;
  name?: string;
  description?: string;
  type: DiscountType;
  value: number; // Percentage or fixed amount
  max_discount?: number; // Maximum discount cap
  status: DiscountStatus;
  conditions?: DiscountCondition;
  valid_from: string; // ISO date
  valid_until: string; // ISO date
  is_stackable?: boolean;
  usage_limit?: number; // Total uses allowed
  usage_count?: number; // Current uses
  active_users?: number; // Unique customers used
  total_savings?: number; // Total discount given
  applicable_payment_methods?: string[];
  min_order_value?: number;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  last_used_at?: string;
}

export interface CreateDiscountPayload {
  code: string;
  type: DiscountType;
  value: number;
  description?: string;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  applicable_payment_methods?: string[];
  min_order_value?: number;
}

export interface UpdateDiscountPayload {
  status?: DiscountStatus;
  usage_limit?: number;
  description?: string;
  valid_until?: string;
}

export interface DiscountStats {
  total_discounts: number;
  active_discounts: number;
  inactive_discounts?: number;
  expired_discounts?: number;
  total_savings_given: number;
  most_used_discount?: Discount | null;
  average_usage_per_discount: number;
  top_discount_types: Array<{
    type: DiscountType;
    count: number;
    total_savings?: number;
    savings?: number;
  }>;
}

export interface DiscountUsageData {
  date: string;
  count: number;
  savings: number;
  orders_affected: number;
}

export interface DiscountDetailStats extends DiscountStats {
  discount?: Discount;
  usage_trend?: DiscountUsageData[]; // Last 30 days
  usage_by_customer?: {
    count: number;
    percentage: number;
  };
  revenue_impact?: {
    gross_revenue: number;
    discount_amount: number;
    net_revenue: number;
  };
}

export interface DiscountsResponse {
  discounts: Discount[];
  data?: Discount[];
  stats?: DiscountStats;
  total: number;
  limit: number;
  offset?: number;
  pagination?: {
    total: number;
    page?: number;
    limit: number;
    offset?: number;
  };
}

// Get all discounts
export async function getDiscounts(
  tenantId: string,
  status?: DiscountStatus,
  type?: DiscountType,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<DiscountsResponse>> {
  let url = `/api/discounts?tenant_id=${tenantId}&limit=${limit}&offset=${offset}`;
  if (status) url += `&status=${status}`;
  if (type) url += `&type=${type}`;
  return apiClient.get<DiscountsResponse>(url);
}

// Get single discount
export async function getDiscount(
  discountId: string,
  tenantId: string
): Promise<ApiResponse<Discount>> {
  return apiClient.get<Discount>(
    `/api/discounts/${discountId}?tenant_id=${tenantId}`
  );
}

// Create discount
export async function createDiscount(
  payload: CreateDiscountPayload,
  tenantId: string
): Promise<ApiResponse<Discount>> {
  return apiClient.post<Discount>(
    `/api/discounts?tenant_id=${tenantId}`,
    payload
  );
}

// Update discount
export async function updateDiscount(
  discountId: string,
  payload: UpdateDiscountPayload,
  tenantId: string
): Promise<ApiResponse<Discount>> {
  return apiClient.patch<Discount>(
    `/api/discounts/${discountId}?tenant_id=${tenantId}`,
    payload
  );
}

// Delete discount
export async function deleteDiscount(
  discountId: string,
  tenantId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete(
    `/api/discounts/${discountId}?tenant_id=${tenantId}`
  );
}

// Get discount statistics
export async function getDiscountStats(
  tenantId: string,
  period: "day" | "week" | "month" | "year" = "month"
): Promise<ApiResponse<{ data: DiscountStats }>> {
  return apiClient.get(
    `/api/discounts/stats?tenant_id=${tenantId}&period=${period}`
  );
}
