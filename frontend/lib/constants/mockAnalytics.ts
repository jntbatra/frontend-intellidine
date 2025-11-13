/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AnalyticsMetrics, RevenueDatum, PopularItem } from "@/lib/api/admin/analytics";

// Generate last 30 days of data
const getLast30DaysData = (): RevenueDatum[] => {
  const data: RevenueDatum[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.floor(Math.random() * 15000) + 5000,
      orders: Math.floor(Math.random() * 45) + 15,
      average_value: Math.floor(Math.random() * 500) + 200,
    });
  }
  return data;
};

export const MOCK_ANALYTICS: AnalyticsMetrics = {
  total_revenue: 425000,
  total_orders: 1250,
  average_order_value: 340,
  total_customers: 890,
  repeat_customers: 340,
  order_completion_rate: 94.2,
  popular_items: [
    {
      item_id: "item-1",
      item_name: "Butter Chicken",
      quantity_sold: 284,
      revenue: 99400,
      rating: 4.7,
    },
    {
      item_id: "item-8",
      item_name: "Chicken Biryani",
      quantity_sold: 221,
      revenue: 61880,
      rating: 4.8,
    },
    {
      item_id: "item-2",
      item_name: "Paneer Tikka",
      quantity_sold: 198,
      revenue: 55440,
      rating: 4.6,
    },
    {
      item_id: "item-5",
      item_name: "Naan",
      quantity_sold: 412,
      revenue: 20600,
      rating: 4.5,
    },
    {
      item_id: "item-7",
      item_name: "Mango Lassi",
      quantity_sold: 267,
      revenue: 32040,
      rating: 4.4,
    },
  ],
  revenue_by_date: getLast30DaysData(),
  orders_by_status: [
    { status: "Completed", count: 1176, percentage: 94.08 },
    { status: "Pending", count: 47, percentage: 3.76 },
    { status: "In Preparation", count: 20, percentage: 1.6 },
    { status: "Cancelled", count: 7, percentage: 0.56 },
  ],
  payment_method_breakdown: [
    { method: "Card", count: 562, amount: 191000, percentage: 44.94 },
    { method: "UPI", count: 438, amount: 149000, percentage: 35.06 },
    { method: "Cash", count: 198, amount: 67350, percentage: 15.84 },
    { method: "Wallet", count: 52, amount: 17650, percentage: 4.15 },
  ],
  peak_hours: [
    { hour: 7, orders: 8, revenue: 2800 },
    { hour: 8, orders: 15, revenue: 5100 },
    { hour: 9, orders: 22, revenue: 7700 },
    { hour: 10, orders: 18, revenue: 6300 },
    { hour: 11, orders: 25, revenue: 8750 },
    { hour: 12, orders: 45, revenue: 15300 },
    { hour: 13, orders: 38, revenue: 12900 },
    { hour: 14, orders: 28, revenue: 9800 },
    { hour: 15, orders: 12, revenue: 4200 },
    { hour: 16, orders: 8, revenue: 2800 },
    { hour: 17, orders: 10, revenue: 3500 },
    { hour: 18, orders: 35, revenue: 12250 },
    { hour: 19, orders: 42, revenue: 14700 },
    { hour: 20, orders: 38, revenue: 13300 },
    { hour: 21, orders: 28, revenue: 9800 },
  ],
  customer_analytics: {
    total_customers: 890,
    repeat_rate: 38.2,
    average_orders_per_customer: 1.4,
    average_spend_per_customer: 477,
    top_customers: [
      {
        customer_id: "cust-1",
        customer_name: "Rajesh Kumar",
        total_spent: 12500,
        order_count: 38,
        last_order_date: "2025-11-08T20:15:00Z",
      },
      {
        customer_id: "cust-2",
        customer_name: "Priya Singh",
        total_spent: 11200,
        order_count: 34,
        last_order_date: "2025-11-08T19:45:00Z",
      },
      {
        customer_id: "cust-3",
        customer_name: "Amit Patel",
        total_spent: 9800,
        order_count: 29,
        last_order_date: "2025-11-08T12:30:00Z",
      },
      {
        customer_id: "cust-4",
        customer_name: "Deepak Sharma",
        total_spent: 8900,
        order_count: 26,
        last_order_date: "2025-11-07T18:20:00Z",
      },
      {
        customer_id: "cust-5",
        customer_name: "Neha Gupta",
        total_spent: 7650,
        order_count: 23,
        last_order_date: "2025-11-08T14:00:00Z",
      },
    ],
  },
  performance_metrics: {
    average_preparation_time: 12.5,
    orders_on_time_percentage: 96.8,
    customer_satisfaction_score: 4.6,
    repeat_customer_percentage: 38.2,
  },
};
