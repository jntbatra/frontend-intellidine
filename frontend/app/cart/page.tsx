"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { Navigation } from "@/components/navigation";

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export default function CartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [discount, setDiscount] = useState({ amount: 0, reason: "", code: "" });
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);

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
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.menu_item_id !== itemId));
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
  const getTax = () => Math.round(getSubtotal() * 0.18); // 18% GST

  // Calculate discount using API
  useEffect(() => {
    const calculateDiscount = async () => {
      if (cart.length === 0) {
        setDiscount({ amount: 0, reason: "", code: "" });
        return;
      }

      try {
        const subtotal = getSubtotal();
        const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Get customer data from localStorage
        const customerId = localStorage.getItem("customer_id") || "guest";
        const hasOrderedBefore =
          localStorage.getItem("has_ordered_before") === "true";
        const customerOrderCount = hasOrderedBefore ? 1 : 0;

        // Call discount prediction API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/discounts/predict`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_id: `temp-${Date.now()}`,
              total_amount: subtotal,
              items_count: itemsCount,
              customer_id: customerId,
              day_of_week: new Date()
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase(),
              hour_of_day: new Date().getHours(),
              customer_order_count: customerOrderCount,
              customer_avg_spend: subtotal, // Simplified
              customer_order_frequency_days: 7, // Simplified
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setDiscount({
              amount: data.data.discount_amount,
              reason:
                data.data.reason ||
                `ML predicted ${data.data.discount_percentage}% discount`,
              code: "",
            });
          } else {
            // No discount available
            setDiscount({ amount: 0, reason: "", code: "" });
          }
        } else {
          console.warn("Discount API failed:", response.status);
          // No discount if API fails
          setDiscount({ amount: 0, reason: "", code: "" });
        }
      } catch (error) {
        console.error("Failed to calculate discount:", error);
        // No discount on error
        setDiscount({ amount: 0, reason: "", code: "" });
      }
    };

    calculateDiscount();
  }, [cart, getSubtotal]);

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingCode(true);
    try {
      // Call discount code API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/discounts/apply-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: discountCode.trim(),
            order_total: getSubtotal(),
            customer_id: localStorage.getItem("customer_id") || "guest",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.applicable) {
          setDiscount({
            amount: data.data.discount_amount,
            reason:
              data.data.reason ||
              `${data.data.discount_percentage}% discount code applied`,
            code: discountCode.trim(),
          });
          setDiscountCode("");
        } else {
          alert(data.message || "Invalid or expired discount code");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to apply discount code");
      }
    } catch (error) {
      console.error("Failed to apply discount code:", error);
      alert("Failed to apply discount code");
    } finally {
      setIsApplyingCode(false);
    }
  };

  const getTotal = () => getSubtotal() + getTax() - discount.amount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      // Get customer ID from localStorage
      let customerId = localStorage.getItem("customer_id");
      if (!customerId) {
        customerId = `cust-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("customer_id", customerId);
      }

      // Prepare order data
      const orderData = {
        table_id: tableId,
        customer_id: customerId,
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined,
          price_at_order: item.price,
        })),
        special_instructions: specialInstructions || undefined,
      };

      // Make API call to create order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders?tenant_id=${tenantId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if token exists
            ...(localStorage.getItem("auth_token") && {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            }),
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create order: ${response.status}`
        );
      }

      const orderResponse = await response.json();

      // Clear cart after successful order
      setCart([]);
      localStorage.removeItem(`cart_${tableId}_${tenantId}`);

      // Mark customer as having ordered before (for discount logic)
      localStorage.setItem("has_ordered_before", "true");

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
                {discount.amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount.reason})</span>
                    <span>-₹{discount.amount}</span>
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
                {discount.amount > 0 && (
                  <div className="text-xs text-green-600 text-center bg-green-50 p-2 rounded">
                    🎉 You saved ₹{discount.amount}!
                  </div>
                )}
              </div>

              {/* Discount Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={applyDiscountCode}
                    disabled={isApplyingCode || !discountCode.trim()}
                    variant="outline"
                    className="px-4 border-orange-200 hover:bg-orange-50"
                  >
                    {isApplyingCode ? (
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {discount.code && (
                  <p className="text-xs text-green-600 mt-1">
                    Code &quot;{discount.code}&quot; applied successfully!
                  </p>
                )}
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
                  {discount.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount.reason})</span>
                      <span>-₹{discount.amount}</span>
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
                  {discount.amount > 0 && (
                    <div className="text-xs text-green-600 text-center bg-green-50 p-2 rounded mt-2">
                      🎉 You saved ₹{discount.amount}!
                    </div>
                  )}
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDiscountCode(e.target.value.toUpperCase())
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={applyDiscountCode}
                      disabled={isApplyingCode || !discountCode.trim()}
                      variant="outline"
                      className="px-4 border-orange-200 hover:bg-orange-50"
                    >
                      {isApplyingCode ? (
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {discount.code && (
                    <p className="text-xs text-green-600 mt-1">
                      Code &quot;{discount.code}&quot; applied successfully!
                    </p>
                  )}
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
