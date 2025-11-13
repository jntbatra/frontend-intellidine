"use client";

import { Suspense } from "react";
import { StaffLoginContent } from "./StaffLoginContent";

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StaffLoginContent />
    </Suspense>
  );
}
