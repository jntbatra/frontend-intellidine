"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_ANALYTICS } from "@/lib/constants/mockAnalytics";

export default function AnalyticsReportPage() {
  const router = useRouter();
  const analytics = MOCK_ANALYTICS;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "revenue",
      title: "Revenue Analysis",
      icon: "💰",
      data: {
        total: analytics.total_revenue,
        trend: "+12.5%",
        detail: `Total revenue across ${analytics.total_orders} orders`,
      },
    },
    {
      id: "customers",
      title: "Customer Metrics",
      icon: "👥",
      data: {
        total: analytics.total_customers,
        repeat: analytics.repeat_customers,
        repeatRate: analytics.customer_analytics.repeat_rate,
      },
    },
    {
      id: "performance",
      title: "Performance KPIs",
      icon: "📊",
      data: {
        completion: analytics.order_completion_rate,
        satisfaction: analytics.performance_metrics.customer_satisfaction_score,
        prepTime: analytics.performance_metrics.average_preparation_time,
      },
    },
    {
      id: "inventory",
      title: "Top Selling Items",
      icon: "🍽️",
      data: {
        topItem: analytics.popular_items[0],
        totalSold: analytics.popular_items.reduce((sum, i) => sum + i.quantity_sold, 0),
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Analytics
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Analytics Report
            </h1>
            <p className="text-slate-600 mt-2">
              Detailed breakdown of restaurant operations and performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Date */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Report Period</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                Last 30 Days (Nov 1 - Nov 8, 2025)
              </p>
            </div>
            <Badge className="bg-blue-600">November 2025</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card
            key={section.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              setExpandedSection(
                expandedSection === section.id ? null : section.id
              )
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl">{section.icon}</div>
                  <p className="font-semibold text-slate-900 mt-3">
                    {section.title}
                  </p>
                  {section.id === "revenue" && (
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      ₹{(section.data as any).total.toLocaleString()}
                    </p>
                  )}
                  {section.id === "customers" && (
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {(section.data as any).total.toLocaleString()} total
                    </p>
                  )}
                  {section.id === "performance" && (
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {(section.data as any).completion}% completion
                    </p>
                  )}
                  {section.id === "inventory" && (
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {(section.data as any).topItem.item_name}
                    </p>
                  )}
                </div>
                <span className="text-slate-400">
                  {expandedSection === section.id ? "▼" : "▶"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Sections */}

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Detailed revenue analysis by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.payment_method_breakdown.map((method) => (
              <div key={method.method}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{method.method}</span>
                  <span className="font-bold text-slate-900">
                    ₹{method.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {method.percentage.toFixed(1)}% of total • {method.count} transactions
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers Details */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Customers</CardTitle>
          <CardDescription>Customer lifetime value analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">
                    Avg Order
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.customer_analytics.top_customers.map((customer, idx) => (
                  <tr key={customer.customer_id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {customer.customer_name}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {customer.order_count}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      ₹{customer.total_spent.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      ₹{Math.round(customer.total_spent / customer.order_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-green-900">
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold">Strong Revenue Growth</p>
              <p className="text-sm text-green-800">Revenue is up 12.5% compared to last month, indicating positive business momentum.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold">High Completion Rate</p>
              <p className="text-sm text-green-800">94.2% order completion rate shows excellent operational efficiency and customer satisfaction.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold">Peak Hour Optimization</p>
              <p className="text-sm text-green-800">Peak hours are 12:00-14:00 and 18:00-21:00. Consider increasing staff during these times.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-semibold">Customer Retention Focus</p>
              <p className="text-sm text-green-800">38.2% repeat customer rate - consider loyalty programs to increase this metric.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
