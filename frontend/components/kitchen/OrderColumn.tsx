import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderCard } from "./OrderCard";
import type { Order, OrderStatus } from "@/lib/api/admin/orders";
import { AlertCircle } from "lucide-react";

interface OrderColumnProps {
  title: string;
  orders: Order[];
  columnColor: "yellow" | "blue" | "green" | "purple";
  onOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  isUpdating?: boolean;
  emptyMessage?: string;
}

const colorClasses = {
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    header: "bg-yellow-100 border-yellow-400",
    text: "text-yellow-900",
    badge: "bg-yellow-600",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    header: "bg-blue-100 border-blue-400",
    text: "text-blue-900",
    badge: "bg-blue-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-300",
    header: "bg-green-100 border-green-400",
    text: "text-green-900",
    badge: "bg-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    header: "bg-purple-100 border-purple-400",
    text: "text-purple-900",
    badge: "bg-purple-600",
  },
};

export function OrderColumn({
  title,
  orders,
  columnColor,
  onOrderStatusChange,
  isUpdating = false,
  emptyMessage = "No orders",
}: OrderColumnProps) {
  const colors = colorClasses[columnColor];
  const orderCount = orders.length;

  return (
    <div
      className={`flex flex-col h-full rounded-lg border-2 ${colors.border} ${colors.bg} shadow-lg`}
    >
      {/* Header */}
      <div
        className={`${colors.header} border-b-2 ${colors.border} p-4 rounded-t-md sticky top-0 z-10`}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${colors.text}`}>{title}</h2>
          <span
            className={`${colors.badge} text-white font-bold text-lg px-3 py-1 rounded-full min-w-10 text-center`}
          >
            {orderCount}
          </span>
        </div>
        <p className={`text-xs ${colors.text} opacity-75 mt-1`}>
          {orderCount} {orderCount === 1 ? "order" : "orders"} in queue
        </p>
      </div>

      {/* Content */}
      {orderCount > 0 ? (
        <ScrollArea className="flex-1 w-full">
          <div className="p-4 space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={(newStatus) =>
                  onOrderStatusChange(order.id, newStatus)
                }
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className={`w-12 h-12 ${colors.text} opacity-40 mb-3`} />
          <p className={`${colors.text} opacity-60 font-medium`}>
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
