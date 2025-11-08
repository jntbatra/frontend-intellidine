"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock orders data - same as in listing page
const ALL_MOCK_ORDERS = [
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
  { value: "pending", label: "Pending" },
  { value: "in_preparation", label: "In Preparation" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_preparation: "bg-blue-100 text-blue-800",
  ready: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Find order from mock data
        const foundOrder = ALL_MOCK_ORDERS.find((o) => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      setIsUpdatingStatus(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update local state
      setOrder({ ...order, status: newStatus });
      
      console.log("✅ Order status updated:", {
        orderId: order.id,
        newStatus,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="pt-6 flex items-center justify-center gap-2 text-slate-600 py-12">
            Loading order details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Orders
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error || "Order not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createdDate = new Date(order.created_at);
  const completedDate = order.completed_at ? new Date(order.completed_at) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Order #{order.order_number}
            </h1>
            <p className="text-slate-600 mt-2">{order.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">{order.customer_name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Table</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">{order.table_id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">
              {PAYMENT_METHOD_LABELS[order.payment_method]}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Current Status:</span>
              <Badge className={STATUS_COLORS[order.status]}>
                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
              </Badge>
            </div>
            <Select value={order.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-slate-600">Order Created</p>
              <p className="font-semibold text-slate-900">
                {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
              </p>
            </div>
            {completedDate && (
              <div>
                <p className="text-slate-600">Order Completed</p>
                <p className="font-semibold text-slate-900">
                  {completedDate.toLocaleDateString()} {completedDate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.items.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Item</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-700">₹{item.price}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">₹{item.total}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs">
                      {item.special_instructions ? item.special_instructions : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 ml-auto w-fit">
            <div className="flex gap-8">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold text-slate-900 w-24 text-right">₹{order.subtotal}</span>
            </div>
            <div className="flex gap-8">
              <span className="text-slate-600">Tax (18%):</span>
              <span className="font-semibold text-slate-900 w-24 text-right">₹{order.tax}</span>
            </div>
            <div className="flex gap-8 border-t pt-2">
              <span className="font-semibold text-slate-900">Total:</span>
              <span className="font-bold text-lg text-slate-900 w-24 text-right">₹{order.total_amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
