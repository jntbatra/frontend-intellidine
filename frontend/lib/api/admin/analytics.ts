export interface AnalyticsMetrics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
  repeat_customers: number;
  order_completion_rate: number;
  popular_items: PopularItem[];
  revenue_by_date: RevenueDatum[];
  orders_by_status: OrderStatusCount[];
  payment_method_breakdown: PaymentMethodCount[];
  peak_hours: PeakHour[];
  customer_analytics: CustomerAnalytics;
  performance_metrics: PerformanceMetrics;
}

export interface PopularItem {
  item_id: string;
  item_name: string;
  quantity_sold: number;
  revenue: number;
  rating?: number;
}

export interface RevenueDatum {
  date: string;
  revenue: number;
  orders: number;
  average_value: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodCount {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PeakHour {
  hour: number;
  orders: number;
  revenue: number;
}

export interface CustomerAnalytics {
  total_customers: number;
  repeat_rate: number;
  average_orders_per_customer: number;
  average_spend_per_customer: number;
  top_customers: TopCustomer[];
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  total_spent: number;
  order_count: number;
  last_order_date: string;
}

export interface PerformanceMetrics {
  average_preparation_time: number;
  orders_on_time_percentage: number;
  customer_satisfaction_score: number;
  repeat_customer_percentage: number;
}
