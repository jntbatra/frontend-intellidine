"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PeakHoursChartProps {
  data: any[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const maxOrders = Math.max(...data.map((d) => d.orders));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Hours Analysis</CardTitle>
        <CardDescription>Orders and revenue by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Horizontal Bar Chart */}
          <div className="space-y-2">
            {data.map((hour) => (
              <div key={hour.hour} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="w-12 text-slate-600 font-medium">
                    {String(hour.hour).padStart(2, "0")}:00
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-200 rounded-full h-6 overflow-hidden relative">
                      <div
                        className="bg-orange-500 h-full flex items-center justify-center transition-all"
                        style={{
                          width: `${(hour.orders / maxOrders) * 100}%`,
                        }}
                      >
                        {hour.orders > 0 && (
                          <span className="text-xs font-bold text-white">
                            {hour.orders}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      ₹{hour.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-600">Peak Hour</p>
              <p className="text-lg font-bold text-slate-900">
                {String(data.reduce((max, d) => (d.orders > max.orders ? d : max)).hour).padStart(
                  2,
                  "0"
                )}
                :00
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Avg Orders/Hour</p>
              <p className="text-lg font-bold text-slate-900">
                {Math.round(data.reduce((sum, d) => sum + d.orders, 0) / data.length)}
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
