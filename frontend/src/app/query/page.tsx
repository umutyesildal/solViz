"use client";

import { useAuthStore } from "@/store/auth";
import ConversationalQuery from "@/components/query/ConversationalQuery";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function QueryPage() {
  const { checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [checkAuth, router]);

  return (
    <AppLayout>
      <ConversationalQuery />
    </AppLayout>
  );
}
