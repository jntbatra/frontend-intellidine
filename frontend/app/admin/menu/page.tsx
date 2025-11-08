"use client";

import { useState } from "react";
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
import { MenuItem, MenuCategory } from "@/lib/api/admin/menu";
import { MOCK_MENU_ITEMS } from "@/lib/constants/mockMenuItems";

// Menu categories
const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-1",
    name: "APPETIZERS",
    display_order: 1,
    icon_url: "https://cdn.example.com/appetizers.png",
    item_count: 8,
  },
  {
    id: "cat-2",
    name: "MAIN_COURSE",
    display_order: 2,
    icon_url: "https://cdn.example.com/main.png",
    item_count: 12,
  },
  {
    id: "cat-3",
    name: "BREADS",
    display_order: 3,
    icon_url: "https://cdn.example.com/breads.png",
    item_count: 5,
  },
  {
    id: "cat-4",
    name: "DESSERTS",
    display_order: 4,
    icon_url: "https://cdn.example.com/desserts.png",
    item_count: 6,
  },
  {
    id: "cat-5",
    name: "BEVERAGES",
    display_order: 5,
    icon_url: "https://cdn.example.com/beverages.png",
    item_count: 8,
  },
];

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
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
    isAvailable: boolean
  ) => {
    try {
      setIsToggling(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Update local state
      setMenuItems(
        menuItems.map((item) =>
          item.id === itemId ? { ...item, is_available: !isAvailable } : item
        )
      );
      console.log("Menu item availability updated successfully");
    } catch (error) {
      console.error("Failed to update menu item availability:", error);
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
      {/* Removed - using hardcoded data */}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              {filteredItems.length}
            </div>
            <p className="text-sm text-slate-600">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredItems.filter((i) => i.is_available).length}
            </div>
            <p className="text-sm text-slate-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredItems.filter((i) => i.is_vegetarian).length}
            </div>
            <p className="text-sm text-slate-600">Vegetarian</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              {MOCK_CATEGORIES.length}
            </div>
            <p className="text-sm text-slate-600">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MOCK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
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
              ({filteredItems.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MenuTable
            items={filteredItems}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
            isDeleting={isDeleting}
            isToggling={isToggling}
          />
        </CardContent>
      </Card>
    </div>
  );
}
