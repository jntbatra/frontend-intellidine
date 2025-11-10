import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { OrderItem } from "@/lib/api/admin/orders";

interface ItemCutterProps {
  orderId: string;
  items: OrderItem[];
}

interface CutItemsState {
  [orderId: string]: string[]; // order_id -> array of cut item_ids
}

export function ItemCutter({ orderId, items }: ItemCutterProps) {
  const [cutItems, setCutItems] = useState<Set<string>>(new Set());

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("kitchen_cut_items");
    if (stored) {
      try {
        const allCutItems: CutItemsState = JSON.parse(stored);
        setCutItems(new Set(allCutItems[orderId] || []));
      } catch (e) {
        console.error("Failed to parse cut items from sessionStorage:", e);
      }
    }
  }, [orderId]);

  // Save to sessionStorage whenever cut items change
  const updateCutItems = (newCutItems: Set<string>) => {
    setCutItems(newCutItems);

    // Update sessionStorage
    const stored = sessionStorage.getItem("kitchen_cut_items");
    let allCutItems: CutItemsState = {};

    if (stored) {
      try {
        allCutItems = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse from sessionStorage:", e);
      }
    }

    allCutItems[orderId] = Array.from(newCutItems);
    sessionStorage.setItem("kitchen_cut_items", JSON.stringify(allCutItems));
  };

  const toggleItemCut = (itemId: string) => {
    const newCutItems = new Set(cutItems);
    if (newCutItems.has(itemId)) {
      newCutItems.delete(itemId);
    } else {
      newCutItems.add(itemId);
    }
    updateCutItems(newCutItems);
  };

  const cutCount = cutItems.size;
  const totalCount = items.length;
  const allCut = cutCount === totalCount && totalCount > 0;

  return (
    <div className="bg-amber-50 rounded-lg p-3 border-2 border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-amber-900">
          ✂️ Cut Items ({cutCount}/{totalCount})
        </h4>
        {allCut && (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
            All Cut ✓
          </span>
        )}
      </div>

      {/* Items as clickable bars */}
      <div className="space-y-2">
        {items.map((item) => {
          const isCut = cutItems.has(item.id);

          return (
            <button
              key={item.id}
              onClick={() => toggleItemCut(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                isCut
                  ? "bg-green-200 border-2 border-green-400 line-through opacity-70"
                  : "bg-amber-100 border-2 border-amber-300 hover:bg-amber-150"
              }`}
            >
              {isCut ? (
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-amber-700 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-600">
                  Qty: {item.quantity} @ ₹{item.price}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-700 shrink-0">
                ₹{item.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info text */}
      <div className="mt-3 text-xs text-amber-700 italic">
        Click items to mark as cut. Progress is saved in your session.
      </div>
    </div>
  );
}
