"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrderRefresh } from "@/hooks/use-order-refresh";
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name?: string; // Will be populated from menu service
  price: number;
  quantity: number;
  special_instructions?: string;
  price_at_order: number;
  subtotal: number;
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

const getOrderTypeColor = (tableId: string): string => {
  if (tableId.includes("walk")) return "bg-purple-100 border-purple-300";
  if (tableId.includes("delivery")) return "bg-green-100 border-green-300";
  return "bg-blue-100 border-blue-300";
};

const getOrderTypeLabel = (tableId: string): string => {
  if (tableId.includes("walk")) return "Walk-in";
  if (tableId.includes("delivery")) return "Takeaway";
  return "Dine-in";
};

const formatTimeElapsed = (created_at: string, currentTime: Date): string => {
  const created = new Date(created_at);
  const diffSeconds = Math.floor(
    (currentTime.getTime() - created.getTime()) / 1000
  );
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

export default function KitchenDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    orderId: string | null;
    action: "serve" | "complete" | "cancel" | null;
    orderNumber: string;
  }>({ isOpen: false, orderId: null, action: null, orderNumber: "" });

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");

    if (!token || (role !== "kitchen" && role !== "admin" && role !== "MANAGER")) {
      router.push("/staff/login");
      return;
    }
  }, [router]);

  // Update time every second for live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      const response = await apiClient.get(`/api/orders`, {
        limit: "10",
        offset: "0",
        tenant_id: tenantId,
      });

      let ordersList: any[] = [];
      if (Array.isArray(response)) {
        ordersList = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        ordersList = response.data;
      } else if (
        response &&
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray((response.data as { data: any[] }).data)
      ) {
        ordersList = (response.data as { data: any[] }).data;
      } else {
        console.warn("Unexpected API response format:", response);
        setOrders([]);
        return;
      }

      // Fetch full details for each order to get items
      const detailedOrders = await Promise.all(
        ordersList.map(async (order) => {
          try {
            const detailResponse = await apiClient.get(`/api/orders/${order.id}`);
            let fullOrder: any = {};
            if (detailResponse && detailResponse.data) {
              fullOrder = detailResponse.data;
            } else if (detailResponse) {
              fullOrder = detailResponse;
            } else {
              fullOrder = order; // fallback
            }

            // Extract items from the nested data structure
            let orderItems = [];
            if (fullOrder.items) {
              orderItems = fullOrder.items;
            } else if (fullOrder.data && fullOrder.data.items) {
              orderItems = fullOrder.data.items;
            }

            // Get unique menu item IDs to fetch names
            const menuItemIds = [...new Set(orderItems.map((item: any) => item.menu_item_id).filter(Boolean))];

            // Fetch menu item details for names
            const menuItemsMap: { [key: string]: string } = {};
            await Promise.all(
              menuItemIds.map(async (itemId) => {
                const id = itemId as string;
                try {
                  const menuResponse = await apiClient.get(`/api/menu/items/${id}`);
                  let menuItem: any = {};
                  if (menuResponse && menuResponse.data) {
                    menuItem = menuResponse.data;
                  } else if (menuResponse) {
                    menuItem = menuResponse;
                  }
                  menuItemsMap[id] = menuItem.name || id; // fallback to ID if name not found
                } catch (err) {
                  console.warn(`Failed to fetch menu item ${id}:`, err);
                  menuItemsMap[id] = id; // fallback to ID
                }
              })
            );

            // Add names to items
            const itemsWithNames = orderItems.map((item: any) => ({
              ...item,
              name: menuItemsMap[item.menu_item_id] || item.menu_item_id,
              price: item.price_at_order || item.price || 0,
            }));

            return {
              ...fullOrder,
              status: (fullOrder.status || order.status || "pending").toLowerCase() as Order["status"],
              items: itemsWithNames,
              total_amount: fullOrder.total || fullOrder.total_amount || 0,
              order_number: fullOrder.id || order.id,
              table_id: fullOrder.table_id || order.table_id || "unknown",
              created_at: fullOrder.created_at || order.created_at || new Date().toISOString(),
              updated_at: fullOrder.updated_at || order.updated_at || new Date().toISOString(),
            };
          } catch (err) {
            console.warn(`Failed to fetch details for order ${order.id}:`, err);
            return {
              ...order,
              status: (order.status || "pending").toLowerCase() as Order["status"],
              items: [],
              total_amount: order.total || 0,
              order_number: order.id,
              table_id: order.table_id || "unknown",
              created_at: order.created_at || new Date().toISOString(),
              updated_at: order.updated_at || new Date().toISOString(),
            };
          }
        })
      );

      setOrders(detailedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please refresh the page.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use the order refresh hook with 12 second interval
  useOrderRefresh(fetchOrders, { refreshInterval: 12000 });

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: Order["status"]) => {
      if (newStatus === "served") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          setConfirmDialog({
            isOpen: true,
            orderId,
            action: "serve",
            orderNumber: order.order_number,
          });
          return;
        }
      }

      if (newStatus === "completed") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          setConfirmDialog({
            isOpen: true,
            orderId,
            action: "complete",
            orderNumber: order.order_number,
          });
          return;
        }
      }

      if (newStatus === "cancelled") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          setConfirmDialog({
            isOpen: true,
            orderId,
            action: "cancel",
            orderNumber: order.order_number,
          });
          return;
        }
      }

      await performStatusUpdate(orderId, newStatus);
    },
    [orders]
  );

  const performStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
    } catch (err) {
      console.warn("API failed, using local update", err);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
          : o
      )
    );
    setIsUpdating(false);
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.orderId && confirmDialog.action) {
      let newStatus: Order["status"];
      if (confirmDialog.action === "serve") {
        newStatus = "served";
      } else if (confirmDialog.action === "complete") {
        newStatus = "completed";
      } else {
        newStatus = "cancelled";
      }
      await performStatusUpdate(confirmDialog.orderId, newStatus);
      setConfirmDialog({
        isOpen: false,
        orderId: null,
        action: null,
        orderNumber: "",
      });
    }
  };

  const newOrders = orders
    .filter((o) => o.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const preparingOrders = orders
    .filter((o) => o.status === "preparing")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const servedOrders = orders
    .filter((o) => o.status === "served")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const previousOrders = orders
    .filter(
      (o) =>
        o.status === "completed" ||
        o.status === "cancelled" ||
        o.status === "served"
    )
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ); // Most recent first

  const OrderCard = ({
    order,
    isSelected,
  }: {
    order: Order;
    isSelected: boolean;
  }) => (
    <Card
      onClick={() => setSelectedOrderId(order.id)}
      className={`cursor-pointer border-2 transition-all duration-200 ${
        isSelected
          ? "border-orange-500 shadow-lg scale-105 ring-2 ring-orange-400"
          : "border-gray-300 hover:border-gray-400 hover:shadow-md"
      } ${getOrderTypeColor(order.table_id)} min-h-[180px]`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedOrderId(order.id);
        }
      }}
      aria-label={`Order ${order.order_number} for ${getOrderTypeLabel(
        order.table_id
      )}, status ${order.status}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Order Number + Type Badge + Timer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">
              {order.order_number}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {getOrderTypeLabel(order.table_id)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="text-white text-sm px-3 py-1.5 whitespace-nowrap">
              {order.status === "pending"
                ? "🔴 New"
                : order.status === "preparing"
                ? "🟡 Making"
                : order.status === "ready"
                ? "🟢 Ready"
                : order.status === "served"
                ? "🍽️ Served"
                : "⚫ Done"}
            </Badge>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
          <Clock className="h-4 w-4" />
          <span className="font-semibold">
            {formatTimeElapsed(order.created_at, currentTime)}
          </span>
        </div>

        {/* Items - More visible */}
        <div className="space-y-1 max-h-16 overflow-hidden">
          {(order.items || []).sort((a, b) => (a.name || "").localeCompare(b.name || "")).slice(0, 3).map((item) => (
            <div key={item.menu_item_id} className="text-sm leading-relaxed">
              <span className="font-semibold">{item.quantity}x</span>{" "}
              {item.name || item.menu_item_id}
            </div>
          ))}
          {(order.items || []).length > 3 && (
            <div className="text-sm text-gray-500">
              +{(order.items || []).length - 3} more
            </div>
          )}
        </div>

        {/* Action Buttons - Larger and more accessible */}
        {isSelected && (
          <div className="pt-2 space-y-2">
            {order.status === "pending" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "preparing")}
                disabled={isUpdating}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-base h-10"
                aria-label={`Start preparing order ${order.order_number}`}
              >
                🔴 START PREPARING
              </Button>
            )}
            {order.status === "preparing" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "served")}
                disabled={isUpdating}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-base h-10"
                aria-label={`Serve order ${order.order_number}`}
              >
                🍽️ SERVE ORDER
              </Button>
            )}
            {order.status === "served" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "completed")}
                disabled={isUpdating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-base h-10"
                aria-label={`Mark order ${order.order_number} as completed`}
              >
                ✅ PAYMENT RECEIVED
              </Button>
            )}
            <Button
              onClick={() => updateOrderStatus(order.id, "cancelled")}
              disabled={isUpdating}
              variant="outline"
              className="w-full border-red-500 text-red-600 font-bold py-3 text-base h-10"
              aria-label={`Cancel order ${order.order_number}`}
            >
              ❌ CANCEL
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Kitchen Display System</h1>
                <p className="text-sm text-gray-600">
                  {newOrders.length + preparingOrders.length} active orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowPreviousOrders(true)}
                variant="outline"
                className="border-gray-300 hover:border-gray-400"
              >
                📋 Previous Orders ({previousOrders.length})
              </Button>
              <div className="text-right">
                <p className="text-4xl font-bold text-orange-600">
                  {newOrders.length}
                </p>
                <p className="text-sm text-gray-600">New Orders</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4 border-b border-gray-200">
            <Button
              onClick={() => router.push("/kitchen")}
              variant="ghost"
              className="rounded-none border-b-2 border-orange-500 font-bold text-orange-600"
            >
              🍳 Active Orders
            </Button>
            <Button
              onClick={() => router.push("/kitchen/cancelled")}
              variant="ghost"
              className="rounded-none border-b-2 border-transparent hover:border-gray-300"
            >
              ❌ Cancelled ({previousOrders.filter((o) => o.status === "cancelled").length})
            </Button>
            <Button
              onClick={() => router.push("/kitchen/completed")}
              variant="ghost"
              className="rounded-none border-b-2 border-transparent hover:border-gray-300"
            >
              ✅ Completed ({previousOrders.filter((o) => o.status === "completed").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">Error loading orders</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <Button
              onClick={fetchOrders}
              variant="outline"
              size="sm"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}

        {isLoading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Orders Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                  🔴 New Orders ({newOrders.length})
                </h2>
                <p className="text-sm text-gray-600">
                  Orders waiting to be started
                </p>
              </div>

              {newOrders.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-lg text-gray-500">No new orders</p>
                  <p className="text-sm text-gray-400">
                    New orders will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrderId === order.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Preparing Orders Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
                <h2 className="text-xl font-bold text-yellow-600 mb-2 flex items-center gap-2">
                  🟡 Preparing ({preparingOrders.length})
                </h2>
                <p className="text-sm text-gray-600">
                  Orders currently being prepared
                </p>
              </div>

              {preparingOrders.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-lg text-gray-500">No orders preparing</p>
                  <p className="text-sm text-gray-400">
                    Started orders will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrderId === order.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setConfirmDialog({
            isOpen: false,
            orderId: null,
            action: null,
            orderNumber: "",
          })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === "serve" ? (
                <>
                  🍽️ Serve Order
                </>
              ) : confirmDialog.action === "complete" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Complete Order
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Cancel Order
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to{" "}
              {confirmDialog.action === "serve" 
                ? "serve" 
                : confirmDialog.action === "complete"
                ? "mark"
                : "cancel"} order{" "}
              <span className="font-semibold text-gray-900">
                {confirmDialog.orderNumber}
              </span>{" "}
              as{" "}
              {confirmDialog.action === "serve" 
                ? "served"
                : confirmDialog.action === "complete"
                ? "completed"
                : "cancelled"}?
              {confirmDialog.action === "cancel" && (
                <span className="block mt-2 text-red-600 font-medium">
                  This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  isOpen: false,
                  orderId: null,
                  action: null,
                  orderNumber: "",
                })
              }
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isUpdating}
              className={`flex-1 ${
                confirmDialog.action === "serve"
                  ? "bg-green-600 hover:bg-green-700"
                  : confirmDialog.action === "complete"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isUpdating
                ? "Processing..."
                : confirmDialog.action === "serve"
                ? "Serve Order"
                : confirmDialog.action === "complete"
                ? "Complete Order"
                : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Orders Dialog */}
      <Dialog open={showPreviousOrders} onOpenChange={setShowPreviousOrders}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📋 Previous Orders ({previousOrders.length})
            </DialogTitle>
            <DialogDescription>
              Completed, served, and cancelled orders from today
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {previousOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">No previous orders</p>
                <p className="text-sm text-gray-400">
                  Completed, served, and cancelled orders will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previousOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`border-2 ${getOrderTypeColor(
                      order.table_id
                    )} min-h-[180px]`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight">
                            {order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {getOrderTypeLabel(order.table_id)}
                          </p>
                        </div>
                        <Badge
                          className={`text-white text-sm px-3 py-1.5 whitespace-nowrap ${
                            order.status === "completed"
                              ? "bg-gray-600"
                              : order.status === "ready"
                              ? "bg-green-600"
                              : order.status === "served"
                              ? "bg-blue-600"
                              : "bg-red-600"
                          }`}
                        >
                          {order.status === "completed"
                            ? "✅ Completed"
                            : order.status === "ready"
                            ? "🟢 Ready"
                            : order.status === "served"
                            ? "🍽️ Served"
                            : "❌ Cancelled"}
                        </Badge>
                      </div>

                      {/* Timer */}
                      <div className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">
                          {formatTimeElapsed(order.created_at, currentTime)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 max-h-16 overflow-hidden">
                        {(order.items || []).slice(0, 3).map((item) => (
                          <div
                            key={item.menu_item_id}
                            className="text-sm leading-relaxed"
                          >
                            <span className="font-semibold">
                              {item.quantity}x
                            </span>{" "}
                            {item.name || item.menu_item_id}
                          </div>
                        ))}
                        {(order.items || []).length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{(order.items || []).length - 3} more
                          </div>
                        )}
                      </div>

                      {/* Reopen Button */}
                      <Button
                        onClick={() => updateOrderStatus(order.id, "pending")}
                        disabled={isUpdating}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 text-base h-10"
                        aria-label={`Reopen order ${order.order_number}`}
                      >
                        🔄 REOPEN
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreviousOrders(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
