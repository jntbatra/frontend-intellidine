"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/lib/api/admin/orders";

interface OrderTableProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PREPARING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  READY: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  RAZORPAY: "Razorpay",
};

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Order #
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Table
              </th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700">
                Total
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Payment
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                // Log any orders with missing critical data
                if (!order.status || !order.payment_method || order.total === undefined) {
                  console.warn("⚠️ Order missing critical data:", order);
                }
                
                return (
                <tr
                  key={order.id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">
                      #{order.order_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.table_id || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-900">
                      ₹{typeof order.total === 'number' ? order.total.toLocaleString() : order.total}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={order.status ? STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"}>
                      {order.status ? STATUS_LABELS[order.status] || order.status : "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          title="View Order"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
