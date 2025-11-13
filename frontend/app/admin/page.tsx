"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to staff page
    router.push("/admin/staff");
  }, [router]);

  return null;
}
