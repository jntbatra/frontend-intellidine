"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_STOCK_ADJUSTMENTS } from "@/lib/constants/mockInventory";

const ADJUSTMENT_TYPE_LABELS: Record<string, string> = {
  in: "Stock In",
  out: "Stock Out",
  damage: "Damage/Loss",
  adjustment: "Adjustment",
};

const ADJUSTMENT_TYPE_COLORS: Record<string, string> = {
  in: "bg-green-100 text-green-800",
  out: "bg-blue-100 text-blue-800",
  damage: "bg-red-100 text-red-800",
  adjustment: "bg-yellow-100 text-yellow-800",
};

const ADJUSTMENT_TYPE_ICONS: Record<string, string> = {
  in: "▼",
  out: "▲",
  damage: "✕",
  adjustment: "◈",
};

export default function AdjustmentHistoryPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Inventory
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Adjustment History
        </h1>
        <p className="text-slate-600 mt-2">
          Track all inventory adjustments and stock movements
        </p>
      </div>

      {/* Adjustments List */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustments</CardTitle>
          <CardDescription>
            Total adjustments: {MOCK_STOCK_ADJUSTMENTS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_STOCK_ADJUSTMENTS.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No adjustments recorded yet
              </p>
            ) : (
              MOCK_STOCK_ADJUSTMENTS.map((adjustment) => {
                const isExpanded = expandedId === adjustment.id;

                return (
                  <div
                    key={adjustment.id}
                    className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : adjustment.id)
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${ADJUSTMENT_TYPE_COLORS[adjustment.adjustment_type]}`}
                        >
                          {ADJUSTMENT_TYPE_ICONS[adjustment.adjustment_type]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {ADJUSTMENT_TYPE_LABELS[adjustment.adjustment_type]}
                          </p>
                          <p className="text-sm text-slate-600">
                            {adjustment.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {adjustment.adjustment_type === "in" ? "+" : "-"}
                            {adjustment.quantity}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(adjustment.created_at).toLocaleDateString()}{" "}
                            {new Date(adjustment.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="text-slate-400">
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-slate-50 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              INVENTORY ITEM
                            </p>
                            <p className="text-sm text-slate-900">
                              {adjustment.inventory_item_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              QUANTITY
                            </p>
                            <p className="text-sm text-slate-900">
                              {adjustment.quantity} units
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              ADJUSTED BY
                            </p>
                            <p className="text-sm text-slate-900">
                              {adjustment.adjusted_by}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              TYPE
                            </p>
                            <Badge
                              className={ADJUSTMENT_TYPE_COLORS[adjustment.adjustment_type]}
                            >
                              {ADJUSTMENT_TYPE_LABELS[adjustment.adjustment_type]}
                            </Badge>
                          </div>
                        </div>

                        {adjustment.notes && (
                          <div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              NOTES
                            </p>
                            <p className="text-sm text-slate-900 bg-white p-2 rounded border border-slate-200">
                              {adjustment.notes}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-slate-600 font-semibold mb-1">
                            DATE & TIME
                          </p>
                          <p className="text-sm text-slate-900">
                            {new Date(adjustment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">
                STOCK IN
              </p>
              <p className="text-2xl font-bold text-green-600">
                {MOCK_STOCK_ADJUSTMENTS.filter(
                  (a) => a.adjustment_type === "in"
                ).reduce((sum, a) => sum + a.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">
                STOCK OUT
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {MOCK_STOCK_ADJUSTMENTS.filter(
                  (a) => a.adjustment_type === "out"
                ).reduce((sum, a) => sum + a.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">
                DAMAGE/LOSS
              </p>
              <p className="text-2xl font-bold text-red-600">
                {MOCK_STOCK_ADJUSTMENTS.filter(
                  (a) => a.adjustment_type === "damage"
                ).reduce((sum, a) => sum + a.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">
                NET MOVEMENT
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_STOCK_ADJUSTMENTS.reduce((sum, a) => {
                  if (a.adjustment_type === "in") return sum + a.quantity;
                  return sum - a.quantity;
                }, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
