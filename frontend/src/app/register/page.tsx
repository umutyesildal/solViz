"use client";

import { useAuthStore } from "@/store/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
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
        <RegisterForm />
      </div>
    </AppLayout>
  );
}
