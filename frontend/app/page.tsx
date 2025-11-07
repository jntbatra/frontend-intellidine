"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone, ChefHat, Zap, Star, Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has an active restaurant session
    const currentTableId = localStorage.getItem("current_table_id");
    const currentTenantId = localStorage.getItem("current_tenant_id");

    // If user has an active session, redirect to menu
    if (currentTableId && currentTenantId) {
      router.push(
        `/menu?table_id=${currentTableId}&tenant_id=${currentTenantId}`
      );
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-orange-400 to-red-500 rounded-full mb-6 shadow-xl">
            <ChefHat className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Intellidine</h1>
          <p className="text-2xl text-gray-600 mb-6 max-w-2xl mx-auto">
            AI-Powered Restaurant Ordering System
          </p>
          <Badge
            variant="secondary"
            className="text-lg px-4 py-2 bg-orange-100 text-orange-800"
          >
            Smart Dining Experience
          </Badge>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - How it works */}
            <Card className="shadow-xl border-orange-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <QrCode className="mr-3 h-6 w-6 text-orange-600" />
                  How It Works
                </CardTitle>
                <CardDescription className="text-lg">
                  Simple steps for a seamless dining experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Scan QR Code
                    </h3>
                    <p className="text-gray-600">
                      Scan the QR code at your table to access the digital menu
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Verify Phone
                    </h3>
                    <p className="text-gray-600">
                      Quick OTP verification for order tracking and updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Browse & Order
                    </h3>
                    <p className="text-gray-600">
                      Explore menu, add items to cart, and place your order
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Track & Pay
                    </h3>
                    <p className="text-gray-600">
                      Real-time order tracking and seamless payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Features */}
            <Card className="shadow-xl border-orange-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Zap className="mr-3 h-6 w-6 text-orange-600" />
                  AI-Powered Features
                </CardTitle>
                <CardDescription className="text-lg">
                  Experience the future of restaurant ordering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <Star className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dynamic Pricing
                    </h4>
                    <p className="text-sm text-gray-600">
                      AI adjusts prices based on demand and inventory
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Smart Wait Times
                    </h4>
                    <p className="text-sm text-gray-600">
                      Accurate preparation time estimates
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Real-time Updates
                    </h4>
                    <p className="text-sm text-gray-600">
                      Live order status and notifications
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Kitchen Integration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Direct communication with kitchen staff
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Get Started Section */}
          <Card className="shadow-xl border-orange-200 bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900">
                Get Started
              </CardTitle>
              <CardDescription className="text-lg">
                Experience Intellidine with our restaurant ordering system
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <Link
                  href={`/table/tbl-001?tenant_id=${
                    process.env.NEXT_PUBLIC_TENANT_ID ||
                    "11111111-1111-1111-1111-111111111111"
                  }`}
                >
                  <Button
                    size="lg"
                    className="px-10 py-4 text-xl font-bold bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Ordering
                    <QrCode className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("current_table_id");
                      localStorage.removeItem("current_tenant_id");
                      window.location.reload();
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Scan New QR Code
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Experience the full restaurant ordering system with AI-powered
                features
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Intellidine • Built with Next.js, TypeScript, and AI</p>
            <p className="mt-1">
              Revolutionizing restaurant ordering for the digital age
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
