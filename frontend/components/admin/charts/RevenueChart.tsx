/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RevenueChartProps {
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxOrders = Math.max(...data.map((d) => d.orders));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
        <CardDescription>Daily revenue and order count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mini Chart */}
          <div className="flex items-end justify-between h-32 gap-1 bg-slate-50 p-4 rounded-lg">
            {data.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {/* Revenue bar */}
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(day.revenue / maxRevenue) * 80}px`,
                  }}
                  title={`₹${day.revenue}`}
                />
                {/* Orders indicator */}
                <div
                  className="w-full bg-green-500 rounded"
                  style={{
                    height: `${(day.orders / maxOrders) * 30}px`,
                  }}
                  title={`${day.orders} orders`}
                />
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-slate-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-slate-600">Orders</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-600">Avg Daily Revenue</p>
              <p className="text-lg font-bold text-slate-900">
                ₹
                {Math.round(
                  data.reduce((sum, d) => sum + d.revenue, 0) / data.length
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Avg Daily Orders</p>
              <p className="text-lg font-bold text-slate-900">
                {Math.round(
                  data.reduce((sum, d) => sum + d.orders, 0) / data.length
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Total Revenue</p>
              <p className="text-lg font-bold text-slate-900">
                ₹{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
