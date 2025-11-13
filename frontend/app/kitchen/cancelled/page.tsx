"use client";

import { Suspense } from "react";
import { KitchenCancelledContent } from "./KitchenCancelledContent";

export default function KitchenCancelledPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KitchenCancelledContent />
    </Suspense>
  );
}
