"use client";

import React from "react";
import { OrderColumn } from "../kitchen/OrderColumn";
import {
  useKitchenOrders,
  groupOrdersByStatus,
} from "@/hooks/use-kitchen-orders";
import {
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { OrderStatus } from "@/lib/api/admin/orders";

interface ServerOrderBoardProps {
  tenantId: string;
}

export function ServerOrderBoard({ tenantId }: ServerOrderBoardProps) {
  const {
    orders,
    isLoading,
    isError,
    error,
    updateOrderStatus,
    isUpdating,
    cancelOrder,
    isCancelling,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
  } = useKitchenOrders(tenantId);

  // Group orders by status
  const groupedOrders = groupOrdersByStatus(orders);

  // Get served orders (filter by served status)
  const servedOrders = orders.filter((o) => o.status === "served");

  // Get ready orders for server display
  const readyOrders = groupedOrders.ready || [];

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus({ orderId, status });
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    cancelOrder({ orderId, reason });
  };

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
      <div className="max-w-full mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Server Display System
            </h1>
            <p className="text-gray-600 mt-1">
              Order delivery & payment management
            </p>
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

            <Link href="/server/completed">
              <Button
                variant="default"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Completed Orders
              </Button>
            </Link>

            <Link href="/server/cancelled">
              <Button
                variant="outline"
                className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                size="lg"
              >
                <XCircle className="w-4 h-4" />
                Cancelled Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 bg-white rounded-lg p-3 shadow flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-bold text-gray-900 ml-2">
                {readyOrders.length + servedOrders.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ready:</span>
              <span className="font-bold text-green-600 ml-2">
                {readyOrders.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Served:</span>
              <span className="font-bold text-purple-600 ml-2">
                {servedOrders.length}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Auto-refresh: {autoRefresh ? "ON (15s)" : "OFF"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading && !orders.length ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
            <p className="mt-4 text-gray-700 font-medium">Loading orders...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max h-[calc(100vh-220px)]">
          {/* Ready Orders Column */}
          <div className="lg:h-auto">
            <OrderColumn
              title="Ready for Pickup"
              orders={readyOrders}
              columnColor="green"
              onOrderStatusChange={handleOrderStatusChange}
              onCancelOrder={handleCancelOrder}
              isUpdating={isUpdating}
              isCancelling={isCancelling}
              emptyMessage="No orders ready for pickup"
            />
          </div>

          {/* Served Orders Column */}
          <div className="lg:h-auto">
            <OrderColumn
              title="Served to Table"
              orders={servedOrders}
              columnColor="purple"
              onOrderStatusChange={handleOrderStatusChange}
              onCancelOrder={handleCancelOrder}
              isUpdating={isUpdating}
              isCancelling={isCancelling}
              emptyMessage="No orders being served yet"
            />
          </div>
        </div>
      )}
    </div>
  );
}
