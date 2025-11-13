'use-client'

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CartContent } from "./temp/CartContent";


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
      <CartContent />
    </Suspense>
  );
}
