"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTable } from "@/components/admin/tables/OrderTable";
import { useOrders } from "@/hooks/admin/useOrders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";

// Mock order data
const MOCK_ORDERS = [
  {
    id: "ORD-001",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-101",
    customer_name: "Rajesh Kumar",
    order_number: 1001,
    items: [
      { id: "item-1", name: "Butter Chicken", quantity: 2, price: 350, total: 700, special_instructions: "Less spicy" },
      { id: "item-5", name: "Naan", quantity: 3, price: 50, total: 150, special_instructions: "" },
    ],
    subtotal: 850,
    tax: 136,
    total_amount: 986,
    status: "completed",
    payment_method: "card",
    notes: "Customer requested extra sauce",
    created_at: "2025-11-08T10:30:00Z",
    completed_at: "2025-11-08T10:45:00Z",
    updated_at: "2025-11-08T10:45:00Z",
  },
  {
    id: "ORD-002",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-205",
    customer_name: "Priya Singh",
    order_number: 1002,
    items: [
      { id: "item-2", name: "Paneer Tikka", quantity: 1, price: 280, total: 280, special_instructions: "No onions" },
      { id: "item-3", name: "Dal Fry", quantity: 2, price: 180, total: 360, special_instructions: "" },
      { id: "item-7", name: "Mango Lassi", quantity: 2, price: 120, total: 240, special_instructions: "Extra cold" },
    ],
    subtotal: 880,
    tax: 141,
    total_amount: 1021,
    status: "in_preparation",
    payment_method: "cash",
    notes: "",
    created_at: "2025-11-08T11:05:00Z",
    completed_at: null,
    updated_at: "2025-11-08T11:05:00Z",
  },
  {
    id: "ORD-003",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-312",
    customer_name: "Amit Patel",
    order_number: 1003,
    items: [
      { id: "item-4", name: "Tandoori Chicken", quantity: 3, price: 320, total: 960, special_instructions: "Extra lemon" },
    ],
    subtotal: 960,
    tax: 154,
    total_amount: 1114,
    status: "pending",
    payment_method: "upi",
    notes: "VIP customer - priority handling",
    created_at: "2025-11-08T11:15:00Z",
    completed_at: null,
    updated_at: "2025-11-08T11:15:00Z",
  },
  {
    id: "ORD-004",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-418",
    customer_name: "Deepak Sharma",
    order_number: 1004,
    items: [
      { id: "item-8", name: "Chicken Biryani", quantity: 2, price: 280, total: 560, special_instructions: "More masala" },
      { id: "item-6", name: "Gulab Jamun", quantity: 2, price: 100, total: 200, special_instructions: "" },
    ],
    subtotal: 760,
    tax: 122,
    total_amount: 882,
    status: "ready",
    payment_method: "card",
    notes: "Delivery to room 418",
    created_at: "2025-11-08T11:25:00Z",
    completed_at: null,
    updated_at: "2025-11-08T11:35:00Z",
  },
  {
    id: "ORD-005",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-105",
    customer_name: "Neha Gupta",
    order_number: 1005,
    items: [
      { id: "item-1", name: "Butter Chicken", quantity: 1, price: 350, total: 350, special_instructions: "" },
      { id: "item-5", name: "Naan", quantity: 1, price: 50, total: 50, special_instructions: "Butter naan" },
      { id: "item-7", name: "Mango Lassi", quantity: 1, price: 120, total: 120, special_instructions: "" },
    ],
    subtotal: 520,
    tax: 83,
    total_amount: 603,
    status: "completed",
    payment_method: "card",
    notes: "",
    created_at: "2025-11-08T10:00:00Z",
    completed_at: "2025-11-08T10:15:00Z",
    updated_at: "2025-11-08T10:15:00Z",
  },
  {
    id: "ORD-006",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-210",
    customer_name: "Vikram Kumar",
    order_number: 1006,
    items: [
      { id: "item-3", name: "Dal Fry", quantity: 1, price: 180, total: 180, special_instructions: "" },
      { id: "item-2", name: "Paneer Tikka", quantity: 2, price: 280, total: 560, special_instructions: "Extra crispy" },
    ],
    subtotal: 740,
    tax: 118,
    total_amount: 858,
    status: "cancelled",
    payment_method: "cash",
    notes: "Customer changed mind",
    created_at: "2025-11-08T09:30:00Z",
    completed_at: null,
    updated_at: "2025-11-08T09:45:00Z",
  },
  {
    id: "ORD-007",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    table_id: "TABLE-320",
    customer_name: "Zara Khan",
    order_number: 1007,
    items: [
      { id: "item-8", name: "Chicken Biryani", quantity: 1, price: 280, total: 280, special_instructions: "Extra raita" },
    ],
    subtotal: 280,
    tax: 45,
    total_amount: 325,
    status: "in_preparation",
    payment_method: "upi",
    notes: "",
    created_at: "2025-11-08T11:45:00Z",
    completed_at: null,
    updated_at: "2025-11-08T11:45:00Z",
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_preparation", label: "In Preparation" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "all", label: "All Payment Methods" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "wallet", label: "Wallet" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const {
    filteredOrders,
    filterOrders,
    deleteOrder,
  } = useOrders(MOCK_ORDERS);

  // Filter orders whenever filters change
  useEffect(() => {
    filterOrders(
      statusFilter === "all" ? undefined : statusFilter,
      searchQuery,
      paymentFilter === "all" ? undefined : paymentFilter
    );
  }, [searchQuery, statusFilter, paymentFilter, filterOrders]);

  const handleDeleteClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrderId) return;

    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      deleteOrder(selectedOrderId);
      console.log("✅ Order deleted:", selectedOrderId);
      setDeleteConfirmOpen(false);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate statistics
  const totalOrders = MOCK_ORDERS.length;
  const completedOrders = MOCK_ORDERS.filter((o) => o.status === "completed").length;
  const pendingOrders = MOCK_ORDERS.filter((o) => o.status === "pending" || o.status === "in_preparation").length;
  const totalRevenue = MOCK_ORDERS.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-2">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{pendingOrders}</p>
              </div>
              <ShoppingCart size={32} className="text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

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
                placeholder="Search by customer name, order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
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
            Showing {filteredOrders.length} of {MOCK_ORDERS.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={filteredOrders}
            onDelete={handleDeleteClick}
            isLoading={isDeleting}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Delete Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
