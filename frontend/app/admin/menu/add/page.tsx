"use client";

/* eslint-disable react/no-unescaped-entities */

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MenuItemForm,
  MenuItemFormData,
} from "@/components/admin/forms/MenuItemForm";
import { useEffect, useState } from "react";

const DEFAULT_CATEGORIES = [
  "APPETIZERS",
  "MAIN_COURSE",
  "BREADS",
  "DESSERTS",
  "BEVERAGES",
];

export default function AddMenuItemPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get tenant_id from localStorage
    const stored =
      localStorage.getItem("current_tenant_id") ||
      localStorage.getItem("tenant_id");
    if (stored) {
      setTenantId(stored);
    }
  }, []);

  const handleSubmit = async (data: MenuItemFormData) => {
    if (!tenantId) {
      throw new Error("Tenant ID not found");
    }

    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock item ID
      const newItemId = `item-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Log the submission (for demo purposes)
      console.log("✅ Menu item added successfully:", {
        id: newItemId,
        ...data,
        tenant_id: tenantId,
      });

      // Show success feedback and redirect
      router.push("/admin/menu");
    } catch (error) {
      console.error("Failed to add menu item:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Menu Item
        </h1>
        <p className="text-slate-600 mt-2">
          Create a new menu item for your restaurant
        </p>
      </div>

      {/* Form Card */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
          <CardDescription>
            Enter the menu item details below. All fields marked with * are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="add"
            categories={DEFAULT_CATEGORIES}
          />
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200 max-w-3xl">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • <strong>Name:</strong> Keep it clear and appetizing (e.g., "Spicy
            Paneer Tikka")
          </p>
          <p>
            • <strong>Price:</strong> Enter in rupees without currency symbol
          </p>
          <p>
            • <strong>Preparation Time:</strong> Estimate in minutes from order
            to delivery
          </p>
          <p>
            • <strong>Allergens:</strong> Mark all applicable allergens for
            customer safety
          </p>
          <p>
            • <strong>Tags:</strong> Use tags to highlight special items like
            bestsellers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
