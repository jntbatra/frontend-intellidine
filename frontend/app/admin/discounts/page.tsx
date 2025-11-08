"use client";

import { useState } from "react";
import { useDiscounts } from "@/hooks/admin/useDiscounts";
import { DiscountTable } from "@/components/admin/tables/DiscountTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DiscountsPage() {
  const router = useRouter();
  const {
    filteredDiscounts,
    stats,
    selectedStatusFilter,
    setSelectedStatusFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    searchQuery,
    setSearchQuery,
    deleteDiscount,
  } = useDiscounts();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteDiscount(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Discounts & Promotions
          </h1>
          <p className="text-slate-600 mt-2">
            Manage promotional codes and discount offers
          </p>
        </div>
        <Link href="/admin/discounts/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            ➕ Create Discount
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Total Discounts
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.total_discounts}
              </p>
            </div>
            <div className="text-3xl">🎟️</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Active
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.active_discounts}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Total Savings
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₹{(stats.total_savings / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Avg Usage
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.average_usage_per_discount}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Most Used
              </p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {stats.most_used_discount?.code || "N/A"}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </Card>
      </div>

      {/* Top Discount Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Discount Types</h3>
        <div className="flex flex-wrap gap-3">
          {stats.top_discount_types.slice(0, 6).map((type) => (
            <div
              key={type.type}
              className="bg-slate-50 rounded-lg p-4 flex-1 min-w-[150px]"
            >
              <p className="text-sm font-medium text-slate-600">
                {type.type.charAt(0).toUpperCase() + type.type.slice(1)}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold text-slate-900">
                  {type.count}
                </p>
                <p className="text-xs text-slate-500">
                  ₹{(type.savings / 1000).toFixed(1)}K savings
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">
              Search Code or Name
            </label>
            <Input
              placeholder="Search discounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">
              Status
            </label>
            <Select
              value={selectedStatusFilter || "all"}
              onValueChange={(value) =>
                setSelectedStatusFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select
              value={selectedTypeFilter || "all"}
              onValueChange={(value) =>
                setSelectedTypeFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="bogo">Buy 1 Get 1</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="loyalty">Loyalty</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">
            Found {filteredDiscounts.length} of {stats.total_discounts} discounts
          </span>
          {(selectedStatusFilter || selectedTypeFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatusFilter(null);
                setSelectedTypeFilter(null);
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Discounts Table */}
      <DiscountTable
        discounts={filteredDiscounts}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
