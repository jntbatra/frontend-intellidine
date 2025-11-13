"use client";

import { Suspense } from "react";
import { OtpContent } from "./OtpContent";

export default function OtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpContent />
    </Suspense>
  );
}
