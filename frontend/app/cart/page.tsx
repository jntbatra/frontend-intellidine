"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Clock,
  ChefHat,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

// Helper function to calculate estimated discount with randomness
// Discount is actually calculated server-side when order is created
// This is just a client-side estimate for display purposes
function calculateEstimatedDiscount(subtotal: number): {
  discount_amount: number;
  discount_reason: string;
  discount_percent: number;
} {
  // Add randomness factor (±15% variance)
  const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
  
  // Simulate discount rules based on subtotal
  let baseDiscountPercent = 0;
  let reason = "";
  
  if (subtotal > 5000) {
    baseDiscountPercent = 20; // 20% for bulk orders
    reason = "Bulk Order Discount";
  } else if (subtotal > 2000) {
    baseDiscountPercent = 10; // 10% for medium orders
    reason = "Volume Discount";
  } else if (subtotal > 1000) {
    baseDiscountPercent = 5; // 5% for small orders
    reason = "Order Discount";
  } else if (subtotal > 500) {
    baseDiscountPercent = 3; // 3% for smaller orders
    reason = "Order Discount";
  } else if (subtotal > 0) {
    baseDiscountPercent = 2; // 2% for any order
    reason = "Welcome Discount";
  }
  
  const estimatedDiscount = (subtotal * baseDiscountPercent) / 100 * randomFactor;
  
  console.log("📊 Estimated Discount Calculated:", {
    subtotal,
    baseDiscountPercent,
    randomFactor,
    estimatedDiscount: Math.round(estimatedDiscount * 100) / 100,
    reason,
  });
  
  return {
    discount_amount: Math.round(estimatedDiscount * 100) / 100,
    discount_reason: reason || "Special Offer",
    discount_percent: baseDiscountPercent,
  };
}

function CartPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [estimatedDiscount, setEstimatedDiscount] = useState({
    discount_amount: 0,
    discount_reason: "",
    discount_percent: 0,
  });

  // Initialize kitchen orders hook for lazy refresh on cart updates
  const { lazyRefresh } = useKitchenOrders(tenantId || "", false);

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
    setIsLoadingCart(false);
  }, [tableId, tenantId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`cart_${tableId}_${tenantId}`, JSON.stringify(cart));

      // Calculate estimated discount when cart changes
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const estimated = calculateEstimatedDiscount(subtotal);
      setEstimatedDiscount(estimated);
    } else {
      localStorage.removeItem(`cart_${tableId}_${tenantId}`);
      setEstimatedDiscount({
        discount_amount: 0,
        discount_reason: "",
        discount_percent: 0,
      });
    }
  }, [cart, tableId, tenantId]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.menu_item_id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Trigger lazy refresh after cart update (2 second delay)
    lazyRefresh(2000);
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.menu_item_id !== itemId));

    // Trigger lazy refresh after removing item (2 second delay)
    lazyRefresh(2000);
  };

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menu_item_id === itemId
          ? { ...item, special_instructions: instructions }
          : item
      )
    );
  };

  const getSubtotal = useCallback(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const getTax = () => {
    // Calculate tax on subtotal (18% GST)
    return Math.round(getSubtotal() * 0.18);
  };

  const getTotal = () => {
    // Calculate total as subtotal - estimated discount + tax
    const subtotal = getSubtotal();
    const tax = getTax();
    const total = subtotal - estimatedDiscount.discount_amount + tax;
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      // Prepare order data
      const items = cart.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      }));

      const orderData = {
        table_id: tableId!.replace("tbl-", ""),
        items,
        payment_method: "RAZORPAY",
      };

      // Make API call to create order
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId || "",
      };

      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders?tenant_id=${tenantId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Order creation failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestData: orderData,
          headers: { ...headers, Authorization: "[REDACTED]" },
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
        });
        throw new Error(
          errorData.message ||
            `Failed to create order: ${response.status} ${response.statusText}`
        );
      }

      const orderResponse = await response.json();

      // Clear cart after successful order
      setCart([]);
      localStorage.removeItem(`cart_${tableId}_${tenantId}`);

      // Navigate to order confirmation with real order data
      router.push(
        `/order-confirmation?table_id=${tableId}&tenant_id=${tenantId}&order_id=${
          orderResponse.data?.id || orderResponse.id
        }`
      );
    } catch (error) {
      console.error("Failed to place order:", error);
      // Handle error (show toast, etc.)
      alert(
        `Failed to place order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Your Cart
              </h2>
              <p className="text-gray-600">
                Please wait while we load your cart items...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Mobile Header */}
          <div className="md:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
                  <p className="text-xs text-gray-600">
                    Table {tableId.replace("tbl-", "")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Menu</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-sm text-gray-600">
                  Table {tableId.replace("tbl-", "")}
                </p>
              </div>
            </div>
          </div>

          {/* Empty Cart - Mobile optimized */}
          <div className="flex flex-col items-center justify-center py-12 md:py-16">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <ShoppingCart className="h-10 w-10 md:h-12 md:w-12 text-orange-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 text-center">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6 text-center text-sm md:text-base px-4">
              Add some delicious items from our menu to get started!
            </p>
            <Button
              onClick={() =>
                router.push(`/menu?table_id=${tableId}&tenant_id=${tenantId}`)
              }
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 md:px-8 py-3 md:py-2 min-h-12 md:min-h-0"
            >
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navigation
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />
      {isLoadingCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Syncing Cart
                </h2>
                <p className="text-gray-200">
                  Please wait while we sync your cart...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
                <p className="text-xs text-gray-600">
                  Table {tableId.replace("tbl-", "")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Menu</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-600">
                Table {tableId.replace("tbl-", "")}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stack vertically */}
        <div className="md:hidden space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((item) => (
              <Card
                key={item.menu_item_id}
                className="border-orange-200 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-orange-600 font-bold text-sm">
                        ₹{item.price}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.menu_item_id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 ml-2 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls - Mobile optimized */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity - 1)
                        }
                        className="h-10 w-10 p-0 border-orange-200"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-lg w-12 text-center min-w-12">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity + 1)
                        }
                        className="h-10 w-10 p-0 bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Any special requests for this item..."
                      value={item.special_instructions || ""}
                      onChange={(e) =>
                        updateSpecialInstructions(
                          item.menu_item_id,
                          e.target.value
                        )
                      }
                      className="resize-none text-sm"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - Mobile */}
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CreditCard className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal()}</span>
                </div>
                {estimatedDiscount.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>{estimatedDiscount.discount_reason || "Discount"}</span>
                      <span className="text-xs">(est.)</span>
                    </div>
                    <span className="font-bold">
                      -₹{estimatedDiscount.discount_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (GST 18%)</span>
                  <span>₹{getTax()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">₹{getTotal()}</span>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any special instructions for the entire order..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none text-sm"
                  rows={3}
                />
              </div>

              {/* Estimated Time */}
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="text-sm text-gray-700">
                  Estimated preparation time: 20-30 minutes
                </span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold min-h-14"
                size="lg"
              >
                {isPlacingOrder ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Place Order • ₹{getTotal()}</span>
                  </div>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.menu_item_id} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-orange-600 font-bold">₹{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.menu_item_id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity - 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-lg w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity + 1)
                        }
                        className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Any special requests for this item..."
                      value={item.special_instructions || ""}
                      onChange={(e) =>
                        updateSpecialInstructions(
                          item.menu_item_id,
                          e.target.value
                        )
                      }
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  {estimatedDiscount.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>
                          {estimatedDiscount.discount_reason || "Discount"}
                        </span>
                        <span className="text-xs">(est.)</span>
                      </div>
                      <span className="font-bold">
                        -₹{estimatedDiscount.discount_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹{getTax()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₹{getTotal()}</span>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any special instructions for the entire order..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Estimated Time */}
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-700">
                    Estimated preparation time: 20-30 minutes
                  </span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Place Order • ₹{getTotal()}</span>
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Loading Cart
                </h2>
                <p className="text-gray-600">
                  Please wait while we load your cart...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}
