"use client";

import { useAuthStore } from "@/store/auth";
import Dashboard from "@/components/dashboard/Dashboard";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
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
      <Dashboard />
    </AppLayout>
  );
}
