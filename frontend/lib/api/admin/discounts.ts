// Discount Management API Types

export type DiscountType =
  | "percentage"
  | "fixed"
  | "bogo"
  | "seasonal"
  | "loyalty"
  | "bundle";

export type DiscountStatus = "active" | "inactive" | "expired" | "pending";

export interface DiscountCondition {
  min_order_value?: number;
  applicable_items?: string[]; // Item IDs
  applicable_categories?: string[];
  max_uses_per_customer?: number;
  minimum_quantity?: number;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number; // Percentage or fixed amount
  max_discount?: number; // Maximum discount cap
  status: DiscountStatus;
  conditions?: DiscountCondition;
  valid_from: string; // ISO date
  valid_until: string; // ISO date
  is_stackable: boolean;
  usage_limit?: number; // Total uses allowed
  usage_count: number; // Current uses
  active_users: number; // Unique customers used
  total_savings: number; // Total discount given
  created_at: string;
  created_by: string;
  last_used_at?: string;
}

export interface DiscountStats {
  total_discounts: number;
  active_discounts: number;
  inactive_discounts: number;
  expired_discounts: number;
  total_savings: number;
  most_used_discount: Discount | null;
  average_usage_per_discount: number;
  top_discount_types: {
    type: DiscountType;
    count: number;
    savings: number;
  }[];
}

export interface DiscountUsageData {
  date: string;
  count: number;
  savings: number;
  orders_affected: number;
}

export interface DiscountDetailStats extends DiscountStats {
  discount?: Discount;
  usage_trend: DiscountUsageData[]; // Last 30 days
  usage_by_customer: {
    count: number;
    percentage: number;
  };
  revenue_impact: {
    gross_revenue: number;
    discount_amount: number;
    net_revenue: number;
  };
}

export interface DiscountsResponse {
  discounts: Discount[];
  stats: DiscountStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
