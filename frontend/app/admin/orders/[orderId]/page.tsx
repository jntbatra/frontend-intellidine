"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getOrder, updateOrderStatus, cancelOrder, Order, OrderStatus } from "@/lib/api/admin/orders";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-blue-100 text-blue-800",
  READY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!orderId) {
          setError("Order ID not found");
          return;
        }

        const response = await getOrder(orderId);
        console.log("📋 Order response:", response);

        // Extract order from response: response.data
        const orderData = response.data as Order;
        if (!orderData || !orderData.id) {
          setError("Order not found");
          return;
        }

        setOrder(orderData);
        setNewStatus(orderData.status);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch order";
        setError(message);
        console.error("❌ Error fetching order:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) {
      return;
    }

    try {
      setIsUpdating(true);
      await updateOrderStatus(order.id, { status: newStatus as OrderStatus });
      console.log("✅ Order status updated to:", newStatus);
      
      // Update local state
      setOrder({ ...order, status: newStatus as OrderStatus });
      alert("Order status updated successfully");
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(order.id, { reason: cancelReason });
      console.log("✅ Order cancelled");
      
      // Update local state
      setOrder({ ...order, status: "CANCELLED" });
      setCancelReason("");
      alert("Order cancelled successfully");
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      alert("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">❌ {error || "Order not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft size={16} className="mr-2" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order #{order.order_number}</h1>
          <p className="text-slate-600 mt-2">{order.id}</p>
        </div>
        <Badge className={`${STATUS_COLORS[order.status]} text-base py-2 px-3`}>
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Table</span>
              <span className="font-semibold">{order.table_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customer ID</span>
              <span className="font-semibold text-xs">{order.customer_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Method</span>
              <span className="font-semibold">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Created</span>
              <span className="font-semibold text-sm">{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">₹{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount_amount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount {order.discount_reason && `(${order.discount_reason})`}</span>
                  <span className="font-semibold text-red-600">-₹{order.discount_amount.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Tax</span>
              <span className="font-semibold">₹{order.tax_amount.toLocaleString()}</span>
            </div>
            {(order.delivery_charge ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Delivery</span>
                <span className="font-semibold">₹{(order.delivery_charge ?? 0).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg text-green-600">₹{order.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.menu_item_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Quantity: {item.quantity} × ₹{(typeof item.unit_price === "string" ? parseFloat(item.unit_price) : (item.unit_price ?? 0)).toLocaleString()}
                  </p>
                  {item.special_instructions && (
                    <p className="text-xs text-slate-600 mt-1 italic">Note: {item.special_instructions}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(typeof item.subtotal === "string" ? parseFloat(item.subtotal) : item.subtotal).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Update */}
      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Status</label>
              <Select value={newStatus as string} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PREPARING">Preparing</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === order.status}
              className="w-full"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Order */}
      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Cancel Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <Button
              onClick={handleCancelOrder}
              disabled={isCancelling || !cancelReason.trim()}
              variant="destructive"
              className="w-full"
            >
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {order.special_instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{order.special_instructions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
