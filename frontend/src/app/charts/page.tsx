"use client";

import { useAuthStore } from "@/store/auth";
import ChartGrid from "@/components/charts/ChartGrid";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChartsPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [checkAuth, router]);

  return (
    <AppLayout>
      <ChartGrid
        title="My Charts"
        emptyMessage="You haven't created any charts yet"
      />
    </AppLayout>
  );
}
