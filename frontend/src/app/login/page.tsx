"use client";

import { useAuthStore } from "@/store/auth";
import LoginForm from "@/components/auth/LoginForm";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = checkAuth();
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [checkAuth, router]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <LoginForm />
      </div>
    </AppLayout>
  );
}
