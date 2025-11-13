"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PopularItemsProps {
  items: any[];
}

export function PopularItems({ items }: PopularItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>Best performing menu items this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.item_id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Rank Badge */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Item Info */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {item.item_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600">
                      {item.quantity_sold} sold
                    </span>
                    {item.rating && (
                      <span className="text-xs text-yellow-600">
                        ⭐ {item.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  ₹{item.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {(
                    (item.revenue /
                      items.reduce((sum, i) => sum + i.revenue, 0)) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
