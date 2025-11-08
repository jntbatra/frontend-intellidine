"use client";

import { useState } from "react";
import { Discount, DiscountType } from "@/lib/api/admin/discounts";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";

interface DiscountFormProps {
  discount?: Discount;
  onSubmit: (data: Partial<Discount>) => Promise<void>;
  isLoading?: boolean;
}

export function DiscountForm({
  discount,
  onSubmit,
  isLoading = false,
}: DiscountFormProps) {
  const [formData, setFormData] = useState({
    code: discount?.code || "",
    name: discount?.name || "",
    description: discount?.description || "",
    type: (discount?.type || "percentage") as DiscountType,
    value: discount?.value || 10,
    max_discount: discount?.max_discount || undefined,
    status: discount?.status || "active",
    valid_from: discount?.valid_from.split("T")[0] || "",
    valid_until: discount?.valid_until.split("T")[0] || "",
    usage_limit: discount?.usage_limit || undefined,
    is_stackable: discount?.is_stackable || false,
    min_order_value: discount?.conditions?.min_order_value || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = "Discount code is required";
    if (
      formData.code.trim().length < 3 ||
      formData.code.trim().length > 20
    ) {
      newErrors.code = "Code must be 3-20 characters";
    }
    if (!formData.name.trim()) newErrors.name = "Discount name is required";
    if (formData.value <= 0) newErrors.value = "Value must be greater than 0";
    if (
      formData.type === "percentage" &&
      (formData.value < 1 || formData.value > 100)
    ) {
      newErrors.value = "Percentage must be between 1-100%";
    }
    if (!formData.valid_from) newErrors.valid_from = "Start date is required";
    if (!formData.valid_until)
      newErrors.valid_until = "End date is required";
    if (new Date(formData.valid_from) >= new Date(formData.valid_until)) {
      newErrors.valid_until = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitted(true);
      await onSubmit({
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        conditions: {
          min_order_value: formData.min_order_value,
        },
      });
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Discount Code *</Label>
            <Input
              id="code"
              placeholder="e.g., WELCOME20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={errors.code ? "border-red-500" : ""}
              disabled={!!discount}
            />
            {errors.code && (
              <p className="text-xs text-red-600 mt-1">{errors.code}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Discount Type *</Label>
            <Select value={formData.type} onValueChange={(value) => {
              setFormData({
                ...formData,
                type: value as DiscountType,
                value: value === 'fixed' ? 100 : 10
              });
            }}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                <SelectItem value="bogo">Buy 1 Get 1</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="loyalty">Loyalty</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="name">Discount Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Welcome Offer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this discount offers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Value & Limits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Value & Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">
              {formData.type === "percentage" ? "Percentage (%)" : "Amount (₹)"} *
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="10"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: parseFloat(e.target.value) })
              }
              min="0"
              step="0.1"
              className={errors.value ? "border-red-500" : ""}
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value}</p>
            )}
          </div>

          {formData.type === "percentage" && (
            <div>
              <Label htmlFor="max_discount">Max Discount Cap (₹)</Label>
              <Input
                id="max_discount"
                type="number"
                placeholder="500"
                value={formData.max_discount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                min="0"
              />
            </div>
          )}

          <div>
            <Label htmlFor="usage_limit">Usage Limit (Total Uses)</Label>
            <Input
              id="usage_limit"
              type="number"
              placeholder="1000"
              value={formData.usage_limit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usage_limit: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="min_order">Min Order Value (₹)</Label>
            <Input
              id="min_order"
              type="number"
              placeholder="300"
              value={formData.min_order_value || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_order_value: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              min="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="stackable"
            checked={formData.is_stackable}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_stackable: checked as boolean })
            }
          />
          <Label htmlFor="stackable" className="font-normal cursor-pointer">
            Can be combined with other discounts
          </Label>
        </div>
      </Card>

      {/* Dates & Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Validity & Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from">Valid From *</Label>
            <Input
              id="from"
              type="date"
              value={formData.valid_from}
              onChange={(e) =>
                setFormData({ ...formData, valid_from: e.target.value })
              }
              className={errors.valid_from ? "border-red-500" : ""}
            />
            {errors.valid_from && (
              <p className="text-xs text-red-600 mt-1">{errors.valid_from}</p>
            )}
          </div>

          <div>
            <Label htmlFor="until">Valid Until *</Label>
            <Input
              id="until"
              type="date"
              value={formData.valid_until}
              onChange={(e) =>
                setFormData({ ...formData, valid_until: e.target.value })
              }
              className={errors.valid_until ? "border-red-500" : ""}
            />
            {errors.valid_until && (
              <p className="text-xs text-red-600 mt-1">{errors.valid_until}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) =>
              setFormData({ ...formData, status: value as any })
            }>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin mr-2">⏳</div>
              {discount ? "Updating..." : "Creating..."}
            </>
          ) : discount ? (
            "Update Discount"
          ) : (
            "Create Discount"
          )}
        </Button>
      </div>
    </form>
  );
}
