"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { MenuTable } from "@/components/admin/tables/MenuTable";
import { MenuItem, getMenuWithCategories, deleteMenuItem, updateMenuItem } from "@/lib/api/admin/menu";

// Hardcoded categories
const CATEGORIES = ["Appetizers", "Main Course", "Sides", "Desserts"];

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>("");

  // Load tenant ID and fetch menu
  useEffect(() => {
    const stored = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
    setTenantId(stored);
  }, []);

  // Fetch menu data
  useEffect(() => {
    if (!tenantId) return;

    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMenuWithCategories(tenantId, 20, 0);

        // Response structure: { data: { categories: [...] } }
        const responseData = response.data as unknown as Record<string, unknown>;
        const fetchedCategories = ((responseData?.categories as Record<string, unknown>[]) || []);

        // Flatten all items from categories and enrich with category name
        const allItems = fetchedCategories.flatMap((cat: Record<string, unknown>) => {
          const categoryName = cat.name as string;
          const items = (cat.items as MenuItem[] | undefined) || [];
          // Add category name to each item for filtering
          return items.map(item => ({
            ...item,
            category: categoryName // Use display name instead of ID
          }));
        });
        
        console.log("✅ Menu items loaded:", allItems.length, allItems);
        setMenuItems(allItems);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [tenantId]);

  // Filter items based on search and category
  let filteredItems = menuItems;
  
  if (categoryFilter !== "all") {
    filteredItems = filteredItems.filter((item) => item.category === categoryFilter);
  }
  
  if (searchQuery) {
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleDelete = async (itemId: string) => {
    try {
      setIsDeleting(true);
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      await deleteMenuItem(itemId, tenantId);
      
      // Remove from local state
      setMenuItems(menuItems.filter((item) => item.id !== itemId));
      console.log("Menu item deleted successfully");
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (
    itemId: string,
    isCurrentlyAvailable: boolean
  ) => {
    try {
      setIsToggling(true);
      const tenantId = localStorage.getItem("current_tenant_id") || "11111111-1111-1111-1111-111111111111";
      // Only update stock_status, don't touch is_available
      const newStockStatus = isCurrentlyAvailable ? "OUT_OF_STOCK" : "AVAILABLE";
      await updateMenuItem(itemId, { stock_status: newStockStatus }, tenantId);
      
      // Update local state - only change stock_status
      setMenuItems(
        menuItems.map((item) =>
          item.id === itemId 
            ? { 
                ...item, 
                stock_status: newStockStatus
              } 
            : item
        )
      );
      console.log("Menu item stock status updated successfully");
    } catch (error) {
      console.error("Failed to update menu item stock status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage menu items, categories, and availability
          </p>
        </div>
        <Link href="/admin/menu/add">
          <Button className="gap-2">
            <Plus size={18} />
            Add Menu Item
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats - Show skeleton or real stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {filteredItems.length}
                </div>
                <p className="text-sm text-slate-600">Total Items</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {filteredItems.filter((i) => i.stock_status === "AVAILABLE").length}
                </div>
                <p className="text-sm text-slate-600">Available</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredItems.filter((i) => i.dietary_tags?.includes("veg")).length}
                </div>
                <p className="text-sm text-slate-600">Vegetarian</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {CATEGORIES.length}
                </div>
                <p className="text-sm text-slate-600">Categories</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Menu Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Menu Items
            <span className="text-sm font-normal text-slate-600 ml-2">
              {isLoading ? "..." : `(${filteredItems.length})`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-slate-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3"></div>
                  </div>
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <MenuTable
              items={filteredItems}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
