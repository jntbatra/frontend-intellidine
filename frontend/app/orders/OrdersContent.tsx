"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingDown,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import {
  useCustomerOrders,
  getOrderStatusColor,
  formatOrderStatus,
} from "@/hooks/use-customer-orders";
import type { CustomerOrder, OrderItem } from "@/lib/api/customer/orders";

export function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenant_id");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");

    if (!token || role === "kitchen") {
      router.push("/");
      return;
    }
    setIsReady(true);
  }, [router]);

  // Initialize hook
  const {
    orders,
    total,
    page,
    limit,
    isLoading,
    isError,
    error,
    refetch,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useCustomerOrders(tenantId || "", { limit: 20 });

  if (!isReady || !tenantId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Access
              </h2>
              <p className="text-gray-600">
                Please scan a valid restaurant QR code to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
        <Navigation cartItemCount={0} />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900 mb-1">
                  Failed to Load Orders
                </h2>
                <p className="text-red-800 mb-4">
                  {error instanceof Error
                    ? error.message
                    : "An error occurred while fetching your orders"}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading your orders...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navigation cartItemCount={0} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Your Order History
              </h1>
              <p className="text-gray-600 mt-1">
                View all your past orders and details
              </p>
            </div>

            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Orders Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t placed any orders yet. Start ordering from
                  our menu!
                </p>
                <Button
                  onClick={() => router.push(`/menu?tenant_id=${tenantId}`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Browse Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4 mb-6">
              {orders.map((order) => {
                const statusColor = getOrderStatusColor(order.status);
                const showDiscount =
                  order.discount_amount && order.discount_amount > 0;

                return (
                  <Card
                    key={order.id}
                    className="border-orange-200 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                Order #{order.order_number}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                            <Badge
                              className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border} shrink-0`}
                            >
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </div>

                          {/* Items Preview */}
                          <div className="text-sm text-gray-600 mb-3">
                            <p className="font-medium">
                              {order.items?.length || 0} item
                              {order.items?.length !== 1 ? "s" : ""}
                            </p>
                            <div className="line-clamp-2">
                              {order.items
                                ?.map(
                                  (item) =>
                                    `${item.quantity}x ${item.menu_item_name}`
                                )
                                .join(", ")}
                            </div>
                          </div>
                        </div>

                        {/* Price Info */}
                        <div className="shrink-0 border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-gray-600 mb-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm">Total</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-orange-600 mb-3">
                              ₹{order.total.toFixed(2)}
                            </p>

                            {showDiscount && (
                              <div className="flex items-center justify-end gap-1 text-green-600 mb-3">
                                <TrendingDown className="w-3 h-3" />
                                <span className="text-xs">
                                  {order.discount_reason}
                                </span>
                              </div>
                            )}

                            <Button
                              onClick={() => setSelectedOrderId(order.id)}
                              variant="outline"
                              size="sm"
                              className="w-full gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
              <div className="text-sm text-gray-600">
                Page {page} of {Math.ceil(total / limit)} • Total {total} order
                {total !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={goToPreviousPage}
                  disabled={!hasPreviousPage}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          orders={orders}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

interface OrderDetailModalProps {
  orderId: string;
  orders: CustomerOrder[];
  onClose: () => void;
}

function OrderDetailModal({ orderId, orders, onClose }: OrderDetailModalProps) {
  const order = orders.find((o) => o.id === orderId);

  if (!order) return null;

  const statusColor = getOrderStatusColor(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Order Details</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Order Header */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order.order_number}
                </h2>
                <p className="text-gray-600 mt-1">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge
                className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
              >
                {formatOrderStatus(order.status)}
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Items Ordered
            </h3>
            <div className="space-y-2">
              {order.items?.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.quantity}x {item.menu_item_name}
                    </p>
                    {item.special_instructions && (
                      <p className="text-xs text-gray-600 mt-1">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 ml-2 shrink-0">
                    ₹{item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6 pb-6 border-b space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>

            {order.discount_amount && order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>{order.discount_reason}</span>
                </div>
                <span className="font-bold">
                  -₹{order.discount_amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Tax (18%)</span>
              <span>₹{order.tax_amount.toFixed(2)}</span>
            </div>

            {order.delivery_charge && order.delivery_charge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>₹{order.delivery_charge.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold text-orange-600">
              <span>Total Amount</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-900 capitalize">
                {order.payment_method}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-semibold text-gray-900 capitalize">
                {order.payment_status || "Pending"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prep Time</p>
              <p className="font-semibold text-gray-900">
                {order.estimated_prep_time || "—"} mins
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Table</p>
              <p className="font-semibold text-gray-900">{order.table_id}</p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
