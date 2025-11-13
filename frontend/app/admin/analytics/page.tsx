/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { PeakHoursChart } from "@/components/admin/charts/PeakHoursChart";
import { PopularItems } from "@/components/admin/charts/PopularItems";
import { PaymentMethodBreakdown } from "@/components/admin/charts/PaymentMethodBreakdown";
import { TopCustomers } from "@/components/admin/charts/TopCustomers";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { MOCK_ANALYTICS } from "@/lib/constants/mockAnalytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [dateRange, setDateRange] = useState("this-month");

  const analytics = MOCK_ANALYTICS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="text-slate-600 mt-2">
            Comprehensive insights into your restaurant operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/analytics/report")}
          >
            📊 Detailed Report
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">📥 Export</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{analytics.total_revenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-2">↑ 12.5% vs last month</p>
              </div>
              <DollarSign size={32} className="text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics.total_orders.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-2">↑ 8.3% vs last month</p>
              </div>
              <ShoppingCart size={32} className="text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{analytics.average_order_value}
                </p>
                <p className="text-xs text-green-600 mt-2">↑ 3.2% vs last month</p>
              </div>
              <TrendingUp size={32} className="text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics.order_completion_rate}%
                </p>
                <p className="text-xs text-green-600 mt-2">↑ 1.5% vs last month</p>
              </div>
              <BarChart3 size={32} className="text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Customers</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics.total_customers.toLocaleString()}
                </p>
              </div>
              <Users size={32} className="text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Repeat Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Repeat Customers</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics.repeat_customers.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {analytics.customer_analytics.repeat_rate}% repeat rate
                </p>
              </div>
              <TrendingUp size={32} className="text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Customer Spend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Customer Spend</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{analytics.customer_analytics.average_spend_per_customer}
                </p>
              </div>
              <DollarSign size={32} className="text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={analytics.revenue_by_date} />
        <PeakHoursChart data={analytics.peak_hours} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PopularItems items={analytics.popular_items} />
        <PaymentMethodBreakdown data={analytics.payment_method_breakdown} />
      </div>

      {/* Charts Row 3 */}
      <TopCustomers customers={analytics.customer_analytics.top_customers} />

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Breakdown of all orders by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.orders_by_status.map((status) => (
              <div key={status.status} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {status.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {status.count}
                    </span>
                    <span className="text-xs text-slate-600 w-12 text-right">
                      {status.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      status.status === "Completed"
                        ? "bg-green-500"
                        : status.status === "Pending"
                        ? "bg-yellow-500"
                        : status.status === "In Preparation"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key operational performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Avg Prep Time</p>
              <p className="text-3xl font-bold text-slate-900">
                {analytics.performance_metrics.average_preparation_time}
                <span className="text-base text-slate-600"> min</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">On-Time Rate</p>
              <p className="text-3xl font-bold text-slate-900">
                {analytics.performance_metrics.orders_on_time_percentage}
                <span className="text-base text-slate-600">%</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Satisfaction Score</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-slate-900">
                  {analytics.performance_metrics.customer_satisfaction_score}
                </p>
                <span className="text-yellow-500">⭐</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Repeat Rate</p>
              <p className="text-3xl font-bold text-slate-900">
                {analytics.performance_metrics.repeat_customer_percentage}
                <span className="text-base text-slate-600">%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
