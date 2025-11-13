import { apiClient, ApiResponse } from "@/lib/api/client";

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

export interface DashboardSummary {
  date: string;
  period: string;
  total_orders: number;
  total_revenue: number;
  total_discount_given: number;
  total_tax: number;
  average_order_value: number;
  order_completion_rate: number;
  top_items: PopularItem[];
  payment_methods: Record<string, number>;
  order_status_breakdown: Record<string, number>;
}

export interface HourlyRevenue {
  date: string;
  hourly_data: Array<{
    hour: string;
    revenue: number;
    orders_count: number;
  }>;
}

export interface PopularItem {
  item_id: string;
  item_name?: string;
  name?: string;
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
  customer_name?: string;
  customer_phone?: string;
  total_spent: number;
  total_orders?: number;
  order_count: number;
  last_order_date: string;
}

export interface PerformanceMetrics {
  average_preparation_time: number;
  orders_on_time_percentage: number;
  customer_satisfaction_score: number;
  repeat_customer_percentage: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  total_amount: number;
  order_count: number;
  percentage: number;
}

export type AnalyticsPeriod = "day" | "week" | "month" | "year";

// Get dashboard summary
export async function getDashboardSummary(
  tenantId: string,
  period: AnalyticsPeriod = "day"
): Promise<ApiResponse<{ data: DashboardSummary }>> {
  return apiClient.get(
    `/api/analytics/dashboard-summary?tenant_id=${tenantId}&period=${period}`
  );
}

// Get daily metrics
export async function getDailyMetrics(
  tenantId: string,
  date?: string
): Promise<ApiResponse> {
  let url = `/api/analytics/daily-metrics?tenant_id=${tenantId}`;
  if (date) url += `&date=${date}`;
  return apiClient.get(url);
}

// Get order trends
export async function getOrderTrends(
  tenantId: string,
  period: AnalyticsPeriod = "week"
): Promise<ApiResponse> {
  return apiClient.get(
    `/api/analytics/order-trends?tenant_id=${tenantId}&period=${period}`
  );
}

// Get top selling items
export async function getTopItems(
  tenantId: string,
  limit: number = 10
): Promise<ApiResponse> {
  return apiClient.get(
    `/api/analytics/top-items?tenant_id=${tenantId}&limit=${limit}`
  );
}

// Get hourly revenue chart data (from MISSING_ENDPOINTS.md)
export async function getHourlyRevenue(
  tenantId: string,
  date: string
): Promise<ApiResponse<{ data: HourlyRevenue }>> {
  return apiClient.get(
    `/api/analytics/hourly-revenue?tenant_id=${tenantId}&date=${date}`
  );
}

// Get top customers (from MISSING_ENDPOINTS.md)
export async function getTopCustomers(
  tenantId: string,
  limit: number = 10,
  period: AnalyticsPeriod = "month"
): Promise<ApiResponse<{ data: { customers: TopCustomer[] } }>> {
  return apiClient.get(
    `/api/analytics/top-customers?tenant_id=${tenantId}&limit=${limit}&period=${period}`
  );
}

// Get payment method breakdown (from MISSING_ENDPOINTS.md)
export async function getPaymentMethodBreakdown(
  tenantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<{ data: { breakdown: PaymentMethodBreakdown[] } }>> {
  let url = `/api/analytics/payment-methods?tenant_id=${tenantId}`;
  if (dateFrom) url += `&date_from=${dateFrom}`;
  if (dateTo) url += `&date_to=${dateTo}`;
  return apiClient.get(url);
}
