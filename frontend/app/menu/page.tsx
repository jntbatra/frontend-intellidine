"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { apiClient } from "@/lib/api/client";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  preparation_time: number;
  dietary_tags: string[];
  is_available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  items: MenuItem[];
}

interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
  cached?: boolean;
  cache_ttl_remaining?: number;
}

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");

    if (!token || role === "kitchen") {
      router.push("/");
      return;
    }
  }, [router]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${tableId}_${tenantId}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data:", error);
      }
    }
  }, [tableId, tenantId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`cart_${tableId}_${tenantId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`cart_${tableId}_${tenantId}`);
    }
  }, [cart, tableId, tenantId]);

  // Fetch menu data
  const {
    data: menuData,
    isLoading,
    error,
  } = useQuery<MenuData>({
    queryKey: ["menu", tenantId],
    queryFn: async (): Promise<MenuData> => {
      const response = await apiClient.get(`/api/menu`, {
        tenant_id: tenantId,
        limit: "20",
        offset: "0",
      });

      const apiData =
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
          ? (response.data as { data: { categories: MenuCategory[] } }).data
          : (response.data as { categories: MenuCategory[] });

      // Create a flat items array from all categories
      const allItems = apiData.categories.flatMap(
        (category) => category.items || []
      );

      return {
        categories: apiData.categories,
        items: allItems,
      };
    },
    enabled: !!tenantId,
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.menu_item_id === item.id
      );
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prev,
          {
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.menu_item_id === itemId);
    return item?.quantity || 0;
  };

  const getTotalItems = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredItems =
    menuData?.items?.filter((item: MenuItem) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        menuData.categories
          ?.find((cat) => cat.id === selectedCategory)
          ?.items.some((catItem) => catItem.id === item.id);
      return matchesSearch && matchesCategory;
    }) || [];

  if (!tableId || !tenantId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Access
              </h2>
              <p className="text-gray-600">
                Please scan a valid restaurant QR code to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Menu
              </h2>
              <p className="text-gray-600">Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navigation cartItemCount={getTotalItems()} />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Table {tableId.replace("tbl-", "")}
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search for delicious dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-orange-200 shadow-sm focus:border-orange-400"
          />
        </div>

        {/* Categories Tabs */}
        {menuData?.categories && (
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="mb-6"
          >
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max bg-white border border-orange-200 shadow-sm p-1">
                <TabsTrigger
                  value="all"
                  className="text-sm font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white whitespace-nowrap"
                >
                  All
                </TabsTrigger>
                {menuData.categories.slice(0, 5).map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="text-sm font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : filteredItems.map((item: MenuItem) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-orange-100 hover:border-orange-200 bg-white"
                >
                  {/* Item Image */}
                  <div className="aspect-video bg-linear-to-br from-orange-100 to-red-100 relative overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <ChefHat className="h-8 w-8 text-orange-500" />
                        </div>
                      </div>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <Badge variant="destructive" className="shadow-lg">
                          Unavailable
                        </Badge>
                      </div>
                    )}
                    {item.is_available && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white shadow-lg">
                          Available
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {item.name}
                      </h3>
                      <span className="font-bold text-xl text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        ₹{item.price}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Dietary Tags */}
                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.dietary_tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200"
                          >
                            {tag === "veg"
                              ? "🥬 Veg"
                              : tag === "non-veg"
                              ? "🍖 Non-Veg"
                              : tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Preparation Time */}
                    <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      Ready in {item.preparation_time} mins
                    </div>

                    {/* Add to Cart */}
                    {item.is_available ? (
                      <div className="flex items-center justify-between">
                        {getCartItemQuantity(item.id) > 0 ? (
                          <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 p-0 border-orange-300 hover:bg-orange-100"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg w-8 text-center text-orange-600">
                              {getCartItemQuantity(item.id)}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(item)}
                            className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        Unavailable
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Floating Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-200 p-4 pb-10 shadow-2xl">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">
                      {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="font-bold text-lg text-orange-600">
                    ₹{getTotalPrice()}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    // Navigate to cart/checkout
                    window.location.href = `/cart?table_id=${tableId}&tenant_id=${tenantId}`;
                  }}
                >
                  View Cart & Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
