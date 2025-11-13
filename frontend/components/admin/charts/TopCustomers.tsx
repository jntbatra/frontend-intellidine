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

interface TopCustomersProps {
  customers: any[];
}

export function TopCustomers({ customers }: TopCustomersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>
          Most valuable customers by lifetime spend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer, idx) => (
            <div
              key={customer.customer_id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-sm">
                  {customer.customer_name.charAt(0)}
                </div>

                {/* Customer Info */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {customer.customer_name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {customer.order_count} orders
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  ₹{customer.total_spent.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Last:{" "}
                  {new Date(customer.last_order_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
