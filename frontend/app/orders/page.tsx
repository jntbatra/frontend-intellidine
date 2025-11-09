"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  History,
  Search,
  Calendar,
  Clock,
  Receipt,
  ChefHat,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import { Navigation } from "@/components/navigation";

interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  tenant_id: string;
  customer_id: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
  updated_at: string;
  special_instructions?: string;
  payment_status: "pending" | "paid" | "refunded";
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "preparing":
      return "bg-orange-500";
    case "ready":
      return "bg-green-500";
    case "served":
      return "bg-blue-500";
    case "completed":
      return "bg-blue-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "served":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getPaymentStatusColor = (status: Order["payment_status"]) => {
  switch (status) {
    case "paid":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "refunded":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current customer ID from localStorage or use default
  const [currentCustomerId, setCurrentCustomerId] = useState<string>("");

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");

    if (!token || role === "kitchen") {
      window.location.href = "/";
      return;
    }
  }, []);

  useEffect(() => {
    // Get customer ID from localStorage or generate one
    let customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      customerId = `cust-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("customer_id", customerId);
    }
    setCurrentCustomerId(customerId);
  }, []);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    if (!currentCustomerId) return;

    // Simulate fetching orders from API
    const mockOrders: Order[] = [
      {
        id: "1",
        order_number: "#ORD-885822",
        table_id: "tbl-001",
        tenant_id: "11111111-1111-1111-1111-111111111111",
        customer_id: currentCustomerId, // Current customer's order
        status: "completed",
        payment_status: "paid",
        total_amount: 580,
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
        updated_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
        ).toISOString(),
        items: [
          {
            menu_item_id: "item_001",
            name: "Paneer Tikka",
            price: 280,
            quantity: 1,
            special_instructions: "Extra spicy",
          },
          {
            menu_item_id: "item_004",
            name: "Butter Chicken",
            price: 380,
            quantity: 1,
            special_instructions: "Less oil",
          },
        ],
        special_instructions: "Please pack separately",
      },
      {
        id: "2",
        order_number: "#ORD-885821",
        table_id: "tbl-002",
        tenant_id: "11111111-1111-1111-1111-111111111111",
        customer_id: currentCustomerId, // Current customer's order
        status: "completed",
        payment_status: "paid",
        total_amount: 250,
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days ago
        updated_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000
        ).toISOString(),
        items: [
          {
            menu_item_id: "item_003",
            name: "Dal Makhani",
            price: 250,
            quantity: 1,
          },
        ],
      },
      {
        id: "3",
        order_number: "#ORD-885820",
        table_id: "tbl-003",
        tenant_id: "11111111-1111-1111-1111-111111111111",
        customer_id: "cust-other-001", // Different customer's order (won't show for current user)
        status: "completed",
        payment_status: "paid",
        total_amount: 120,
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 week ago
        updated_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000
        ).toISOString(),
        items: [
          {
            menu_item_id: "item_006",
            name: "Gulab Jamun",
            price: 120,
            quantity: 1,
            special_instructions: "Extra syrup",
          },
        ],
      },
      {
        id: "4",
        order_number: "#ORD-885819",
        table_id: "tbl-004",
        tenant_id: "11111111-1111-1111-1111-111111111111",
        customer_id: currentCustomerId, // Current customer's order
        status: "cancelled",
        payment_status: "refunded",
        total_amount: 450,
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(), // 10 days ago
        updated_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000
        ).toISOString(),
        items: [
          {
            menu_item_id: "item_002",
            name: "Chicken Biryani",
            price: 320,
            quantity: 1,
            special_instructions: "No onions",
          },
          {
            menu_item_id: "item_005",
            name: "Raita",
            price: 80,
            quantity: 1,
          },
        ],
        special_instructions: "Customer cancelled due to delay",
      },
      {
        id: "5",
        order_number: "#ORD-885818",
        table_id: "tbl-001",
        tenant_id: "11111111-1111-1111-1111-111111111111",
        customer_id: currentCustomerId, // Current customer's order
        status: "completed",
        payment_status: "paid",
        total_amount: 890,
        created_at: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 weeks ago
        updated_at: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000
        ).toISOString(),
        items: [
          {
            menu_item_id: "item_001",
            name: "Paneer Tikka",
            price: 280,
            quantity: 2,
            special_instructions: "One extra spicy, one medium",
          },
          {
            menu_item_id: "item_004",
            name: "Butter Chicken",
            price: 380,
            quantity: 1,
          },
          {
            menu_item_id: "item_006",
            name: "Gulab Jamun",
            price: 120,
            quantity: 1,
          },
        ],
      },
    ];

    // Filter orders for current customer only
    const customerOrders = mockOrders.filter(
      (order) => order.customer_id === currentCustomerId
    );

    setTimeout(() => {
      setOrders(customerOrders);
      setFilteredOrders(customerOrders);
      setIsLoading(false);
    }, 1000);
  }, [currentCustomerId]);

  // Filter orders based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          order.table_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const getOrdersByStatus = (status: Order["status"]) => {
    return filteredOrders.filter((order) => order.status === status);
  };

  const totalSpent = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total_amount, 0);

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  if (isLoading) {
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
              <History className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Order History
              </h1>
              <p className="text-lg text-gray-600">
                View your previous orders from Intellidine
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completedOrders}
              </div>
              <div className="text-sm text-gray-600">Completed Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{totalSpent}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹
                {completedOrders > 0
                  ? Math.round(totalSpent / completedOrders)
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Order</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders by number, item, or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  All Orders ({filteredOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({getOrdersByStatus("completed").length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({getOrdersByStatus("cancelled").length})
                </TabsTrigger>
                <TabsTrigger value="recent">Recent (7 days)</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <OrderList
                  orders={filteredOrders}
                  onSelectOrder={setSelectedOrder}
                  selectedOrderId={selectedOrder?.id}
                />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <OrderList
                  orders={getOrdersByStatus("completed")}
                  onSelectOrder={setSelectedOrder}
                  selectedOrderId={selectedOrder?.id}
                />
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                <OrderList
                  orders={getOrdersByStatus("cancelled")}
                  onSelectOrder={setSelectedOrder}
                  selectedOrderId={selectedOrder?.id}
                />
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                <OrderList
                  orders={filteredOrders.filter((order) => {
                    const orderDate = new Date(order.created_at);
                    const weekAgo = new Date(
                      Date.now() - 7 * 24 * 60 * 60 * 1000
                    );
                    return orderDate >= weekAgo;
                  })}
                  onSelectOrder={setSelectedOrder}
                  selectedOrderId={selectedOrder?.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <OrderDetails order={selectedOrder} />
            ) : (
              <Card className="sticky top-6 shadow-xl border-2 border-blue-100">
                <CardContent className="p-8 text-center">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Select an Order
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click on any order from the list to view detailed
                    information and receipt.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderList({
  orders,
  onSelectOrder,
  selectedOrderId,
}: {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}) {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-sm text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </Card>
      ) : (
        orders.map((order) => (
          <Card
            key={order.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
              selectedOrderId === order.id
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            } ${
              order.status === "completed"
                ? "border-l-blue-500 bg-blue-50/30"
                : order.status === "cancelled"
                ? "border-l-red-500 bg-red-50/30"
                : "border-l-gray-500 bg-gray-50/30"
            }`}
            onClick={() => onSelectOrder(order)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      order.status === "completed"
                        ? "bg-blue-500"
                        : order.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Table {order.table_id.replace("tbl-", "")}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    className={`${getStatusColor(
                      order.status
                    )} text-white font-medium px-3 py-1`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-500">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Badge
                    className={`${getPaymentStatusColor(
                      order.payment_status
                    )} text-white text-xs px-2 py-1`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </Badge>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  ₹{order.total_amount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <Card className="sticky top-6 shadow-xl border-2 border-blue-100">
      <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {order.order_number}
          </span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <Badge
              className={`${getStatusColor(
                order.status
              )} text-white font-semibold px-4 py-2 text-sm`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Table</p>
            <p className="text-lg font-bold text-blue-900">
              {order.table_id.replace("tbl-", "")}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800">Total Amount</p>
            <p className="text-lg font-bold text-green-900">
              ₹{order.total_amount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-purple-800">Order Date</p>
            <p className="text-sm font-semibold text-purple-900">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-purple-700">
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-orange-800">Payment</p>
            <Badge
              className={`${getPaymentStatusColor(
                order.payment_status
              )} text-white text-xs px-2 py-1`}
            >
              {order.payment_status.charAt(0).toUpperCase() +
                order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-gray-900">Order Items</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-lg text-gray-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
                {item.special_instructions && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 font-medium">
                      <strong>Note:</strong> {item.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <>
            <Separator />
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-2 text-orange-900">
                Order Instructions
              </h4>
              <p className="text-orange-800 font-medium">
                {order.special_instructions}
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>

          {order.status === "completed" && (
            <Button
              variant="outline"
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                /* Reorder functionality */
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reorder Similar Items
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
