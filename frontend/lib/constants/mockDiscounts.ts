/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import {
  Discount,
  DiscountStats,
  DiscountUsageData,
  DiscountDetailStats,
} from "@/lib/api/admin/discounts";

export const MOCK_DISCOUNTS: Discount[] = [
  {
    id: "disc-001",
    code: "WELCOME20",
    name: "Welcome Offer",
    description: "20% off on your first order",
    type: "percentage",
    value: 20,
    max_discount: 500,
    status: "active",
    conditions: {
      min_order_value: 300,
      max_uses_per_customer: 1,
    },
    valid_from: "2025-11-01",
    valid_until: "2025-12-31",
    is_stackable: false,
    usage_limit: 1000,
    usage_count: 847,
    active_users: 623,
    total_savings: 156240,
    created_at: "2025-10-15T10:00:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T19:45:00Z",
  },
  {
    id: "disc-002",
    code: "LUNCH15",
    name: "Lunch Special",
    description: "15% off on orders between 12 PM - 2 PM",
    type: "percentage",
    value: 15,
    max_discount: 300,
    status: "active",
    conditions: {
      min_order_value: 200,
      applicable_categories: ["mains", "combos"],
    },
    valid_from: "2025-09-01",
    valid_until: "2025-12-31",
    is_stackable: false,
    usage_limit: 5000,
    usage_count: 3248,
    active_users: 1456,
    total_savings: 342560,
    created_at: "2025-09-01T08:00:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T14:22:00Z",
  },
  {
    id: "disc-003",
    code: "SAVE100",
    name: "Flat ₹100 Off",
    description: "Flat ₹100 discount on orders above ₹500",
    type: "fixed_amount",
    value: 100,
    status: "active",
    conditions: {
      min_order_value: 500,
    },
    valid_from: "2025-10-01",
    valid_until: "2025-11-30",
    is_stackable: true,
    usage_limit: 2000,
    usage_count: 1542,
    active_users: 782,
    total_savings: 154200,
    created_at: "2025-10-01T09:30:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T18:15:00Z",
  },
  {
    id: "disc-004",
    code: "BOGO25",
    name: "Buy 1 Get 1 (25% Off)",
    description: "Buy any biryani, get 25% off on the second item",
    type: "bogo",
    value: 25,
    status: "active",
    conditions: {
      applicable_items: ["item-001", "item-002"],
      minimum_quantity: 2,
    },
    valid_from: "2025-11-01",
    valid_until: "2025-12-15",
    is_stackable: false,
    usage_limit: 1500,
    usage_count: 892,
    active_users: 445,
    total_savings: 128640,
    created_at: "2025-10-28T11:00:00Z",
    created_by: "marketing@intellidine.com",
    last_used_at: "2025-11-08T20:30:00Z",
  },
  {
    id: "disc-005",
    code: "LOYALTY10",
    name: "Loyalty Rewards",
    description: "10% off for loyalty members",
    type: "loyalty",
    value: 10,
    max_discount: 400,
    status: "active",
    valid_from: "2025-01-01",
    valid_until: "2025-12-31",
    is_stackable: false,
    usage_limit: 10000,
    usage_count: 5634,
    active_users: 892,
    total_savings: 421560,
    created_at: "2025-01-01T00:00:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T21:00:00Z",
  },
  {
    id: "disc-006",
    code: "DIWALI30",
    name: "Diwali Mega Sale",
    description: "Flat 30% off - Diwali Special",
    type: "seasonal",
    value: 30,
    max_discount: 800,
    status: "expired",
    valid_from: "2025-11-01",
    valid_until: "2025-11-05",
    is_stackable: false,
    usage_limit: 3000,
    usage_count: 2856,
    active_users: 1623,
    total_savings: 612480,
    created_at: "2025-10-20T16:00:00Z",
    created_by: "marketing@intellidine.com",
    last_used_at: "2025-11-05T23:59:00Z",
  },
  {
    id: "disc-007",
    code: "BUNDLE50",
    name: "Combo Bundle Deal",
    description: "Buy 2+ items from combos, get 15% off",
    type: "bundle",
    value: 15,
    status: "active",
    conditions: {
      applicable_categories: ["combos"],
      minimum_quantity: 2,
      min_order_value: 800,
    },
    valid_from: "2025-10-15",
    valid_until: "2025-12-31",
    is_stackable: true,
    usage_limit: 4000,
    usage_count: 1847,
    active_users: 723,
    total_savings: 234560,
    created_at: "2025-10-15T13:20:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T17:45:00Z",
  },
  {
    id: "disc-008",
    code: "WEEKEND25",
    name: "Weekend Special",
    description: "25% off on orders placed Friday - Sunday",
    type: "percentage",
    value: 25,
    max_discount: 600,
    status: "active",
    conditions: {
      min_order_value: 400,
    },
    valid_from: "2025-10-01",
    valid_until: "2025-12-31",
    is_stackable: false,
    usage_limit: 3000,
    usage_count: 2145,
    active_users: 987,
    total_savings: 385920,
    created_at: "2025-10-01T12:00:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-08T19:20:00Z",
  },
  {
    id: "disc-009",
    code: "NEWYEAR50",
    name: "New Year Countdown",
    description: "Up to 50% off - Early New Year booking",
    type: "percentage",
    value: 50,
    max_discount: 1000,
    // @ts-expect-error - "pending" is a valid discount status
    status: "pending",
    valid_from: "2025-12-15",
    valid_until: "2026-01-05",
    is_stackable: false,
    usage_limit: 2000,
    usage_count: 0,
    active_users: 0,
    total_savings: 0,
    created_at: "2025-11-01T09:00:00Z",
    created_by: "marketing@intellidine.com",
  },
  {
    id: "disc-010",
    code: "REVIEW5",
    name: "Review & Rate Discount",
    description: "₹50 off for writing a review",
    type: "fixed_amount",
    value: 50,
    status: "inactive",
    valid_from: "2025-09-01",
    valid_until: "2025-11-08",
    is_stackable: false,
    usage_limit: 1000,
    usage_count: 245,
    active_users: 178,
    total_savings: 12250,
    created_at: "2025-09-01T14:30:00Z",
    created_by: "admin@intellidine.com",
    last_used_at: "2025-11-07T16:40:00Z",
  },
];

export const generateDiscountStats = (discounts: Discount[]): DiscountStats => {
  const active = discounts.filter((d) => d.status === "active");
  const inactive = discounts.filter((d) => d.status === "inactive");
  const expired = discounts.filter((d) => d.status === "expired");

  const totalSavings = discounts.reduce((sum, d) => sum + (d.total_savings ?? 0), 0);
  const mostUsed =
    discounts.length > 0
      ? discounts.reduce((max, d) => (((d.usage_count ?? 0) > (max.usage_count ?? 0)) ? d : max))
      : null;

  const typeBreakdown = discounts.reduce(
    (acc, d) => {
      const existing = acc.find((t) => t.type === d.type);
      if (existing) {
        existing.count++;
        existing.savings += (d.total_savings ?? 0);
      } else {
        acc.push({
          type: d.type,
          count: 1,
          savings: (d.total_savings ?? 0),
        });
      }
      return acc;
    },
    [] as any[]
  );

  return {
    total_discounts: discounts.length,
    active_discounts: active.length,
    inactive_discounts: inactive.length,
    expired_discounts: expired.length,
    total_savings_given: totalSavings,
    most_used_discount: mostUsed,
    average_usage_per_discount: Math.round(
      discounts.reduce((sum, d) => sum + (d.usage_count ?? 0), 0) / discounts.length
    ),
    top_discount_types: typeBreakdown.sort((a, b) => b.savings - a.savings),
  };
};

export const generateUsageTrend = (discount: Discount): DiscountUsageData[] => {
  const trend: DiscountUsageData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const avgUsage = Math.floor((discount.usage_count ?? 0) / 30);
    const variation = Math.floor(Math.random() * (avgUsage / 2));
    const count = Math.max(0, avgUsage - variation + Math.random() * variation);

    trend.push({
      date: date.toISOString().split("T")[0],
      count: Math.round(count),
      savings: Math.round(count * (discount.value * 50)), // Rough estimate
      orders_affected: Math.round(count * 1.2),
    });
  }

  return trend;
};

export const getDiscountDetailStats = (
  discount: Discount
): DiscountDetailStats => {
  const stats = generateDiscountStats([discount]);
  const usageTrend = generateUsageTrend(discount);

  const totalSavingsFromTrend = usageTrend.reduce(
    (sum, d) => sum + d.savings,
    0
  );
  const avgOrderValue = 600; // Assumption for calculation

  return {
    ...stats,
    discount,
    usage_trend: usageTrend,
    usage_by_customer: {
      count: discount.active_users ?? 0,
      percentage:
        (discount.active_users ?? 0) > 0
          ? Math.round(((discount.active_users ?? 0) / 890) * 100) // Assuming 890 total customers
          : 0,
    },
    revenue_impact: {
      gross_revenue: avgOrderValue * (discount.usage_count ?? 0),
      discount_amount: discount.total_savings ?? 0,
      net_revenue:
        avgOrderValue * (discount.usage_count ?? 0) - (discount.total_savings ?? 0),
    },
  };
};
