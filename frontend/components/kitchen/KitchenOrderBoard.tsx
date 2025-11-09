"use client";

import React from "react";
import { OrderColumn } from "./OrderColumn";
import {
  useKitchenOrders,
  groupOrdersByStatus,
} from "@/hooks/use-kitchen-orders";
import { AlertCircle, RefreshCw, Pause, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { OrderStatus } from "@/lib/api/admin/orders";

interface KitchenOrderBoardProps {
  tenantId: string;
}

export function KitchenOrderBoard({ tenantId }: KitchenOrderBoardProps) {
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

  const groupedOrders = groupOrdersByStatus(orders);

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
              Kitchen Order Display
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time order management system
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

            <Link href="/kitchen/cancelled">
              <Button variant="outline" className="gap-2" size="lg">
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
                {groupedOrders.pending.length + groupedOrders.preparing.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">New:</span>
              <span className="font-bold text-yellow-600 ml-2">
                {groupedOrders.pending.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Preparing:</span>
              <span className="font-bold text-blue-600 ml-2">
                {groupedOrders.preparing.length}
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
          {/* New Orders Column */}
          <div className="lg:h-auto">
            <OrderColumn
              title="New Orders"
              orders={groupedOrders.pending}
              columnColor="yellow"
              onOrderStatusChange={handleOrderStatusChange}
              onCancelOrder={handleCancelOrder}
              isUpdating={isUpdating}
              isCancelling={isCancelling}
              emptyMessage="No new orders"
            />
          </div>

          {/* Preparing Orders Column */}
          <div className="lg:h-auto">
            <OrderColumn
              title="Preparing"
              orders={groupedOrders.preparing}
              columnColor="blue"
              onOrderStatusChange={handleOrderStatusChange}
              onCancelOrder={handleCancelOrder}
              isUpdating={isUpdating}
              isCancelling={isCancelling}
              emptyMessage="No orders being prepared"
            />
          </div>
        </div>
      )}
    </div>
  );
}
