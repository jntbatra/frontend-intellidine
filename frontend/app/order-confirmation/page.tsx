"use client";

import { Suspense } from "react";
import { OrderConfirmationContent } from "./OrderConfirmationContent";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
