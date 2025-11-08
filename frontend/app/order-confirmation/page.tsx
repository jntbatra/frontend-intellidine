"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  ChefHat,
  Home,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_requests?: string;
}

interface OrderData {
  id: string;
  order_number?: string;
  status: string;
  total: number;
  subtotal: number;
  gst: number;
  table_number: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  special_instructions?: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table_id");
  const tenantId = searchParams.get("tenant_id");
  const orderId = searchParams.get("order_id");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("staff_role");

    if (!token || role === "kitchen") {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !tenantId) {
        setError("Order ID or tenant ID missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}?tenant_id=${tenantId}`,
          {
            headers: {
              "Content-Type": "application/json",
              // Add authorization header if token exists
              ...(localStorage.getItem("auth_token") && {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              }),
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`);
        }

        const data = await response.json();
        setOrderData(data.data || data); // Handle both response formats
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, tenantId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading your order...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Order
              </h2>
              <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Go Back Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Success Header - Mobile optimized */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mb-4 md:mb-6">
            <CheckCircle className="h-8 w-8 md:h-12 md:w-12 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Your delicious food is being prepared
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="shadow-xl border-orange-200 bg-white/90 backdrop-blur-sm mb-4 md:mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg md:text-2xl text-gray-900 flex items-center justify-center">
              <ChefHat className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Order Number */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600">
                {orderData.order_number || orderData.id}
              </p>
            </div>

            {/* Table Info */}
            <div className="flex justify-between items-center p-3 md:p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Table</p>
                <p className="font-semibold text-gray-900">
                  {orderData.table_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <Badge className="bg-orange-500 text-white text-xs md:text-sm">
                  {orderData.status}
                </Badge>
              </div>
            </div>

            {/* Preparation Time */}
            <div className="text-center p-4 md:p-6 bg-linear-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <Clock className="mx-auto h-6 w-6 md:h-8 md:w-8 text-orange-600 mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                Estimated Preparation Time
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                20-30 minutes
              </p>
              <p className="text-sm text-gray-600">
                Your order will be ready soon!
              </p>
            </div>

            {/* What's Next */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-center text-sm md:text-base">
                What&apos;s Next?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="mx-auto h-4 w-4 md:h-5 md:w-5 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Order Received
                  </p>
                  <p className="text-xs text-gray-600">Kitchen notified</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <RefreshCw className="mx-auto h-4 w-4 md:h-5 md:w-5 text-orange-600 mb-2 animate-spin" />
                  <p className="text-sm font-medium text-gray-900">Preparing</p>
                  <p className="text-xs text-gray-600">Fresh ingredients</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto h-4 w-4 md:h-5 md:w-5 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Ready Soon
                  </p>
                  <p className="text-xs text-gray-400">Hot & fresh</p>
                </div>
              </div>
            </div>

            {/* Notifications Info */}
            <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-blue-900 mb-1 text-sm md:text-base">
                    Stay Updated
                  </p>
                  <p className="text-sm text-blue-700">
                    You&apos;ll receive notifications when your order is ready.
                    Our staff will bring it to your table.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card className="shadow-xl border-orange-200 bg-white/90 backdrop-blur-sm mb-4 md:mb-6">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl text-gray-900">
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {orderData.items.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {item.quantity}x Item
                    </p>
                    {item.special_requests && (
                      <p className="text-xs md:text-sm text-gray-600 italic">
                        Note: {item.special_requests}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-base md:text-lg text-gray-900 shrink-0">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <span>Subtotal</span>
                <span>₹{orderData.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span>GST (18%)</span>
                <span>₹{orderData.gst}</span>
              </div>
              <div className="flex justify-between font-bold text-base md:text-lg pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-orange-600">₹{orderData.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Mobile optimized */}
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <Button
            onClick={() =>
              router.push(`/menu?table_id=${tableId}&tenant_id=${tenantId}`)
            }
            variant="outline"
            className="flex-1 py-4 md:py-3 text-base md:text-lg font-semibold border-orange-200 hover:bg-orange-50 min-h-12 md:min-h-0"
          >
            <ChefHat className="mr-2 h-5 w-5" />
            Order More Items
          </Button>
          <Button
            onClick={() => {
              // Clear restaurant context when going back home
              localStorage.removeItem("current_table_id");
              localStorage.removeItem("current_tenant_id");
              router.push("/");
            }}
            className="flex-1 py-4 md:py-3 text-base md:text-lg font-semibold bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white min-h-12 md:min-h-0"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 md:mt-8 text-sm text-gray-500">
          <p>Thank you for choosing Intellidine!</p>
          <p className="mt-1">Enjoy your meal • Bon Appétit! 🍽️</p>
        </div>
      </div>
    </div>
  );
}
