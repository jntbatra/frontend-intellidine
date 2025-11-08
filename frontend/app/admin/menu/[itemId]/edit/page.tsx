"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItemForm, MenuItemFormData } from "@/components/admin/forms/MenuItemForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MenuItem } from "@/lib/api/admin/menu";

const DEFAULT_CATEGORIES = [
  "APPETIZERS",
  "MAIN_COURSE",
  "BREADS",
  "DESSERTS",
  "BEVERAGES",
];

// Mock menu items
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato-based gravy with cream",
    price: 350,
    category: "MAIN_COURSE",
    image_url: "https://cdn.example.com/butter-chicken.jpg",
    is_vegetarian: false,
    is_available: true,
    preparation_time_minutes: 15,
    allergens: ["dairy", "gluten"],
    tags: ["popular", "bestseller"],
    created_at: "2024-10-15T10:30:00Z",
    updated_at: "2024-11-01T08:00:00Z",
  },
  {
    id: "item-2",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Paneer Tikka",
    description: "Indian cheese marinated in yogurt and spices",
    price: 280,
    category: "APPETIZERS",
    image_url: "https://cdn.example.com/paneer-tikka.jpg",
    is_vegetarian: true,
    is_available: true,
    preparation_time_minutes: 12,
    allergens: ["dairy"],
    tags: ["spicy", "popular"],
    created_at: "2024-10-20T14:15:00Z",
    updated_at: "2024-11-02T09:45:00Z",
  },
  {
    id: "item-3",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Dal Fry",
    description: "Yellow lentils tempered with cumin and asafetida",
    price: 180,
    category: "MAIN_COURSE",
    image_url: "https://cdn.example.com/dal-fry.jpg",
    is_vegetarian: true,
    is_available: true,
    preparation_time_minutes: 10,
    allergens: [],
    tags: ["vegan"],
    created_at: "2024-10-10T11:20:00Z",
    updated_at: "2024-11-03T07:30:00Z",
  },
  {
    id: "item-4",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Tandoori Chicken",
    description: "Marinated chicken cooked in a traditional tandoor",
    price: 320,
    category: "MAIN_COURSE",
    image_url: "https://cdn.example.com/tandoori.jpg",
    is_vegetarian: false,
    is_available: false,
    preparation_time_minutes: 18,
    allergens: ["gluten"],
    tags: ["spicy"],
    created_at: "2024-09-20T13:45:00Z",
    updated_at: "2024-10-28T16:20:00Z",
  },
  {
    id: "item-5",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Naan",
    description: "Traditional Indian flatbread baked in tandoor",
    price: 50,
    category: "BREADS",
    image_url: "https://cdn.example.com/naan.jpg",
    is_vegetarian: true,
    is_available: true,
    preparation_time_minutes: 5,
    allergens: ["gluten", "dairy"],
    tags: ["popular"],
    created_at: "2024-10-22T09:00:00Z",
    updated_at: "2024-11-04T10:15:00Z",
  },
  {
    id: "item-6",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Gulab Jamun",
    description: "Milk solids fried and soaked in sugar syrup",
    price: 100,
    category: "DESSERTS",
    image_url: "https://cdn.example.com/gulab-jamun.jpg",
    is_vegetarian: true,
    is_available: true,
    preparation_time_minutes: 8,
    allergens: ["dairy"],
    tags: ["bestseller"],
    created_at: "2024-10-18T15:30:00Z",
    updated_at: "2024-11-05T08:45:00Z",
  },
  {
    id: "item-7",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Mango Lassi",
    description: "Refreshing yogurt-based mango smoothie",
    price: 120,
    category: "BEVERAGES",
    image_url: "https://cdn.example.com/lassi.jpg",
    is_vegetarian: true,
    is_available: true,
    preparation_time_minutes: 3,
    allergens: ["dairy"],
    tags: [],
    created_at: "2024-10-25T10:00:00Z",
    updated_at: "2024-11-01T06:30:00Z",
  },
  {
    id: "item-8",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    name: "Chicken Biryani",
    description: "Fragrant rice with spiced chicken and herbs",
    price: 280,
    category: "MAIN_COURSE",
    image_url: "https://cdn.example.com/biryani.jpg",
    is_vegetarian: false,
    is_available: true,
    preparation_time_minutes: 20,
    allergens: ["gluten"],
    tags: ["popular", "new"],
    created_at: "2024-10-28T12:15:00Z",
    updated_at: "2024-11-03T11:00:00Z",
  },
];

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant_id from localStorage
  useEffect(() => {
    const stored =
      localStorage.getItem("current_tenant_id") ||
      localStorage.getItem("tenant_id");
    if (stored) {
      setTenantId(stored);
    }
  }, []);

  // Fetch menu item details
  useEffect(() => {
    if (!itemId) return;

    const fetchMenuItemData = async () => {
      try {
        setIsLoadingItem(true);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Find item from mock data
        const item = MOCK_MENU_ITEMS.find((i) => i.id === itemId);
        
        if (item) {
          setMenuItem(item);
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
  }, [itemId]);

  const handleSubmit = async (data: MenuItemFormData) => {
    if (!tenantId) {
      throw new Error("Tenant ID not found");
    }

    try {
      setIsUpdating(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Log the submission (for demo purposes)
      console.log("✅ Menu item updated successfully:", {
        id: itemId,
        ...data,
        tenant_id: tenantId,
      });

      router.push("/admin/menu");
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
                initialData={menuItem}
                mode="edit"
                categories={DEFAULT_CATEGORIES}
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
