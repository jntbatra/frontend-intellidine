/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentBreakdownProps {
  data: any[];
}

export function PaymentMethodBreakdown({ data }: PaymentBreakdownProps) {
  const colors = {
    Card: "bg-blue-500",
    UPI: "bg-purple-500",
    Cash: "bg-green-500",
    Wallet: "bg-orange-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Transaction distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {data.reduce((acc, item, idx) => {
                  let startAngle = 0;
                  for (let i = 0; i < idx; i++) {
                    startAngle += (data[i].percentage / 100) * 360;
                  }
                  const endAngle = startAngle + (item.percentage / 100) * 360;
                  const start = ((startAngle * Math.PI) / 180);
                  const end = ((endAngle * Math.PI) / 180);
                  const startX = 50 + 40 * Math.cos(start - Math.PI / 2);
                  const startY = 50 + 40 * Math.sin(start - Math.PI / 2);
                  const endX = 50 + 40 * Math.cos(end - Math.PI / 2);
                  const endY = 50 + 40 * Math.sin(end - Math.PI / 2);
                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

                  const colorMap: Record<string, string> = {
                    Card: "#3b82f6",
                    UPI: "#a855f7",
                    Cash: "#22c55e",
                    Wallet: "#f97316",
                  };

                  return acc.concat(
                    <path
                      key={idx}
                      d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                      fill={colorMap[item.method] || "#ccc"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                }, [] as any)}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {data.length}
                  </p>
                  <p className="text-xs text-slate-600">Methods</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      colors[item.method as keyof typeof colors] || "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-700">
                    {item.method}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                  <span className="text-sm font-semibold text-slate-900 w-20 text-right">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">
                ₹{data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
