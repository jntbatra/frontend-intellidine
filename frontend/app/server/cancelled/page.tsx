"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCancelledOrders } from "@/hooks/use-cancelled-orders";
import { ArrowLeft, AlertCircle, RefreshCw, Pause, Play } from "lucide-react";
import { useEffect } from "react";

export default function ServerCancelledPage() {
  const router = useRouter();
  const {
    orders,
    isLoading,
    isError,
    error,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
  } = useCancelledOrders(
    localStorage.getItem("current_tenant_id") ||
      "11111111-1111-1111-1111-111111111111"
  );

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");
    if (
      !token ||
      (role !== "server" && role !== "admin" && role !== "MANAGER")
    ) {
      router.push("/staff/login");
    }
  }, [router]);

  const getTableNumber = (tableId: string): string => {
    const match = tableId.match(/\d+$/);
    return match ? match[0] : tableId;
  };

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">
            {error instanceof Error
              ? error.message
              : "Failed to load cancelled orders"}
          </p>
          <Button
            onClick={manualRefresh}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Cancelled Orders
            </h1>
            <p className="text-gray-600 mt-1">View all cancelled orders</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={manualRefresh}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={toggleAutoRefresh}
              variant={autoRefresh ? "default" : "outline"}
              className="gap-2"
            >
              {autoRefresh ? (
                <>
                  <Pause className="w-4 h-4" />
                  Auto-refresh: ON
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Auto-refresh: OFF
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push("/server")}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Server
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading cancelled orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No cancelled orders</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="border-2 border-red-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Table {getTableNumber(order.table_id)}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-sm">
                      ✕ Cancelled
                    </Badge>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-3 bg-gray-50 rounded p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Items ({order.items.length})
                      </p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="text-sm text-gray-700">
                            <span className="font-medium">
                              {item.name || item.item_name || "Item"}
                            </span>
                            <span className="text-gray-600">
                              {" "}
                              ×{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ₹{(order.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">
                        ₹{(order.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-red-600">
                        ₹{(order.total_amount || order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
