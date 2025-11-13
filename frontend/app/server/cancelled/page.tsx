"use client";

import { Suspense } from "react";
import { ServerCancelledContent } from "./ServerCancelledContent";

export default function ServerCancelledPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServerCancelledContent />
    </Suspense>
  );
}
