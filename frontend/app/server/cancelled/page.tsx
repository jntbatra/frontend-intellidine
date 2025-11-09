"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrderRefresh } from "@/hooks/use-order-refresh";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name?: string;
  item_name?: string;
  quantity: number;
  price_at_order?: number;
  unit_price?: string;
  subtotal?: number;
  special_instructions?: string;
  special_requests?: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  tenant_id: string;
  items?: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled" | "in_preparation" | "CANCELLED" | "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED";
  total_amount?: number;
  total?: number;
  subtotal?: number;
  tax_amount?: number;
  created_at: string;
  updated_at: string;
  special_instructions?: string;
}

export default function ServerCancelledPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");
    if (!token || (role !== "server" && role !== "admin" && role !== "MANAGER")) {
      router.push("/staff/login");
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      const response = await apiClient.get(`/api/orders`, {
        limit: "100",
        offset: "0",
        tenant_id: tenantId,
        status: "CANCELLED",
        include_items: "true",
      });

      let allOrders: Order[] = [];
      if (response?.data && Array.isArray(response.data)) {
        allOrders = response.data;
      } else if (response?.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (Array.isArray(data.data)) {
          allOrders = data.data as Order[];
        }
      }

      const cancelledOrders = allOrders.filter(
        (o) =>
          o.status === "cancelled" ||
          o.status === "CANCELLED"
      );
      
      console.log("📦 Fetched orders:", allOrders.length);
      console.log("🗑️ Cancelled orders:", cancelledOrders.length);
      console.log("Sample order status:", allOrders[0]?.status);
      
      setOrders(cancelledOrders);
    } catch (error) {
      console.error("Error fetching cancelled orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useOrderRefresh(fetchOrders, { refreshInterval: 5000 });

  const getTableNumber = (tableId: string): string => {
    const match = tableId.match(/\d+$/);
    return match ? match[0] : tableId;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Cancelled Orders</h1>
            <p className="text-gray-600 mt-1">View all cancelled orders</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchOrders}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
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
              <Card key={order.id} className="border-2 border-red-200 hover:shadow-lg transition-shadow">
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
                            <span className="font-medium">{item.name || item.item_name || "Item"}</span>
                            <span className="text-gray-600"> ×{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">₹{(order.tax_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-red-600">₹{((order.total_amount || order.total) || 0).toFixed(2)}</span>
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
