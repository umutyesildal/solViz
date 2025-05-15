"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import DebugPanel from "@/components/debug/DebugPanel";

export default function DebugPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [checkAuth, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Debug Console</h1>
        <DebugPanel />
      </div>
    </AppLayout>
  );
}
