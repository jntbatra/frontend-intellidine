"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrderRefresh } from "@/hooks/use-order-refresh";
import { ArrowLeft } from "lucide-react";

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name?: string;
  quantity: number;
  price_at_order: number;
  subtotal: number;
  special_instructions?: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  tenant_id: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
  updated_at: string;
  special_instructions?: string;
}

export default function KitchenCompletedPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");
    if (!token || (role !== "kitchen" && role !== "admin" && role !== "MANAGER")) {
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
      });

      let allOrders: Order[] = [];
      if (response?.data && Array.isArray(response.data)) {
        allOrders = response.data;
      }

      const completedOrders = allOrders.filter((o) => o.status === "COMPLETED");
      setOrders(completedOrders);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useOrderRefresh(fetchOrders, { refreshInterval: 5000 });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => router.push("/kitchen")}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Kitchen
        </Button>

        <h1 className="text-3xl font-bold mb-6">Completed Orders</h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No completed orders</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">Order #{order.order_number}</h3>
                      <p className="text-sm text-gray-600">Table {order.table_id}</p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Total: ${order.total_amount?.toFixed(2) || "0.00"}
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
