"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/admin/cards/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { AlertCircle, Package, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface DashboardMetrics {
  revenue: number;
  revenue_trend_pct: number;
  orders: number;
  orders_trend_pct: number;
  avgBill: number;
  avgBill_trend_pct: number;
  lowStock: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const tenantId = localStorage.getItem("current_tenant_id");
        if (!tenantId) {
          throw new Error("Tenant ID not found");
        }

        // Fetch daily metrics from analytics
        const metricsResponse = await apiClient.get(
          `/api/analytics/daily-metrics?tenant_id=${tenantId}`
        );

        if (metricsResponse.success) {
          const data = metricsResponse.data as any;
          setMetrics({
            revenue: data.revenue || 0,
            revenue_trend_pct: data.revenue_percentage_change || 0,
            orders: data.orders_count || 0,
            orders_trend_pct: data.orders_percentage_change || 0,
            avgBill: data.average_bill || 0,
            avgBill_trend_pct: data.average_bill_percentage_change || 0,
            lowStock: 3, // TODO: Fetch from inventory service
          });
        } else {
          throw new Error(metricsResponse.message || "Failed to fetch metrics");
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError("Failed to load dashboard metrics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Welcome back! Here's your restaurant overview.
        </p>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Revenue"
            value={`₹${metrics.revenue.toLocaleString()}`}
            trend={{
              percentage: Math.abs(metrics.revenue_trend_pct),
              direction: metrics.revenue_trend_pct >= 0 ? "UP" : "DOWN",
            }}
            subtext="vs yesterday"
            icon="💰"
          />
          <MetricCard
            title="Orders"
            value={metrics.orders}
            trend={{
              percentage: Math.abs(metrics.orders_trend_pct),
              direction: metrics.orders_trend_pct >= 0 ? "UP" : "DOWN",
            }}
            subtext="vs yesterday"
            icon="📦"
          />
          <MetricCard
            title="Avg Bill"
            value={`₹${metrics.avgBill.toFixed(2)}`}
            trend={{
              percentage: Math.abs(metrics.avgBill_trend_pct),
              direction: metrics.avgBill_trend_pct >= 0 ? "UP" : "DOWN",
            }}
            subtext="vs yesterday"
            icon="💵"
          />
          <MetricCard
            title="Low Stock"
            value={metrics.lowStock}
            subtext="items below reorder"
            icon="⚠️"
          />
        </div>
      ) : null}

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/staff/add">
              <Button variant="outline" className="w-full justify-start">
                <Users size={16} className="mr-2" />
                Add Staff Member
              </Button>
            </Link>
            <Link href="/admin/menu/add">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp size={16} className="mr-2" />
                Add Menu Item
              </Button>
            </Link>
            <Link href="/admin/inventory/alerts">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle size={16} className="mr-2" />
                View Low Stock Alerts
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">API Gateway</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Database</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Message Queue</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Online
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
