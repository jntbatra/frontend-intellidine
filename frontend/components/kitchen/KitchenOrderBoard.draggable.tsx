/**
 * OPTIONAL: Advanced Kitchen Order Board with Drag-and-Drop
 *
 * This is an alternative implementation that adds drag-and-drop functionality.
 * To use this instead of the basic KitchenOrderBoard:
 * 1. Install react-beautiful-dnd: npm install react-beautiful-dnd @types/react-beautiful-dnd
 * 2. Replace the import in kitchen/page.tsx
 *
 * Note: The current implementation (KitchenOrderBoard.tsx) does not require this dependency
 * and works perfectly fine without drag-and-drop.
 */

"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { OrderCard } from "./OrderCard";
import {
  useKitchenOrders,
  groupOrdersByStatus,
} from "@/hooks/use-kitchen-orders";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/api/admin/orders";

interface DraggableKitchenOrderBoardProps {
  tenantId: string;
}

export function DraggableKitchenOrderBoard({
  tenantId,
}: DraggableKitchenOrderBoardProps) {
  const {
    orders,
    isLoading,
    isError,
    error,
    updateOrderStatus,
    isUpdating,
    manualRefresh,
  } = useKitchenOrders(tenantId);

  const groupedOrders = groupOrdersByStatus(orders);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Map droppable ID to order status
    const statusMap: Record<string, OrderStatus> = {
      pending: "pending",
      preparing: "in_preparation",
      ready: "ready",
    };

    const newStatus = statusMap[destination.droppableId];
    if (newStatus) {
      updateOrderStatus({ orderId: draggableId, status: newStatus });
    }
  };

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-200 p-4">
        {/* Header */}
        <div className="max-w-full mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Kitchen Order Display (Drag & Drop)
              </h1>
              <p className="text-gray-600 mt-1">
                Drag orders between columns to update status
              </p>
            </div>

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
          </div>

          {/* Status Bar */}
          <div className="mt-4 bg-white rounded-lg p-3 shadow flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-bold text-gray-900 ml-2">
                  {orders.length}
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
              <div>
                <span className="text-gray-600">Ready:</span>
                <span className="font-bold text-green-600 ml-2">
                  {groupedOrders.ready.length}
                </span>
              </div>
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
              <p className="mt-4 text-gray-700 font-medium">
                Loading orders...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* New Orders Column */}
            <Droppable droppableId="pending">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-yellow-50 rounded-lg border-2 border-yellow-300 p-4 min-h-96 ${
                    snapshot.isDraggingOver ? "bg-yellow-100" : ""
                  }`}
                >
                  <h2 className="text-xl font-bold text-yellow-900 mb-4">
                    New Orders ({groupedOrders.pending.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedOrders.pending.map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <OrderCard order={order} isUpdating={isUpdating} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Preparing Orders Column */}
            <Droppable droppableId="preparing">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-blue-50 rounded-lg border-2 border-blue-300 p-4 min-h-96 ${
                    snapshot.isDraggingOver ? "bg-blue-100" : ""
                  }`}
                >
                  <h2 className="text-xl font-bold text-blue-900 mb-4">
                    Preparing ({groupedOrders.preparing.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedOrders.preparing.map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <OrderCard order={order} isUpdating={isUpdating} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Ready Orders Column */}
            <Droppable droppableId="ready">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-green-50 rounded-lg border-2 border-green-300 p-4 min-h-96 ${
                    snapshot.isDraggingOver ? "bg-green-100" : ""
                  }`}
                >
                  <h2 className="text-xl font-bold text-green-900 mb-4">
                    Ready for Pickup ({groupedOrders.ready.length})
                  </h2>
                  <div className="space-y-3">
                    {groupedOrders.ready.map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <OrderCard order={order} isUpdating={isUpdating} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
