/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiscounts } from "@/hooks/admin/useDiscounts";
import { DiscountForm } from "@/components/admin/forms/DiscountForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Discount } from "@/lib/api/admin/discounts";
import {
  getDiscountDetailStats,
  generateUsageTrend,
} from "@/lib/constants/mockDiscounts";
import Link from "next/link";

export default function DiscountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getDiscountById, updateDiscount, deleteDiscount } = useDiscounts();

  const discountId = params.id as string;
  const isNewDiscount = discountId === "new";

  const [discount, setDiscount] = useState<Discount | null>(
    isNewDiscount ? null : getDiscountById(discountId) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isNewDiscount && !discount) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-slate-600">Discount not found</p>
        <Link href="/admin/discounts">
          <Button variant="outline" className="mt-4">
            ← Back to Discounts
          </Button>
        </Link>
      </div>
    );
  }

  const handleFormSubmit = async (data: Partial<Discount>) => {
    try {
      setIsSubmitting(true);

      if (isNewDiscount) {
        // Create new discount
        const newDiscount: Discount = {
          id: `disc-${Date.now()}`,
          code: data.code || "",
          name: data.name || "",
          description: data.description || "",
          type: data.type || "percentage",
          value: data.value || 10,
          max_discount: data.max_discount,
          status: data.status || "active",
          conditions: data.conditions,
          valid_from: data.valid_from || new Date().toISOString(),
          valid_until: data.valid_until || new Date().toISOString(),
          is_stackable: data.is_stackable || false,
          usage_limit: data.usage_limit,
          usage_count: 0,
          active_users: 0,
          total_savings: 0,
          created_at: new Date().toISOString(),
          created_by: "admin@intellidine.com",
        };
        setDiscount(newDiscount);
        setSuccessMessage("✅ Discount created successfully!");
        setTimeout(() => router.push("/admin/discounts"), 1500);
      } else if (discount) {
        // Update existing discount
        await updateDiscount(discount.id, data);
        setDiscount({ ...discount, ...data });
        setSuccessMessage("✅ Discount updated successfully!");
        setTimeout(() => setSuccessMessage(""), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (discount && window.confirm("Delete this discount?")) {
      try {
        setIsSubmitting(true);
        await deleteDiscount(discount.id);
        setSuccessMessage("✅ Discount deleted successfully!");
        setTimeout(() => router.push("/admin/discounts"), 1000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Mock analytics for existing discount
  let analytics = null;
  if (discount && !isNewDiscount) {
    analytics = getDiscountDetailStats(discount);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isNewDiscount ? "Create New Discount" : discount?.name}
          </h1>
          <p className="text-slate-600 mt-2">
            {isNewDiscount
              ? "Set up a new promotional offer"
              : `Code: ${discount?.code}`}
          </p>
        </div>
        <Link href="/admin/discounts">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <DiscountForm
            discount={discount || undefined}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
          />
        </div>

        {/* Analytics Sidebar */}
        {discount && analytics && !isNewDiscount && (
          <div className="space-y-4">
            {/* Status Card */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
              <Badge className="mb-2">
                {discount.status.charAt(0).toUpperCase() +
                  discount.status.slice(1)}
              </Badge>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid From:</span>
                  <span className="font-medium">
                    {new Date(discount.valid_from).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid Until:</span>
                  <span className="font-medium">
                    {new Date(discount.valid_until).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Usage Card */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Total Uses:</span>
                    <span className="font-bold">{discount.usage_count}</span>
                  </div>
                  {discount.usage_limit && (
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (discount.usage_count / discount.usage_limit) * 100
                          }%`,
                        }}
                      />
                    </div>
                  )}
                  {discount.usage_limit && (
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.round(
                        (discount.usage_count / discount.usage_limit) * 100
                      )}
                      % of {discount.usage_limit} limit
                    </p>
                  )}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-slate-600">Active Users:</span>
                  <span className="font-bold">{discount.active_users}</span>
                </div>
              </div>
            </Card>

            {/* Impact Card */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Impact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">
                    Total Savings Given
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₹{discount.total_savings}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500 uppercase font-medium">
                    Avg Discount Value
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    ₹
                    {discount.usage_count > 0
                      ? Math.round(
                          discount.total_savings / discount.usage_count
                        )
                      : 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* 30-Day Trend */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">
                30-Day Usage Trend
              </h3>
              <div className="space-y-2">
                {analytics.usage_trend.slice(-7).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-12">
                      {day.date.substring(5)}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded h-2">
                      <div
                        className="bg-purple-500 h-2 rounded"
                        style={{
                          width: `${Math.min((day.count / 10) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-6">{day.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Last 7 days shown (out of 30)
              </p>
            </Card>

            {/* Delete Button */}
            {!isNewDiscount && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                🗑️ Delete Discount
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
