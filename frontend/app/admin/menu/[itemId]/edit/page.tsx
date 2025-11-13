"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItemForm, MenuItemFormData } from "@/components/admin/forms/MenuItemForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MenuItem, updateMenuItem, getMenuItem } from "@/lib/api/admin/menu";

const CATEGORIES = ["Appetizers", "Main Course", "Sides", "Desserts"];

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>("");

  // Load tenant ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
    setTenantId(stored);
  }, []);

  // Fetch menu item details
  useEffect(() => {
    if (!itemId || !tenantId) return;

    const fetchMenuItemData = async () => {
      try {
        setIsLoadingItem(true);
        
        // Call real API
        const response = await getMenuItem(itemId as string, tenantId);
        
        // Response structure: { data: { ...menuItem } }
        const itemData = response.data as unknown as MenuItem;
        
        if (itemData && itemData.id) {
          setMenuItem(itemData);
        } else {
          setError("Menu item not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load menu item");
      } finally {
        setIsLoadingItem(false);
      }
    };

    fetchMenuItemData();
  }, [itemId, tenantId]);

  const handleSubmit = async (data: MenuItemFormData) => {
    try {
      setIsUpdating(true);
      
      // Prepare update payload - only send the fields that exist in MenuItemFormData
      const updatePayload = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        is_vegetarian: data.is_vegetarian,
        preparation_time: Math.round(data.preparation_time_minutes), // Convert to integer
        image_url: data.image_url,
      };
      
      // Get tenant_id from localStorage
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      
      // Call real API
      const response = await updateMenuItem(itemId, updatePayload, tenantId);
      
      if (response) {
        console.log("✅ Menu item updated successfully");
        router.push("/admin/menu");
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit Menu Item
          </h1>
          <p className="text-slate-600 mt-2">Update menu item details</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingItem ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center gap-2 text-slate-600 py-12">
            <Loader2 className="animate-spin" size={20} />
            Loading menu item details...
          </CardContent>
        </Card>
      ) : menuItem ? (
        <>
          {/* Form Card */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Menu Item Details</CardTitle>
              <CardDescription>
                Update the menu item details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MenuItemForm
                onSubmit={handleSubmit}
                isLoading={isUpdating}
                initialData={menuItem || undefined}
                mode="edit"
                categories={CATEGORIES}
              />
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-50 border-slate-200 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p>• <strong>Item ID:</strong> {itemId}</p>
              <p>• <strong>Created:</strong> {new Date(menuItem.created_at).toLocaleDateString()}</p>
              <p>• <strong>Last Updated:</strong> {new Date(menuItem.updated_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
