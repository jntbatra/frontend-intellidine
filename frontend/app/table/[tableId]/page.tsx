"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Smartphone, QrCode, ChefHat, Clock } from "lucide-react";

interface TableInfo {
  tableId: string;
  tenantId: string;
}

export default function TablePage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenant_id");
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedTableId, setResolvedTableId] = useState<string>("");
  const [tenantName, setTenantName] = useState("Restaurant");

  useEffect(() => {
    // Resolve the params
    params.then((resolved) => {
      setResolvedTableId(resolved.tableId);
    });
  }, [params]);

  useEffect(() => {
    if (resolvedTableId && tenantId) {
      // Check if this is a new restaurant (different tenant_id)
      const storedTenantId = localStorage.getItem("current_tenant_id");
      if (storedTenantId && storedTenantId !== tenantId) {
        // Clear previous restaurant context for new restaurant
        localStorage.removeItem("current_table_id");
        localStorage.removeItem("current_tenant_id");
      }

      // Fetch tenant information
      const fetchTenantInfo = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(localStorage.getItem("auth_token") && {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }),
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setTenantName(data.data?.name || data.name || "Restaurant");
          }
        } catch (error) {
          console.error("Failed to fetch tenant info:", error);
        }
      };

      fetchTenantInfo();

      setTableInfo({
        tableId: resolvedTableId,
        tenantId,
      });
      setIsLoading(false);
    }
  }, [resolvedTableId, tenantId, tenantName]);

  const handleStartOrdering = () => {
    // Store restaurant context in localStorage
    localStorage.setItem("current_table_id", resolvedTableId);
    localStorage.setItem("current_tenant_id", tenantId!);

    // Navigate to OTP page
    window.location.href = `/auth/otp?table_id=${resolvedTableId}&tenant_id=${tenantId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!tableInfo) {
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <QrCode className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid QR Code
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

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-yellow-25 to-yellow-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Header - Mobile optimized */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full mb-4">
              <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome to {tenantName}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-4">
              Experience smart dining with AI-powered ordering
            </p>
            <Badge variant="secondary" className="text-sm">
              Table {tableInfo.tableId.replace("tbl-", "")}
            </Badge>
          </div>

          {/* Main Card - Mobile optimized */}
          <Card className="mb-6 shadow-lg border-yellow-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl md:text-2xl text-gray-900">
                Start Your Order
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Scan QR codes, browse menu, and enjoy seamless dining
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Features Grid - Mobile stacked */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3 mb-4 md:mb-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Smartphone className="mx-auto h-6 w-6 md:h-8 md:w-8 text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                    Mobile Ordering
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order from your phone, no waiting for staff
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <QrCode className="mx-auto h-6 w-6 md:h-8 md:w-8 text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                    QR Code Menu
                  </h3>
                  <p className="text-sm text-gray-600">
                    Scan codes for instant menu access
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="mx-auto h-6 w-6 md:h-8 md:w-8 text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                    Real-time Updates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track your order status live
                  </p>
                </div>
              </div>

              <Separator />

              {/* Start Button - Mobile optimized */}
              <div className="text-center">
                <Button
                  onClick={handleStartOrdering}
                  size="lg"
                  className="w-full px-6 py-4 md:px-8 md:py-3 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-14 md:min-h-0"
                >
                  Start Ordering
                  <QrCode className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  You&apos;ll be asked to verify your phone number for order
                  tracking
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Powered by Intellidine • AI-Powered Restaurant Ordering</p>
            <p className="mt-1">Experience the future of dining</p>
          </div>
        </div>
      </div>
    </div>
  );
}
