"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryTable } from "@/components/admin/tables/InventoryTable";
import { LowStockAlerts } from "@/components/admin/alerts/LowStockAlerts";
import { StockAdjustmentModal } from "@/components/admin/modals/StockAdjustmentModal";
import { useInventory } from "@/hooks/admin/useInventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  MOCK_INVENTORY_ITEMS,
  MOCK_INVENTORY_ALERTS,
} from "@/lib/constants/mockInventory";

export default function InventoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");
  const [alerts, setAlerts] = useState(MOCK_INVENTORY_ALERTS);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const { filteredItems, filterItems, updateStock, adjustStock } =
    useInventory(MOCK_INVENTORY_ITEMS);

  // Filter items whenever filters change
  useEffect(() => {
    filterItems(
      searchQuery,
      stockStatusFilter === "all" ? undefined : stockStatusFilter
    );
  }, [searchQuery, stockStatusFilter, filterItems]);

  const handleStockAdjustClick = (itemId: string) => {
    const item = MOCK_INVENTORY_ITEMS.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setAdjustmentModalOpen(true);
    }
  };

  const handleAdjustmentSubmit = async (adjustment: {
    type: string;
    quantity: number;
    reason: string;
    notes: string;
  }) => {
    if (!selectedItem) return;

    try {
      setIsAdjusting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Apply adjustment
      if (adjustment.type === "in") {
        adjustStock(selectedItem.id, adjustment.quantity, "in");
      } else {
        adjustStock(selectedItem.id, adjustment.quantity, "out");
      }

      // Log adjustment
      console.log("✅ Stock adjusted:", {
        itemId: selectedItem.id,
        adjustment,
      });

      // Update alerts if stock is no longer low
      const updatedItem = MOCK_INVENTORY_ITEMS.find(
        (i) => i.id === selectedItem.id
      );
      if (updatedItem && !updatedItem.is_low_stock) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.inventory_item_id === selectedItem.id
              ? { ...alert, status: "resolved" }
              : alert
          )
        );
      }

      setAdjustmentModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to adjust stock:", error);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAlertAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
      )
    );
    console.log("✅ Alert acknowledged:", alertId);
  };

  const handleAlertResolve = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resolved",
              resolved_at: new Date().toISOString(),
            }
          : alert
      )
    );
    console.log("✅ Alert resolved:", alertId);
  };

  // Calculate statistics
  const totalItems = MOCK_INVENTORY_ITEMS.length;
  const lowStockCount = MOCK_INVENTORY_ITEMS.filter(
    (i) => i.is_low_stock
  ).length;
  const overstockCount = MOCK_INVENTORY_ITEMS.filter(
    (i) => i.current_stock > i.maximum_capacity * 0.9
  ).length;
  const totalInventoryValue = MOCK_INVENTORY_ITEMS.reduce(
    (sum, item) => sum + item.current_stock * item.cost_per_unit,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="text-slate-600 mt-2">
            Manage stock levels and monitor inventory alerts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/inventory/history")}
          className="shrink-0"
        >
          📋 View Adjustment History
        </Button>
      </div>

      {/* Low Stock Alerts */}
      <LowStockAlerts
        alerts={alerts.filter((a) => a.status === "active")}
        onAcknowledge={handleAlertAcknowledge}
        onResolve={handleAlertResolve}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Items</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalItems}
                </p>
              </div>
              <Package size={32} className="text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {lowStockCount}
                </p>
              </div>
              <AlertTriangle size={32} className="text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overstock</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {overstockCount}
                </p>
              </div>
              <TrendingUp size={32} className="text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{totalInventoryValue.toLocaleString()}
                </p>
              </div>
              <Package size={32} className="text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />
              <Input
                placeholder="Search by item name, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stock Status Filter */}
            <Select
              value={stockStatusFilter}
              onValueChange={setStockStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low_stock">Low Stock Only</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Showing {filteredItems.length} of {MOCK_INVENTORY_ITEMS.length}{" "}
            items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable
            items={filteredItems}
            onStockAdjust={handleStockAdjustClick}
            isLoading={isAdjusting}
          />
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={adjustmentModalOpen}
        item={selectedItem}
        onClose={() => {
          setAdjustmentModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleAdjustmentSubmit}
        isLoading={isAdjusting}
      />
    </div>
  );
}
