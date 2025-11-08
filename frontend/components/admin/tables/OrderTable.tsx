"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";

interface OrderTableProps {
  orders: any[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  in_preparation: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  ready: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_preparation: "In Preparation",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
};

export function OrderTable({ orders, onDelete, isLoading }: OrderTableProps) {
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
                Customer
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Table
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Items
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
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">
                      #{order.order_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">{order.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.table_id}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-900">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {PAYMENT_METHOD_LABELS[order.payment_method]}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={STATUS_COLORS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        onClick={() => onDelete?.(order.id)}
                        disabled={isLoading}
                        title="Delete Order"
                      >
                        <span className="text-red-600 text-xs font-bold">✕</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
