"use client";

import { useAuthStore } from "@/store/auth";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
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
      <ProfileSettings />
    </AppLayout>
  );
}
