"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { X } from "lucide-react";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  item: any;
  onClose: () => void;
  onSubmit: (adjustment: {
    type: "in" | "out" | "damage" | "adjustment";
    quantity: number;
    reason: string;
    notes: string;
  }) => void;
  isLoading?: boolean;
}

export function StockAdjustmentModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<
    "in" | "out" | "damage" | "adjustment"
  >("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = () => {
    if (!quantity || !reason) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      type: adjustmentType,
      quantity: parseInt(quantity),
      reason,
      notes,
    });

    // Reset form
    setQuantity("");
    setReason("");
    setNotes("");
    setAdjustmentType("in");
  };

  const getNewStock = () => {
    const qty = parseInt(quantity) || 0;
    if (adjustmentType === "in") return item.current_stock + qty;
    if (adjustmentType === "out") return item.current_stock - qty;
    if (adjustmentType === "damage") return item.current_stock - qty;
    return item.current_stock;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Adjust Stock</CardTitle>
            <CardDescription className="mt-1">
              {item.menu_item_name}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Stock */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Current Stock</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {item.current_stock}
              </span>
              <span className="text-slate-600">{item.unit}</span>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label htmlFor="adjustment-type" className="text-sm font-semibold">
              Adjustment Type
            </Label>
            <Select
              value={adjustmentType}
              onValueChange={(val: any) => setAdjustmentType(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In (Received)</SelectItem>
                <SelectItem value="out">Stock Out (Sold/Used)</SelectItem>
                <SelectItem value="damage">Damage/Loss</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-semibold">
              Quantity *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold">
              Reason *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentType === "in" && (
                  <>
                    <SelectItem value="received_from_supplier">
                      Received from Supplier
                    </SelectItem>
                    <SelectItem value="return_stock">Return Stock</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                  </>
                )}
                {adjustmentType === "out" && (
                  <>
                    <SelectItem value="sold_to_customer">
                      Sold to Customer
                    </SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="inventory_count">
                      Inventory Count
                    </SelectItem>
                  </>
                )}
                {adjustmentType === "damage" && (
                  <>
                    <SelectItem value="damaged_product">
                      Damaged Product
                    </SelectItem>
                    <SelectItem value="expired_product">
                      Expired Product
                    </SelectItem>
                    <SelectItem value="lost_product">Lost Product</SelectItem>
                  </>
                )}
                {adjustmentType === "adjustment" && (
                  <>
                    <SelectItem value="stock_correction">
                      Stock Correction
                    </SelectItem>
                    <SelectItem value="physical_count">
                      Physical Count
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Notes (Optional)
            </Label>
            <textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* New Stock Preview */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-600 mb-1">New Stock</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-900">
                {getNewStock()}
              </span>
              <span className="text-blue-700">{item.unit}</span>
              {getNewStock() < item.minimum_threshold && (
                <span className="text-xs text-red-600 ml-auto">
                  ⚠️ Below minimum
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !quantity || !reason}
            >
              {isLoading ? "Adjusting..." : "Apply Adjustment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
