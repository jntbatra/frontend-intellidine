"use client";

import { Suspense } from "react";
import { CartContent } from "./CartContent";

export default function CartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartContent />
    </Suspense>
  );
}
