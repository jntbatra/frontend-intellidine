import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/api/admin/orders";
import { getTimeElapsed, getTableNumber } from "@/hooks/use-kitchen-orders";
import { Clock, Users, DollarSign, TrendingDown } from "lucide-react";

interface ServerOrderCardProps {
  order: Order;
  onStatusChange?: (
    orderId: string,
    status:
      | "PENDING"
      | "PREPARING"
      | "READY"
      | "SERVED"
      | "COMPLETED"
      | "CANCELLED"
  ) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  isUpdating?: boolean;
  isCancelling?: boolean;
}

export function ServerOrderCard({
  order,
  onStatusChange,
  onCancelOrder,
  isUpdating = false,
  isCancelling = false,
}: ServerOrderCardProps) {
  const tableNumber = getTableNumber(order.table_id);
  const timeElapsed = getTimeElapsed(order.created_at);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const getNextStatus = () => {
    if (order.status === "READY") return "SERVED";
    if (order.status === "SERVED") return "COMPLETED";
    return null;
  };

  const getStatusBadgeColor = () => {
    switch (order.status) {
      case "READY":
        return "bg-green-100 text-green-800 border-green-300";
      case "SERVED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = () => {
    switch (order.status) {
      case "READY":
        return "Ready for Pickup";
      case "SERVED":
        return "Served to Table";
      case "COMPLETED":
        return "Order Completed";
      default:
        return order.status;
    }
  };

  const getNextStatusLabel = () => {
    const nextStatus = getNextStatus();
    switch (nextStatus) {
      case "SERVED":
        return "✓ Mark as Served";
      case "COMPLETED":
        return "✓ Complete Order & Payment";
      default:
        return null;
    }
  };

  const getActionButtonColor = () => {
    switch (order.status) {
      case "READY":
        return "bg-green-500 hover:bg-green-600";
      case "SERVED":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const nextStatus = getNextStatus();

  return (
    <Card className="p-4 border-2 shadow-lg hover:shadow-xl transition-shadow bg-white">
      {/* Header: Order Number and Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            #{order.order_number}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Table {tableNumber}</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-sm font-semibold px-3 py-1 ${getStatusBadgeColor()}`}
        >
          {getStatusLabel()}
        </Badge>
      </div>

      {/* Time Elapsed */}
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
        <Clock className="w-4 h-4" />
        <span>{timeElapsed}</span>
      </div>

      {/* Items List - Always show on server display */}
      <div className="mb-4 bg-gray-50 rounded p-3 border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Items ({order.items?.length || 0})
        </h4>
        {order.items && order.items.length > 0 ? (
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="text-sm text-gray-800">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">
                    {item.menu_item_name}{" "}
                    <span className="font-bold text-orange-600">
                      ×{item.quantity}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{(Number(item.subtotal) || 0).toFixed(2)}
                  </span>
                </div>
                {item.special_instructions && (
                  <div className="text-xs text-orange-600 font-semibold mt-1 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                    📝 {item.special_instructions}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 italic">No items in order</p>
        )}
      </div>

      {/* Price Information - Full Breakdown for Server */}
      <div className="mb-4 border-t border-gray-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-800">
            ₹{(order.subtotal || 0).toFixed(2)}
          </span>
        </div>

        {order.discount_amount && order.discount_amount > 0 && (
          <div className="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>{order.discount_reason || "Discount"}</span>
            </div>
            <span className="font-bold">
              -₹{order.discount_amount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (18%):</span>
          <span className="font-medium text-gray-800">
            ₹{(order.tax_amount || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center text-base font-bold border-t border-gray-200 pt-2 bg-blue-50 px-2 py-2 rounded">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>Total:</span>
          </div>
          <span className="text-lg text-blue-600">
            ₹{(order.total || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-xs font-semibold text-blue-700 mb-1">Notes:</p>
          <p className="text-xs text-blue-800">{order.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {nextStatus && (
          <button
            onClick={() => onStatusChange?.(order.id, nextStatus)}
            disabled={isUpdating || isCancelling}
            className={`w-full py-2 px-3 rounded font-semibold text-white text-sm transition-all ${getActionButtonColor()} ${
              isUpdating || isCancelling
                ? "opacity-75 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {isUpdating ? "Updating..." : getNextStatusLabel()}
          </button>
        )}

        {/* Cancel Order Button */}
        {!showCancelConfirm ? (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={isUpdating || isCancelling}
            className="w-full py-2 px-3 rounded font-semibold text-white text-sm transition-all bg-red-500 hover:bg-red-600 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel Order
          </button>
        ) : (
          <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-xs font-semibold text-red-700 mb-2">
              Reason for cancellation:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason (optional)"
              className="w-full text-xs p-2 border border-red-200 rounded focus:outline-none focus:border-red-400"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (
                    cancelReason.trim() ||
                    window.confirm("Cancel without a reason?")
                  ) {
                    onCancelOrder?.(
                      order.id,
                      cancelReason || "No reason provided"
                    );
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }
                }}
                disabled={isCancelling}
                className="flex-1 py-2 px-2 rounded font-semibold text-white text-xs bg-red-600 hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="flex-1 py-2 px-2 rounded font-semibold text-gray-700 text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
