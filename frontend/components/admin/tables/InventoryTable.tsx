"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { useState } from "react";

interface InventoryTableProps {
  items: any[];
  onEdit?: (id: string) => void;
  onStockAdjust?: (id: string) => void;
  isLoading?: boolean;
}

export function InventoryTable({
  items,
  onEdit,
  onStockAdjust,
  isLoading,
}: InventoryTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Item Name
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Current Stock
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Min / Max
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Unit
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">
                Supplier
              </th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700">
                Value
              </th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const stockPercentage =
                  (item.current_stock / item.maximum_capacity) * 100;
                const inventoryValue = item.current_stock * item.cost_per_unit;

                return (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.menu_item_name}
                        </p>
                        <p className="text-xs text-slate-500">{item.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.current_stock}
                        </p>
                        <div className="w-16 h-2 bg-slate-200 rounded-full mt-1 mx-auto overflow-hidden">
                          <div
                            className={`h-full ${
                              item.is_low_stock
                                ? "bg-red-500"
                                : stockPercentage > 80
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700">
                      {item.minimum_threshold} / {item.maximum_capacity}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.is_low_stock ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          Low Stock ⚠️
                        </Badge>
                      ) : stockPercentage > 80 ? (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          Overstock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {item.supplier || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-900">
                        ₹{inventoryValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          onClick={() => onStockAdjust?.(item.id)}
                          disabled={isLoading}
                          title="Adjust Stock"
                        >
                          <span className="text-xs font-bold text-blue-600">
                            ⟷
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-purple-100"
                          onClick={() => onEdit?.(item.id)}
                          disabled={isLoading}
                          title="Edit Item"
                        >
                          <Edit2 size={16} className="text-purple-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
