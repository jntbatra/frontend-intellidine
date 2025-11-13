"use client";

import React from "react";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
  ArrowLeft,
  CreditCard,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";
import { toast } from "sonner";

// Default tenant ID for development/testing
const DEFAULT_TENANT_ID = "11111111-1111-1111-1111-111111111111";

interface CompletedOrderItemProps {
  orderId: string;
  orderNumber: number;
  tableId: string;
  total: number;
  paymentMethod: "cash" | "card" | "upi" | "wallet" | null;
  onPaymentSelect: (orderId: string, method: "cash" | "card") => void;
  isProcessing: boolean;
}

function CompletedOrderItem({
  orderId,
  orderNumber,
  tableId,
  total,
  paymentMethod,
  onPaymentSelect,
  isProcessing,
}: CompletedOrderItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Order #{orderNumber}
          </h3>
          <p className="text-gray-600">Table {tableId}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">
            ₹{total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Amount</p>
        </div>
      </div>

      <div className="flex gap-2">
        {!paymentMethod ? (
          <>
            <Button
              onClick={() => onPaymentSelect(orderId, "cash")}
              disabled={isProcessing}
              className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              <Banknote className="w-4 h-4" />
              Cash Payment
            </Button>
            <Button
              onClick={() => onPaymentSelect(orderId, "card")}
              disabled={isProcessing}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <CreditCard className="w-4 h-4" />
              Razorpay
            </Button>
          </>
        ) : (
          <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded text-sm font-semibold text-center">
            ✓ {paymentMethod === "cash" ? "Cash" : "Razorpay"} Payment Complete
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompletedOrdersPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  const {
    orders,
    isLoading,
    isError,
    error,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
  } = useKitchenOrders(tenantId, !!tenantId);

  useEffect(() => {
    // Get tenant ID from localStorage, or use default for development
    const storedTenantId =
      localStorage.getItem("current_tenant_id") ||
      process.env.NEXT_PUBLIC_TENANT_ID ||
      DEFAULT_TENANT_ID;

    // Set it in localStorage if not already there
    if (!localStorage.getItem("current_tenant_id")) {
      localStorage.setItem("current_tenant_id", storedTenantId);
    }

    // Set a dummy auth token for development if not present
    if (!localStorage.getItem("auth_token")) {
      localStorage.setItem("auth_token", "dev-token-server-display");
    }

    setTenantId(storedTenantId);
    setIsReady(true);
  }, []);

  // Get completed orders
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const handlePaymentSelect = async (
    orderId: string,
    method: "cash" | "card"
  ) => {
    setProcessingOrderId(orderId);
    try {
      if (method === "cash") {
        // For cash, just mark as complete
        toast.success("Cash payment recorded");
      } else {
        // For Razorpay, show message
        toast.info("Opening Razorpay payment gateway...");
        // In a real app, you would integrate with Razorpay here
      }

      // Note: Orders arrive here already in "completed" status
      // Payment collection is just recording the payment method, not changing status
      // In a real system, you might POST to a /payments endpoint to record the transaction

      // Clear after a moment
      setTimeout(() => setProcessingOrderId(null), 1000);
    } catch {
      toast.error("Failed to process payment");
      setProcessingOrderId(null);
    }
  };

  if (!isReady || !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Collection
          </h1>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">
            {error instanceof Error ? error.message : "Failed to load orders"}
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
    <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-200 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/server">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Server
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Payment Collection
              </h1>
              <p className="text-gray-600 mt-1">
                Complete payment for served orders
              </p>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex gap-2">
            <Button
              onClick={manualRefresh}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
              size="lg"
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
              size="lg"
            >
              {autoRefresh ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 bg-white rounded-lg p-3 shadow flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-gray-600">Pending Payments:</span>
              <span className="font-bold text-amber-600 ml-2">
                {completedOrders.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-emerald-600 ml-2">
                ₹
                {completedOrders
                  .reduce((sum, o) => sum + o.total_amount, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Auto-refresh: {autoRefresh ? "ON (15s)" : "OFF"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {isLoading && !orders.length ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </div>
              <p className="mt-4 text-gray-700 font-medium">
                Loading orders...
              </p>
            </div>
          </div>
        ) : completedOrders.length > 0 ? (
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <CompletedOrderItem
                key={order.id}
                orderId={order.id}
                orderNumber={order.order_number}
                tableId={order.table_id}
                total={order.total_amount}
                paymentMethod={
                  (order.payment_method || null) as
                    | "cash"
                    | "card"
                    | "upi"
                    | "wallet"
                    | null
                }
                onPaymentSelect={handlePaymentSelect}
                isProcessing={processingOrderId === order.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              All Payments Complete!
            </h3>
            <p className="text-gray-600">No pending payments at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
