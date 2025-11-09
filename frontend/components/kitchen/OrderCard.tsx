import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/api/admin/orders";
import { getTimeElapsed, getTableNumber } from "@/hooks/use-kitchen-orders";
import { Clock, Users, DollarSign } from "lucide-react";
import { ItemCutter } from "./ItemCutter";

interface OrderCardProps {
  order: Order;
  onStatusChange?: (
    status: "in_preparation" | "ready" | "served" | "completed"
  ) => void;
  onCancel?: (reason: string) => void;
  isUpdating?: boolean;
  isCancelling?: boolean;
}

export function OrderCard({
  order,
  onStatusChange,
  onCancel,
  isUpdating = false,
  isCancelling = false,
}: OrderCardProps) {
  const tableNumber = getTableNumber(order.table_id);
  const timeElapsed = getTimeElapsed(order.created_at);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const getNextStatus = () => {
    if (order.status === "pending") return "in_preparation";
    if (order.status === "in_preparation") return "ready";
    if (order.status === "ready") return "served";
    if (order.status === "served") return "completed";
    return null;
  };

  const getStatusBadgeColor = () => {
    switch (order.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in_preparation":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "served":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = () => {
    switch (order.status) {
      case "pending":
        return "New Order";
      case "in_preparation":
        return "In Progress";
      case "ready":
        return "Ready for Pickup";
      case "served":
        return "Served to Table";
      default:
        return order.status;
    }
  };

  const getNextStatusLabel = () => {
    const nextStatus = getNextStatus();
    switch (nextStatus) {
      case "in_preparation":
        return "Start Preparing";
      case "ready":
        return "Mark Ready";
      case "served":
        return "Mark as Served";
      case "completed":
        return "Complete Order";
      default:
        return null;
    }
  };

  const getActionButtonColor = () => {
    switch (order.status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in_preparation":
        return "bg-blue-500 hover:bg-blue-600";
      case "ready":
        return "bg-green-500 hover:bg-green-600";
      case "served":
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

      {/* Items List - Hide in preparing tab */}
      {order.status !== "in_preparation" && (
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
                      {item.name}{" "}
                      <span className="font-bold text-orange-600">
                        ×{item.quantity}
                      </span>
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
      )}

      {/* Item Cutter - Show only when in preparation */}
      {order.status === "in_preparation" &&
        order.items &&
        order.items.length > 0 && (
          <div className="mb-4">
            <ItemCutter orderId={order.id} items={order.items} />
          </div>
        )}

      {/* Price Information */}
      <div className="mb-4 border-t border-gray-200 pt-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-800">₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Tax:</span>
          <span className="font-medium text-gray-800">₹{order.tax}</span>
        </div>
        <div className="flex justify-between items-center text-base font-bold border-t border-gray-200 pt-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Total:</span>
          </div>
          <span className="text-lg text-green-600">₹{order.total_amount}</span>
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
            onClick={() => onStatusChange?.(nextStatus)}
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
                    onCancel?.(cancelReason || "No reason provided");
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
