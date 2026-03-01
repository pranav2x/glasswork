"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/projects");
  }, [router]);
  return null;
}
