/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Discount } from "@/lib/api/admin/discounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface DiscountTableProps {
  discounts: Discount[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function DiscountTable({
  discounts,
  onDelete,
  isLoading = false,
}: DiscountTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-purple-100 text-purple-800";
      case "fixed":
        return "bg-blue-100 text-blue-800";
      case "bogo":
        return "bg-pink-100 text-pink-800";
      case "seasonal":
        return "bg-orange-100 text-orange-800";
      case "loyalty":
        return "bg-indigo-100 text-indigo-800";
      case "bundle":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUsagePercentage = (discount: Discount) => {
    if (!discount.usage_limit) return 0;
    return Math.round(((discount.usage_count ?? 0) / discount.usage_limit) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Loading discounts...</div>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-slate-400 text-lg">No discounts found</div>
        <p className="text-slate-500 text-sm mt-1">
          Create your first discount to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Code</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Value</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Usage</TableHead>
            <TableHead className="font-semibold">Savings</TableHead>
            <TableHead className="font-semibold">Valid Until</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow key={discount.id} className="hover:bg-slate-50">
              <TableCell className="font-mono text-sm font-semibold">
                {discount.code}
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="font-medium text-slate-900">
                  {discount.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(discount.description ?? "").substring(0, 40)}...
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getTypeColor(discount.type)}`}>
                  {discount.type.charAt(0).toUpperCase() +
                    discount.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold">
                {discount.type === "percentage" ? (
                  <span className="text-orange-600">{discount.value}%</span>
                ) : discount.type === "fixed_amount" ? (
                  <span className="text-green-600">₹{discount.value}</span>
                ) : (
                  <span className="text-blue-600">{discount.value}% off</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(discount.status)}>
                  {discount.status.charAt(0).toUpperCase() +
                    discount.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${getUsagePercentage(discount)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {getUsagePercentage(discount)}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {discount.usage_count}
                  {discount.usage_limit ? `/${discount.usage_limit}` : ""}
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                <span className="text-green-600">₹{discount.total_savings}</span>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(discount.valid_until).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Link href={`/admin/discounts/${discount.id}`}>
                    <Button variant="ghost" size="sm">
                      ✏️ Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      if (onDelete && window.confirm("Delete this discount?")) {
                        onDelete(discount.id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
