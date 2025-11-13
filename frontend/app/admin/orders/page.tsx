"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OrderTable } from "@/components/admin/tables/OrderTable";
import { getOrders, Order } from "@/lib/api/admin/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "all", label: "All Payment Methods" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
  { value: "RAZORPAY", label: "Razorpay" },
];



export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [tenantId, setTenantId] = useState<string>("");

  // Load tenant ID from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
    setTenantId(stored);
  }, []);

  // Fetch orders on tenant ID change
  useEffect(() => {
    if (!tenantId) return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getOrders(tenantId, 100, 0);
        console.log("📦 Orders response:", response);

        // Extract nested array structure: response.data.data
        const ordersData = (response.data?.data as Order[]) || [];
        console.log("📦 Extracted orders data:", ordersData);
        console.log("📦 Latest 2 orders:", ordersData.slice(0, 2));
        
        setOrders(ordersData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch orders";
        setError(message);
        console.error("❌ Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [tenantId]);

  // Filter orders based on search and filter criteria
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Payment method filter
    if (paymentFilter !== "all" && order.payment_method !== paymentFilter) {
      return false;
    }

    // Search filter (by order number or table ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_number.toString().includes(query) ||
        order.table_id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const inProgressOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-2">Manage and track all customer orders</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded-full w-8 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</p>
                </div>
                <ShoppingCart size={32} className="text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Orders */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded-full w-8 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completedOrders}</p>
                </div>
                <ShoppingCart size={32} className="text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress Orders */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded-full w-8 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{inProgressOrders}</p>
                </div>
                <ShoppingCart size={32} className="text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Revenue */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded-full w-8 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <ShoppingCart size={32} className="text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by order #, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <OrderTable orders={filteredOrders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
